"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  FileText,
  Search,
  Download,
  Filter,
  FileDown,
  File,
  FileJson,
  Image,
} from "lucide-react";
import { formatDate, formatFileSize } from "@/utils";
import { DOCUMENT_TYPE_LABELS } from "@/lib/constants";

interface DocumentItem {
  id: string;
  parcel_id: string;
  document_type: string;
  title: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  parcel_plot?: string;
  parcel_district?: string;
}

const sampleDocuments: DocumentItem[] = [
  {
    id: "1",
    parcel_id: "p1",
    document_type: "parcel_pdf",
    title: "Parcel Map - Plot #123",
    file_url: "#",
    file_size: 245000,
    mime_type: "application/pdf",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    parcel_plot: "123",
    parcel_district: "Patna",
  },
  {
    id: "2",
    parcel_id: "p1",
    document_type: "land_record",
    title: "Land Record - Plot #123",
    file_url: "#",
    file_size: 189000,
    mime_type: "application/pdf",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    parcel_plot: "123",
    parcel_district: "Patna",
  },
  {
    id: "3",
    parcel_id: "p2",
    document_type: "geojson",
    title: "Boundary Data - Plot #456",
    file_url: "#",
    file_size: 12000,
    mime_type: "application/geo+json",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    parcel_plot: "456",
    parcel_district: "Gaya",
  },
];

const iconMap: Record<string, React.ReactNode> = {
  parcel_pdf: <FileDown className="h-4 w-4" />,
  land_record: <FileText className="h-4 w-4" />,
  geojson: <FileJson className="h-4 w-4" />,
  map_image: <Image className="h-4 w-4" />,
  khasra: <File className="h-4 w-4" />,
  khatauni: <File className="h-4 w-4" />,
};

export default function DocumentsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [documents] = useState<DocumentItem[]>(sampleDocuments);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const filteredDocs = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.parcel_plot?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.parcel_district?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="gov-page-title">Downloaded Documents</h1>
          <p className="gov-subtitle">
            Access and download your land records, parcel maps, and data files
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gov-blue" />
                  Documents ({filteredDocs.length})
                </CardTitle>
                <CardDescription>
                  Land records downloaded from Bihar BhuNaksha
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gov-text-light" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredDocs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gov-text-light mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gov-text-dark mb-2">
                  No Documents Found
                </h3>
                <p className="text-sm text-gov-text-light mb-4">
                  {searchQuery
                    ? "No documents match your search. Try different keywords."
                    : "You haven't downloaded any documents yet. Search for a parcel to get started."}
                </p>
                <Button
                  variant="default"
                  onClick={() => router.push("/search")}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search Parcels
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Parcel</TableHead>
                      <TableHead>District</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocs.map((doc) => (
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
                            className="flex items-center gap-1 w-fit"
                          >
                            {iconMap[doc.document_type] || (
                              <File className="h-3 w-3" />
                            )}
                            {DOCUMENT_TYPE_LABELS[doc.document_type] ||
                              doc.document_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {doc.title}
                        </TableCell>
                        <TableCell>#{doc.parcel_plot}</TableCell>
                        <TableCell>{doc.parcel_district}</TableCell>
                        <TableCell>{formatDate(doc.created_at)}</TableCell>
                        <TableCell>{formatFileSize(doc.file_size)}</TableCell>
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
