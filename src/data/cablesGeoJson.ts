/**
 * Maldives Submarine Fiber Optic Telecommunication Cables & Domestic Inter-Atoll Loops
 * GeoJSON Linestrings, Cable Landing Stations (National & 1st International Landing Stations beyond EEZ),
 * Mobile 5G & 4G Coverage Zones, Cell Tower Infrastructure, and Live Network Outage Incidents.
 */

export interface CableLandingStation {
  id: string;
  name: string;
  atollOrRegion: string;
  country: string;
  isInternational: boolean;
  coordinates: [number, number];
  operator: string;
  capacityTbps: number;
  status: 'ACTIVE' | 'UPGRADING' | 'STANDBY';
  cablesConnected: string[];
  latencyToMaleMs?: number;
}

export const CABLE_LANDING_STATIONS: CableLandingStation[] = [
  // ─── 1. MALDIVES NATIONAL LANDING GATEWAYS ───
  {
    id: 'cls-hulhumale',
    name: 'Hulhumalé Subsea Cable Station',
    atollOrRegion: 'Kaafu Atoll',
    country: 'Maldives',
    isInternational: false,
    coordinates: [73.5412, 4.2155],
    operator: 'Dhiraagu / Ooredoo JV',
    capacityTbps: 120,
    status: 'ACTIVE',
    cablesConnected: ['SEA-ME-WE 6', 'PEACE', 'FALCON', 'MSC (Dhiraagu-SLT)', 'National Inter-Atoll Ring'],
    latencyToMaleMs: 0.5,
  },
  {
    id: 'cls-kulhudhuffushi',
    name: 'Kulhudhuffushi Northern Cable Gateway',
    atollOrRegion: 'Haa Dhaalu Atoll',
    country: 'Maldives',
    isInternational: false,
    coordinates: [73.0680, 6.6235],
    operator: 'Ooredoo Maldives / PEACE Consortium',
    capacityTbps: 96,
    status: 'ACTIVE',
    cablesConnected: ['PEACE System', 'National Inter-Atoll Ring'],
    latencyToMaleMs: 4.2,
  },
  {
    id: 'cls-hithadhoo',
    name: 'Addu Hithadhoo Southern Teleport',
    atollOrRegion: 'Seenu Atoll (Addu City)',
    country: 'Maldives',
    isInternational: false,
    coordinates: [73.0880, -0.6015],
    operator: 'Dhiraagu / Ooredoo',
    capacityTbps: 40,
    status: 'ACTIVE',
    cablesConnected: ['IAX Southern Spur', 'National Inter-Atoll Ring'],
    latencyToMaleMs: 6.8,
  },

  // ─── 2. 1ST INTERNATIONAL LANDING STATIONS BEYOND MALDIVES EEZ ───
  {
    id: 'cls-matara',
    name: 'Matara Cable Landing Station',
    atollOrRegion: 'Southern Province',
    country: 'Sri Lanka',
    isInternational: true,
    coordinates: [80.5488, 5.9478],
    operator: 'Sri Lanka Telecom (SLT-MOBITEL)',
    capacityTbps: 160,
    status: 'ACTIVE',
    cablesConnected: ['SEA-ME-WE 6 (Maldives Spur)', 'IAX Southern Link', 'SEA-ME-WE 5', 'BBG'],
    latencyToMaleMs: 18,
  },
  {
    id: 'cls-colombo',
    name: 'Mount Lavinia / Colombo Cable Station',
    atollOrRegion: 'Western Province',
    country: 'Sri Lanka',
    isInternational: true,
    coordinates: [79.8620, 6.8370],
    operator: 'Sri Lanka Telecom / Dialog Axiata',
    capacityTbps: 100,
    status: 'ACTIVE',
    cablesConnected: ['MSC (Dhiraagu-SLT Direct)', 'FALCON', 'MCSC (Ooredoo-Dialog)'],
    latencyToMaleMs: 16,
  },
  {
    id: 'cls-trivandrum',
    name: 'Trivandrum Cable Landing Station',
    atollOrRegion: 'Kerala',
    country: 'India',
    isInternational: true,
    coordinates: [76.9500, 8.5240],
    operator: 'Tata Communications / BSNL',
    capacityTbps: 80,
    status: 'ACTIVE',
    cablesConnected: ['FALCON (North Indian Ocean)', 'TGN-Gulf'],
    latencyToMaleMs: 22,
  },
  {
    id: 'cls-karachi',
    name: 'Karachi Subsea Telecommunications Gateway',
    atollOrRegion: 'Sindh',
    country: 'Pakistan',
    isInternational: true,
    coordinates: [67.0100, 24.8600],
    operator: 'Cybernet / PTCL',
    capacityTbps: 96,
    status: 'ACTIVE',
    cablesConnected: ['PEACE Cable Main Trunk', 'AAE-1', 'TW1'],
    latencyToMaleMs: 38,
  },
  {
    id: 'cls-djibouti',
    name: 'Djibouti City Cable Landing Station',
    atollOrRegion: 'Horn of Africa',
    country: 'Djibouti',
    isInternational: true,
    coordinates: [43.1450, 11.5950],
    operator: 'Djibouti Telecom (Datacenter Gateway)',
    capacityTbps: 140,
    status: 'ACTIVE',
    cablesConnected: ['SEA-ME-WE 6 (Westbound)', '2Africa', 'AAE-1', 'EIG'],
    latencyToMaleMs: 64,
  },
  {
    id: 'cls-seeb',
    name: 'Al Seeb Cable Landing Station',
    atollOrRegion: 'Muscat Governorate',
    country: 'Oman',
    isInternational: true,
    coordinates: [58.1890, 23.6840],
    operator: 'Omantel',
    capacityTbps: 120,
    status: 'ACTIVE',
    cablesConnected: ['FALCON (Middle East Hub)', 'SMW6 Branch', 'OMRAN'],
    latencyToMaleMs: 44,
  },
  {
    id: 'cls-seychelles',
    name: 'Victoria Cable Landing Station',
    atollOrRegion: 'Mahé',
    country: 'Seychelles',
    isInternational: true,
    coordinates: [55.4510, -4.6210],
    operator: 'Cable & Wireless Seychelles',
    capacityTbps: 48,
    status: 'ACTIVE',
    cablesConnected: ['PEACE (Indian Ocean Spur)', 'Seychelles-East Africa System (SEAS)'],
    latencyToMaleMs: 42,
  },
  {
    id: 'cls-chagos',
    name: 'Diego Garcia Telecom Gateway',
    atollOrRegion: 'Chagos Archipelago',
    country: 'British Indian Ocean Territory',
    isInternational: true,
    coordinates: [72.4100, -7.3100],
    operator: 'Sure Telecom / Trans-Oceanic Defense Gateway',
    capacityTbps: 24,
    status: 'ACTIVE',
    cablesConnected: ['IAX Southern Spur', 'Indian Ocean Deepwater Defense Backbone'],
    latencyToMaleMs: 28,
  },
];

