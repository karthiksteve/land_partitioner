"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreGauge } from "./ScoreGauge";
import { Badge } from "@/components/ui/badge";
import { ScoreMetric } from "@/types";
import { cn } from "@/lib/utils";

interface ScoreCardProps {
  overall: number;
  metrics: ScoreMetric[];
  title?: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-red-500";
}

function getScoreBadge(score: number): "success" | "warning" | "destructive" {
  if (score >= 80) return "success";
  if (score >= 60) return "warning";
  return "destructive";
}

export function ScoreCard({ overall, metrics, title = "Score Overview" }: ScoreCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center">
          <ScoreGauge score={overall} />
        </div>

        <div className="space-y-3">
          {metrics.map((metric) => (
            <div key={metric.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{metric.name}</span>
                  <span className="text-xs text-muted-foreground">(w:{metric.weight})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-bold", getScoreColor(metric.score))}>
                    {metric.score}
                  </span>
                  <Badge variant={getScoreBadge(metric.score)}>{metric.score >= 80 ? "Good" : metric.score >= 60 ? "Avg" : "Poor"}</Badge>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", getScoreBg(metric.score))}
                  style={{ width: `${metric.score}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{metric.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
