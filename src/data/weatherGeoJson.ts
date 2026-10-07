/**
 * Maldives National Meteorological Service (MMS) Weather & Udha Surge Alert Domain Catalog
 * GeoJSON Polygons for Weather Risk Zones, Swell Flow Corridors, and Marine Telemetry Stations.
 */

export interface WeatherStation {
  id: string;
  code: string;
  name: string;
  atoll: string;
  zone: 'NORTH' | 'CENTRAL' | 'SOUTH';
  coordinates: [number, number]; // [lng, lat]
  alertLevel: 'NORMAL' | 'YELLOW' | 'SEVERE';
  waveHeight: string;
  swellPeriod: string;
  windSpeed: string;
  windDirection: string;
  seaTemp: string;
  surgeRisk: string;
  tidePhase: string;
  advisory: string;
}

export const WEATHER_STATIONS: WeatherStation[] = [
  {
    id: 'ws-hanimaadhoo',
    code: 'VRMH-MET',
    name: 'Hanimaadhoo Met Observatory',
    atoll: 'Haa Dhaalu Atoll',
    zone: 'NORTH',
    coordinates: [73.1700, 6.7600],
    alertLevel: 'NORMAL',
    waveHeight: '1.2 m (Chop)',
    swellPeriod: '7.8 s',
    windSpeed: '14.0 kts',
    windDirection: '240° WSW',
    seaTemp: '28.5 °C',
    surgeRisk: 'MODERATE (Outer Reefs)',
    tidePhase: 'High Tide (+0.9m)',
    advisory: 'Normal inter-atoll navigation. Caution near shallow northern reef entrances.',
  },
  {
    id: 'ws-hulhule',
    code: 'VRMM-AWS',
    name: 'MMS Headquarters / Hulhulé AWS',
    atoll: 'Kaafu Atoll (Capital Region)',
    zone: 'CENTRAL',
    coordinates: [73.5300, 4.1900],
    alertLevel: 'YELLOW',
    waveHeight: '1.6 m (Swell 1.3m)',
    swellPeriod: '8.5 s',
    windSpeed: '16.5 kts',
    windDirection: '245° WSW',
    seaTemp: '29.4 °C',
    surgeRisk: 'ELEVATED // UDHA SURGE ADVISORY',
    tidePhase: 'Spring High Transition (+1.1m)',
    advisory: 'MMS Yellow Alert: 6-8 ft swell waves. Small craft prohibited in Kaashidhoo & Gaadhoo channels.',
  },
  {
    id: 'ws-kadhdhoo',
    code: 'VRMK-MET',
    name: 'Kadhdhoo Regional Met Office',
    atoll: 'Laamu Atoll',
    zone: 'CENTRAL',
    coordinates: [73.5200, 1.8600],
    alertLevel: 'YELLOW',
    waveHeight: '1.8 m (Swell 1.5m)',
    swellPeriod: '8.9 s',
    windSpeed: '18.0 kts',
    windDirection: '215° SSW',
    seaTemp: '29.1 °C',
    surgeRisk: 'ELEVATED (Channel Spray)',
    tidePhase: 'Ebb Tide (+0.7m)',
    advisory: 'Rough channel seas. Strong wave reflection along eastern barrier atoll passes.',
  },
  {
    id: 'ws-gan',
    code: 'VRMG-BUOY',
    name: 'Gan Oceanographic Telemetry Buoy',
    atoll: 'Seenu Atoll (Addu City)',
    zone: 'SOUTH',
    coordinates: [73.1600, -0.6900],
    alertLevel: 'SEVERE',
    waveHeight: '2.1 m (Ground Swell)',
    swellPeriod: '9.5 s',
    windSpeed: '19.5 kts',
    windDirection: '205° SSW',
    seaTemp: '29.8 °C',
    surgeRisk: 'SEVERE // ACTIVE COASTAL FLOODING',
    tidePhase: 'Spring High Surge Peak (+1.3m)',
    advisory: 'Deep Southern Ocean swell collision. Active Udha erun coastal inundation in Gaafu & Fuvahmulah.',
  },
];

