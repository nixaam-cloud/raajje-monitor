'use client';

import React, { useState } from 'react';
import { useMonitorStore } from '@/store/useMonitorStore';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { NewsItem } from '@/app/api/news/route';
import {
  Rss,
  Search,
  MapPin,
  Clock,
  AlertTriangle,
  Radio,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import HorizontalScrollContainer from './HorizontalScrollContainer';
import { MALDIVES_ATOLLS } from '@/data/maldivesGeo';

interface LiveFeedPanelProps {
  news?: NewsItem[];
}

export default function LiveFeedPanel({ news = [] }: LiveFeedPanelProps) {
  const { leftPanelOpen, setLeftPanelOpen, setFlyToTarget, setSelectedEntity } = useMonitorStore();
  const { playClick, playTargetLock } = useSoundEffects();

  const [activeTab, setActiveTab] = useState<'all' | 'local'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  if (!leftPanelOpen) return null;

  const categories = ['ALL', 'LOCAL', 'DEFENSE', 'ENVIRONMENT', 'MARITIME', 'AVIATION', 'ECONOMY'];

  const localNewsCount = news.filter((item) => item.isLocal || item.category === 'LOCAL' || !!item.locationName).length;

  const filteredNews = news.filter((item) => {
    // 1. Tab level filter: if on 'local' tab, only show local island reports
    if (activeTab === 'local' && !(item.isLocal || item.category === 'LOCAL' || item.locationName)) {
      return false;
    }

    // 2. Search query filter
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(query) ||
      item.summary.toLowerCase().includes(query) ||
      (item.locationName && item.locationName.toLowerCase().includes(query)) ||
      (item.atollTag && item.atollTag.toLowerCase().includes(query));

    // 3. Category pill filter
    const matchesCategory =
      selectedCategory === 'ALL' ||
      (selectedCategory === 'LOCAL' ? (item.isLocal || item.category === 'LOCAL' || !!item.locationName) : item.category === selectedCategory);

    return matchesSearch && matchesCategory;
  });

  const handleLocationFocus = (item: NewsItem) => {
    playTargetLock();
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsMinimized(true);
    }

    if (item.coordinates) {
      setFlyToTarget({
        coordinates: item.coordinates,
        zoom: 13,
        pitch: 35,
      });
      return;
    }

    if (item.atollTag) {
      const matched = MALDIVES_ATOLLS.find(
        (a) =>
          a.name.toLowerCase().includes(item.atollTag!.toLowerCase()) ||
          a.capital.toLowerCase().includes(item.atollTag!.toLowerCase()) ||
          a.code.toLowerCase() === item.atollTag!.toLowerCase()
      );

      if (matched) {
        setFlyToTarget({
          coordinates: matched.coordinates,
          zoom: 10.5,
          pitch: 30,
        });
      }
    }
  };

  const handleSelectNews = (item: NewsItem) => {
    playTargetLock();
    setSelectedEntity({
      type: 'news',
      id: item.id,
      title: item.title,
      subtitle: `${item.source} // ${new Date(item.pubDate).toLocaleTimeString()}`,
      badge: {
        text: `${item.category} // ${item.severity}`,
        variant: item.severity === 'CRITICAL' ? 'crimson' : item.severity === 'ADVISORY' ? 'amber' : 'cyan',
      },
      coordinates: item.coordinates,
      telemetry: {
        Source: item.source,
        Category: item.category,
        Severity: item.severity,
        Published: new Date(item.pubDate).toLocaleString(),
        'Geo Location': item.locationName ? `${item.locationName} (${item.atollTag || 'Atoll'})` : (item.atollTag || 'National'),
        Summary: item.summary,
      },
      details: {
        externalUrl: item.link,
      },
      raw: item,
    });
  };

  return (
    <aside
      aria-label="Intelligence Wire"
      className={`absolute z-30 flex flex-col tactical-panel rounded-xl overflow-hidden border border-slate-800/90 shadow-2xl transition-all duration-300 w-[calc(100vw-16px)] sm:w-80 md:w-96 left-2 sm:left-4 ${
        isMinimized
          ? 'bottom-[calc(env(safe-area-inset-bottom,0px)+58px)] sm:bottom-20 h-12 border-cyan-500/50 bg-slate-950/95'
          : 'top-14 bottom-[calc(env(safe-area-inset-bottom,0px)+58px)] sm:bottom-20'
      }`}
    >
      {/* 1. Minimized / Peek Bar on mobile */}
      {isMinimized ? (
        <div
          onClick={() => {
            playClick();
            setIsMinimized(false);
          }}
          className="w-full h-full px-3 flex items-center justify-between cursor-pointer select-none text-xs font-mono bg-slate-950/90 hover:bg-slate-900/90 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              INTEL WIRE ({filteredNews.length})
            </span>
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
                setLeftPanelOpen(false);
              }}
              className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800/60"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 1. Panel Header & Live Indicator */}
          <div className="p-2.5 sm:p-3 border-b border-slate-800/80 bg-slate-950/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="font-mono font-bold text-xs tracking-wider text-slate-100 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                INTELLIGENCE WIRE
              </h2>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 font-semibold">
                GOOGLE NEWS
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {filteredNews.length}
              </span>

              {/* Minimize (View Map) Button */}
              <button
                onClick={() => {
                  playClick();
                  setIsMinimized(true);
                }}
                className="p-1 text-slate-400 hover:text-cyan-400 rounded hover:bg-slate-800/60 flex items-center gap-0.5 text-[10px] font-mono px-1"
                title="Minimize panel to view map"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  playClick();
                  setLeftPanelOpen(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800/60"
                title="Close panel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

      {/* 2. Top Feed Switcher Tabs: ALL INTEL vs LOCAL FEEDS */}
      <div className="grid grid-cols-2 border-b border-slate-800/90 bg-slate-950 text-xs font-mono select-none">
        <button
          onClick={() => {
            playClick();
            setActiveTab('all');
          }}
          className={`py-2 px-3 flex items-center justify-center gap-1.5 font-bold transition-all border-b-2 ${
            activeTab === 'all'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Rss className="w-3.5 h-3.5 text-cyan-400" />
          <span>ALL INTEL</span>
          <span className="text-[10px] text-slate-500 font-normal">({news.length})</span>
        </button>

        <button
          onClick={() => {
            playClick();
            setActiveTab('local');
          }}
          className={`py-2 px-3 flex items-center justify-center gap-1.5 font-bold transition-all border-b-2 ${
            activeTab === 'local'
              ? 'border-amber-400 text-amber-300 bg-amber-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>LOCAL FEEDS</span>
          <span className="text-[10px] text-amber-400/80 font-normal">({localNewsCount})</span>
        </button>
      </div>

      {/* 3. Search Bar & Category Filter Pills */}
      <div className="p-2.5 border-b border-slate-800/60 bg-slate-900/40 space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'local' ? "Search Hulhumalé, Malé, Addu..." : "Search intel, atolls, vessels..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs font-mono bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors"
          />
        </div>

        {/* Category Filter Pills with Drag & Indicators */}
        <HorizontalScrollContainer className="w-full pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                playClick();
                setSelectedCategory(cat);
              }}
              className={`px-2.5 py-0.5 text-[10px] font-mono rounded whitespace-nowrap transition-colors shrink-0 ${
                selectedCategory === cat
                  ? cat === 'LOCAL'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </HorizontalScrollContainer>
      </div>

      {/* 4. Filtered News Stream */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2 scrollbar-none">
        {filteredNews.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-mono text-xs space-y-1">
            <p>No dispatches match the current filter.</p>
            {activeTab === 'local' && (
              <p className="text-[10px] text-slate-600">Try searching for &quot;Hulhumalé&quot;, &quot;Malé&quot;, or &quot;Addu&quot;.</p>
            )}
          </div>
        ) : (
          filteredNews.map((item) => {
            const hasGeoLocation = !!item.locationName || !!item.coordinates;

            return (
              <div
                key={item.id}
                onClick={() => handleSelectNews(item)}
                className="p-3 rounded-lg bg-slate-900/50 hover:bg-slate-850/80 border border-slate-800/70 hover:border-slate-700 transition-all cursor-pointer group space-y-2 relative"
              >
                {/* Meta Header */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Severity Badge */}
                    {item.severity === 'CRITICAL' ? (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                        CRITICAL
                      </span>
                    ) : item.severity === 'ADVISORY' ? (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        ADVISORY
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-slate-800 text-slate-300">
                        DISPATCH
                      </span>
                    )}

                    {/* Category */}
                    <span className={`text-[10px] font-mono ${item.category === 'LOCAL' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                      [{item.category}]
                    </span>
                  </div>

                  {/* Geolocation Tag Button */}
                  {hasGeoLocation ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLocationFocus(item);
                      }}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300 transition-colors shadow-sm"
                      title={`Fly to ${item.locationName || item.atollTag} on map`}
                    >
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>{item.locationName || item.atollTag}</span>
                    </button>
                  ) : item.atollTag ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLocationFocus(item);
                      }}
                      className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 hover:underline"
                      title={`Focus on ${item.atollTag}`}
                    >
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      <span>{item.atollTag}</span>
                    </button>
                  ) : null}
                </div>

                {/* News Title */}
                <h3 className="text-xs font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors leading-snug">
                  {item.title}
                </h3>

                {/* News Summary */}
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-1.5 text-[10px] font-mono text-slate-400 border-t border-slate-800/40">
                  <span className="text-slate-400 font-medium truncate max-w-[130px]" title={item.source}>
                    {item.source}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(item.pubDate).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    
                    {/* Direct External Link to Google News / Publisher */}
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-0.5"
                        title="Read full article on original site"
                      >
                        <span className="text-[9px] text-cyan-400/90 font-mono">OPEN</span>
                        <ExternalLink className="w-2.5 h-2.5 text-cyan-400" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      </>
    )}
    </aside>
  );
}
