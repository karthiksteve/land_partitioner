"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { partitionApi } from "@/lib/api";
import { PartitionPlanCreate } from "@/types";

export function usePlans(parcelId?: string) {
  return useQuery({
    queryKey: ["plans", parcelId],
    queryFn: () => partitionApi.getPlans(parcelId),
  });
}

export function usePlan(id: string) {
  return useQuery({
    queryKey: ["plan", id],
    queryFn: () => partitionApi.getPlan(id),
    enabled: !!id,
  });
}

export function useGeneratePlans() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PartitionPlanCreate) => partitionApi.generatePlans(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });
}

export function useComparison(parcelId: string) {
  return useQuery({
    queryKey: ["planComparison", parcelId],
    queryFn: () => partitionApi.getComparison(parcelId),
    enabled: !!parcelId,
  });
}

export function useExplanation(planId: string, allotmentId: string) {
  return useQuery({
    queryKey: ["allotmentExplanation", planId, allotmentId],
    queryFn: () => partitionApi.explainAllotment(planId, allotmentId),
    enabled: !!planId && !!allotmentId,
  });
}

export function useRecommendations(parcelId: string) {
  return useQuery({
    queryKey: ["recommendations", parcelId],
    queryFn: () => partitionApi.getRecommendations(parcelId),
    enabled: !!parcelId,
  });
}

export function useApprovePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => partitionApi.approvePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      queryClient.invalidateQueries({ queryKey: ["plan"] });
    },
  });
}

export function useRejectPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      partitionApi.rejectPlan(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      queryClient.invalidateQueries({ queryKey: ["plan"] });
    },
  });
}
