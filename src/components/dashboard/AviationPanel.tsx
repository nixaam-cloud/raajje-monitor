'use client';

import React, { useState, useMemo } from 'react';
import { AviationFlight } from '@/app/api/aviation/route';
import { useMonitorStore } from '@/store/useMonitorStore';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import {
  Plane,
  Radio,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Search,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Crosshair,
  FileText,
  PlaneTakeoff,
  PlaneLanding,
  Navigation,
} from 'lucide-react';
import HorizontalScrollContainer from './HorizontalScrollContainer';
import AirlineLogoBadge from './AirlineLogoBadge';
import { resolveAirline, formatFlightNumber, formatShortRoute } from '@/utils/airlineLogos';

interface AviationPanelProps {
  flights?: AviationFlight[];
  onFocusFlight?: () => void;
}

export default function AviationPanel({ flights = [], onFocusFlight }: AviationPanelProps) {
  const [directionFilter, setDirectionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedFlightId, setExpandedFlightId] = useState<string | null>(null);
  const [showHubStats, setShowHubStats] = useState<boolean>(false);

  const { setFlyToTarget, setSelectedEntity, setRightPanelOpen } = useMonitorStore();
  const { playClick, playTargetLock } = useSoundEffects();

  const inboundCount = useMemo(() => flights.filter((f) => f.flightDirection === 'INBOUND').length, [flights]);
  const outboundCount = useMemo(() => flights.filter((f) => f.flightDirection === 'OUTBOUND').length, [flights]);
  const domesticCount = useMemo(() => flights.filter((f) => f.flightDirection === 'DOMESTIC').length, [flights]);
  const overflightCount = useMemo(() => flights.filter((f) => f.flightDirection === 'OVERFLIGHT').length, [flights]);
  const militaryCount = useMemo(() => flights.filter((f) => f.isMilitary).length, [flights]);

  const filteredFlights = useMemo(() => {
    return flights.filter((f) => {
      let matchesDirection = true;
      if (directionFilter === 'inbound') matchesDirection = f.flightDirection === 'INBOUND';
      else if (directionFilter === 'outbound') matchesDirection = f.flightDirection === 'OUTBOUND';
      else if (directionFilter === 'domestic') matchesDirection = f.flightDirection === 'DOMESTIC';
      else if (directionFilter === 'overflight') matchesDirection = f.flightDirection === 'OVERFLIGHT';
      else if (directionFilter === 'widebody') matchesDirection = f.aircraftCategory === 'INTERNATIONAL_WIDEBODY';
      else if (directionFilter === 'seaplane') matchesDirection = f.aircraftCategory === 'SEAPLANE_TWIN_OTTER';
      else if (directionFilter === 'regional') matchesDirection = f.aircraftCategory === 'REGIONAL_TURBOPROP';
      else if (directionFilter === 'military') matchesDirection = !!f.isMilitary;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        f.callsign.toLowerCase().includes(q) ||
        f.operator.toLowerCase().includes(q) ||
        f.aircraftType.toLowerCase().includes(q) ||
        f.origin.toLowerCase().includes(q) ||
        f.destination.toLowerCase().includes(q) ||
        (f.originCode && f.originCode.toLowerCase().includes(q)) ||
        (f.destinationCode && f.destinationCode.toLowerCase().includes(q)) ||
        (f.airwaySector && f.airwaySector.toLowerCase().includes(q));

      return matchesDirection && matchesSearch;
    });
  }, [flights, directionFilter, searchQuery]);

  const toggleExpand = (flightId: string) => {
    playClick();
    setExpandedFlightId((prev) => (prev === flightId ? null : flightId));
  };

  const handleSelectFlight = (f: AviationFlight, closeDrawerOnMobile = false) => {
    playTargetLock();
    setFlyToTarget({
      coordinates: f.coordinates,
    });

    setSelectedEntity({
      type: 'flight',
      id: f.id,
      title: `${f.callsign} // ${f.operator}`,
      subtitle: `${f.aircraftType} (${f.aircraftCategory})`,
      badge: {
        text: `${f.flightDirection} // ${f.flightPhase}`,
        variant: f.flightDirection === 'INBOUND' ? 'emerald' : f.flightDirection === 'OUTBOUND' ? 'amber' : 'cyan',
      },
      coordinates: f.coordinates,
      telemetry: {
        Callsign: f.callsign,
        ...(f.registration ? { 'Tail / Registration': f.registration } : {}),
        ...(f.flightNumber ? { 'Flight Number': f.flightNumber } : {}),
        ICAO24: f.icao24,
        Airline: f.operator,
        Aircraft: f.aircraftType,
        Category: f.aircraftCategory,
        'Flight Direction': `${f.flightDirection} ${f.flightDirection === 'INBOUND' ? 'TO MALDIVES' : f.flightDirection === 'OUTBOUND' ? 'FROM MALDIVES' : ''}`,
        Origin: f.origin,
        Destination: f.destination,
        Altitude: `${f.altitudeFt.toLocaleString()} ft`,
        GroundSpeed: `${f.velocityKts} knots`,
        Heading: `${f.headingDeg}°`,
        VerticalSpeed: `${f.verticalRateFpm} ft/min`,
        Squawk: f.squawk,
        Sector: f.airwaySector || 'Maldives Airspace',
        Phase: f.flightPhase,
        ...(f.militaryRole ? { 'Military Role': f.militaryRole } : {}),
        'Data Source':
          f.dataQuality === 'MODELED_OSINT'
            ? 'MODELED OSINT (not a live track)'
            : f.dataQuality === 'SIMULATED_ADSB'
            ? 'SIMULATED ADS-B (offline fallback)'
            : 'LIVE ADS-B',
      },
      raw: f,
    });

    if (closeDrawerOnMobile && typeof window !== 'undefined' && window.innerWidth < 768) {
      if (onFocusFlight) {
        onFocusFlight();
      } else {
        setRightPanelOpen(false);
      }
    }
  };

  return (
    <div className="space-y-2.5 text-xs font-mono">
      {/* 1. Collapsible Velana Airport Hub Header (Keeps mobile map clean) */}
      <div className="p-2 sm:p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 transition-all">
        <div
          onClick={() => setShowHubStats(!showHubStats)}
          className="flex items-center justify-between text-slate-200 cursor-pointer select-none"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Radio className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-bold text-[11px] truncate">VELANA AIRPORT (VRMM / MLE)</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {inboundCount} In / {outboundCount} Out
            </span>
            {showHubStats ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>
        </div>

        {/* Collapsible Airport Operations Summary */}
        {showHubStats && (
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-2.5 mt-2 border-t border-slate-800/80 animate-in fade-in duration-200">
            <div>
              <div className="text-slate-500 text-[9px]">INBOUND FLIGHTS</div>
              <div className="text-emerald-400 font-bold flex items-center gap-1">
                <PlaneLanding className="w-3 h-3" />
                {inboundCount} Arriving
              </div>
            </div>
            <div>
              <div className="text-slate-500 text-[9px]">OUTBOUND FLIGHTS</div>
              <div className="text-amber-400 font-bold flex items-center gap-1">
                <PlaneTakeoff className="w-3 h-3" />
                {outboundCount} Departing
              </div>
            </div>
            <div>
              <div className="text-slate-500 text-[9px]">DOMESTIC ISLANDS</div>
              <div className="text-cyan-400 font-bold">{domesticCount} Regional Tracks</div>
            </div>
            <div>
              <div className="text-slate-500 text-[9px]">OVERFLIGHTS</div>
              <div className="text-slate-300 font-bold">{overflightCount} En Route Tracks</div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Compact Search & Filter Controls */}
      <div className="space-y-1.5">
        <div className="relative">
          <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search flight (e.g. EK658, MLE, DXB, QTR)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-6 py-1.5 text-[11px] bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1.5 text-[10px] text-slate-400 hover:text-slate-200 p-0.5"
            >
              ✕
            </button>
          )}
        </div>

        {/* Direction Filter Pills */}
        <HorizontalScrollContainer className="w-full pb-1 text-[10px]">
          {[
            { id: 'all', label: `ALL (${flights.length})` },
            { id: 'inbound', label: `↘ INBOUND (${inboundCount})`, highlight: 'emerald' },
            { id: 'outbound', label: `↗ OUTBOUND (${outboundCount})`, highlight: 'amber' },
            { id: 'domestic', label: `↔ DOMESTIC (${domesticCount})`, highlight: 'cyan' },
            { id: 'overflight', label: `✈ OVERFLIGHTS (${overflightCount})` },
            { id: 'military', label: `⚔ MILITARY (${militaryCount})`, highlight: 'rose' },
            { id: 'widebody', label: 'WIDEBODIES' },
            { id: 'seaplane', label: 'SEAPLANES' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                playClick();
                setDirectionFilter(tab.id);
              }}
              className={`px-2 py-0.5 rounded-md whitespace-nowrap shrink-0 transition-colors font-bold border ${
                directionFilter === tab.id
                  ? tab.highlight === 'emerald'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                    : tab.highlight === 'amber'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                    : tab.highlight === 'rose'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </HorizontalScrollContainer>
      </div>

      {/* 3. Sleek Mobile-Friendly Flight Cards List */}
      <div className="space-y-1.5 max-h-[calc(100vh-270px)] sm:max-h-[390px] overflow-y-auto pr-0.5 scrollbar-none">
        {filteredFlights.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs space-y-1">
            <p>No flights match current filter.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setDirectionFilter('all');
              }}
              className="text-[10px] text-cyan-400 hover:underline"
            >
              Reset filter
            </button>
          </div>
        ) : (
          filteredFlights.map((f) => {
            const airline = resolveAirline(f.callsign, f.operator);
            const flightNumber = formatFlightNumber(f.callsign, airline);
            const route = formatShortRoute(f.origin, f.destination, f.originCode, f.destinationCode);
            const isExpanded = expandedFlightId === f.id;

            return (
              <div
                key={f.id}
                className={`rounded-lg border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'bg-slate-900/95 border-cyan-500/60 shadow-lg'
                    : 'bg-slate-900/60 hover:bg-slate-850/80 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* ── Compact Header Row: Logo + Flight No + Short Route + Direction ── */}
                <div
                  onClick={() => toggleExpand(f.id)}
                  className="flex items-center justify-between p-2 cursor-pointer select-none gap-2"
                >
                  {/* Left: Airline Logo + Flight Number + Short Route */}
                  <div className="flex items-center gap-2 min-w-0">
                    <AirlineLogoBadge meta={airline} size="sm" />

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 leading-tight">
                        <span className="font-bold text-slate-100 text-xs font-mono tracking-tight group-hover:text-cyan-300">
                          {flightNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono truncate max-w-[75px] sm:max-w-[110px]">
                          {airline.name}
                        </span>
                      </div>

                      {/* Destination in short (e.g. DXB ➔ MLE) */}
                      <div className="flex items-center gap-1 text-[11px] font-bold font-mono tracking-tight pt-0.5">
                        <span className="text-slate-400">{route.from}</span>
                        <ArrowRight className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                        <span
                          className={
                            f.flightDirection === 'INBOUND'
                              ? 'text-emerald-400'
                              : f.flightDirection === 'OUTBOUND'
                              ? 'text-amber-400'
                              : 'text-cyan-300'
                          }
                        >
                          {route.to}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Direction Tag + Altitude + Expand Chevron */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Direction Badge */}
                    <span
                      className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold font-mono ${
                        f.isMilitary
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : f.flightDirection === 'INBOUND'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : f.flightDirection === 'OUTBOUND'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : f.flightDirection === 'DOMESTIC'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {f.isMilitary
                        ? '⚔ MIL'
                        : f.flightDirection === 'INBOUND'
                        ? '↘ TO MV'
                        : f.flightDirection === 'OUTBOUND'
                        ? '↗ FROM MV'
                        : f.flightDirection === 'DOMESTIC'
                        ? '↔ DOM'
                        : '✈ TRANSIT'}
                    </span>

                    {/* Altitude & Vertical Arrow */}
                    <div className="flex items-center text-[10px] font-mono font-bold text-cyan-300">
                      {f.verticalRateFpm > 200 ? (
                        <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                      ) : f.verticalRateFpm < -200 ? (
                        <ArrowDownRight className="w-3 h-3 text-amber-400" />
                      ) : (
                        <Minus className="w-2.5 h-2.5 text-slate-500" />
                      )}
                      <span>{f.altitudeFt <= 100 && f.velocityKts < 20 ? 'DOCK' : `${Math.round(f.altitudeFt / 1000)}k`}</span>
                    </div>

                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-cyan-400' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* ── Expanded Flight Details (Shown after click) ── */}
                {isExpanded && (
                  <div className="p-2.5 pt-1 border-t border-slate-800/80 bg-slate-950/70 space-y-2 text-[11px] animate-in fade-in slide-in-from-top-1 duration-200">
                    {/* Full Route & Operator Details */}
                    <div className="space-y-1 bg-slate-900/60 p-2 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span>ORIGIN / DESTINATION</span>
                        <span className="text-cyan-400 font-bold">{f.aircraftType}</span>
                      </div>
                      <div className="text-slate-200 font-medium text-[10px] leading-snug">
                        <span className="text-slate-400">From: </span>
                        <strong>{f.origin}</strong>
                      </div>
                      <div className="text-slate-200 font-medium text-[10px] leading-snug">
                        <span className="text-slate-400">To: </span>
                        <strong className={f.flightDirection === 'INBOUND' ? 'text-emerald-300' : 'text-slate-200'}>
                          {f.destination}
                        </strong>
                      </div>
                    </div>

                    {/* Flight Telemetry Grid */}
                    <div className="grid grid-cols-3 gap-1.5 text-[9px] font-mono">
                      <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                        <div className="text-slate-500">ALTITUDE</div>
                        <div className="text-cyan-300 font-bold">{f.altitudeFt.toLocaleString()} ft</div>
                      </div>
                      <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                        <div className="text-slate-500">SPEED</div>
                        <div className="text-slate-200 font-bold">{f.velocityKts} kts</div>
                      </div>
                      <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                        <div className="text-slate-500">HEADING</div>
                        <div className="text-slate-200 font-bold flex items-center gap-0.5">
                          <Navigation
                            className="w-2.5 h-2.5 text-cyan-400"
                            style={{ transform: `rotate(${f.headingDeg}deg)` }}
                          />
                          {f.headingDeg}°
                        </div>
                      </div>
                      <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                        <div className="text-slate-500">VERTICAL SPD</div>
                        <div
                          className={`font-bold ${
                            f.verticalRateFpm > 200
                              ? 'text-emerald-400'
                              : f.verticalRateFpm < -200
                              ? 'text-amber-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {f.verticalRateFpm > 0 ? `+${f.verticalRateFpm}` : f.verticalRateFpm} fpm
                        </div>
                      </div>
                      <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                        <div className="text-slate-500">SQUAWK</div>
                        <div className="text-slate-300 font-bold">{f.squawk || '1000'}</div>
                      </div>
                      <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                        <div className="text-slate-500">PHASE</div>
                        <div className="text-cyan-400 font-bold">{f.flightPhase}</div>
                      </div>
                    </div>

                    {/* Sector / Airway if present */}
                    {f.airwaySector && (
                      <div className="text-[9px] text-slate-400 bg-slate-900/40 px-2 py-1 rounded border border-slate-800/60 truncate">
                        <span className="text-slate-500">SECTOR: </span>
                        {f.airwaySector}
                      </div>
                    )}

                    {/* Actions: Focus on Map (Reveals map on mobile) & Full Dossier */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleSelectFlight(f, true)}
                        className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 font-bold text-[10px] transition-colors shadow-sm"
                        title="Focus on flight in 3D Map and minimize drawer on mobile"
                      >
                        <Crosshair className="w-3 h-3 text-cyan-400" />
                        <span>VIEW ON MAP</span>
                      </button>

                      <button
                        onClick={() => handleSelectFlight(f, false)}
                        className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-[10px] transition-colors"
                        title="View Full Telemetry Dossier"
                      >
                        <FileText className="w-3 h-3 text-slate-400" />
                        <span>FULL DOSSIER</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
