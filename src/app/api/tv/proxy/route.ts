import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36';

function isBlockedHost(host: string) {
  return (
    host === 'localhost' ||
    /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.)/.test(host) ||
    host === '[::1]'
  );
}

function proxify(target: string) {
  return `/api/tv/proxy?url=${encodeURIComponent(target)}`;
}

function rewritePlaylist(body: string, base: string) {
  const resolve = (u: string) => new URL(u, base).toString();
  return body
    .split(/\r?\n/)
    .map((line) => {
      const t = line.trim();
      if (!t) return line;
      if (t.startsWith('#')) {
        return line.replace(/URI="([^"]+)"/g, (_m, u) => `URI="${proxify(resolve(u))}"`);
      }
      return proxify(resolve(t));
    })
    .join('\n');
}

/** Same-origin pass-through for HLS playlists/segments (avoids CORS & mixed-content blocks). */
export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get('url');
  if (!target) return NextResponse.json({ error: 'Missing url' }, { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
  }
  if (!/^https?:$/.test(parsed.protocol) || isBlockedHost(parsed.hostname)) {
    return NextResponse.json({ error: 'URL not allowed' }, { status: 400 });
  }

  try {
    const upstream = await fetch(parsed.toString(), {
      cache: 'no-store',
      signal: AbortSignal.timeout(20000),
      headers: { 'User-Agent': UA },
    });
    if (!upstream.ok) {
      return NextResponse.json({ error: `Upstream ${upstream.status}` }, { status: 502 });
    }

    const type = upstream.headers.get('content-type') || '';
    const looksLikePlaylist =
      /mpegurl/i.test(type) || /\.m3u8?(\?|$)/i.test(parsed.pathname + parsed.search);

    if (looksLikePlaylist) {
      const text = await upstream.text();
      if (text.trimStart().startsWith('#EXTM3U')) {
        return new NextResponse(rewritePlaylist(text, upstream.url || parsed.toString()), {
          headers: { 'Content-Type': 'application/vnd.apple.mpegurl', 'Cache-Control': 'no-store' },
        });
      }
      return new NextResponse(text, { headers: { 'Content-Type': type || 'text/plain' } });
    }

    return new NextResponse(upstream.body, {
      headers: {
        'Content-Type': type || 'application/octet-stream',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Proxy failed' },
      { status: 502 },
    );
  }
}
