#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import https from 'https';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outputFile = path.join(rootDir, 'public', 'data', 'play.m3u');

const candidateUrls = [
  process.env.TV_PLAYLIST_URL,
  'https://hilaytv.xyz/play.m3u',
].filter(Boolean);

const agent = new https.Agent({
  rejectUnauthorized: false,
});

async function fetchPlaylist(url) {
  console.log(`[tv-sync] Fetching M3U playlist from: ${url}`);
  const response = await axios.get(url, {
    httpsAgent: agent,
    timeout: 30000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: '*/*',
      'Cache-Control': 'no-cache',
    },
    responseType: 'text',
  });

  return String(response.data);
}

function isValidM3U(content) {
  if (!content || typeof content !== 'string') return false;
  if (/^<!DOCTYPE html/i.test(content.trim()) || /<html/i.test(content)) {
    return false;
  }
  if (content.includes('The URL you requested has been blocked')) {
    return false;
  }
  const hasExtM3u = content.includes('#EXTM3U');
  const extInfCount = (content.match(/#EXTINF/g) || []).length;
  return (hasExtM3u || extInfCount > 0) && extInfCount >= 10;
}

async function run() {
  console.log(`[tv-sync] Starting daily M3U TV playlist sync at ${new Date().toISOString()}`);

  let updatedContent = null;
  let sourceUrl = '';

  for (const url of candidateUrls) {
    try {
      const data = await fetchPlaylist(url);
      if (isValidM3U(data)) {
        updatedContent = data;
        sourceUrl = url;
        break;
      } else {
        console.warn(`[tv-sync] Content from ${url} was not valid M3U (HTML/Blocked/Too short).`);
      }
    } catch (err) {
      console.warn(`[tv-sync] Failed to fetch from ${url}:`, err.message);
    }
  }

  if (!updatedContent) {
    console.error('[tv-sync] Could not retrieve fresh M3U playlist from remote sources.');
    if (fs.existsSync(outputFile)) {
      console.log('[tv-sync] Preserving existing cached play.m3u file on disk.');
      process.exit(0);
    }
    process.exit(1);
  }

  // Ensure output directory exists
  const targetDir = path.dirname(outputFile);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Count channels
  const channels = (updatedContent.match(/#EXTINF/g) || []).length;
  const dhivehiChannels = (
    updatedContent.match(/(?:HilayTV\s*\|\s*Dhivehi|Sun Play|PSM|Raajje|SSTV|VTV|TVM)/gi) || []
  ).length;

  fs.writeFileSync(outputFile, updatedContent, 'utf-8');

  const stats = fs.statSync(outputFile);
  console.log(`[tv-sync] Successfully updated play.m3u!`);
  console.log(`  Source: ${sourceUrl}`);
  console.log(`  File: ${outputFile}`);
  console.log(`  Size: ${(stats.size / 1024).toFixed(1)} KB`);
  console.log(`  Total Channels: ${channels}`);
  console.log(`  Dhivehi / Maldivian Indicators: ${dhivehiChannels}`);
}

run();
