"use client";

import { PartitionPlan, PlanType } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLAN_COLORS } from "@/lib/constants";
import { Eye, CheckCircle, XCircle, Award } from "lucide-react";
import Link from "next/link";

interface PlanCardProps {
  plan: PartitionPlan;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  showActions?: boolean;
}

const statusBadge: Record<string, "default" | "success" | "secondary" | "destructive"> = {
  draft: "secondary",
  generated: "default",
  approved: "success",
  rejected: "destructive",
};

export function PlanCard({ plan, onApprove, onReject, showActions = true }: PlanCardProps) {
  const scoreColor =
    plan.overall_score >= 80
      ? "text-green-600"
      : plan.overall_score >= 60
      ? "text-yellow-600"
      : "text-red-600";

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="h-2" style={{ backgroundColor: PLAN_COLORS[plan.plan_type] }} />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Plan {plan.plan_type}</h3>
              {plan.is_recommended && (
                <Badge variant="success" className="flex items-center gap-1">
                  <Award className="h-3 w-3" /> Recommended
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
          </div>
          <Badge variant={statusBadge[plan.status] || "secondary"}>
            {plan.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Overall Score</span>
          <span className={`text-2xl font-bold ${scoreColor}`}>
            {plan.overall_score.toFixed(0)}%
          </span>
        </div>
        <div className="mt-3 space-y-1.5">
          {[
            { label: "Compactness", value: plan.compactness_score },
            { label: "Road Frontage", value: plan.road_frontage_score },
            { label: "Commercial Fairness", value: plan.commercial_fairness_score },
            { label: "Possession", value: plan.possession_score },
          ].map((metric) => (
            <div key={metric.label} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-28">{metric.label}</span>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${metric.value}%`,
                    backgroundColor:
                      metric.value >= 80 ? "#16a34a" : metric.value >= 60 ? "#f59e0b" : "#ef4444",
                  }}
                />
              </div>
              <span className="text-xs font-medium w-8 text-right">{metric.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="gap-2 pt-0">
        <Link href={`/partition/${plan.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            <Eye className="h-4 w-4 mr-1" /> View
          </Button>
        </Link>
        {showActions && plan.status === "generated" && (
          <>
            {onApprove && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onApprove(plan.id)}
              >
                <CheckCircle className="h-4 w-4 mr-1" /> Approve
              </Button>
            )}
            {onReject && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onReject(plan.id)}
              >
                <XCircle className="h-4 w-4 mr-1" /> Reject
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}
