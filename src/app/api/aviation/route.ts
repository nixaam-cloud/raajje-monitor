import { NextResponse } from 'next/server';
import { INDIAN_OCEAN_MILITARY_FLIGHTS } from '@/data/indianOceanAviation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface AviationFlight {
  id: string;
  icao24: string;
  callsign: string;
  operator: string;
  aircraftType: string;
  aircraftCategory: 'INTERNATIONAL_WIDEBODY' | 'REGIONAL_TURBOPROP' | 'SEAPLANE_TWIN_OTTER' | 'MILITARY';
  origin: string;
  destination: string;
  originCode?: string; // e.g. 'DXB', 'MLE', 'LHR', 'GAN'
  destinationCode?: string; // e.g. 'MLE', 'SIN', 'FRA'
  flightDirection: 'INBOUND' | 'OUTBOUND' | 'DOMESTIC' | 'OVERFLIGHT';
  isMaldivesRelated: boolean;
  coordinates: [number, number]; // [lng, lat]
  altitudeFt: number;
  velocityKts: number;
  headingDeg: number;
  verticalRateFpm: number;
  squawk: string;
  flightPhase: 'CRUISE' | 'APPROACH' | 'CLIMB' | 'FINAL' | 'TAXI';
  history: [number, number][];
  inEEZ?: boolean;
  airwaySector?: string;
  registration?: string;
  flightNumber?: string;
  isMilitary?: boolean;
  militaryRole?: string;
  /** LIVE_ADSB = real receiver data; SIMULATED_ADSB = offline fallback fleet; MODELED_OSINT = representative military picture */
  dataQuality?: 'LIVE_ADSB' | 'SIMULATED_ADSB' | 'MODELED_OSINT';
}

