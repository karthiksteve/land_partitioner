"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { ScoreMetric, PlanType } from "@/types";
import { PLAN_COLORS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ScoreChartProps {
  plans: Array<{
    planType: PlanType;
    metrics: ScoreMetric[];
  }>;
  title?: string;
}

export function ScoreChart({ plans, title = "Plan Scores Comparison" }: ScoreChartProps) {
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
            <RadarChart data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              {plans.map((plan) => (
                <Radar
                  key={plan.planType}
                  name={`Plan ${plan.planType}`}
                  dataKey={plan.planType}
                  stroke={PLAN_COLORS[plan.planType]}
                  fill={PLAN_COLORS[plan.planType]}
                  fillOpacity={0.15}
                />
              ))}
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
