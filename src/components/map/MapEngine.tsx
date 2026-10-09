'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMonitorStore, SelectedEntity } from '@/store/useMonitorStore';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { MaritimeVessel } from '@/app/api/maritime/route';
import { AviationFlight } from '@/app/api/aviation/route';
import {
  MALDIVES_ATOLLS,
  STRATEGIC_CHOKEPOINTS,
  MALDIVES_AIRPORTS,
  MALDIVES_PORTS,
  MALDIVES_EEZ_GEOJSON,
  MALDIVES_BOUNDS,
} from '@/data/maldivesGeo';
import { SUBMARINE_CABLES_GEOJSON, CABLE_LANDING_STATIONS } from '@/data/cablesGeoJson';
import { WeatherTelemetry } from '@/app/api/weather/route';
import {
  WEATHER_ZONES_GEOJSON,
  WEATHER_ZONE_LABELS_GEOJSON,
  WEATHER_SWELL_GEOJSON,
  WEATHER_STATIONS,
} from '@/data/weatherGeoJson';
import { NewsItem } from '@/app/api/news/route';
import { CloudRain } from 'lucide-react';
import MapControls from './MapControls';
import { resolveAirline, formatFlightNumber, formatShortRoute } from '@/utils/airlineLogos';
import { MALDIVES_CCTV_FEEDS } from '@/data/cctvFeeds';

// Geographic Airport Coordinates Catalog for Route Paths
const GLOBAL_AIRPORT_COORDS: Record<string, { name: string; code: string; coords: [number, number] }> = {
  // Maldives Airports
  MLE: { name: 'Velana International', code: 'MLE', coords: [73.5290, 4.1918] },
  VRMM: { name: 'Velana International', code: 'MLE', coords: [73.5290, 4.1918] },
  GAN: { name: 'Gan International', code: 'GAN', coords: [73.1556, -0.6933] },
  VRMG: { name: 'Gan International', code: 'GAN', coords: [73.1556, -0.6933] },
  HAQ: { name: 'Hanimaadhoo International', code: 'HDK', coords: [73.1694, 6.7464] },
  HDK: { name: 'Hanimaadhoo International', code: 'HDK', coords: [73.1694, 6.7464] },
  VRMH: { name: 'Hanimaadhoo International', code: 'HDK', coords: [73.1694, 6.7464] },
  NMF: { name: 'Maafaru International', code: 'NMF', coords: [73.4725, 5.8236] },
  VRDA: { name: 'Maafaru International', code: 'NMF', coords: [73.4725, 5.8236] },
  DRV: { name: 'Dharavandhoo Airport', code: 'DRV', coords: [73.1306, 5.1583] },
  VRMD: { name: 'Dharavandhoo Airport', code: 'DRV', coords: [73.1306, 5.1583] },
  VAM: { name: 'Villa Maamigili Airport', code: 'VAM', coords: [72.8361, 3.4722] },
  VRMV: { name: 'Villa Maamigili Airport', code: 'VAM', coords: [72.8361, 3.4722] },
  IFU: { name: 'Ifuru Domestic Airport', code: 'IFU', coords: [73.0256, 5.7078] },
  VREI: { name: 'Ifuru Domestic Airport', code: 'IFU', coords: [73.0256, 5.7078] },
  KDO: { name: 'Kadhdhoo Airport', code: 'KDO', coords: [73.5200, 1.8592] },
  VRMK: { name: 'Kadhdhoo Airport', code: 'KDO', coords: [73.5200, 1.8592] },
  GKK: { name: 'Kooddoo Airport', code: 'GKK', coords: [73.4333, 0.7308] },
  VRMO: { name: 'Kooddoo Airport', code: 'GKK', coords: [73.4333, 0.7308] },
  FVM: { name: 'Fuvahmulah Airport', code: 'FVM', coords: [73.4319, -0.2975] },
  VRMR: { name: 'Fuvahmulah Airport', code: 'FVM', coords: [73.4319, -0.2975] },
  KDM: { name: 'Kaadedhdhoo Airport', code: 'KDM', coords: [72.9961, 0.4892] },
  VRMT: { name: 'Kaadedhdhoo Airport', code: 'KDM', coords: [72.9961, 0.4892] },
  DDD: { name: 'Dhaalu Kudahuvadhoo', code: 'DDD', coords: [72.8944, 2.6711] },
  VRMU: { name: 'Dhaalu Kudahuvadhoo', code: 'DDD', coords: [72.8944, 2.6711] },
  TMF: { name: 'Thimarafushi Airport', code: 'TMF', coords: [73.1522, 2.2100] },
  VRNT: { name: 'Thimarafushi Airport', code: 'TMF', coords: [73.1522, 2.2100] },
  KHA: { name: 'Kulhudhuffushi Airport', code: 'KHA', coords: [73.0681, 6.6231] },
  VRUK: { name: 'Kulhudhuffushi Airport', code: 'KHA', coords: [73.0681, 6.6231] },

  // Middle East
  DXB: { name: 'Dubai', code: 'DXB', coords: [55.3644, 25.2528] },
  SHJ: { name: 'Sharjah', code: 'SHJ', coords: [55.5172, 25.3286] },
  AUH: { name: 'Abu Dhabi', code: 'AUH', coords: [54.6511, 24.4331] },
  DOH: { name: 'Doha Hamad', code: 'DOH', coords: [51.6081, 25.2731] },
  JED: { name: 'Jeddah', code: 'JED', coords: [39.1565, 21.6796] },
  RUH: { name: 'Riyadh', code: 'RUH', coords: [46.6988, 24.9576] },
  DMM: { name: 'Dammam', code: 'DMM', coords: [49.7978, 26.4712] },
  MCT: { name: 'Muscat', code: 'MCT', coords: [58.2844, 23.5933] },
  BAH: { name: 'Bahrain', code: 'BAH', coords: [50.6336, 26.2708] },
  KWI: { name: 'Kuwait', code: 'KWI', coords: [47.9783, 29.2267] },

  // South Asia
  CMB: { name: 'Colombo', code: 'CMB', coords: [79.8841, 7.1808] },
  DEL: { name: 'Delhi', code: 'DEL', coords: [77.1000, 28.5562] },
  BOM: { name: 'Mumbai', code: 'BOM', coords: [72.8679, 19.0896] },
  BLR: { name: 'Bengaluru', code: 'BLR', coords: [77.7066, 13.1986] },
  MAA: { name: 'Chennai', code: 'MAA', coords: [80.1693, 12.9941] },
  TRV: { name: 'Thiruvananthapuram', code: 'TRV', coords: [76.9200, 8.4821] },
  COK: { name: 'Cochin', code: 'COK', coords: [76.4019, 10.1520] },

  // Southeast Asia & Far East
  SIN: { name: 'Singapore Changi', code: 'SIN', coords: [103.9915, 1.3644] },
  KUL: { name: 'Kuala Lumpur', code: 'KUL', coords: [101.7099, 2.7456] },
  BKK: { name: 'Bangkok', code: 'BKK', coords: [100.7501, 13.6900] },
  DMK: { name: 'Bangkok Don Mueang', code: 'DMK', coords: [100.6067, 13.9125] },
  HKG: { name: 'Hong Kong', code: 'HKG', coords: [113.9145, 22.3080] },
  ICN: { name: 'Seoul Incheon', code: 'ICN', coords: [126.4407, 37.4602] },
  PVG: { name: 'Shanghai Pudong', code: 'PVG', coords: [121.8053, 31.1443] },
  CAN: { name: 'Guangzhou', code: 'CAN', coords: [113.2988, 23.3924] },

  // Central Asia & Europe
  NQZ: { name: 'Astana', code: 'NQZ', coords: [71.4669, 51.0222] },
  ALA: { name: 'Almaty', code: 'ALA', coords: [76.9831, 43.3521] },
  VIE: { name: 'Vienna', code: 'VIE', coords: [16.5697, 48.1103] },
  LHR: { name: 'London Heathrow', code: 'LHR', coords: [-0.4543, 51.4700] },
  LGW: { name: 'London Gatwick', code: 'LGW', coords: [-0.1903, 51.1537] },
  CDG: { name: 'Paris CDG', code: 'CDG', coords: [2.5500, 49.0097] },
  FRA: { name: 'Frankfurt', code: 'FRA', coords: [8.5622, 50.0379] },
  MUC: { name: 'Munich', code: 'MUC', coords: [11.7861, 48.3537] },
  ZRH: { name: 'Zurich', code: 'ZRH', coords: [8.5492, 47.4582] },
  MXP: { name: 'Milan Malpensa', code: 'MXP', coords: [8.7231, 45.6301] },
  FCO: { name: 'Rome Fiumicino', code: 'FCO', coords: [12.2389, 41.8003] },
  IST: { name: 'Istanbul', code: 'IST', coords: [28.7424, 41.2612] },
  SVO: { name: 'Moscow Sheremetyevo', code: 'SVO', coords: [37.4146, 55.9726] },
  DME: { name: 'Moscow Domodedovo', code: 'DME', coords: [37.9061, 55.4086] },

  // Australia & Indian Ocean
  PER: { name: 'Perth', code: 'PER', coords: [115.9672, -31.9403] },
  SYD: { name: 'Sydney', code: 'SYD', coords: [151.1772, -33.9461] },
  MEL: { name: 'Melbourne', code: 'MEL', coords: [144.8433, -37.6733] },
  MRU: { name: 'Mauritius', code: 'MRU', coords: [57.6836, -20.4302] },
  SEZ: { name: 'Seychelles', code: 'SEZ', coords: [55.5218, -4.6743] },
};

