"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useParcelSearch, useParcelGeometry } from "@/hooks/useParcels";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ParcelSearchForm from "@/components/forms/ParcelSearchForm";
import MapContainerComponent from "@/components/map/MapContainer";
import MapLegend from "@/components/map/MapLegend";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  MapPin,
  Download,
  FileText,
  Eye,
  Map,
  ExternalLink,
  Search,
  Info,
  AlertCircle,
} from "lucide-react";
import type { Parcel } from "@/types";
import { formatArea, generatePNIUDisplay } from "@/utils";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const searchMutation = useParcelSearch();

  const [searchResults, setSearchResults] = useState<Parcel[] | null>(null);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: geometryData, isLoading: geometryLoading } = useParcelGeometry(
    selectedParcel?.id
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Pre-fill from URL params
  useEffect(() => {
    const district = searchParams.get("district");
    const plot_number = searchParams.get("plot_number");
    if (district && plot_number) {
      handleSearch({ district, plot_number });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (data: {
    district: string;
    circle?: string;
    mouza?: string;
    plot_number?: string;
  }) => {
    setError(null);
    setSearchResults(null);
    setSelectedParcel(null);
    setShowMap(false);

    try {
      const result = await searchMutation.mutateAsync(data);
      setSearchResults(result.parcels || []);
      if (result.parcels?.length === 0) {
        setError("No parcels found matching your search criteria.");
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { detail?: string } } };
        setError(
          axiosErr.response?.data?.detail ||
            "Failed to search parcels. Please try again."
        );
      } else {
        setError("Failed to search parcels. Please try again.");
      }
    }
  };

  const handleViewOnMap = (parcel: Parcel) => {
    setSelectedParcel(parcel);
    setShowMap(true);
  };

  const getParcelPolygons = (): number[][][] | undefined => {
    if (!geometryData) return undefined;
    try {
      const geom = geometryData?.geometry || geometryData;
      if (geom?.type === "Polygon") {
        return geom.coordinates as number[][][];
      }
      if (geom?.type === "MultiPolygon") {
        return (geom.coordinates as number[][][][])[0];
      }
    } catch {
      return undefined;
    }
    return undefined;
  };

  if (!isAuthenticated) {
    return null;
  }

  const polygons = getParcelPolygons();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="gov-page-title">Parcel Search</h1>
          <p className="gov-subtitle">
            Search land records from Bihar BhuNaksha by district, circle, mouza,
            and plot number
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-gov-saffron" />
              Search Land Parcel
            </CardTitle>
            <CardDescription>
              Fill in the details below to search for a land parcel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ParcelSearchForm
              onSearch={handleSearch}
              isLoading={searchMutation.isPending}
              error={null}
            />
          </CardContent>
        </Card>

        {/* Error display */}
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Search Error
                </p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {searchMutation.isPending && (
          <div className="py-12">
            <Loading
              message="Searching BhuNaksha..."
              fullPage={false}
            />
            <p className="text-center text-sm text-gov-text-light mt-2">
              Connecting to Bihar BhuNaksha server...
            </p>
          </div>
        )}

        {/* Search Results */}
        {searchResults && searchResults.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Results List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gov-blue" />
                    Search Results
                  </CardTitle>
                  <CardDescription>
                    {searchResults.length} parcel(s) found
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gov-border max-h-[600px] overflow-y-auto">
                    {searchResults.map((parcel) => (
                      <div
                        key={parcel.id}
                        className={`p-4 cursor-pointer transition-colors hover:bg-gov-gray ${
                          selectedParcel?.id === parcel.id
                            ? "bg-blue-50 border-l-4 border-gov-blue"
                            : ""
                        }`}
                        onClick={() => handleViewOnMap(parcel)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gov-text-dark">
                              Plot #{parcel.plot_number}
                            </p>
                            <p className="text-xs text-gov-text-light mt-0.5">
                              {parcel.village || parcel.mouza},{" "}
                              {parcel.circle}, {parcel.district}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {parcel.land_type || "N/A"}
                          </Badge>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-xs text-gov-text-light">
                          <span>
                            Area: {formatArea(parcel.area_acres, parcel.area_hectares)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Selected Parcel Details + Map */}
            <div className="lg:col-span-2 space-y-6">
              {selectedParcel && (
                <>
                  {/* Parcel Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-gov-saffron" />
                        Parcel Details - Plot #{selectedParcel.plot_number}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gov-text-light uppercase tracking-wider">
                            PNIU
                          </p>
                          <p className="text-sm font-bold text-gov-blue mt-0.5 font-mono">
                            {generatePNIUDisplay(selectedParcel.pniu)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gov-text-light uppercase tracking-wider">
                            Plot Number
                          </p>
                          <p className="text-sm font-medium text-gov-text-dark mt-0.5">
                            {selectedParcel.plot_number}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gov-text-light uppercase tracking-wider">
                            Khata Number
                          </p>
                          <p className="text-sm font-medium text-gov-text-dark mt-0.5">
                            {selectedParcel.khata_number}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gov-text-light uppercase tracking-wider">
                            Area (Acres)
                          </p>
                          <p className="text-sm font-medium text-gov-text-dark mt-0.5">
                            {selectedParcel.area_acres.toFixed(4)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gov-text-light uppercase tracking-wider">
                            Area (Hectares)
                          </p>
                          <p className="text-sm font-medium text-gov-text-dark mt-0.5">
                            {selectedParcel.area_hectares.toFixed(4)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gov-text-light uppercase tracking-wider">
                            Village / Mouza
                          </p>
                          <p className="text-sm font-medium text-gov-text-dark mt-0.5">
                            {selectedParcel.village || selectedParcel.mouza}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gov-text-light uppercase tracking-wider">
                            Circle
                          </p>
                          <p className="text-sm font-medium text-gov-text-dark mt-0.5">
                            {selectedParcel.circle}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gov-text-light uppercase tracking-wider">
                            District
                          </p>
                          <p className="text-sm font-medium text-gov-text-dark mt-0.5">
                            {selectedParcel.district}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gov-text-light uppercase tracking-wider">
                            Land Type
                          </p>
                          <p className="text-sm font-medium text-gov-text-dark mt-0.5">
                            {selectedParcel.land_type || "N/A"}
                          </p>
                        </div>
                        {selectedParcel.owner_name && (
                          <div>
                            <p className="text-xs text-gov-text-light uppercase tracking-wider">
                              Owner
                            </p>
                            <p className="text-sm font-medium text-gov-text-dark mt-0.5">
                              {selectedParcel.owner_name}
                            </p>
                          </div>
                        )}
                        {selectedParcel.father_name && (
                          <div>
                            <p className="text-xs text-gov-text-light uppercase tracking-wider">
                              Father&apos;s Name
                            </p>
                            <p className="text-sm font-medium text-gov-text-dark mt-0.5">
                              {selectedParcel.father_name}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-6 flex flex-wrap gap-3 border-t border-gov-border pt-4">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setShowMap(true)}
                        >
                          <Map className="h-4 w-4 mr-1.5" />
                          View on GIS Map
                        </Button>
                        <Link
                          href={`/parcels/${selectedParcel.id}`}
                        >
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-1.5" />
                            Full Details
                          </Button>
                        </Link>
                        <Button variant="green" size="sm">
                          <Download className="h-4 w-4 mr-1.5" />
                          Download Parcel PDF
                        </Button>
                        <Button variant="saffron" size="sm">
                          <FileText className="h-4 w-4 mr-1.5" />
                          Download Land Record
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1.5" />
                          Download GeoJSON
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Map */}
                  {showMap && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Map className="h-5 w-5 text-gov-green" />
                          GIS Map View - Plot #{selectedParcel.plot_number}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="relative">
                          <div className="h-[450px] w-full">
                            {geometryLoading ? (
                              <Loading message="Loading parcel geometry..." />
                            ) : (
                              <MapContainerComponent
                                center={
                                  polygons
                                    ? undefined
                                    : [25.6, 85.1]
                                }
                                zoom={15}
                                polygons={
                                  polygons ? [polygons] : undefined
                                }
                                polygonColor="#ff4444"
                                polygonFillColor="rgba(255, 68, 68, 0.2)"
                                showControls={true}
                              />
                            )}
                          </div>
                          <div className="absolute bottom-4 left-4 z-[1000]">
                            <MapLegend />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {searchResults && searchResults.length === 0 && !searchMutation.isPending && (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 text-gov-text-light mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gov-text-dark mb-2">
                No Results Found
              </h3>
              <p className="text-sm text-gov-text-light">
                Try adjusting your search criteria or check the plot number.
              </p>
            </CardContent>
          </Card>
        )}

        {!searchResults && !searchMutation.isPending && !error && (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 text-gov-text-light mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gov-text-dark mb-2">
                Search for a Land Parcel
              </h3>
              <p className="text-sm text-gov-text-light max-w-md mx-auto">
                Fill in the search form above with district and plot number to
                retrieve land records from Bihar BhuNaksha.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