// GeoJSON Polygons for the 3 National Meteorological Warning Zones
export const WEATHER_ZONES_GEOJSON: GeoJSON.FeatureCollection<GeoJSON.Polygon> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: 'zone-north',
        name: 'NORTHERN WEATHER ZONE (HA - Lh)',
        status: 'MONSOON CHOP // ELEVATED REEF SWELL',
        riskLevel: 'MODERATE',
        color: '#eab308',
        lineColor: '#fde047',
        waves: '1.2m - 1.4m',
        wind: '14 kts WSW',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [72.30, 4.90],
            [73.90, 4.90],
            [73.90, 7.35],
            [72.30, 7.35],
            [72.30, 4.90],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'zone-central',
        name: 'CENTRAL MMS ALERT ZONE (K - Dh)',
        status: 'MMS YELLOW ADVISORY // 6-8 FT SWELL SURGE',
        riskLevel: 'ELEVATED',
        color: '#f59e0b',
        lineColor: '#fbbf24',
        waves: '1.6m - 1.8m',
        wind: '16.5 kts SW',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [72.30, 2.70],
            [74.05, 2.70],
            [74.05, 4.90],
            [72.30, 4.90],
            [72.30, 2.70],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'zone-south',
        name: 'SOUTHERN SWELL SURGE ZONE (Th - S)',
        status: 'SEVERE GROUND SWELL // ACTIVE UDHA SURGE',
        riskLevel: 'SEVERE',
        color: '#f97316',
        lineColor: '#fdba74',
        waves: '2.0m - 2.4m',
        wind: '19.5 kts SSW',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [72.30, -0.95],
            [74.15, -0.95],
            [74.15, 2.70],
            [72.30, 2.70],
            [72.30, -0.95],
          ],
        ],
      },
    },
  ],
};

// GeoJSON LineStrings for Monsoon & Ocean Swell Flow Streamlines
export const WEATHER_SWELL_GEOJSON: GeoJSON.FeatureCollection<GeoJSON.LineString> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: 'swell-kardiva',
        name: 'KARDIVA CHANNEL SWELL FLOW',
        telemetry: '1.6m @ 8.5s // 16 kts SW',
        color: '#f59e0b',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [72.20, 4.55],
          [73.10, 4.85],
          [74.20, 5.25],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'swell-one-and-half',
        name: 'HUVADHOO KANDU DEEP SWELL',
        telemetry: '1.9m @ 9.0s // 18 kts SW',
        color: '#f97316',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [72.10, 1.20],
          [73.20, 1.55],
          [74.40, 1.85],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'swell-equatorial',
        name: 'EQUATORIAL ANTARCTIC SWELL',
        telemetry: '2.1m @ 9.5s // 20 kts SSW',
        color: '#ef4444',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [72.00, -0.30],
          [73.10, 0.00],
          [74.30, 0.30],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'swell-northern',
        name: 'NORTHERN EIGHT DEGREE FLOW',
        telemetry: '1.3m @ 7.8s // 14 kts WSW',
        color: '#eab308',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [72.25, 7.00],
          [73.15, 7.20],
          [74.05, 7.40],
        ],
      },
    },
  ],
};

// Distinct label points positioned in western territorial waters to prevent overlaying central atolls
export const WEATHER_ZONE_LABELS_GEOJSON: GeoJSON.FeatureCollection<GeoJSON.Point> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: 'label-north',
        name: 'NORTHERN ZONE (HA - Lh)',
        status: 'MONSOON CHOP // 1.2m',
        color: '#fde047',
      },
      geometry: {
        type: 'Point',
        coordinates: [72.50, 6.30],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'label-central',
        name: 'CENTRAL ZONE (K - Dh)',
        status: 'MMS YELLOW ADVISORY // 1.6m SWELL',
        color: '#fbbf24',
      },
      geometry: {
        type: 'Point',
        coordinates: [72.50, 3.80],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'label-south',
        name: 'SOUTHERN ZONE (Th - S)',
        status: 'SEVERE UDHA SURGE // 2.1m SWELL',
        color: '#fdba74',
      },
      geometry: {
        type: 'Point',
        coordinates: [72.50, 0.90],
      },
    },
  ],
};
