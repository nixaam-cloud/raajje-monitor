/**
 * Geolocated Maldives CCTV & Live Camera Intelligence Catalog
 * Features real-world geographic coordinates, camera orientations (heading & FOV),
 * categories, and live stream endpoints across Greater Malé and the Atolls.
 */

export type CCTVCategory = 'TRAFFIC' | 'PORT' | 'AIRPORT' | 'COASTAL' | 'REEF' | 'METRO';
export type CCTVStreamType = 'hls' | 'youtube' | 'mjpeg' | 'demo';

export interface CCTVFeed {
  id: string;
  name: string;
  code: string;
  locationName: string;
  atoll: string;
  coordinates: [number, number]; // [lng, lat]
  heading: number; // 0 - 360 deg orientation of camera view
  fov: number; // field of view in degrees (e.g. 55-80)
  category: CCTVCategory;
  status: 'ONLINE' | 'STANDBY';
  resolution: '4K' | '1080p' | '720p';
  fps: number;
  streamType: CCTVStreamType;
  streamUrl: string;
  youtubeId?: string;
  posterImage?: string;
  description: string;
  zone: string;
  telemetry: {
    sensorType: 'OPTICAL 4K' | 'THERMAL / IR' | 'LOW-LIGHT CMOS';
    zoomLevel: string;
    ptzCapable: boolean;
    nightVision: boolean;
    weatherResistance: string;
    bitrateMbps: number;
  };
}

