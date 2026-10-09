import type { AviationFlight } from '@/app/api/aviation/route';

/**
 * Indian Ocean military air assets (MODELED OSINT).
 *
 * Military aircraft rarely appear on public ADS-B feeds, so this layer shows representative
 * maritime-patrol, tanker, transport, ISR and carrier-air activity around known bases and
 * operating areas. Tracks are animated kinematically and tagged `dataQuality: 'MODELED_OSINT'`.
 * Real military aircraft that *do* appear on the live ADS-B feed are auto-detected separately
 * by the aviation route and tagged `LIVE_ADSB`.
 */

type Seed = Pick<
  AviationFlight,
  'id' | 'callsign' | 'operator' | 'aircraftType' | 'coordinates' | 'altitudeFt' | 'velocityKts' | 'headingDeg'
> &
  Partial<AviationFlight> & { role: string; base: string; area: string };

let n = 0;
function mil(s: Seed): AviationFlight {
  n += 1;
  const [lng, lat] = s.coordinates;
  const rad = (s.headingDeg * Math.PI) / 180;
  const cosLat = Math.max(0.2, Math.cos((lat * Math.PI) / 180));
  const back = 0.6;
  const p1: [number, number] = [lng - (Math.sin(rad) * back) / cosLat, lat - Math.cos(rad) * back];
  const p2: [number, number] = [lng - (Math.sin(rad) * back * 0.5) / cosLat, lat - Math.cos(rad) * back * 0.5];
  const { role, base, area, ...rest } = s;
  return {
    icao24: `ae${(0x1000 + n).toString(16)}`,
    aircraftCategory: 'MILITARY',
    origin: base,
    destination: area,
    flightDirection: 'OVERFLIGHT',
    isMaldivesRelated: false,
    verticalRateFpm: 0,
    squawk: '0000',
    flightPhase: 'CRUISE',
    history: [p1, p2, s.coordinates],
    inEEZ: false,
    airwaySector: area,
    isMilitary: true,
    militaryRole: role,
    dataQuality: 'MODELED_OSINT',
    ...rest,
  } as AviationFlight;
}