const FALLBACK_FLIGHTS: AviationFlight[] = [
  // ─── 1. INBOUND TO MALDIVES (DESTINATION: MALDIVES AIRPORTS) ───
  {
    id: 'flt-ek658',
    icao24: '896421',
    callsign: 'UAE658',
    operator: 'Emirates',
    aircraftType: 'Boeing 777-300ER',
    aircraftCategory: 'INTERNATIONAL_WIDEBODY',
    origin: 'Dubai International (DXB)',
    destination: 'Velana International (VRMM / MLE)',
    originCode: 'DXB',
    destinationCode: 'MLE',
    flightDirection: 'INBOUND',
    isMaldivesRelated: true,
    coordinates: [73.42, 4.38],
    altitudeFt: 5200,
    velocityKts: 210,
    headingDeg: 182,
    verticalRateFpm: -800,
    squawk: '4210',
    flightPhase: 'APPROACH',
    history: [[73.38, 4.65], [73.40, 4.52], [73.42, 4.38]],
    inEEZ: true,
    airwaySector: 'Velana North Arrival // STAR ARROW-1B',
  },
  {
    id: 'flt-qtr672',
    icao24: '06a20b',
    callsign: 'QTR672',
    operator: 'Qatar Airways',
    aircraftType: 'Airbus A350-900',
    aircraftCategory: 'INTERNATIONAL_WIDEBODY',
    origin: 'Hamad International (DOH)',
    destination: 'Velana International (VRMM / MLE)',
    originCode: 'DOH',
    destinationCode: 'MLE',
    flightDirection: 'INBOUND',
    isMaldivesRelated: true,
    coordinates: [73.518, 4.26],
    altitudeFt: 2100,
    velocityKts: 165,
    headingDeg: 180,
    verticalRateFpm: -650,
    squawk: '6721',
    flightPhase: 'FINAL',
    history: [[73.48, 4.45], [73.50, 4.35], [73.518, 4.26]],
    inEEZ: true,
    airwaySector: 'Runway 18 ILS Final Approach',
  },
  {
    id: 'flt-sia438',
    icao24: '76ce12',
    callsign: 'SIA438',
    operator: 'Singapore Airlines',
    aircraftType: 'Boeing 787-10 Dreamliner',
    aircraftCategory: 'INTERNATIONAL_WIDEBODY',
    origin: 'Singapore Changi (SIN)',
    destination: 'Velana International (VRMM / MLE)',
    originCode: 'SIN',
    destinationCode: 'MLE',
    flightDirection: 'INBOUND',
    isMaldivesRelated: true,
    coordinates: [74.45, 3.85],
    altitudeFt: 24000,
    velocityKts: 430,
    headingDeg: 298,
    verticalRateFpm: -1400,
    squawk: '5532',
    flightPhase: 'APPROACH',
    history: [[75.2, 3.4], [74.8, 3.6], [74.45, 3.85]],
    inEEZ: true,
    airwaySector: 'Eastern EEZ Inbound Corridor',
  },
  {
    id: 'flt-baw061',
    icao24: '407189',
    callsign: 'BAW061',
    operator: 'British Airways',
    aircraftType: 'Boeing 777-200ER',
    aircraftCategory: 'INTERNATIONAL_WIDEBODY',
    origin: 'London Heathrow (LHR)',
    destination: 'Velana International (VRMM / MLE)',
    originCode: 'LHR',
    destinationCode: 'MLE',
    flightDirection: 'INBOUND',
    isMaldivesRelated: true,
    coordinates: [72.85, 4.95],
    altitudeFt: 21000,
    velocityKts: 410,
    headingDeg: 135,
    verticalRateFpm: -1800,
    squawk: '3104',
    flightPhase: 'APPROACH',
    history: [[72.1, 5.5], [72.45, 5.25], [72.85, 4.95]],
    inEEZ: true,
    airwaySector: 'Northwestern EEZ Descent Corridor',
  },
  {
    id: 'flt-dlh756',
    icao24: '3c65a4',
    callsign: 'DLH756',
    operator: 'Lufthansa',
    aircraftType: 'Airbus A340-300',
    aircraftCategory: 'INTERNATIONAL_WIDEBODY',
    origin: 'Frankfurt (FRA)',
    destination: 'Velana International (VRMM / MLE)',
    originCode: 'FRA',
    destinationCode: 'MLE',
    flightDirection: 'INBOUND',
    isMaldivesRelated: true,
    coordinates: [71.80, 7.80],
    altitudeFt: 33000,
    velocityKts: 480,
    headingDeg: 142,
    verticalRateFpm: -900,
    squawk: '2119',
    flightPhase: 'CRUISE',
    history: [[71.0, 8.4], [71.4, 8.1], [71.80, 7.80]],
    inEEZ: true,
    airwaySector: 'Northern EEZ Entry (Minicoy FIR Boundary)',
  },
  {
    id: 'flt-alk503',
    icao24: '700021',
    callsign: 'ALK503',
    operator: 'SriLankan Airlines',
    aircraftType: 'Airbus A321neo',
    aircraftCategory: 'INTERNATIONAL_WIDEBODY',
    origin: 'Bandaranaike Colombo (CMB)',
    destination: 'Velana International (VRMM / MLE)',
    originCode: 'CMB',
    destinationCode: 'MLE',
    flightDirection: 'INBOUND',
    isMaldivesRelated: true,
    coordinates: [75.40, 4.65],
    altitudeFt: 18000,
    velocityKts: 390,
    headingDeg: 252,
    verticalRateFpm: -1200,
    squawk: '4012',
    flightPhase: 'APPROACH',
    history: [[76.2, 4.88], [75.8, 4.75], [75.40, 4.65]],
    inEEZ: true,
    airwaySector: 'Colombo-Male Airway B466',
  },
  {
    id: 'flt-igo1781',
    icao24: '800cd2',
    callsign: 'IGO1781',
    operator: 'IndiGo',
    aircraftType: 'Airbus A321neo',
    aircraftCategory: 'INTERNATIONAL_WIDEBODY',
    origin: 'Cochin / Kochi (COK)',
    destination: 'Velana International (VRMM / MLE)',
    originCode: 'COK',
    destinationCode: 'MLE',
    flightDirection: 'INBOUND',
    isMaldivesRelated: true,
    coordinates: [73.15, 6.45],
    altitudeFt: 29000,
    velocityKts: 460,
    headingDeg: 195,
    verticalRateFpm: -700,
    squawk: '1422',
    flightPhase: 'CRUISE',
    history: [[73.0, 7.2], [73.08, 6.8], [73.15, 6.45]],
    inEEZ: true,
    airwaySector: 'India-Maldives Northern Air Route',
  },
  {
    id: 'flt-thy730',
    icao24: '4b8201',
    callsign: 'THY730',
    operator: 'Turkish Airlines',
    aircraftType: 'Airbus A330-300',
    aircraftCategory: 'INTERNATIONAL_WIDEBODY',
    origin: 'Istanbul Airport (IST)',
    destination: 'Velana International (VRMM / MLE)',
    originCode: 'IST',
    destinationCode: 'MLE',
    flightDirection: 'INBOUND',
    isMaldivesRelated: true,
    coordinates: [72.10, 7.30],
    altitudeFt: 31000,
    velocityKts: 475,
    headingDeg: 140,
    verticalRateFpm: -800,
    squawk: '3218',
    flightPhase: 'CRUISE',
    history: [[71.3, 7.9], [71.7, 7.6], [72.10, 7.30]],
    inEEZ: true,
    airwaySector: 'Northern Oceanic Entry Point',
  },
  {
    id: 'flt-fdb661',
    icao24: '896741',
    callsign: 'FDB661',
    operator: 'Flydubai',
    aircraftType: 'Boeing 737 MAX 8',
    aircraftCategory: 'INTERNATIONAL_WIDEBODY',
    origin: 'Dubai International (DXB)',
    destination: 'Velana International (VRMM / MLE)',
    originCode: 'DXB',
    destinationCode: 'MLE',
    flightDirection: 'INBOUND',
    isMaldivesRelated: true,
    coordinates: [72.70, 5.60],
    altitudeFt: 26000,
    velocityKts: 440,
    headingDeg: 148,
    verticalRateFpm: -1100,
    squawk: '1741',
    flightPhase: 'APPROACH',
    history: [[72.1, 6.2], [72.4, 5.9], [72.70, 5.60]],
    inEEZ: true,
    airwaySector: 'Northwest Arrival Stream',
  },
  {
    id: 'flt-alk501',
    icao24: '700033',
    callsign: 'ALK501',
    operator: 'SriLankan Airlines',
    aircraftType: 'Airbus A320neo',
    aircraftCategory: 'INTERNATIONAL_WIDEBODY',
    origin: 'Bandaranaike Colombo (CMB)',
    destination: 'Gan International (VRMG / GAN)',
    originCode: 'CMB',
    destinationCode: 'GAN',
    flightDirection: 'INBOUND',
    isMaldivesRelated: true,
    coordinates: [74.50, 0.60],
    altitudeFt: 22000,
    velocityKts: 410,
    headingDeg: 235,
    verticalRateFpm: -1000,
    squawk: '4033',
    flightPhase: 'APPROACH',
    history: [[75.2, 1.1], [74.85, 0.85], [74.50, 0.60]],
    inEEZ: true,
    airwaySector: 'Gan International Oceanic Arrival (Addu)',
  },

  // ─── 2. OUTBOUND FROM MALDIVES (ORIGIN: MALDIVES AIRPORTS) ───
  {
    id: 'flt-ek659',
    icao24: '896422',
    callsign: 'UAE659',
    operator: 'Emirates',
    aircraftType: 'Boeing 777-300ER',
    aircraftCategory: 'INTERNATIONAL_WIDEBODY',
    origin: 'Velana International (VRMM / MLE)',
    destination: 'Dubai International (DXB)',
    originCode: 'MLE',
    destinationCode: 'DXB',
    flightDirection: 'OUTBOUND',
    isMaldivesRelated: true,
    coordinates: [72.60, 5.40],
    altitudeFt: 28000,
    velocityKts: 470,
    headingDeg: 325,
    verticalRateFpm: 1200,
    squawk: '4211',
    flightPhase: 'CLIMB',
    history: [[73.4, 4.4], [73.0, 4.9], [72.60, 5.40]],
    inEEZ: true,
    airwaySector: 'Velana Departure // SID NALIM-1A',
  },
  {
    id: 'flt-qtr673',
    icao24: '06a20c',
    callsign: 'QTR673',
    operator: 'Qatar Airways',
    aircraftType: 'Airbus A350-900',
    aircraftCategory: 'INTERNATIONAL_WIDEBODY',
    origin: 'Velana International (VRMM / MLE)',
    destination: 'Hamad International (DOH)',
    originCode: 'MLE',
    destinationCode: 'DOH',
    flightDirection: 'OUTBOUND',
    isMaldivesRelated: true,
    coordinates: [72.25, 5.80],
    altitudeFt: 31000,
    velocityKts: 485,
    headingDeg: 320,
    verticalRateFpm: 900,
    squawk: '6722',
    flightPhase: 'CLIMB',
    history: [[73.3, 4.6], [72.78, 5.2], [72.25, 5.80]],
    inEEZ: true,
    airwaySector: 'Northwest Gulf Exit Track',
  },
  {
    id: 'flt-sia437',
    icao24: '76ce13',
    callsign: 'SIA437',
    operator: 'Singapore Airlines',
    aircraftType: 'Boeing 787-10 Dreamliner',
    aircraftCategory: 'INTERNATIONAL_WIDEBODY',
    origin: 'Velana International (VRMM / MLE)',
    destination: 'Singapore Changi (SIN)',
    originCode: 'MLE',
    destinationCode: 'SIN',
    flightDirection: 'OUTBOUND',
    isMaldivesRelated: true,
    coordinates: [75.10, 4.30],
    altitudeFt: 33000,
    velocityKts: 510,
    headingDeg: 96,
    verticalRateFpm: 600,
    squawk: '5533',
    flightPhase: 'CRUISE',
    history: [[73.8, 4.2], [74.45, 4.25], [75.10, 4.30]],
    inEEZ: true,
    airwaySector: 'Eastern EEZ Trans-Indian Ocean Departure',
  },
  {
    id: 'flt-baw060',
    icao24: '407188',
    callsign: 'BAW060',
    operator: 'British Airways',
    aircraftType: 'Boeing 777-200ER',
    aircraftCategory: 'INTERNATIONAL_WIDEBODY',
    origin: 'Velana International (VRMM / MLE)',
    destination: 'London Heathrow (LHR)',
    originCode: 'MLE',
    destinationCode: 'LHR',
    flightDirection: 'OUTBOUND',
    isMaldivesRelated: true,
    coordinates: [71.70, 6.50],
    altitudeFt: 34000,
    velocityKts: 495,
    headingDeg: 322,
    verticalRateFpm: 0,
    squawk: '3105',
    flightPhase: 'CRUISE',
    history: [[72.8, 5.2], [72.25, 5.85], [71.70, 6.50]],
    inEEZ: true,
    airwaySector: 'Northwestern EEZ Exit Corridor',
  },
  {
    id: 'flt-alk504',
    icao24: '700022',
    callsign: 'ALK504',
    operator: 'SriLankan Airlines',
    aircraftType: 'Airbus A321neo',
    aircraftCategory: 'INTERNATIONAL_WIDEBODY',
    origin: 'Velana International (VRMM / MLE)',
    destination: 'Bandaranaike Colombo (CMB)',
    originCode: 'MLE',
    destinationCode: 'CMB',
    flightDirection: 'OUTBOUND',
    isMaldivesRelated: true,
    coordinates: [74.80, 4.55],
    altitudeFt: 25000,
    velocityKts: 450,
    headingDeg: 72,
    verticalRateFpm: 800,
    squawk: '4013',
    flightPhase: 'CLIMB',
    history: [[73.7, 4.25], [74.25, 4.4], [74.80, 4.55]],
    inEEZ: true,
    airwaySector: 'Airway B466 Colombo Vector',
  },
  {
    id: 'flt-igo1782',
    icao24: '800cd3',
    callsign: 'IGO1782',
    operator: 'IndiGo',
    aircraftType: 'Airbus A321neo',
    aircraftCategory: 'INTERNATIONAL_WIDEBODY',
    origin: 'Velana International (VRMM / MLE)',
    destination: 'Kempegowda Bengaluru (BLR)',
    originCode: 'MLE',
    destinationCode: 'BLR',
    flightDirection: 'OUTBOUND',
    isMaldivesRelated: true,
    coordinates: [73.70, 6.20],
    altitudeFt: 31000,
    velocityKts: 470,
    headingDeg: 12,
    verticalRateFpm: 400,
    squawk: '1423',
    flightPhase: 'CRUISE',
    history: [[73.5, 4.8], [73.6, 5.5], [73.70, 6.20]],
    inEEZ: true,
    airwaySector: 'Northbound Indian Subcontinent Airway',
  },
  {
    id: 'flt-alk502',
    icao24: '700034',
    callsign: 'ALK502',
    operator: 'SriLankan Airlines',
    aircraftType: 'Airbus A320neo',
    aircraftCategory: 'INTERNATIONAL_WIDEBODY',
    origin: 'Gan International (VRMG / GAN)',
    destination: 'Bandaranaike Colombo (CMB)',
    originCode: 'GAN',
    destinationCode: 'CMB',
    flightDirection: 'OUTBOUND',
    isMaldivesRelated: true,
    coordinates: [73.80, 0.50],
    altitudeFt: 28000,
    velocityKts: 460,
    headingDeg: 42,
    verticalRateFpm: 700,
    squawk: '4034',
    flightPhase: 'CLIMB',
    history: [[73.2, -0.4], [73.5, 0.05], [73.80, 0.50]],
    inEEZ: true,
    airwaySector: 'Addu Southern Departure Track',
  },

  // ─── 3. MALDIVES DOMESTIC ATOLL NETWORK (DOMESTIC) ───
  {
    id: 'flt-dqa301',
    icao24: '896301',
    callsign: 'DQA301',
    operator: 'Maldivian',
    aircraftType: 'ATR 72-600',
    aircraftCategory: 'REGIONAL_TURBOPROP',
    origin: 'Gan International (GAN)',
    destination: 'Velana International (VRMM / MLE)',
    originCode: 'GAN',
    destinationCode: 'MLE',
    flightDirection: 'DOMESTIC',
    isMaldivesRelated: true,
    coordinates: [73.25, 1.40],
    altitudeFt: 17000,
    velocityKts: 275,
    headingDeg: 8,
    verticalRateFpm: 0,
    squawk: '2301',
    flightPhase: 'CRUISE',
    history: [[73.15, 0.4], [73.20, 0.9], [73.25, 1.40]],
    inEEZ: true,
    airwaySector: 'Domestic South Airway R2 (Addu-Male)',
  },
  {
    id: 'flt-dqa302',
    icao24: '896302',
    callsign: 'DQA302',
    operator: 'Maldivian',
    aircraftType: 'ATR 72-600',
    aircraftCategory: 'REGIONAL_TURBOPROP',
    origin: 'Velana International (VRMM / MLE)',
    destination: 'Gan International (GAN)',
    originCode: 'MLE',
    destinationCode: 'GAN',
    flightDirection: 'DOMESTIC',
    isMaldivesRelated: true,
    coordinates: [73.30, 2.80],
    altitudeFt: 16000,
    velocityKts: 280,
    headingDeg: 188,
    verticalRateFpm: 0,
    squawk: '2302',
    flightPhase: 'CRUISE',
    history: [[73.45, 3.8], [73.38, 3.3], [73.30, 2.80]],
    inEEZ: true,
    airwaySector: 'Domestic South Airway R2 (Male-Addu)',
  },
  {
    id: 'flt-dqa104',
    icao24: '896104',
    callsign: 'DQA104',
    operator: 'Maldivian',
    aircraftType: 'De Havilland Dash 8-300',
    aircraftCategory: 'REGIONAL_TURBOPROP',
    origin: 'Velana International (VRMM / MLE)',
    destination: 'Kulhudhuffushi Airport (HDK)',
    originCode: 'MLE',
    destinationCode: 'HDK',
    flightDirection: 'DOMESTIC',
    isMaldivesRelated: true,
    coordinates: [73.35, 5.62],
    altitudeFt: 9500,
    velocityKts: 245,
    headingDeg: 355,
    verticalRateFpm: 0,
    squawk: '2104',
    flightPhase: 'CRUISE',
    history: [[73.45, 4.8], [73.40, 5.2], [73.35, 5.62]],
    inEEZ: true,
    airwaySector: 'Domestic North Airway R1',
  },
  {
    id: 'flt-dqa112',
    icao24: '896112',
    callsign: 'DQA112',
    operator: 'Maldivian',
    aircraftType: 'ATR 72-600',
    aircraftCategory: 'REGIONAL_TURBOPROP',
    origin: 'Velana International (VRMM / MLE)',
    destination: 'Hanimaadhoo International (HAQ)',
    originCode: 'MLE',
    destinationCode: 'HAQ',
    flightDirection: 'DOMESTIC',
    isMaldivesRelated: true,
    coordinates: [73.20, 6.10],
    altitudeFt: 12000,
    velocityKts: 260,
    headingDeg: 350,
    verticalRateFpm: -400,
    squawk: '2112',
    flightPhase: 'APPROACH',
    history: [[73.3, 5.4], [73.25, 5.75], [73.20, 6.10]],
    inEEZ: true,
    airwaySector: 'North Atolls Express Corridor',
  },
  {
    id: 'flt-dqa244',
    icao24: '896244',
    callsign: 'DQA244',
    operator: 'Maldivian',
    aircraftType: 'De Havilland Dash 8-200',
    aircraftCategory: 'REGIONAL_TURBOPROP',
    origin: 'Kooddoo Airport (GKK)',
    destination: 'Kadhdhoo Airport (KDO)',
    originCode: 'GKK',
    destinationCode: 'KDO',
    flightDirection: 'DOMESTIC',
    isMaldivesRelated: true,
    coordinates: [73.40, 1.65],
    altitudeFt: 7500,
    velocityKts: 220,
    headingDeg: 28,
    verticalRateFpm: -300,
    squawk: '2244',
    flightPhase: 'APPROACH',
    history: [[73.42, 1.2], [73.41, 1.45], [73.40, 1.65]],
    inEEZ: true,
    airwaySector: 'Huvadhoo-Laamu Channel Link',
  },
  {
    id: 'flt-mav105',
    icao24: '896805',
    callsign: 'MAV105',
    operator: 'Manta Air',
    aircraftType: 'ATR 72-600',
    aircraftCategory: 'REGIONAL_TURBOPROP',
    origin: 'Velana International (VRMM / MLE)',
    destination: 'Dhaalu Airport (DDD)',
    originCode: 'MLE',
    destinationCode: 'DDD',
    flightDirection: 'DOMESTIC',
    isMaldivesRelated: true,
    coordinates: [73.05, 3.25],
    altitudeFt: 6200,
    velocityKts: 235,
    headingDeg: 215,
    verticalRateFpm: -600,
    squawk: '2805',
    flightPhase: 'APPROACH',
    history: [[73.3, 3.8], [73.18, 3.5], [73.05, 3.25]],
    inEEZ: true,
    airwaySector: 'Dhaalu Atoll Tourist Corridor',
  },
  {
    id: 'flt-tma12',
    icao24: '897012',
    callsign: 'TMA12',
    operator: 'Trans Maldivian Airways',
    aircraftType: 'DHC-6 Twin Otter Floatplane',
    aircraftCategory: 'SEAPLANE_TWIN_OTTER',
    origin: 'Velana Seaplane Terminal',
    destination: 'Soneva Fushi Resort Water Lagoon',
    originCode: 'MLE-SEA',
    destinationCode: 'SNV',
    flightDirection: 'DOMESTIC',
    isMaldivesRelated: true,
    coordinates: [73.22, 4.85],
    altitudeFt: 1800,
    velocityKts: 145,
    headingDeg: 335,
    verticalRateFpm: 0,
    squawk: '1200',
    flightPhase: 'CRUISE',
    history: [[73.48, 4.22], [73.35, 4.55], [73.22, 4.85]],
    inEEZ: true,
    airwaySector: 'North Malé - Baa Atoll VFR Scenic Corridor',
  },
  {
    id: 'flt-tma48',
    icao24: '897048',
    callsign: 'TMA48',
    operator: 'Trans Maldivian Airways',
    aircraftType: 'DHC-6 Twin Otter Floatplane',
    aircraftCategory: 'SEAPLANE_TWIN_OTTER',
    origin: 'Velana Seaplane Terminal',
    destination: 'Conrad Rangali Water Pad',
    originCode: 'MLE-SEA',
    destinationCode: 'RGL',
    flightDirection: 'DOMESTIC',
    isMaldivesRelated: true,
    coordinates: [73.18, 3.92],
    altitudeFt: 2200,
    velocityKts: 150,
    headingDeg: 225,
    verticalRateFpm: 0,
    squawk: '1200',
    flightPhase: 'CRUISE',
    history: [[73.45, 4.18], [73.32, 4.05], [73.18, 3.92]],
    inEEZ: true,
    airwaySector: 'Ari Atoll Seaplane Low-Level Track',
  },

  // ─── 4. INTERNATIONAL OVERFLIGHTS (SURROUNDING EEZ HIGH-ALTITUDE AIRWAYS) ───
  {
    id: 'flt-qfa1',
    icao24: '7c6db1',
    callsign: 'QFA1',
    operator: 'Qantas',
    aircraftType: 'Airbus A380-842',
    aircraftCategory: 'INTERNATIONAL_WIDEBODY',
    origin: 'Sydney Kingsford Smith (SYD)',
    destination: 'London Heathrow (LHR)',
    originCode: 'SYD',
    destinationCode: 'LHR',
    flightDirection: 'OVERFLIGHT',
    isMaldivesRelated: false,
    coordinates: [72.20, 6.45],
    altitudeFt: 38000,
    velocityKts: 512,
    headingDeg: 302,
    verticalRateFpm: 0,
    squawk: '7142',
    flightPhase: 'CRUISE',
    history: [[73.6, 5.8], [72.9, 6.1], [72.20, 6.45]],
    inEEZ: true,
    airwaySector: 'Airway P574 // Indian Ocean Transcontinental',
  },
  {
    id: 'flt-sia317',
    icao24: '76cc02',
    callsign: 'SIA317',
    operator: 'Singapore Airlines',
    aircraftType: 'Airbus A380-841',
    aircraftCategory: 'INTERNATIONAL_WIDEBODY',
    origin: 'London Heathrow (LHR)',
    destination: 'Singapore Changi (SIN)',
    originCode: 'LHR',
    destinationCode: 'SIN',
    flightDirection: 'OVERFLIGHT',
    isMaldivesRelated: false,
    coordinates: [74.80, 5.60],
    altitudeFt: 39000,
    velocityKts: 528,
    headingDeg: 118,
    verticalRateFpm: 0,
    squawk: '4218',
    flightPhase: 'CRUISE',
    history: [[73.4, 6.15], [74.1, 5.88], [74.80, 5.60]],
    inEEZ: true,
    airwaySector: 'Airway M762 // Europe-Asia Trunk',
  },
  {
    id: 'flt-uae413',
    icao24: '896912',
    callsign: 'UAE413',
    operator: 'Emirates',
    aircraftType: 'Airbus A380-800',
    aircraftCategory: 'INTERNATIONAL_WIDEBODY',
    origin: 'Sydney (SYD)',
    destination: 'Dubai (DXB)',
    originCode: 'SYD',
    destinationCode: 'DXB',
    flightDirection: 'OVERFLIGHT',
    isMaldivesRelated: false,
    coordinates: [71.40, 3.20],
    altitudeFt: 40000,
    velocityKts: 495,
    headingDeg: 312,
    verticalRateFpm: 0,
    squawk: '3351',
    flightPhase: 'CRUISE',
    history: [[72.4, 2.45], [71.9, 2.82], [71.40, 3.20]],
    inEEZ: false,
    airwaySector: 'Airway L301 // Australia-Gulf Corridor',
  },
  {
    id: 'flt-qtr909',
    icao24: '06a382',
    callsign: 'QTR909',
    operator: 'Qatar Airways',
    aircraftType: 'Airbus A350-1000',
    aircraftCategory: 'INTERNATIONAL_WIDEBODY',
    origin: 'Auckland (AKL)',
    destination: 'Doha Hamad (DOH)',
    originCode: 'AKL',
    destinationCode: 'DOH',
    flightDirection: 'OVERFLIGHT',
    isMaldivesRelated: false,
    coordinates: [70.50, 1.80],
    altitudeFt: 41000,
    velocityKts: 508,
    headingDeg: 318,
    verticalRateFpm: 0,
    squawk: '6719',
    flightPhase: 'CRUISE',
    history: [[71.6, 0.9], [71.05, 1.35], [70.50, 1.80]],
    inEEZ: false,
    airwaySector: 'Southwestern EEZ Trans-Oceanic High Way',
  },
  {
    id: 'flt-cpa100',
    icao24: '780918',
    callsign: 'CPA100',
    operator: 'Cathay Pacific',
    aircraftType: 'Airbus A350-900',
    aircraftCategory: 'INTERNATIONAL_WIDEBODY',
    origin: 'Hong Kong (HKG)',
    destination: 'Johannesburg O.R. Tambo (JNB)',
    originCode: 'HKG',
    destinationCode: 'JNB',
    flightDirection: 'OVERFLIGHT',
    isMaldivesRelated: false,
    coordinates: [75.90, 0.80],
    altitudeFt: 38000,
    velocityKts: 490,
    headingDeg: 236,
    verticalRateFpm: 0,
    squawk: '5204',
    flightPhase: 'CRUISE',
    history: [[76.8, 1.3], [76.35, 1.05], [75.90, 0.80]],
    inEEZ: false,
    airwaySector: 'Equatorial Ocean Route // Southern Indian Ocean',
  },
  {
    id: 'flt-etd454',
    icao24: '896011',
    callsign: 'ETD454',
    operator: 'Etihad Airways',
    aircraftType: 'Boeing 787-9 Dreamliner',
    aircraftCategory: 'INTERNATIONAL_WIDEBODY',
    origin: 'Abu Dhabi (AUH)',
    destination: 'Sydney (SYD)',
    originCode: 'AUH',
    destinationCode: 'SYD',
    flightDirection: 'OVERFLIGHT',
    isMaldivesRelated: false,
    coordinates: [73.90, 4.60],
    altitudeFt: 37000,
    velocityKts: 520,
    headingDeg: 128,
    verticalRateFpm: 0,
    squawk: '2415',
    flightPhase: 'CRUISE',
    history: [[72.8, 5.25], [73.35, 4.92], [73.90, 4.60]],
    inEEZ: true,
    airwaySector: 'Airway UL425 // Central EEZ Crossing',
  },

  // ─── 5. MNDF MARITIME RECONNAISSANCE & SAR ───
  {
    id: 'flt-mndf-dor228',
    icao24: '89ffff',
    callsign: 'MNDF-CG228',
    operator: 'MNDF Air Wing (Coast Guard Recon)',
    aircraftType: 'Dornier 228 Maritime Surveillance',
    aircraftCategory: 'REGIONAL_TURBOPROP',
    origin: 'Hanimaadhoo Base (HDh)',
    destination: 'Northern EEZ Demarcation Border',
    originCode: 'HAQ',
    destinationCode: 'EEZ-NORTH',
    flightDirection: 'DOMESTIC',
    isMaldivesRelated: true,
    coordinates: [72.35, 7.10],
    altitudeFt: 3500,
    velocityKts: 185,
    headingDeg: 90,
    verticalRateFpm: 0,
    squawk: '7700',
    flightPhase: 'CRUISE',
    history: [[72.9, 7.08], [72.6, 7.09], [72.35, 7.10]],
    inEEZ: true,
    airwaySector: 'EEZ Border Sovereignty Patrol',
  },
  {
    id: 'flt-mndf-sar1',
    icao24: '89fffe',
    callsign: 'MNDF-SAR1',
    operator: 'MNDF Coast Guard Search & Rescue',
    aircraftType: 'ALH Dhruv Helicopter',
    aircraftCategory: 'REGIONAL_TURBOPROP',
    origin: 'Gan International (GAN)',
    destination: 'One and a Half Degree Channel Patrol',
    originCode: 'GAN',
    destinationCode: 'EEZ-SOUTH',
    flightDirection: 'DOMESTIC',
    isMaldivesRelated: true,
    coordinates: [73.10, 0.45],
    altitudeFt: 1800,
    velocityKts: 120,
    headingDeg: 0,
    verticalRateFpm: 0,
    squawk: '7001',
    flightPhase: 'CRUISE',
    history: [[73.10, 0.1], [73.10, 0.28], [73.10, 0.45]],
    inEEZ: true,
    airwaySector: 'Southern EEZ Maritime Security Surveillance',
  },
];