export interface SubmarineCableProperties {
  id: string;
  name: string;
  system: string;
  lengthKm: number;
  rfsYear: number;
  color: string;
  capacityTbps: number;
  owners: string;
  firstLandingStationsAway: string;
  status: string;
}

export const SUBMARINE_CABLES_GEOJSON: GeoJSON.FeatureCollection<GeoJSON.LineString, SubmarineCableProperties> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: 'cable-smw6',
        name: 'SEA-ME-WE 6 (Maldives Branch & Indian Ocean Backbone)',
        system: 'South East Asia-Middle East-Western Europe 6',
        lengthKm: 21700,
        rfsYear: 2025,
        color: '#A855F7', // Purple/Violet
        capacityTbps: 120,
        owners: 'Consortium (Dhiraagu, Singtel, Telecom Egypt, Orange, SLT)',
        firstLandingStationsAway: 'Matara (Sri Lanka) & Djibouti City (Djibouti)',
        status: 'ONLINE',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          // 1st Landing Station West: Djibouti City, Djibouti
          [43.1450, 11.5950],
          [48.5, 12.4],
          [52.0, 11.8],
          [57.0, 9.5],
          [63.0, 7.2],
          [68.0, 5.5],
          // Enters Maldives EEZ
          [70.5, 4.6],
          [72.2, 4.3],
          [73.35, 4.18],
          // Maldives Landing: Hulhumalé
          [73.5412, 4.2155],
          // Exits Maldives EEZ East into Sri Lankan Waters
          [75.2, 4.5],
          [77.0, 5.0],
          [79.0, 5.5],
          // 1st Landing Station East: Matara, Sri Lanka
          [80.5488, 5.9478],
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
        color: '#EC4899', // Pink
        capacityTbps: 96,
        owners: 'Ooredoo Maldives / PEACE Consortium / Cybernet',
        firstLandingStationsAway: 'Karachi (Pakistan) & Victoria (Seychelles)',
        status: 'ONLINE',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          // 1st Landing Station North: Karachi, Pakistan
          [67.0100, 24.8600],
          [68.2, 21.0],
          [69.8, 16.5],
          [71.2, 11.8],
          // Enters Northern Maldives EEZ
          [72.2, 8.5],
          // Northern Gateway Landing: Kulhudhuffushi
          [73.0680, 6.6235],
          [73.25, 5.8],
          [73.45, 4.9],
          // Central Maldives Landing: Hulhumalé
          [73.5412, 4.2155],
          // Exits Maldives EEZ Southwest towards Africa/Seychelles
          [71.5, 2.5],
          [68.0, 0.5],
          [62.5, -2.0],
          // 1st Landing Station Southwest: Victoria, Seychelles
          [55.4510, -4.6210],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'cable-msc',
        name: 'MSC (Maldives-Sri Lanka Express Cable)',
        system: 'Dhiraagu & Sri Lanka Telecom Direct Bilateral Link',
        lengthKm: 863,
        rfsYear: 2021,
        color: '#10B981', // Emerald
        capacityTbps: 40,
        owners: 'Dhiraagu PLC & Sri Lanka Telecom (SLT)',
        firstLandingStationsAway: 'Mount Lavinia / Colombo (Sri Lanka)',
        status: 'ONLINE',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          // Maldives Landing: Hulhumalé
          [73.5412, 4.2155],
          [75.1, 4.7],
          [76.8, 5.3],
          // Exits Maldives EEZ East
          [77.8, 5.9],
          [78.9, 6.4],
          // 1st Landing Station: Mount Lavinia / Colombo, Sri Lanka
          [79.8620, 6.8370],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'cable-falcon',
        name: 'FALCON Submarine Cable (GCX Gateway)',
        system: 'Global Cloud Xchange (GCX) FALCON System',
        lengthKm: 10300,
        rfsYear: 2006,
        color: '#38BDF8', // Cyan/Sky
        capacityTbps: 16,
        owners: 'GCX / Dhiraagu / Tata Communications',
        firstLandingStationsAway: 'Mount Lavinia / Colombo (Sri Lanka), Trivandrum (India) & Al Seeb (Oman)',
        status: 'ONLINE',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          // 1st Landing Station Northwest: Al Seeb, Oman
          [58.1890, 23.6840],
          [64.0, 18.5],
          [70.0, 13.0],
          // Branch junction to Trivandrum, India
          [76.9500, 8.5240],
          [75.2, 6.8],
          // Enters Maldives EEZ
          [74.2, 5.5],
          // Maldives Landing: Hulhumalé
          [73.5412, 4.2155],
          // Exits Maldives EEZ East
          [76.2, 4.9],
          [78.0, 5.8],
          // 1st Landing Station East: Colombo, Sri Lanka
          [79.8620, 6.8370],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'cable-iax-south',
        name: 'IAX Southern Oceanic Spur (Addu Link)',
        system: 'South Indian Ocean Transit & Defense Link',
        lengthKm: 2400,
        rfsYear: 2024,
        color: '#F59E0B', // Amber
        capacityTbps: 32,
        owners: 'Consortium / Dhiraagu / Sri Lanka Telecom',
        firstLandingStationsAway: 'Diego Garcia (BIOT) & Matara (Sri Lanka)',
        status: 'ONLINE',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          // 1st Landing Station South: Diego Garcia, BIOT
          [72.4100, -7.3100],
          [72.6, -5.2],
          [72.9, -2.8],
          // Enters Southern Maldives EEZ
          // Maldives Landing: Addu City Hithadhoo Teleport
          [73.0880, -0.6015],
          // Northeast transit route exiting EEZ
          [75.5, 0.8],
          [78.0, 3.2],
          // 1st Landing Station East: Matara, Sri Lanka
          [80.5488, 5.9478],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'cable-domestic-trunk',
        name: 'National Inter-Atoll Subsea Fiber Ring',
        system: 'Republic of Maldives High-Speed Atoll Backbone (Dhin-Oor Ring)',
        lengthKm: 1250,
        rfsYear: 2021,
        color: '#06B6D4', // Cyan
        capacityTbps: 48,
        owners: 'National Telecom Infrastructure (Dhiraagu / Ooredoo JV)',
        firstLandingStationsAway: 'Inter-Atoll Domestic Ring (11 Landing Hubs)',
        status: 'ONLINE',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [73.0680, 6.6235], // Haa Dhaalu (Kulhudhuffushi Gateway)
          [73.2908, 6.1500], // Shaviyani (Funadhoo)
          [73.4142, 5.7667], // Noonu (Manadhoo)
          [73.0706, 5.1039], // Baa (Eydhafushi)
          [73.5412, 4.2155], // Kaafu (Hulhumalé Central Teleport)
          [72.9692, 3.7572], // Alif Dhaal (Mahibadhoo)
          [72.8944, 2.6708], // Dhaalu (Kudahuvadhoo)
          [73.5028, 1.8333], // Laamu (Fonadhoo)
          [72.9997, 0.5317], // Gaafu Dhaalu (Thinadhoo)
          [73.4242, -0.2989], // Gnaviyani (Fuvahmulah)
          [73.0880, -0.6015], // Seenu (Addu City / Hithadhoo Teleport)
        ],
      },
    },
  ],
};

