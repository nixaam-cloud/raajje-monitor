/**
 * Maldives Submarine Fiber Optic Telecommunication Cables & Domestic Inter-Atoll Loops
 * GeoJSON Linestrings and Cable Landing Station Points
 */

export interface CableLandingStation {
  id: string;
  name: string;
  atoll: string;
  coordinates: [number, number];
  operator: string;
  capacityTbps: number;
  status: 'ACTIVE' | 'UPGRADING' | 'STANDBY';
  cablesConnected: string[];
}

export const CABLE_LANDING_STATIONS: CableLandingStation[] = [
  {
    id: 'cls-hulhumale',
    name: 'Hulhumalé Subsea Cable Station',
    atoll: 'Kaafu Atoll',
    coordinates: [73.5412, 4.2155],
    operator: 'Dhiraagu / Ooredoo JV',
    capacityTbps: 100,
    status: 'ACTIVE',
    cablesConnected: ['SEA-ME-WE 6', 'PEACE', 'FALCON', 'Dhin-Oor National Backbone'],
  },
  {
    id: 'cls-kulhudhuffushi',
    name: 'Kulhudhuffushi Northern Cable Gateway',
    atoll: 'Haa Dhaalu Atoll',
    coordinates: [73.0680, 6.6235],
    operator: 'Dhiraagu PLC',
    capacityTbps: 32,
    status: 'ACTIVE',
    cablesConnected: ['PEACE Branch', 'Dhin-Oor Northern Loop'],
  },
  {
    id: 'cls-hithadhoo',
    name: 'Addu Hithadhoo Southern Teleport',
    atoll: 'Seenu Atoll',
    coordinates: [73.0880, -0.6015],
    operator: 'Dhiraagu / Ooredoo',
    capacityTbps: 40,
    status: 'ACTIVE',
    cablesConnected: ['SEA-ME-WE Southern Spur', 'Dhin-Oor Southern Trunk'],
  },
];

export const SUBMARINE_CABLES_GEOJSON: GeoJSON.FeatureCollection<GeoJSON.LineString> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: 'cable-smw6',
        name: 'SEA-ME-WE 6 (Maldives Branch)',
        system: 'South East Asia-Middle East-Western Europe 6',
        lengthKm: 21700,
        rfsYear: 2025,
        color: '#8B5CF6',
        capacityTbps: 120,
        owners: 'Consortium (Dhiraagu, Singtel, Telecom Egypt, Orange)',
        status: 'ONLINE',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [71.5, 3.8],
          [72.2, 4.0],
          [72.9, 4.1],
          [73.35, 4.18],
          [73.5412, 4.2155], // Hulhumalé Landing
          [73.8, 4.25],
          [74.6, 4.4],
          [75.8, 4.6],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'cable-peace',
        name: 'PEACE Cable (Pakistan & East Africa Connecting Europe)',
        system: 'PEACE System - Indian Ocean Spur',
        lengthKm: 15000,
        rfsYear: 2023,
        color: '#A855F7',
        capacityTbps: 96,
        owners: 'Ooredoo Maldives / PEACE Consortium',
        status: 'ONLINE',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [72.0, 7.2],
          [72.5, 6.9],
          [73.0680, 6.6235], // Kulhudhuffushi Landing
          [73.2, 5.8],
          [73.45, 4.9],
          [73.5412, 4.2155], // Hulhumalé Landing
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'cable-falcon',
        name: 'FALCON Submarine Cable',
        system: 'Global Cloud Xchange (GCX) FALCON',
        lengthKm: 10300,
        rfsYear: 2006,
        color: '#C084FC',
        capacityTbps: 16,
        owners: 'GCX / Dhiraagu',
        status: 'ONLINE',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [71.1, 4.5],
          [72.0, 4.35],
          [72.8, 4.25],
          [73.5412, 4.2155], // Hulhumalé
          [74.2, 4.3],
          [75.5, 4.5],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'cable-domestic-trunk',
        name: 'National Inter-Atoll Subsea Fiber Ring',
        system: 'Republic of Maldives High-Speed Atoll Backbone',
        lengthKm: 1250,
        rfsYear: 2021,
        color: '#38BDF8',
        capacityTbps: 48,
        owners: 'National Telecom Infrastructure (Dhiraagu / Ooredoo)',
        status: 'ONLINE',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [73.0680, 6.6235], // Haa Dhaalu (Kulhudhuffushi)
          [73.2908, 6.1500], // Shaviyani (Funadhoo)
          [73.4142, 5.7667], // Noonu (Manadhoo)
          [73.0706, 5.1039], // Baa (Eydhafushi)
          [73.5412, 4.2155], // Kaafu (Hulhumalé)
          [72.9692, 3.7572], // Alif Dhaal (Mahibadhoo)
          [72.8944, 2.6708], // Dhaalu (Kudahuvadhoo)
          [73.5028, 1.8333], // Laamu (Fonadhoo)
          [72.9997, 0.5317], // Gaafu Dhaalu (Thinadhoo)
          [73.4242, -0.2989], // Gnaviyani (Fuvahmulah)
          [73.0880, -0.6015], // Seenu (Addu City / Hithadhoo)
        ],
      },
    },
  ],
};
