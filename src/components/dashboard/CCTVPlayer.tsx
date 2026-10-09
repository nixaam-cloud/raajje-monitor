'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CCTVFeed } from '@/data/cctvFeeds';
import CCTVCanvasFeed from './CCTVCanvasFeed';
import { Video, ShieldAlert, Sparkles, RefreshCw, Eye } from 'lucide-react';

interface CCTVPlayerProps {
  feed: CCTVFeed;
  nightVision?: boolean;
  digitalZoom?: number;
  showHUD?: boolean;
  className?: string;
  compact?: boolean;
}

export default function CCTVPlayer({
  feed,
  nightVision = false,
  digitalZoom = 1,
  showHUD = true,
  className = '',
  compact = false,
}: CCTVPlayerProps) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [feedMode, setFeedMode] = useState<'auto' | 'tactical' | 'stream'>('auto');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset state upon camera change
  useEffect(() => {
    setVideoLoaded(false);
    setVideoError(false);
    setFeedMode('auto');
  }, [feed.id]);

  // Video load timeout guard: If video doesn't play within 3 seconds, fail over to tactical canvas
  useEffect(() => {
    if (feedMode === 'tactical') return;

    const timeout = setTimeout(() => {
      const vid = videoRef.current;
      if (!vid || vid.readyState < 2) {
        // Did not load or stalled -> fallback to tactical sensor
        setVideoError(true);
      }
    }, 3500);

    return () => clearTimeout(timeout);
  }, [feed.id, feedMode]);

  const shouldUseTactical =
    feedMode === 'tactical' ||
    videoError ||
    !feed.streamUrl ||
    feed.streamType === 'demo';

  return (
    <div className={`relative w-full aspect-video bg-slate-950 overflow-hidden ${className}`}>
      {/* 1. Underlying Feed: Tactical Canvas OR HTML5 Video */}
      {shouldUseTactical ? (
        <CCTVCanvasFeed
          feed={feed}
          nightVision={nightVision}
          digitalZoom={digitalZoom}
          showBoundingBoxes={!compact}
          className="w-full h-full"
        />
      ) : (
        <video
          ref={videoRef}
          src={feed.streamUrl}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => setVideoError(true)}
          className={`w-full h-full object-cover transition-transform duration-200 ${
            nightVision
              ? 'brightness-125 contrast-150 hue-rotate-[90deg] saturate-200'
              : ''
          }`}
          style={{
            transform: `scale(${digitalZoom})`,
          }}
        />
      )}

      {/* 2. Optical Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.65)_100%)]" />

      {/* 3. Stream Source Badge / Mode Switcher */}
      {showHUD && !compact && (
        <div className="absolute bottom-2.5 right-2.5 z-20 flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={() => setFeedMode(shouldUseTactical ? 'stream' : 'tactical')}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/80 hover:bg-black border border-cyan-800/80 hover:border-cyan-500/80 backdrop-blur-sm text-[9px] font-mono text-cyan-300 transition-colors shadow"
            title="Toggle between AI Tactical Sensor and Direct Stream"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{shouldUseTactical ? 'TACTICAL SENSOR' : 'STREAM'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
