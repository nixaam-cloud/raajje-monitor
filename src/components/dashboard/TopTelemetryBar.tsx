'use client';

import React, { useEffect, useState } from 'react';
import { useMonitorStore } from '@/store/useMonitorStore';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import {
  Volume2,
  VolumeX,
  Tv,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Radio,
  Ship,
  Plane,
  AlertTriangle,
  Clock,
  Shield,
} from 'lucide-react';

interface TopTelemetryBarProps {
  vesselCount?: number;
  flightCount?: number;
  alertLevel?: string;
}

export default function TopTelemetryBar({
  vesselCount = 14,
  flightCount = 10,
  alertLevel = 'YELLOW',
}: TopTelemetryBarProps) {
  const [utcTime, setUtcTime] = useState('');
  const [mvtTime, setMvtTime] = useState('');

  const {
    soundEnabled,
    crtScanlines,
    leftPanelOpen,
    rightPanelOpen,
    toggleSound,
    toggleCrtScanlines,
    setLeftPanelOpen,
    setRightPanelOpen,
    defconLevel,
    unreadAlertCount,
    markAlertsRead,
  } = useMonitorStore();

  const { playClick } = useSoundEffects();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      // UTC Formatter
      const utcString = now.toISOString().slice(11, 19) + ' UTC';
      setUtcTime(utcString);

      // Maldives Time (MVT = UTC+5)
      const mvtHours = (now.getUTCHours() + 5) % 24;
      const mvtMins = String(now.getUTCMinutes()).padStart(2, '0');
      const mvtSecs = String(now.getUTCSeconds()).padStart(2, '0');
      const mvtFormatted = `${String(mvtHours).padStart(2, '0')}:${mvtMins}:${mvtSecs} MVT (UTC+5)`;
      setMvtTime(mvtFormatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative z-30 flex items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md text-xs select-none">
      {/* Left: Brand & Mobile Status */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Desktop Left Drawer Toggle */}
        <button
          onClick={() => {
            playClick();
            setLeftPanelOpen(!leftPanelOpen);
          }}
          className="hidden sm:inline-flex p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 rounded-md transition-colors"
          title={leftPanelOpen ? 'Collapse Intelligence Wire' : 'Open Intelligence Wire'}
        >
          {leftPanelOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </button>

        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative flex items-center justify-center w-6 h-6 min-w-[24px] rounded bg-cyan-950/80 border border-cyan-500/50 shadow-sm shrink-0">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="font-bold tracking-wider text-slate-100 font-mono text-xs sm:text-sm">
                RAAJJE MONITOR
              </span>
              <span className="hidden sm:inline-block text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono font-semibold">
                NATIONAL COP
              </span>
              <div
                className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse sm:hidden shrink-0"
                title="System Operational"
              />
            </div>

            {/* Desktop-only subtitle */}
            <div className="hidden sm:flex text-[9px] text-slate-400 font-mono tracking-tight items-center gap-1.5 whitespace-nowrap">
              <span>REPUBLIC OF MALDIVES</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">SYS STAT: NOMINAL</span>
            </div>
          </div>
        </div>

        {/* Desktop DEFCON Level Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 ml-2 px-2 py-1 rounded bg-slate-900 border border-slate-700/80 whitespace-nowrap">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono text-[10px] text-slate-400">DEFCON:</span>
          <span className="font-mono font-bold text-amber-400">STAGE {defconLevel}</span>
          <span className="text-[9px] text-slate-500">(PEACETIME)</span>
        </div>
      </div>

      {/* Center: Live Telemetry Tickers (Desktop only) */}
      <div className="hidden md:flex items-center gap-3 lg:gap-4 font-mono text-[11px] whitespace-nowrap">
        {/* Maritime Counts */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800">
          <Ship className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">EEZ VESSELS:</span>
          <span className="font-bold text-emerald-400">{vesselCount}</span>
        </div>

        {/* Airborne Counts */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800">
          <Plane className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">AIR RADAR:</span>
          <span className="font-bold text-cyan-400">{flightCount}</span>
        </div>

        {/* Real-time MMS Warning / Advisory */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors ${
            alertLevel === 'RED'
              ? 'bg-rose-950/60 border-rose-500/60 text-rose-300 animate-pulse'
              : alertLevel === 'ORANGE'
              ? 'bg-orange-950/60 border-orange-500/60 text-orange-300'
              : alertLevel === 'YELLOW'
              ? 'bg-amber-950/40 border-amber-600/40 text-amber-300'
              : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
          }`}
          title={`Maldives Meteorological Service (MMS) Real-time Status: ${alertLevel}`}
        >
          <AlertTriangle
            className={`w-3.5 h-3.5 ${
              alertLevel === 'RED' || alertLevel === 'YELLOW' || alertLevel === 'ORANGE'
                ? 'animate-pulse text-amber-400'
                : 'text-cyan-400'
            }`}
          />
          <span className="text-[10px] text-slate-400">MMS:</span>
          <span className="font-bold">{alertLevel}</span>
        </div>

        {/* Real-time Event Wire Status / Flash Alert */}
        {unreadAlertCount > 0 && (
          <button
            onClick={() => {
              playClick();
              setLeftPanelOpen(true);
              markAlertsRead();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/80 border border-rose-500/80 text-rose-300 font-bold animate-pulse hover:bg-rose-900/90 transition-all shadow-[0_0_15px_rgba(244,63,94,0.4)] cursor-pointer"
            title="Click to view new breaking intelligence in wire"
          >
            <Radio className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-[10px] tracking-wider uppercase">
              {unreadAlertCount} NEW EVENT{unreadAlertCount > 1 ? 'S' : ''}
            </span>
          </button>
        )}
      </div>

      {/* Right: Clock & Tactical Tools */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mobile Clock & Alert */}
        <div className="sm:hidden flex items-center gap-1.5 font-mono text-[10px]">
          {unreadAlertCount > 0 && (
            <button
              onClick={() => {
                playClick();
                setLeftPanelOpen(true);
                markAlertsRead();
              }}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-950 border border-rose-500/70 text-rose-300 font-bold animate-pulse"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>{unreadAlertCount} NEW</span>
            </button>
          )}
          <div className="flex items-center gap-1 text-cyan-300 font-bold">
            <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
            <span>{mvtTime ? mvtTime.slice(0, 5) : '00:00'} MVT</span>
          </div>
        </div>

        {/* Desktop Dual Clocks */}
        <div className="hidden sm:flex flex-col items-end font-mono text-[10px] text-slate-300 whitespace-nowrap">
          <div className="flex items-center gap-1 font-bold text-cyan-300 font-mono-num">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>{mvtTime || '00:00:00 MVT'}</span>
          </div>
          <span className="text-slate-500 font-mono-num">{utcTime || '00:00:00 UTC'}</span>
        </div>

        <div className="w-[1px] h-5 bg-slate-800 hidden sm:block" />

        {/* Tactical UI Tools */}
        <div className="flex items-center gap-1">
          {/* Audio Synthesizer Toggle */}
          <button
            onClick={() => {
              toggleSound();
              playClick();
            }}
            className={`p-1.5 rounded-md border transition-colors ${
              soundEnabled
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title={soundEnabled ? 'Mute Tactical Audio' : 'Enable Tactical Audio'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> : <VolumeX className="w-3.5 sm:w-4 h-3.5 sm:h-4" />}
          </button>

          {/* CRT Scanline Toggle (Desktop only) */}
          <button
            onClick={() => {
              playClick();
              toggleCrtScanlines();
            }}
            className={`hidden sm:inline-flex p-1.5 rounded-md border transition-colors ${
              crtScanlines
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle CRT Scanline Shader"
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* Desktop Right Drawer Toggle */}
          <button
            onClick={() => {
              playClick();
              setRightPanelOpen(!rightPanelOpen);
            }}
            className="hidden sm:inline-flex p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 rounded-md transition-colors"
            title={rightPanelOpen ? 'Collapse Telemetry Deck' : 'Open Telemetry Deck'}
          >
            {rightPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
