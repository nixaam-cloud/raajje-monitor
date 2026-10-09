'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useMonitorStore, EventAlert } from '@/store/useMonitorStore';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { NewsItem } from '@/app/api/news/route';
import { WeatherTelemetry } from '@/app/api/weather/route';
import {
  Radio,
  AlertTriangle,
  MapPin,
  ExternalLink,
  Crosshair,
  X,
  ShieldAlert,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface EventAlertBannerProps {
  news?: NewsItem[];
  weather?: WeatherTelemetry;
}

const SEEN_STORAGE_KEY = 'rm_seen_news_ids_v3';
const ALERT_TIMEOUT_MS = 12000;
// Only articles published within this window are considered "new events" worth alerting on
const FRESH_WINDOW_MS = 3 * 60 * 60 * 1000;

function isFreshArticle(item: NewsItem): boolean {
  // Curated fallback items have synthetic timestamps; never alert on them
  if (item.id.startsWith('local-news-') || item.id.startsWith('news-nat-')) return false;
  const ts = new Date(item.pubDate).getTime();
  if (!Number.isFinite(ts)) return false;
  const age = Date.now() - ts;
  // Reject stale items and items dated implausibly in the future
  return age >= -5 * 60 * 1000 && age <= FRESH_WINDOW_MS;
}

export default function EventAlertBanner({ news = [], weather }: EventAlertBannerProps) {
  const {
    activeAlerts,
    dismissAlert,
    addAlert,
    setLeftPanelOpen,
    setFlyToTarget,
    setSelectedEntity,
  } = useMonitorStore();

  const { playAlertChirp, playClick } = useSoundEffects();
  const seenIdsRef = useRef<Set<string>>(new Set());
  const isInitializedRef = useRef(false);
  const lastMmsAlertKeyRef = useRef<string>('');

  // 1. Initialize known news IDs from sessionStorage or seed with current news
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = sessionStorage.getItem(SEEN_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((id: string) => seenIdsRef.current.add(id));
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // 2. Detect incoming news items as soon as they appear in the feed
  useEffect(() => {
    if (!news || news.length === 0) return;

    // On very first page initialization:
    // If user has no saved history in this session, seed with existing news items so we don't alert all at once.
    if (!isInitializedRef.current) {
      if (seenIdsRef.current.size === 0) {
        news.forEach((item) => seenIdsRef.current.add(item.id));
        try {
          sessionStorage.setItem(
            SEEN_STORAGE_KEY,
            JSON.stringify(Array.from(seenIdsRef.current))
          );
        } catch {
          // ignore
        }
        isInitializedRef.current = true;
        return;
      }
      isInitializedRef.current = true;
    }

    // Inspect incoming news items for any unseen events
    const unseen = news.filter((item) => !seenIdsRef.current.has(item.id));

    if (unseen.length > 0) {
      // Everything unseen is remembered, but only genuinely fresh items trigger alerts
      unseen.forEach((item) => seenIdsRef.current.add(item.id));
      const newArrivals = unseen
        .filter(isFreshArticle)
        .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

      if (newArrivals.length > 0) {
        // Play audible alert warning chirp
        playAlertChirp();
      }

      // Dispatch alert for each new arrival (up to top 3 newest to avoid visual overload)
      newArrivals.slice(0, 3).forEach((item) => {

        const alert: EventAlert = {
          id: item.id,
          title: item.title,
          source: item.source,
          category: item.category,
          severity: item.severity,
          locationName: item.locationName,
          atollTag: item.atollTag,
          coordinates: item.coordinates,
          timestamp: item.pubDate,
          link: item.link,
          summary: item.summary,
          rawNews: item,
        };

        addAlert(alert);
      });

      // Update sessionStorage
      try {
        sessionStorage.setItem(
          SEEN_STORAGE_KEY,
          JSON.stringify(Array.from(seenIdsRef.current).slice(-200))
        );
      } catch {
        // ignore
      }
    }
  }, [news, addAlert, playAlertChirp]);

  // 3. Detect sudden MMS Weather Advisories / Warnings
  useEffect(() => {
    if (!weather?.mmsAlert) return;
    const mms = weather.mmsAlert;
    const alertKey = `${mms.level}-${mms.title}-${mms.isActiveWarning}`;

    if (!lastMmsAlertKeyRef.current) {
      lastMmsAlertKeyRef.current = alertKey;
      return;
    }

    if (lastMmsAlertKeyRef.current !== alertKey && (mms.level === 'ORANGE' || mms.level === 'RED' || mms.isActiveWarning)) {
      lastMmsAlertKeyRef.current = alertKey;
      playAlertChirp();
      addAlert({
        id: `mms-alert-${Date.now()}`,
        title: `MMS Weather Alert: ${mms.level} Warning Issued`,
        source: 'Maldives Meteorological Service',
        category: 'ENVIRONMENT',
        severity: mms.level === 'RED' ? 'CRITICAL' : 'ADVISORY',
        timestamp: new Date().toISOString(),
        summary: `${mms.title}. Severe weather condition in effect across affected atolls.`,
      });
    }
  }, [weather, addAlert, playAlertChirp]);

  const handleInspectNews = (alert: EventAlert) => {
    playClick();
    setLeftPanelOpen(true);
    setSelectedEntity({
      type: 'news',
      id: alert.id,
      title: alert.title,
      subtitle: `${alert.source} // ${new Date(alert.timestamp).toLocaleTimeString()}`,
      badge: {
        text: `${alert.category} // ${alert.severity}`,
        variant: alert.severity === 'CRITICAL' ? 'crimson' : 'amber',
      },
      coordinates: alert.coordinates,
      telemetry: {
        Source: alert.source,
        Category: alert.category,
        Severity: alert.severity,
        Published: new Date(alert.timestamp).toLocaleString(),
        Location: alert.locationName ? `${alert.locationName} (${alert.atollTag || 'Atoll'})` : (alert.atollTag || 'National'),
        Summary: alert.summary,
      },
      details: {
        externalUrl: alert.link,
      },
      raw: alert.rawNews,
    });
    dismissAlert(alert.id);
  };

  const handleFocusLocation = (alert: EventAlert) => {
    playClick();
    if (alert.coordinates) {
      setFlyToTarget({
        coordinates: alert.coordinates,
      });
    }
    handleInspectNews(alert);
  };

  if (!activeAlerts || activeAlerts.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      className="fixed top-12 right-2 sm:right-4 z-50 flex flex-col gap-2.5 max-w-[340px] sm:max-w-[420px] w-full pointer-events-none select-none transition-all"
    >
      {activeAlerts.map((alert) => (
        <AlertToastItem
          key={alert.id}
          alert={alert}
          onDismiss={() => dismissAlert(alert.id)}
          onInspect={() => handleInspectNews(alert)}
          onFocusMap={() => handleFocusLocation(alert)}
        />
      ))}
    </div>
  );
}

interface AlertToastItemProps {
  alert: EventAlert;
  onDismiss: () => void;
  onInspect: () => void;
  onFocusMap: () => void;
}

function AlertToastItem({ alert, onDismiss, onInspect, onFocusMap }: AlertToastItemProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  const isCritical = alert.severity === 'CRITICAL';
  const isAdvisory = alert.severity === 'ADVISORY';

  const accentColor = isCritical
    ? 'border-rose-500/80 shadow-[0_0_25px_rgba(244,63,94,0.4)]'
    : isAdvisory
    ? 'border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
    : 'border-cyan-500/70 shadow-[0_0_18px_rgba(6,182,212,0.25)]';

  const badgeBg = isCritical
    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    : isAdvisory
    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';

  // Auto-dismiss timer with pause on hover
  useEffect(() => {
    if (isPaused) return;

    const intervalMs = 100;
    const decrement = (intervalMs / ALERT_TIMEOUT_MS) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= decrement) {
          clearInterval(interval);
          onDismiss();
          return 0;
        }
        return prev - decrement;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isPaused, onDismiss]);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto relative overflow-hidden rounded-xl border bg-slate-950/95 backdrop-blur-xl p-3 sm:p-3.5 font-mono text-xs shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-3 ${accentColor}`}
    >
      {/* Top Banner Row */}
      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isCritical ? 'bg-rose-400' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isCritical ? 'bg-rose-500' : 'bg-amber-500'
              }`}
            />
          </span>

          <span className="font-bold text-[10px] tracking-wider text-slate-100 uppercase">
            {isCritical ? '🚨 CRITICAL BREAKING EVENT' : '⚡ INTELLIGENCE WIRE EVENT'}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${badgeBg}`}>
            {alert.category}
          </span>
          <button
            onClick={onDismiss}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 rounded transition-colors"
            title="Dismiss Alert"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="mt-2 space-y-1.5">
        <div className="flex items-baseline justify-between text-[10px] text-slate-400">
          <span className="font-semibold text-slate-300">{alert.source}</span>
          <span className="text-[9px] text-slate-500">
            {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <h4 className="font-bold text-xs sm:text-[13px] text-slate-100 line-clamp-2 leading-snug">
          {alert.title}
        </h4>

        {alert.locationName && (
          <div className="flex items-center gap-1 text-[10px] text-cyan-400">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">
              {alert.locationName} {alert.atollTag ? `(${alert.atollTag} Atoll)` : ''}
            </span>
          </div>
        )}

        {alert.summary && (
          <p className="text-[11px] text-slate-300/90 line-clamp-2 leading-relaxed">
            {alert.summary}
          </p>
        )}
      </div>

      {/* Bottom Action Controls */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <button
          onClick={onInspect}
          className="flex-1 flex items-center justify-center gap-1 py-1 px-2.5 rounded bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/50 text-cyan-300 font-bold text-[10px] transition-colors"
        >
          <span>VIEW WIRE</span>
          <ArrowRight className="w-3 h-3" />
        </button>

        {alert.coordinates && (
          <button
            onClick={onFocusMap}
            className="flex items-center justify-center gap-1 py-1 px-2.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[10px] transition-colors"
            title="Focus location on map"
          >
            <Crosshair className="w-3 h-3 text-amber-400" />
            <span>FOCUS</span>
          </button>
        )}

        {alert.link && (
          <a
            href={alert.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Read Source Article"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Countdown Progress Line */}
      <div className="absolute bottom-0 inset-x-0 h-0.5 bg-slate-800">
        <div
          className={`h-full transition-all duration-100 ${
            isCritical ? 'bg-rose-500' : 'bg-cyan-400'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
