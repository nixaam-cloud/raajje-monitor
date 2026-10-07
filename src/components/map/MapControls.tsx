'use client';

import React from 'react';
import { useMonitorStore } from '@/store/useMonitorStore';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import {
  Ship,
  Plane,
  CloudLightning,
  Network,
  Anchor,
  ShieldAlert,
  Radio,
  Plus,
  Minus,
} from 'lucide-react';
import HorizontalScrollContainer from '../dashboard/HorizontalScrollContainer';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: (zone: 'MALE' | 'ALL' | 'NORTH' | 'SOUTH') => void;
}

export default function MapControls({ onZoomIn, onZoomOut, onResetView }: MapControlsProps) {
  const {
    showVessels,
    showFlights,
    showWeatherAlerts,
    showCables,
    showPortsAndAirports,
    showEEZBoundary,
    showRadarSweep,
    toggleLayer,
  } = useMonitorStore();
  const { playClick } = useSoundEffects();

  const handleToggle = (
    layer: 'vessels' | 'flights' | 'weather' | 'cables' | 'ports' | 'eez' | 'radar'
  ) => {
    playClick();
    toggleLayer(layer);
  };

  return (
    <aside
      aria-label="Tactical Map Controls"
      className="absolute bottom-[calc(env(safe-area-inset-bottom,0px)+60px)] sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 pointer-events-auto max-w-[96vw] select-none"
    >
      {/* 1. Tactical Layer Quick Dock (Scrollable horizontally on mobile to prevent spilling) */}
      <div className="w-full max-w-[96vw] sm:max-w-none flex items-center px-1.5 sm:px-3 py-1 rounded-xl tactical-panel border border-slate-800/90 shadow-2xl backdrop-blur-xl">
        <HorizontalScrollContainer className="flex items-center gap-1 sm:gap-1.5 w-full">
          <button
            onClick={() => handleToggle('vessels')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs font-mono font-medium rounded-lg transition-all shrink-0 ${
              showVessels
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
            }`}
            title="Toggle AIS Maritime Vessels"
          >
            <Ship className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-400" />
            <span>VESSELS</span>
          </button>

          <button
            onClick={() => handleToggle('flights')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs font-mono font-medium rounded-lg transition-all shrink-0 ${
              showFlights
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
            }`}
            title="Toggle ADS-B Aviation Tracks"
          >
            <Plane className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-cyan-400" />
            <span>FLIGHTS</span>
          </button>

          <button
            onClick={() => handleToggle('weather')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs font-mono font-medium rounded-lg transition-all shrink-0 ${
              showWeatherAlerts
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
            }`}
            title="Toggle MMS Surge & Weather Alerts"
          >
            <CloudLightning className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-400" />
            <span>WEATHER</span>
          </button>

          <button
            onClick={() => handleToggle('cables')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs font-mono font-medium rounded-lg transition-all shrink-0 ${
              showCables
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
            }`}
            title="Toggle Subsea Fiber Cables"
          >
            <Network className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-purple-400" />
            <span>CABLES</span>
          </button>

          <button
            onClick={() => handleToggle('ports')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs font-mono font-medium rounded-lg transition-all shrink-0 ${
              showPortsAndAirports
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
            }`}
            title="Toggle Ports & Airfields"
          >
            <Anchor className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-blue-400" />
            <span>INFRA</span>
          </button>

          <button
            onClick={() => handleToggle('eez')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs font-mono font-medium rounded-lg transition-all shrink-0 ${
              showEEZBoundary
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
            }`}
            title="Toggle EEZ Maritime Border"
          >
            <ShieldAlert className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-400" />
            <span>EEZ</span>
          </button>

          <button
            onClick={() => handleToggle('radar')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs font-mono font-medium rounded-lg transition-all shrink-0 ${
              showRadarSweep
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
            }`}
            title="Toggle Malé Radar Sweep"
          >
            <Radio className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-teal-400" />
            <span>RADAR</span>
          </button>
        </HorizontalScrollContainer>
      </div>

      {/* 2. Camera Viewport Shortcuts (Desktop/Tablet) */}
      <div className="hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-xl tactical-panel border border-slate-800/80 shadow-2xl backdrop-blur-xl">
        <button
          onClick={() => {
            playClick();
            onResetView('MALE');
          }}
          className="px-2 py-1 text-[11px] font-mono text-slate-300 hover:text-cyan-400 hover:bg-slate-800/60 rounded"
          title="Center on Malé Capital Lagoon"
        >
          MALÉ
        </button>
        <button
          onClick={() => {
            playClick();
            onResetView('ALL');
          }}
          className="px-2 py-1 text-[11px] font-mono text-slate-300 hover:text-cyan-400 hover:bg-slate-800/60 rounded"
          title="Fit All 26 Atolls & EEZ"
        >
          FULL EEZ
        </button>
        <button
          onClick={() => {
            playClick();
            onResetView('NORTH');
          }}
          className="px-2 py-1 text-[11px] font-mono text-slate-300 hover:text-cyan-400 hover:bg-slate-800/60 rounded"
          title="Focus on Northern Atolls"
        >
          NORTH
        </button>
        <button
          onClick={() => {
            playClick();
            onResetView('SOUTH');
          }}
          className="px-2 py-1 text-[11px] font-mono text-slate-300 hover:text-cyan-400 hover:bg-slate-800/60 rounded"
          title="Focus on Southern Atolls"
        >
          SOUTH
        </button>

        <div className="w-[1px] h-4 bg-slate-800 mx-1" />

        <button
          onClick={() => {
            playClick();
            onZoomIn();
          }}
          className="p-1 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded"
          title="Zoom In"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            playClick();
            onZoomOut();
          }}
          className="p-1 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded"
          title="Zoom Out"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
