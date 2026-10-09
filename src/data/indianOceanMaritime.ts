import type { MaritimeVessel } from '@/app/api/maritime/route';

/**
 * Indian Ocean regional maritime layer.
 *
 * IMPORTANT: Naval units do not broadcast AIS, and no free live AIS feed covers the whole
 * Indian Ocean. Everything here is a MODELED OSINT picture: representative deployments along
 * well-known sea lanes, choke points, naval bases and standing task forces. Positions are
 * kinematically animated, not real-time tracks. Entries are tagged `dataQuality: 'MODELED_OSINT'`
 * so the UI can label them honestly.
 */

type Seed = Partial<MaritimeVessel> &
  Pick<MaritimeVessel, 'id' | 'name' | 'type' | 'typeName' | 'coordinates' | 'sog' | 'cog' | 'flag' | 'flagCode' | 'zone'>;

let seq = 0;
function vessel(s: Seed): MaritimeVessel {
  seq += 1;
  const isMil = s.type === 'naval_warship' || s.type === 'naval_support';
  const [lng, lat] = s.coordinates;
  const back = 0.35;
  const rad = (s.cog * Math.PI) / 180;
  const cosLat = Math.max(0.2, Math.cos((lat * Math.PI) / 180));
  const p1: [number, number] = [lng - (Math.sin(rad) * back) / cosLat, lat - Math.cos(rad) * back];
  const p2: [number, number] = [lng - (Math.sin(rad) * back * 0.5) / cosLat, lat - Math.cos(rad) * back * 0.5];
  return {
    mmsi: String(990000100 + seq),
    callsign: isMil ? 'NOT BROADCAST' : `IO${String(seq).padStart(3, '0')}`,
    navStatus: s.sog > 1 ? 'Underway Using Engine' : 'At Anchor / Loitering',
    lengthMeters: isMil ? 140 : 250,
    beamMeters: isMil ? 17 : 38,
    draftMeters: isMil ? 6 : 13,
    origin: 'Underway',
    destination: 'Unknown',
    eta: 'N/A',
    hazardousCargo: s.type === 'tanker',
    history: [p1, p2, s.coordinates],
    inEEZ: false,
    isMilitary: isMil,
    dataQuality: 'MODELED_OSINT',
    ...s,
  } as MaritimeVessel;
}