const GLOBAL_PORT_COORDS: Record<string, { name: string; code: string; coords: [number, number] }> = {
  MALE: { name: 'Malé Harbor', code: 'MLE', coords: [73.5042, 4.1795] },
  THILAFUSHI: { name: 'Thilafushi', code: 'THF', coords: [73.4475, 4.1819] },
  KULHUDHUFFUSHI: { name: 'Kulhudhuffushi Port', code: 'KRP', coords: [73.0650, 6.6210] },
  HITHADHOO: { name: 'Hithadhoo / Addu', code: 'HRP', coords: [73.0850, -0.6010] },
  FELIVARU: { name: 'Felivaru Fisheries Port', code: 'FLV', coords: [73.4850, 5.4750] },
  HANIFARU: { name: 'Hanifaru Bay', code: 'HNF', coords: [73.1550, 5.1700] },
  RASDHOO: { name: 'Rasdhoo Lagoon', code: 'RSD', coords: [72.9900, 4.2600] },
  SOUTH_ARI: { name: 'South Ari MPA', code: 'SAM', coords: [72.8800, 3.5200] },
  SINGAPORE: { name: 'Singapore', code: 'SGP', coords: [103.8500, 1.2500] },
  TANJUNG_PELEPAS: { name: 'Tanjung Pelepas', code: 'TPP', coords: [103.5500, 1.3600] },
  COLOMBO: { name: 'Colombo Port', code: 'CMB', coords: [79.8500, 6.9400] },
  RAS_TANURA: { name: 'Ras Tanura', code: 'RTN', coords: [50.1500, 26.6500] },
  RAS_LAFFAN: { name: 'Ras Laffan', code: 'RLF', coords: [51.5500, 25.9000] },
  RUWAIS: { name: 'Ruwais', code: 'RUW', coords: [52.7300, 24.1200] },
  ROTTERDAM: { name: 'Rotterdam', code: 'RTM', coords: [4.4000, 51.9000] },
  TOKYO: { name: 'Tokyo Bay', code: 'TKY', coords: [139.7500, 35.6000] },
  EIGHT_DEGREE_WEST: { name: 'Eight Degree Channel (W)', code: '8DC-W', coords: [71.2000, 7.2000] },
  EIGHT_DEGREE_EAST: { name: 'Eight Degree Channel (E)', code: '8DC-E', coords: [75.2000, 7.2000] },
  ONE_AND_HALF_WEST: { name: '1.5° Channel (W)', code: '1.5-W', coords: [71.5000, 1.5000] },
  ONE_AND_HALF_EAST: { name: '1.5° Channel (E)', code: '1.5-E', coords: [75.0000, 1.5000] },
};

function extractAirportCoords(codeOrStr?: string): { name: string; code: string; coords: [number, number] } | null {
  if (!codeOrStr) return null;
  const clean = codeOrStr.toUpperCase().trim();
  if (GLOBAL_AIRPORT_COORDS[clean]) return GLOBAL_AIRPORT_COORDS[clean];

  const match = clean.match(/\b([A-Z]{3,4})\b/);
  if (match && GLOBAL_AIRPORT_COORDS[match[1]]) {
    return GLOBAL_AIRPORT_COORDS[match[1]];
  }

  return null;
}

function resolveFlightRouteEndpoints(flight: AviationFlight): {
  pointA: { name: string; code: string; coords: [number, number] };
  pointB: { name: string; code: string; coords: [number, number] };
} {
  const isSeaplane = flight.aircraftCategory === 'SEAPLANE_TWIN_OTTER';
  const currentCoords = flight.coordinates;
  const velanaCoords: [number, number] = [73.5290, 4.1918];

  // 1. Resolve Point A (Origin)
  let origin = extractAirportCoords(flight.originCode) || extractAirportCoords(flight.origin);

  if (isSeaplane) {
    if (!origin) {
      if (flight.destinationCode === 'MLE' || (flight.destination && flight.destination.includes('MLE'))) {
        const rad = ((flight.headingDeg || 180) * Math.PI) / 180;
        const distDeg = 0.45;
        const lat = currentCoords[1] - Math.cos(rad) * distDeg;
        const lng = currentCoords[0] - Math.sin(rad) * distDeg;
        origin = { name: 'Atoll Resort Lagoon', code: 'RESORT', coords: [Number(lng.toFixed(4)), Number(lat.toFixed(4))] };
      } else {
        origin = { name: 'Velana Seaplane Base', code: 'MLE', coords: velanaCoords };
      }
    }
  }

  if (!origin) {
    if (flight.flightDirection === 'OUTBOUND') {
      origin = { name: 'Velana International', code: 'MLE', coords: velanaCoords };
    } else {
      const rad = ((flight.headingDeg || 180) * Math.PI) / 180;
      const distDeg = 1.2;
      const cosLat = Math.max(0.2, Math.cos((currentCoords[1] * Math.PI) / 180));
      const lat = currentCoords[1] - Math.cos(rad) * distDeg;
      const lng = currentCoords[0] - (Math.sin(rad) * distDeg) / cosLat;
      origin = { name: flight.originCode || 'Airway Entry', code: flight.originCode || 'ENTRY', coords: [Number(lng.toFixed(4)), Number(lat.toFixed(4))] };
    }
  }

  // 2. Resolve Point B (Destination)
  let dest = extractAirportCoords(flight.destinationCode) || extractAirportCoords(flight.destination);

  if (isSeaplane) {
    if (!dest) {
      if (origin.code === 'MLE') {
        const rad = ((flight.headingDeg || 0) * Math.PI) / 180;
        const distDeg = 0.45;
        const lat = currentCoords[1] + Math.cos(rad) * distDeg;
        const lng = currentCoords[0] + Math.sin(rad) * distDeg;
        dest = { name: 'Atoll Resort Lagoon', code: 'RESORT', coords: [Number(lng.toFixed(4)), Number(lat.toFixed(4))] };
      } else {
        dest = { name: 'Velana Seaplane Base', code: 'MLE', coords: velanaCoords };
      }
    }
  }

  if (!dest) {
    if (flight.flightDirection === 'INBOUND') {
      dest = { name: 'Velana International', code: 'MLE', coords: velanaCoords };
    } else {
      const rad = ((flight.headingDeg || 0) * Math.PI) / 180;
      const distDeg = 1.5;
      const cosLat = Math.max(0.2, Math.cos((currentCoords[1] * Math.PI) / 180));
      const lat = currentCoords[1] + Math.cos(rad) * distDeg;
      const lng = currentCoords[0] + (Math.sin(rad) * distDeg) / cosLat;
      dest = { name: flight.destinationCode || 'Airway Exit', code: flight.destinationCode || 'EXIT', coords: [Number(lng.toFixed(4)), Number(lat.toFixed(4))] };
    }
  }

  return { pointA: origin, pointB: dest };
}

function resolveVesselRouteEndpoints(vessel: MaritimeVessel): {
  pointA: { name: string; code: string; coords: [number, number] };
  pointB: { name: string; code: string; coords: [number, number] };
} {
  const origUpper = (vessel.origin || '').toUpperCase();
  const destUpper = (vessel.destination || '').toUpperCase();
  const currentCoords = vessel.coordinates;

  let origin = Object.values(GLOBAL_PORT_COORDS).find((p) => origUpper.includes(p.code) || origUpper.includes(p.name.toUpperCase()));
  let dest = Object.values(GLOBAL_PORT_COORDS).find((p) => destUpper.includes(p.code) || destUpper.includes(p.name.toUpperCase()));

  if (!origin) {
    const rad = ((vessel.cog || 0) * Math.PI) / 180;
    const distDeg = 0.8;
    const cosLat = Math.max(0.2, Math.cos((currentCoords[1] * Math.PI) / 180));
    const lat = currentCoords[1] - Math.cos(rad) * distDeg;
    const lng = currentCoords[0] - (Math.sin(rad) * distDeg) / cosLat;
    origin = { name: vessel.origin || 'Sea Lane Entry', code: 'ORIGIN', coords: [Number(lng.toFixed(4)), Number(lat.toFixed(4))] };
  }

  if (!dest) {
    const rad = ((vessel.cog || 0) * Math.PI) / 180;
    const distDeg = 1.0;
    const cosLat = Math.max(0.2, Math.cos((currentCoords[1] * Math.PI) / 180));
    const lat = currentCoords[1] + Math.cos(rad) * distDeg;
    const lng = currentCoords[0] + (Math.sin(rad) * distDeg) / cosLat;
    dest = { name: vessel.destination || 'Sea Lane Exit', code: 'DEST', coords: [Number(lng.toFixed(4)), Number(lat.toFixed(4))] };
  }

  return { pointA: origin, pointB: dest };
}

