import { PlanType } from "@/types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const COLORS: Record<string, string> = {
  primary: "#16a34a",
  secondary: "#64748b",
  accent: "#f59e0b",
  destructive: "#ef4444",
  parcel_original: "#9ca3af",
  possession: "#f97316",
  commercial: "#a855f7",
  road_frontage: "#eab308",
};

export const PLAN_COLORS: Record<PlanType, string> = {
  A: "#ef4444",
  B: "#16a34a",
  C: "#3b82f6",
};

export const RULE_109_DESCRIPTIONS: Record<string, string> = {
  "109(a)": "Every co-owner shall be entitled to partition according to their share",
  "109(b)": "Partition shall be made by metes and bounds",
  "109(c)": "Each share shall have access to a road or pathway",
  "109(d)": "Shares shall be as compact as possible",
  "109(e)": "Existing possession shall be respected to the extent possible",
  "109(f)": "Commercial land shall be fairly distributed",
  "109(g)": "The partition shall not diminish the value of any share",
};

export const LAYER_STYLES: Record<string, Record<string, any>> = {
  parcel: {
    color: "#9ca3af",
    weight: 2,
    fillColor: "#9ca3af",
    fillOpacity: 0.3,
  },
  possession: {
    color: "#f97316",
    weight: 3,
    fillColor: "#f97316",
    fillOpacity: 0.2,
  },
  commercial: {
    color: "#a855f7",
    weight: 2,
    fillColor: "#a855f7",
    fillOpacity: 0.3,
  },
  road_frontage: {
    color: "#eab308",
    weight: 4,
    fillColor: "#eab308",
    fillOpacity: 0.3,
  },
  plan_a: {
    color: "#ef4444",
    weight: 3,
    fillColor: "#ef4444",
    fillOpacity: 0.15,
  },
  plan_b: {
    color: "#16a34a",
    weight: 3,
    fillColor: "#16a34a",
    fillOpacity: 0.15,
  },
  plan_c: {
    color: "#3b82f6",
    weight: 3,
    fillColor: "#3b82f6",
    fillOpacity: 0.15,
  },
};

export const DEFAULT_MAP_CENTER: [number, number] = [20.5937, 78.9629];
export const DEFAULT_MAP_ZOOM = 5;
export const INDIA_BOUNDS: [[number, number], [number, number]] = [
  [6.75, 68.18],
  [37.1, 97.42],
];

export const SCORE_THRESHOLDS = {
  excellent: 80,
  good: 60,
  poor: 40,
};

export const PARCEL_TYPES = [
  "agricultural",
  "residential",
  "commercial",
  "industrial",
  "mixed",
] as const;

export const SOIL_TYPES = [
  "alluvial",
  "black",
  "red",
  "laterite",
  "desert",
  "mountain",
] as const;

export const AREA_UNITS = ["sqm", "hectare", "acre", "sqft"] as const;

export const IMPROVEMENT_OPTIONS = [
  "well",
  "tubewell",
  "trees",
  "building",
  "fence",
  "irrigation",
  "road",
] as const;

export const BOUNDARY_TYPES = ["demarcated", "undemarcated", "partially_demarcated"] as const;