// In-memory track history for live flights [lng, lat]
const liveTrackHistory = new Map<string, { lastSeen: number; coords: [number, number][] }>();

// Maldives and connected international airports dictionary
const AIRPORT_NAMES: Record<string, string> = {
  MLE: 'Velana International (VRMM / MLE)',
  VRMM: 'Velana International (VRMM / MLE)',
  GAN: 'Gan International (VRMG / GAN)',
  VRMG: 'Gan International (VRMG / GAN)',
  HDK: 'Hanimaadhoo International (VRMH / HDK)',
  VRMH: 'Hanimaadhoo International (VRMH / HDK)',
  KDO: 'Kadhdhoo Airport (VRMK / KDO)',
  VRMK: 'Kadhdhoo Airport (VRMK / KDO)',
  DRV: 'Dharavandhoo Airport (VRMD / DRV)',
  VRMD: 'Dharavandhoo Airport (VRMD / DRV)',
  FVM: 'Fuvahmulah Airport (VRMR / FVM)',
  VRMR: 'Fuvahmulah Airport (VRMR / FVM)',
  KDM: 'Kaadedhdhoo Airport (VRMT / KDM)',
  VRMT: 'Kaadedhdhoo Airport (VRMT / KDM)',
  IFU: 'Ifuru Airport (VREI / IFU)',
  VREI: 'Ifuru Airport (VREI / IFU)',
  VAM: 'Villa Maamigili Airport (VRMV / VAM)',
  VRMV: 'Villa Maamigili Airport (VRMV / VAM)',
  DDD: 'Dhaalu Kudahuvadhoo (VRMU / DDD)',
  VRMU: 'Dhaalu Kudahuvadhoo (VRMU / DDD)',
  TMF: 'Thimarafushi Airport (VRNT / TMF)',
  VRNT: 'Thimarafushi Airport (VRNT / TMF)',
  KHA: 'Kulhudhuffushi Airport (VRUK / KHA)',
  VRUK: 'Kulhudhuffushi Airport (VRUK / KHA)',
  DXB: 'Dubai International (DXB)',
  DOH: 'Hamad International (DOH)',
  SIN: 'Singapore Changi (SIN)',
  KUL: 'Kuala Lumpur International (KUL)',
  SHJ: 'Sharjah International (SHJ)',
  AUH: 'Zayed Abu Dhabi International (AUH)',
  CMB: 'Colombo Bandaranaike (CMB)',
  DEL: 'Delhi Indira Gandhi (DEL)',
  BOM: 'Mumbai Chhatrapati Shivaji (BOM)',
  BLR: 'Bengaluru Kempegowda (BLR)',
  MAA: 'Chennai International (MAA)',
  TRV: 'Thiruvananthapuram (TRV)',
  COK: 'Cochin International (COK)',
  JED: 'Jeddah King Abdulaziz (JED)',
  RUH: 'Riyadh King Khalid (RUH)',
  DMM: 'Dammam King Fahd (DMM)',
  LHR: 'London Heathrow (LHR)',
  LGW: 'London Gatwick (LGW)',
  CDG: 'Paris Charles de Gaulle (CDG)',
  FRA: 'Frankfurt Airport (FRA)',
  MUC: 'Munich Airport (MUC)',
  VIE: 'Vienna International (VIE)',
  ZRH: 'Zurich Airport (ZRH)',
  MXP: 'Milan Malpensa (MXP)',
  FCO: 'Rome Fiumicino (FCO)',
  SVO: 'Moscow Sheremetyevo (SVO)',
  DME: 'Moscow Domodedovo (DME)',
  VKO: 'Moscow Vnukovo (VKO)',
  IST: 'Istanbul Airport (IST)',
  BKK: 'Bangkok Suvarnabhumi (BKK)',
  DMK: 'Bangkok Don Mueang (DMK)',
  HKG: 'Hong Kong International (HKG)',
  ICN: 'Seoul Incheon (ICN)',
  NQZ: 'Astana International (NQZ)',
  ALA: 'Almaty International (ALA)',
  PER: 'Perth Airport (PER)',
  SYD: 'Sydney Kingsford Smith (SYD)',
  MEL: 'Melbourne Airport (MEL)',
  MRU: 'Mauritius Sir Seewoosagur (MRU)',
};

