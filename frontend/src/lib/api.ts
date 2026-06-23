import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "./constants";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

export const authApi = {
  login: async (data: { username: string; password: string }) => {
    const formData = new URLSearchParams();
    formData.append("username", data.username);
    formData.append("password", data.password);
    const response = await apiClient.post("/auth/login", formData.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data;
  },
  register: async (data: {
    full_name: string;
    email: string;
    username: string;
    password: string;
    role: string;
  }) => {
    const response = await apiClient.post("/auth/register", data);
    return response.data;
  },
  getMe: async () => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },
};

export const parcelsApi = {
  searchParcel: async (params: {
    district: string;
    circle?: string;
    mouza?: string;
    plot_number?: string;
  }) => {
    const response = await apiClient.get("/parcels/search", { params });
    return response.data;
  },
  getParcel: async (id: string) => {
    const response = await apiClient.get(`/parcels/${id}`);
    return response.data;
  },
  getParcelGeometry: async (id: string) => {
    const response = await apiClient.get(`/parcels/${id}/geometry`);
    return response.data;
  },
  getParcelMap: async (id: string) => {
    const response = await apiClient.get(`/parcels/${id}/map`, {
      responseType: "blob",
    });
    return response.data;
  },
  listParcels: async (params?: {
    page?: number;
    page_size?: number;
    district?: string;
  }) => {
    const response = await apiClient.get("/parcels", { params });
    return response.data;
  },
  deleteParcel: async (id: string) => {
    const response = await apiClient.delete(`/parcels/${id}`);
    return response.data;
  },
};

export const documentsApi = {
  listDocuments: async (params?: { parcel_id?: string; page?: number; page_size?: number }) => {
    const response = await apiClient.get("/documents", { params });
    return response.data;
  },
  downloadDocument: async (id: string) => {
    const response = await apiClient.get(`/documents/${id}/download`, {
      responseType: "blob",
    });
    return response.data;
  },
  fetchDocuments: async (parcelId: string) => {
    const response = await apiClient.get(`/parcels/${parcelId}/documents`);
    return response.data;
  },
};
