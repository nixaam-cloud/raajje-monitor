'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMonitorStore } from '@/store/useMonitorStore';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { MALDIVES_CCTV_FEEDS, CCTVFeed } from '@/data/cctvFeeds';
import {
  Video,
  X,
  Maximize2,
  Minimize2,
  Crosshair,
  Compass,
  ChevronLeft,
  ChevronRight,
  Eye,
  Camera,
  MapPin,
  ExternalLink,
  Shield,
  Layers,
  ZoomIn,
  ZoomOut,
  RefreshCw,
} from 'lucide-react';

export default function CCTVModal() {
  const {
    selectedCCTVId,
    setSelectedCCTVId,
    selectedEntity,
    setSelectedEntity,
    setFlyToTarget,
  } = useMonitorStore();

  const { playClick, playTargetLock } = useSoundEffects();
  const [nightVision, setNightVision] = useState(false);
  const [digitalZoom, setDigitalZoom] = useState(1);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [liveTimestamp, setLiveTimestamp] = useState('');
  const [activeCamIndex, setActiveCamIndex] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync active camera with selectedCCTVId or selectedEntity
  const activeCam: CCTVFeed | undefined = React.useMemo(() => {
    if (selectedCCTVId) {
      return MALDIVES_CCTV_FEEDS.find((c) => c.id === selectedCCTVId);
    }
    if (selectedEntity?.type === 'cctv') {
      return MALDIVES_CCTV_FEEDS.find((c) => c.id === selectedEntity.id);
    }
    return undefined;
  }, [selectedCCTVId, selectedEntity]);

  useEffect(() => {
    if (activeCam) {
      const idx = MALDIVES_CCTV_FEEDS.findIndex((c) => c.id === activeCam.id);
      if (idx !== -1) setActiveCamIndex(idx);
    }
  }, [activeCam]);

  // Real-time timecode clock
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const mvtHours = String((now.getUTCHours() + 5) % 24).padStart(2, '0');
      const mvtMins = String(now.getUTCMinutes()).padStart(2, '0');
      const mvtSecs = String(now.getUTCSeconds()).padStart(2, '0');
      const ms = String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0');
      setLiveTimestamp(`${mvtHours}:${mvtMins}:${mvtSecs}.${ms} MVT`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 50);
    return () => clearInterval(interval);
  }, []);

  if (!activeCam) return null;

  const handleClose = () => {
    playClick();
    setSelectedCCTVId(null);
    if (selectedEntity?.type === 'cctv') {
      setSelectedEntity(null);
    }
  };

  const handleCycleCamera = (direction: 'next' | 'prev') => {
    playClick();
    let newIndex = direction === 'next' ? activeCamIndex + 1 : activeCamIndex - 1;
    if (newIndex >= MALDIVES_CCTV_FEEDS.length) newIndex = 0;
    if (newIndex < 0) newIndex = MALDIVES_CCTV_FEEDS.length - 1;

    const nextCam = MALDIVES_CCTV_FEEDS[newIndex];
    setSelectedCCTVId(nextCam.id);
    setDigitalZoom(1);

    setSelectedEntity({
      type: 'cctv',
      id: nextCam.id,
      title: nextCam.name,
      subtitle: `${nextCam.locationName} // ${nextCam.code}`,
      badge: {
        text: `${nextCam.category} // ${nextCam.status}`,
        variant: 'emerald',
      },
      coordinates: nextCam.coordinates,
      telemetry: {
        'Camera ID': nextCam.code,
        Sector: nextCam.zone,
        Location: `${nextCam.locationName} (${nextCam.atoll} Atoll)`,
        Status: `${nextCam.status} (LIVE)`,
        Resolution: `${nextCam.resolution} @ ${nextCam.fps}fps`,
        Orientation: `${nextCam.heading}° (${nextCam.fov}° FOV)`,
        Sensor: nextCam.telemetry.sensorType,
        Enclosure: nextCam.telemetry.weatherResistance,
      },
      raw: nextCam,
    });
  };

  const handleFocusOnMap = () => {
    playTargetLock();
    if (activeCam.coordinates) {
      setFlyToTarget({
        coordinates: activeCam.coordinates,
      });
    }
  };

  return (
    <div
      className={`fixed z-50 pointer-events-auto transition-all duration-300 font-mono select-none ${
        isFullScreen
          ? 'inset-2 sm:inset-6 flex flex-col bg-slate-950/98 rounded-2xl border border-cyan-500/80 shadow-[0_0_60px_rgba(0,0,0,0.95)]'
          : isMinimized
          ? 'bottom-20 right-4 w-72 sm:w-80 bg-slate-950/95 rounded-xl border border-slate-700/80 shadow-2xl overflow-hidden'
          : 'bottom-16 sm:bottom-20 left-2 sm:left-4 w-[calc(100vw-16px)] sm:w-[460px] md:w-[500px] bg-slate-950/95 rounded-2xl border border-cyan-500/60 shadow-[0_12px_45px_rgba(0,0,0,0.9)] overflow-hidden'
      }`}
    >
      {/* 1. Header Bar */}
      <div className="p-2 sm:p-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative flex items-center justify-center w-6 h-6 rounded bg-rose-950/60 border border-rose-500/50 shadow-sm shrink-0">
            <Video className="w-3.5 h-3.5 text-rose-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-100 truncate">
                {activeCam.name}
              </span>
              <span className="text-[8px] px-1 py-0.2 rounded font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                LIVE
              </span>
            </div>
            <span className="text-[9px] text-slate-400 block truncate">
              {activeCam.code} // {activeCam.locationName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Focus radar */}
          <button
            onClick={handleFocusOnMap}
            className="p-1 text-cyan-400 hover:text-cyan-200 hover:bg-cyan-950/40 border border-cyan-800/40 rounded transition-colors"
            title="Focus camera position on radar"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => {
              playClick();
              setIsFullScreen(!isFullScreen);
              if (isMinimized) setIsMinimized(false);
            }}
            className="hidden sm:inline-flex p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            title={isFullScreen ? 'Exit Fullscreen' : 'Fullscreen Video'}
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Close */}
          <button
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition-colors"
            title="Close CCTV Feed"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Live Video Player Screen */}
      {!isMinimized && (
        <div className="relative w-full aspect-video bg-black overflow-hidden group">
          {/* Video Stream Element */}
          <video
            ref={videoRef}
            src={activeCam.streamUrl}
            autoPlay
            loop
            muted
            playsInline
            className={`w-full h-full object-cover transition-transform duration-200 ${
              nightVision
                ? 'brightness-125 contrast-150 hue-rotate-[90deg] saturate-200'
                : ''
            }`}
            style={{
              transform: `scale(${digitalZoom})`,
            }}
          />

          {/* Optical Vignette & Scanline Overlay */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.65)_100%)]" />

          {/* Night Vision Green Tint Matrix */}
          {nightVision && (
            <div className="absolute inset-0 pointer-events-none bg-emerald-950/20 mix-blend-color-dodge" />
          )}

          {/* Tactical Crosshair Reticle & Targeting Grid */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Center crosshair */}
            <div className="w-8 h-8 border border-white/20 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-cyan-400/80 rounded-full" />
            </div>
            {/* Corner Targeting Brackets */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400/60" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400/60" />
          </div>

          {/* HUD Top Left: REC & Camera Code */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-2 pointer-events-none">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-slate-700/60 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[10px] font-bold text-rose-300">REC</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-white/90 drop-shadow-md">
              {activeCam.code}
            </span>
          </div>

          {/* HUD Top Right: Timestamp & FPS */}
          <div className="absolute top-2.5 right-2.5 flex flex-col items-end pointer-events-none">
            <span className="text-[10px] font-mono-num font-bold text-cyan-300 drop-shadow-md">
              {liveTimestamp}
            </span>
            <span className="text-[9px] text-slate-300 drop-shadow-md">
              {activeCam.resolution} @ {activeCam.fps}FPS // {activeCam.telemetry.bitrateMbps} Mbps
            </span>
          </div>

          {/* HUD Bottom Left: Geographic Heading & Sector */}
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 pointer-events-none text-[9px] text-slate-300">
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 border border-slate-700/60">
              <Compass className="w-3 h-3 text-cyan-400" />
              <span>HDG: {activeCam.heading}° ({activeCam.fov}° FOV)</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 border border-slate-700/60">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>{activeCam.coordinates[1].toFixed(4)}°N, {activeCam.coordinates[0].toFixed(4)}°E</span>
            </div>
          </div>

          {/* HUD Bottom Right: Mode indicator */}
          <div className="absolute bottom-2.5 right-2.5 pointer-events-none">
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${
                nightVision
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60'
                  : 'bg-black/60 text-cyan-300 border-cyan-500/60'
              }`}
            >
              {nightVision ? 'SENSOR: IR / NIGHT VISION' : `SENSOR: ${activeCam.telemetry.sensorType}`}
            </span>
          </div>

          {/* Quick On-Video Floating Controls */}
          <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleCycleCamera('prev')}
              className="pointer-events-auto p-1.5 rounded-full bg-slate-950/80 border border-slate-700 text-slate-200 hover:text-cyan-400 hover:border-cyan-500 transition-all shadow-lg"
              title="Previous Camera"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleCycleCamera('next')}
              className="pointer-events-auto p-1.5 rounded-full bg-slate-950/80 border border-slate-700 text-slate-200 hover:text-cyan-400 hover:border-cyan-500 transition-all shadow-lg"
              title="Next Camera"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Tactical PTZ & Optical Toolbar */}
      {!isMinimized && (
        <div className="p-2 sm:p-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
          {/* Camera Selector Switcher */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleCycleCamera('prev')}
              className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 hover:border-slate-700 text-[10px] transition-colors flex items-center gap-0.5"
            >
              <ChevronLeft className="w-3 h-3" />
              <span>PREV</span>
            </button>
            <span className="text-[10px] text-slate-400 px-1 font-mono-num">
              {activeCamIndex + 1}/{MALDIVES_CCTV_FEEDS.length}
            </span>
            <button
              onClick={() => handleCycleCamera('next')}
              className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 hover:border-slate-700 text-[10px] transition-colors flex items-center gap-0.5"
            >
              <span>NEXT</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Sensor & Zoom Controls */}
          <div className="flex items-center gap-1.5">
            {/* Night Vision Toggle */}
            <button
              onClick={() => {
                playClick();
                setNightVision(!nightVision);
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors border ${
                nightVision
                  ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle IR Night Vision Sensor Simulation"
            >
              <Eye className="w-3 h-3 text-emerald-400" />
              <span>IR NIGHT</span>
            </button>

            {/* Digital Zoom Controls */}
            <div className="flex items-center rounded bg-slate-900 border border-slate-800">
              <button
                onClick={() => {
                  playClick();
                  setDigitalZoom((prev) => Math.max(1, Number((prev - 0.25).toFixed(2))));
                }}
                disabled={digitalZoom <= 1}
                className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30"
                title="Zoom Out"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <span className="px-1 text-[9px] text-cyan-300 font-mono-num">
                {digitalZoom.toFixed(1)}x
              </span>
              <button
                onClick={() => {
                  playClick();
                  setDigitalZoom((prev) => Math.min(2.5, Number((prev + 0.25).toFixed(2))));
                }}
                disabled={digitalZoom >= 2.5}
                className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30"
                title="Zoom In"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