const MALDIVES_AIRPORT_CODES = new Set([
  'MLE', 'VRMM', 'GAN', 'VRMG', 'HDK', 'VRMH', 'KDO', 'VRMK',
  'DRV', 'VRMD', 'FVM', 'VRMR', 'KDM', 'VRMT', 'IFU', 'VREI',
  'VAM', 'VRMV', 'DDD', 'VRMU', 'TMF', 'VRNT', 'KHA', 'VRUK',
]);

const AIRCRAFT_TYPE_LOOKUP: Record<string, { name: string; category: AviationFlight['aircraftCategory'] }> = {
  DHC6: { name: 'DHC-6 Twin Otter Floatplane', category: 'SEAPLANE_TWIN_OTTER' },
  AT76: { name: 'ATR 72-600 Turboprop', category: 'REGIONAL_TURBOPROP' },
  AT72: { name: 'ATR 72-500 Turboprop', category: 'REGIONAL_TURBOPROP' },
  AT45: { name: 'ATR 42-500 Turboprop', category: 'REGIONAL_TURBOPROP' },
  DH8D: { name: 'De Havilland Dash 8-Q400', category: 'REGIONAL_TURBOPROP' },
  DH8C: { name: 'De Havilland Dash 8-300', category: 'REGIONAL_TURBOPROP' },
  DH8B: { name: 'De Havilland Dash 8-200', category: 'REGIONAL_TURBOPROP' },
  A20N: { name: 'Airbus A320neo', category: 'INTERNATIONAL_WIDEBODY' },
  A320: { name: 'Airbus A320-200', category: 'INTERNATIONAL_WIDEBODY' },
  A21N: { name: 'Airbus A321neo LR', category: 'INTERNATIONAL_WIDEBODY' },
  A321: { name: 'Airbus A321-200', category: 'INTERNATIONAL_WIDEBODY' },
  A332: { name: 'Airbus A330-200', category: 'INTERNATIONAL_WIDEBODY' },
  A333: { name: 'Airbus A330-300', category: 'INTERNATIONAL_WIDEBODY' },
  A339: { name: 'Airbus A330-900neo', category: 'INTERNATIONAL_WIDEBODY' },
  A359: { name: 'Airbus A350-900', category: 'INTERNATIONAL_WIDEBODY' },
  A35K: { name: 'Airbus A350-1000', category: 'INTERNATIONAL_WIDEBODY' },
  A388: { name: 'Airbus A380-800 Superjumbo', category: 'INTERNATIONAL_WIDEBODY' },
  B738: { name: 'Boeing 737-800', category: 'INTERNATIONAL_WIDEBODY' },
  B739: { name: 'Boeing 737-900ER', category: 'INTERNATIONAL_WIDEBODY' },
  B38M: { name: 'Boeing 737 MAX 8', category: 'INTERNATIONAL_WIDEBODY' },
  B39M: { name: 'Boeing 737 MAX 9', category: 'INTERNATIONAL_WIDEBODY' },
  B772: { name: 'Boeing 777-200ER', category: 'INTERNATIONAL_WIDEBODY' },
  B77W: { name: 'Boeing 777-300ER', category: 'INTERNATIONAL_WIDEBODY' },
  B77L: { name: 'Boeing 777-200LR', category: 'INTERNATIONAL_WIDEBODY' },
  B788: { name: 'Boeing 787-8 Dreamliner', category: 'INTERNATIONAL_WIDEBODY' },
  B789: { name: 'Boeing 787-9 Dreamliner', category: 'INTERNATIONAL_WIDEBODY' },
  B78X: { name: 'Boeing 787-10 Dreamliner', category: 'INTERNATIONAL_WIDEBODY' },
};

