import { create } from "zustand";
import { MapLayer, MapViewport, PlanType } from "@/types";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/lib/constants";

interface MapState {
  viewport: MapViewport;
  layers: MapLayer[];
  activePlanType: PlanType | null;
  selectedParcelId: string | null;
  selectedFeature: Record<string, any> | null;
  isFullscreen: boolean;
  setViewport: (viewport: Partial<MapViewport>) => void;
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  addLayer: (layer: MapLayer) => void;
  removeLayer: (layerId: string) => void;
  toggleLayer: (layerId: string) => void;
  setActivePlanType: (type: PlanType | null) => void;
  setSelectedParcelId: (id: string | null) => void;
  setSelectedFeature: (feature: Record<string, any> | null) => void;
  toggleFullscreen: () => void;
  resetViewport: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  viewport: {
    center: DEFAULT_MAP_CENTER,
    zoom: DEFAULT_MAP_ZOOM,
    pitch: 0,
    bearing: 0,
  },
  layers: [],
  activePlanType: null,
  selectedParcelId: null,
  selectedFeature: null,
  isFullscreen: false,

  setViewport: (viewport) =>
    set((state) => ({
      viewport: { ...state.viewport, ...viewport },
    })),

  setCenter: (center) =>
    set((state) => ({
      viewport: { ...state.viewport, center },
    })),

  setZoom: (zoom) =>
    set((state) => ({
      viewport: { ...state.viewport, zoom },
    })),

  addLayer: (layer) =>
    set((state) => ({
      layers: [...state.layers.filter((l) => l.id !== layer.id), layer],
    })),

  removeLayer: (layerId) =>
    set((state) => ({
      layers: state.layers.filter((l) => l.id !== layerId),
    })),

  toggleLayer: (layerId) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === layerId ? { ...l, visible: !l.visible } : l
      ),
    })),

  setActivePlanType: (type) => set({ activePlanType: type }),
  setSelectedParcelId: (id) => set({ selectedParcelId: id }),
  setSelectedFeature: (feature) => set({ selectedFeature: feature }),
  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),

  resetViewport: () =>
    set({
      viewport: {
        center: DEFAULT_MAP_CENTER,
        zoom: DEFAULT_MAP_ZOOM,
        pitch: 0,
        bearing: 0,
      },
    }),
}));
