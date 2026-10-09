'use client';

import React, { useState } from 'react';
import { useMonitorStore, ActiveDrawerTab } from '@/store/useMonitorStore';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { MaritimeVessel } from '@/app/api/maritime/route';
import { AviationFlight } from '@/app/api/aviation/route';
import { WeatherTelemetry } from '@/app/api/weather/route';
import { MacroPulse } from '@/app/api/macro/route';
import MaritimePanel from './MaritimePanel';
import AviationPanel from './AviationPanel';
import WeatherSwellCard from './WeatherSwellCard';
import TourismMacroCard from './TourismMacroCard';
import LiveTVPanel from './LiveTVPanel';
import CCTVPanel from './CCTVPanel';
import HorizontalScrollContainer from './HorizontalScrollContainer';
import { Ship, Plane, CloudLightning, BarChart3, Tv, Video, X, ChevronDown, ChevronUp, Map as MapIcon } from 'lucide-react';
import { MALDIVES_CCTV_FEEDS } from '@/data/cctvFeeds';

interface RightDrawerProps {
  vessels?: MaritimeVessel[];
  flights?: AviationFlight[];
  weather?: WeatherTelemetry;
  macro?: MacroPulse;
}

export default function RightDrawer({
  vessels = [],
  flights = [],
  weather,
  macro,
}: RightDrawerProps) {
  const { rightPanelOpen, setRightPanelOpen, activeRightTab, setActiveRightTab } =
    useMonitorStore();
  const { playClick } = useSoundEffects();
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  if (!rightPanelOpen) return null;

  const tabs: { id: ActiveDrawerTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: 'maritime',
      label: 'MARITIME',
      icon: <Ship className="w-3.5 h-3.5" />,
      badge: vessels.length,
    },
    {
      id: 'aviation',
      label: 'AVIATION',
      icon: <Plane className="w-3.5 h-3.5" />,
      badge: flights.length,
    },
    {
      id: 'weather',
      label: 'WEATHER',
      icon: <CloudLightning className="w-3.5 h-3.5" />,
      badge: weather?.mmsAlert?.level ?? 'MMS',
    },
    {
      id: 'macro',
      label: 'MACRO',
      icon: <BarChart3 className="w-3.5 h-3.5" />,
    },
    {
      id: 'tv',
      label: 'LIVE TV',
      icon: <Tv className="w-3.5 h-3.5" />,
      badge: 'LIVE',
    },
    {
      id: 'cctv',
      label: 'CCTV CAMS',
      icon: <Video className="w-3.5 h-3.5 text-rose-400" />,
      badge: MALDIVES_CCTV_FEEDS.length,
    },
  ];

  const currentTab = tabs.find((t) => t.id === activeRightTab) || tabs[0];

  return (
    <aside
      aria-label="Operations Deck"
      className={`absolute z-30 flex flex-col tactical-panel rounded-xl overflow-hidden border border-slate-800/90 shadow-2xl transition-all duration-300 w-[calc(100vw-16px)] sm:w-80 md:w-96 right-2 sm:right-4 ${
        isMinimized
          ? 'bottom-[calc(env(safe-area-inset-bottom,0px)+58px)] sm:bottom-20 h-12 border-cyan-500/50 bg-slate-950/95'
          : 'top-14 bottom-[calc(env(safe-area-inset-bottom,0px)+58px)] sm:bottom-20'
      }`}
    >
      {/* 1. Minimized / Peek Bar (Allows viewing full map on mobile) */}
      {isMinimized ? (
        <div
          onClick={() => {
            playClick();
            setIsMinimized(false);
          }}
          className="w-full h-full px-3 flex items-center justify-between cursor-pointer select-none text-xs font-mono bg-slate-950/90 hover:bg-slate-900/90 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              {currentTab.icon}
              {currentTab.label}
            </span>
            {currentTab.badge !== undefined && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                {currentTab.badge}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-1">
              EXPAND
              <ChevronUp className="w-3.5 h-3.5" />
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                playClick();
                setRightPanelOpen(false);
              }}
              className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800/60"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Header Tabs */}
          <div className="border-b border-slate-800/80 bg-slate-950/80 flex items-center justify-between px-2 pt-2">
            <HorizontalScrollContainer className="flex-1 min-w-0 mr-1 pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    playClick();
                    setActiveRightTab(tab.id);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-lg transition-all shrink-0 ${
                    activeRightTab === tab.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                        tab.badge === 'ALERT'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </HorizontalScrollContainer>

            {/* Quick Action Controls: Minimize (View Map) & Close */}
            <div className="flex items-center gap-0.5 mb-2">
              <button
                onClick={() => {
                  playClick();
                  setIsMinimized(true);
                }}
                className="p-1 text-slate-400 hover:text-cyan-400 rounded hover:bg-slate-800/60 flex items-center gap-1 text-[10px] font-mono px-1.5"
                title="Minimize drawer to view map"
              >
                <MapIcon className="w-3 h-3 text-cyan-400" />
                <span className="hidden xs:inline sm:hidden">MAP</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              <button
                onClick={() => {
                  playClick();
                  setRightPanelOpen(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800/60"
                title="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-2.5 sm:p-3">
            {activeRightTab === 'maritime' && <MaritimePanel vessels={vessels} />}
            {activeRightTab === 'aviation' && (
              <AviationPanel
                flights={flights}
                onFocusFlight={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    setIsMinimized(true);
                  }
                }}
              />
            )}
            {activeRightTab === 'weather' && <WeatherSwellCard weather={weather} />}
            {activeRightTab === 'macro' && <TourismMacroCard macro={macro} />}
            {activeRightTab === 'tv' && <LiveTVPanel />}
            {activeRightTab === 'cctv' && <CCTVPanel />}
          </div>
        </>
      )}
    </aside>
  );
}
