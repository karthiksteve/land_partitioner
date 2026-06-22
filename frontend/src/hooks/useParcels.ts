"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { parcelsApi } from "@/lib/api";
import { ParcelCreate, ParcelUpdate } from "@/types";

export function useParcels(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["parcels", params],
    queryFn: () => parcelsApi.getParcels(params),
  });
}

export function useParcel(id: string) {
  return useQuery({
    queryKey: ["parcel", id],
    queryFn: () => parcelsApi.getParcel(id),
    enabled: !!id,
  });
}

export function useCreateParcel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ParcelCreate) => parcelsApi.createParcel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parcels"] });
    },
  });
}

export function useUpdateParcel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ParcelUpdate }) =>
      parcelsApi.updateParcel(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["parcels"] });
      queryClient.invalidateQueries({ queryKey: ["parcel", id] });
    },
  });
}

export function useDeleteParcel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => parcelsApi.deleteParcel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parcels"] });
    },
  });
}

export function useParcelGeometry(id: string) {
  return useQuery({
    queryKey: ["parcelGeometry", id],
    queryFn: () => parcelsApi.getParcelGeometry(id),
    enabled: !!id,
  });
}