// ─── 3. MOBILE 5G ULTRA-BROADBAND COVERAGE ZONES ───
export const MOBILE_COVERAGE_5G_GEOJSON: GeoJSON.FeatureCollection<GeoJSON.Polygon> = {
  type: 'FeatureCollection',
  features: [
    // 5G Greater Malé Metropolitan Urban Envelope (Malé, Hulhumalé Phase 1 & 2, Villimalé, Airport Island)
    {
      type: 'Feature',
      properties: {
        id: 'cov-5g-male',
        name: 'Greater Malé 5G Ultra-Broadband Zone',
        operator: 'Dhiraagu & Ooredoo (Dual 3.5 GHz n78)',
        tier: '5G_SA_URBAN',
        speedMbps: 1200,
        coverageType: 'Urban Metropolitan & Velana International Airport',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [73.485, 4.150],
            [73.555, 4.150],
            [73.565, 4.240],
            [73.535, 4.245],
            [73.480, 4.200],
            [73.485, 4.150],
          ],
        ],
      },
    },
    // 5G Addu City Urban Zone (Hithadhoo, Maradhoo, Feydhoo, Gan Airport)
    {
      type: 'Feature',
      properties: {
        id: 'cov-5g-addu',
        name: 'Addu City 5G High-Speed Corridor',
        operator: 'Dhiraagu / Ooredoo 5G',
        tier: '5G_REGIONAL_CITY',
        speedMbps: 850,
        coverageType: 'Addu Causeway Corridor & Gan International',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [73.070, -0.660],
            [73.180, -0.660],
            [73.180, -0.570],
            [73.070, -0.570],
            [73.070, -0.660],
          ],
        ],
      },
    },
    // 5G Kulhudhuffushi Northern Urban Center
    {
      type: 'Feature',
      properties: {
        id: 'cov-5g-kulhudhuffushi',
        name: 'Kulhudhuffushi City 5G Smart Island',
        operator: 'Ooredoo / Dhiraagu 5G',
        tier: '5G_REGIONAL_CITY',
        speedMbps: 750,
        coverageType: 'Northern Commercial Harbor & Regional Hospital',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [73.045, 6.600],
            [73.090, 6.600],
            [73.090, 6.650],
            [73.045, 6.650],
            [73.045, 6.600],
          ],
        ],
      },
    },
    // 5G Fuvahmulah City (One Island Atoll)
    {
      type: 'Feature',
      properties: {
        id: 'cov-5g-fuvahmulah',
        name: 'Fuvahmulah City 5G Island-wide Grid',
        operator: 'Dhiraagu & Ooredoo',
        tier: '5G_REGIONAL_CITY',
        speedMbps: 800,
        coverageType: 'UNESCO Biosphere & Domestic Airport Corridor',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [73.405, -0.320],
            [73.445, -0.320],
            [73.445, -0.275],
            [73.405, -0.275],
            [73.405, -0.320],
          ],
        ],
      },
    },
    // 5G Thinadhoo City (Gaafu Dhaalu Hub)
    {
      type: 'Feature',
      properties: {
        id: 'cov-5g-thinadhoo',
        name: 'Thinadhoo City 5G Commercial Zone',
        operator: 'Dhiraagu 5G',
        tier: '5G_REGIONAL_CITY',
        speedMbps: 720,
        coverageType: 'Southern Business Center & Islamic Center',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [72.980, 0.515],
            [73.020, 0.515],
            [73.020, 0.550],
            [72.980, 0.550],
            [72.980, 0.515],
          ],
        ],
      },
    },
  ],
};

