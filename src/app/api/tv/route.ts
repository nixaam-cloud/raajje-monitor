import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export interface TVChannelEntry {
  id: string;
  name: string;
  group: string;
  logo?: string;
  url: string;
  isMaldivian: boolean;
  tvgId?: string;
}

export interface TVGroupInfo {
  name: string;
  count: number;
  isMaldivian: boolean;
}

const PLAYLIST_URL = process.env.TV_PLAYLIST_URL || 'https://hilaytv.xyz/play.m3u';

const MALDIVES_EXACT_GROUPS = [
  'hilaytv | dhivehi',
  'maldives (iptv) sun play',
  'hilaytv | dhivehi radio',
];

const MALDIVES_KEYWORDS = [
  'maldives', 'maldivian', 'dhivehi', 'divehi', 'raajje', 'psm', 'tvm', 'vtv', 'sstv',
  'ntv', 'mmtv', 'munnaaru', 'channel 13', 'ch13', 'dhitv', 'sun tv', 'mv ', 'sangu',
];

function isMaldivianChannel(name: string, group: string): boolean {
  const normGroup = group.toLowerCase().trim();
  if (MALDIVES_EXACT_GROUPS.some((g) => normGroup === g || normGroup.includes(g))) {
    return true;
  }
  const combined = `${name} ${group}`.toLowerCase();
  return MALDIVES_KEYWORDS.some((kw) => combined.includes(kw));
}

function parseM3U(text: string): { channels: TVChannelEntry[]; groups: TVGroupInfo[] } {
  const lines = text.split(/\r?\n/);
  const channels: TVChannelEntry[] = [];
  const groupCounts = new Map<string, { count: number; isMaldivian: boolean }>();

  let pending: { name: string; group: string; logo?: string; tvgId?: string } | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF')) {
      const nameMatch = line.match(/,(.+)$/);
      const name = (nameMatch ? nameMatch[1].trim() : '') || 'Unknown Channel';
      const groupMatch = line.match(/group-title="([^"]*)"/i);
      const group = (groupMatch ? groupMatch[1].trim() : '') || 'General';
      const logoMatch = line.match(/tvg-logo="([^"]*)"/i);
      const logo = logoMatch ? logoMatch[1].trim() : undefined;
      const idMatch = line.match(/tvg-id="([^"]*)"/i);
      const tvgId = idMatch ? idMatch[1].trim() : undefined;

      pending = { name, group, logo, tvgId };
    } else if (line.startsWith('#')) {
      continue;
    } else if (pending && /^https?:\/\//i.test(line)) {
      // Clean URL if there are pipe arguments like |User-Agent=...
      const rawUrl = line;
      const cleanUrl = rawUrl.split('|')[0].trim();
      const isMaldivian = isMaldivianChannel(pending.name, pending.group);

      channels.push({
        id: `ch-${channels.length}-${pending.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        name: pending.name,
        group: pending.group,
        logo: pending.logo,
        url: cleanUrl,
        isMaldivian,
        tvgId: pending.tvgId,
      });

      const current = groupCounts.get(pending.group) || {
        count: 0,
        isMaldivian: MALDIVES_EXACT_GROUPS.some((g) => pending!.group.toLowerCase().includes(g)),
      };
      current.count += 1;
      if (isMaldivian) current.isMaldivian = true;
      groupCounts.set(pending.group, current);

      pending = null;
    }
  }

  // Sort groups: Dhivehi / Maldivian groups first, then by count descending
  const groups: TVGroupInfo[] = Array.from(groupCounts.entries())
    .map(([name, data]) => ({
      name,
      count: data.count,
      isMaldivian: data.isMaldivian,
    }))
    .sort((a, b) => {
      // Prioritize HilayTV | Dhivehi explicitly at the top
      if (a.name.toLowerCase() === 'hilaytv | dhivehi') return -1;
      if (b.name.toLowerCase() === 'hilaytv | dhivehi') return 1;

      // Other Maldivian groups next
      if (a.isMaldivian && !b.isMaldivian) return -1;
      if (!a.isMaldivian && b.isMaldivian) return 1;

      // Then by popularity (channel count)
      return b.count - a.count;
    });

  return { channels, groups };
}

export async function GET() {
  let rawText = '';
  let source = 'remote';

  // 1. Check local cached file first (handles ISP network blocks seamlessly)
  const localCandidates = [
    path.join(process.cwd(), 'public', 'data', 'play.m3u'),
    path.join(process.cwd(), 'src', 'data', 'play.m3u'),
  ];

  for (const candidate of localCandidates) {
    try {
      if (fs.existsSync(/*turbopackIgnore: true*/ candidate)) {
        rawText = await fs.promises.readFile(/*turbopackIgnore: true*/ candidate, 'utf-8');
        source = `local:${path.basename(candidate)}`;
        break;
      }
    } catch {
      // proceed to next
    }
  }

  // 2. If no local file, fetch from remote PLAYLIST_URL
  if (!rawText) {
    try {
      const res = await fetch(PLAYLIST_URL, {
        cache: 'no-store',
        signal: AbortSignal.timeout(15000),
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: '*/*',
        },
      });

      if (res.ok) {
        const text = await res.text();
        if (text.includes('#EXTINF') || text.includes('#EXTM3U')) {
          rawText = text;
          source = PLAYLIST_URL;
        }
      }
    } catch {
      // remote failed
    }
  }

  if (rawText) {
    try {
      const { channels, groups } = parseM3U(rawText);
      return NextResponse.json({
        source,
        totalChannels: channels.length,
        groups,
        channels,
        error: null,
      });
    } catch (parseErr) {
      return NextResponse.json({
        source,
        channels: [],
        groups: [],
        error: parseErr instanceof Error ? parseErr.message : 'Error parsing playlist',
      });
    }
  }

  return NextResponse.json({
    source: PLAYLIST_URL,
    channels: [],
    groups: [],
    error: 'Failed to load playlist from local cache or remote provider',
  });
}