function interpolateStraightRoute(p1: [number, number], p2: [number, number], segments = 10): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const lng = p1[0] + (p2[0] - p1[0]) * t;
    const lat = p1[1] + (p2[1] - p1[1]) * t;
    pts.push([Number(lng.toFixed(5)), Number(lat.toFixed(5))]);
  }
  return pts;
}

interface MapEngineProps {
  vessels?: MaritimeVessel[];
  flights?: AviationFlight[];
  weather?: WeatherTelemetry;
  news?: NewsItem[];
}

export default function MapEngine({ vessels = [], flights = [], weather, news = [] }: MapEngineProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Markers refs to allow smooth in-place telemetry position updates without DOM thrashing
  const vesselMarkersRef = useRef<Map<string, { marker: maplibregl.Marker; el: HTMLElement }>>(new Map());
  const flightMarkersRef = useRef<Map<string, { marker: maplibregl.Marker; el: HTMLElement }>>(new Map());
  const weatherMarkersRef = useRef<Map<string, { marker: maplibregl.Marker; el: HTMLElement }>>(new Map());
  const newsMarkersRef = useRef<Map<string, { marker: maplibregl.Marker; el: HTMLElement }>>(new Map());
  const cctvMarkersRef = useRef<Map<string, { marker: maplibregl.Marker; el: HTMLElement }>>(new Map());
  const lastMarkerClickTimeRef = useRef<number>(0);
  const latestFlightsRef = useRef<Map<string, AviationFlight>>(new Map());

  const {
    showVessels,
    showFlights,
    showWeatherAlerts,
    showCables,
    showPortsAndAirports,
    showEEZBoundary,
    showChokepoints,
    showRadarSweep,
    showCCTV,
    selectedCCTVId,
    setSelectedCCTVId,
    flyToTarget,
    setFlyToTarget,
    selectedEntity,
    setSelectedEntity,
  } = useMonitorStore();

  const { playTargetLock } = useSoundEffects();

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    if (typeof window !== 'undefined') {
      maplibregl.setWorkerUrl('/lib/maplibre/maplibre-gl-worker.mjs');
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: MALDIVES_BOUNDS.center,
      zoom: MALDIVES_BOUNDS.defaultZoom,
      minZoom: 2.8,
      maxZoom: 16,
      pitch: 20,
      attributionControl: false,
    });

    map.on('error', (e) => {
      console.warn('MapLibre status/error:', e);
    });

    map.on('load', () => {
      // 1. Add EEZ GeoJSON Source & Layers
      map.addSource('maldives-eez', {
        type: 'geojson',
        data: MALDIVES_EEZ_GEOJSON,
      });

      map.addLayer({
        id: 'eez-polygon-fill',
        type: 'fill',
        source: 'maldives-eez',
        paint: {
          'fill-color': '#06b6d4',
          'fill-opacity': 0.04,
        },
      });

      map.addLayer({
        id: 'eez-glow',
        type: 'line',
        source: 'maldives-eez',
        paint: {
          'line-color': '#10b981',
          'line-width': 5,
          'line-opacity': 0.25,
          'line-blur': 4,
        },
      });

      map.addLayer({
        id: 'eez-polygon-line',
        type: 'line',
        source: 'maldives-eez',
        paint: {
          'line-color': '#10b981',
          'line-width': 2,
          'line-dasharray': [4, 2],
          'line-opacity': 0.85,
        },
      });

      // Sector labels along EEZ boundary
      const eezSectorFeatures: GeoJSON.FeatureCollection<GeoJSON.Point> = {
        type: 'FeatureCollection',
        features: [
          { type: 'Feature', properties: { title: 'MALDIVES EEZ // 8°N NORTHERN SLOC' }, geometry: { type: 'Point', coordinates: [73.5, 7.95] } },
          { type: 'Feature', properties: { title: 'MALDIVES EEZ // EASTERN CORRIDOR (200 NM)' }, geometry: { type: 'Point', coordinates: [76.3, 3.2] } },
          { type: 'Feature', properties: { title: 'MALDIVES EEZ // SOUTHERN CHAGOS BORDER' }, geometry: { type: 'Point', coordinates: [73.3, -2.65] } },
          { type: 'Feature', properties: { title: 'MALDIVES EEZ // WESTERN ARABIAN SEA FLANK' }, geometry: { type: 'Point', coordinates: [70.7, 3.5] } },
        ],
      };
      map.addSource('eez-labels', { type: 'geojson', data: eezSectorFeatures });
      map.addLayer({
        id: 'eez-labels-text',
        type: 'symbol',
        source: 'eez-labels',
        layout: {
          'text-field': ['get', 'title'],
          'text-font': ['Open Sans Semibold'],
          'text-size': 10,
          'text-letter-spacing': 0.15,
        },
        paint: {
          'text-color': '#10b981',
          'text-halo-color': '#030712',
          'text-halo-width': 2,
        },
      });

      // 2. Add Submarine Cables GeoJSON
      map.addSource('subsea-cables', {
        type: 'geojson',
        data: SUBMARINE_CABLES_GEOJSON,
      });

      map.addLayer({
        id: 'cables-glow',
        type: 'line',
        source: 'subsea-cables',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 4.5,
          'line-opacity': 0.35,
          'line-blur': 3,
        },
      });

      map.addLayer({
        id: 'cables-line',
        type: 'line',
        source: 'subsea-cables',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 1.8,
          'line-opacity': 0.85,
        },
      });

      // 3. Add Strategic Chokepoints
      const chokepointFeatures: GeoJSON.FeatureCollection<GeoJSON.LineString> = {
        type: 'FeatureCollection',
        features: STRATEGIC_CHOKEPOINTS.map((cp) => ({
          type: 'Feature',
          properties: {
            id: cp.id,
            name: cp.name,
            dhivehi: cp.dhivehiName,
            importance: cp.strategicImportance,
          },
          geometry: {
            type: 'LineString',
            coordinates: cp.coordinates,
          },
        })),
      };

      map.addSource('sloc-chokepoints', {
        type: 'geojson',
        data: chokepointFeatures,
      });

      map.addLayer({
        id: 'chokepoints-lines',
        type: 'line',
        source: 'sloc-chokepoints',
        paint: {
          'line-color': '#f59e0b',
          'line-width': 1.5,
          'line-dasharray': [6, 6],
          'line-opacity': 0.65,
        },
      });

      // 4. Add Atolls GeoJSON
      const atollFeatures: GeoJSON.FeatureCollection<GeoJSON.Point> = {
        type: 'FeatureCollection',
        features: MALDIVES_ATOLLS.map((atoll) => ({
          type: 'Feature',
          properties: {
            id: atoll.id,
            code: atoll.code,
            name: atoll.name,
            dhivehi: atoll.dhivehiName,
            capital: atoll.capital,
            vulnerability: atoll.hazardVulnerability,
            zone: atoll.zone,
          },
          geometry: {
            type: 'Point',
            coordinates: atoll.coordinates,
          },
        })),
      };

      map.addSource('maldives-atolls', {
        type: 'geojson',
        data: atollFeatures,
      });

      map.addLayer({
        id: 'atolls-circles',
        type: 'circle',
        source: 'maldives-atolls',
        paint: {
          'circle-radius': 5,
          'circle-color': '#334155',
          'circle-stroke-width': 1,
          'circle-stroke-color': '#64748b',
          'circle-opacity': 0.8,
        },
      });

      map.addLayer({
        id: 'atolls-labels',
        type: 'symbol',
        source: 'maldives-atolls',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 10,
          'text-offset': [0, 1.2],
          'text-anchor': 'top',
          'text-optional': true,
        },
        paint: {
          'text-color': '#94a3b8',
          'text-halo-color': '#07090e',
          'text-halo-width': 1.5,
        },
      });

      // Click on atolls
      map.on('click', 'atolls-circles', (e) => {
        if (!e.features || e.features.length === 0) return;
        if (Date.now() - lastMarkerClickTimeRef.current < 500) return;
        const feat = e.features[0];
        const props = feat.properties as any;
        const geom = feat.geometry as GeoJSON.Point;

        playTargetLock();
        setSelectedEntity({
          type: 'atoll',
          id: props.id,
          title: props.name,
          subtitle: `Capital: ${props.capital} // Code: ${props.code}`,
          badge: {
            text: `${props.zone} ATOLL // RISK: ${props.vulnerability}`,
            variant: props.vulnerability === 'CRITICAL' ? 'crimson' : 'amber',
          },
          coordinates: geom.coordinates as [number, number],
          telemetry: {
            Zone: props.zone,
            Capital: props.capital,
            Code: props.code,
            Dhivehi: props.dhivehi,
            SurgeRisk: props.vulnerability,
          },
        });
      });

      // 5. Add MMS Weather Risk Zones GeoJSON & Layers
      map.addSource('mms-weather-zones', {
        type: 'geojson',
        data: WEATHER_ZONES_GEOJSON,
      });

      map.addLayer({
        id: 'weather-zones-fill',
        type: 'fill',
        source: 'mms-weather-zones',
        layout: {
          visibility: showWeatherAlerts ? 'visible' : 'none',
        },
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.08,
        },
      });

      map.addLayer({
        id: 'weather-zones-line',
        type: 'line',
        source: 'mms-weather-zones',
        layout: {
          visibility: showWeatherAlerts ? 'visible' : 'none',
        },
        paint: {
          'line-color': ['get', 'lineColor'],
          'line-width': 1.6,
          'line-dasharray': [4, 4],
          'line-opacity': 0.75,
        },
      });

      // Weather Zone Label Points (positioned in western territorial waters)
      map.addSource('mms-weather-zone-labels', {
        type: 'geojson',
        data: WEATHER_ZONE_LABELS_GEOJSON,
      });

      map.addLayer({
        id: 'weather-zones-labels',
        type: 'symbol',
        source: 'mms-weather-zone-labels',
        layout: {
          visibility: showWeatherAlerts ? 'visible' : 'none',
          'text-field': ['concat', '⚠️ ', ['get', 'name'], '\n[ ', ['get', 'status'], ' ]'],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 9,
          'text-offset': [0.5, 0],
          'text-anchor': 'left',
          'text-optional': true,
        },
        paint: {
          'text-color': ['get', 'color'],
          'text-halo-color': '#07090e',
          'text-halo-width': 2,
        },
      });

      // 6. Add Ocean Swell & Monsoon Flow Corridors
      map.addSource('mms-weather-swell', {
        type: 'geojson',
        data: WEATHER_SWELL_GEOJSON,
      });

      map.addLayer({
        id: 'weather-swell-glow',
        type: 'line',
        source: 'mms-weather-swell',
        layout: {
          visibility: showWeatherAlerts ? 'visible' : 'none',
        },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 3.5,
          'line-opacity': 0.25,
          'line-blur': 2,
        },
      });

      map.addLayer({
        id: 'weather-swell-lines',
        type: 'line',
        source: 'mms-weather-swell',
        layout: {
          visibility: showWeatherAlerts ? 'visible' : 'none',
        },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 1.6,
          'line-dasharray': [6, 4],
          'line-opacity': 0.85,
        },
      });

      map.addLayer({
        id: 'weather-swell-labels',
        type: 'symbol',
        source: 'mms-weather-swell',
        layout: {
          visibility: showWeatherAlerts ? 'visible' : 'none',
          'symbol-placement': 'line',
          'text-field': ['concat', '🌊 ', ['get', 'name'], ' // ', ['get', 'telemetry']],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 9,
          'text-offset': [0, -0.9],
          'text-max-angle': 30,
        },
        paint: {
          'text-color': ['get', 'color'],
          'text-halo-color': '#07090e',
          'text-halo-width': 1.5,
        },
      });

      // Click on Weather Zone Labels (click zone title badge instead of full ocean polygon)
      map.on('click', 'weather-zones-labels', (e) => {
        if (!e.features || e.features.length === 0) return;
        if (Date.now() - lastMarkerClickTimeRef.current < 500) return;
        const feat = e.features[0];
        const props = feat.properties as any;
        playTargetLock();
        setSelectedEntity({
          type: 'weather',
          id: props.id,
          title: props.name,
          subtitle: props.status,
          badge: {
            text: `${props.riskLevel} SWELL SURGE`,
            variant: props.riskLevel === 'SEVERE' ? 'crimson' : 'amber',
          },
          coordinates: [e.lngLat.lng, e.lngLat.lat],
          telemetry: {
            'Surveillance Zone': props.name,
            'Advisory Status': props.status,
            'Risk Level': props.riskLevel,
            'Wave Forecast': props.waves,
            'Surface Wind': props.wind,
            'MMS Alert Level': props.riskLevel === 'SEVERE' ? 'SEVERE SURGE WARNING' : 'YELLOW ADVISORY',
            'Marine Safety': props.riskLevel === 'SEVERE' ? 'COASTAL INUNDATION HAZARD' : 'SMALL CRAFT PROHIBITED IN CHANNELS',
          },
        });
      });

      map.on('mouseenter', 'weather-zones-labels', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'weather-zones-labels', () => {
        map.getCanvas().style.cursor = '';
      });

      // 7. Add Selected Entity Path Source & Layers (Historical Track + Heading Vector)
      map.addSource('selected-entity-path', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // Soft ambient glow for the path
      map.addLayer({
        id: 'selected-path-glow',
        type: 'line',
        source: 'selected-entity-path',
        filter: ['==', '$type', 'LineString'],
        paint: {
          'line-color': ['coalesce', ['get', 'color'], '#38bdf8'],
          'line-width': ['coalesce', ['get', 'glowWidth'], 6],
          'line-opacity': ['coalesce', ['get', 'glowOpacity'], 0.22],
          'line-blur': 4,
        },
      });

      // Faint tactical track line
      map.addLayer({
        id: 'selected-path-line',
        type: 'line',
        source: 'selected-entity-path',
        filter: ['==', '$type', 'LineString'],
        paint: {
          'line-color': ['coalesce', ['get', 'color'], '#38bdf8'],
          'line-width': ['coalesce', ['get', 'lineWidth'], 1.8],
          'line-opacity': ['coalesce', ['get', 'lineOpacity'], 0.65],
          'line-dasharray': [2, 3],
        },
      });

      // Subtle waypoint dots along the path
      map.addLayer({
        id: 'selected-path-points',
        type: 'circle',
        source: 'selected-entity-path',
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-radius': ['coalesce', ['get', 'radius'], 4],
          'circle-color': ['coalesce', ['get', 'color'], '#38bdf8'],
          'circle-opacity': 0.85,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#020617',
        },
      });

      // Waypoint text labels for Origin (A) and Destination (B)
      map.addLayer({
        id: 'selected-path-labels',
        type: 'symbol',
        source: 'selected-entity-path',
        filter: ['all', ['==', '$type', 'Point'], ['has', 'label']],
        layout: {
          'text-field': ['get', 'label'],
          'text-font': ['Open Sans Semibold'],
          'text-size': 10,
          'text-offset': [0, 1.4],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': ['coalesce', ['get', 'color'], '#38bdf8'],
          'text-halo-color': '#030712',
          'text-halo-width': 2.5,
        },
      });

      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [playTargetLock, setSelectedEntity]);

  // Handle layer visibility sync
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // EEZ
    if (map.getLayer('eez-polygon-fill') && map.getLayer('eez-polygon-line')) {
      const visibility = showEEZBoundary ? 'visible' : 'none';
      map.setLayoutProperty('eez-polygon-fill', 'visibility', visibility);
      map.setLayoutProperty('eez-polygon-line', 'visibility', visibility);
      if (map.getLayer('eez-glow')) map.setLayoutProperty('eez-glow', 'visibility', visibility);
      if (map.getLayer('eez-labels-text')) map.setLayoutProperty('eez-labels-text', 'visibility', visibility);
    }

    // Cables
    if (map.getLayer('cables-line') && map.getLayer('cables-glow')) {
      const visibility = showCables ? 'visible' : 'none';
      map.setLayoutProperty('cables-line', 'visibility', visibility);
      map.setLayoutProperty('cables-glow', 'visibility', visibility);
    }

    // Chokepoints
    if (map.getLayer('chokepoints-lines')) {
      const visibility = showChokepoints ? 'visible' : 'none';
      map.setLayoutProperty('chokepoints-lines', 'visibility', visibility);
    }

    // Weather Zones & Swell Flow Corridors
    const weatherVisibility = showWeatherAlerts ? 'visible' : 'none';
    const weatherLayerIds = [
      'weather-zones-fill',
      'weather-zones-line',
      'weather-zones-labels',
      'weather-swell-glow',
      'weather-swell-lines',
      'weather-swell-labels',
    ];
    weatherLayerIds.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', weatherVisibility);
      }
    });
  }, [showEEZBoundary, showCables, showChokepoints, showWeatherAlerts, mapLoaded]);

  // Weather Observation Station Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (!showWeatherAlerts) {
      weatherMarkersRef.current.forEach(({ marker }) => marker.remove());
      weatherMarkersRef.current.clear();
      return;
    }

    // Always clear existing markers so fresh real-time values are rendered
    weatherMarkersRef.current.forEach(({ marker }) => marker.remove());
    weatherMarkersRef.current.clear();

    const stationsList = weather?.stations && weather.stations.length > 0
      ? weather.stations
      : WEATHER_STATIONS.map((ws) => ({
          id: ws.id,
          code: ws.code,
          name: ws.name,
          atoll: ws.atoll,
          zone: ws.zone,
          coordinates: ws.coordinates,
          temperatureC: 29.5,
          feelsLikeC: 33.0,
          humidityPercent: 72,
          pressureHpa: 1011.8,
          skyCondition: 'Fair',
          weatherCode: 1,
          windSpeedKnots: 8.5,
          windGustKnots: 12.0,
          windDirectionDeg: 60,
          windDirectionCompass: 'ENE',
          waveHeightMeters: 0.8,
          swellWaveHeightMeters: 0.6,
          wavePeriodSeconds: 9.2,
          seaState: 'Slight',
          seaSurfaceTempC: 30.2,
          surgeRiskIndex: 28,
          surgeRiskLevel: 'LOW' as const,
          alertLevel: 'WHITE' as const,
          observationTime: 'Real-time',
        }));

    stationsList.forEach((station) => {
      const isRed = station.alertLevel === 'RED';
      const isOrange = station.alertLevel === 'ORANGE';
      const isYellow = station.alertLevel === 'YELLOW';
      const pinColor = isRed ? '#f43f5e' : isOrange ? '#f97316' : isYellow ? '#f59e0b' : '#06b6d4';

      const el = document.createElement('div');
      el.className = 'weather-station-marker cursor-pointer group relative';
      el.style.width = '24px';
      el.style.height = '24px';

      el.innerHTML = `
        <div class="relative w-full h-full flex items-center justify-center">
          <span class="animate-ping absolute inline-flex h-4 w-4 rounded-full opacity-60" style="background-color: ${pinColor}"></span>
          <div class="relative w-5 h-5 rounded-full bg-slate-950 border flex items-center justify-center shadow-lg" style="border-color: ${pinColor}; box-shadow: 0 0 10px ${pinColor}66;">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="${pinColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
            </svg>
          </div>
        </div>
        <div class="flex absolute left-7 -top-2 z-30 flex-col bg-slate-950/95 border px-2 py-0.5 rounded shadow-xl text-[9px] font-mono leading-tight whitespace-nowrap pointer-events-none backdrop-blur-sm select-none" style="border-color: ${pinColor}80">
          <span class="font-bold tracking-tight" style="color: ${pinColor}">${station.name}</span>
          <span class="text-slate-300">WIND: ${station.windSpeedKnots} kts ${station.windDirectionCompass} // SWELL: ${station.waveHeightMeters}m</span>
        </div>
      `;

      el.addEventListener('pointerdown', (e) => e.stopPropagation());
      el.addEventListener('mousedown', (e) => e.stopPropagation());
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        lastMarkerClickTimeRef.current = Date.now();
        playTargetLock();
        setSelectedEntity({
          type: 'weather',
          id: station.id,
          title: station.name,
          subtitle: `${station.atoll} // AWS Station ID: ${station.code}`,
          badge: {
            text: `${station.alertLevel} // ${station.surgeRiskLevel} SURGE`,
            variant: isRed || isOrange ? 'crimson' : isYellow ? 'amber' : 'emerald',
          },
          coordinates: station.coordinates,
          telemetry: {
            'Station Name': station.name,
            'Station ID': station.code,
            'Atoll Sector': station.atoll,
            'Alert Level': `${station.alertLevel} ADVISORY`,
            'Air Temperature': `${station.temperatureC} °C`,
            'Wave Conditions': `${station.waveHeightMeters}m (Swell ${station.swellWaveHeightMeters}m @ ${station.wavePeriodSeconds}s)`,
            'Sea State': station.seaState,
            'Wind Speed': `${station.windSpeedKnots} kts (Gusts ${station.windGustKnots} kts)`,
            'Wind Direction': `${station.windDirectionDeg}° ${station.windDirectionCompass}`,
            'Atmospheric Pressure': `${station.pressureHpa} hPa`,
            'Sky Conditions': station.skyCondition,
            'Sea Surface Temp': `${station.seaSurfaceTempC} °C`,
            'Tidal Phase': weather?.marine?.tideStatus || 'Nominal',
            'Next High Tide': weather?.marine?.nextHighTide || 'Scheduled',
            'Surge Risk Index': `${station.surgeRiskIndex}/100 (${station.surgeRiskLevel})`,
            'Observation Time': station.observationTime,
          },
          raw: station,
        });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(station.coordinates)
        .addTo(map);

      weatherMarkersRef.current.set(station.id, { marker, el });
    });
  }, [showWeatherAlerts, mapLoaded, weather, playTargetLock, setSelectedEntity]);

  // News Incident & Local Story Geo-Located Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const geoTaggedNews = news.filter((item) => item.coordinates);
    const currentNewsIds = new Set(geoTaggedNews.map((item) => item.id));

    newsMarkersRef.current.forEach(({ marker }, id) => {
      if (!currentNewsIds.has(id)) {
        marker.remove();
        newsMarkersRef.current.delete(id);
      }
    });

    geoTaggedNews.forEach((item) => {
      if (newsMarkersRef.current.has(item.id)) return;

      const isCritical = item.severity === 'CRITICAL';
      const markerColor = isCritical ? '#f43f5e' : '#f59e0b';

      const el = document.createElement('div');
      el.className = 'news-marker cursor-pointer group relative';
      el.style.width = '24px';
      el.style.height = '24px';

      el.innerHTML = `
        <div class="relative w-full h-full flex items-center justify-center">
          <span class="animate-ping absolute inline-flex h-4 w-4 rounded-full opacity-60" style="background-color: ${markerColor}"></span>
          <div class="relative w-5 h-5 rounded-full bg-slate-950 border flex items-center justify-center shadow-lg transition-transform group-hover:scale-125" style="border-color: ${markerColor}; box-shadow: 0 0 10px ${markerColor}66;">
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="${markerColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        </div>
        <div class="hidden group-hover:flex absolute left-7 -top-2 z-40 flex-col bg-slate-950/95 border px-2 py-1 rounded shadow-xl text-[9px] font-mono leading-tight whitespace-nowrap pointer-events-none backdrop-blur-sm select-none" style="border-color: ${markerColor}80">
          <span class="font-bold tracking-tight" style="color: ${markerColor}">📍 ${item.locationName || item.atollTag || 'Incident'}</span>
          <span class="text-slate-200 line-clamp-1 max-w-[220px]">${item.title}</span>
        </div>
      `;

      el.addEventListener('pointerdown', (e) => e.stopPropagation());
      el.addEventListener('mousedown', (e) => e.stopPropagation());
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        lastMarkerClickTimeRef.current = Date.now();
        playTargetLock();
        setSelectedEntity({
          type: 'news',
          id: item.id,
          title: item.title,
          subtitle: `${item.source} // ${new Date(item.pubDate).toLocaleTimeString()}`,
          badge: {
            text: `${item.category} // ${item.severity}`,
            variant: isCritical ? 'crimson' : 'amber',
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
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(item.coordinates!)
        .addTo(map);

      newsMarkersRef.current.set(item.id, { marker, el });
    });
  }, [news, mapLoaded, playTargetLock, setSelectedEntity]);

  // Update Geolocated CCTV & Live Camera Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (!showCCTV) {
      cctvMarkersRef.current.forEach(({ marker }) => marker.remove());
      cctvMarkersRef.current.clear();
      return;
    }

    MALDIVES_CCTV_FEEDS.forEach((cam) => {
      if (cctvMarkersRef.current.has(cam.id)) return;

      const el = document.createElement('div');
      el.className = 'cctv-marker cursor-pointer group relative flex items-center justify-center select-none';
      el.style.width = '32px';
      el.style.height = '32px';

      el.innerHTML = `
        <!-- Directional Field of View (FOV) Radar Cone -->
        <div class="absolute pointer-events-none w-16 h-16 origin-center flex items-center justify-center -translate-y-2" style="transform: rotate(${cam.heading}deg);">
          <svg viewBox="0 0 100 100" class="w-full h-full opacity-35 group-hover:opacity-75 transition-opacity" style="color: #f43f5e;">
            <path d="M50 50 L18 0 A50 50 0 0 1 82 0 Z" fill="currentColor" fill-opacity="0.3" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2" />
          </svg>
        </div>

        <!-- Camera Pin Disc -->
        <div class="relative w-6 h-6 rounded-full bg-slate-950 border border-rose-500/80 flex items-center justify-center shadow-[0_0_12px_rgba(244,63,94,0.4)] group-hover:scale-115 group-hover:border-rose-400 transition-all z-10">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#f43f5e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m22 8-6 4 6 4V8Z"></path>
            <rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect>
          </svg>
          <span class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-950"></span>
        </div>

        <!-- Tactical Hover Tooltip -->
        <div class="hidden group-hover:flex absolute left-8 -top-2 z-40 flex-col bg-slate-950/95 border border-rose-500/60 px-2 py-1 rounded-lg shadow-2xl text-[9px] font-mono leading-tight whitespace-nowrap pointer-events-none backdrop-blur-md select-none">
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span class="font-bold text-slate-100">${cam.name}</span>
            <span class="px-1 py-0.2 rounded font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[8px]">${cam.category}</span>
          </div>
          <span class="text-slate-400 mt-0.5">${cam.locationName} (${cam.atoll}) // ${cam.resolution} @ ${cam.fps}FPS</span>
          <span class="text-[8px] text-cyan-400">HDG: ${cam.heading}° // CLICK TO STREAM LIVE</span>
        </div>
      `;

      el.addEventListener('pointerdown', (e) => e.stopPropagation());
      el.addEventListener('mousedown', (e) => e.stopPropagation());
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        lastMarkerClickTimeRef.current = Date.now();
        playTargetLock();
        setSelectedCCTVId(cam.id);
        setSelectedEntity({
          type: 'cctv',
          id: cam.id,
          title: cam.name,
          subtitle: `${cam.locationName} // ${cam.code}`,
          badge: {
            text: `${cam.category} // LIVE`,
            variant: 'crimson',
          },
          coordinates: cam.coordinates,
          telemetry: {
            'Camera ID': cam.code,
            Sector: cam.zone,
            Location: `${cam.locationName} (${cam.atoll} Atoll)`,
            Status: `${cam.status} (LIVE)`,
            Resolution: `${cam.resolution} @ ${cam.fps}fps`,
            Orientation: `${cam.heading}° (${cam.fov}° FOV)`,
            Sensor: cam.telemetry.sensorType,
            Enclosure: cam.telemetry.weatherResistance,
          },
          raw: cam,
        });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(cam.coordinates)
        .addTo(map);

      cctvMarkersRef.current.set(cam.id, { marker, el });
    });
  }, [showCCTV, mapLoaded, playTargetLock, setSelectedEntity, setSelectedCCTVId]);

  // Update Vessel Markers smoothly
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (!showVessels) {
      vesselMarkersRef.current.forEach(({ marker }) => marker.remove());
      vesselMarkersRef.current.clear();
      return;
    }

    const currentVesselIds = new Set(vessels.map((v) => v.id));

    // Remove obsolete markers
    vesselMarkersRef.current.forEach(({ marker }, id) => {
      if (!currentVesselIds.has(id)) {
        marker.remove();
        vesselMarkersRef.current.delete(id);
      }
    });

    // Add or update markers
    vessels.forEach((v) => {
      const existing = vesselMarkersRef.current.get(v.id);

      // Icon colors based on vessel class
      let accentColor = '#06b6d4'; // cargo cyan
      if (v.type === 'tanker') accentColor = '#f59e0b'; // amber
      if (v.type === 'coast_guard') accentColor = '#10b981'; // emerald
      if (v.type === 'rtl_ferry') accentColor = '#38bdf8'; // sky blue
      if (v.type === 'safari_boat') accentColor = '#a855f7'; // purple
      if (v.type === 'fishing_dhoni') accentColor = '#fbbf24'; // yellow
      if (v.isMilitary) accentColor = '#f43f5e'; // rose = military / naval

      if (existing) {
        existing.marker.setLngLat(v.coordinates);
        const icon = existing.el.querySelector('.vessel-icon') as HTMLElement | null;
        if (icon) {
          icon.style.transform = `rotate(${v.cog}deg)`;
        }
      } else {
        const el = document.createElement('div');
        el.className = 'vessel-marker cursor-pointer group relative';
        el.style.width = '24px';
        el.style.height = '24px';

        el.innerHTML = `
          <div class="vessel-icon w-full h-full flex items-center justify-center transition-transform duration-500" style="transform: rotate(${v.cog}deg);">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow-[0_0_8px_${accentColor}]">
              <polygon points="12 2 19 21 12 17 5 21 12 2" fill="${accentColor}" fill-opacity="0.3"></polygon>
            </svg>
          </div>
          <div class="hidden group-hover:flex absolute left-6 -top-2 z-50 flex-col bg-slate-950/95 border border-slate-700 px-2 py-1 rounded shadow-xl text-[10px] font-mono whitespace-nowrap pointer-events-none">
            <div class="flex items-center justify-between gap-2">
              <span class="text-white font-bold">${v.name}</span>
              <span class="text-[9px] px-1 py-0.2 rounded font-bold ${v.isMilitary ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : v.inEEZ ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'}">
                ${v.isMilitary ? 'MILITARY' : v.inEEZ ? 'MALDIVES EEZ' : 'SURROUNDING SLOC'}
              </span>
            </div>
            <span class="text-slate-400">${v.typeName} // SOG: ${v.sog} kts</span>
            <span class="text-[9px] text-slate-500">${v.zone}</span>
          </div>
        `;

        el.addEventListener('pointerdown', (e) => e.stopPropagation());
        el.addEventListener('mousedown', (e) => e.stopPropagation());
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          lastMarkerClickTimeRef.current = Date.now();
          playTargetLock();
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
              Category: v.typeName,
              'Speed (SOG)': `${v.sog} knots`,
              'Heading (COG)': `${v.cog}°`,
              Draft: `${v.draftMeters} m`,
              Dimensions: `${v.lengthMeters}m x ${v.beamMeters}m`,
              Status: v.navStatus,
              Origin: v.origin,
              Destination: v.destination,
              ETA: v.eta,
              Sector: v.zone,
              'Data Source': v.dataQuality === 'MODELED_OSINT' ? 'MODELED OSINT (not a live track)' : 'SIMULATED AIS',
            },
            raw: v,
          });
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(v.coordinates)
          .addTo(map);

        vesselMarkersRef.current.set(v.id, { marker, el });
      }
    });
  }, [vessels, showVessels, mapLoaded, playTargetLock, setSelectedEntity]);

  // Update Flight Markers smoothly
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (!showFlights) {
      flightMarkersRef.current.forEach(({ marker }) => marker.remove());
      flightMarkersRef.current.clear();
      return;
    }

    const currentFlightIds = new Set(flights.map((f) => f.id));

    flightMarkersRef.current.forEach(({ marker }, id) => {
      if (!currentFlightIds.has(id)) {
        marker.remove();
        flightMarkersRef.current.delete(id);
      }
    });

    flights.forEach((f) => latestFlightsRef.current.set(f.id, f));

    flights.forEach((f) => {
      const existing = flightMarkersRef.current.get(f.id);

      const isSeaplane = f.aircraftCategory === 'SEAPLANE_TWIN_OTTER';
      const flightColor = f.isMilitary ? '#f43f5e' : isSeaplane ? '#38bdf8' : '#06b6d4';
      const airline = resolveAirline(f.callsign, f.operator);
      const flightNumber = formatFlightNumber(f.callsign, airline);
      const shortRoute = formatShortRoute(f.origin, f.destination, f.originCode, f.destinationCode);
      const labelCode = f.isMilitary
        ? 'MIL'
        : (airline.code || f.callsign.slice(0, 2)).slice(0, 2).toUpperCase();

      const routeColorClass = f.isMilitary
        ? 'text-rose-400'
        : f.flightDirection === 'INBOUND'
          ? 'text-emerald-400'
          : f.flightDirection === 'OUTBOUND'
          ? 'text-amber-400'
          : f.flightDirection === 'DOMESTIC'
          ? 'text-purple-300'
          : 'text-slate-300';

      const routeText = f.isMilitary && (!shortRoute.from && !shortRoute.to)
        ? (f.airwaySector || 'PATROL AREA')
        : `${shortRoute.from || f.originCode || 'ORIG'} ➔ ${shortRoute.to || f.destinationCode || 'DEST'}`;

      if (existing) {
        existing.marker.setLngLat(f.coordinates);
        const icon = existing.el.querySelector('.flight-icon') as HTMLElement | null;
        if (icon) {
          icon.style.transform = `rotate(${f.headingDeg}deg)`;
        }
        const altEl = existing.el.querySelector('.flight-hover-alt') as HTMLElement | null;
        if (altEl) altEl.textContent = `${f.altitudeFt.toLocaleString()} ft`;
        const spdEl = existing.el.querySelector('.flight-hover-spd') as HTMLElement | null;
        if (spdEl) spdEl.textContent = `${f.velocityKts} kts`;
        const hdgEl = existing.el.querySelector('.flight-hover-hdg') as HTMLElement | null;
        if (hdgEl) hdgEl.textContent = `${f.headingDeg}°`;
        const phaseEl = existing.el.querySelector('.flight-hover-phase') as HTMLElement | null;
        if (phaseEl) phaseEl.textContent = f.flightPhase;
      } else {
        const el = document.createElement('div');
        el.className = 'flight-marker cursor-pointer group relative flex items-center select-none hover:z-50';
        el.style.width = '28px';
        el.style.height = '28px';

        el.innerHTML = `
          <div class="flight-icon w-full h-full flex items-center justify-center transition-transform duration-500" style="transform: rotate(${f.headingDeg}deg);">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="${flightColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow-[0_0_8px_${flightColor}]">
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" fill="${flightColor}" fill-opacity="0.35"></path>
            </svg>
          </div>

          <!-- Resting Compact Label (Only displays airline code like EK, Q2) -->
          <div class="flight-pill flex items-center gap-1 absolute left-6 -top-0.5 z-10 px-1 py-0.5 rounded bg-slate-950/85 border border-slate-700/80 shadow text-[9px] font-mono font-bold leading-none whitespace-nowrap pointer-events-auto backdrop-blur-sm transition-all group-hover:opacity-0 group-hover:pointer-events-none" style="border-left: 2px solid ${airline.brandColor}; color: ${flightColor};">
            <span>${labelCode}</span>
          </div>

          <!-- Hover Details Popover -->
          <div class="flight-hover-card hidden group-hover:flex flex-col absolute left-6 -top-3 z-50 bg-slate-950/95 border border-cyan-500/70 p-2.5 rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.85),0_0_15px_rgba(6,182,212,0.3)] text-[10px] font-mono whitespace-nowrap pointer-events-auto backdrop-blur-md min-w-[210px] max-w-[280px] gap-1.5 transition-all">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-1.5">
                <span class="px-1.5 py-0.5 rounded text-[8px] font-bold text-white shadow-sm shrink-0" style="background-color: ${airline.brandColor};">
                  ${labelCode}
                </span>
                <span class="text-white font-bold text-[11px] tracking-tight">${flightNumber}</span>
              </div>
              <span class="text-[8px] px-1 py-0.5 rounded font-bold uppercase ${f.isMilitary ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : f.flightDirection === 'INBOUND' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : f.flightDirection === 'OUTBOUND' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'}">
                ${f.isMilitary ? 'MILITARY' : f.flightDirection}
              </span>
            </div>

            <div class="flex items-center justify-between gap-2 text-[9px] text-slate-300 border-b border-slate-800/80 pb-1">
              <span class="truncate max-w-[125px] font-medium text-slate-200">${airline.name || f.operator}</span>
              <span class="text-slate-400 shrink-0 font-mono">${f.aircraftType}</span>
            </div>

            <div class="flex items-center justify-between text-[9px] text-slate-300">
              <span class="text-slate-500 font-semibold">ROUTE</span>
              <span class="font-bold ${routeColorClass}">${routeText}</span>
            </div>

            <div class="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] bg-slate-900/90 px-2 py-1.5 rounded border border-slate-800/90">
              <div class="flex items-center justify-between">
                <span class="text-slate-500">ALT</span>
                <span class="text-cyan-300 font-bold flight-hover-alt">${f.altitudeFt.toLocaleString()} ft</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">SPD</span>
                <span class="text-emerald-300 font-bold flight-hover-spd">${f.velocityKts} kts</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">HDG</span>
                <span class="text-slate-300 flight-hover-hdg">${f.headingDeg}°</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">PHASE</span>
                <span class="text-purple-300 font-bold flight-hover-phase">${f.flightPhase}</span>
              </div>
            </div>

            <div class="flex items-center justify-between text-[8px] text-cyan-400/90 pt-0.5 border-t border-slate-800/60">
              <span class="text-slate-400 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                Tracked
              </span>
              <span class="text-cyan-400 underline font-semibold flex items-center gap-0.5">Click for full dossier ➔</span>
            </div>
          </div>
        `;

        el.addEventListener('pointerdown', (e) => e.stopPropagation());
        el.addEventListener('mousedown', (e) => e.stopPropagation());
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          lastMarkerClickTimeRef.current = Date.now();
          playTargetLock();
          const targetFlight = latestFlightsRef.current.get(f.id) || f;
          setSelectedEntity({
            type: 'flight',
            id: targetFlight.id,
            title: `${targetFlight.callsign} // ${targetFlight.operator}`,
            subtitle: `${targetFlight.aircraftType} (${targetFlight.aircraftCategory})`,
            badge: {
              text: `${targetFlight.flightDirection} // ${targetFlight.flightPhase}`,
              variant: targetFlight.flightDirection === 'INBOUND' ? 'emerald' : targetFlight.flightDirection === 'OUTBOUND' ? 'amber' : 'cyan',
            },
            coordinates: targetFlight.coordinates,
            telemetry: {
              Callsign: targetFlight.callsign,
              ...(targetFlight.registration ? { 'Registration / Tail': targetFlight.registration } : {}),
              ...(targetFlight.flightNumber ? { 'Flight Number': targetFlight.flightNumber } : {}),
              ICAO24: targetFlight.icao24,
              Operator: targetFlight.operator,
              Aircraft: targetFlight.aircraftType,
              Category: targetFlight.aircraftCategory,
              'Flight Direction': `${targetFlight.flightDirection} ${targetFlight.flightDirection === 'INBOUND' ? '(ARRIVING TO MALDIVES)' : targetFlight.flightDirection === 'OUTBOUND' ? '(DEPARTING FROM MALDIVES)' : targetFlight.flightDirection === 'DOMESTIC' ? '(DOMESTIC MALDIVES)' : '(TRANSIT OVERFLIGHT)'}`,
              Route: `${targetFlight.origin} ➔ ${targetFlight.destination}`,
              Altitude: `${targetFlight.altitudeFt.toLocaleString()} ft`,
              Speed: `${targetFlight.velocityKts} knots`,
              Heading: `${targetFlight.headingDeg}°`,
              VerticalRate: `${targetFlight.verticalRateFpm} ft/min`,
              Squawk: targetFlight.squawk,
              Sector: targetFlight.airwaySector || 'Maldives Airspace',
              Phase: targetFlight.flightPhase,
              ...(targetFlight.militaryRole ? { 'Military Role': targetFlight.militaryRole } : {}),
              'Data Source':
                targetFlight.dataQuality === 'MODELED_OSINT'
                  ? 'MODELED OSINT (not a live track)'
                  : targetFlight.dataQuality === 'SIMULATED_ADSB'
                  ? 'SIMULATED ADS-B (offline fallback)'
                  : 'LIVE ADS-B',
            },
            raw: targetFlight,
          });
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(f.coordinates)
          .addTo(map);

        flightMarkersRef.current.set(f.id, { marker, el });
      }
    });
  }, [flights, showFlights, mapLoaded, playTargetLock, setSelectedEntity]);

  // Handle fly-to targets from store (when user clicks an item in right or left panel)
  useEffect(() => {
    if (!flyToTarget || !mapRef.current) return;
    const flyOptions: maplibregl.FlyToOptions = {
      center: flyToTarget.coordinates,
      speed: 1.4,
      curve: 1.4,
      essential: true,
    };
    if (flyToTarget.zoom !== undefined) {
      flyOptions.zoom = flyToTarget.zoom;
    }
    if (flyToTarget.pitch !== undefined) {
      flyOptions.pitch = flyToTarget.pitch;
    }
    if (flyToTarget.bearing !== undefined) {
      flyOptions.bearing = flyToTarget.bearing;
    }
    mapRef.current.flyTo(flyOptions);
  }, [flyToTarget]);

  // Synchronize dynamic faint path line for selected Flight or Vessel
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const source = map.getSource('selected-entity-path') as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    if (!selectedEntity || (selectedEntity.type !== 'flight' && selectedEntity.type !== 'vessel')) {
      source.setData({ type: 'FeatureCollection', features: [] });
      return;
    }

    const features: GeoJSON.Feature[] = [];

    if (selectedEntity.type === 'flight') {
      const flight = flights.find((f) => f.id === selectedEntity.id) || (selectedEntity.raw as AviationFlight | undefined);
      if (!flight || !flight.coordinates) {
        source.setData({ type: 'FeatureCollection', features: [] });
        return;
      }

      const isSeaplane = flight.aircraftCategory === 'SEAPLANE_TWIN_OTTER';
      const pathColor = flight.isMilitary
        ? '#f43f5e'
        : isSeaplane
        ? '#38bdf8'
        : flight.flightDirection === 'INBOUND'
        ? '#10b981'
        : flight.flightDirection === 'OUTBOUND'
        ? '#f59e0b'
        : '#06b6d4';

      const currentCoords: [number, number] = flight.coordinates;
      const { pointA, pointB } = resolveFlightRouteEndpoints(flight);

      // ─── 1. Leg 1: Dotted line from Point A (Origin) to Plane ───
      const leg1Points = interpolateStraightRoute(pointA.coords, currentCoords, 10);
      features.push({
        type: 'Feature',
        properties: {
          color: pathColor,
          lineWidth: 1.8,
          lineOpacity: 0.65,
          glowWidth: 5,
          glowOpacity: 0.18,
        },
        geometry: {
          type: 'LineString',
          coordinates: leg1Points,
        },
      });

      // ─── 2. Leg 2: Dotted line from Plane to Point B (Destination) ───
      const leg2Points = interpolateStraightRoute(currentCoords, pointB.coords, 10);
      features.push({
        type: 'Feature',
        properties: {
          color: pathColor,
          lineWidth: 1.8,
          lineOpacity: 0.55,
          glowWidth: 5,
          glowOpacity: 0.15,
        },
        geometry: {
          type: 'LineString',
          coordinates: leg2Points,
        },
      });

      // ─── 3. Point A Waypoint & Label ───
      features.push({
        type: 'Feature',
        properties: {
          color: pathColor,
          radius: 4.5,
          label: `A: ${pointA.code}`,
        },
        geometry: {
          type: 'Point',
          coordinates: pointA.coords,
        },
      });

      // ─── 4. Point B Waypoint & Label ───
      features.push({
        type: 'Feature',
        properties: {
          color: pathColor,
          radius: 4.5,
          label: `B: ${pointB.code}`,
        },
        geometry: {
          type: 'Point',
          coordinates: pointB.coords,
        },
      });

      // ─── 5. Plane Current Position Node ───
      features.push({
        type: 'Feature',
        properties: {
          color: pathColor,
          radius: 3.5,
        },
        geometry: {
          type: 'Point',
          coordinates: currentCoords,
        },
      });
    } else if (selectedEntity.type === 'vessel') {
      const vessel = vessels.find((v) => v.id === selectedEntity.id) || (selectedEntity.raw as MaritimeVessel | undefined);
      if (!vessel || !vessel.coordinates) {
        source.setData({ type: 'FeatureCollection', features: [] });
        return;
      }

      const vesselColor =
        vessel.isMilitary
          ? '#f43f5e'
          : vessel.type === 'tanker'
          ? '#f97316'
          : vessel.type === 'cargo'
          ? '#3b82f6'
          : vessel.type === 'coast_guard'
          ? '#ef4444'
          : vessel.type === 'safari_boat'
          ? '#8b5cf6'
          : '#10b981';

      const currentCoords: [number, number] = vessel.coordinates;
      const { pointA, pointB } = resolveVesselRouteEndpoints(vessel);

      // ─── 1. Leg 1: Dotted line from Port A (Origin) to Ship ───
      const leg1Points = interpolateStraightRoute(pointA.coords, currentCoords, 8);
      features.push({
        type: 'Feature',
        properties: {
          color: vesselColor,
          lineWidth: 1.8,
          lineOpacity: 0.65,
          glowWidth: 5,
          glowOpacity: 0.18,
        },
        geometry: {
          type: 'LineString',
          coordinates: leg1Points,
        },
      });

      // ─── 2. Leg 2: Dotted line from Ship to Port B (Destination) ───
      const leg2Points = interpolateStraightRoute(currentCoords, pointB.coords, 8);
      features.push({
        type: 'Feature',
        properties: {
          color: vesselColor,
          lineWidth: 1.8,
          lineOpacity: 0.55,
          glowWidth: 5,
          glowOpacity: 0.15,
        },
        geometry: {
          type: 'LineString',
          coordinates: leg2Points,
        },
      });

      // ─── 3. Port A Waypoint & Label ───
      features.push({
        type: 'Feature',
        properties: {
          color: vesselColor,
          radius: 4.5,
          label: `A: ${pointA.code}`,
        },
        geometry: {
          type: 'Point',
          coordinates: pointA.coords,
        },
      });

      // ─── 4. Port B Waypoint & Label ───
      features.push({
        type: 'Feature',
        properties: {
          color: vesselColor,
          radius: 4.5,
          label: `B: ${pointB.code}`,
        },
        geometry: {
          type: 'Point',
          coordinates: pointB.coords,
        },
      });

      // ─── 5. Ship Current Position Node ───
      features.push({
        type: 'Feature',
        properties: {
          color: vesselColor,
          radius: 3.5,
        },
        geometry: {
          type: 'Point',
          coordinates: currentCoords,
        },
      });
    }

    source.setData({
      type: 'FeatureCollection',
      features,
    });
  }, [selectedEntity, flights, vessels, mapLoaded]);

  // Viewport reset handler
  const handleResetView = useCallback((zone: 'MALE' | 'ALL' | 'NORTH' | 'SOUTH' | 'IOR') => {
    if (!mapRef.current) return;

    if (zone === 'IOR') {
      mapRef.current.flyTo({
        center: [70.0, 2.0],
        zoom: 3.4,
        pitch: 0,
        bearing: 0,
      });
      return;
    }

    if (zone === 'MALE') {
      mapRef.current.flyTo({
        center: [73.5093, 4.1755],
        zoom: 10.5,
        pitch: 35,
        bearing: 0,
      });
    } else if (zone === 'ALL') {
      mapRef.current.flyTo({
        center: [73.5, 3.2],
        zoom: 5.8,
        pitch: 15,
        bearing: 0,
      });
    } else if (zone === 'NORTH') {
      mapRef.current.flyTo({
        center: [73.1, 6.4],
        zoom: 8.5,
        pitch: 25,
        bearing: 0,
      });
    } else if (zone === 'SOUTH') {
      mapRef.current.flyTo({
        center: [73.2, 0.2],
        zoom: 8.5,
        pitch: 25,
        bearing: 0,
      });
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut();
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#07090e]">
      {/* MapLibre Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Subtle Tactical Radar Ring Overlay (Centered on Malé / Hulhulé Tower) */}
      {showRadarSweep && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
          {/* Main Tactical Radar Scope sized to fit screen with ultra-subtle ambient styling */}
          <div className="relative w-[min(96vw,calc(100vh-60px))] h-[min(96vw,calc(100vh-60px))] rounded-full border border-teal-500/15 opacity-35">
            {/* Concentric Range Rings */}
            <div className="absolute inset-0 rounded-full border border-teal-500/10 scale-75" />
            <div className="absolute inset-0 rounded-full border border-teal-500/10 scale-50" />
            <div className="absolute inset-0 rounded-full border border-teal-500/10 scale-25" />
            
            {/* Soft Rotating Radar Sweep (Gentle ambient glow without harsh lines) */}
            <div className="absolute inset-0 animate-radar-sweep">
              <div className="w-1/2 h-full bg-gradient-to-r from-transparent to-teal-500/8 rounded-l-full relative">
                {/* Very faint leading edge line */}
                <div className="absolute top-0 right-0 w-[1px] h-1/2 bg-gradient-to-b from-teal-400/25 to-transparent" />
              </div>
            </div>

            {/* Subtle Radar Center Blip */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-teal-400/50" />
          </div>
        </div>
      )}

      {/* Nautical Compass Rose HUD */}
      <div className="absolute top-16 right-6 pointer-events-none hidden md:flex flex-col items-center opacity-70">
        <div className="w-12 h-12 rounded-full border border-slate-700/80 bg-slate-950/60 backdrop-blur flex items-center justify-center relative">
          <span className="text-[9px] font-mono font-bold text-cyan-400 absolute top-0.5">N</span>
          <span className="text-[8px] font-mono text-slate-500 absolute bottom-0.5">S</span>
          <span className="text-[8px] font-mono text-slate-500 absolute left-1">W</span>
          <span className="text-[8px] font-mono text-slate-500 absolute right-1">E</span>
          <div className="w-1 h-5 bg-gradient-to-t from-transparent to-cyan-400 rounded" />
        </div>
        <span className="text-[9px] font-mono text-slate-400 mt-1">MALDIVES FIR (VRMF)</span>
      </div>

      {/* Floating Tactical Weather Status Banner on the Map */}
      {showWeatherAlerts && (
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center gap-2.5 px-3.5 py-1.5 rounded-full tactical-panel border shadow-2xl backdrop-blur-md text-[10px] md:text-xs font-mono text-slate-200 select-none animate-in fade-in slide-in-from-top-2 duration-300 ${
          weather?.mmsAlert?.isActiveWarning
            ? 'border-amber-500/50 bg-slate-950/95 shadow-amber-500/10'
            : 'border-cyan-500/40 bg-slate-950/90 shadow-cyan-500/10'
        }`}>
          <div className={`flex items-center gap-1.5 font-bold ${
            weather?.mmsAlert?.isActiveWarning ? 'text-amber-400' : 'text-cyan-400'
          }`}>
            <CloudRain className={`w-3.5 h-3.5 ${weather?.mmsAlert?.isActiveWarning ? 'animate-pulse text-amber-400' : 'text-cyan-400'}`} />
            <span>MMS {weather?.mmsAlert?.level ?? 'WHITE'} {weather?.mmsAlert?.isActiveWarning ? 'ALERT' : 'ADVISORY'}</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-amber-300">
            SWELL: <strong>{weather?.marine?.waveHeightMeters ?? 0.8}m @ {weather?.marine?.wavePeriodSeconds ?? 9.5}s</strong>
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-cyan-300 hidden sm:inline">
            WIND: <strong>{weather?.marine?.windSpeedKnots ?? 8} kts {weather?.marine?.windDirectionCompass ?? 'ENE'}</strong>
          </span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className={`font-bold hidden md:inline ${
            weather?.mmsAlert?.isActiveWarning ? 'text-amber-400 animate-pulse' : 'text-emerald-400'
          }`}>
            {weather?.mmsAlert?.isActiveWarning ? weather.mmsAlert.title : 'ALL ATOLL PASSES CLEAR'}
          </span>
        </div>
      )}

      {/* Floating Tactical Layer & Navigation Controls */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
      />
    </div>
  );
}
