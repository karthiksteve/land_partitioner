"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { parcelsApi } from "@/lib/api";
import type { ParcelSearchRequest } from "@/types";

export function useParcelSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: ParcelSearchRequest) => parcelsApi.searchParcel(params),
    onSuccess: (data) => {
      if (data?.parcels) {
        data.parcels.forEach((parcel: { id: string }) => {
          queryClient.setQueryData(["parcel", parcel.id], parcel);
        });
      }
    },
  });
}

export function useParcel(id: string | undefined) {
  return useQuery({
    queryKey: ["parcel", id],
    queryFn: () => parcelsApi.getParcel(id!),
    enabled: !!id,
  });
}

export function useParcelGeometry(id: string | undefined) {
  return useQuery({
    queryKey: ["parcel", id, "geometry"],
    queryFn: () => parcelsApi.getParcelGeometry(id!),
    enabled: !!id,
  });
}

export function useParcelMap(id: string | undefined) {
  return useQuery({
    queryKey: ["parcel", id, "map"],
    queryFn: () => parcelsApi.getParcelMap(id!),
    enabled: !!id,
  });
}

export function useParcels(page = 1, pageSize = 10, district?: string) {
  return useQuery({
    queryKey: ["parcels", page, pageSize, district],
    queryFn: () => parcelsApi.listParcels({ page, page_size: pageSize, district }),
  });
}
