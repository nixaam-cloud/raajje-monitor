import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import https from 'https';
import axios from 'axios';

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
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours daily automatic refresh window

const MALDIVES_EXACT_GROUPS = [
  'hilaytv | dhivehi',
  'maldives (iptv) sun play',
  'hilaytv | dhivehi radio',
];

const MALDIVES_KEYWORDS = [
  'maldives', 'maldivian', 'dhivehi', 'divehi', 'raajje', 'psm', 'tvm', 'vtv', 'sstv',
  'ntv', 'mmtv', 'munnaaru', 'channel 13', 'ch13', 'dhitv', 'sun tv', 'mv ', 'sangu',
];

// In-memory cache for ultra-fast serving and serverless environments
let memoryCache: {
  channels: TVChannelEntry[];
  groups: TVGroupInfo[];
  lastUpdated: number;
  source: string;
} | null = null;

function isMaldivianChannel(name: string, group: string): boolean {
  const normGroup = group.toLowerCase().trim();
  if (MALDIVES_EXACT_GROUPS.some((g) => normGroup === g || normGroup.includes(g))) {
    return true;
  }
  const combined = `${name} ${group}`.toLowerCase();
  return MALDIVES_KEYWORDS.some((kw) => combined.includes(kw));
}

function isValidM3U(content: string): boolean {
  if (!content || typeof content !== 'string') return false;
  if (/^<!DOCTYPE html/i.test(content.trim()) || /<html/i.test(content)) {
    return false;
  }
  if (content.includes('The URL you requested has been blocked')) {
    return false;
  }
  const extInfCount = (content.match(/#EXTINF/g) || []).length;
  return (content.includes('#EXTM3U') || extInfCount > 0) && extInfCount >= 10;
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
      if (a.name.toLowerCase() === 'hilaytv | dhivehi') return -1;
      if (b.name.toLowerCase() === 'hilaytv | dhivehi') return 1;
      if (a.isMaldivian && !b.isMaldivian) return -1;
      if (!a.isMaldivian && b.isMaldivian) return 1;
      return b.count - a.count;
    });

  return { channels, groups };
}

/**
 * Core playlist sync function:
 * Checks cache freshness (daily 24h window). If stale or forced, downloads latest playlist,
 * verifies contents, updates disk cache and in-memory cache.
 */
export async function getOrSyncPlaylist(force: boolean = false) {
  const now = Date.now();
  const localFilePath = path.join(process.cwd(), 'public', 'data', 'play.m3u');

  // 1. Fast path: In-memory cache valid and not forced
  if (!force && memoryCache && (now - memoryCache.lastUpdated < CACHE_TTL_MS)) {
    return {
      source: memoryCache.source,
      lastUpdated: new Date(memoryCache.lastUpdated).toISOString(),
      channels: memoryCache.channels,
      groups: memoryCache.groups,
      isFresh: true,
    };
  }

  // 2. Check local file age
  let fileMtime = 0;
  let fileExists = false;
  try {
    if (fs.existsSync(localFilePath)) {
      const stats = fs.statSync(localFilePath);
      fileMtime = stats.mtimeMs;
      fileExists = true;
    }
  } catch {
    // ignore
  }

  const isFileFresh = fileExists && (now - fileMtime < CACHE_TTL_MS);

  // 3. If not forced and local file is fresh (< 24h old), load from disk
  if (!force && isFileFresh) {
    try {
      const rawText = await fs.promises.readFile(localFilePath, 'utf-8');
      if (isValidM3U(rawText)) {
        const parsed = parseM3U(rawText);
        memoryCache = {
          channels: parsed.channels,
          groups: parsed.groups,
          lastUpdated: fileMtime,
          source: 'local:play.m3u (cached daily)',
        };
        return {
          source: memoryCache.source,
          lastUpdated: new Date(fileMtime).toISOString(),
          channels: parsed.channels,
          groups: parsed.groups,
          isFresh: true,
        };
      }
    } catch {
      // fallback to remote sync
    }
  }

  // 4. Stale cache or force requested: Fetch fresh playlist from remote source
  let remoteContent: string | null = null;
  const agent = new https.Agent({ rejectUnauthorized: false });

  try {
    const res = await axios.get(PLAYLIST_URL, {
      httpsAgent: agent,
      timeout: 20000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: '*/*',
        'Cache-Control': 'no-cache',
      },
      responseType: 'text',
    });

    const data = String(res.data);
    if (isValidM3U(data)) {
      remoteContent = data;
    }
  } catch (err) {
    console.warn('[TV-Sync] Remote playlist fetch notice:', err instanceof Error ? err.message : String(err));
  }

  // 5. If fresh remote content was fetched, update disk and memory cache
  if (remoteContent) {
    try {
      // Try persisting to public/data/play.m3u if filesystem allows
      await fs.promises.writeFile(localFilePath, remoteContent, 'utf-8');
    } catch {
      // Disk write may fail in read-only serverless; memory cache will still work
    }

    const parsed = parseM3U(remoteContent);
    memoryCache = {
      channels: parsed.channels,
      groups: parsed.groups,
      lastUpdated: now,
      source: `remote:${PLAYLIST_URL} (auto-synced)`,
    };

    return {
      source: memoryCache.source,
      lastUpdated: new Date(now).toISOString(),
      channels: parsed.channels,
      groups: parsed.groups,
      isFresh: true,
    };
  }

  // 6. If remote fetch failed (e.g. ISP blocked or offline), graceful fallback to existing local file
  if (fileExists) {
    try {
      const rawText = await fs.promises.readFile(localFilePath, 'utf-8');
      const parsed = parseM3U(rawText);
      memoryCache = {
        channels: parsed.channels,
        groups: parsed.groups,
        lastUpdated: fileMtime || now,
        source: 'local:play.m3u (offline fallback)',
      };
      return {
        source: memoryCache.source,
        lastUpdated: new Date(fileMtime || now).toISOString(),
        channels: parsed.channels,
        groups: parsed.groups,
        isFresh: false,
      };
    } catch {
      // fall through
    }
  }

  // 7. If memory cache already had data, retain it
  if (memoryCache) {
    return {
      source: memoryCache.source,
      lastUpdated: new Date(memoryCache.lastUpdated).toISOString(),
      channels: memoryCache.channels,
      groups: memoryCache.groups,
      isFresh: false,
    };
  }

  return {
    source: PLAYLIST_URL,
    lastUpdated: new Date().toISOString(),
    channels: [],
    groups: [],
    isFresh: false,
    error: 'Failed to synchronize playlist from remote or local fallback',
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const force = searchParams.get('refresh') === '1' || searchParams.get('force') === '1';

  try {
    const result = await getOrSyncPlaylist(force);
    return NextResponse.json({
      source: result.source,
      lastUpdated: result.lastUpdated,
      totalChannels: result.channels.length,
      groups: result.groups,
      channels: result.channels,
      isFresh: result.isFresh,
      error: (result as { error?: string }).error || null,
    });
  } catch (err) {
    return NextResponse.json({
      source: PLAYLIST_URL,
      lastUpdated: new Date().toISOString(),
      channels: [],
      groups: [],
      error: err instanceof Error ? err.message : 'Unknown sync error',
    });
  }
}
