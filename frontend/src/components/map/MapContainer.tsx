"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MAP_TILE_URL, SATELLITE_TILE_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, Map, Satellite } from "lucide-react";

interface MapContainerProps {
  center?: [number, number];
  zoom?: number;
  polygons?: number[][][];
  polygonColor?: string;
  polygonFillColor?: string;
  onMapClick?: (latlng: L.LatLng) => void;
  className?: string;
  showControls?: boolean;
}

export default function MapContainerComponent({
  center = [25.6, 85.1],
  zoom = 8,
  polygons,
  polygonColor = "#ff4444",
  polygonFillColor = "rgba(255, 68, 68, 0.2)",
  onMapClick,
  className = "",
  showControls = true,
}: MapContainerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const polygonRef = useRef<L.Polygon | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layerType, setLayerType] = useState<"street" | "satellite">("street");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const currentTileLayer = useRef<L.TileLayer | null>(null);

  const switchLayer = useCallback(
    (type: "street" | "satellite") => {
      setLayerType(type);
      if (!mapRef.current) return;
      if (currentTileLayer.current) {
        mapRef.current.removeLayer(currentTileLayer.current);
      }
      const url = type === "street" ? MAP_TILE_URL : SATELLITE_TILE_URL;
      const attribution =
        type === "street"
          ? "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
          : "&copy; Google";
      currentTileLayer.current = L.tileLayer(url, {
        attribution,
        maxZoom: 20,
      });
      currentTileLayer.current.addTo(mapRef.current);
    },
    []
  );

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: showControls,
      attributionControl: showControls,
    });

    const tileLayer = L.tileLayer(MAP_TILE_URL, {
      attribution:
        "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>",
      maxZoom: 20,
    });
    tileLayer.addTo(map);
    currentTileLayer.current = tileLayer;

    if (onMapClick) {
      map.on("click", (e: L.LeafletMouseEvent) => {
        setCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });
        onMapClick(e.latlng);
      });
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView(center, zoom);
  }, [center, zoom]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (polygonRef.current) {
      mapRef.current.removeLayer(polygonRef.current);
    }
    if (polygons && polygons.length > 0) {
      const polygon = L.polygon(polygons, {
        color: polygonColor,
        fillColor: polygonFillColor,
        fillOpacity: 0.4,
        weight: 2,
      }).addTo(mapRef.current);
      polygonRef.current = polygon;
      const bounds = polygon.getBounds();
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [polygons, polygonColor, polygonFillColor]);

  const toggleFullscreen = useCallback(async () => {
    if (!mapContainerRef.current) return;
    if (!document.fullscreenElement) {
      await mapContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mapContainerRef}
        className="w-full h-full min-h-[400px] rounded-lg border border-gov-border"
      />

      {showControls && (
        <div className="absolute top-2 right-2 z-[1000] flex flex-col gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              switchLayer(layerType === "street" ? "satellite" : "street")
            }
            className="bg-white shadow-gov"
            title={`Switch to ${layerType === "street" ? "Satellite" : "Street"} view`}
          >
            {layerType === "street" ? (
              <Satellite className="h-4 w-4" />
            ) : (
              <Map className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleFullscreen}
            className="bg-white shadow-gov"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {coordinates && showControls && (
        <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 rounded px-2 py-1 text-xs text-gov-text-dark shadow-gov border border-gov-border">
          Lat: {coordinates.lat.toFixed(6)}, Lng: {coordinates.lng.toFixed(6)}
        </div>
      )}

      <div className="absolute bottom-2 right-2 z-[1000] bg-white/90 rounded px-2 py-1 text-xs text-gov-text-dark shadow-gov border border-gov-border">
        {layerType === "street" ? "Street Map" : "Satellite"}
      </div>
    </div>
  );
}
