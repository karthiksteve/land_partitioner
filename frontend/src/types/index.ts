export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: "citizen" | "officer";
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  username: string;
  password: string;
  role: "citizen" | "officer";
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ParcelSearchRequest {
  district: string;
  circle?: string;
  mouza?: string;
  plot_number?: string;
}

export interface Parcel {
  id: string;
  pniu: string;
  plot_number: string;
  khata_number: string;
  area_acres: number;
  area_hectares: number;
  village: string;
  mouza: string;
  circle: string;
  district: string;
  land_type: string;
  owner_name?: string;
  father_name?: string;
  boundary: GeoJSONGeometry;
  bhunaksha_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  parcel_id: string;
  document_type: DocumentType;
  title: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export type DocumentType =
  | "parcel_pdf"
  | "land_record"
  | "geojson"
  | "map_image"
  | "khasra"
  | "khatauni";

export interface GeoJSONGeometry {
  type: string;
  coordinates: number[][][] | number[][][][];
}

export interface ParcelSearchResult {
  parcels: Parcel[];
  total: number;
  page: number;
  page_size: number;
}

export interface ApiError {
  detail: string;
  status_code: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface DocumentDownloadResponse {
  file_url: string;
  filename: string;
  mime_type: string;
}

export interface BhuNakshaParcel {
  pniu: string;
  plotNumber: string;
  khataNumber: string;
  area: number;
  areaUnit: string;
  villageName: string;
  circleName: string;
  districtName: string;
  landType: string;
  ownerName: string;
  fatherName: string;
  boundary: string;
}

export interface BhuNakshaSearchResponse {
  status: string;
  message: string;
  data: BhuNakshaParcel[];
  total: number;
}

export interface BhuNakshaDetailResponse {
  status: string;
  message: string;
  data: BhuNakshaParcel;
}
