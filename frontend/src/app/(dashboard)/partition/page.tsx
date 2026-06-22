"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGeneratePlans } from "@/hooks/usePartition";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PartitionForm } from "@/components/forms/PartitionForm";
import { PartitionPlan, OwnerCreate } from "@/types";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanCard } from "@/components/plans/PlanCard";
import { ComparisonTable } from "@/components/plans/ComparisonTable";
import { ScoreChart } from "@/components/charts/ScoreChart";
import { Loading } from "@/components/ui/loading";
import { Sparkles, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function PartitionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parcelIdParam = searchParams.get("parcelId");
  const generatePlans = useGeneratePlans();
  const { addToast } = useToast();

  const [generatedPlans, setGeneratedPlans] = useState<PartitionPlan[] | null>(null);

  const handleGenerate = async (data: { parcelId: string; owners: OwnerCreate[] }) => {
    try {
      const plans = await generatePlans.mutateAsync({
        parcel_id: data.parcelId,
        plan_type: "A",
      });
      setGeneratedPlans(plans);
      addToast("3 partition plans generated successfully!", "success");
    } catch {
      addToast("Failed to generate plans", "error");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Partition Generator</h1>
        </div>

        {!generatedPlans ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <PartitionForm onGenerate={handleGenerate} isLoading={generatePlans.isPending} />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI-Powered Generation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                  GeoKurra uses advanced AI algorithms to generate three distinct partition plans,
                  each optimized for different aspects of Rule 109 compliance.
                </p>
                <div className="space-y-2">
                  <p className="font-medium text-foreground">Plan Types:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Plan A:</strong> Optimized for compactness and road frontage</li>
                    <li><strong>Plan B:</strong> Optimized for possession fairness</li>
                    <li><strong>Plan C:</strong> Balanced approach across all metrics</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-foreground">Evaluation Metrics:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Compactness (20%)</li>
                    <li>Road Frontage (15%)</li>
                    <li>Commercial Fairness (15%)</li>
                    <li>Existing Possession (15%)</li>
                    <li>Accessibility (15%)</li>
                    <li>Equity (10%)</li>
                    <li>Legal Compliance (10%)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950 p-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-100">
                  3 Plans Generated Successfully
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Review and compare the plans below. Click on any plan for detailed scoring.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {generatedPlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>

            <ComparisonTable plans={generatedPlans} />

            <ScoreChart
              plans={generatedPlans.map((p) => ({
                planType: p.plan_type,
                metrics: [
                  { name: "Compactness", score: p.compactness_score, weight: 20, description: "" },
                  { name: "Road Frontage", score: p.road_frontage_score, weight: 15, description: "" },
                  { name: "Commercial", score: p.commercial_fairness_score, weight: 15, description: "" },
                  { name: "Possession", score: p.possession_score, weight: 15, description: "" },
                  { name: "Accessibility", score: p.accessibility_score, weight: 15, description: "" },
                  { name: "Equity", score: p.equity_score, weight: 10, description: "" },
                  { name: "Legal", score: p.legal_compliance_score, weight: 10, description: "" },
                ],
              }))}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
