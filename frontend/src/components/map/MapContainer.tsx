"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, INDIA_BOUNDS, LAYER_STYLES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Maximize2, Minimize2, Layers, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MapContainerProps {
  children?: React.ReactNode;
  center?: [number, number];
  zoom?: number;
  className?: string;
  onMapClick?: (latlng: L.LatLng) => void;
  geoJsonLayers?: Array<{
    id: string;
    data: GeoJSON.FeatureCollection;
    style?: L.PathOptions;
    onClick?: (feature: any) => void;
  }>;
  showLayerControl?: boolean;
  showFullscreen?: boolean;
}

const baseLayers = [
  {
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
  },
  {
    name: "Google Satellite",
    url: "https://mt1.googleapis.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    attribution: "&copy; Google",
  },
  {
    name: "Google Hybrid",
    url: "https://mt1.googleapis.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    attribution: "&copy; Google",
  },
];

export function MapContainer({
  children,
  center = DEFAULT_MAP_CENTER,
  zoom = DEFAULT_MAP_ZOOM,
  className,
  onMapClick,
  geoJsonLayers,
  showLayerControl = true,
  showFullscreen = true,
}: MapContainerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeBaseLayer, setActiveBaseLayer] = useState(0);
  const [showLayers, setShowLayers] = useState(false);
  const geoJsonLayersRef = useRef<Map<string, L.GeoJSON>>(new Map());

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      maxBounds: INDIA_BOUNDS,
      maxBoundsViscosity: 1.0,
      zoomControl: false,
    });

    L.tileLayer(baseLayers[0].url, {
      attribution: baseLayers[0].attribution,
      maxZoom: 20,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      onMapClick?.(e.latlng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapRef.current?.removeLayer(layer);
      }
    });

    L.tileLayer(baseLayers[activeBaseLayer].url, {
      attribution: baseLayers[activeBaseLayer].attribution,
      maxZoom: 20,
    }).addTo(mapRef.current);
  }, [activeBaseLayer]);

  useEffect(() => {
    if (!mapRef.current) return;

    geoJsonLayersRef.current.forEach((layer) => {
      mapRef.current?.removeLayer(layer);
    });
    geoJsonLayersRef.current.clear();

    geoJsonLayers?.forEach((gl) => {
      const layer = L.geoJSON(gl.data, {
        style: gl.style || { color: "#16a34a", weight: 2, fillOpacity: 0.1 },
        onEachFeature: (feature, featureLayer) => {
          if (gl.onClick) {
            featureLayer.on("click", () => gl.onClick(feature));
          }
          featureLayer.bindTooltip(
            feature.properties?.name || feature.properties?.parcel_id || "Feature",
            { sticky: true }
          );
        },
      }).addTo(mapRef.current!);
      geoJsonLayersRef.current.set(gl.id, layer);
    });
  }, [geoJsonLayers]);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await mapContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  return (
    <div className={cn("relative rounded-lg overflow-hidden border", className)}>
      <div ref={mapContainerRef} className="h-full w-full min-h-[400px]" />

      {/* Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        {showLayerControl && (
          <div className="relative">
            <Button
              variant="secondary"
              size="icon"
              className="shadow-md"
              onClick={() => setShowLayers(!showLayers)}
            >
              <Layers className="h-4 w-4" />
            </Button>
            {showLayers && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border bg-card p-2 shadow-lg">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Base Layers</p>
                {baseLayers.map((layer, idx) => (
                  <button
                    key={layer.name}
                    className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent ${
                      activeBaseLayer === idx ? "bg-accent font-medium" : ""
                    }`}
                    onClick={() => setActiveBaseLayer(idx)}
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${
                        activeBaseLayer === idx ? "bg-primary" : "bg-muted-foreground"
                      }`}
                    />
                    {layer.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {showFullscreen && (
          <Button
            variant="secondary"
            size="icon"
            className="shadow-md"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {children}
    </div>
  );
}
