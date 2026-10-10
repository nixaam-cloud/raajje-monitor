'use client';

import React, { useState, useMemo } from 'react';
import { useMonitorStore } from '@/store/useMonitorStore';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import {
  X,
  Crosshair,
  Copy,
  ExternalLink,
  Ship,
  Plane,
  Network,
  MapPin,
  Rss,
  Check,
  CloudRain,
  Video,
  ChevronDown,
  ChevronUp,
  ArrowLeftRight,
  Wifi,
  AlertTriangle,
} from 'lucide-react';

export default function EntityDossierModal() {
  const {
    selectedEntity,
    setSelectedEntity,
    setFlyToTarget,
    leftPanelOpen,
    rightPanelOpen,
  } = useMonitorStore();
  const { playClick, playTargetLock } = useSoundEffects();
  const [copied, setCopied] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [dockSide, setDockSide] = useState<'auto' | 'left' | 'right'>('auto');

  // Compute non-overlapping dock side based on active panels
  const activeSide = useMemo(() => {
    if (dockSide === 'left') return 'left';
    if (dockSide === 'right') return 'right';

    // Auto-placement: avoid open intelligence wire or operations deck
    if (leftPanelOpen && !rightPanelOpen) return 'right';
    if (rightPanelOpen && !leftPanelOpen) return 'left';
    if (leftPanelOpen && rightPanelOpen) return 'center';
    return 'right'; // Default clean right dock when both side panels closed
  }, [dockSide, leftPanelOpen, rightPanelOpen]);

  // Position classes preventing panel collisions
  const positionClasses = useMemo(() => {
    const baseMobile = 'bottom-[calc(env(safe-area-inset-bottom,0px)+64px)] inset-x-2';

    if (activeSide === 'center') {
      return `${baseMobile} sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-24`;
    }
    if (activeSide === 'left') {
      return `${baseMobile} sm:inset-x-auto sm:left-3 md:left-6 sm:bottom-6 sm:right-auto`;
    }
    // Default right dock
    return `${baseMobile} sm:inset-x-auto sm:right-3 md:right-6 sm:bottom-6 sm:left-auto`;
  }, [activeSide]);

  if (!selectedEntity) return null;

  const handleClose = () => {
    playClick();
    setSelectedEntity(null);
  };

  const handleToggleMinimize = () => {
    playClick();
    setIsMinimized(!isMinimized);
  };

  const handleToggleSide = () => {
    playClick();
    setDockSide((prev) => {
      if (prev === 'auto') {
        return activeSide === 'left' ? 'right' : 'left';
      }
      return prev === 'left' ? 'right' : 'left';
    });
  };

  const handleLockRadar = () => {
    playTargetLock();
    if (selectedEntity.coordinates) {
      setFlyToTarget({
        coordinates: selectedEntity.coordinates,
      });
    }
  };

  const handleCopyJson = () => {
    playClick();
    navigator.clipboard.writeText(JSON.stringify(selectedEntity, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Icon by entity type
  const getIcon = () => {
    switch (selectedEntity.type) {
      case 'vessel':
        return <Ship className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'flight':
        return <Plane className="w-4 h-4 text-cyan-400 shrink-0" />;
      case 'cable':
        return <Network className="w-4 h-4 text-purple-400 shrink-0" />;
      case 'atoll':
        return <MapPin className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'weather':
        return <CloudRain className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'cctv':
        return <Video className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'telecom':
        return <Wifi className="w-4 h-4 text-cyan-400 shrink-0" />;
      case 'outage':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      default:
        return <Rss className="w-4 h-4 text-cyan-400 shrink-0" />;
    }
  };

  return (
    <div className={`fixed z-40 pointer-events-none flex flex-col justify-end select-none transition-all duration-300 ${positionClasses}`}>
      <div className="pointer-events-auto w-full sm:w-[380px] md:w-[410px] tactical-panel rounded-2xl border border-slate-700/80 shadow-[0_12px_45px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col backdrop-blur-xl bg-slate-950/95 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
        {/* Header Bar */}
        <div className="p-3 sm:p-3.5 border-b border-slate-800/90 bg-slate-950/90 flex items-center justify-between gap-2">
          <div
            onClick={handleToggleMinimize}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1 group"
            title="Click to minimize/expand telemetry"
          >
            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 shadow-inner shrink-0 group-hover:border-cyan-500/50 transition-colors">
              {getIcon()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-xs sm:text-sm text-slate-100 font-mono tracking-tight truncate group-hover:text-cyan-300 transition-colors">
                  {selectedEntity.title}
                </h3>
              </div>
              {selectedEntity.subtitle && (
                <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                  {selectedEntity.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {selectedEntity.coordinates && (
              <button
                onClick={handleLockRadar}
                title="Re-center radar on entity"
                className="p-1.5 text-cyan-400 hover:text-cyan-200 hover:bg-cyan-950/40 border border-cyan-800/40 rounded-lg transition-all"
              >
                <Crosshair className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleToggleSide}
              title={`Move dossier to ${activeSide === 'left' ? 'right' : 'left'} side`}
              className="hidden sm:flex p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 rounded-lg transition-colors"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleToggleMinimize}
              title={isMinimized ? 'Expand full dossier' : 'Minimize dossier'}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors"
            >
              {isMinimized ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <button
              onClick={handleClose}
              title="Close and deselect"
              className="p-1.5 text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors ml-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Badge & Quick Stats Strip (Always visible or compact) */}
        {selectedEntity.badge && (
          <div className="px-3 py-1.5 bg-slate-900/60 border-b border-slate-800/60 flex items-center justify-between text-[10px] font-mono">
            <span
              className={`px-2 py-0.5 font-bold rounded ${
                selectedEntity.badge.variant === 'crimson'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : selectedEntity.badge.variant === 'amber'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : selectedEntity.badge.variant === 'cyan'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : selectedEntity.badge.variant === 'purple'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {selectedEntity.badge.text}
            </span>

            {selectedEntity.coordinates && (
              <span className="text-slate-400 text-[9px] font-mono-num">
                {selectedEntity.coordinates[0].toFixed(3)}°E, {selectedEntity.coordinates[1].toFixed(3)}°N
              </span>
            )}
          </div>
        )}

        {/* Expandable Telemetry Matrix Grid */}
        {!isMinimized && (
          <>
            <div className="p-3 sm:p-3.5 overflow-y-auto space-y-2.5 font-mono text-xs max-h-[42vh] sm:max-h-[50vh]">
              <div className="flex items-center justify-between text-slate-400 text-[10px] border-b border-slate-800 pb-1">
                <span>TACTICAL TELEMETRY DOSSIER</span>
                <span className="text-cyan-400">COP-OPEN</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(selectedEntity.telemetry).map(([key, value]) => {
                  if (value === null || value === undefined) return null;
                  return (
                    <div
                      key={key}
                      className="p-2 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-0.5"
                    >
                      <div className="text-[9px] text-slate-400 uppercase tracking-wider truncate">
                        {key}
                      </div>
                      <div className="text-slate-100 font-semibold font-mono-num break-words text-[11px] leading-snug">
                        {String(value)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* External Links if applicable */}
              {selectedEntity.details?.externalUrl && (
                <a
                  href={selectedEntity.details.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-900 hover:bg-slate-850 text-cyan-400 hover:text-cyan-300 border border-slate-800 transition-colors text-[11px] font-mono"
                >
                  <span>View Source Publication</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-2.5 border-t border-slate-800/90 bg-slate-950/90 flex items-center justify-between gap-2">
              <button
                onClick={handleCopyJson}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px] font-mono transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'COPIED' : 'COPY JSON'}</span>
              </button>

              <button
                onClick={handleLockRadar}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 text-[10px] font-mono font-bold transition-all"
              >
                <Crosshair className="w-3 h-3 text-cyan-400" />
                <span>CENTER RADAR</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