const AIRLINE_CODE_MAP: Record<string, string> = {
  UAE: 'Emirates',
  QTR: 'Qatar Airways',
  SIA: 'Singapore Airlines',
  BAW: 'British Airways',
  ALK: 'SriLankan Airlines',
  AIC: 'Air India',
  IGO: 'IndiGo',
  ETD: 'Etihad Airways',
  THY: 'Turkish Airlines',
  FDB: 'flydubai',
  AFL: 'Aeroflot',
  AFR: 'Air France',
  DLH: 'Lufthansa',
  SVA: 'Saudia',
  GFA: 'Gulf Air',
  EDW: 'Edelweiss Air',
  AZA: 'ITA Airways',
  CSN: 'China Southern',
  CES: 'China Eastern',
  MAS: 'Malaysia Airlines',
  BKK: 'Bangkok Airways',
  BYD: 'Beond',
  ABY: 'Air Arabia',
  AUA: 'Austrian Airlines',
  KZR: 'Air Astana',
  OMA: 'Oman Air',
  WZZ: 'Wizz Air Abu Dhabi',
  QFA: 'Qantas',
  SWR: 'Swiss International Air Lines',
  DQA: 'Maldivian',
  TMA: 'Trans Maldivian Airways',
  TMW: 'Trans Maldivian Airways',
  MAV: 'Manta Air',
  VQI: 'Flyme (Villa Air)',
};

