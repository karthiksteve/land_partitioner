"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { MapContainer } from "./MapContainer";
import { MapLegend } from "./MapLegend";
import { PLAN_COLORS } from "@/lib/constants";
import { PlanType, PartitionPlan } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface PlanComparisonMapProps {
  plans: PartitionPlan[];
  planGeometries: Record<PlanType, GeoJSON.FeatureCollection>;
  parcelGeometry?: GeoJSON.FeatureCollection;
  className?: string;
}

export function PlanComparisonMap({
  plans,
  planGeometries,
  parcelGeometry,
  className,
}: PlanComparisonMapProps) {
  const [activeTab, setActiveTab] = useState<string>("all");

  const geoJsonLayers = useMemo(() => {
    const layers: Array<{
      id: string;
      data: GeoJSON.FeatureCollection;
      style?: L.PathOptions;
      onClick?: (feature: any) => void;
    }> = [];

    if (parcelGeometry) {
      layers.push({
        id: "parcel",
        data: parcelGeometry,
        style: { color: "#9ca3af", weight: 2, fillOpacity: 0 } as L.PathOptions,
      });
    }

    if (activeTab === "all") {
      (["A", "B", "C"] as PlanType[]).forEach((type) => {
        if (planGeometries[type]) {
          layers.push({
            id: `plan_${type}`,
            data: planGeometries[type],
            style: {
              color: PLAN_COLORS[type],
              weight: 2,
              fillColor: PLAN_COLORS[type],
              fillOpacity: 0.1,
            } as L.PathOptions,
          });
        }
      });
    } else {
      const type = activeTab as PlanType;
      if (planGeometries[type]) {
        layers.push({
          id: `plan_${type}`,
          data: planGeometries[type],
          style: {
            color: PLAN_COLORS[type],
            weight: 3,
            fillColor: PLAN_COLORS[type],
            fillOpacity: 0.15,
          } as L.PathOptions,
        });
      }
    }

    return layers;
  }, [activeTab, planGeometries, parcelGeometry]);

  return (
    <div className={cn("space-y-4", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Plans</TabsTrigger>
          {(["A", "B", "C"] as PlanType[]).map((type) => {
            const plan = plans.find((p) => p.plan_type === type);
            return (
              <TabsTrigger key={type} value={type} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PLAN_COLORS[type] }} />
                Plan {type}
                {plan && (
                  <Badge variant={plan.overall_score >= 70 ? "success" : "warning"}>
                    {plan.overall_score}%
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <div className="relative">
        <MapContainer geoJsonLayers={geoJsonLayers}>
          <MapLegend />
        </MapContainer>
      </div>
    </div>
  );
}
