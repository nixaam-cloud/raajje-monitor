'use client';

import React from 'react';
import { MacroPulse } from '@/app/api/macro/route';
import {
  TrendingUp,
  DollarSign,
  Palmtree,
  Fuel,
  Users,
  Building,
  ShieldAlert,
} from 'lucide-react';

interface TourismMacroCardProps {
  macro?: MacroPulse;
}

export default function TourismMacroCard({ macro }: TourismMacroCardProps) {
  if (!macro) {
    return (
      <div className="p-4 text-center text-slate-500 font-mono text-xs">
        Loading macroeconomic pulse...
      </div>
    );
  }

  const { tourism, forex, supplyChain } = macro;
  const targetPct = ((tourism.yearToDateArrivals / tourism.annualTarget) * 100).toFixed(1);

  return (
    <div className="space-y-4 text-xs font-mono">
      {/* 1. National Tourism Arrival Pulse */}
      <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-slate-200">
          <span className="font-bold flex items-center gap-1.5 text-emerald-400">
            <Palmtree className="w-3.5 h-3.5" />
            TOURISM ARRIVAL VELOCITY
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            ON TRACK
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80">
            <div className="text-[10px] text-slate-400">TODAY ARRIVALS</div>
            <div className="text-emerald-300 font-bold text-sm font-mono-num">
              {tourism.dailyArrivals.toLocaleString()} pax
            </div>
            <div className="text-[9px] text-slate-500">Target: {tourism.dailyTarget.toLocaleString()}</div>
          </div>

          <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80">
            <div className="text-[10px] text-slate-400">YTD ARRIVALS</div>
            <div className="text-slate-100 font-bold text-sm font-mono-num">
              {(tourism.yearToDateArrivals / 1000000).toFixed(2)}M
            </div>
            <div className="text-[9px] text-emerald-400 font-bold">{targetPct}% of 2.0M Target</div>
          </div>
        </div>

        {/* Progress Bar towards 2M Benchmark */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>ANNUAL PROGRESS</span>
            <span className="text-slate-300">{tourism.yearToDateArrivals.toLocaleString()} / 2,000,000</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${targetPct}%` }}
            />
          </div>
        </div>

        {/* Occupancy Stats */}
        <div className="grid grid-cols-3 gap-1 pt-1 text-center text-[10px] text-slate-300">
          <div className="p-1 rounded bg-slate-950/50">
            <div className="text-slate-500">RESORTS</div>
            <div className="font-bold text-emerald-400">{tourism.resortOccupancyPct}%</div>
          </div>
          <div className="p-1 rounded bg-slate-950/50">
            <div className="text-slate-500">GUESTHOUSES</div>
            <div className="font-bold text-slate-200">{tourism.guesthouseOccupancyPct}%</div>
          </div>
          <div className="p-1 rounded bg-slate-950/50">
            <div className="text-slate-500">SAFARI BOATS</div>
            <div className="font-bold text-cyan-400">{tourism.liveaboardOccupancyPct}%</div>
          </div>
        </div>
      </div>

      {/* 2. Top Source Markets */}
      <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-slate-200">
          <span className="font-bold flex items-center gap-1.5 text-cyan-400">
            <Users className="w-3.5 h-3.5" />
            TOP INBOUND SOURCE MARKETS
          </span>
          <span className="text-[10px] text-slate-400">SHARE %</span>
        </div>

        <div className="space-y-1.5">
          {tourism.topMarkets.map((m) => (
            <div key={m.country} className="space-y-0.5">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>{m.country}</span>
                <span className="text-cyan-400 font-bold">{m.sharePct}% ({m.arrivalsToday} pax)</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full"
                  style={{ width: `${m.sharePct * 5}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Forex & Sovereign Reserves */}
      <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-slate-200">
          <span className="font-bold flex items-center gap-1.5 text-amber-400">
            <DollarSign className="w-3.5 h-3.5" />
            USD / MVR EXCHANGE TELEMETRY
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
            PEG 15.42
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80">
            <div className="text-[10px] text-slate-400">MMA OFFICIAL RATE</div>
            <div className="text-slate-100 font-bold text-sm font-mono-num">
              15.42 MVR
            </div>
            <div className="text-[9px] text-slate-500">Government Fixed Peg</div>
          </div>

          <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80">
            <div className="text-[10px] text-slate-400">PARALLEL MARKET</div>
            <div className="text-amber-400 font-bold text-sm font-mono-num">
              {forex.parallelMarketBuy.toFixed(2)} - {forex.parallelMarketSell.toFixed(2)}
            </div>
            <div className="text-[9px] text-amber-500 font-bold">+16.5% Premium</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] text-slate-400">
          <div>
            <div>GROSS FX RESERVES:</div>
            <div className="font-bold text-slate-200">${forex.grossInternationalReservesUsdMillions}M USD</div>
          </div>
          <div>
            <div>USABLE RESERVES:</div>
            <div className="font-bold text-amber-400">${forex.usableReservesUsdMillions}M USD</div>
          </div>
        </div>
      </div>

      {/* 4. Strategic Supply Chain Reserves */}
      <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between text-slate-300 text-[11px]">
          <span className="font-bold flex items-center gap-1.5 text-slate-200">
            <Fuel className="w-3.5 h-3.5 text-cyan-400" />
            NATIONAL STRATEGIC BUFFER
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
          <div>
            <span>DIESEL FUEL STOCK: </span>
            <span className="text-emerald-400 font-bold">{supplyChain.dieselFuelStockDays} DAYS</span>
          </div>
          <div>
            <span>STAPLE FOOD STOCK: </span>
            <span className="text-emerald-400 font-bold">{supplyChain.stapleFoodReserveDays} DAYS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