// ─── COMMERCIAL TRAFFIC ACROSS THE INDIAN OCEAN SEA LANES ───
const COMMERCIAL: MaritimeVessel[] = [
  vessel({ id: 'io-c-001', name: 'GULF MERIDIAN', type: 'tanker', typeName: 'VLCC Crude Carrier', flag: 'Marshall Islands', flagCode: 'MH', coordinates: [56.55, 26.35], sog: 12.5, cog: 125, zone: 'Strait of Hormuz TSS', origin: 'Ras Tanura (SA)', destination: 'Ningbo (CN)', lengthMeters: 330, beamMeters: 60, draftMeters: 21 }),
  vessel({ id: 'io-c-002', name: 'FUJAIRAH SPIRIT', type: 'tanker', typeName: 'Suezmax Crude Carrier', flag: 'Liberia', flagCode: 'LR', coordinates: [58.2, 24.6], sog: 13.8, cog: 140, zone: 'Gulf of Oman', origin: 'Fujairah (AE)', destination: 'Sikka (IN)', lengthMeters: 274, beamMeters: 48, draftMeters: 17 }),
  vessel({ id: 'io-c-003', name: 'ARABIAN CARRIER II', type: 'cargo', typeName: 'Container Ship (13,000 TEU)', flag: 'Singapore', flagCode: 'SG', coordinates: [62.5, 20.8], sog: 18.4, cog: 140, zone: 'Arabian Sea', origin: 'Jebel Ali (AE)', destination: 'Colombo (LK)', lengthMeters: 366, beamMeters: 51, draftMeters: 15 }),
  vessel({ id: 'io-c-004', name: 'MUMBAI EXPRESS', type: 'cargo', typeName: 'Container Ship (9,000 TEU)', flag: 'India', flagCode: 'IN', coordinates: [71.2, 17.6], sog: 16.0, cog: 190, zone: 'Arabian Sea // Mumbai Approach', origin: 'Mundra (IN)', destination: 'Colombo (LK)', lengthMeters: 300, beamMeters: 43, draftMeters: 14 }),
  vessel({ id: 'io-c-005', name: 'ADEN PIONEER', type: 'cargo', typeName: 'Bulk Carrier (Panamax)', flag: 'Greece', flagCode: 'GR', coordinates: [45.4, 12.3], sog: 13.0, cog: 75, zone: 'Gulf of Aden IRTC', origin: 'Suez (EG)', destination: 'Kandla (IN)', lengthMeters: 229, beamMeters: 32, draftMeters: 14 }),
  vessel({ id: 'io-c-006', name: 'RED SEA TRADER', type: 'tanker', typeName: 'Product Tanker (LR2)', flag: 'Greece', flagCode: 'GR', coordinates: [43.6, 12.55], sog: 14.2, cog: 165, zone: 'Bab-el-Mandeb', origin: 'Suez (EG)', destination: 'Singapore (SG)', lengthMeters: 250, beamMeters: 44, draftMeters: 15 }),
  vessel({ id: 'io-c-007', name: 'SOMALI BASIN LNG', type: 'tanker', typeName: 'LNG Carrier', flag: 'Bahamas', flagCode: 'BS', coordinates: [52.5, 5.8], sog: 16.5, cog: 85, zone: 'Somali Basin', origin: 'Ras Laffan (QA)', destination: 'Incheon (KR)', lengthMeters: 295, beamMeters: 46, draftMeters: 12 }),
  vessel({ id: 'io-c-008', name: 'COLOMBO FEEDER 7', type: 'cargo', typeName: 'Feeder Container Ship', flag: 'Sri Lanka', flagCode: 'LK', coordinates: [79.2, 6.3], sog: 14.0, cog: 95, zone: 'Colombo SLOC', origin: 'Colombo (LK)', destination: 'Chennai (IN)', lengthMeters: 170, beamMeters: 27, draftMeters: 9 }),
  vessel({ id: 'io-c-009', name: 'BENGAL STAR', type: 'cargo', typeName: 'Bulk Carrier (Supramax)', flag: 'Bangladesh', flagCode: 'BD', coordinates: [86.5, 15.2], sog: 11.5, cog: 20, zone: 'Bay of Bengal', origin: 'Visakhapatnam (IN)', destination: 'Chittagong (BD)', lengthMeters: 190, beamMeters: 32, draftMeters: 11 }),
  vessel({ id: 'io-c-010', name: 'MALACCA GRAND', type: 'cargo', typeName: 'Ultra Large Container Vessel', flag: 'Hong Kong', flagCode: 'HK', coordinates: [96.8, 5.9], sog: 17.5, cog: 245, zone: 'Malacca Strait Western Approach', origin: 'Singapore (SG)', destination: 'Jeddah (SA)', lengthMeters: 399, beamMeters: 59, draftMeters: 16 }),
  vessel({ id: 'io-c-011', name: 'ANDAMAN CRUDE', type: 'tanker', typeName: 'VLCC Crude Carrier', flag: 'Panama', flagCode: 'PA', coordinates: [92.0, 6.8], sog: 13.2, cog: 80, zone: 'Andaman Sea', origin: 'Basra (IQ)', destination: 'Zhoushan (CN)', lengthMeters: 333, beamMeters: 60, draftMeters: 21 }),
  vessel({ id: 'io-c-012', name: 'SUNDA BULKER', type: 'cargo', typeName: 'Capesize Bulk Carrier', flag: 'Singapore', flagCode: 'SG', coordinates: [104.0, -7.4], sog: 12.5, cog: 250, zone: 'Sunda Strait Approach', origin: 'Port Hedland (AU)', destination: 'Qingdao (CN)', lengthMeters: 292, beamMeters: 45, draftMeters: 18 }),
  vessel({ id: 'io-c-013', name: 'FREMANTLE ORE', type: 'cargo', typeName: 'Valemax Ore Carrier', flag: 'Marshall Islands', flagCode: 'MH', coordinates: [108.5, -22.0], sog: 13.0, cog: 20, zone: 'Southeast Indian Ocean', origin: 'Dampier (AU)', destination: 'Qingdao (CN)', lengthMeters: 362, beamMeters: 65, draftMeters: 23 }),
  vessel({ id: 'io-c-014', name: 'CAPE ROUTE ATLAS', type: 'cargo', typeName: 'Container Ship (14,000 TEU)', flag: 'Denmark', flagCode: 'DK', coordinates: [42.0, -26.5], sog: 17.0, cog: 40, zone: 'Southwest Indian Ocean // Cape Route', origin: 'Cape Town (ZA)', destination: 'Singapore (SG)', lengthMeters: 366, beamMeters: 51, draftMeters: 15 }),
  vessel({ id: 'io-c-015', name: 'MOZAMBIQUE CHANNEL', type: 'tanker', typeName: 'Aframax Tanker', flag: 'Malta', flagCode: 'MT', coordinates: [41.8, -14.6], sog: 12.0, cog: 195, zone: 'Mozambique Channel', origin: 'Mombasa (KE)', destination: 'Durban (ZA)', lengthMeters: 245, beamMeters: 42, draftMeters: 14 }),
  vessel({ id: 'io-c-016', name: 'PORT LOUIS FEEDER', type: 'cargo', typeName: 'Feeder Container Ship', flag: 'Mauritius', flagCode: 'MU', coordinates: [58.8, -19.8], sog: 14.0, cog: 255, zone: 'Mascarene Basin', origin: 'Port Louis (MU)', destination: 'Reunion (FR)', lengthMeters: 175, beamMeters: 27, draftMeters: 9 }),
  vessel({ id: 'io-c-017', name: 'SEYCHELLES TUNA SEINER', type: 'fishing_dhoni', typeName: 'Purse Seine Tuna Vessel', flag: 'Spain', flagCode: 'ES', coordinates: [55.4, -4.0], sog: 6.0, cog: 120, zone: 'Seychelles EEZ', origin: 'Victoria (SC)', destination: 'Tuna Grounds', lengthMeters: 90, beamMeters: 15, draftMeters: 6, navStatus: 'Engaged in Fishing' }),
  vessel({ id: 'io-c-018', name: 'CHAGOS TRANSIT', type: 'cargo', typeName: 'Bulk Carrier (Kamsarmax)', flag: 'Panama', flagCode: 'PA', coordinates: [70.5, -6.2], sog: 12.8, cog: 85, zone: 'Central Indian Ocean // Chagos Passage', origin: 'Richards Bay (ZA)', destination: 'Qingdao (CN)', lengthMeters: 229, beamMeters: 32, draftMeters: 14 }),
  vessel({ id: 'io-c-019', name: 'LAKSHADWEEP BULK', type: 'cargo', typeName: 'Bulk Carrier (Handymax)', flag: 'India', flagCode: 'IN', coordinates: [72.6, 10.1], sog: 11.0, cog: 175, zone: 'Lakshadweep Sea', origin: 'Kochi (IN)', destination: 'Colombo (LK)', lengthMeters: 180, beamMeters: 30, draftMeters: 10 }),
  vessel({ id: 'io-c-020', name: 'KOCHI COASTAL', type: 'tanker', typeName: 'Product Tanker (MR)', flag: 'India', flagCode: 'IN', coordinates: [74.2, 8.6], sog: 12.0, cog: 200, zone: 'Nine Degree Channel', origin: 'Kochi (IN)', destination: 'Malé (MV)', lengthMeters: 183, beamMeters: 32, draftMeters: 11 }),
  vessel({ id: 'io-c-021', name: 'INDIAN OCEAN HAWK', type: 'tanker', typeName: 'LPG Carrier (VLGC)', flag: 'Singapore', flagCode: 'SG', coordinates: [77.0, -1.5], sog: 15.0, cog: 285, zone: 'Equatorial Indian Ocean', origin: 'Dampier (AU)', destination: 'Mundra (IN)', lengthMeters: 226, beamMeters: 37, draftMeters: 11 }),
  vessel({ id: 'io-c-022', name: 'SOKOTRA GATEWAY', type: 'cargo', typeName: 'Container Ship (11,000 TEU)', flag: 'Germany', flagCode: 'DE', coordinates: [54.8, 12.6], sog: 18.0, cog: 70, zone: 'Socotra Passage', origin: 'Jeddah (SA)', destination: 'Colombo (LK)', lengthMeters: 335, beamMeters: 46, draftMeters: 14 }),
  vessel({ id: 'io-c-023', name: 'KARACHI TRADER', type: 'cargo', typeName: 'General Cargo Ship', flag: 'Pakistan', flagCode: 'PK', coordinates: [66.2, 23.8], sog: 11.0, cog: 205, zone: 'Northern Arabian Sea', origin: 'Karachi (PK)', destination: 'Dubai (AE)', lengthMeters: 160, beamMeters: 25, draftMeters: 9 }),
  vessel({ id: 'io-c-024', name: 'CHENNAI LINK', type: 'cargo', typeName: 'Container Ship (6,000 TEU)', flag: 'Liberia', flagCode: 'LR', coordinates: [83.2, 11.0], sog: 16.0, cog: 195, zone: 'Bay of Bengal // Coromandel Coast', origin: 'Chennai (IN)', destination: 'Colombo (LK)', lengthMeters: 280, beamMeters: 40, draftMeters: 13 }),
  vessel({ id: 'io-c-025', name: 'DIEGO SOUTH FISHER', type: 'fishing_dhoni', typeName: 'Longline Fishing Vessel', flag: 'Taiwan', flagCode: 'TW', coordinates: [71.0, -9.5], sog: 5.5, cog: 210, zone: 'Chagos High Seas', origin: 'Port Louis (MU)', destination: 'Fishing Grounds', lengthMeters: 55, beamMeters: 9, draftMeters: 4, navStatus: 'Engaged in Longline Fishing' }),
];

