import { NextResponse } from 'next/server';

export interface MacroPulse {
  timestamp: string;
  tourism: {
    dailyArrivals: number;
    dailyTarget: number;
    yearToDateArrivals: number;
    annualTarget: number;
    resortOccupancyPct: number;
    guesthouseOccupancyPct: number;
    liveaboardOccupancyPct: number;
    topMarkets: { country: string; sharePct: number; arrivalsToday: number }[];
  };
  forex: {
    officialUsdMvr: number;
    parallelMarketBuy: number;
    parallelMarketSell: number;
    grossInternationalReservesUsdMillions: number;
    usableReservesUsdMillions: number;
    sovereignAlertStatus: 'STABLE' | 'MODERATE_PRESSURE' | 'CRITICAL';
  };
  supplyChain: {
    dieselFuelStockDays: number;
    stapleFoodReserveDays: number;
    containerThroughputTeuMonth: number;
    portWaitTimeDays: number;
  };
}

export async function GET() {
  const data: MacroPulse = {
    timestamp: new Date().toISOString(),
    tourism: {
      dailyArrivals: 5824,
      dailyTarget: 5200,
      yearToDateArrivals: 1492310,
      annualTarget: 2000000,
      resortOccupancyPct: 81.6,
      guesthouseOccupancyPct: 64.2,
      liveaboardOccupancyPct: 73.0,
      topMarkets: [
        { country: 'China', sharePct: 14.8, arrivalsToday: 862 },
        { country: 'Russia', sharePct: 11.2, arrivalsToday: 652 },
        { country: 'United Kingdom', sharePct: 9.4, arrivalsToday: 547 },
        { country: 'Italy', sharePct: 8.7, arrivalsToday: 506 },
        { country: 'Germany', sharePct: 7.3, arrivalsToday: 425 },
        { country: 'India', sharePct: 6.9, arrivalsToday: 401 },
      ],
    },
    forex: {
      officialUsdMvr: 15.42,
      parallelMarketBuy: 17.80,
      parallelMarketSell: 18.15,
      grossInternationalReservesUsdMillions: 612.4,
      usableReservesUsdMillions: 124.8,
      sovereignAlertStatus: 'MODERATE_PRESSURE',
    },
    supplyChain: {
      dieselFuelStockDays: 45,
      stapleFoodReserveDays: 60,
      containerThroughputTeuMonth: 8940,
      portWaitTimeDays: 2.8,
    },
  };

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
    },
  });
}
