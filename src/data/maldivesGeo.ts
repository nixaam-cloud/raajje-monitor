/**
 * Maldives Geospatial Domain Catalog
 * Geographic Bounding Box, 26 Natural Atolls, 20 Administrative Divisions,
 * SLOC Strategic Maritime Chokepoints, International/Domestic Airports,
 * Seaplane Hubs, Ports, and Exclusive Economic Zone (EEZ) Boundary.
 */

export interface GeoCoordinate {
  lng: number;
  lat: number;
}

export interface Atoll {
  id: string;
  code: string;
  name: string;
  dhivehiName: string;
  capital: string;
  coordinates: [number, number]; // [lng, lat]
  zone: 'NORTH' | 'CENTRAL' | 'SOUTH';
  populationEst: number;
  resortCount: number;
  hazardVulnerability: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

export interface Chokepoint {
  id: string;
  name: string;
  dhivehiName: string;
  latitude: number;
  description: string;
  strategicImportance: string;
  dailyVesselTransitEst: number;
  coordinates: [[number, number], [number, number]]; // Line from west to east
}

export interface Airport {
  iata: string;
  icao: string;
  name: string;
  atoll: string;
  type: 'INTERNATIONAL' | 'DOMESTIC' | 'SEAPLANE_HUB';
  coordinates: [number, number];
  elevationFt: number;
  runway: string;
}

export interface PortFacility {
  id: string;
  name: string;
  atoll: string;
  type: 'COMMERCIAL_PORT' | 'INDUSTRIAL' | 'REGIONAL' | 'ANCHORAGE';
  coordinates: [number, number];
  berths: number;
  maxDraftMeters: number;
  status: 'OPERATIONAL' | 'CONGESTED' | 'RESTRICTED';
}

// Bounding Box Coordinates
export const MALDIVES_BOUNDS = {
  sw: [69.5, -3.5] as [number, number],
  ne: [77.5, 9.5] as [number, number],
  center: [73.5, 3.2] as [number, number],
  defaultZoom: 5.8,
};

// 20 Administrative Atoll Divisions encompassing 26 Natural Atolls
export const MALDIVES_ATOLLS: Atoll[] = [
  {
    id: 'haa-alif',
    code: 'HA',
    name: 'Haa Alif (Thiladhunmathi Uthuruburi)',
    dhivehiName: 'ހއ. އަތޮޅު',
    capital: 'Dhidhdhoo',
    coordinates: [73.1139, 6.8875],
    zone: 'NORTH',
    populationEst: 15400,
    resortCount: 4,
    hazardVulnerability: 'MODERATE',
  },
  {
    id: 'haa-dhaalu',
    code: 'HDh',
    name: 'Haa Dhaalu (Thiladhunmathi Dhekunuburi)',
    dhivehiName: 'ހދ. އަތޮޅު',
    capital: 'Kulhudhuffushi City',
    coordinates: [73.0700, 6.6222],
    zone: 'NORTH',
    populationEst: 21500,
    resortCount: 3,
    hazardVulnerability: 'HIGH',
  },
  {
    id: 'shaviyani',
    code: 'Sh',
    name: 'Shaviyani (Miladhunmadulu Uthuruburi)',
    dhivehiName: 'ށ. އަތޮޅު',
    capital: 'Funadhoo',
    coordinates: [73.2908, 6.1500],
    zone: 'NORTH',
    populationEst: 14200,
    resortCount: 5,
    hazardVulnerability: 'MODERATE',
  },
  {
    id: 'noonu',
    code: 'N',
    name: 'Noonu (Miladhunmadulu Dhekunuburi)',
    dhivehiName: 'ނ. އަތޮޅު',
    capital: 'Manadhoo',
    coordinates: [73.4142, 5.7667],
    zone: 'NORTH',
    populationEst: 12800,
    resortCount: 9,
    hazardVulnerability: 'MODERATE',
  },
  {
    id: 'raa',
    code: 'R',
    name: 'Raa (Maalhosmadulu Uthuruburi)',
    dhivehiName: 'ރ. އަތޮޅު',
    capital: 'Ungoofaaru',
    coordinates: [73.0300, 5.6739],
    zone: 'NORTH',
    populationEst: 17300,
    resortCount: 16,
    hazardVulnerability: 'MODERATE',
  },
  {
    id: 'baa',
    code: 'B',
    name: 'Baa (Maalhosmadulu Dhekunuburi - UNESCO Biosphere)',
    dhivehiName: 'ބ. އަތޮޅު',
    capital: 'Eydhafushi',
    coordinates: [73.0706, 5.1039],
    zone: 'NORTH',
    populationEst: 14000,
    resortCount: 18,
    hazardVulnerability: 'HIGH',
  },
  {
    id: 'lhaviyani',
    code: 'Lh',
    name: 'Lhaviyani (Faadhippolhu)',
    dhivehiName: 'ޅ. އަތޮޅު',
    capital: 'Naifaru',
    coordinates: [73.3658, 5.4444],
    zone: 'NORTH',
    populationEst: 11900,
    resortCount: 11,
    hazardVulnerability: 'MODERATE',
  },
  {
    id: 'kaafu',
    code: 'K',
    name: 'Kaafu (Malé Atoll / Capital District)',
    dhivehiName: 'ކ. އަތޮޅު',
    capital: 'Malé / Thulusdhoo',
    coordinates: [73.5093, 4.1755],
    zone: 'CENTRAL',
    populationEst: 250000,
    resortCount: 52,
    hazardVulnerability: 'CRITICAL',
  },
  {
    id: 'alif-alif',
    code: 'AA',
    name: 'Alif Alif (Ari Atoll Uthuruburi)',
    dhivehiName: 'އއ. އަތޮޅު',
    capital: 'Rasdhoo',
    coordinates: [72.9961, 4.2631],
    zone: 'CENTRAL',
    populationEst: 8400,
    resortCount: 30,
    hazardVulnerability: 'HIGH',
  },
  {
    id: 'alif-dhaal',
    code: 'ADh',
    name: 'Alif Dhaal (Ari Atoll Dhekunuburi)',
    dhivehiName: 'އދ. އަތޮޅު',
    capital: 'Mahibadhoo',
    coordinates: [72.9692, 3.7572],
    zone: 'CENTRAL',
    populationEst: 9600,
    resortCount: 34,
    hazardVulnerability: 'HIGH',
  },
  {
    id: 'vaavu',
    code: 'V',
    name: 'Vaavu (Felidhu Atoll)',
    dhivehiName: 'ވ. އަތޮޅު',
    capital: 'Felidhoo',
    coordinates: [73.5486, 3.4719],
    zone: 'CENTRAL',
    populationEst: 2800,
    resortCount: 6,
    hazardVulnerability: 'MODERATE',
  },
  {
    id: 'meemu',
    code: 'M',
    name: 'Meemu (Mulaku Atoll)',
    dhivehiName: 'މ. އަތޮޅު',
    capital: 'Muli',
    coordinates: [73.5806, 2.9214],
    zone: 'CENTRAL',
    populationEst: 5600,
    resortCount: 4,
    hazardVulnerability: 'HIGH',
  },
  {
    id: 'faafu',
    code: 'F',
    name: 'Faafu (Nilandhe Atholhu Uthuruburi)',
    dhivehiName: 'ފ. އަތޮޅު',
    capital: 'Nilandhoo',
    coordinates: [72.8906, 3.0567],
    zone: 'CENTRAL',
    populationEst: 4700,
    resortCount: 2,
    hazardVulnerability: 'MODERATE',
  },
  {
    id: 'dhaalu',
    code: 'Dh',
    name: 'Dhaalu (Nilandhe Atholhu Dhekunuburi)',
    dhivehiName: 'ދ. އަތޮޅު',
    capital: 'Kudahuvadhoo',
    coordinates: [72.8944, 2.6708],
    zone: 'CENTRAL',
    populationEst: 7200,
    resortCount: 9,
    hazardVulnerability: 'HIGH',
  },
  {
    id: 'thaa',
    code: 'Th',
    name: 'Thaa (Kolhumadulu)',
    dhivehiName: 'ތ. އަތޮޅު',
    capital: 'Veymandoo',
    coordinates: [73.0944, 2.1878],
    zone: 'SOUTH',
    populationEst: 11200,
    resortCount: 3,
    hazardVulnerability: 'HIGH',
  },
  {
    id: 'laamu',
    code: 'L',
    name: 'Laamu (Haddhunmathi)',
    dhivehiName: 'ލ. އަތޮޅު',
    capital: 'Fonadhoo',
    coordinates: [73.5028, 1.8333],
    zone: 'SOUTH',
    populationEst: 14500,
    resortCount: 4,
    hazardVulnerability: 'HIGH',
  },
  {
    id: 'gaafu-alif',
    code: 'GA',
    name: 'Gaafu Alif (Huvadhu Atoll Uthuruburi)',
    dhivehiName: 'ގއ. އަތޮޅު',
    capital: 'Villingili',
    coordinates: [73.4356, 0.7561],
    zone: 'SOUTH',
    populationEst: 10800,
    resortCount: 8,
    hazardVulnerability: 'HIGH',
  },
  {
    id: 'gaafu-dhaalu',
    code: 'GDh',
    name: 'Gaafu Dhaalu (Huvadhu Atoll Dhekunuburi)',
    dhivehiName: 'ގދ. އަތޮޅު',
    capital: 'Thinadhoo City',
    coordinates: [72.9997, 0.5317],
    zone: 'SOUTH',
    populationEst: 15100,
    resortCount: 7,
    hazardVulnerability: 'HIGH',
  },
  {
    id: 'gnaviyani',
    code: 'Gn',
    name: 'Gnaviyani (Fuvahmulah City)',
    dhivehiName: 'ޏ. އަތޮޅު',
    capital: 'Fuvahmulah City',
    coordinates: [73.4242, -0.2989],
    zone: 'SOUTH',
    populationEst: 13500,
    resortCount: 1,
    hazardVulnerability: 'CRITICAL',
  },
  {
    id: 'seenu',
    code: 'S',
    name: 'Seenu (Addu City)',
    dhivehiName: 'ސ. އަތޮޅު',
    capital: 'Hithadhoo / Addu City',
    coordinates: [73.0894, -0.6036],
    zone: 'SOUTH',
    populationEst: 34000,
    resortCount: 4,
    hazardVulnerability: 'HIGH',
  },
];

// Strategic Maritime Sea Lanes of Communication (SLOC)
export const STRATEGIC_CHOKEPOINTS: Chokepoint[] = [
  {
    id: 'eight-degree-channel',
    name: 'Eight Degree Channel',
    dhivehiName: 'މަލިކު ކަނޑު',
    latitude: 7.2,
    description: 'Separates Minicoy Island (India) and Ihavandhippolhu Atoll (Maldives). Critical East-West energy artery carrying crude from Persian Gulf to Malacca Strait.',
    strategicImportance: 'CRITICAL SLOC - Heavy VLCC Tanker Traffic',
    dailyVesselTransitEst: 120,
    coordinates: [[71.2, 7.2], [75.2, 7.2]],
  },
  {
    id: 'kardiva-channel',
    name: 'Kardiva Channel (Kaashidhoo Kandu)',
    dhivehiName: 'ކާށިދޫ ކަނޑު',
    latitude: 4.9,
    description: 'Deep navigable oceanic corridor dividing northern and central atolls. Prime route for inter-atoll commercial shipping and cruise vessels.',
    strategicImportance: 'MAJOR INTER-ATOLL PASSAGE',
    dailyVesselTransitEst: 45,
    coordinates: [[72.4, 4.9], [74.5, 4.9]],
  },
  {
    id: 'one-and-half-degree-channel',
    name: 'One and a Half Degree Channel (Huvadhoo Kandu)',
    dhivehiName: 'ހުވަދޫ ކަނޑު',
    latitude: 1.5,
    description: 'Broad, deep maritime trench separating Laamu and Huvadhoo Atolls. Busiest container and dry-bulk transit zone south of Sri Lanka.',
    strategicImportance: 'GLOBAL CONTAINER TRANSIT SLOC',
    dailyVesselTransitEst: 85,
    coordinates: [[71.5, 1.5], [75.0, 1.5]],
  },
  {
    id: 'equatorial-channel',
    name: 'Equatorial Channel (Addu Kandu)',
    dhivehiName: 'އައްޑޫ ކަނޑު',
    latitude: 0.0,
    description: 'Crosses directly at Latitude 0°00\'00", between Huvadhoo Atoll and Fuvahmulah / Addu. Deep ocean route avoided by storms, monitored for illegal IUU fishing.',
    strategicImportance: 'SOUTHERN SOVEREIGN MARITIME WATCH',
    dailyVesselTransitEst: 35,
    coordinates: [[71.8, 0.0], [74.8, 0.0]],
  },
];

// Airports & Seaplane Terminals
export const MALDIVES_AIRPORTS: Airport[] = [
  {
    iata: 'MLE',
    icao: 'VRMM',
    name: 'Velana International Airport',
    atoll: 'Kaafu (Hulhulé)',
    type: 'INTERNATIONAL',
    coordinates: [73.5290, 4.1918],
    elevationFt: 6,
    runway: '18/36 (3,200m Code-F)',
  },
  {
    iata: 'GAN',
    icao: 'VRMG',
    name: 'Gan International Airport',
    atoll: 'Seenu (Addu City)',
    type: 'INTERNATIONAL',
    coordinates: [73.1556, -0.6933],
    elevationFt: 6,
    runway: '10/28 (2,650m)',
  },
  {
    iata: 'NMF',
    icao: 'VRDA',
    name: 'Maafaru International Airport',
    atoll: 'Noonu (Maafaru)',
    type: 'INTERNATIONAL',
    coordinates: [73.4725, 5.8236],
    elevationFt: 5,
    runway: '05/23 (2,850m)',
  },
  {
    iata: 'HAQ',
    icao: 'VRMH',
    name: 'Hanimaadhoo International Airport',
    atoll: 'Haa Dhaalu (Hanimaadhoo)',
    type: 'INTERNATIONAL',
    coordinates: [73.1694, 6.7464],
    elevationFt: 3,
    runway: '03/21 (2,460m)',
  },
  {
    iata: 'DRV',
    icao: 'VRMD',
    name: 'Dharavandhoo Airport',
    atoll: 'Baa (Dharavandhoo)',
    type: 'DOMESTIC',
    coordinates: [73.1306, 5.1583],
    elevationFt: 4,
    runway: '11/29 (1,189m)',
  },
  {
    iata: 'VAM',
    icao: 'VRMV',
    name: 'Villa Airport Maamigili',
    atoll: 'Alif Dhaal (Maamigili)',
    type: 'DOMESTIC',
    coordinates: [72.8361, 3.4722],
    elevationFt: 6,
    runway: '09/27 (1,800m)',
  },
  {
    iata: 'IFU',
    icao: 'VREI',
    name: 'Ifuru Domestic Airport',
    atoll: 'Raa (Ifuru)',
    type: 'DOMESTIC',
    coordinates: [73.0256, 5.7078],
    elevationFt: 4,
    runway: '18/36 (1,200m)',
  },
  {
    iata: 'KDO',
    icao: 'VRMK',
    name: 'Kadhdhoo Airport',
    atoll: 'Laamu (Kadhdhoo)',
    type: 'DOMESTIC',
    coordinates: [73.5200, 1.8592],
    elevationFt: 5,
    runway: '03/21 (1,220m)',
  },
  {
    iata: 'GKK',
    icao: 'VRMO',
    name: 'Kooddoo Airport',
    atoll: 'Gaafu Alif (Kooddoo)',
    type: 'DOMESTIC',
    coordinates: [73.4333, 0.7308],
    elevationFt: 6,
    runway: '17/35 (1,800m)',
  },
  {
    iata: 'FVM',
    icao: 'VRMR',
    name: 'Fuvahmulah Airport',
    atoll: 'Gnaviyani (Fuvahmulah)',
    type: 'DOMESTIC',
    coordinates: [73.4319, -0.3061],
    elevationFt: 6,
    runway: '11/29 (1,200m)',
  },
  {
    iata: 'TMA',
    icao: 'VRMS',
    name: 'Malé Water Aerodrome (TMA/Manta Seaplane Base)',
    atoll: 'Kaafu (Hulhulé Lagoon)',
    type: 'SEAPLANE_HUB',
    coordinates: [73.5350, 4.1960],
    elevationFt: 0,
    runway: 'Water Runways N/S, E/W (World\'s Busiest Seaplane Base)',
  },
];

// Critical Commercial & Industrial Ports
export const MALDIVES_PORTS: PortFacility[] = [
  {
    id: 'male-commercial-harbor',
    name: 'Malé Commercial Harbor (MPL)',
    atoll: 'Kaafu (Malé)',
    type: 'COMMERCIAL_PORT',
    coordinates: [73.5042, 4.1795],
    berths: 4,
    maxDraftMeters: 9.5,
    status: 'CONGESTED',
  },
  {
    id: 'thilafushi-industrial-harbor',
    name: 'Thilafushi Industrial Harbor & Anchorage',
    atoll: 'Kaafu (Thilafushi)',
    type: 'INDUSTRIAL',
    coordinates: [73.4475, 4.1819],
    berths: 6,
    maxDraftMeters: 12.0,
    status: 'OPERATIONAL',
  },
  {
    id: 'kulhudhuffushi-regional-port',
    name: 'Kulhudhuffushi Regional Port (KRP)',
    atoll: 'Haa Dhaalu (Kulhudhuffushi)',
    type: 'REGIONAL',
    coordinates: [73.0650, 6.6210],
    berths: 2,
    maxDraftMeters: 6.5,
    status: 'OPERATIONAL',
  },
  {
    id: 'hithadhoo-regional-port',
    name: 'Hithadhoo Regional Port (HRP)',
    atoll: 'Seenu (Addu City)',
    type: 'REGIONAL',
    coordinates: [73.0850, -0.6010],
    berths: 2,
    maxDraftMeters: 8.0,
    status: 'OPERATIONAL',
  },
];

// Exclusive Economic Zone (EEZ) Boundary Polygon Coordinates (~900,000 sq km)
export const MALDIVES_EEZ_GEOJSON: GeoJSON.Feature<GeoJSON.Polygon> = {
  type: 'Feature',
  properties: {
    name: 'Maldives Exclusive Economic Zone (EEZ)',
    areaSqKm: 923000,
    treaties: 'UNCLOS 1982 / India-Maldives Maritime Agreement 1976 / Sri Lanka Boundary',
  },
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [72.5, 7.8],
        [73.5, 7.9],
        [74.5, 7.5],
        [75.6, 6.4],
        [76.0, 4.8],
        [76.2, 3.2],
        [76.0, 1.2],
        [75.5, -0.5],
        [74.8, -2.0],
        [73.8, -2.6],
        [72.8, -2.6],
        [71.8, -1.8],
        [71.0, -0.5],
        [70.8, 1.5],
        [71.0, 3.5],
        [71.2, 5.5],
        [71.8, 7.0],
        [72.5, 7.8],
      ],
    ],
  },
};