export const INDIAN_OCEAN_MILITARY_FLIGHTS: AviationFlight[] = [
  // India
  mil({ id: 'io-a-in-01', callsign: 'IN-MPA-01', operator: 'Indian Navy (Naval Aviation)', aircraftType: 'Boeing P-8I Neptune', coordinates: [72.8, 9.2], altitudeFt: 6500, velocityKts: 300, headingDeg: 190, role: 'Maritime Patrol / ASW', base: 'INS Rajali (Arakkonam)', area: 'Lakshadweep & Maldives EEZ Surveillance', isMaldivesRelated: true, inEEZ: false }),
  mil({ id: 'io-a-in-02', callsign: 'IN-MPA-02', operator: 'Indian Navy (Naval Aviation)', aircraftType: 'Dornier 228', coordinates: [73.0, 6.4], altitudeFt: 2500, velocityKts: 170, headingDeg: 5, role: 'Maritime Reconnaissance', base: 'Kochi (INS Garuda)', area: 'Eight Degree Channel Surveillance', isMaldivesRelated: true }),
  mil({ id: 'io-a-in-03', callsign: 'IAF-TRN-01', operator: 'Indian Air Force', aircraftType: 'Boeing C-17 Globemaster III', coordinates: [75.5, 14.8], altitudeFt: 33000, velocityKts: 440, headingDeg: 190, role: 'Strategic Airlift', base: 'Hindon (IN)', area: 'Southern Indian Ocean Airlift Corridor' }),
  // Maldives (MNDF)
  mil({ id: 'io-a-mv-01', callsign: 'MNDF-AIR-1', operator: 'MNDF Air Corps', aircraftType: 'Dornier 228 Maritime Surveillance', coordinates: [73.2, 3.4], altitudeFt: 3000, velocityKts: 175, headingDeg: 180, role: 'EEZ Surveillance / SAR', base: 'Velana International (MLE)', area: 'Maldives Central EEZ Patrol', originCode: 'MLE', isMaldivesRelated: true, inEEZ: true, flightDirection: 'DOMESTIC' }),
  // United States
  mil({ id: 'io-a-us-01', callsign: 'US-MPA-DG1', operator: 'US Navy Patrol Squadron', aircraftType: 'Boeing P-8A Poseidon', coordinates: [73.0, -4.2], altitudeFt: 7000, velocityKts: 310, headingDeg: 20, role: 'Maritime Patrol / ASW', base: 'Diego Garcia (NSF)', area: 'Central Indian Ocean Patrol Box' }),
  mil({ id: 'io-a-us-02', callsign: 'US-ISR-01', operator: 'US Navy', aircraftType: 'Northrop Grumman MQ-4C Triton', coordinates: [62.5, 21.5], altitudeFt: 50000, velocityKts: 330, headingDeg: 320, role: 'Persistent Maritime ISR (UAS)', base: 'Al Udeid / NSA Bahrain', area: 'Arabian Sea ISR Orbit' }),
  mil({ id: 'io-a-us-03', callsign: 'US-TKR-01', operator: 'US Air Force', aircraftType: 'Boeing KC-135 Stratotanker', coordinates: [58.0, 22.5], altitudeFt: 28000, velocityKts: 430, headingDeg: 140, role: 'Aerial Refueling', base: 'Al Udeid AB (QA)', area: 'Arabian Sea Tanker Track' }),
  mil({ id: 'io-a-us-04', callsign: 'US-E2-CSG', operator: 'US Navy Carrier Air Wing', aircraftType: 'Northrop Grumman E-2D Advanced Hawkeye', coordinates: [63.4, 18.2], altitudeFt: 24000, velocityKts: 270, headingDeg: 90, role: 'Airborne Early Warning (Carrier Group)', base: 'CSG Flight Deck (Arabian Sea)', area: 'Carrier Strike Group CAP' }),
  // Gulf of Aden / Djibouti
  mil({ id: 'io-a-fr-01', callsign: 'FR-ATL2-01', operator: 'French Navy Aeronavale', aircraftType: 'Dassault Atlantique 2', coordinates: [46.5, 12.4], altitudeFt: 5000, velocityKts: 260, headingDeg: 70, role: 'Maritime Patrol (Atalanta)', base: 'Djibouti (BA 188)', area: 'Gulf of Aden Counter-Piracy Patrol' }),
  mil({ id: 'io-a-jp-01', callsign: 'JP-P3C-01', operator: 'JMSDF Air Patrol', aircraftType: 'Lockheed P-3C Orion', coordinates: [45.2, 12.1], altitudeFt: 4500, velocityKts: 250, headingDeg: 250, role: 'Maritime Patrol (Counter-Piracy)', base: 'Djibouti (JMSDF Base)', area: 'Gulf of Aden' }),
  mil({ id: 'io-a-us-05', callsign: 'US-UAS-DJ1', operator: 'US AFRICOM', aircraftType: 'General Atomics MQ-9 Reaper', coordinates: [48.5, 11.6], altitudeFt: 20000, velocityKts: 160, headingDeg: 40, role: 'ISR / Strike (UAS)', base: 'Camp Lemonnier (DJ)', area: 'Horn of Africa / Somali Basin ISR' }),
  mil({ id: 'io-a-uk-01', callsign: 'UK-TKR-01', operator: 'Royal Air Force', aircraftType: 'Airbus A330 MRTT Voyager', coordinates: [54.0, 25.5], altitudeFt: 29000, velocityKts: 450, headingDeg: 110, role: 'Aerial Refueling / Transport', base: 'RAF Akrotiri / Gulf', area: 'Gulf Air Bridge' }),
  // Regional air arms
  mil({ id: 'io-a-lk-01', callsign: 'SLAF-MPA-1', operator: 'Sri Lanka Air Force', aircraftType: 'Beechcraft King Air 200 (Maritime)', coordinates: [79.1, 8.6], altitudeFt: 3500, velocityKts: 190, headingDeg: 350, role: 'Maritime Surveillance', base: 'Katunayake (CMB)', area: 'Gulf of Mannar Patrol' }),
  mil({ id: 'io-a-pk-01', callsign: 'PN-MPA-01', operator: 'Pakistan Navy Air Arm', aircraftType: 'Lockheed P-3C Orion', coordinates: [65.0, 23.4], altitudeFt: 5000, velocityKts: 250, headingDeg: 250, role: 'Maritime Patrol', base: 'PNS Mehran (Karachi)', area: 'Northern Arabian Sea' }),
  mil({ id: 'io-a-id-01', callsign: 'ID-MPA-01', operator: 'Indonesian Navy Aviation', aircraftType: 'CASA CN-235 MPA', coordinates: [95.0, 3.8], altitudeFt: 3500, velocityKts: 200, headingDeg: 300, role: 'Maritime Patrol', base: 'Banda Aceh (Sultan Iskandar Muda)', area: 'Andaman Sea Patrol' }),
  mil({ id: 'io-a-au-01', callsign: 'AU-MPA-CC1', operator: 'Royal Australian Air Force', aircraftType: 'Boeing P-8A Poseidon', coordinates: [99.5, -10.2], altitudeFt: 8000, velocityKts: 320, headingDeg: 300, role: 'Maritime Patrol / ASW', base: 'Cocos (Keeling) Islands', area: 'Southeast Indian Ocean Patrol Box' }),
  mil({ id: 'io-a-cn-01', callsign: 'CN-ISR-01', operator: 'PLA Navy Aviation (Djibouti Support)', aircraftType: 'Shaanxi Y-8 Maritime Patrol', coordinates: [47.5, 13.0], altitudeFt: 9000, velocityKts: 270, headingDeg: 80, role: 'Maritime Patrol (Escort Support)', base: 'Djibouti (CN Support Base)', area: 'Gulf of Aden Escort Cover' }),
];
