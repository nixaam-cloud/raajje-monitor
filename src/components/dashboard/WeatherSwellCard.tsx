'use client';

import React, { useState } from 'react';
import { WeatherTelemetry, WeatherStationTelemetry } from '@/app/api/weather/route';
import { useMonitorStore } from '@/store/useMonitorStore';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import {
  Waves,
  Compass,
  Thermometer,
  AlertTriangle,
  Wind,
  ShieldAlert,
  Radio,
  Clock,
  Crosshair,
  Gauge,
  Droplets,
  CloudSun,
} from 'lucide-react';

interface WeatherSwellCardProps {
  weather?: WeatherTelemetry;
}

export default function WeatherSwellCard({ weather }: WeatherSwellCardProps) {
  const { setFlyToTarget } = useMonitorStore();
  const { playClick, playTargetLock } = useSoundEffects();
  const [selectedStationId, setSelectedStationId] = useState<string>('all');

  if (!weather) {
    return (
      <div className="p-4 text-center text-slate-500 font-mono text-xs">
        Loading real-time marine meteorological telemetry...
      </div>
    );
  }

  const { marine, mmsAlert, surgeRiskByZone, stations = [] } = weather;

  const handleFocusZone = (zoneName: string) => {
    playClick();
    if (zoneName.includes('Northern')) {
      setFlyToTarget({ coordinates: [73.1, 6.4], zoom: 8.5, pitch: 25 });
    } else if (zoneName.includes('Central')) {
      setFlyToTarget({ coordinates: [73.5, 4.0], zoom: 8.5, pitch: 25 });
    } else {
      setFlyToTarget({ coordinates: [73.2, 0.2], zoom: 8.5, pitch: 25 });
    }
  };

  const activeStation: WeatherStationTelemetry | undefined =
    selectedStationId === 'all'
      ? undefined
      : stations.find((s) => s.id === selectedStationId);

  const handleFocusStation = (st: WeatherStationTelemetry) => {
    playTargetLock();
    setFlyToTarget({ coordinates: st.coordinates, zoom: 11, pitch: 35 });
  };

  // Determine alert badge & styling
  const isRed = mmsAlert.level === 'RED';
  const isOrange = mmsAlert.level === 'ORANGE';
  const isYellow = mmsAlert.level === 'YELLOW';
  const isWhite = mmsAlert.level === 'WHITE';

  const alertContainerClass = isRed
    ? 'bg-rose-950/40 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
    : isOrange
    ? 'bg-orange-950/40 border-orange-500/60 shadow-[0_0_15px_rgba(249,115,22,0.15)]'
    : isYellow
    ? 'bg-amber-950/40 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
    : 'bg-slate-900/60 border-cyan-500/40';

  const alertTitleClass = isRed
    ? 'text-rose-300'
    : isOrange
    ? 'text-orange-300'
    : isYellow
    ? 'text-amber-300'
    : 'text-cyan-300';

  const alertBadgeClass = isRed
    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
    : isOrange
    ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
    : isYellow
    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';

  // Current view metrics (either selected station or central overview)
  const displayWave = activeStation ? activeStation.waveHeightMeters : marine.waveHeightMeters;
  const displaySwell = activeStation ? activeStation.swellWaveHeightMeters : marine.swellWaveHeightMeters;
  const displayPeriod = activeStation ? activeStation.wavePeriodSeconds : marine.wavePeriodSeconds;
  const displayWind = activeStation ? activeStation.windSpeedKnots : marine.windSpeedKnots;
  const displayWindDir = activeStation ? `${activeStation.windDirectionDeg}° ${activeStation.windDirectionCompass}` : `${marine.windDirectionDeg}° ${marine.windDirectionCompass}`;
  const displayTemp = activeStation ? activeStation.temperatureC : (marine.seaSurfaceTempC ? (marine.seaSurfaceTempC - 0.5).toFixed(1) : '29.5');
  const displaySeaTemp = activeStation ? activeStation.seaSurfaceTempC : marine.seaSurfaceTempC;
  const displayLocation = activeStation ? `${activeStation.name} (${activeStation.atoll})` : marine.location;
  const displaySeaState = activeStation ? activeStation.seaState : 'Slight to Moderate';

  return (
    <div className="space-y-4 text-xs font-mono">
      {/* 1. MMS Official Weather Warning / Advisory Banner */}
      <div className={`p-3 rounded-lg border space-y-2 transition-all ${alertContainerClass}`}>
        <div className="flex items-center justify-between">
          <span className={`font-bold flex items-center gap-1.5 ${alertTitleClass}`}>
            <AlertTriangle className={`w-4 h-4 ${isRed || isYellow ? 'animate-pulse text-amber-400' : 'text-cyan-400'}`} />
            {mmsAlert.title}
          </span>
          <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${alertBadgeClass}`}>
            {mmsAlert.level} {mmsAlert.isActiveWarning ? 'ALERT' : 'ADVISORY'}
          </span>
        </div>

        {/* Dhivehi Official Headline */}
        {mmsAlert.dhivehiTitle && (
          <p className="text-[11px] text-slate-300/90 font-serif leading-relaxed text-right dir-rtl">
            {mmsAlert.dhivehiTitle}
          </p>
        )}

        {/* Phenomenon Synopsis */}
        <p className="text-[11px] text-slate-200/90 leading-relaxed font-sans">
          {mmsAlert.phenomenon}
        </p>

        {/* Operational Directive */}
        <div className="p-2 rounded bg-slate-950/70 border border-slate-800 text-[10px] text-slate-300">
          <span className="font-bold text-cyan-300">OPERATIONAL DIRECTIVE: </span>
          {mmsAlert.instructions}
        </div>

        {/* Real-time Validity Period */}
        <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            VALID: {mmsAlert.validFrom} ➔ {mmsAlert.validUntil}
          </span>
          <span className={mmsAlert.smallCraftAdvisory ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
            SMALL CRAFT: {mmsAlert.smallCraftAdvisory ? 'WARNING / RESTRICTED' : 'SAFE / NO BAN'}
          </span>
        </div>
      </div>

      {/* 2. National Meteorological Observation Stations Switcher */}
      {stations.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span className="flex items-center gap-1 font-bold text-slate-300">
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              LIVE MMS OBSERVATION STATIONS
            </span>
            <span>{weather.mvtTimestamp.slice(12)}</span>
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => {
                playClick();
                setSelectedStationId('all');
              }}
              className={`px-2 py-1 rounded text-[10px] whitespace-nowrap transition-colors border ${
                selectedStationId === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              CENTRAL OVERVIEW
            </button>
            {stations.map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  playClick();
                  setSelectedStationId(st.id);
                }}
                className={`px-2 py-1 rounded text-[10px] whitespace-nowrap transition-colors border ${
                  selectedStationId === st.id
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {st.name.replace(' Met Observatory', '').replace(' Regional Met Office', '').replace(' Headquarters / ', '').replace(' Oceanographic Telemetry Buoy', '')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Real-time Marine Swell & Meteorological Telemetry */}
      <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-slate-200">
          <span className="font-bold flex items-center gap-1.5 text-cyan-400">
            <Waves className="w-3.5 h-3.5" />
            REAL-TIME METEOROLOGICAL TELEMETRY
          </span>
          {activeStation ? (
            <button
              onClick={() => handleFocusStation(activeStation)}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/40"
              title="Fly to station on radar map"
            >
              <Crosshair className="w-3 h-3" />
              FOCUS
            </button>
          ) : (
            <span className="text-[10px] text-slate-400">{marine.coordinates[0]}°E, {marine.coordinates[1]}°N</span>
          )}
        </div>

        <div className="text-[11px] text-slate-300 font-medium">
          {displayLocation}
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          {/* Significant Wave Height */}
          <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>SIGNIFICANT WAVE</span>
              <span className="text-[9px] text-cyan-400 font-bold">{displaySeaState}</span>
            </div>
            <div className="text-cyan-300 font-bold text-sm font-mono-num">
              {displayWave} meters
            </div>
            <div className="text-[9px] text-slate-500 font-sans">Combined sea & swell</div>
          </div>

          {/* Primary Swell Component */}
          <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>SWELL COMPONENT</span>
              <span className="text-[9px] text-amber-400">{displayPeriod}s</span>
            </div>
            <div className="text-amber-300 font-bold text-sm font-mono-num">
              {displaySwell} meters
            </div>
            <div className="text-[9px] text-slate-500 font-sans">Swell Period: {displayPeriod}s</div>
          </div>

          {/* Ocean Wind Telemetry */}
          <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>OCEAN SURFACE WIND</span>
              <Wind className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="text-slate-200 font-bold text-sm font-mono-num">
              {displayWind} knots
            </div>
            <div className="text-[9px] text-slate-400 font-sans">Heading: {displayWindDir}</div>
          </div>

          {/* Sea Surface Temp */}
          <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>SEA SURFACE TEMP</span>
              <Thermometer className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="text-emerald-300 font-bold text-sm font-mono-num">
              {displaySeaTemp} °C
            </div>
            <div className="text-[9px] text-slate-500 font-sans">Air: {displayTemp}°C</div>
          </div>
        </div>

        {/* Tide & Astronomical Forecast */}
        <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/60 text-[10px]">
          <span className="text-slate-400 flex items-center gap-1">
            <Droplets className="w-3 h-3 text-cyan-400" />
            TIDE REGIME: {marine.tideStatus}
          </span>
          <span className="text-cyan-400 font-bold">NEXT HIGH: {marine.nextHighTide}</span>
        </div>
      </div>

      {/* 4. "Udha Erun" Coastal Surge Threat Index by Atoll Zone */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-slate-300">
          <span className="font-bold flex items-center gap-1.5 text-amber-400">
            <ShieldAlert className="w-3.5 h-3.5" />
            "UDHA" TIDAL SURGE THREAT INDEX
          </span>
          <span className="text-[10px] text-slate-400">DYNAMIC HAZARD MATRIX</span>
        </div>

        <div className="space-y-2">
          {surgeRiskByZone.map((zone) => {
            const isSevere = zone.riskLevel === 'SEVERE';
            const isElevated = zone.riskLevel === 'ELEVATED';

            return (
              <div
                key={zone.zone}
                onClick={() => handleFocusZone(zone.zone)}
                className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all space-y-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                    {zone.zone}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-slate-500">
                      Swell: {zone.swellHeight}m @ {zone.wavePeriod}s
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isSevere
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : isElevated
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {zone.riskLevel} ({zone.riskIndex}/100)
                    </span>
                  </div>
                </div>

                {/* Surge Index Progress Meter */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      isSevere ? 'bg-rose-500' : isElevated ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${zone.riskIndex}%` }}
                  />
                </div>

                <p className="text-[10px] text-slate-400 leading-snug">
                  {zone.warningDetails}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
