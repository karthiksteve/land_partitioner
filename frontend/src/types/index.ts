export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: "admin" | "revenue_officer" | "surveyor" | "citizen";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  full_name: string;
  password: string;
  confirm_password: string;
  role: "admin" | "revenue_officer" | "surveyor" | "citizen";
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface Parcel {
  id: string;
  parcel_id: string;
  khasra_number: string;
  state: string;
  district: string;
  tehsil: string;
  village: string;
  area: number;
  area_unit: string;
  land_type: string;
  soil_type: string;
  is_commercial: boolean;
  has_road_frontage: boolean;
  road_frontage_length: number;
  improvements: string[];
  boundary_type: string;
  geometry: GeoJSON.Geometry;
  geometry_type: string;
  status: string;
  owners: Owner[];
  created_at: string;
  updated_at: string;
}

export interface ParcelCreate {
  parcel_id: string;
  khasra_number: string;
  state: string;
  district: string;
  tehsil: string;
  village: string;
  area: number;
  area_unit: string;
  land_type: string;
  soil_type: string;
  is_commercial: boolean;
  has_road_frontage: boolean;
  road_frontage_length?: number;
  improvements?: string[];
  boundary_type: string;
  geometry?: GeoJSON.Geometry;
}

export interface ParcelUpdate {
  parcel_id?: string;
  khasra_number?: string;
  area?: number;
  area_unit?: string;
  land_type?: string;
  soil_type?: string;
  is_commercial?: boolean;
  has_road_frontage?: boolean;
  road_frontage_length?: number;
  improvements?: string[];
  boundary_type?: string;
  geometry?: GeoJSON.Geometry;
  status?: string;
}

export interface ParcelGeoJSON {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: Record<string, any>;
    geometry: GeoJSON.Geometry;
  }>;
}

export interface Owner {
  id: string;
  parcel_id: string;
  name: string;
  share_percentage: number;
  has_existing_possession: boolean;
  possession_area: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OwnerCreate {
  parcel_id: string;
  name: string;
  share_percentage: number;
  has_existing_possession?: boolean;
  possession_area?: number;
}

export type PlanType = "A" | "B" | "C";

export interface PartitionPlan {
  id: string;
  parcel_id: string;
  name: string;
  plan_type: PlanType;
  description: string;
  overall_score: number;
  compactness_score: number;
  road_frontage_score: number;
  commercial_fairness_score: number;
  possession_score: number;
  accessibility_score: number;
  equity_score: number;
  legal_compliance_score: number;
  status: "draft" | "generated" | "approved" | "rejected";
  is_recommended: boolean;
  allotments: Allotment[];
  created_at: string;
  updated_at: string;
}

export interface PartitionPlanCreate {
  parcel_id: string;
  plan_type: PlanType;
  description?: string;
}

export interface Allotment {
  id: string;
  plan_id: string;
  owner_id: string;
  owner_name: string;
  share_percentage: number;
  area_allocated: number;
  geometry: GeoJSON.Geometry;
  has_possession: boolean;
  is_commercial_allocation: boolean;
  has_road_frontage: boolean;
  compliance_notes: string;
}

export interface ScoreMetric {
  name: string;
  score: number;
  weight: number;
  description: string;
}

export interface ScoreResponse {
  overall: number;
  metrics: ScoreMetric[];
}

export interface KurraReport {
  id: string;
  plan_id: string;
  parcel_id: string;
  report_type: "preliminary" | "final";
  content: Record<string, any>;
  pdf_url: string;
  created_at: string;
}

export interface Decree {
  id: string;
  plan_id: string;
  decree_type: "preliminary" | "final";
  legal_references: string[];
  content: Record<string, any>;
  pdf_url: string;
  status: string;
  created_at: string;
}

export interface ComplianceReport {
  rule: string;
  description: string;
  status: "compliant" | "partial" | "violated";
  details: string;
  suggestions: string[];
}

export interface AIRecommendation {
  rank: number;
  plan_id: string;
  plan_type: PlanType;
  overall_score: number;
  explanation: string;
  strengths: string[];
  weaknesses: string[];
  compliance_status: ComplianceReport[];
}

export interface MapLayer {
  id: string;
  name: string;
  type: "base" | "overlay";
  visible: boolean;
  url?: string;
  data?: GeoJSON.FeatureCollection;
  style?: Record<string, any>;
}

export interface MapViewport {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
}
