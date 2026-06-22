"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ScoreMetric, PlanType } from "@/types";
import { PLAN_COLORS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ComparisonChartProps {
  plans: Array<{
    planType: PlanType;
    metrics: ScoreMetric[];
  }>;
  title?: string;
}

export function ComparisonChart({ plans, title = "Metric Comparison" }: ComparisonChartProps) {
  if (plans.length === 0) return null;

  const metricNames = plans[0].metrics.map((m) => m.name);
  const chartData = metricNames.map((name) => {
    const dataPoint: Record<string, any> = { metric: name };
    plans.forEach((plan) => {
      const metric = plan.metrics.find((m) => m.name === name);
      dataPoint[plan.planType] = metric?.score || 0;
    });
    return dataPoint;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              {plans.map((plan) => (
                <Bar
                  key={plan.planType}
                  dataKey={plan.planType}
                  name={`Plan ${plan.planType}`}
                  fill={PLAN_COLORS[plan.planType]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
