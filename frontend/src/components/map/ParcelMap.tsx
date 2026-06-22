"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { MapContainer } from "./MapContainer";
import { MapLegend } from "./MapLegend";
import { useParcelGeometry } from "@/hooks/useParcels";
import { LAYER_STYLES } from "@/lib/constants";
import { PlanType } from "@/types";

interface ParcelMapProps {
  parcelId: string;
  showOwnership?: boolean;
  showPossession?: boolean;
  showPlans?: boolean;
  planGeometries?: Array<{
    planType: PlanType;
    data: GeoJSON.FeatureCollection;
  }>;
  className?: string;
}

export function ParcelMap({
  parcelId,
  showPlans = false,
  planGeometries = [],
  className,
}: ParcelMapProps) {
  const { data: geometry } = useParcelGeometry(parcelId);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);

  const geoJsonLayers = useMemo(() => {
    const layers: Array<{
      id: string;
      data: GeoJSON.FeatureCollection;
      style?: L.PathOptions;
      onClick?: (feature: any) => void;
    }> = [];

    if (geometry) {
      layers.push({
        id: "parcel",
        data: geometry,
        style: LAYER_STYLES.parcel as L.PathOptions,
        onClick: (feature) => setSelectedFeature(feature),
      });
    }

    if (showPlans) {
      planGeometries.forEach((pg) => {
        layers.push({
          id: `plan_${pg.planType.toLowerCase()}`,
          data: pg.data,
          style: {
            ...(LAYER_STYLES[`plan_${pg.planType.toLowerCase()}` as keyof typeof LAYER_STYLES] || {}),
            fillOpacity: 0.2,
          } as L.PathOptions,
          onClick: (feature) => setSelectedFeature(feature),
        });
      });
    }

    return layers;
  }, [geometry, showPlans, planGeometries]);

  return (
    <div className={cn("relative", className)}>
      <MapContainer
        geoJsonLayers={geoJsonLayers}
        onMapClick={() => setSelectedFeature(null)}
      >
        <MapLegend />
      </MapContainer>
      {selectedFeature && (
        <div className="absolute bottom-4 left-4 z-[1000] rounded-lg border bg-card p-3 shadow-lg">
          <p className="text-sm font-medium">
            {selectedFeature.properties?.name || selectedFeature.properties?.parcel_id || "Selected Feature"}
          </p>
          <p className="text-xs text-muted-foreground">
            Area: {selectedFeature.properties?.area || "N/A"} sq.m
          </p>
        </div>
      )}
    </div>
  );
}
