"use client";

import dynamic from "next/dynamic";
import { Loading } from "@/components/ui/loading";

const MapContainer = dynamic(
  () => import("@/components/map/MapContainer"),
  {
    ssr: false,
    loading: () => <Loading message="Loading map..." />,
  }
);

interface ParcelMapProps {
  boundary?: number[][][];
  center?: [number, number];
  zoom?: number;
  className?: string;
}

export default function ParcelMap({
  boundary,
  center = [25.6, 85.1],
  zoom = 15,
  className,
}: ParcelMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      polygons={boundary ? [boundary] : undefined}
      polygonColor="#ff4444"
      polygonFillColor="rgba(255, 68, 68, 0.2)"
      className={className || "w-full h-full min-h-[500px]"}
      showControls={true}
    />
  );
}
