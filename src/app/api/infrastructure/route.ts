import { NextResponse } from 'next/server';
import { MALDIVES_AIRPORTS, MALDIVES_PORTS } from '@/data/maldivesGeo';
import {
  CABLE_LANDING_STATIONS,
  SUBMARINE_CABLES_GEOJSON,
  NETWORK_OUTAGES,
  TELECOM_HEALTH_METRICS,
  CELL_TOWERS,
} from '@/data/cablesGeoJson';

export const MEDICAL_FACILITIES = [
  {
    id: 'med-igmh',
    name: 'Indira Gandhi Memorial Hospital (IGMH)',
    atoll: 'Kaafu (Malé)',
    coordinates: [73.5025, 4.1720],
    level: 'TERTIARY_NATIONAL_TRAUMA_CENTER',
    beds: 350,
    helipad: true,
  },
  {
    id: 'med-dharumavantha',
    name: 'Dharumavantha Hospital (25-Story Medical Complex)',
    atoll: 'Kaafu (Malé)',
    coordinates: [73.5038, 4.1728],
    level: 'SPECIALIST_CARDIOLOGY_ICU',
    beds: 500,
    helipad: true,
  },
  {
    id: 'med-addu-aeh',
    name: 'Addu Equatorial Hospital (AEH)',
    atoll: 'Seenu (Hithadhoo)',
    coordinates: [73.0910, -0.6080],
    level: 'REGIONAL_TERTIARY_HOSPITAL',
    beds: 100,
    helipad: true,
  },
  {
    id: 'med-kulhudhuffushi',
    name: 'Kulhudhuffushi Regional Hospital (KRH)',
    atoll: 'Haa Dhaalu (Kulhudhuffushi)',
    coordinates: [73.0690, 6.6260],
    level: 'NORTHERN_REGIONAL_TRAUMA_CENTER',
    beds: 80,
    helipad: false,
  },
  {
    id: 'med-ungoo',
    name: 'Ungoofaaru Regional Hospital',
    atoll: 'Raa Atoll',
    coordinates: [73.0315, 5.6725],
    level: 'REGIONAL_HOSPITAL',
    beds: 60,
    helipad: false,
  },
];

export async function GET() {
  return NextResponse.json(
    {
      timestamp: new Date().toISOString(),
      cables: SUBMARINE_CABLES_GEOJSON,
      cableStations: CABLE_LANDING_STATIONS,
      airports: MALDIVES_AIRPORTS,
      ports: MALDIVES_PORTS,
      medicalHospitals: MEDICAL_FACILITIES,
      telecomOutages: NETWORK_OUTAGES,
      telecomHealth: TELECOM_HEALTH_METRICS,
      cellTowers: CELL_TOWERS,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    }
  );
}