function resolveOperator(airlineCode: string, callsign: string, tailNumber: string): string {
  const code = (airlineCode || '').trim().toUpperCase();
  if (code && AIRLINE_CODE_MAP[code]) return AIRLINE_CODE_MAP[code];

  const cs = (callsign || '').trim().toUpperCase();
  const csPrefix3 = cs.slice(0, 3);
  if (AIRLINE_CODE_MAP[csPrefix3]) return AIRLINE_CODE_MAP[csPrefix3];

  const reg = (tailNumber || '').trim().toUpperCase();
  if (reg.startsWith('8Q-TB') || reg.startsWith('8Q-TM') || cs.startsWith('8QTB') || cs.startsWith('8QTM')) {
    return 'Trans Maldivian Airways';
  }
  if (reg.startsWith('8Q-RA') || cs.startsWith('8QRA')) {
    return 'Manta Air';
  }
  if (reg.startsWith('8Q-IA') || reg.startsWith('8Q-DQ') || cs.startsWith('DQA')) {
    return 'Maldivian';
  }

  return 'Commercial Aviation';
}

function resolveFlightPhase(altitudeFt: number, velocityKts: number, verticalRateFpm: number): AviationFlight['flightPhase'] {
  if (altitudeFt <= 80 && velocityKts <= 40) return 'TAXI';
  if (altitudeFt < 3000 && verticalRateFpm < -200) return 'FINAL';
  if (altitudeFt < 12000 && verticalRateFpm < -150) return 'APPROACH';
  if (verticalRateFpm > 300) return 'CLIMB';
  return 'CRUISE';
}

const MILITARY_CALLSIGN_RE = /^(RCH|REACH|FORTE|JAKE|LAGR|QID|RRR|CNV|CTM|FAF|IAM|PLF|IFC|IAF|PAF|NATO|MMF|DUKE|HOMER|NAVY)/;
const MILITARY_MODEL_CODES = new Set([
  'P8', 'P3', 'C17', 'C130', 'C30J', 'B52', 'B1', 'K35R', 'KC10', 'A400', 'Y8', 'E3TF', 'E3CF', 'E6',
  'R135', 'RC135', 'U2', 'H60', 'H47', 'C5M', 'C295', 'AN12', 'IL76', 'IL38', 'TU95', 'F16', 'F18', 'F35', 'SU30', 'EUFI', 'RFAL',
]);

function isMilitaryCraft(callsign: string, modelCode: string): boolean {
  return MILITARY_CALLSIGN_RE.test(callsign) || MILITARY_MODEL_CODES.has(modelCode);
}

function getAirwaySector(lng: number, lat: number, altitudeFt: number, phase: string): string {
  if (altitudeFt <= 50) return 'Velana Ground Apron / Seaplane Water Terminal';
  if (phase === 'FINAL') return 'Runway 18 / Water Runway Final Approach';
  if (phase === 'APPROACH') return 'Velana Terminal Control Area (TMA // ARROW-1B)';
  if (lat > 6.0) return 'Northern Maldives Airway // Eight Degree Channel';
  if (lat < 1.0) return 'Southern Equatorial FIR // Gan Airspace Corridor';
  if (lng > 74.0) return 'Eastern Oceanic Inbound Airway (M674)';
  if (lng < 72.0) return 'Western Arabian Sea Airway (P570)';
  return 'Maldives FIR Central Surveillance';
}

function updateTrackHistory(id: string, coords: [number, number]): [number, number][] {
  const now = Date.now();
  const existing = liveTrackHistory.get(id);

  if (!existing) {
    const fresh = { lastSeen: now, coords: [coords] };
    liveTrackHistory.set(id, fresh);
    return fresh.coords;
  }

  existing.lastSeen = now;
  const lastPoint = existing.coords[existing.coords.length - 1];
  if (!lastPoint || lastPoint[0] !== coords[0] || lastPoint[1] !== coords[1]) {
    existing.coords.push(coords);
    if (existing.coords.length > 15) {
      existing.coords.shift();
    }
  }

  // Prune history older than 15 minutes
  if (liveTrackHistory.size > 200) {
    for (const [k, v] of liveTrackHistory.entries()) {
      if (now - v.lastSeen > 900000) liveTrackHistory.delete(k);
    }
  }

  return existing.coords;
}

