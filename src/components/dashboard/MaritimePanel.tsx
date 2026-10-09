'use client';

import React, { useState } from 'react';
import { MaritimeVessel } from '@/app/api/maritime/route';
import { useMonitorStore } from '@/store/useMonitorStore';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { STRATEGIC_CHOKEPOINTS } from '@/data/maldivesGeo';
import {
  Ship,
  Compass,
  Anchor,
  Navigation,
  ShieldCheck,
  AlertTriangle,
  Search,
} from 'lucide-react';
import HorizontalScrollContainer from './HorizontalScrollContainer';

interface MaritimePanelProps {
  vessels?: MaritimeVessel[];
}

export default function MaritimePanel({ vessels = [] }: MaritimePanelProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { setFlyToTarget, setSelectedEntity } = useMonitorStore();
  const { playClick, playTargetLock } = useSoundEffects();

  const filteredVessels = vessels.filter((v) => {
    const matchesFilter = filterType === 'all' || v.type === filterType;
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.mmsi.includes(searchQuery) ||
      v.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.zone.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSelectVessel = (v: MaritimeVessel) => {
    playTargetLock();
    setFlyToTarget({
      coordinates: v.coordinates,
    });
    setSelectedEntity({
      type: 'vessel',
      id: v.id,
      title: v.name,
      subtitle: `${v.typeName} // MMSI: ${v.mmsi}`,
      badge: {
        text: `${v.zone.toUpperCase()}`,
        variant: v.hazardousCargo ? 'amber' : 'emerald',
      },
      coordinates: v.coordinates,
      telemetry: {
        MMSI: v.mmsi,
        IMO: v.imo || 'N/A',
        Callsign: v.callsign,
        Flag: `${v.flag} (${v.flagCode})`,
        Type: v.typeName,
        'Speed (SOG)': `${v.sog} knots`,
        'Course (COG)': `${v.cog}°`,
        Draft: `${v.draftMeters} m`,
        Dimensions: `${v.lengthMeters}m x ${v.beamMeters}m`,
        Status: v.navStatus,
        Origin: v.origin,
        Destination: v.destination,
        ETA: v.eta,
        Corridor: v.zone,
      },
      raw: v,
    });
  };

  const handleFocusChokepoint = (cp: (typeof STRATEGIC_CHOKEPOINTS)[0]) => {
    playClick();
    setFlyToTarget({
      coordinates: [(cp.coordinates[0][0] + cp.coordinates[1][0]) / 2, cp.latitude],
      zoom: 8.5,
      pitch: 25,
    });
  };

  return (
    <div className="space-y-4 text-xs font-mono">
      {/* 1. SLOC Chokepoint Transit Telemetry */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-slate-300">
          <span className="font-bold tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            STRATEGIC SLOC CORRIDORS
          </span>
          <span className="text-[10px] text-slate-400">UNCLOS EEZ</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {STRATEGIC_CHOKEPOINTS.map((cp) => {
            const countInZone = vessels.filter((v) =>
              v.zone.toLowerCase().includes(cp.name.toLowerCase().split(' ')[0])
            ).length;

            return (
              <div
                key={cp.id}
                onClick={() => handleFocusChokepoint(cp)}
                className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all space-y-1 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                      {cp.name}
                    </span>
                    <span className="text-[10px] text-slate-400">({cp.dhivehiName})</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
                    {cp.latitude.toFixed(1)}° N
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  <span className="truncate pr-2">{cp.strategicImportance}</span>
                  <span className="text-cyan-400 font-bold whitespace-nowrap">
                    ~{cp.dailyVesselTransitEst} ships/day
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Malé Harbor & Port Status */}
      <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-slate-200">
          <span className="font-bold flex items-center gap-1.5 text-emerald-400">
            <Anchor className="w-3.5 h-3.5" />
            MALÉ COMMERCIAL HARBOR (MPL)
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30">
            CONGESTED
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
          <div>
            <div className="text-slate-400 text-[10px]">BERTH OCCUPANCY</div>
            <div className="text-slate-100 font-bold">4 / 4 Berths Active</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">OUTER ANCHORAGE</div>
            <div className="text-amber-400 font-bold">4 Vessels in Roads</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">CONTAINER DWELL</div>
            <div className="text-slate-100 font-bold">2.8 Days Avg</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">THILAFUSHI PIER</div>
            <div className="text-emerald-400 font-bold">Nominal Fuel Intake</div>
          </div>
        </div>
      </div>

      {/* 3. Live Vessel Fleet Telemetry */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Ship className="w-3.5 h-3.5 text-cyan-400" />
            ACTIVE AIS CONTACTS ({filteredVessels.length})
          </span>
        </div>

        {/* Search & Filter */}
        <div className="space-y-1.5">
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search vessel, MMSI, port..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2 py-1 text-[11px] bg-slate-950/80 border border-slate-800 rounded text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <HorizontalScrollContainer className="w-full pb-1 text-[10px]">
            {['all', 'tanker', 'cargo', 'coast_guard', 'rtl_ferry', 'safari_boat', 'fishing_dhoni'].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    playClick();
                    setFilterType(cat);
                  }}
                  className={`px-2.5 py-0.5 rounded whitespace-nowrap uppercase shrink-0 transition-colors ${
                    filterType === cat
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              )
            )}
          </HorizontalScrollContainer>
        </div>

        {/* Vessel List */}
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {filteredVessels.map((v) => (
            <div
              key={v.id}
              onClick={() => handleSelectVessel(v)}
              className="p-2 rounded bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/70 hover:border-cyan-500/40 cursor-pointer transition-all space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 group-hover:text-cyan-300 truncate max-w-[190px]">
                  {v.name}
                </span>
                <span className="text-[10px] text-cyan-400 font-bold">
                  {v.sog} kts // {v.cog}°
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="truncate max-w-[160px]">{v.typeName}</span>
                <span className="text-slate-400">{v.flagCode}</span>
              </div>
              <div className="text-[9px] text-slate-400 flex items-center justify-between pt-0.5">
                <span className="truncate max-w-[150px]">DEST: {v.destination}</span>
                <span className="text-amber-400/90">{v.zone}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