// ─── 4. MOBILE 4G LTE-ADVANCED NATIONWIDE & MARITIME LAGOON COVERAGE ───
export const MOBILE_COVERAGE_4G_GEOJSON: GeoJSON.FeatureCollection<GeoJSON.Polygon> = {
  type: 'FeatureCollection',
  features: [
    // Northern Atolls Envelope (Haa Alif, Haa Dhaalu, Shaviyani, Noonu)
    {
      type: 'Feature',
      properties: {
        id: 'cov-4g-north',
        name: 'Northern Atolls 4G LTE-A Archipelago Coverage',
        operator: 'Dhiraagu 100% & Ooredoo 4G+',
        technology: 'LTE-Advanced (B3 1800MHz / B8 900MHz)',
        coveragePercent: '100% Inhabited Islands',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [72.75, 5.65],
            [73.55, 5.65],
            [73.55, 7.15],
            [72.75, 7.15],
            [72.75, 5.65],
          ],
        ],
      },
    },
    // Central Atolls Envelope (Raa, Baa, Lhaviyani, Kaafu, Alif Alif, Alif Dhaal, Vaavu)
    {
      type: 'Feature',
      properties: {
        id: 'cov-4g-central',
        name: 'Central Atolls & Tourism Corridors 4G LTE-A',
        operator: 'Dhiraagu & Ooredoo SuperNet',
        technology: 'LTE-Advanced Carrier Aggregation (300 Mbps)',
        coveragePercent: '100% Inhabited & 170+ Resort Islands',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [72.65, 3.20],
            [73.75, 3.20],
            [73.75, 5.65],
            [72.65, 5.65],
            [72.65, 3.20],
          ],
        ],
      },
    },
    // Southern Atolls Envelope (Meemu, Faafu, Dhaalu, Thaa, Laamu, Huvadhoo, Fuvahmulah, Addu)
    {
      type: 'Feature',
      properties: {
        id: 'cov-4g-south',
        name: 'Southern Deep Ocean & Atolls 4G LTE-A Envelope',
        operator: 'Dhiraagu & Ooredoo Maritime GSM',
        technology: 'LTE-A Deep-Penetration 900MHz + 1800MHz',
        coveragePercent: '100% Inhabited Islands & Offshore Fishing Grounds',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [72.70, -0.75],
            [73.65, -0.75],
            [73.65, 3.20],
            [72.70, 3.20],
            [72.70, -0.75],
          ],
        ],
      },
    },
  ],
};

