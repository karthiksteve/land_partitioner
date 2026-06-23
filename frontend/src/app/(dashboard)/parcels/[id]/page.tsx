"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useParcel, useParcelGeometry } from "@/hooks/useParcels";
import DashboardLayout from "@/components/layout/DashboardLayout";
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
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MapPin,
  Download,
  FileText,
  ArrowLeft,
  Info,
  Map,
  FileDown,
  ExternalLink,
} from "lucide-react";
import { formatArea, formatDate, generatePNIUDisplay } from "@/utils";
import { DOCUMENT_TYPE_LABELS } from "@/lib/constants";
import Link from "next/link";

export default function ParcelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const id = params.id as string;
  const { data: parcelData, isLoading, error } = useParcel(id);
  const { data: geometryData, isLoading: geometryLoading } =
    useParcelGeometry(id);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Loading message="Loading parcel details..." fullPage />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !parcelData) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <Info className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gov-text-dark mb-2">
                Failed to Load Parcel
              </h3>
              <p className="text-sm text-gov-text-light mb-4">
                {error instanceof Error
                  ? error.message
                  : "Parcel not found or you don't have access."}
              </p>
              <Link href="/search">
                <Button variant="default">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Search
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const parcel = parcelData?.parcel || parcelData;

  const polygons = (() => {
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
  })();

  const documents = parcelData?.documents || [];

  const detailRows = [
    { label: "PNIU", value: generatePNIUDisplay(parcel.pniu), highlight: true },
    { label: "Plot Number", value: parcel.plot_number },
    { label: "Khata Number", value: parcel.khata_number },
    { label: "Area (Acres)", value: parcel.area_acres?.toFixed(4) },
    { label: "Area (Hectares)", value: parcel.area_hectares?.toFixed(4) },
    { label: "Village / Mouza", value: parcel.village || parcel.mouza },
    { label: "Circle", value: parcel.circle },
    { label: "District", value: parcel.district },
    { label: "Land Type", value: parcel.land_type || "N/A" },
    { label: "Owner Name", value: parcel.owner_name || "N/A" },
    { label: "Father's Name", value: parcel.father_name || "N/A" },
    { label: "Last Updated", value: formatDate(parcel.updated_at || parcel.created_at) },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/search"
            className="inline-flex items-center text-sm text-gov-blue hover:underline"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Search Results
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Parcel Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-gov-saffron" />
                  Parcel Information
                </CardTitle>
                <CardDescription>
                  Administrative details for Plot #{parcel.plot_number}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    {detailRows.map((row) => (
                      <TableRow key={row.label}>
                        <TableCell className="font-medium text-gov-text-light w-1/3">
                          {row.label}
                        </TableCell>
                        <TableCell
                          className={
                            row.highlight
                              ? "font-bold text-gov-blue font-mono"
                              : ""
                          }
                        >
                          {row.value}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Download className="h-4 w-4 text-gov-green" />
                  Download Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="default" size="sm">
                    <FileDown className="h-4 w-4 mr-1.5" />
                    Parcel PDF
                  </Button>
                  <Button variant="green" size="sm">
                    <FileDown className="h-4 w-4 mr-1.5" />
                    Land Record
                  </Button>
                  <Button variant="saffron" size="sm">
                    <FileDown className="h-4 w-4 mr-1.5" />
                    GeoJSON
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileDown className="h-4 w-4 mr-1.5" />
                    Map Image
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - GIS Map */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5 text-gov-green" />
                  GIS Map View
                </CardTitle>
                <CardDescription>
                  Parcel boundary on satellite imagery
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative h-[500px]">
                  {geometryLoading ? (
                    <Loading message="Loading map..." />
                  ) : (
                    <MapContainerComponent
                      polygons={polygons ? [polygons] : undefined}
                      polygonColor="#ff4444"
                      polygonFillColor="rgba(255, 68, 68, 0.2)"
                      showControls={true}
                    />
                  )}
                  <div className="absolute bottom-4 left-4 z-[1000]">
                    <MapLegend />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Documents Section */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gov-blue" />
                Available Documents
              </CardTitle>
              <CardDescription>
                Downloadable land records and maps for this parcel
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-10 w-10 text-gov-text-light mx-auto mb-3" />
                  <p className="text-sm text-gov-text-light">
                    No documents available for this parcel yet.
                  </p>
                  <p className="text-xs text-gov-text-light mt-1">
                    Documents will appear here once generated.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc: { id: string; document_type: string; title: string; created_at: string; file_size: number; mime_type: string }) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <Badge
                            variant={
                              doc.document_type === "parcel_pdf"
                                ? "default"
                                : doc.document_type === "land_record"
                                ? "green"
                                : "saffron"
                            }
                          >
                            {DOCUMENT_TYPE_LABELS[doc.document_type] ||
                              doc.document_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {doc.title}
                        </TableCell>
                        <TableCell>{formatDate(doc.created_at)}</TableCell>
                        <TableCell>
                          {doc.file_size
                            ? `${(doc.file_size / 1024).toFixed(1)} KB`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            <Download className="h-3.5 w-3.5 mr-1" />
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
