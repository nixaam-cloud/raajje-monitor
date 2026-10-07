export interface AirlineMeta {
  code: string; // 2-letter IATA code
  icao: string; // 3-letter ICAO code
  name: string;
  brandColor: string;
  badgeBg: string;
}

export const AIRLINE_REGISTRY: Record<string, AirlineMeta> = {
  // Major International Carriers to Maldives
  UAE: { code: 'EK', icao: 'UAE', name: 'Emirates', brandColor: '#D71A21', badgeBg: 'bg-red-950/80 border-red-500/50 text-red-300' },
  QTR: { code: 'QR', icao: 'QTR', name: 'Qatar Airways', brandColor: '#5C0632', badgeBg: 'bg-rose-950/80 border-rose-500/50 text-rose-300' },
  BAW: { code: 'BA', icao: 'BAW', name: 'British Airways', brandColor: '#075AAA', badgeBg: 'bg-blue-950/80 border-blue-500/50 text-blue-300' },
  SIA: { code: 'SQ', icao: 'SIA', name: 'Singapore Airlines', brandColor: '#F5A623', badgeBg: 'bg-amber-950/80 border-amber-500/50 text-amber-300' },
  ALK: { code: 'UL', icao: 'ALK', name: 'SriLankan Airlines', brandColor: '#008752', badgeBg: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' },
  AIC: { code: 'AI', icao: 'AIC', name: 'Air India', brandColor: '#E31837', badgeBg: 'bg-red-950/80 border-red-500/50 text-red-300' },
  IGO: { code: '6E', icao: 'IGO', name: 'IndiGo', brandColor: '#001B94', badgeBg: 'bg-indigo-950/80 border-indigo-500/50 text-indigo-300' },
  ETD: { code: 'EY', icao: 'ETD', name: 'Etihad Airways', brandColor: '#BD8B13', badgeBg: 'bg-amber-950/80 border-amber-500/50 text-amber-300' },
  THY: { code: 'TK', icao: 'THY', name: 'Turkish Airlines', brandColor: '#C8102E', badgeBg: 'bg-red-950/80 border-red-500/50 text-red-300' },
  FDB: { code: 'FZ', icao: 'FDB', name: 'flydubai', brandColor: '#F58220', badgeBg: 'bg-orange-950/80 border-orange-500/50 text-orange-300' },
  AFL: { code: 'SU', icao: 'AFL', name: 'Aeroflot', brandColor: '#002C6C', badgeBg: 'bg-sky-950/80 border-sky-500/50 text-sky-300' },
  AFR: { code: 'AF', icao: 'AFR', name: 'Air France', brandColor: '#00267F', badgeBg: 'bg-blue-950/80 border-blue-500/50 text-blue-300' },
  DLH: { code: 'LH', icao: 'DLH', name: 'Lufthansa', brandColor: '#FFB800', badgeBg: 'bg-yellow-950/80 border-yellow-500/50 text-yellow-300' },
  SVA: { code: 'SV', icao: 'SVA', name: 'Saudia', brandColor: '#006C35', badgeBg: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' },
  GFA: { code: 'GF', icao: 'GFA', name: 'Gulf Air', brandColor: '#B68D40', badgeBg: 'bg-amber-950/80 border-amber-500/50 text-amber-300' },
  EDW: { code: 'WK', icao: 'EDW', name: 'Edelweiss Air', brandColor: '#CC0000', badgeBg: 'bg-red-950/80 border-red-500/50 text-red-300' },
  AZA: { code: 'AZ', icao: 'AZA', name: 'ITA Airways', brandColor: '#003366', badgeBg: 'bg-blue-950/80 border-blue-500/50 text-blue-300' },
  CSN: { code: 'CZ', icao: 'CSN', name: 'China Southern', brandColor: '#003D79', badgeBg: 'bg-blue-950/80 border-blue-500/50 text-blue-300' },
  CES: { code: 'MU', icao: 'CES', name: 'China Eastern', brandColor: '#CE1126', badgeBg: 'bg-red-950/80 border-red-500/50 text-red-300' },
  MAS: { code: 'MH', icao: 'MAS', name: 'Malaysia Airlines', brandColor: '#CC0000', badgeBg: 'bg-red-950/80 border-red-500/50 text-red-300' },
  BKK: { code: 'PG', icao: 'BKK', name: 'Bangkok Airways', brandColor: '#005BA6', badgeBg: 'bg-blue-950/80 border-blue-500/50 text-blue-300' },
  BYD: { code: 'B4', icao: 'BYD', name: 'Beond', brandColor: '#C49A45', badgeBg: 'bg-amber-950/80 border-amber-500/50 text-amber-300' },
  ABY: { code: 'G9', icao: 'ABY', name: 'Air Arabia', brandColor: '#E2231A', badgeBg: 'bg-red-950/80 border-red-500/50 text-red-300' },
  AUA: { code: 'OS', icao: 'AUA', name: 'Austrian Airlines', brandColor: '#D81E05', badgeBg: 'bg-red-950/80 border-red-500/50 text-red-300' },
  KZR: { code: 'KC', icao: 'KZR', name: 'Air Astana', brandColor: '#C49A45', badgeBg: 'bg-amber-950/80 border-amber-500/50 text-amber-300' },
  OMA: { code: 'WY', icao: 'OMA', name: 'Oman Air', brandColor: '#B68D40', badgeBg: 'bg-amber-950/80 border-amber-500/50 text-amber-300' },
  WZZ: { code: '5W', icao: 'WZZ', name: 'Wizz Air Abu Dhabi', brandColor: '#E6007E', badgeBg: 'bg-pink-950/80 border-pink-500/50 text-pink-300' },
  QFA: { code: 'QF', icao: 'QFA', name: 'Qantas', brandColor: '#E0001B', badgeBg: 'bg-red-950/80 border-red-500/50 text-red-300' },
  SWR: { code: 'LX', icao: 'SWR', name: 'Swiss International Air Lines', brandColor: '#E30613', badgeBg: 'bg-red-950/80 border-red-500/50 text-red-300' },

  // Maldivian Domestic & Seaplane Operators
  DQA: { code: 'Q2', icao: 'DQA', name: 'Maldivian', brandColor: '#0083B0', badgeBg: 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300' },
  TMA: { code: 'M6', icao: 'TMA', name: 'Trans Maldivian Airways', brandColor: '#E60000', badgeBg: 'bg-rose-950/80 border-rose-500/50 text-rose-300' },
  TMW: { code: 'M6', icao: 'TMA', name: 'Trans Maldivian Airways', brandColor: '#E60000', badgeBg: 'bg-rose-950/80 border-rose-500/50 text-rose-300' },
  MAV: { code: 'NR', icao: 'MAV', name: 'Manta Air', brandColor: '#00B4D8', badgeBg: 'bg-teal-950/80 border-teal-500/50 text-teal-300' },
  VQI: { code: 'VP', icao: 'VQI', name: 'Flyme (Villa Air)', brandColor: '#06D6A0', badgeBg: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' },
};

/**
 * Resolves operator airline details from callsign or operator name.
 */
export function resolveAirline(callsign: string, operatorName: string): AirlineMeta {
  const cleanCallsign = (callsign || '').toUpperCase().trim();
  const cleanOp = (operatorName || '').toLowerCase().trim();

  // 1. Try 3-letter prefix of callsign
  const prefix3 = cleanCallsign.slice(0, 3);
  if (AIRLINE_REGISTRY[prefix3]) {
    return AIRLINE_REGISTRY[prefix3];
  }

  // 1b. Support Maldives 8Q- registered aircraft callsigns (8QT=TMA, 8QR=Manta, 8QI=Maldivian)
  if (cleanCallsign.startsWith('8QT') || cleanCallsign.startsWith('8QM')) {
    return AIRLINE_REGISTRY.TMA;
  }
  if (cleanCallsign.startsWith('8QR')) {
    return AIRLINE_REGISTRY.MAV;
  }
  if (cleanCallsign.startsWith('8QI') || cleanCallsign.startsWith('8QD')) {
    return AIRLINE_REGISTRY.DQA;
  }

  // 2. Try 2-letter prefix of callsign
  const prefix2 = cleanCallsign.slice(0, 2);
  const foundBy2 = Object.values(AIRLINE_REGISTRY).find((a) => a.code === prefix2);
  if (foundBy2) return foundBy2;

  // 3. Search by operator name keywords
  if (cleanOp.includes('emirates')) return AIRLINE_REGISTRY.UAE;
  if (cleanOp.includes('qatar')) return AIRLINE_REGISTRY.QTR;
  if (cleanOp.includes('british')) return AIRLINE_REGISTRY.BAW;
  if (cleanOp.includes('singapore')) return AIRLINE_REGISTRY.SIA;
  if (cleanOp.includes('srilankan') || cleanOp.includes('sri lankan')) return AIRLINE_REGISTRY.ALK;
  if (cleanOp.includes('air india')) return AIRLINE_REGISTRY.AIC;
  if (cleanOp.includes('indigo')) return AIRLINE_REGISTRY.IGO;
  if (cleanOp.includes('etihad')) return AIRLINE_REGISTRY.ETD;
  if (cleanOp.includes('turkish')) return AIRLINE_REGISTRY.THY;
  if (cleanOp.includes('flydubai')) return AIRLINE_REGISTRY.FDB;
  if (cleanOp.includes('maldivian')) return AIRLINE_REGISTRY.DQA;
  if (cleanOp.includes('trans maldivian') || cleanOp.includes('tma')) return AIRLINE_REGISTRY.TMA;
  if (cleanOp.includes('manta')) return AIRLINE_REGISTRY.MAV;
  if (cleanOp.includes('flyme') || cleanOp.includes('villa air')) return AIRLINE_REGISTRY.VQI;
  if (cleanOp.includes('beond')) return AIRLINE_REGISTRY.BYD;
  if (cleanOp.includes('aeroflot')) return AIRLINE_REGISTRY.AFL;
  if (cleanOp.includes('france')) return AIRLINE_REGISTRY.AFR;
  if (cleanOp.includes('lufthansa')) return AIRLINE_REGISTRY.DLH;
  if (cleanOp.includes('saudi')) return AIRLINE_REGISTRY.SVA;

  // Default generic airline fallback
  return {
    code: prefix3.slice(0, 2) || 'FL',
    icao: prefix3 || 'FLT',
    name: operatorName || 'Aviation Track',
    brandColor: '#38BDF8',
    badgeBg: 'bg-slate-900 border-slate-700 text-slate-300',
  };
}

/**
 * Returns formatted short flight number (e.g. EK 658 instead of UAE658).
 */
export function formatFlightNumber(callsign: string, meta: AirlineMeta): string {
  const clean = (callsign || '').toUpperCase().trim();
  const digits = clean.replace(/^[A-Z]+/, '');
  if (digits) {
    return `${meta.code} ${digits}`;
  }
  return clean || `${meta.code} --`;
}

/**
 * Extract concise destination/route string (e.g., "DXB ➔ MLE").
 */
export function formatShortRoute(origin: string, destination: string, originCode?: string, destinationCode?: string): {
  from: string;
  to: string;
  formatted: string;
} {
  const extractCode = (name: string, fallbackCode?: string): string => {
    if (fallbackCode && fallbackCode.length >= 3) return fallbackCode.slice(0, 4);
    const match = name.match(/\(([A-Z]{3,4})\)/i) || name.match(/\b([A-Z]{3,4})\b/);
    if (match) return match[1].toUpperCase();
    return name.slice(0, 4).toUpperCase();
  };

  const from = extractCode(origin, originCode);
  const to = extractCode(destination, destinationCode);

  return {
    from,
    to,
    formatted: `${from} ➔ ${to}`,
  };
}
