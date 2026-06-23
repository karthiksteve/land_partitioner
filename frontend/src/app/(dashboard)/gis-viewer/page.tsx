"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useParcelSearch } from "@/hooks/useParcels";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MapContainerComponent from "@/components/map/MapContainer";
import MapLegend from "@/components/map/MapLegend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Search, MapPin, Info, ExternalLink, Download, X, Layers } from "lucide-react";
import { BIHAR_DISTRICTS } from "@/lib/constants";
import { formatArea, generatePNIUDisplay } from "@/utils";
import type { Parcel } from "@/types";
import Link from "next/link";

export default function GisViewerPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const searchMutation = useParcelSearch();

  const [district, setDistrict] = useState("");
  const [plotNumber, setPlotNumber] = useState("");
  const [searchResults, setSearchResults] = useState<Parcel[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [showSearch, setShowSearch] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const districtOptions = BIHAR_DISTRICTS.map((d) => ({
    value: d,
    label: d,
  }));

  const handleSearch = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!district) {
        setError("Please select a district");
        return;
      }
      setError(null);
      try {
        const result = await searchMutation.mutateAsync({
          district,
          plot_number: plotNumber || undefined,
        });
        setSearchResults(result.parcels || []);
        if (result.parcels?.length > 0) {
          setSelectedParcel(result.parcels[0]);
        }
      } catch {
        setError("Failed to search parcels");
      }
    },
    [district, plotNumber, searchMutation]
  );

  if (!isAuthenticated) return null;

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Sidebar */}
        <div
          className={`${
            showSearch ? "w-80" : "w-0"
          } bg-white border-r border-gov-border transition-all duration-300 overflow-hidden flex flex-col`}
        >
          <div className="p-4 border-b border-gov-border flex items-center justify-between">
            <h2 className="font-semibold text-gov-text-dark text-sm flex items-center gap-2">
              <Layers className="h-4 w-4 text-gov-saffron" />
              GIS Layers
            </h2>
            <button
              onClick={() => setShowSearch(false)}
              className="p-1 rounded hover:bg-gov-gray text-gov-text-light"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="space-y-3">
              <Select
                options={districtOptions}
                placeholder="Select District"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
              <Input
                placeholder="Plot Number (optional)"
                value={plotNumber}
                onChange={(e) => setPlotNumber(e.target.value)}
              />
              <Button
                type="submit"
                variant="saffron"
                size="sm"
                className="w-full"
                disabled={searchMutation.isPending}
              >
                {searchMutation.isPending ? (
                  <>
                    <div className="h-3 w-3 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </form>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 rounded p-2">
                {error}
              </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gov-text-light uppercase">
                  Results ({searchResults.length})
                </p>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {searchResults.map((parcel) => (
                    <div
                      key={parcel.id}
                      className={`p-3 rounded border cursor-pointer transition-colors ${
                        selectedParcel?.id === parcel.id
                          ? "border-gov-blue bg-blue-50"
                          : "border-gov-border hover:bg-gov-gray"
                      }`}
                      onClick={() => setSelectedParcel(parcel)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gov-text-dark">
                            Plot #{parcel.plot_number}
                          </p>
                          <p className="text-xs text-gov-text-light mt-0.5">
                            {parcel.village || parcel.mouza}
                          </p>
                        </div>
                        <MapPin className="h-4 w-4 text-gov-blue" />
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-gov-text-light">
                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                          {parcel.land_type || "N/A"}
                        </Badge>
                        <span>{formatArea(parcel.area_acres, parcel.area_hectares)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.length === 0 && !searchMutation.isPending && (
              <div className="text-center py-8">
                <Search className="h-8 w-8 text-gov-text-light mx-auto mb-2" />
                <p className="text-xs text-gov-text-light">
                  Search for parcels to display on the map
                </p>
              </div>
            )}

            {/* Legend */}
            <div className="pt-4 border-t border-gov-border">
              <MapLegend />
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          {!showSearch && (
            <button
              onClick={() => setShowSearch(true)}
              className="absolute top-4 left-4 z-[1000] bg-white rounded-md shadow-gov border border-gov-border p-2 hover:bg-gov-gray"
              title="Show sidebar"
            >
              <Layers className="h-5 w-5 text-gov-blue" />
            </button>
          )}

          <MapContainerComponent
            center={[25.6, 85.1]}
            zoom={8}
            polygons={undefined}
            polygonColor="#ff4444"
            polygonFillColor="rgba(255, 68, 68, 0.2)"
            showControls={true}
            className="w-full h-full"
          />

          {/* Selected Parcel Popup */}
          {selectedParcel && (
            <div className="absolute bottom-4 right-4 z-[1000] w-72">
              <Card className="shadow-gov-lg">
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-1">
                      <Info className="h-4 w-4 text-gov-saffron" />
                      Plot #{selectedParcel.plot_number}
                    </CardTitle>
                    <button
                      onClick={() => setSelectedParcel(null)}
                      className="p-0.5 rounded hover:bg-gov-gray text-gov-text-light"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="py-3 px-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gov-text-light">PNIU:</span>
                      <span className="ml-1 font-mono font-medium text-gov-text-dark">
                        {generatePNIUDisplay(selectedParcel.pniu)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gov-text-light">Khata:</span>
                      <span className="ml-1 font-medium text-gov-text-dark">
                        {selectedParcel.khata_number}
                      </span>
                    </div>
                    <div>
                      <span className="text-gov-text-light">Area:</span>
                      <span className="ml-1 font-medium text-gov-text-dark">
                        {selectedParcel.area_acres.toFixed(2)} ac
                      </span>
                    </div>
                    <div>
                      <span className="text-gov-text-light">District:</span>
                      <span className="ml-1 font-medium text-gov-text-dark">
                        {selectedParcel.district}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Link href={`/parcels/${selectedParcel.id}`}>
                      <Button variant="outline" size="sm" className="text-xs h-8">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                    </Link>
                    <Button variant="green" size="sm" className="text-xs h-8">
                      <Download className="h-3 w-3 mr-1" />
                      PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
