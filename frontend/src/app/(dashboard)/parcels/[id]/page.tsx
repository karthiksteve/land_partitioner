"use client";

import { useParams, useRouter } from "next/navigation";
import { useParcel, useDeleteParcel } from "@/hooks/useParcels";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ParcelMap } from "@/components/map/ParcelMap";
import { ParcelForm } from "@/components/forms/ParcelForm";
import { UploadForm } from "@/components/forms/UploadForm";
import { ShareChart } from "@/components/charts/ShareChart";
import { PageLoading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useUpdateParcel } from "@/hooks/useParcels";
import { formatDate, formatArea } from "@/lib/utils";
import { ArrowLeft, Edit, Trash2, MapPin, Users, FileText, Upload } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ParcelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: parcel, isLoading } = useParcel(id);
  const deleteParcel = useDeleteParcel();
  const updateParcel = useUpdateParcel();
  const { addToast } = useToast();
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this parcel?")) {
      try {
        await deleteParcel.mutateAsync(id);
        addToast("Parcel deleted", "success");
        router.push("/parcels");
      } catch {
        addToast("Failed to delete", "error");
      }
    }
  };

  const handleUpdate = async (data: any) => {
    try {
      await updateParcel.mutateAsync({ id, data });
      setShowEditDialog(false);
      addToast("Parcel updated", "success");
    } catch {
      addToast("Failed to update", "error");
    }
  };

  const handleUpload = async (file: File, type: string) => {
    try {
      const { parcelsApi } = await import("@/lib/api");
      await parcelsApi.uploadFile(id, file, type);
      addToast("File uploaded", "success");
    } catch {
      addToast("Upload failed", "error");
    }
  };

  if (isLoading) return <DashboardLayout><PageLoading /></DashboardLayout>;
  if (!parcel) return <DashboardLayout><p>Parcel not found</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{parcel.parcel_id}</h1>
            <p className="text-sm text-muted-foreground">Khasra: {parcel.khasra_number}</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit className="h-4 w-4" /> Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Parcel</DialogTitle>
                </DialogHeader>
                <ParcelForm
                  initialData={parcel}
                  onSubmit={handleUpdate}
                  isLoading={updateParcel.isPending}
                />
              </DialogContent>
            </Dialog>
            <Button variant="destructive" size="sm" className="gap-2" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ParcelMap parcelId={id} className="h-[400px]" />
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Parcel Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Village</span>
                  <span className="font-medium">{parcel.village}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tehsil</span>
                  <span className="font-medium">{parcel.tehsil}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">District</span>
                  <span className="font-medium">{parcel.district}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Area</span>
                  <span className="font-medium">{formatArea(parcel.area, parcel.area_unit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Land Type</span>
                  <Badge variant="secondary">{parcel.land_type}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Soil Type</span>
                  <span className="font-medium">{parcel.soil_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={parcel.status === "active" ? "success" : "secondary"}>{parcel.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{formatDate(parcel.created_at)}</span>
                </div>
              </CardContent>
            </Card>

            {parcel.owners && parcel.owners.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Owners</CardTitle>
                </CardHeader>
                <CardContent>
                  <ShareChart
                    data={parcel.owners.map((o) => ({ name: o.name, value: o.share_percentage }))}
                    title="Owner Shares"
                  />
                  <div className="mt-3 space-y-2">
                    {parcel.owners.map((owner) => (
                      <div key={owner.id} className="flex justify-between text-sm">
                        <span>{owner.name}</span>
                        <span className="font-medium">{owner.share_percentage}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Link href={`/partition?parcelId=${parcel.id}`}>
              <Button className="w-full gap-2">
                <MapPin className="h-4 w-4" /> Generate Partition Plans
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="owners">
          <TabsList>
            <TabsTrigger value="owners" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Owners
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Plans
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <Upload className="h-4 w-4" /> Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="owners">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Owner Details</CardTitle>
              </CardHeader>
              <CardContent>
                {parcel.owners?.length > 0 ? (
                  <div className="space-y-3">
                    {parcel.owners.map((owner) => (
                      <div key={owner.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium">{owner.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Share: {owner.share_percentage}% | Possession: {owner.has_existing_possession ? "Yes" : "No"}
                          </p>
                        </div>
                        <Badge variant={owner.has_existing_possession ? "success" : "secondary"}>
                          {owner.has_existing_possession ? "Has Possession" : "No Possession"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-8 text-center">No owners defined</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Partition Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground py-8 text-center">
                  <Link href={`/partition?parcelId=${parcel.id}`} className="text-primary hover:underline">
                    Create partition plans
                  </Link>{" "}
                  for this parcel
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <UploadForm onUpload={handleUpload} parcelId={parcel.id} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
