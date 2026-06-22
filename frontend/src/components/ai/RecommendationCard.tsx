"use client";

import { AIRecommendation } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLAN_COLORS } from "@/lib/constants";
import { Trophy, CheckCircle, AlertTriangle, XCircle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecommendationCardProps {
  recommendations: AIRecommendation[];
}

const rankIcons = [
  <Trophy key="1" className="h-5 w-5 text-yellow-500" />,
  <Trophy key="2" className="h-5 w-5 text-gray-400" />,
  <Trophy key="3" className="h-5 w-5 text-orange-600" />,
];

const rankLabels = ["Best Choice", "Second Best", "Third Best"];

const complianceIcon = {
  compliant: <CheckCircle className="h-4 w-4 text-green-500" />,
  partial: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  violated: <XCircle className="h-4 w-4 text-red-500" />,
};

const complianceColor = {
  compliant: "text-green-600",
  partial: "text-yellow-600",
  violated: "text-red-600",
};

export function RecommendationCard({ recommendations }: RecommendationCardProps) {
  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-4">
      {recommendations.map((rec, index) => (
        <Card
          key={rec.plan_id}
          className={cn(
            "overflow-hidden transition-shadow hover:shadow-md",
            index === 0 && "ring-2 ring-yellow-400"
          )}
        >
          <div className="h-2" style={{ backgroundColor: PLAN_COLORS[rec.plan_type] }} />
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {rankIcons[index]}
                <div>
                  <CardTitle className="text-base">
                    Plan {rec.plan_type} - {rankLabels[index]}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Score: <span className="font-bold">{rec.overall_score.toFixed(0)}%</span>
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <p className="text-sm font-medium">Why this plan?</p>
              </div>
              <p className="text-sm text-muted-foreground">{rec.explanation}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {rec.strengths.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5 text-sm text-green-600">
                  <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {s}
                </div>
              ))}
              {rec.weaknesses.map((w, i) => (
                <div key={i} className="flex items-center gap-1.5 text-sm text-red-600">
                  <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                  {w}
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase">Rule 109 Compliance</p>
              {rec.compliance_status.map((c) => (
                <div key={c.rule} className="flex items-center gap-2 text-sm">
                  {complianceIcon[c.status]}
                  <span className={cn("font-medium", complianceColor[c.status])}>
                    {c.rule}
                  </span>
                  <span className="text-muted-foreground">{c.description}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
