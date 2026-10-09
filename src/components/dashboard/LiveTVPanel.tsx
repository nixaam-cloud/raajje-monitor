'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Hls from 'hls.js';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import {
  AlertTriangle,
  Search,
  Tv,
  RefreshCw,
  ExternalLink,
  Volume2,
  VolumeX,
  Layers,
  Radio,
  Sparkles,
} from 'lucide-react';
import HorizontalScrollContainer from './HorizontalScrollContainer';

interface TVChannel {
  id: string;
  name: string;
  group: string;
  logo?: string;
  url: string;
  isMaldivian: boolean;
  tvgId?: string;
}

interface TVGroupInfo {
  name: string;
  count: number;
  isMaldivian: boolean;
}

// Fallback if playlist fails completely
const FALLBACK_CHANNELS: TVChannel[] = [
  { id: 'fb-psm', name: 'PSM NEWS (PSM)', group: 'HilayTV | Dhivehi', isMaldivian: true, url: 'https://lana.psm.mv/live/nws.m3u8' },
  { id: 'fb-tvm', name: 'TV Maldives (PSM)', group: 'HilayTV | Dhivehi', isMaldivian: true, url: 'https://lana.psm.mv/live/tvm.m3u8' },
  { id: 'fb-yes', name: 'YES TV (PSM)', group: 'HilayTV | Dhivehi', isMaldivian: true, url: 'https://lana.psm.mv/live/yes.m3u8' },
  { id: 'fb-vtv', name: 'V TV (Sun Play)', group: 'HilayTV | Dhivehi', isMaldivian: true, url: 'https://sunplay-cdn.bitratelabs.com/live/local-channel/vtv-7a0f24809c234ea78d972b1f336ac1b9/index.m3u8' },
  { id: 'fb-raajje', name: 'Raajje TV', group: 'HilayTV | Dhivehi', isMaldivian: true, url: 'https://raajjetv.yarr-myn.workers.dev/RaajjeTv.m3u8' },
  { id: 'fb-ntv', name: 'N TV (Sun Play)', group: 'HilayTV | Dhivehi', isMaldivian: true, url: 'https://sunplay-cdn.bitratelabs.com/live/local-channel/ntv-e3d4300b49c8c901e9339174215d7580/index.m3u8' },
  { id: 'fb-ch13', name: 'Channel 13 (Sun Play)', group: 'HilayTV | Dhivehi', isMaldivian: true, url: 'https://sunplay-cdn.bitratelabs.com/live/local-channel-fhd/ch13-28754fda0a7f338e8fccfe7206ab9be8_1080p/index.m3u8' },
  { id: 'fb-sstv', name: 'SSTV (Sun Play)', group: 'HilayTV | Dhivehi', isMaldivian: true, url: 'https://sunplay-cdn.bitratelabs.com/live/sstv-live/index.m3u8' },
  { id: 'fb-quran', name: 'Quruan Tharujama (Sun Play)', group: 'HilayTV | Dhivehi', isMaldivian: true, url: 'https://sunplay-cdn.bitratelabs.com/live/sunplay/sunplay-qdt-41c2b06e8ed4d89b3b3e30ebcaa2f9f6/index.m3u8' },
];

const proxied = (url: string) => `/api/tv/proxy?url=${encodeURIComponent(url)}`;

