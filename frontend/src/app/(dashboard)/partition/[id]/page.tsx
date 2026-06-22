"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePlan, useApprovePlan, useRejectPlan, useExplanation } from "@/hooks/usePartition";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageLoading } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScoreCard } from "@/components/scoring/ScoreCard";
import { PlanComparisonMap } from "@/components/map/PlanComparisonMap";
import { ExplanationPanel } from "@/components/ai/ExplanationPanel";
import { ComparisonTable } from "@/components/plans/ComparisonTable";
import { useToast } from "@/components/ui/toast";
import { formatArea } from "@/lib/utils";
import { ArrowLeft, CheckCircle, XCircle, Download, FileText, Gavel } from "lucide-react";
import Link from "next/link";

export default function PartitionPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: plan, isLoading } = usePlan(id);
  const approvePlan = useApprovePlan();
  const rejectPlan = useRejectPlan();
  const { addToast } = useToast();
  const [selectedAllotmentId, setSelectedAllotmentId] = useState<string | null>(null);

  const { data: explanation } = useExplanation(id, selectedAllotmentId || "");

  const handleApprove = async () => {
    try {
      await approvePlan.mutateAsync(id);
      addToast("Plan approved successfully", "success");
    } catch {
      addToast("Failed to approve plan", "error");
    }
  };

  const handleReject = async () => {
    const reason = prompt("Enter rejection reason (optional):");
    try {
      await rejectPlan.mutateAsync({ id, reason: reason || undefined });
      addToast("Plan rejected", "warning");
    } catch {
      addToast("Failed to reject plan", "error");
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
              <Badge
                variant={
                  plan.status === "approved" ? "success" : plan.status === "rejected" ? "destructive" : "default"
                }
              >
                {plan.status}
              </Badge>
              {plan.is_recommended && <Badge variant="success">Recommended</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{plan.description}</p>
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
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PlanComparisonMap
              plans={[plan]}
              planGeometries={{ A: { type: "FeatureCollection", features: [] }, B: { type: "FeatureCollection", features: [] }, C: { type: "FeatureCollection", features: [] } }}
              className="h-[400px]"
            />
          </div>
          <ScoreCard overall={plan.overall_score} metrics={scoreMetrics} />
        </div>

        <Tabs defaultValue="allotments">
          <TabsList>
            <TabsTrigger value="allotments">Allotments</TabsTrigger>
            <TabsTrigger value="explanation">AI Explanation</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="allotments">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Allotment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {plan.allotments?.map((allotment) => (
                    <button
                      key={allotment.id}
                      onClick={() => setSelectedAllotmentId(allotment.id)}
                      className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 ${
                        selectedAllotmentId === allotment.id ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{allotment.owner_name}</p>
                        <Badge variant={allotment.has_possession ? "success" : "secondary"}>
                          {allotment.has_possession ? "Has Possession" : "No Possession"}
                        </Badge>
                      </div>
                      <div className="mt-1 flex gap-4 text-sm text-muted-foreground">
                        <span>Share: {allotment.share_percentage}%</span>
                        <span>Area: {formatArea(allotment.area_allocated)}</span>
                      </div>
                      <div className="mt-1 flex gap-2 text-xs">
                        {allotment.is_commercial_allocation && <Badge variant="warning">Commercial</Badge>}
                        {allotment.has_road_frontage && <Badge variant="info">Road Frontage</Badge>}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="explanation">
            {selectedAllotmentId && explanation ? (
              <ExplanationPanel
                explanation={explanation.explanation}
                allotmentDetails={
                  plan.allotments?.find((a) => a.id === selectedAllotmentId)
                    ? {
                        owner_name: plan.allotments.find((a) => a.id === selectedAllotmentId)!.owner_name,
                        share_percentage: plan.allotments.find((a) => a.id === selectedAllotmentId)!.share_percentage,
                        area_allocated: plan.allotments.find((a) => a.id === selectedAllotmentId)!.area_allocated,
                        has_possession: plan.allotments.find((a) => a.id === selectedAllotmentId)!.has_possession,
                        is_commercial_allocation: plan.allotments.find((a) => a.id === selectedAllotmentId)!.is_commercial_allocation,
                        has_road_frontage: plan.allotments.find((a) => a.id === selectedAllotmentId)!.has_road_frontage,
                      }
                    : undefined
                }
              />
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Click on an allotment above to see the AI explanation for this plan.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reports">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="flex flex-col items-center gap-3 p-6">
                  <FileText className="h-8 w-8 text-primary" />
                  <p className="font-medium">Generate Kurra</p>
                  <Link href={`/kurra?planId=${plan.id}`}>
                    <Button variant="outline" size="sm" className="w-full">Generate</Button>
                  </Link>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center gap-3 p-6">
                  <Gavel className="h-8 w-8 text-primary" />
                  <p className="font-medium">Preliminary Decree</p>
                  <Link href={`/decree?planId=${plan.id}`}>
                    <Button variant="outline" size="sm" className="w-full">Generate</Button>
                  </Link>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center gap-3 p-6">
                  <Download className="h-8 w-8 text-primary" />
                  <p className="font-medium">Export Plan</p>
                  <Button variant="outline" size="sm" className="w-full">Download</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
