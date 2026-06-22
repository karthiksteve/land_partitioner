"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { usePlans } from "@/hooks/usePartition";
import { useGeneratePreliminaryDecree, useGenerateFinalDecree } from "@/hooks/useReports";
import { formatDate } from "@/lib/utils";
import { Gavel, Download, FileText, Loader2, Scale, BookOpen } from "lucide-react";

const legalReferences = [
  "U.P. Z.A. & L.R. Act, 1950 - Section 176",
  "U.P. Z.A. & L.R. Act, 1950 - Section 178",
  "U.P. Z.A. & L.R. Rules, 1952 - Rule 109",
  "U.P. Z.A. & L.R. Rules, 1952 - Rule 109A",
  "Code of Civil Procedure, 1908 - Order XX Rule 18",
];

export default function DecreePage() {
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [generatedPreliminary, setGeneratedPreliminary] = useState<any>(null);
  const [generatedFinal, setGeneratedFinal] = useState<any>(null);
  const { data: plans } = usePlans();
  const generatePreliminary = useGeneratePreliminaryDecree();
  const generateFinal = useGenerateFinalDecree();
  const { addToast } = useToast();

  const approvedPlans = plans?.filter((p) => p.status === "approved") || [];

  const handleGeneratePreliminary = async () => {
    if (!selectedPlanId) return;
    try {
      const decree = await generatePreliminary.mutateAsync(selectedPlanId);
      setGeneratedPreliminary(decree);
      addToast("Preliminary decree generated", "success");
    } catch {
      addToast("Failed to generate preliminary decree", "error");
    }
  };

  const handleGenerateFinal = async () => {
    if (!selectedPlanId) return;
    try {
      const decree = await generateFinal.mutateAsync(selectedPlanId);
      setGeneratedFinal(decree);
      addToast("Final decree generated", "success");
    } catch {
      addToast("Failed to generate final decree", "error");
    }
  };

  const handleDownload = async (decree: any) => {
    try {
      const { reportsApi } = await import("@/lib/api");
      const blob = await reportsApi.downloadReport(decree.id, "pdf");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `decree_${decree.decree_type}_${decree.id}.pdf`;
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
          <h1 className="text-2xl font-bold">Decree Management</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gavel className="h-5 w-5 text-primary" />
              Select Plan for Decree
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              placeholder="Choose an approved plan..."
              options={approvedPlans.map((p) => ({
                value: p.id,
                label: `Plan ${p.plan_type} - Score: ${p.overall_score.toFixed(0)}%`,
              }))}
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
            />
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5 text-blue-500" />
                Preliminary Decree
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                A preliminary decree sets out the rights of each party and directs a partition
                by metes and bounds as per Rule 109.
              </p>
              <Button
                className="w-full gap-2"
                onClick={handleGeneratePreliminary}
                disabled={!selectedPlanId || generatePreliminary.isPending}
              >
                {generatePreliminary.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><FileText className="h-4 w-4" /> Generate Preliminary Decree</>
                )}
              </Button>
              {generatedPreliminary && (
                <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950 p-4">
                  <p className="text-sm font-medium text-green-800 dark:text-green-100">
                    Preliminary decree generated
                  </p>
                  <Button variant="outline" size="sm" className="mt-2 gap-2" onClick={() => handleDownload(generatedPreliminary)}>
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Scale className="h-5 w-5 text-purple-500" />
                Final Decree
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                A final decree confirms the partition after objections are heard, making the
                division final and executable.
              </p>
              <Button
                className="w-full gap-2"
                onClick={handleGenerateFinal}
                disabled={!selectedPlanId || generateFinal.isPending}
              >
                {generateFinal.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><Scale className="h-4 w-4" /> Generate Final Decree</>
                )}
              </Button>
              {generatedFinal && (
                <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950 p-4">
                  <p className="text-sm font-medium text-green-800 dark:text-green-100">
                    Final decree generated
                  </p>
                  <Button variant="outline" size="sm" className="mt-2 gap-2" onClick={() => handleDownload(generatedFinal)}>
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-5 w-5 text-primary" />
              Legal References
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {legalReferences.map((ref, i) => (
                <li key={i} className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                  <Gavel className="h-4 w-4 text-muted-foreground" />
                  {ref}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