export default function LiveTVPanel() {
  const { playClick, playTargetLock } = useSoundEffects();
  const [channels, setChannels] = useState<TVChannel[]>([]);
  const [groups, setGroups] = useState<TVGroupInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Group selection: 'ALL', 'MALDIVES_ALL', or exact group name (e.g. 'HilayTV | Dhivehi')
  const [selectedGroup, setSelectedGroup] = useState<string>('HilayTV | Dhivehi');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

  // Playback state
  const [playError, setPlayError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [useProxy, setUseProxy] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Fetch channels & groups from API (supports force-refresh)
  const loadChannels = (force = false) => {
    if (force) setIsRefreshing(true);
    else setLoading(true);

    fetch(`/api/tv${force ? '?refresh=1' : ''}`)
      .then((r) => r.json())
      .then((data) => {
        const list: TVChannel[] = data.channels && data.channels.length > 0 ? data.channels : FALLBACK_CHANNELS;
        const grpList: TVGroupInfo[] = data.groups && data.groups.length > 0 ? data.groups : [
          { name: 'HilayTV | Dhivehi', count: list.filter((c) => c.isMaldivian).length, isMaldivian: true },
        ];

        setChannels(list);
        setGroups(grpList);
        if (data.lastUpdated) {
          setLastUpdated(data.lastUpdated);
        }

        const hasDhivehi = grpList.some((g) => g.name.toLowerCase() === 'hilaytv | dhivehi');
        const defaultGrp = hasDhivehi ? 'HilayTV | Dhivehi' : 'MALDIVES_ALL';
        setSelectedGroup((prev) => (prev ? prev : defaultGrp));

        setActiveChannelId((prev) => {
          if (prev && list.some((c) => c.id === prev)) return prev;
          const first = list.find((c) => (hasDhivehi ? c.group === 'HilayTV | Dhivehi' : c.isMaldivian)) || list[0];
          return first ? first.id : null;
        });
      })
      .catch((err) => {
        setLoadError(String(err));
        setChannels(FALLBACK_CHANNELS);
        setSelectedGroup('HilayTV | Dhivehi');
        setActiveChannelId(FALLBACK_CHANNELS[0].id);
      })
      .finally(() => {
        setLoading(false);
        setIsRefreshing(false);
      });
  };

  useEffect(() => {
    loadChannels(false);
  }, []);

  const activeChannel = useMemo(() => {
    return channels.find((c) => c.id === activeChannelId) || channels[0] || null;
  }, [channels, activeChannelId]);

  // Reset proxy state upon channel change
  useEffect(() => {
    setUseProxy(false);
    setPlayError(false);
  }, [activeChannelId]);

  // 2. Playback logic with HLS and auto-proxy recovery
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeChannel) return;

    setPlayError(false);
    setIsPlaying(false);

    const sourceUrl = useProxy ? proxied(activeChannel.url) : activeChannel.url;
    let hls: Hls | null = null;

    const handleStreamFailure = () => {
      // Auto-fallback: If direct failed, try proxy automatically
      if (!useProxy) {
        setUseProxy(true);
      } else {
        setPlayError(true);
      }
    };

    if (Hls.isSupported()) {
      hls = new Hls({
        lowLatencyMode: true,
        enableWorker: true,
      });

      hls.loadSource(sourceUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().then(() => setIsPlaying(true)).catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls?.startLoad();
              handleStreamFailure();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls?.recoverMediaError();
              break;
            default:
              handleStreamFailure();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      video.addEventListener('error', handleStreamFailure, { once: true });
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      setPlayError(true);
    }

    return () => {
      hls?.destroy();
      video.removeAttribute('src');
      video.load();
    };
  }, [activeChannel, useProxy]);

  // 3. Filter channels by Group and Search
  const filteredChannels = useMemo(() => {
    let result = channels;

    // Filter by group
    if (selectedGroup === 'MALDIVES_ALL') {
      result = result.filter((c) => c.isMaldivian);
    } else if (selectedGroup !== 'ALL') {
      result = result.filter((c) => c.group.toLowerCase() === selectedGroup.toLowerCase());
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.group.toLowerCase().includes(q) ||
          (c.tvgId && c.tvgId.toLowerCase().includes(q))
      );
    }

    return result;
  }, [channels, selectedGroup, searchQuery]);

  const maldivianTotal = useMemo(() => channels.filter((c) => c.isMaldivian).length, [channels]);

  // Quick primary group pills
  const topGroups = useMemo(() => {
    return groups.slice(0, 8);
  }, [groups]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleSelectChannel = (channel: TVChannel) => {
    playTargetLock();
    setActiveChannelId(channel.id);
  };

  return (
    <div className="space-y-3 font-mono text-slate-200">
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
          </span>
          <div>
            <h3 className="font-bold text-xs tracking-wider text-slate-100 flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-cyan-400" />
              LIVE TV // MALDIVES & GLOBAL
            </h3>
            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400/90 font-semibold">DAILY AUTO-SYNC</span>
              {lastUpdated && (
                <span className="text-slate-500">
                  • {new Date(lastUpdated).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              playClick();
              loadChannels(true);
            }}
            disabled={isRefreshing || loading}
            title="Force re-sync latest M3U playlist from source"
            className="flex items-center gap-1 text-[10px] text-cyan-300 hover:text-cyan-100 bg-cyan-950/50 hover:bg-cyan-900/60 px-2 py-0.5 rounded border border-cyan-800/50 transition-colors disabled:opacity-50 font-mono shadow-sm"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>SYNC</span>
          </button>
          <span className="text-[10px] text-cyan-400/90 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40 font-mono">
            {channels.length} CH
          </span>
        </div>
      </div>

      {/* 2. Video Screen Player */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner group">
        <video
          ref={videoRef}
          controls
          muted={isMuted}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-contain bg-black"
        />

        {/* Video Overlay Info / Stream Status */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-slate-200 border border-slate-700/60 shadow">
            <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="truncate max-w-[140px] md:max-w-[180px]">{activeChannel?.name || 'FEED OFFLINE'}</span>
          </div>

          <div className="flex items-center gap-1">
            {useProxy && (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] px-1.5 py-0.2 rounded font-bold">
                PROXY
              </span>
            )}
            <span className="bg-slate-900/80 text-cyan-300 border border-cyan-500/30 text-[9px] px-1.5 py-0.2 rounded">
              LIVE
            </span>
          </div>
        </div>

        {/* Stream Error or Loading Overlay */}
        {(loading || playError || !activeChannel) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/90 text-center p-4 z-20 backdrop-blur-sm">
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
                <p className="text-xs text-cyan-300">PARSING PLAYLIST CHANNELS…</p>
              </div>
            ) : (
              <>
                <AlertTriangle className="w-6 h-6 text-amber-400 animate-bounce" />
                <p className="text-xs font-bold text-amber-300">STREAM CURRENTLY OFFLINE</p>
                <p className="text-[10px] text-slate-400 max-w-[240px]">
                  {activeChannel?.name} stream may be offline or geo-restricted.
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => setUseProxy(!useProxy)}
                    className="px-2.5 py-1 text-[10px] rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
                  >
                    {useProxy ? 'Try Direct Stream' : 'Try Proxy Stream'}
                  </button>
                  {activeChannel?.url && (
                    <a
                      href={activeChannel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="Open external stream link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 3. Active Channel Status Banner */}
      {activeChannel && (
        <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-2 min-w-0">
            {activeChannel.logo && !imgErrors[activeChannel.id] ? (
              <img
                src={activeChannel.logo}
                alt=""
                className="w-5 h-5 object-contain rounded bg-slate-950 p-0.5 border border-slate-800"
                onError={() => setImgErrors((prev) => ({ ...prev, [activeChannel.id]: true }))}
              />
            ) : (
              <Radio className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
            <span className="font-bold text-slate-100 truncate">{activeChannel.name}</span>
          </div>

          <span className="text-[10px] text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/50 shrink-0 ml-2">
            {activeChannel.group}
          </span>
        </div>
      )}

      {/* 4. Search Filter Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search channels (e.g. PSM, TVM, Raajje, Sports)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-xs font-mono bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-2 text-[10px] text-slate-400 hover:text-slate-200"
          >
            ✕
          </button>
        )}
      </div>

      {/* 5. Group Selector: Dropdown + Top Shortcut Tabs */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1 font-bold text-slate-300">
            <Layers className="w-3 h-3 text-cyan-400" />
            CATEGORY / GROUP:
          </span>
          <span className="text-[9px] text-slate-500">
            Showing {filteredChannels.length} channels
          </span>
        </div>

        {/* Dropdown for All Groups */}
        <select
          value={selectedGroup}
          onChange={(e) => {
            playClick();
            setSelectedGroup(e.target.value);
          }}
          className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-cyan-300 focus:outline-none focus:border-cyan-500/60 cursor-pointer"
        >
          <option value="HilayTV | Dhivehi">★ HilayTV | Dhivehi (Maldives Channels)</option>
          <option value="MALDIVES_ALL">★ ALL MALDIVIAN CHANNELS ({maldivianTotal})</option>
          <option value="ALL">ALL CHANNELS ({channels.length})</option>
          <optgroup label="── Playlist Groups ──">
            {groups.map((g) => (
              <option key={g.name} value={g.name}>
                {g.name} ({g.count})
              </option>
            ))}
          </optgroup>
        </select>

        {/* Fast Group Filter Pills with Hold & Scroll */}
        <HorizontalScrollContainer className="w-full pb-1">
          <button
            onClick={() => {
              playClick();
              setSelectedGroup('HilayTV | Dhivehi');
            }}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border whitespace-nowrap transition-all shrink-0 flex items-center gap-1 ${
              selectedGroup === 'HilayTV | Dhivehi'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            DHIVEHI ({groups.find((g) => g.name === 'HilayTV | Dhivehi')?.count || 22})
          </button>

          <button
            onClick={() => {
              playClick();
              setSelectedGroup('Maldives (IPTV) Sun Play');
            }}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border whitespace-nowrap transition-all shrink-0 ${
              selectedGroup === 'Maldives (IPTV) Sun Play'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            SUN PLAY ({groups.find((g) => g.name === 'Maldives (IPTV) Sun Play')?.count || 26})
          </button>

          <button
            onClick={() => {
              playClick();
              setSelectedGroup('MALDIVES_ALL');
            }}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border whitespace-nowrap transition-all shrink-0 ${
              selectedGroup === 'MALDIVES_ALL'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            ALL MV ({maldivianTotal})
          </button>

          <button
            onClick={() => {
              playClick();
              setSelectedGroup('ALL');
            }}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border whitespace-nowrap transition-all shrink-0 ${
              selectedGroup === 'ALL'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            ALL ({channels.length})
          </button>

          {/* Render other groups seamlessly so user can scroll through them */}
          {groups
            .filter((g) => g.name !== 'HilayTV | Dhivehi' && g.name !== 'Maldives (IPTV) Sun Play')
            .slice(0, 15)
            .map((g) => (
              <button
                key={g.name}
                onClick={() => {
                  playClick();
                  setSelectedGroup(g.name);
                }}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border whitespace-nowrap transition-all shrink-0 ${
                  selectedGroup === g.name
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {g.name.replace(/^HilayTV\s*\|\s*/i, '')} ({g.count})
              </button>
            ))}
        </HorizontalScrollContainer>
      </div>

      {/* 6. Channel Grid / Scrollable Cards */}
      <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-none">
        {filteredChannels.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs space-y-1">
            <p>No channels found for &quot;{searchQuery || selectedGroup}&quot;</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGroup('HilayTV | Dhivehi');
              }}
              className="text-[10px] text-cyan-400 hover:underline"
            >
              Reset to Dhivehi Channels
            </button>
          </div>
        ) : (
          filteredChannels.map((ch) => {
            const isSelected = ch.id === activeChannelId;

            return (
              <button
                key={ch.id}
                onClick={() => handleSelectChannel(ch)}
                className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all text-left group ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-200 shadow-md ring-1 ring-cyan-500/30'
                    : 'bg-slate-900/50 hover:bg-slate-850 border-slate-800/80 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Channel Logo or Default TV Icon */}
                  {ch.logo && !imgErrors[ch.id] ? (
                    <img
                      src={ch.logo}
                      alt=""
                      className="w-6 h-6 object-contain rounded bg-slate-950 p-0.5 border border-slate-800/80 shrink-0"
                      onError={() => setImgErrors((prev) => ({ ...prev, [ch.id]: true }))}
                    />
                  ) : (
                    <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${isSelected ? 'bg-cyan-500/30 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                      <Tv className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate leading-tight ${isSelected ? 'text-cyan-200 font-bold' : 'group-hover:text-slate-100'}`}>
                      {ch.name}
                    </p>
                    <p className="text-[9px] text-slate-500 truncate">{ch.group}</p>
                  </div>
                </div>

                {/* Right Status Badge */}
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {ch.isMaldivian && (
                    <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      MV
                    </span>
                  )}
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[9px] font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-700/50 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      PLAYING
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