// Live kinematic ADS-B position extrapolation for fallback / military fleet
function updateFlightPositions(flights: AviationFlight[]): AviationFlight[] {
  const now = Date.now() / 1000;

  return flights.map((f) => {
    // If stationary/grounded craft, do not drift
    if (f.velocityKts < 20 || (f.altitudeFt <= 100 && f.velocityKts <= 25)) {
      return f;
    }

    const speedDegPerSec = (f.velocityKts * 1.852) / (111 * 3600);
    const rad = (f.headingDeg * Math.PI) / 180;
    const cosLat = Math.max(0.2, Math.cos((f.coordinates[1] * Math.PI) / 180));

    // Stable seed from id string
    let idHash = 0;
    for (let i = 0; i < f.id.length; i++) {
      idHash = (idHash * 31 + f.id.charCodeAt(i)) & 0xfffff;
    }

    // Kinematic progression: Continuous flight over time
    // 40-minute patrol flight cycle without sudden jumps
    const cyclePeriod = 2400;
    const phase = ((now + idHash) % cyclePeriod) / cyclePeriod;
    const progress = phase < 0.5 ? phase * 2 : (1 - phase) * 2;
    const offsetSec = (progress - 0.5) * 600; // -300s to +300s displacement

    const deltaLat = Math.cos(rad) * speedDegPerSec * offsetSec;
    const deltaLng = (Math.sin(rad) * speedDegPerSec * offsetSec) / cosLat;

    const currentLng = Number((f.coordinates[0] + deltaLng).toFixed(5));
    const currentLat = Number((f.coordinates[1] + deltaLat).toFixed(5));

    return {
      ...f,
      coordinates: [currentLng, currentLat] as [number, number],
      history: [
        ...f.history,
        [currentLng, currentLat] as [number, number],
      ].slice(-6) as [number, number][],
    };
  });
}

function parseFlightradarState(key: string, s: any[]): AviationFlight | null {
  if (!s || !Array.isArray(s) || s.length < 6) return null;
  const icao24 = String(s[0] || key).toLowerCase();
  const lat = Number(s[1]);
  const lng = Number(s[2]);
  if (isNaN(lat) || isNaN(lng) || lat === null || lng === null) return null;

  const headingDeg = Number(s[3]) || 0;
  const altitudeFt = Number(s[4]) || 0;
  const velocityKts = Number(s[5]) || 0;
  const squawk = s[6] ? String(s[6]) : '1000';
  const modelCode = (s[8] || '').trim().toUpperCase();
  const tailNumber = (s[9] || '').trim().toUpperCase();
  const rawOrigin = (s[11] || '').trim().toUpperCase();
  const rawDest = (s[12] || '').trim().toUpperCase();
  const flightNumber = (s[13] || '').trim();
  const verticalRateFpm = Number(s[15]) || 0;
  const rawCallsign = (s[16] || s[13] || tailNumber || `FLT-${key}`).trim().toUpperCase();
  const airlineCode = (s[18] || '').trim().toUpperCase();

  // Resolve aircraft model and category
  const modelInfo = AIRCRAFT_TYPE_LOOKUP[modelCode];
  const isSeaplane =
    modelCode === 'DHC6' ||
    tailNumber.startsWith('8Q-T') ||
    tailNumber.startsWith('8Q-R') ||
    rawCallsign.startsWith('8QT') ||
    rawCallsign.startsWith('8QR') ||
    (altitudeFt < 5000 && velocityKts < 180 && lng >= 72.5 && lng <= 74.0 && lat >= -1.0 && lat <= 7.5);

  const isMilitary = isMilitaryCraft(rawCallsign, modelCode);

  const aircraftCategory: AviationFlight['aircraftCategory'] = isMilitary
    ? 'MILITARY'
    : isSeaplane
    ? 'SEAPLANE_TWIN_OTTER'
    : modelInfo?.category
    ? modelInfo.category
    : altitudeFt > 20000
    ? 'INTERNATIONAL_WIDEBODY'
    : 'REGIONAL_TURBOPROP';

  const aircraftType = modelInfo?.name
    ? modelInfo.name
    : isSeaplane
    ? 'DHC-6 Twin Otter Floatplane'
    : modelCode
    ? `${modelCode} Commercial Jet`
    : 'Aviation Aircraft';

  const operator = isMilitary
    ? 'Military / State Aircraft'
    : resolveOperator(airlineCode, rawCallsign, tailNumber);

  const isParked = velocityKts < 20 || (altitudeFt <= 100 && velocityKts <= 25);

  // Origin / Destination resolution
  let origin = rawOrigin ? (AIRPORT_NAMES[rawOrigin] || `${rawOrigin} Airport`) : '';
  let destination = rawDest ? (AIRPORT_NAMES[rawDest] || `${rawDest} Airport`) : '';

  if (isSeaplane) {
    if (isParked) {
      origin = origin || 'Velana Seaplane Base (VRMM / MLE)';
      destination = 'Atoll Resort Water Dock // Moored';
    } else if (rawOrigin === 'MLE') {
      origin = 'Velana Seaplane Base (VRMM / MLE)';
      destination = destination || 'Atoll Resort Water Runway';
    } else if (rawDest === 'MLE') {
      origin = origin || 'Atoll Resort Lagoon Water Base';
      destination = 'Velana Seaplane Base (VRMM / MLE)';
    } else {
      origin = origin || 'Atoll Resort Water Runway';
      destination = destination || 'Velana Seaplane Base (VRMM / MLE)';
    }
  } else {
    if (isParked) {
      origin = origin || 'Velana International (VRMM / MLE)';
      destination = 'Velana Ground Apron // Stand';
    } else {
      if (!origin) origin = 'Indian Ocean Airway Entry';
      if (!destination) destination = altitudeFt < 12000 ? 'Velana International (VRMM / MLE)' : 'Enroute Airway Destination';
    }
  }

  const inEEZ = lng >= 71.0 && lng <= 76.0 && lat >= -2.6 && lat <= 7.8;

  // Direction calculation
  const isOrigMV = MALDIVES_AIRPORT_CODES.has(rawOrigin) || isSeaplane;
  const isDestMV = MALDIVES_AIRPORT_CODES.has(rawDest) || destination.includes('MLE') || destination.includes('Velana');

  let flightDirection: AviationFlight['flightDirection'] = 'OVERFLIGHT';
  let isMaldivesRelated = false;

  if (isSeaplane || (isOrigMV && isDestMV)) {
    flightDirection = 'DOMESTIC';
    isMaldivesRelated = true;
  } else if (isDestMV) {
    flightDirection = 'INBOUND';
    isMaldivesRelated = true;
  } else if (isOrigMV) {
    flightDirection = 'OUTBOUND';
    isMaldivesRelated = true;
  } else if (inEEZ && altitudeFt < 14000 && verticalRateFpm < -180) {
    flightDirection = 'INBOUND';
    isMaldivesRelated = true;
  } else if (inEEZ && altitudeFt < 18000 && verticalRateFpm > 300) {
    flightDirection = 'OUTBOUND';
    isMaldivesRelated = true;
  } else if (inEEZ) {
    flightDirection = 'OVERFLIGHT';
    isMaldivesRelated = true;
  }

  const flightPhase = resolveFlightPhase(altitudeFt, velocityKts, verticalRateFpm);
  const airwaySector = getAirwaySector(lng, lat, altitudeFt, flightPhase);
  const history = updateTrackHistory(`live-${icao24}`, [lng, lat]);

  return {
    id: `flt-live-${icao24}`,
    icao24,
    callsign: rawCallsign,
    flightNumber: flightNumber || undefined,
    registration: tailNumber || undefined,
    operator,
    aircraftType,
    aircraftCategory,
    origin,
    destination,
    originCode: rawOrigin || undefined,
    destinationCode: rawDest || undefined,
    flightDirection,
    isMaldivesRelated,
    coordinates: [lng, lat],
    altitudeFt,
    velocityKts,
    headingDeg,
    verticalRateFpm,
    squawk,
    flightPhase,
    history,
    inEEZ,
    airwaySector,
    isMilitary,
    militaryRole: isMilitary ? 'Military aircraft detected on live ADS-B' : undefined,
    dataQuality: 'LIVE_ADSB' as const,
  };
}