// ─── 5. CELL TOWER INFRASTRUCTURE (BTS NODES) ───
export interface CellTowerNode {
  id: string;
  name: string;
  operator: 'Dhiraagu' | 'Ooredoo' | 'Shared Telecom Mast';
  atoll: string;
  coordinates: [number, number];
  technology: '5G SA + 4G LTE-A' | '4G LTE-A High-Power';
  mastHeightMeters: number;
  powerSource: 'GRID_ONLINE' | 'SOLAR_DIESEL_HYBRID' | 'UPS_BATTERY_STANDBY';
  status: 'ONLINE' | 'STANDBY_GENERATOR' | 'DEGRADED';
}

export const CELL_TOWERS: CellTowerNode[] = [
  {
    id: 'tower-dhiraagu-hq',
    name: 'Dhiraagu Head Office National Teleport Mast',
    operator: 'Dhiraagu',
    atoll: 'Kaafu (Malé)',
    coordinates: [73.5135, 4.1755],
    technology: '5G SA + 4G LTE-A',
    mastHeightMeters: 65,
    powerSource: 'GRID_ONLINE',
    status: 'ONLINE',
  },
  {
    id: 'tower-ooredoo-hq',
    name: 'Ooredoo Maldives Central Tower',
    operator: 'Ooredoo',
    atoll: 'Kaafu (Hulhumalé Phase 1)',
    coordinates: [73.5385, 4.2140],
    technology: '5G SA + 4G LTE-A',
    mastHeightMeters: 60,
    powerSource: 'GRID_ONLINE',
    status: 'ONLINE',
  },
  {
    id: 'tower-vrmm-airport',
    name: 'Velana International Aviation Teleport Mast',
    operator: 'Shared Telecom Mast',
    atoll: 'Kaafu (Hulhulé)',
    coordinates: [73.5290, 4.1918],
    technology: '5G SA + 4G LTE-A',
    mastHeightMeters: 45,
    powerSource: 'GRID_ONLINE',
    status: 'ONLINE',
  },
  {
    id: 'tower-kulhudhuffushi',
    name: 'Kulhudhuffushi Northern Gateway Mast',
    operator: 'Dhiraagu',
    atoll: 'Haa Dhaalu (Kulhudhuffushi)',
    coordinates: [73.0700, 6.6220],
    technology: '5G SA + 4G LTE-A',
    mastHeightMeters: 68,
    powerSource: 'GRID_ONLINE',
    status: 'ONLINE',
  },
  {
    id: 'tower-eydhafushi',
    name: 'Baa Atoll Regional Relay Mast',
    operator: 'Dhiraagu',
    atoll: 'Baa (Eydhafushi)',
    coordinates: [73.0710, 5.1030],
    technology: '4G LTE-A High-Power',
    mastHeightMeters: 52,
    powerSource: 'GRID_ONLINE',
    status: 'ONLINE',
  },
  {
    id: 'tower-thinadhoo',
    name: 'Huvadhoo Southern Backbone Mast',
    operator: 'Shared Telecom Mast',
    atoll: 'Gaafu Dhaalu (Thinadhoo)',
    coordinates: [72.9980, 0.5310],
    technology: '5G SA + 4G LTE-A',
    mastHeightMeters: 58,
    powerSource: 'GRID_ONLINE',
    status: 'ONLINE',
  },
  {
    id: 'tower-fuvahmulah',
    name: 'Fuvahmulah Municipal Teleport',
    operator: 'Ooredoo',
    atoll: 'Gnaviyani (Fuvahmulah)',
    coordinates: [73.4242, -0.2989],
    technology: '5G SA + 4G LTE-A',
    mastHeightMeters: 55,
    powerSource: 'GRID_ONLINE',
    status: 'ONLINE',
  },
  {
    id: 'tower-addu-hithadhoo',
    name: 'Addu City Southern Teleport Mast',
    operator: 'Dhiraagu',
    atoll: 'Seenu (Addu City / Hithadhoo)',
    coordinates: [73.0890, -0.6010],
    technology: '5G SA + 4G LTE-A',
    mastHeightMeters: 72,
    powerSource: 'SOLAR_DIESEL_HYBRID',
    status: 'ONLINE',
  },
];

