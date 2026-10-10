'use client';

import React from 'react';
import { useMonitorStore } from '@/store/useMonitorStore';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import {
  CABLE_LANDING_STATIONS,
  SUBMARINE_CABLES_GEOJSON,
  NETWORK_OUTAGES,
  TELECOM_HEALTH_METRICS,
  CELL_TOWERS,
} from '@/data/cablesGeoJson';
import {
  Wifi,
  AlertTriangle,
  Network,
  Radio,
  Activity,
  ArrowRight,
  ShieldCheck,
  Globe,
  Zap,
  Server,
  Layers,
} from 'lucide-react';

export default function TelcoPanel() {
  const { setFlyToTarget, setSelectedEntity, toggleLayer, showCoverage, showOutages, showCables } = useMonitorStore();
  const { playClick, playTargetLock } = useSoundEffects();

  const handleLocateOutage = (outage: typeof NETWORK_OUTAGES[0]) => {
    playTargetLock();
    setFlyToTarget({
      coordinates: outage.coordinates,
      zoom: 11,
      pitch: 35,
    });
    setSelectedEntity({
      type: 'outage',
      id: outage.id,
      title: `${outage.island} // ${outage.atoll}`,
      subtitle: `${outage.operator} - ${outage.type.replace(/_/g, ' ')}`,
      badge: {
        text: outage.severity,
        variant: outage.severity === 'DEGRADED' ? 'amber' : outage.severity === 'STANDBY_POWER' ? 'cyan' : 'purple',
      },
      coordinates: outage.coordinates,
      telemetry: {
        Island: outage.island,
        Atoll: outage.atoll,
        Operator: outage.operator,
        Severity: outage.severity,
        Category: outage.type.replace(/_/g, ' '),
        'Affected Subscribers': outage.affectedSubscribers.toLocaleString(),
        'Estimated Recovery': outage.etaRecovery,
        'Technical Cause': outage.cause,
        'Impact Assessment': outage.impact,
        'Backup & Failover': outage.backupStatus,
        'Incident Duration': outage.startedAt,
      },
    });
  };

  const handleInspectCable = (feature: typeof SUBMARINE_CABLES_GEOJSON.features[0]) => {
    const props = feature.properties;
    if (!props) return;
    playTargetLock();
    const coords = feature.geometry.coordinates;
    const midPoint = coords[Math.floor(coords.length / 2)] as [number, number];
    setFlyToTarget({
      coordinates: midPoint,
      zoom: 6.2,
      pitch: 25,
    });
    setSelectedEntity({
      type: 'cable',
      id: props.id,
      title: props.name,
      subtitle: props.system,
      badge: {
        text: `${props.capacityTbps} TBPS // ${props.status}`,
        variant: 'emerald',
      },
      telemetry: {
        System: props.system,
        'Total Length': `${props.lengthKm.toLocaleString()} km`,
        Capacity: `${props.capacityTbps} Tbps`,
        'Ready For Service': props.rfsYear,
        Owners: props.owners,
        '1st Landing Gateways Beyond EEZ': props.firstLandingStationsAway,
        'Operating Status': props.status,
      },
    });
  };

  const handleInspectStation = (station: typeof CABLE_LANDING_STATIONS[0]) => {
    playTargetLock();
    setFlyToTarget({
      coordinates: station.coordinates,
      zoom: station.isInternational ? 9.5 : 12,
      pitch: 30,
    });
    setSelectedEntity({
      type: 'cable',
      id: station.id,
      title: station.name,
      subtitle: `${station.country} (${station.atollOrRegion})`,
      badge: {
        text: station.isInternational ? 'INTERNATIONAL 1ST LANDING' : 'MALDIVES GATEWAY',
        variant: station.isInternational ? 'purple' : 'emerald',
      },
      coordinates: station.coordinates,
      telemetry: {
        Station: station.name,
        Location: `${station.atollOrRegion}, ${station.country}`,
        Classification: station.isInternational ? '1st Landing Station (Beyond EEZ)' : 'National Primary Gateway',
        Operator: station.operator,
        'Capacity Throughput': `${station.capacityTbps} Tbps`,
        'Cables Connected': station.cablesConnected.join(', '),
        'Latency to Malé': station.latencyToMaleMs !== undefined ? `${station.latencyToMaleMs} ms` : 'N/A',
        Status: station.status,
      },
    });
  };

  return (
    <div className="space-y-3 font-mono text-xs select-none">
      {/* 1. National Telecom Pulse Summary Card */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30 shadow-lg relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Wifi className="w-4 h-4 text-cyan-400" />
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
            </div>
            <span className="font-bold text-slate-100 tracking-wider">NATIONAL TELECOM GRID</span>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            {TELECOM_HEALTH_METRICS.nationalUptimePercent}% UPTIME
          </span>
        </div>

        {/* Key KPI Grid */}
        <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[9px]">4G POPULATION</span>
            <span className="text-emerald-400 font-bold text-sm tracking-tight">
              {TELECOM_HEALTH_METRICS.populationCoverage4G}%
            </span>
            <span className="text-[8px] text-slate-400 block">187 Inhabited Islands</span>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[9px]">5G SMART URBAN</span>
            <span className="text-cyan-400 font-bold text-sm tracking-tight">
              {TELECOM_HEALTH_METRICS.populationCoverage5G}%
            </span>
            <span className="text-[8px] text-slate-400 block">Malé, Addu & Regional Hubs</span>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[9px]">SUBSEA PIPELINES</span>
            <span className="text-purple-400 font-bold text-sm tracking-tight">
              {TELECOM_HEALTH_METRICS.totalInternationalCapacityTbps} Tbps
            </span>
            <span className="text-[8px] text-slate-400 block">5 Active International Gateways</span>
          </div>
          <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[9px]">NETWORK INCIDENTS</span>
            <span className="text-amber-400 font-bold text-sm tracking-tight">
              {TELECOM_HEALTH_METRICS.activeIncidentsCount} Active
            </span>
            <span className="text-[8px] text-slate-400 block">Microwave & SFP Maintenance</span>
          </div>
        </div>

        {/* Quick Layer Switchers */}
        <div className="flex items-center gap-1.5 pt-2 mt-2 border-t border-slate-800/80">
          <button
            onClick={() => {
              playClick();
              toggleLayer('coverage');
            }}
            className={`flex-1 py-1 px-2 rounded text-[9px] font-bold border transition-all flex items-center justify-center gap-1 ${
              showCoverage
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>5G/4G COVERAGE</span>
          </button>
          <button
            onClick={() => {
              playClick();
              toggleLayer('outages');
            }}
            className={`flex-1 py-1 px-2 rounded text-[9px] font-bold border transition-all flex items-center justify-center gap-1 ${
              showOutages
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>OUTAGES ({NETWORK_OUTAGES.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Active Outages & Degradation Monitor */}
      <div className="p-3 rounded-xl bg-slate-950/70 border border-amber-500/30 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="font-bold tracking-wider text-[11px]">ACTIVE INCIDENTS & OUTAGES</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        </div>

        <div className="space-y-2">
          {NETWORK_OUTAGES.map((outage) => (
            <div
              key={outage.id}
              className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 transition-all group"
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-bold text-slate-200 text-[11px] group-hover:text-amber-300 transition-colors">
                  {outage.island} ({outage.atoll})
                </span>
                <span
                  className={`px-1 py-0.2 rounded text-[8px] font-bold ${
                    outage.severity === 'DEGRADED'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : outage.severity === 'STANDBY_POWER'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  }`}
                >
                  {outage.severity}
                </span>
              </div>

              <div className="text-[10px] text-slate-300 mb-1 leading-relaxed">
                <span className="text-slate-400 font-semibold">{outage.operator}:</span> {outage.cause}
              </div>

              <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-800/60">
                <span className="text-amber-400/90 font-medium">ETA: {outage.etaRecovery}</span>
                <button
                  onClick={() => handleLocateOutage(outage)}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline font-semibold"
                >
                  <span>LOCATE ON MAP</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Subsea Fiber Pipelines Beyond EEZ */}
      <div className="p-3 rounded-xl bg-slate-950/70 border border-purple-500/30 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-purple-400">
            <Network className="w-3.5 h-3.5" />
            <span className="font-bold tracking-wider text-[11px]">SUBSEA CABLES (1ST LANDING AWAY)</span>
          </div>
          <span className="text-[9px] text-slate-400">{SUBMARINE_CABLES_GEOJSON.features.length} Systems</span>
        </div>

        <div className="space-y-1.5">
          {SUBMARINE_CABLES_GEOJSON.features.map((c) => {
            const props = c.properties;
            if (!props) return null;
            return (
              <div
                key={props.id}
                onClick={() => handleInspectCable(c)}
                className="p-2 rounded bg-slate-900/80 border border-slate-800 hover:border-purple-500/60 hover:bg-slate-850 cursor-pointer transition-all flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: props.color }}
                    />
                    <span className="font-bold text-slate-200 text-[10px]">{props.name}</span>
                  </div>
                  <span className="text-[9px] font-bold text-purple-300">{props.capacityTbps} Tbps</span>
                </div>
                <div className="flex items-center justify-between text-[9px] text-slate-400 pl-3.5">
                  <span className="truncate max-w-[200px]">1st Landing: {props.firstLandingStationsAway}</span>
                  <span className="text-emerald-400 font-semibold">{props.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. International & National Cable Landing Gateways */}
      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Server className="w-3.5 h-3.5" />
            <span className="font-bold tracking-wider text-[11px]">CABLE LANDING STATIONS</span>
          </div>
          <span className="text-[9px] text-slate-400">{CABLE_LANDING_STATIONS.length} Stations</span>
        </div>

        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          {CABLE_LANDING_STATIONS.map((station) => (
            <div
              key={station.id}
              onClick={() => handleInspectStation(station)}
              className="p-1.5 rounded bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-850 cursor-pointer transition-all flex items-center justify-between text-[10px]"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    station.isInternational ? 'bg-purple-400' : 'bg-emerald-400'
                  }`}
                />
                <span className="font-medium text-slate-200 truncate">{station.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[9px] text-slate-400">{station.country}</span>
                <span className="text-[9px] font-bold text-cyan-300 font-mono">
                  {station.latencyToMaleMs !== undefined ? `${station.latencyToMaleMs}ms` : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Latency Benchmarks */}
      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-2 text-slate-300 text-[11px] font-bold">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Activity className="w-3.5 h-3.5" />
            <span>SUBSEA FIBER LATENCY BENCHMARKS</span>
          </div>
          <span className="text-[9px] text-slate-400 font-normal">From Malé City</span>
        </div>

        <div className="space-y-1 text-[10px]">
          {TELECOM_HEALTH_METRICS.latencyBenchmarks.map((b) => (
            <div
              key={b.destination}
              className="flex items-center justify-between p-1.5 rounded bg-slate-900/60 border border-slate-800/60"
            >
              <span className="text-slate-300 font-medium">{b.destination}</span>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-emerald-400 font-bold">{b.pingMs} ms</span>
                <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {b.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
