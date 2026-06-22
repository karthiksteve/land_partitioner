"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { reportsApi } from "@/lib/api";

export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: () => reportsApi.getReports(),
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: ["report", id],
    queryFn: () => reportsApi.getReport(id),
    enabled: !!id,
  });
}

export function useGenerateKurra() {
  return useMutation({
    mutationFn: (planId: string) => reportsApi.generateKurra(planId),
  });
}

export function useGeneratePreliminaryDecree() {
  return useMutation({
    mutationFn: (planId: string) => reportsApi.generatePreliminaryDecree(planId),
  });
}

export function useGenerateFinalDecree() {
  return useMutation({
    mutationFn: (planId: string) => reportsApi.generateFinalDecree(planId),
  });
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: ({ reportId, format }: { reportId: string; format?: string }) =>
      reportsApi.downloadReport(reportId, format),
  });
}

export function useExportPlan() {
  return useMutation({
    mutationFn: ({ planId, format }: { planId: string; format: string }) =>
      reportsApi.exportPlan(planId, format),
  });
}