// ─── NAVAL / MILITARY PRESENCE (MODELED OSINT) ───
const NAVAL: MaritimeVessel[] = [
  // Indian Navy
  vessel({ id: 'io-n-in-01', name: 'INDIAN NAVY CARRIER STRIKE GROUP', type: 'naval_warship', typeName: 'Aircraft Carrier Task Group (CSG)', flag: 'India', flagCode: 'IN', coordinates: [68.2, 15.8], sog: 14, cog: 200, zone: 'Arabian Sea // Western Fleet Ops Area', origin: 'Karwar Naval Base', destination: 'Arabian Sea Patrol', lengthMeters: 262, beamMeters: 62, draftMeters: 8.4, navStatus: 'Carrier Group Ops (Modeled)' }),
  vessel({ id: 'io-n-in-02', name: 'INDIAN NAVY GUIDED-MISSILE DESTROYER', type: 'naval_warship', typeName: 'Kolkata-class Destroyer (DDG)', flag: 'India', flagCode: 'IN', coordinates: [72.0, 9.6], sog: 16, cog: 170, zone: 'Lakshadweep Sea', origin: 'Kochi (IN)', destination: 'Maldives EEZ Patrol', lengthMeters: 163, beamMeters: 17.4, draftMeters: 6.5 }),
  vessel({ id: 'io-n-in-03', name: 'INDIAN NAVY FRIGATE (EASTERN FLEET)', type: 'naval_warship', typeName: 'Frigate (FFG)', flag: 'India', flagCode: 'IN', coordinates: [84.5, 13.5], sog: 15, cog: 190, zone: 'Bay of Bengal // Eastern Fleet Ops Area', origin: 'Visakhapatnam (IN)', destination: 'Bay of Bengal Patrol', lengthMeters: 142, beamMeters: 16, draftMeters: 4.5 }),
  vessel({ id: 'io-n-in-04', name: 'INDIAN NAVY FLEET TANKER', type: 'naval_support', typeName: 'Fleet Support Ship (AOR)', flag: 'India', flagCode: 'IN', coordinates: [71.4, 6.2], sog: 13, cog: 190, zone: 'Eight Degree Channel // Northern EEZ', origin: 'Kochi (IN)', destination: 'Southern Indian Ocean Deployment', lengthMeters: 175, beamMeters: 25, draftMeters: 9 }),
  vessel({ id: 'io-n-in-05', name: 'INDIAN NAVY OFFSHORE PATROL VESSEL', type: 'naval_warship', typeName: 'Offshore Patrol Vessel (OPV)', flag: 'India', flagCode: 'IN', coordinates: [73.9, 4.9], sog: 12, cog: 15, zone: 'Kaafu Atoll // Malé Approaches', origin: 'Malé (MV)', destination: 'Joint EEZ Surveillance (IN-MV)', lengthMeters: 105, beamMeters: 13, draftMeters: 3.6, navStatus: 'Joint Surveillance Patrol (Modeled)' }),
  // United States (5th / 7th Fleet, Diego Garcia)
  vessel({ id: 'io-n-us-01', name: 'US NAVY CARRIER STRIKE GROUP (5TH FLEET)', type: 'naval_warship', typeName: 'Aircraft Carrier Task Group (CSG)', flag: 'United States', flagCode: 'US', coordinates: [63.0, 18.5], sog: 15, cog: 270, zone: 'Arabian Sea // 5th Fleet AOR', origin: 'Bahrain (NSA)', destination: 'Arabian Sea Operations', lengthMeters: 333, beamMeters: 77, draftMeters: 11.3, navStatus: 'Carrier Group Ops (Modeled)' }),
  vessel({ id: 'io-n-us-02', name: 'US NAVY DESTROYER', type: 'naval_warship', typeName: 'Arleigh Burke-class Destroyer (DDG)', flag: 'United States', flagCode: 'US', coordinates: [58.9, 24.9], sog: 17, cog: 110, zone: 'Gulf of Oman', origin: 'Bahrain (NSA)', destination: 'Strait of Hormuz Escort', lengthMeters: 155, beamMeters: 20, draftMeters: 9.3 }),
  vessel({ id: 'io-n-us-03', name: 'USNS PREPOSITIONED LOGISTICS SHIP', type: 'naval_support', typeName: 'Maritime Prepositioning Ship', flag: 'United States', flagCode: 'US', coordinates: [72.35, -7.4], sog: 0.5, cog: 0, zone: 'Diego Garcia Anchorage // BIOT', origin: 'Diego Garcia', destination: 'Diego Garcia', lengthMeters: 230, beamMeters: 32, draftMeters: 10, navStatus: 'At Anchor' }),
  // CTF-151 / EUNAVFOR Atalanta / Combined Maritime Forces
  vessel({ id: 'io-n-ctf-01', name: 'CTF-151 COUNTER-PIRACY FRIGATE', type: 'naval_warship', typeName: 'Multinational Frigate (CMF)', flag: 'Multinational', flagCode: 'CMF', coordinates: [47.8, 12.2], sog: 14, cog: 80, zone: 'Gulf of Aden // IRTC', origin: 'Djibouti', destination: 'Counter-Piracy Patrol', lengthMeters: 135, beamMeters: 15, draftMeters: 5 }),
  vessel({ id: 'io-n-eu-01', name: 'EUNAVFOR ATALANTA FRIGATE', type: 'naval_warship', typeName: 'EU Naval Force Frigate', flag: 'European Union', flagCode: 'EU', coordinates: [51.2, 8.4], sog: 13, cog: 100, zone: 'Somali Basin', origin: 'Djibouti', destination: 'Operation Atalanta Patrol', lengthMeters: 138, beamMeters: 16, draftMeters: 5 }),
  vessel({ id: 'io-n-fr-01', name: 'FRENCH NAVY FRIGATE (FAZSOI)', type: 'naval_warship', typeName: 'Frigate (FREMM)', flag: 'France', flagCode: 'FR', coordinates: [56.0, -20.0], sog: 14, cog: 330, zone: 'Mascarene Basin // La Réunion', origin: 'La Réunion (FR)', destination: 'Southwest Indian Ocean Patrol', lengthMeters: 142, beamMeters: 20, draftMeters: 5 }),
  vessel({ id: 'io-n-uk-01', name: 'ROYAL NAVY TYPE 45 DESTROYER', type: 'naval_warship', typeName: 'Type 45 Destroyer (DDG)', flag: 'United Kingdom', flagCode: 'GB', coordinates: [52.0, 26.4], sog: 15, cog: 140, zone: 'Persian Gulf', origin: 'Bahrain (UKMTO)', destination: 'Gulf Maritime Security', lengthMeters: 152, beamMeters: 21, draftMeters: 7.4 }),
  vessel({ id: 'io-n-jp-01', name: 'JMSDF ANTI-PIRACY DESTROYER', type: 'naval_warship', typeName: 'Destroyer (DD)', flag: 'Japan', flagCode: 'JP', coordinates: [44.9, 12.0], sog: 14, cog: 250, zone: 'Gulf of Aden', origin: 'Djibouti', destination: 'Escort Operations', lengthMeters: 151, beamMeters: 17.4, draftMeters: 5.3 }),
  // China
  vessel({ id: 'io-n-cn-01', name: 'PLAN ESCORT TASK FORCE', type: 'naval_warship', typeName: 'Type 052D Destroyer + Supply Ship (Escort TF)', flag: 'China', flagCode: 'CN', coordinates: [46.2, 13.4], sog: 15, cog: 90, zone: 'Gulf of Aden // Djibouti Support Base', origin: 'Djibouti (CN Base)', destination: 'Gulf of Aden Escort', lengthMeters: 156, beamMeters: 18, draftMeters: 6 }),
  vessel({ id: 'io-n-cn-02', name: 'PLAN OCEAN SURVEY VESSEL', type: 'naval_support', typeName: 'Research / Survey Ship (Naval Auxiliary)', flag: 'China', flagCode: 'CN', coordinates: [80.8, -3.6], sog: 8, cog: 270, zone: 'Central Indian Ocean Basin', origin: 'Sanya (CN)', destination: 'Indian Ocean Survey Track', lengthMeters: 130, beamMeters: 16, draftMeters: 6, navStatus: 'Survey Operations (Modeled)' }),
  // Regional navies
  vessel({ id: 'io-n-lk-01', name: 'SRI LANKA NAVY OFFSHORE PATROL VESSEL', type: 'naval_warship', typeName: 'Offshore Patrol Vessel (OPV)', flag: 'Sri Lanka', flagCode: 'LK', coordinates: [79.4, 7.4], sog: 12, cog: 10, zone: 'Gulf of Mannar // Colombo SLOC', origin: 'Colombo (LK)', destination: 'EEZ Patrol', lengthMeters: 105, beamMeters: 13, draftMeters: 3.6 }),
  vessel({ id: 'io-n-pk-01', name: 'PAKISTAN NAVY FRIGATE', type: 'naval_warship', typeName: 'Frigate (FFG)', flag: 'Pakistan', flagCode: 'PK', coordinates: [65.8, 24.1], sog: 14, cog: 200, zone: 'Northern Arabian Sea', origin: 'Karachi (PK)', destination: 'Maritime Security Patrol', lengthMeters: 134, beamMeters: 15, draftMeters: 4.5 }),
  vessel({ id: 'io-n-ir-01', name: 'IRIN FRIGATE', type: 'naval_warship', typeName: 'Frigate', flag: 'Iran', flagCode: 'IR', coordinates: [57.4, 25.2], sog: 13, cog: 260, zone: 'Gulf of Oman', origin: 'Bandar Abbas (IR)', destination: 'Gulf of Oman Patrol', lengthMeters: 95, beamMeters: 11, draftMeters: 3 }),
  vessel({ id: 'io-n-bd-01', name: 'BANGLADESH NAVY FRIGATE', type: 'naval_warship', typeName: 'Frigate (FFG)', flag: 'Bangladesh', flagCode: 'BD', coordinates: [90.2, 19.2], sog: 12, cog: 210, zone: 'Bay of Bengal', origin: 'Chittagong (BD)', destination: 'EEZ Patrol', lengthMeters: 120, beamMeters: 14, draftMeters: 4 }),
  vessel({ id: 'io-n-id-01', name: 'INDONESIAN NAVY CORVETTE', type: 'naval_warship', typeName: 'Corvette (FS)', flag: 'Indonesia', flagCode: 'ID', coordinates: [95.6, 4.4], sog: 13, cog: 300, zone: 'Andaman Sea // Aceh Approach', origin: 'Sabang (ID)', destination: 'Malacca Strait Patrol', lengthMeters: 90, beamMeters: 13, draftMeters: 3.5 }),
  vessel({ id: 'io-n-au-01', name: 'RAN FRIGATE (INDIAN OCEAN DEPLOYMENT)', type: 'naval_warship', typeName: 'Anzac-class Frigate (FFH)', flag: 'Australia', flagCode: 'AU', coordinates: [102.5, -14.8], sog: 14, cog: 290, zone: 'Southeast Indian Ocean // Cocos (Keeling)', origin: 'Fremantle (AU)', destination: 'Indian Ocean Regional Presence', lengthMeters: 118, beamMeters: 14.8, draftMeters: 4.3 }),
];

export const INDIAN_OCEAN_VESSELS: MaritimeVessel[] = [...COMMERCIAL, ...NAVAL];
