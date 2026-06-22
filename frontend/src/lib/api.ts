import axios, { AxiosInstance, AxiosError } from "axios";
import { API_BASE_URL } from "./constants";
import {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  User,
  Parcel,
  ParcelCreate,
  ParcelUpdate,
  Owner,
  OwnerCreate,
  PartitionPlan,
  PartitionPlanCreate,
  Allotment,
  AIRecommendation,
  KurraReport,
  Decree,
} from "@/types";

let accessToken: string | null = null;

if (typeof window !== "undefined") {
  accessToken = localStorage.getItem("access_token");
}

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const { access_token } = response.data;
          accessToken = access_token;
          localStorage.setItem("access_token", access_token);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export function setTokens(token: string, refresh: string) {
  accessToken = token;
  localStorage.setItem("access_token", token);
  localStorage.setItem("refresh_token", refresh);
}

export function clearTokens() {
  accessToken = null;
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

// Auth API
export const authApi = {
  login: (data: LoginRequest) =>
    api.post<TokenResponse>("/auth/login", data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    api.post<TokenResponse>("/auth/register", data).then((r) => r.data),

  getMe: () =>
    api.get<User>("/auth/me").then((r) => r.data),

  updateProfile: (data: Partial<User>) =>
    api.put<User>("/auth/profile", data).then((r) => r.data),
};

// Parcels API
export const parcelsApi = {
  getParcels: (params?: Record<string, any>) =>
    api.get<Parcel[]>("/parcels", { params }).then((r) => r.data),

  getParcel: (id: string) =>
    api.get<Parcel>(`/parcels/${id}`).then((r) => r.data),

  createParcel: (data: ParcelCreate) =>
    api.post<Parcel>("/parcels", data).then((r) => r.data),

  updateParcel: (id: string, data: ParcelUpdate) =>
    api.put<Parcel>(`/parcels/${id}`, data).then((r) => r.data),

  deleteParcel: (id: string) =>
    api.delete(`/parcels/${id}`).then((r) => r.data),

  getParcelGeometry: (id: string) =>
    api.get<GeoJSON.FeatureCollection>(`/parcels/${id}/geometry`).then((r) => r.data),

  uploadFile: (id: string, file: File, type: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    return api.post<Parcel>(`/parcels/${id}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },

  fetchBhuNaksha: (params: { state: string; district: string; tehsil: string; village: string; khasra: string }) =>
    api.post<Parcel>("/parcels/bhunaksha", params).then((r) => r.data),
};

// Owners API
export const ownersApi = {
  getOwners: (parcelId?: string) =>
    api.get<Owner[]>("/owners", { params: { parcel_id: parcelId } }).then((r) => r.data),

  addOwner: (data: OwnerCreate) =>
    api.post<Owner>("/owners", data).then((r) => r.data),

  bulkCreateOwners: (data: OwnerCreate[]) =>
    api.post<Owner[]>("/owners/bulk", data).then((r) => r.data),

  updateOwner: (id: string, data: Partial<OwnerCreate>) =>
    api.put<Owner>(`/owners/${id}`, data).then((r) => r.data),

  deleteOwner: (id: string) =>
    api.delete(`/owners/${id}`).then((r) => r.data),
};

// Partition API
export const partitionApi = {
  generatePlans: (data: PartitionPlanCreate) =>
    api.post<PartitionPlan[]>("/partition/generate", data).then((r) => r.data),

  getPlans: (parcelId?: string) =>
    api.get<PartitionPlan[]>("/partition/plans", { params: { parcel_id: parcelId } }).then((r) => r.data),

  getPlan: (id: string) =>
    api.get<PartitionPlan>(`/partition/plans/${id}`).then((r) => r.data),

  getComparison: (parcelId: string) =>
    api.get<PartitionPlan[]>(`/partition/compare/${parcelId}`).then((r) => r.data),

  getAllotments: (planId: string) =>
    api.get<Allotment[]>(`/partition/plans/${planId}/allotments`).then((r) => r.data),

  explainAllotment: (planId: string, allotmentId: string) =>
    api.get<{ explanation: string }>(`/partition/plans/${planId}/allotments/${allotmentId}/explain`).then((r) => r.data),

  approvePlan: (id: string) =>
    api.post<PartitionPlan>(`/partition/plans/${id}/approve`).then((r) => r.data),

  rejectPlan: (id: string, reason?: string) =>
    api.post<PartitionPlan>(`/partition/plans/${id}/reject`, { reason }).then((r) => r.data),

  getRecommendations: (parcelId: string) =>
    api.get<AIRecommendation[]>(`/partition/recommendations/${parcelId}`).then((r) => r.data),
};

// Reports API
export const reportsApi = {
  generateKurra: (planId: string) =>
    api.post<KurraReport>("/reports/kurra", { plan_id: planId }).then((r) => r.data),

  generatePreliminaryDecree: (planId: string) =>
    api.post<Decree>("/reports/decree/preliminary", { plan_id: planId }).then((r) => r.data),

  generateFinalDecree: (planId: string) =>
    api.post<Decree>("/reports/decree/final", { plan_id: planId }).then((r) => r.data),

  downloadReport: (reportId: string, format: string = "pdf") =>
    api.get(`/reports/${reportId}/download`, { params: { format }, responseType: "blob" }).then((r) => r.data),

  exportPlan: (planId: string, format: string = "geojson") =>
    api.get(`/reports/export/${planId}`, { params: { format }, responseType: "blob" }).then((r) => r.data),

  getReports: () =>
    api.get<KurraReport[]>("/reports").then((r) => r.data),

  getReport: (id: string) =>
    api.get<KurraReport>(`/reports/${id}`).then((r) => r.data),
};

export default api;