export const MALDIVES_CCTV_FEEDS: CCTVFeed[] = [
  // 1. Sinamalé Bridge (China-Maldives Friendship Bridge) - Malé Approach
  {
    id: 'cam-brg-01',
    code: 'CAM-BRG-MLE-01',
    name: 'Sinamalé Bridge // Malé Western Approach',
    locationName: 'Sinamalé Bridge (Malé Ramp)',
    atoll: 'Kaafu',
    coordinates: [73.5220, 4.1820],
    heading: 45, // Looking NE along the bridge
    fov: 65,
    category: 'TRAFFIC',
    status: 'ONLINE',
    resolution: '1080p',
    fps: 30,
    streamType: 'demo',
    streamUrl: '',
    youtubeId: 'L_LUpnjgPso', // Live ocean/coastal stream fallback
    description: 'Real-time traffic flow surveillance monitoring commuter transit between Malé City and Sinamalé Bridge ramp.',
    zone: 'Greater Malé Metropolitan',
    telemetry: {
      sensorType: 'OPTICAL 4K',
      zoomLevel: '1.0x (Wide)',
      ptzCapable: true,
      nightVision: true,
      weatherResistance: 'IP67 Marine Salt Resistant',
      bitrateMbps: 4.8,
    },
  },

  // 2. Sinamalé Bridge - Mid-Span Sea Crossing
  {
    id: 'cam-brg-02',
    code: 'CAM-BRG-MID-02',
    name: 'Sinamalé Bridge // Overwater Mid-Span',
    locationName: 'Sinamalé Bridge (Overwater Section)',
    atoll: 'Kaafu',
    coordinates: [73.5255, 4.1865],
    heading: 50,
    fov: 70,
    category: 'TRAFFIC',
    status: 'ONLINE',
    resolution: '1080p',
    fps: 30,
    streamType: 'demo',
    streamUrl: '',
    description: 'High-elevation panoramic over-water crossing camera monitoring marine chokepoint transit under main navigation arch.',
    zone: 'Greater Malé Metropolitan',
    telemetry: {
      sensorType: 'OPTICAL 4K',
      zoomLevel: '1.2x',
      ptzCapable: true,
      nightVision: true,
      weatherResistance: 'IP68 Storm Tested',
      bitrateMbps: 5.2,
    },
  },

  // 3. Sinamalé Bridge - Hulhulé Airport Junction
  {
    id: 'cam-brg-03',
    code: 'CAM-BRG-HUL-03',
    name: 'Sinamalé Bridge // Hulhulé Airport Junction',
    locationName: 'Velana Airport Link Ramp',
    atoll: 'Kaafu',
    coordinates: [73.5290, 4.1918],
    heading: 25,
    fov: 60,
    category: 'TRAFFIC',
    status: 'ONLINE',
    resolution: '1080p',
    fps: 30,
    streamType: 'demo',
    streamUrl: '',
    description: 'Airport connector roundabout surveillance tracking transit to Velana International Airport terminals.',
    zone: 'Velana International Airport Perimeter',
    telemetry: {
      sensorType: 'OPTICAL 4K',
      zoomLevel: '1.0x',
      ptzCapable: true,
      nightVision: true,
      weatherResistance: 'IP67 Marine Salt Resistant',
      bitrateMbps: 4.5,
    },
  },

  // 4. Hulhumalé Highway - Central Expressway
  {
    id: 'cam-hwy-01',
    code: 'CAM-HWY-EXP-01',
    name: 'Hulhumalé Highway // Expressway Link',
    locationName: 'Hulhulé - Hulhumalé Link Road',
    atoll: 'Kaafu',
    coordinates: [73.5350, 4.2050],
    heading: 15,
    fov: 65,
    category: 'TRAFFIC',
    status: 'ONLINE',
    resolution: '1080p',
    fps: 30,
    streamType: 'demo',
    streamUrl: '',
    description: 'Expressway four-lane dual carriageway monitoring speeding, bus transit lanes, and weather swell ocean spray.',
    zone: 'Hulhumalé Expressway Corridor',
    telemetry: {
      sensorType: 'OPTICAL 4K',
      zoomLevel: '1.5x Telephoto',
      ptzCapable: true,
      nightVision: true,
      weatherResistance: 'IP67 Marine Salt Resistant',
      bitrateMbps: 4.8,
    },
  },

  // 5. Hulhumalé Central Park & Nirolhu Magu Boulevard
  {
    id: 'cam-hul-01',
    code: 'CAM-HUL-MET-01',
    name: 'Hulhumalé Smart City // Central Park & Nirolhu',
    locationName: 'Hulhumalé Phase 1 & 2 Center',
    atoll: 'Kaafu',
    coordinates: [73.5412, 4.2155],
    heading: 345,
    fov: 80,
    category: 'METRO',
    status: 'ONLINE',
    resolution: '4K',
    fps: 30,
    streamType: 'demo',
    streamUrl: '',
    description: 'Municipal smart city surveillance grid overlooking Central Park civic square, synthetic track, and municipal hub.',
    zone: 'Hulhumalé Smart City Grid',
    telemetry: {
      sensorType: 'OPTICAL 4K',
      zoomLevel: '1.0x (Wide Panoramic)',
      ptzCapable: true,
      nightVision: true,
      weatherResistance: 'IP66 Weatherproof',
      bitrateMbps: 6.0,
    },
  },

  // 6. Malé Commercial Harbor & North Port Quay
  {
    id: 'cam-port-01',
    code: 'CAM-MLE-PRT-01',
    name: 'Malé Commercial Harbor // International Cargo Berth',
    locationName: 'North Port Container Terminal',
    atoll: 'Kaafu',
    coordinates: [73.5070, 4.1790],
    heading: 310,
    fov: 75,
    category: 'PORT',
    status: 'ONLINE',
    resolution: '1080p',
    fps: 30,
    streamType: 'demo',
    streamUrl: '',
    description: 'Maldives Ports Limited (MPL) container ship gantry crane operations and harbor channel vessel entry.',
    zone: 'Port of Malé Maritime Sector',
    telemetry: {
      sensorType: 'THERMAL / IR',
      zoomLevel: '2.0x Optical',
      ptzCapable: true,
      nightVision: true,
      weatherResistance: 'IP68 Marine Port Grade',
      bitrateMbps: 5.5,
    },
  },

  // 7. Malé Southwest Harbor & T-Jetty
  {
    id: 'cam-port-02',
    code: 'CAM-MLE-TJT-02',
    name: 'Malé Southwest Harbor // T-Jetty Fuel & Cargo',
    locationName: 'Boduthakurufaanu Magu South Quay',
    atoll: 'Kaafu',
    coordinates: [73.5020, 4.1710],
    heading: 220,
    fov: 70,
    category: 'PORT',
    status: 'ONLINE',
    resolution: '1080p',
    fps: 30,
    streamType: 'demo',
    streamUrl: '',
    description: 'Atoll cargo dhoni loading basin, fuel bunkering quayside, and industrial slipway surveillance.',
    zone: 'Port of Malé Maritime Sector',
    telemetry: {
      sensorType: 'OPTICAL 4K',
      zoomLevel: '1.0x',
      ptzCapable: true,
      nightVision: true,
      weatherResistance: 'IP67 Marine Salt Resistant',
      bitrateMbps: 4.2,
    },
  },

  // 8. Velana Airport - Seaplane Water Aerodrome & Runway 18
  {
    id: 'cam-air-01',
    code: 'CAM-VIA-RWY-01',
    name: 'Velana International // Runway 18 & Water Aerodrome',
    locationName: 'Hulhulé Island Seaplane Docks',
    atoll: 'Kaafu',
    coordinates: [73.5320, 4.1950],
    heading: 180,
    fov: 65,
    category: 'AIRPORT',
    status: 'ONLINE',
    resolution: '4K',
    fps: 30,
    streamType: 'demo',
    streamUrl: '',
    description: 'Aviation security feed monitoring world largest seaplane floatplane water aerodrome and main commercial runway.',
    zone: 'Velana International Airport (VRMM)',
    telemetry: {
      sensorType: 'OPTICAL 4K',
      zoomLevel: '3.0x Telephoto',
      ptzCapable: true,
      nightVision: true,
      weatherResistance: 'IP67 Aviation Grade',
      bitrateMbps: 7.2,
    },
  },

  // 9. Kuredu Island Lagoon & Coral Reef (Lhaviyani Atoll)
  {
    id: 'cam-res-01',
    code: 'CAM-LHV-KRD-01',
    name: 'Kuredu Island // Coral Reef & House Lagoon',
    locationName: 'Kuredu Island Resort & Marine Sanctuary',
    atoll: 'Lhaviyani',
    coordinates: [73.4650, 5.5500],
    heading: 270,
    fov: 85,
    category: 'COASTAL',
    status: 'ONLINE',
    resolution: '1080p',
    fps: 30,
    streamType: 'youtube',
    youtubeId: 'L_LUpnjgPso', // Live ocean/coastal stream
    streamUrl: '',
    description: 'Skyline-linked coastal marine webcam observing house reef sea conditions, sea turtles, and ocean swells.',
    zone: 'Northern Atolls Marine Protected Area',
    telemetry: {
      sensorType: 'LOW-LIGHT CMOS',
      zoomLevel: '1.0x Ultra-Wide',
      ptzCapable: false,
      nightVision: true,
      weatherResistance: 'IP68 Tropical Marine',
      bitrateMbps: 5.0,
    },
  },

  // 10. Veligandu Island Beach & Ocean Cam (Rasdhoo Atoll)
  {
    id: 'cam-res-02',
    code: 'CAM-RSD-VLG-02',
    name: 'Veligandu Island // Ocean Bar & Sandbank',
    locationName: 'Veligandu Island Beachfront',
    atoll: 'Alif Alif (Rasdhoo)',
    coordinates: [72.9960, 4.2980],
    heading: 190,
    fov: 75,
    category: 'COASTAL',
    status: 'ONLINE',
    resolution: '1080p',
    fps: 30,
    streamType: 'demo',
    streamUrl: '',
    description: 'High-definition ocean webcam monitoring southern sandbank wave refraction and incoming swell energy.',
    zone: 'Central Atolls Barrier Lagoon',
    telemetry: {
      sensorType: 'OPTICAL 4K',
      zoomLevel: '1.0x',
      ptzCapable: true,
      nightVision: true,
      weatherResistance: 'IP67 Tropical Marine',
      bitrateMbps: 4.8,
    },
  },

  // 11. Meeru Island Resort Lagoon (North Malé Atoll)
  {
    id: 'cam-res-03',
    code: 'CAM-KAF-MRU-03',
    name: 'Meeru Island // Eastern Barrier Reef Lagoon',
    locationName: 'Meeru Island Jetty',
    atoll: 'Kaafu',
    coordinates: [73.7170, 4.4530],
    heading: 135,
    fov: 80,
    category: 'COASTAL',
    status: 'ONLINE',
    resolution: '1080p',
    fps: 30,
    streamType: 'demo',
    streamUrl: '',
    description: 'Overlooking outer barrier reef breaker zone, inter-atoll safari yachts, and live weather conditions.',
    zone: 'North Malé Outer Reef Barrier',
    telemetry: {
      sensorType: 'LOW-LIGHT CMOS',
      zoomLevel: '1.0x',
      ptzCapable: false,
      nightVision: true,
      weatherResistance: 'IP68 Marine Port Grade',
      bitrateMbps: 4.2,
    },
  },

  // 12. Cokes Surf Break (Thulusdhoo Island Channel)
  {
    id: 'cam-srf-01',
    code: 'CAM-THU-SRF-01',
    name: 'Cokes Surf Break // Thulusdhoo Channel',
    locationName: 'Thulusdhoo Outer Pass',
    atoll: 'Kaafu',
    coordinates: [73.6500, 4.3730],
    heading: 85,
    fov: 70,
    category: 'REEF',
    status: 'ONLINE',
    resolution: '1080p',
    fps: 30,
    streamType: 'demo',
    streamUrl: '',
    description: 'Surfline marine camera pointing eastward into Kaashidhoo sea lane tracking swell sets, wave height, and tides.',
    zone: 'North Malé Sea Corridor',
    telemetry: {
      sensorType: 'OPTICAL 4K',
      zoomLevel: '2.5x Optical',
      ptzCapable: true,
      nightVision: true,
      weatherResistance: 'IP68 Storm Tested',
      bitrateMbps: 5.4,
    },
  },

  // 13. Hanifaru Bay UNESCO Biosphere Marine Reserve (Baa Atoll)
  {
    id: 'cam-ree-01',
    code: 'CAM-BAA-HNF-01',
    name: 'Hanifaru Bay // UNESCO Biosphere Observatory',
    locationName: 'Hanifaru Marine Reserve',
    atoll: 'Baa',
    coordinates: [73.1500, 5.1700],
    heading: 300,
    fov: 80,
    category: 'REEF',
    status: 'ONLINE',
    resolution: '4K',
    fps: 30,
    streamType: 'demo',
    streamUrl: '',
    description: 'Marine conservation research station monitoring plankton blooms, manta ray aggregations, and eco-tour vessel compliance.',
    zone: 'Baa Atoll UNESCO Biosphere',
    telemetry: {
      sensorType: 'OPTICAL 4K',
      zoomLevel: '1.0x (Wide)',
      ptzCapable: true,
      nightVision: true,
      weatherResistance: 'IP68 Underwater Submersible Mount',
      bitrateMbps: 6.2,
    },
  },

  // 14. Addu City Link Road & Hithadhoo Port (Southern Atolls)
  {
    id: 'cam-add-01',
    code: 'CAM-ADU-HTH-01',
    name: 'Addu City // Link Road & Hithadhoo Port Gateway',
    locationName: 'Addu City (Hithadhoo)',
    atoll: 'Seenu',
    coordinates: [73.0880, -0.6015],
    heading: 140,
    fov: 65,
    category: 'PORT',
    status: 'ONLINE',
    resolution: '1080p',
    fps: 30,
    streamType: 'demo',
    streamUrl: '',
    description: 'Southernmost surveillance checkpoint monitoring equatorial maritime traffic, Gan airport link, and regional harbor.',
    zone: 'Addu City Southern Strategic SLOC',
    telemetry: {
      sensorType: 'OPTICAL 4K',
      zoomLevel: '1.2x',
      ptzCapable: true,
      nightVision: true,
      weatherResistance: 'IP67 Marine Salt Resistant',
      bitrateMbps: 4.6,
    },
  },
];
