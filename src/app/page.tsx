'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useMonitorStore } from '@/store/useMonitorStore';
import { useLiveRadar } from '@/hooks/useLiveRadar';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import TopTelemetryBar from '@/components/dashboard/TopTelemetryBar';
import LiveFeedPanel from '@/components/dashboard/LiveFeedPanel';
import RightDrawer from '@/components/dashboard/RightDrawer';
import EntityDossierModal from '@/components/dashboard/EntityDossierModal';
import CCTVModal from '@/components/dashboard/CCTVModal';
import EventAlertBanner from '@/components/alerts/EventAlertBanner';
import { Plane, Ship, Radio, Tv, Map as MapIcon } from 'lucide-react';

// Dynamically import MapLibre WebGL canvas to prevent SSR window issues
const MapEngine = dynamic(() => import('@/components/map/MapEngine'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#07090e] text-cyan-400 font-mono space-y-3">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-emerald-500/20 border-b-emerald-400 animate-spin" />
      </div>
      <div className="text-xs tracking-widest text-slate-300">
        INITIALIZING WEBGL MARITIME & AVIATION RADAR...
      </div>
      <div className="text-[10px] text-slate-500">
        CARTO VECTOR TILES // INDIAN OCEAN EEZ BOUNDS
      </div>
    </div>
  ),
});

export default function CockpitPage() {
  const {
    crtScanlines,
    leftPanelOpen,
    rightPanelOpen,
    activeRightTab,
    setLeftPanelOpen,
    setRightPanelOpen,
    setActiveRightTab,
  } = useMonitorStore();
  const { maritime, aviation, weather, news, macro, telecom, refetchNews, isFetchingNews } = useLiveRadar();
  const { playClick } = useSoundEffects();

  // On mobile viewports, start with clean unobstructed map view
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setLeftPanelOpen(false);
      setRightPanelOpen(false);
    }
  }, [setLeftPanelOpen, setRightPanelOpen]);

  // Mobile drawer switchers (ensures only 1 panel is active on small screens)
  const handleMobileNav = (target: 'news' | 'aviation' | 'maritime' | 'tv' | 'map') => {
    playClick();

    if (target === 'map') {
      setLeftPanelOpen(false);
      setRightPanelOpen(false);
      return;
    }

    if (target === 'news') {
      if (leftPanelOpen) {
        setLeftPanelOpen(false);
      } else {
        setRightPanelOpen(false);
        setLeftPanelOpen(true);
      }
      return;
    }

    // Right drawer tabs: aviation, maritime, tv
    if (rightPanelOpen && activeRightTab === target) {
      setRightPanelOpen(false);
    } else {
      setLeftPanelOpen(false);
      setActiveRightTab(target);
      setRightPanelOpen(true);
    }
  };

  return (
    <main
      className={`relative w-screen h-screen h-[100dvh] overflow-hidden flex flex-col bg-[#07090e] ${
        crtScanlines ? 'crt-overlay' : ''
      }`}
    >
      {/* 1. Tactical HUD Header Bar */}
      <TopTelemetryBar
        vesselCount={maritime?.vessels?.length ?? 14}
        flightCount={aviation?.flights?.length ?? 10}
        alertLevel={weather?.mmsAlert?.level ?? 'YELLOW'}
      />

      {/* 2. Full-bleed Center Geospatial Radar Viewport */}
      <div className="relative flex-1 min-h-0 w-full overflow-hidden">
        <MapEngine
          vessels={maritime?.vessels}
          flights={aviation?.flights}
          weather={weather}
          news={news?.feed}
          telecom={telecom}
        />

        {/* 3. Floating Left Intelligence Wire */}
        <LiveFeedPanel
          news={news?.feed}
          onRefreshNews={refetchNews}
          isFetchingNews={isFetchingNews}
        />

        {/* 4. Floating Right Operations Deck */}
        <RightDrawer
          vessels={maritime?.vessels}
          flights={aviation?.flights}
          weather={weather}
          macro={macro}
          telecom={telecom}
        />

        {/* 5. Mobile Fixed Bottom Navigation Bar (Always visible with iOS/Android safe-area padding) */}
        <nav
          aria-label="Mobile Bottom Navigation"
          className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 border-t border-slate-800/90 shadow-[0_-8px_20px_rgba(0,0,0,0.8)] backdrop-blur-xl px-2 pt-1.5 pb-[max(8px,env(safe-area-inset-bottom,8px))] flex items-center justify-around font-mono select-none"
        >
          {/* MAP / FULL VIEW */}
          <button
            onClick={() => handleMobileNav('map')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all ${
              !leftPanelOpen && !rightPanelOpen
                ? 'text-cyan-300 font-bold bg-cyan-950/40 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapIcon className="w-4 h-4 mb-0.5" />
            <span className="text-[9px]">MAP</span>
          </button>

          {/* NEWS WIRE */}
          <button
            onClick={() => handleMobileNav('news')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all ${
              leftPanelOpen
                ? 'text-amber-300 font-bold bg-amber-950/40 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Radio className="w-4 h-4 mb-0.5" />
              <div className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-[9px]">NEWS ({news?.count ?? 0})</span>
          </button>

          {/* FLIGHTS */}
          <button
            onClick={() => handleMobileNav('aviation')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-all ${
              rightPanelOpen && activeRightTab === 'aviation'
                ? 'text-cyan-300 font-bold bg-cyan-500/20 border border-cyan-500/50 shadow-sm shadow-cyan-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plane className="w-4 h-4 mb-0.5 text-cyan-400" />
            <span className="text-[9px]">FLIGHTS ({aviation?.flights?.length ?? 0})</span>
          </button>

          {/* VESSELS */}
          <button
            onClick={() => handleMobileNav('maritime')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all ${
              rightPanelOpen && activeRightTab === 'maritime'
                ? 'text-emerald-300 font-bold bg-emerald-950/40 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Ship className="w-4 h-4 mb-0.5 text-emerald-400" />
            <span className="text-[9px]">VESSELS ({maritime?.vessels?.length ?? 0})</span>
          </button>

          {/* LIVE TV */}
          <button
            onClick={() => handleMobileNav('tv')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all ${
              rightPanelOpen && activeRightTab === 'tv'
                ? 'text-purple-300 font-bold bg-purple-950/40 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tv className="w-4 h-4 mb-0.5 text-purple-400" />
            <span className="text-[9px]">TV</span>
          </button>
        </nav>

        {/* 6. Entity Telemetry Dossier Modal */}
        <EntityDossierModal />

        {/* 7. Geolocated CCTV Live Feed Modal */}
        <CCTVModal />

        {/* 8. Real-time Event & Breaking Intelligence Alerts */}
        <EventAlertBanner news={news?.feed} weather={weather} />
      </div>
    </main>
  );
}
