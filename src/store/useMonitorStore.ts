import { create } from 'zustand';

export type EntityType = 'vessel' | 'flight' | 'cable' | 'atoll' | 'port' | 'chokepoint' | 'news' | 'weather';

export interface SelectedEntity {
  type: EntityType;
  id: string;
  title: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant: 'emerald' | 'cyan' | 'amber' | 'crimson' | 'purple';
  };
  coordinates?: [number, number];
  telemetry: Record<string, string | number | boolean | null | undefined>;
  details?: Record<string, any>;
  raw?: any;
}

export type ActiveDrawerTab = 'maritime' | 'aviation' | 'weather' | 'macro' | 'tv';

interface MonitorState {
  // Layer Toggles
  showVessels: boolean;
  showFlights: boolean;
  showWeatherAlerts: boolean;
  showCables: boolean;
  showPortsAndAirports: boolean;
  showEEZBoundary: boolean;
  showChokepoints: boolean;
  showRadarSweep: boolean;
  
  // Tactical UI Preferences
  soundEnabled: boolean;
  crtScanlines: boolean;
  defconLevel: number; // 1 (War/Tsunami) to 5 (Peacetime)
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  activeRightTab: ActiveDrawerTab;
  
  // Selected Entity Inspector
  selectedEntity: SelectedEntity | null;
  flyToTarget: { coordinates: [number, number]; zoom?: number; pitch?: number; bearing?: number; timestamp: number } | null;
  
  // Filters
  vesselCategoryFilter: string;
  flightCategoryFilter: string;
  searchFilter: string;
  selectedAtollId: string | null;

  // Actions
  toggleLayer: (layer: 'vessels' | 'flights' | 'weather' | 'cables' | 'ports' | 'eez' | 'chokepoints' | 'radar') => void;
  setSoundEnabled: (enabled: boolean) => void;
  toggleSound: () => void;
  toggleCrtScanlines: () => void;
  setLeftPanelOpen: (open: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
  setActiveRightTab: (tab: ActiveDrawerTab) => void;
  setSelectedEntity: (entity: SelectedEntity | null) => void;
  setFlyToTarget: (target: { coordinates: [number, number]; zoom?: number; pitch?: number; bearing?: number } | null) => void;
  setVesselCategoryFilter: (category: string) => void;
  setFlightCategoryFilter: (category: string) => void;
  setSearchFilter: (query: string) => void;
  setSelectedAtollId: (atollId: string | null) => void;
  resetFilters: () => void;
}

export const useMonitorStore = create<MonitorState>((set) => ({
  // Layer Toggles (all default on for rich situational awareness)
  showVessels: true,
  showFlights: true,
  showWeatherAlerts: true,
  showCables: true,
  showPortsAndAirports: true,
  showEEZBoundary: true,
  showChokepoints: true,
  showRadarSweep: true,

  // Tactical HUD Preferences
  soundEnabled: true,
  crtScanlines: false,
  defconLevel: 4, // Peacetime Elevated Surveillance
  leftPanelOpen: true,
  rightPanelOpen: true,
  activeRightTab: 'maritime',

  // Selection & Focus
  selectedEntity: null,
  flyToTarget: null,

  // Filters
  vesselCategoryFilter: 'all',
  flightCategoryFilter: 'all',
  searchFilter: '',
  selectedAtollId: null,

  // Actions
  toggleLayer: (layer) =>
    set((state) => {
      switch (layer) {
        case 'vessels':
          return { showVessels: !state.showVessels };
        case 'flights':
          return { showFlights: !state.showFlights };
        case 'weather':
          return { showWeatherAlerts: !state.showWeatherAlerts };
        case 'cables':
          return { showCables: !state.showCables };
        case 'ports':
          return { showPortsAndAirports: !state.showPortsAndAirports };
        case 'eez':
          return { showEEZBoundary: !state.showEEZBoundary };
        case 'chokepoints':
          return { showChokepoints: !state.showChokepoints };
        case 'radar':
          return { showRadarSweep: !state.showRadarSweep };
        default:
          return state;
      }
    }),

  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  toggleCrtScanlines: () => set((state) => ({ crtScanlines: !state.crtScanlines })),
  setLeftPanelOpen: (open) => set({ leftPanelOpen: open }),
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
  setActiveRightTab: (tab) => set({ activeRightTab: tab, rightPanelOpen: true }),
  
  setSelectedEntity: (entity) => set({ selectedEntity: entity }),
  
  setFlyToTarget: (target) =>
    set({
      flyToTarget: target ? { ...target, timestamp: Date.now() } : null,
    }),

  setVesselCategoryFilter: (category) => set({ vesselCategoryFilter: category }),
  setFlightCategoryFilter: (category) => set({ flightCategoryFilter: category }),
  setSearchFilter: (query) => set({ searchFilter: query }),
  setSelectedAtollId: (atollId) => set({ selectedAtollId: atollId }),

  resetFilters: () =>
    set({
      vesselCategoryFilter: 'all',
      flightCategoryFilter: 'all',
      searchFilter: '',
      selectedAtollId: null,
    }),
}));