export async function GET() {
  let flights: AviationFlight[] = [];
  let source = 'LIVE_MALDIVES_ADS-B_RADAR';

  // ─── TIER 1: DUAL-FEED LIVE RADAR FOR MALDIVES FIR + INDIAN OCEAN ───
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const [maldivesRes, regionalRes] = await Promise.allSettled([
      // Priority 1: High-fidelity Maldives FIR bounding box (N8.5°, S-2.5°, W70.5°, E76.0°)
      fetch(
        'https://data-cloud.flightradar24.com/zones/fcgi/feed.js?bounds=8.5,-2.5,70.5,76.0',
        {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Accept: 'application/json',
          },
          cache: 'no-store',
        }
      ),
      // Priority 2: Surrounding Indian Ocean Regional corridor (N22.0°, S-12.0°, W58.0°, E92.0°)
      fetch(
        'https://data-cloud.flightradar24.com/zones/fcgi/feed.js?bounds=22.0,-12.0,58.0,92.0',
        {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Accept: 'application/json',
          },
          cache: 'no-store',
        }
      ),
    ]);
    clearTimeout(timeout);

    const rawMap = new Map<string, any[]>();

    // Load regional flights first
    if (regionalRes.status === 'fulfilled' && regionalRes.value.ok) {
      const regData = await regionalRes.value.json();
      if (regData && typeof regData === 'object') {
        for (const [k, v] of Object.entries(regData)) {
          if (!['full_count', 'version', 'stats'].includes(k) && Array.isArray(v)) {
            rawMap.set(k, v);
          }
        }
      }
    }

    // Overlay high-priority Maldives FIR flights (ensuring local TMA seaplanes & arrivals are never dropped)
    if (maldivesRes.status === 'fulfilled' && maldivesRes.value.ok) {
      const mvData = await maldivesRes.value.json();
      if (mvData && typeof mvData === 'object') {
        for (const [k, v] of Object.entries(mvData)) {
          if (!['full_count', 'version', 'stats'].includes(k) && Array.isArray(v)) {
            rawMap.set(k, v);
          }
        }
      }
    }

    if (rawMap.size > 0) {
      const parsed: AviationFlight[] = [];
      for (const [key, raw] of rawMap.entries()) {
        const item = parseFlightradarState(key, raw);
        if (item) parsed.push(item);
      }
      flights = parsed;
    }
  } catch {
    // Primary feed error, fallback to OpenSky
  }

  // ─── TIER 2: OPENSKY NETWORK QUERY IF TIER 1 WAS EMPTY ───
  if (flights.length === 0) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const openSkyRes = await fetch(
        'https://opensky-network.org/api/states/all?lamin=-15&lomin=65&lamax=15&lomax=85',
        {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        }
      );
      clearTimeout(timeout);

      if (openSkyRes.ok) {
        const data = await openSkyRes.json();
        if (data && Array.isArray(data.states) && data.states.length > 0) {
          source = 'OPENSKY_NETWORK_LIVE';
          flights = data.states
            .filter((s: any[]) => s[5] !== null && s[6] !== null)
            .map((s: any[], index: number) => {
              const lng = Number(s[5]);
              const lat = Number(s[6]);
              const altitude = s[7] ? Math.round(s[7] * 3.28084) : 0;
              const velocity = s[9] ? Math.round(s[9] * 1.94384) : 250;
              const heading = s[10] ? Math.round(s[10]) : 0;
              const callsign = (s[1] || 'UNKNOWN').trim();
              const icao24 = s[0] || `unk-${index}`;
              const verticalRate = s[11] ? Math.round(s[11] * 196.85) : 0;

              const isSeaplane = altitude < 4000 && velocity < 180;
              const category: AviationFlight['aircraftCategory'] = isSeaplane
                ? 'SEAPLANE_TWIN_OTTER'
                : altitude > 22000
                ? 'INTERNATIONAL_WIDEBODY'
                : 'REGIONAL_TURBOPROP';

              const inEEZ = lng >= 71.0 && lng <= 76.0 && lat >= -2.6 && lat <= 7.8;
              const origin = inEEZ ? 'Maldives Airspace' : 'Indian Ocean Airway Entry';
              const destination = altitude < 10000 ? 'Velana International (VRMM / MLE)' : 'Enroute Destination';

              const flightPhase = resolveFlightPhase(altitude, velocity, verticalRate);
              const airwaySector = getAirwaySector(lng, lat, altitude, flightPhase);
              const history = updateTrackHistory(`os-${icao24}`, [lng, lat]);

              return {
                id: `flt-os-${icao24}`,
                icao24,
                callsign,
                operator: resolveOperator('', callsign, ''),
                aircraftType: isSeaplane ? 'DHC-6 Twin Otter Floatplane' : altitude > 25000 ? 'Widebody Jet' : 'Turboprop Regional',
                aircraftCategory: category,
                origin,
                destination,
                flightDirection: (altitude < 12000 && verticalRate < -200 ? 'INBOUND' : 'OVERFLIGHT') as AviationFlight['flightDirection'],
                isMaldivesRelated: inEEZ,
                coordinates: [lng, lat],
                altitudeFt: altitude,
                velocityKts: velocity,
                headingDeg: heading,
                verticalRateFpm: verticalRate,
                squawk: s[14] || '1000',
                flightPhase,
                history,
                inEEZ,
                airwaySector,
              };
            });
        }
      }
    } catch {
      // OpenSky error
    }
  }

  // ─── TIER 3: KINEMATIC FALLBACK FLEET IF NO LIVE CRAFT FOUND ───
  if (flights.length === 0) {
    source = 'MALDIVES_EEZ_ADS-B_RADAR (OFFLINE_FALLBACK)';
    flights = updateFlightPositions(FALLBACK_FLIGHTS).map((f) => ({ ...f, dataQuality: 'SIMULATED_ADSB' as const }));
  } else {
    // Keep the payload map-friendly: military first, then Maldives-related, then nearest to Maldives
    const dist = (f: AviationFlight) => Math.hypot(f.coordinates[0] - 73.5, f.coordinates[1] - 4.2);
    flights = flights
      .map((f) => ({ ...f, dataQuality: f.dataQuality ?? ('LIVE_ADSB' as const) }))
      .sort(
        (a, b) =>
          Number(!!b.isMilitary) - Number(!!a.isMilitary) ||
          Number(b.isMaldivesRelated) - Number(a.isMaldivesRelated) ||
          dist(a) - dist(b)
      )
      .slice(0, 350);
  }

  // Representative Indian Ocean military air picture (not available on public ADS-B)
  flights = [...flights, ...updateFlightPositions(INDIAN_OCEAN_MILITARY_FLIGHTS)];

  const inboundFlights = flights.filter((f) => f.flightDirection === 'INBOUND');
  const outboundFlights = flights.filter((f) => f.flightDirection === 'OUTBOUND');
  const domesticFlights = flights.filter((f) => f.flightDirection === 'DOMESTIC');
  const overflights = flights.filter((f) => f.flightDirection === 'OVERFLIGHT');

  const stats = {
    totalAirborne: flights.length,
    maldivesRelated: flights.filter((f) => f.isMaldivesRelated).length,
    inboundToMaldives: inboundFlights.length,
    outboundFromMaldives: outboundFlights.length,
    domesticAtollFlights: domesticFlights.length,
    internationalOverflights: overflights.length,
    internationalWidebody: flights.filter((f) => f.aircraftCategory === 'INTERNATIONAL_WIDEBODY').length,
    regionalTurboprop: flights.filter((f) => f.aircraftCategory === 'REGIONAL_TURBOPROP').length,
    seaplaneFloatplanes: flights.filter((f) => f.aircraftCategory === 'SEAPLANE_TWIN_OTTER').length,
    militaryAircraft: flights.filter((f) => f.isMilitary).length,
    indianOceanWideTracks: flights.length,
    runway18Status: 'OPERATIONAL // CAT-I ILS ACTIVE',
    seaplaneWaterTerminal: 'ALL WATER RUNWAYS ACTIVE',
  };

  return NextResponse.json(
    {
      timestamp: new Date().toISOString(),
      source,
      stats,
      flights,
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }
  );
}
