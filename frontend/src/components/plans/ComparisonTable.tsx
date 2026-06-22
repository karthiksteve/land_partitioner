"use client";

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PartitionPlan, PlanType } from "@/types";
import { PLAN_COLORS } from "@/lib/constants";
import { CheckCircle, XCircle, Minus } from "lucide-react";

interface ComparisonTableProps {
  plans: PartitionPlan[];
}

const metrics = [
  { key: "compactness_score", label: "Compactness" },
  { key: "road_frontage_score", label: "Road Frontage" },
  { key: "commercial_fairness_score", label: "Commercial Fairness" },
  { key: "possession_score", label: "Existing Possession" },
  { key: "accessibility_score", label: "Accessibility" },
  { key: "equity_score", label: "Equity" },
  { key: "legal_compliance_score", label: "Legal Compliance" },
];

function getBestPlan(plans: PartitionPlan[], metric: string): PlanType | null {
  let best = -1;
  let bestType: PlanType | null = null;
  plans.forEach((p) => {
    const val = (p as any)[metric] || 0;
    if (val > best) {
      best = val;
      bestType = p.plan_type;
    }
  });
  return bestType;
}

export function ComparisonTable({ plans }: ComparisonTableProps) {
  if (plans.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Plan Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-48">Metric</TableHead>
              {plans.map((p) => (
                <TableHead key={p.plan_type} className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PLAN_COLORS[p.plan_type] }} />
                    Plan {p.plan_type}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.map((metric) => {
              const bestPlan = getBestPlan(plans, metric.key);
              return (
                <TableRow key={metric.key}>
                  <TableCell className="font-medium">{metric.label}</TableCell>
                  {plans.map((p) => {
                    const val = (p as any)[metric.key] || 0;
                    const isBest = p.plan_type === bestPlan;
                    return (
                      <TableCell key={p.plan_type} className="text-center">
                        <span
                          className={`inline-flex items-center gap-1 ${
                            isBest ? "text-green-600 font-bold" : "text-muted-foreground"
                          }`}
                        >
                          {val}
                          {isBest && <CheckCircle className="h-3.5 w-3.5 text-green-600" />}
                        </span>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
            <TableRow className="font-bold">
              <TableCell>Overall Score</TableCell>
              {plans.map((p) => {
                const bestOverall = Math.max(...plans.map((x) => x.overall_score));
                const isBest = p.overall_score === bestOverall;
                return (
                  <TableCell key={p.plan_type} className="text-center">
                    <span className={isBest ? "text-green-600" : "text-muted-foreground"}>
                      {p.overall_score.toFixed(0)}%
                    </span>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
