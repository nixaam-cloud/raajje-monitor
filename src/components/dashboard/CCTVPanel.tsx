'use client';

import React, { useState, useMemo } from 'react';
import { useMonitorStore } from '@/store/useMonitorStore';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { MALDIVES_CCTV_FEEDS, CCTVFeed, CCTVCategory } from '@/data/cctvFeeds';
import CCTVPlayer from './CCTVPlayer';
import {
  Video,
  Search,
  Crosshair,
  MapPin,
  Compass,
  Grid2X2,
  List,
  Eye,
  Shield,
  ExternalLink,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import HorizontalScrollContainer from './HorizontalScrollContainer';

export default function CCTVPanel() {
  const {
    selectedCCTVId,
    setSelectedCCTVId,
    setSelectedEntity,
    setFlyToTarget,
  } = useMonitorStore();

  const { playClick, playTargetLock } = useSoundEffects();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'wall'>('list');

  const categories = ['ALL', 'TRAFFIC', 'PORT', 'AIRPORT', 'COASTAL', 'REEF'];

  const filteredCams = useMemo(() => {
    return MALDIVES_CCTV_FEEDS.filter((cam) => {
      const matchesCategory =
        selectedCategory === 'ALL' || cam.category === selectedCategory;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        cam.name.toLowerCase().includes(query) ||
        cam.locationName.toLowerCase().includes(query) ||
        cam.atoll.toLowerCase().includes(query) ||
        cam.code.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleSelectCamera = (cam: CCTVFeed) => {
    playTargetLock();
    setSelectedCCTVId(cam.id);

    // Pan to camera location without zooming
    setFlyToTarget({
      coordinates: cam.coordinates,
    });

    setSelectedEntity({
      type: 'cctv',
      id: cam.id,
      title: cam.name,
      subtitle: `${cam.locationName} // ${cam.code}`,
      badge: {
        text: `${cam.category} // ${cam.status}`,
        variant: 'emerald',
      },
      coordinates: cam.coordinates,
      telemetry: {
        'Camera ID': cam.code,
        Sector: cam.zone,
        Location: `${cam.locationName} (${cam.atoll} Atoll)`,
        Status: `${cam.status} (LIVE)`,
        Resolution: `${cam.resolution} @ ${cam.fps}fps`,
        Orientation: `${cam.heading}° (${cam.fov}° FOV)`,
        Sensor: cam.telemetry.sensorType,
        Enclosure: cam.telemetry.weatherResistance,
      },
      raw: cam,
    });
  };

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* 1. Header & Controls */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-200">
            <Video className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-bold tracking-wider text-rose-400">
              GEOLOCATED CCTV SURVEILLANCE
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                playClick();
                setViewMode('list');
              }}
              className={`p-1 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                playClick();
                setViewMode('wall');
              }}
              className={`p-1 rounded transition-colors ${
                viewMode === 'wall'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Multi-Cam Wall (2x2 Grid)"
            >
              <Grid2X2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bridge, airport, harbor, atoll..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-[11px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-rose-500/50"
          />
        </div>

        {/* Category Pills */}
        <HorizontalScrollContainer className="w-full pb-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                playClick();
                setSelectedCategory(cat);
              }}
              className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 font-bold'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </HorizontalScrollContainer>
      </div>

      {/* 2. Multi-Cam Wall Mode (2x2 Security Monitoring Grid) */}
      {viewMode === 'wall' ? (
        <div className="grid grid-cols-2 gap-2 pt-1">
          {filteredCams.slice(0, 4).map((cam) => (
            <div
              key={cam.id}
              onClick={() => handleSelectCamera(cam)}
              className="relative aspect-video rounded-lg overflow-hidden border border-slate-800 hover:border-rose-500/80 transition-all cursor-pointer group bg-black shadow-lg"
            >
              <CCTVPlayer
                feed={cam}
                compact={true}
                showHUD={false}
                className="group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

              <div className="absolute top-1 left-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[8px] font-bold text-white drop-shadow">
                  {cam.code.slice(-6)}
                </span>
              </div>

              <div className="absolute bottom-1 inset-x-1 flex items-center justify-between text-[8px] text-slate-300">
                <span className="truncate max-w-[85px] font-bold text-slate-100">
                  {cam.locationName}
                </span>
                <span className="text-cyan-400 font-mono-num">{cam.resolution}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 3. List Mode */
        <div className="space-y-1.5 max-h-[55vh] overflow-y-auto pr-1">
          {filteredCams.length === 0 ? (
            <div className="p-6 text-center text-slate-500 font-mono text-xs">
              No surveillance cameras match query.
            </div>
          ) : (
            filteredCams.map((cam) => {
              const isSelected = selectedCCTVId === cam.id;

              return (
                <div
                  key={cam.id}
                  onClick={() => handleSelectCamera(cam)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-rose-950/40 border-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
                      : 'bg-slate-900/60 hover:bg-slate-850/80 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        <h4 className="font-bold text-slate-100 text-[11px] truncate group-hover:text-rose-300 transition-colors">
                          {cam.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <div className="flex items-center gap-1 text-cyan-400">
                          <MapPin className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{cam.locationName}</span>
                        </div>
                        <span className="text-slate-600">•</span>
                        <div className="flex items-center gap-1">
                          <Compass className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                          <span>{cam.heading}° HDG</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-rose-500/15 text-rose-300 border border-rose-500/40">
                        {cam.category}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono-num">
                        {cam.resolution}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
