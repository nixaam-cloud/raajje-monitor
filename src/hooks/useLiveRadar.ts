'use client';

import { useQuery } from '@tanstack/react-query';
import { MaritimeVessel } from '@/app/api/maritime/route';
import { AviationFlight } from '@/app/api/aviation/route';
import { WeatherTelemetry } from '@/app/api/weather/route';
import { NewsItem } from '@/app/api/news/route';
import { MacroPulse } from '@/app/api/macro/route';

interface MaritimeResponse {
  timestamp: string;
  source: string;
  stats: {
    total: number;
    tankers: number;
    cargo: number;
    safariBoats: number;
    rtlFerries: number;
    coastGuard: number;
    fishingDhonis: number;
    chokepoints: {
      eightDegreeChannel: number;
      oneAndHalfDegreeChannel: number;
      equatorialChannel: number;
      maleHarborCongestion: string;
    };
  };
  vessels: MaritimeVessel[];
}

interface AviationResponse {
  timestamp: string;
  source: string;
  stats: {
    totalAirborne: number;
    internationalWidebody: number;
    regionalTurboprop: number;
    seaplaneFloatplanes: number;
    runway18Status: string;
    seaplaneWaterTerminal: string;
  };
  flights: AviationFlight[];
}

interface NewsResponse {
  timestamp: string;
  count: number;
  feed: NewsItem[];
}

export function useLiveRadar() {
  const maritimeQuery = useQuery<MaritimeResponse>({
    queryKey: ['radar', 'maritime'],
    queryFn: async () => {
      const res = await fetch('/api/maritime');
      if (!res.ok) throw new Error('Failed to fetch maritime telemetry');
      return res.json();
    },
    refetchInterval: 12000,
  });

  const aviationQuery = useQuery<AviationResponse>({
    queryKey: ['radar', 'aviation'],
    queryFn: async () => {
      const res = await fetch('/api/aviation');
      if (!res.ok) throw new Error('Failed to fetch aviation radar');
      return res.json();
    },
    refetchInterval: 12000,
  });

  const weatherQuery = useQuery<WeatherTelemetry>({
    queryKey: ['radar', 'weather'],
    queryFn: async () => {
      const res = await fetch('/api/weather');
      if (!res.ok) throw new Error('Failed to fetch weather telemetry');
      return res.json();
    },
    refetchInterval: 25000,
  });

  const newsQuery = useQuery<NewsResponse>({
    queryKey: ['radar', 'news'],
    queryFn: async () => {
      const res = await fetch('/api/news');
      if (!res.ok) throw new Error('Failed to fetch live news');
      return res.json();
    },
    refetchInterval: 15000,
  });

  const macroQuery = useQuery<MacroPulse>({
    queryKey: ['radar', 'macro'],
    queryFn: async () => {
      const res = await fetch('/api/macro');
      if (!res.ok) throw new Error('Failed to fetch macro telemetry');
      return res.json();
    },
    refetchInterval: 60000,
  });

  const isInitialLoading =
    maritimeQuery.isLoading || aviationQuery.isLoading || weatherQuery.isLoading;

  return {
    maritime: maritimeQuery.data,
    aviation: aviationQuery.data,
    weather: weatherQuery.data,
    news: newsQuery.data,
    macro: macroQuery.data,
    isLoading: isInitialLoading,
    isRefetching: maritimeQuery.isFetching || aviationQuery.isFetching,
    isFetchingNews: newsQuery.isFetching,
    refetchNews: () => newsQuery.refetch(),
    refetchAll: () => {
      maritimeQuery.refetch();
      aviationQuery.refetch();
      weatherQuery.refetch();
      newsQuery.refetch();
      macroQuery.refetch();
    },
  };
}
