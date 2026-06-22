"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { PageLoading, Loading } from "@/components/ui/loading";
import { useToast } from "@/components/ui/toast";
import { usePlans, usePlan } from "@/hooks/usePartition";
import { useGenerateKurra, useReports } from "@/hooks/useReports";
import { formatDate } from "@/lib/utils";
import { FileText, Download, ScrollText, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function KurraPage() {
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const { data: plans } = usePlans();
  const { data: reports, isLoading: reportsLoading } = useReports();
  const generateKurra = useGenerateKurra();
  const { addToast } = useToast();

  const handleGenerate = async () => {
    if (!selectedPlanId) return;
    try {
      const report = await generateKurra.mutateAsync(selectedPlanId);
      setGeneratedReport(report);
      addToast("Kurra report generated successfully", "success");
    } catch {
      addToast("Failed to generate Kurra report", "error");
    }
  };

  const handleDownload = async (report: any) => {
    try {
      const { reportsApi } = await import("@/lib/api");
      const blob = await reportsApi.downloadReport(report.id, "pdf");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kurra_${report.id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      addToast("Download failed", "error");
    }
  };

  const approvedPlans = plans?.filter((p) => p.status === "approved") || [];
  const generatedPlans = plans?.filter((p) => p.status === "generated") || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Kurra Reports</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ScrollText className="h-5 w-5 text-primary" />
                Generate Kurra Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Select Plan"
                placeholder="Choose a plan..."
                options={[...approvedPlans, ...generatedPlans].map((p) => ({
                  value: p.id,
                  label: `Plan ${p.plan_type} - ${p.overall_score.toFixed(0)}%${p.status === "approved" ? " (Approved)" : ""}`,
                }))}
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
              />

              <Button
                className="w-full gap-2"
                onClick={handleGenerate}
                disabled={!selectedPlanId || generateKurra.isPending}
              >
                {generateKurra.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><FileText className="h-4 w-4" /> Generate Kurra Report</>
                )}
              </Button>

              {generatedReport && (
                <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950 p-4">
                  <p className="text-sm font-medium text-green-800 dark:text-green-100">
                    Report generated successfully!
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 gap-2"
                    onClick={() => handleDownload(generatedReport)}
                  >
                    <Download className="h-4 w-4" /> Download PDF
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Previous Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {reportsLoading ? (
                <Loading />
              ) : reports && reports.length > 0 ? (
                <div className="space-y-3">
                  {reports.slice().reverse().map((report: any) => (
                    <div key={report.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">{report.report_type} Report</p>
                        <p className="text-xs text-muted-foreground">{formatDate(report.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{report.report_type}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDownload(report)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">No previous reports</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
