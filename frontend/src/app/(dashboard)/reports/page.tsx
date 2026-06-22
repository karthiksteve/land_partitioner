"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { usePlans } from "@/hooks/usePartition";
import { useReports, useExportPlan } from "@/hooks/useReports";
import { formatDate } from "@/lib/utils";
import { Download, FileText, BarChart3, Loader2, Map as MapIcon, Table, FileJson } from "lucide-react";

const exportFormats = [
  { value: "geojson", label: "GeoJSON", icon: MapIcon },
  { value: "kml", label: "KML", icon: MapIcon },
  { value: "shapefile", label: "Shapefile", icon: Table },
  { value: "csv", label: "CSV", icon: Table },
  { value: "json", label: "JSON", icon: FileJson },
  { value: "pdf", label: "PDF", icon: FileText },
];

export default function ReportsPage() {
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("geojson");
  const { data: plans } = usePlans();
  const { data: reports, isLoading: reportsLoading } = useReports();
  const exportPlan = useExportPlan();
  const { addToast } = useToast();

  const handleExport = async () => {
    if (!selectedPlanId) return;
    try {
      const blob = await exportPlan.mutateAsync({ planId: selectedPlanId, format: selectedFormat });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `plan_export.${selectedFormat}`;
      a.click();
      window.URL.revokeObjectURL(url);
      addToast(`Plan exported as ${selectedFormat.toUpperCase()}`, "success");
    } catch {
      addToast("Export failed", "error");
    }
  };

  const handleDownloadReport = async (reportId: string) => {
    try {
      const { reportsApi } = await import("@/lib/api");
      const blob = await reportsApi.downloadReport(reportId, "pdf");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${reportId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      addToast("Download failed", "error");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Reports &amp; Export</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Download className="h-5 w-5 text-primary" />
                Export Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Select Plan"
                placeholder="Choose a plan..."
                options={(plans || []).map((p) => ({
                  value: p.id,
                  label: `Plan ${p.plan_type} - Score: ${p.overall_score.toFixed(0)}%`,
                }))}
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
              />

              <div>
                <label className="text-sm font-medium mb-2 block">Export Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {exportFormats.map((fmt) => (
                    <button
                      key={fmt.value}
                      onClick={() => setSelectedFormat(fmt.value)}
                      className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-xs transition-colors ${
                        selectedFormat === fmt.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "hover:border-primary/50 text-muted-foreground"
                      }`}
                    >
                      <fmt.icon className="h-5 w-5" />
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full gap-2"
                onClick={handleExport}
                disabled={!selectedPlanId || exportPlan.isPending}
              >
                {exportPlan.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Exporting...</>
                ) : (
                  <><Download className="h-4 w-4" /> Export Plan</>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-5 w-5 text-primary" />
                Comparison Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Generate a comprehensive comparison report showing all plans side by side
                with scores, compliance status, and AI recommendations.
              </p>
              <Button className="w-full gap-2" variant="outline">
                <FileText className="h-4 w-4" /> Generate Comparison Report
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Report History</CardTitle>
          </CardHeader>
          <CardContent>
            {reportsLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : reports && reports.length > 0 ? (
              <div className="space-y-3">
                {reports.slice().reverse().map((report: any) => (
                  <div key={report.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{report.report_type} Report</p>
                        <Badge variant="secondary">{report.report_type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{formatDate(report.created_at)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleDownloadReport(report.id)}
                    >
                      <Download className="h-4 w-4" /> Download
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">No report history</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
