"use client";

import { useParams, useRouter } from "next/navigation";
import { usePlan, useApprovePlan, useRejectPlan, useRecommendations } from "@/hooks/usePartition";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageLoading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreCard } from "@/components/scoring/ScoreCard";
import { ComparisonTable } from "@/components/plans/ComparisonTable";
import { ComparisonChart } from "@/components/charts/ComparisonChart";
import { RecommendationCard } from "@/components/ai/RecommendationCard";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft, CheckCircle, XCircle, Download } from "lucide-react";

export default function PlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: plan, isLoading } = usePlan(id);
  const { data: recommendations } = useRecommendations(plan?.parcel_id || "");
  const approvePlan = useApprovePlan();
  const rejectPlan = useRejectPlan();
  const { addToast } = useToast();

  const handleApprove = async () => {
    try {
      await approvePlan.mutateAsync(id);
      addToast("Plan approved", "success");
    } catch {
      addToast("Failed to approve", "error");
    }
  };

  const handleReject = async () => {
    const reason = prompt("Rejection reason:");
    try {
      await rejectPlan.mutateAsync({ id, reason: reason || undefined });
      addToast("Plan rejected", "warning");
    } catch {
      addToast("Failed to reject", "error");
    }
  };

  if (isLoading) return <DashboardLayout><PageLoading /></DashboardLayout>;
  if (!plan) return <DashboardLayout><p>Plan not found</p></DashboardLayout>;

  const scoreMetrics = [
    { name: "Compactness", score: plan.compactness_score, weight: 20, description: "How compact each allotment is" },
    { name: "Road Frontage", score: plan.road_frontage_score, weight: 15, description: "Access to road per allotment" },
    { name: "Commercial Fairness", score: plan.commercial_fairness_score, weight: 15, description: "Fair distribution of commercial land" },
    { name: "Existing Possession", score: plan.possession_score, weight: 15, description: "Respects current possession" },
    { name: "Accessibility", score: plan.accessibility_score, weight: 15, description: "Ease of access to each share" },
    { name: "Equity", score: plan.equity_score, weight: 10, description: "Fairness of share distribution" },
    { name: "Legal Compliance", score: plan.legal_compliance_score, weight: 10, description: "Rule 109 compliance level" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Plan {plan.plan_type}</h1>
              <Badge variant={plan.status === "approved" ? "success" : plan.status === "rejected" ? "destructive" : "default"}>
                {plan.status}
              </Badge>
              {plan.is_recommended && <Badge variant="success">AI Recommended</Badge>}
            </div>
          </div>
          <div className="flex gap-2">
            {plan.status === "generated" && (
              <>
                <Button variant="default" className="gap-2" onClick={handleApprove}>
                  <CheckCircle className="h-4 w-4" /> Approve
                </Button>
                <Button variant="destructive" className="gap-2" onClick={handleReject}>
                  <XCircle className="h-4 w-4" /> Reject
                </Button>
              </>
            )}
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ScoreCard overall={plan.overall_score} metrics={scoreMetrics} />
          <ComparisonChart
            plans={[plan].map((p) => ({
              planType: p.plan_type,
              metrics: scoreMetrics,
            }))}
            title="Score Breakdown"
          />
        </div>

        {recommendations && recommendations.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">AI Recommendations</h2>
            <RecommendationCard recommendations={recommendations} />
          </div>
        )}

        <ComparisonTable plans={[plan]} />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border p-4 text-center">
            <p className="text-sm text-muted-foreground">Compactness</p>
            <p className="text-2xl font-bold">{plan.compactness_score}</p>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <p className="text-sm text-muted-foreground">Road Frontage</p>
            <p className="text-2xl font-bold">{plan.road_frontage_score}</p>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <p className="text-sm text-muted-foreground">Commercial Fairness</p>
            <p className="text-2xl font-bold">{plan.commercial_fairness_score}</p>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <p className="text-sm text-muted-foreground">Possession Score</p>
            <p className="text-2xl font-bold">{plan.possession_score}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