// ─── 6. LIVE NETWORK INCIDENTS & OUTAGE TRACKER ───
export interface NetworkOutageIncident {
  id: string;
  island: string;
  atoll: string;
  coordinates: [number, number];
  operator: 'Dhiraagu' | 'Ooredoo' | 'Shared Telecom';
  severity: 'DEGRADED' | 'MAINTENANCE' | 'STANDBY_POWER' | 'RESOLVED';
  type: 'MICROWAVE_RAIN_FADE' | 'OPTICAL_CORE_UPGRADE' | 'ISLAND_POWER_GRID_TRIP';
  title: string;
  cause: string;
  impact: string;
  affectedSubscribers: number;
  etaRecovery: string;
  backupStatus: string;
  startedAt: string;
}

export const NETWORK_OUTAGES: NetworkOutageIncident[] = [
  {
    id: 'outage-baa-01',
    island: 'Fehendhoo',
    atoll: 'Baa Atoll',
    coordinates: [72.9814, 4.8889],
    operator: 'Dhiraagu',
    severity: 'DEGRADED',
    type: 'MICROWAVE_RAIN_FADE',
    title: 'Baa Fehendhoo Inter-Island Microwave Hop Rain Fade',
    cause: 'Intense monsoon squall rain fade on 18 GHz inter-island microwave relay between Fulhadhoo and Fehendhoo.',
    impact: 'Mobile 4G data latency elevated to 165ms; High-speed broadband throttled. Voice calls fallback to 3G.',
    affectedSubscribers: 1420,
    etaRecovery: 'Est. 35 mins (awaiting squall line clearance)',
    backupStatus: 'Secondary 6 GHz low-frequency link active with packet prioritization for emergency services.',
    startedAt: '42 mins ago',
  },
  {
    id: 'outage-ga-01',
    island: 'Villingili',
    atoll: 'Gaafu Alifu Atoll',
    coordinates: [73.4358, 0.7578],
    operator: 'Ooredoo',
    severity: 'MAINTENANCE',
    type: 'OPTICAL_CORE_UPGRADE',
    title: 'Gaafu Alifu Villingili Subsea DWDM Optical Patching',
    cause: 'Scheduled ISP line-card hardware upgrade & optical SFP replacement on southern subsea fiber ring terminal node.',
    impact: '5G mobile data temporarily switched to microwave bypass ring; peak throughput capped at 100 Mbps.',
    affectedSubscribers: 2850,
    etaRecovery: 'Est. 20 mins (completion expected ahead of schedule)',
    backupStatus: 'Traffic safely rerouted through Dhaalu Kudahuvadhoo microwave bypass loop.',
    startedAt: '1h 15m ago',
  },
  {
    id: 'outage-lh-01',
    island: 'Kurendhoo',
    atoll: 'Lhaviyani Atoll',
    coordinates: [73.4667, 5.3333],
    operator: 'Shared Telecom',
    severity: 'STANDBY_POWER',
    type: 'ISLAND_POWER_GRID_TRIP',
    title: 'Lhaviyani Kurendhoo Island Grid Trip (UPS Battery Active)',
    cause: 'Island utility company generator breaker trip; cell tower successfully switched to smart lithium UPS batteries.',
    impact: 'Tower emitting at 100% full RF signal. Battery bank capacity at 78% (approx. 4.1 hours reserve time remaining).',
    affectedSubscribers: 1980,
    etaRecovery: 'Island utility technicians resetting feeder busbar',
    backupStatus: 'Smart DC battery bank holding 48V bus stable; backup diesel generator on auto-standby.',
    startedAt: '55 mins ago',
  },
];

// ─── 7. NATIONAL TELECOM HEALTH METRICS ───
export const TELECOM_HEALTH_METRICS = {
  nationalUptimePercent: 99.98,
  inhabitedIslandsConnected: 187,
  inhabitedIslandsDegraded: 2,
  activeSubseaGateways: 5,
  totalInternationalCapacityTbps: 272,
  populationCoverage4G: 100,
  populationCoverage5G: 78.4,
  activeIncidentsCount: NETWORK_OUTAGES.length,
  latencyBenchmarks: [
    { destination: 'Colombo, Sri Lanka', pingMs: 16, status: 'EXCELLENT' },
    { destination: 'Trivandrum, India', pingMs: 22, status: 'EXCELLENT' },
    { destination: 'Singapore (Tuas)', pingMs: 31, status: 'EXCELLENT' },
    { destination: 'Dubai, UAE', pingMs: 44, status: 'EXCELLENT' },
    { destination: 'London, UK', pingMs: 112, status: 'GOOD' },
  ],
};
