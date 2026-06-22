"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { Lightbulb, Scale, Map, Building, Gavel } from "lucide-react";
import { RULE_109_DESCRIPTIONS } from "@/lib/constants";

interface ExplanationPanelProps {
  explanation: string;
  isLoading?: boolean;
  allotmentDetails?: {
    owner_name: string;
    share_percentage: number;
    area_allocated: number;
    has_possession: boolean;
    is_commercial_allocation: boolean;
    has_road_frontage: boolean;
  };
}

export function ExplanationPanel({ explanation, isLoading, allotmentDetails }: ExplanationPanelProps) {
  if (isLoading) return <Loading text="Generating AI explanation..." />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          AI Explanation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {allotmentDetails && (
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-4">
            <div>
              <p className="text-xs text-muted-foreground">Owner</p>
              <p className="text-sm font-medium">{allotmentDetails.owner_name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Share</p>
              <p className="text-sm font-medium">{allotmentDetails.share_percentage}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Allocated Area</p>
              <p className="text-sm font-medium">{allotmentDetails.area_allocated.toFixed(2)} sq.m</p>
            </div>
            <div className="flex gap-2">
              {allotmentDetails.has_possession && (
                <Badge variant="success">Has Possession</Badge>
              )}
              {allotmentDetails.is_commercial_allocation && (
                <Badge variant="warning">Commercial</Badge>
              )}
              {allotmentDetails.has_road_frontage && (
                <Badge variant="info">Road Frontage</Badge>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-lg border p-3">
            <Scale className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Rule 109(a) - Share Entitlement</p>
              <p className="text-xs text-muted-foreground mt-1">{RULE_109_DESCRIPTIONS["109(a)"]}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border p-3">
            <Map className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Rule 109(e) - Possession</p>
              <p className="text-xs text-muted-foreground mt-1">{RULE_109_DESCRIPTIONS["109(e)"]}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border p-3">
            <Building className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Rule 109(f) - Commercial Fairness</p>
              <p className="text-xs text-muted-foreground mt-1">{RULE_109_DESCRIPTIONS["109(f)"]}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-muted/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gavel className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium">Detailed Reasoning</p>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {explanation}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
