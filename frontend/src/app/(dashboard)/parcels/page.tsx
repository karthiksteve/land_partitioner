"use client";

import { useState } from "react";
import Link from "next/link";
import { useParcels, useDeleteParcel } from "@/hooks/useParcels";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TableLoading } from "@/components/ui/loading";
import { EmptyState } from "@/components/shared/EmptyState";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { ParcelForm } from "@/components/forms/ParcelForm";
import { ParcelCreate } from "@/types";
import { useCreateParcel, useUpdateParcel } from "@/hooks/useParcels";
import { Plus, Search, Edit, Trash2, Eye, ExternalLink, Map } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ParcelsPage() {
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");
  const [village, setVillage] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: parcels, isLoading } = useParcels({ search, district, village });
  const deleteParcel = useDeleteParcel();
  const createParcel = useCreateParcel();
  const updateParcel = useUpdateParcel();
  const { addToast } = useToast();

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this parcel?")) {
      try {
        await deleteParcel.mutateAsync(id);
        addToast("Parcel deleted successfully", "success");
      } catch {
        addToast("Failed to delete parcel", "error");
      }
    }
  };

  const handleCreate = async (data: ParcelCreate) => {
    try {
      await createParcel.mutateAsync(data);
      setShowCreateDialog(false);
      addToast("Parcel created successfully", "success");
    } catch {
      addToast("Failed to create parcel", "error");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Parcels</h1>
          <div className="flex gap-2">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" /> New Parcel
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Parcel</DialogTitle>
                  <DialogDescription>Fill in the parcel details below.</DialogDescription>
                </DialogHeader>
                <ParcelForm onSubmit={handleCreate} isLoading={createParcel.isPending} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by ID, Khasra, Village..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Input
            placeholder="District"
            className="w-40"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          />
          <Input
            placeholder="Village"
            className="w-40"
            value={village}
            onChange={(e) => setVillage(e.target.value)}
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <TableLoading />
        ) : parcels && parcels.length > 0 ? (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parcel ID</TableHead>
                  <TableHead>Khasra</TableHead>
                  <TableHead>Village</TableHead>
                  <TableHead>Tehsil</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parcels.map((parcel) => (
                  <TableRow key={parcel.id}>
                    <TableCell className="font-medium">{parcel.parcel_id}</TableCell>
                    <TableCell>{parcel.khasra_number}</TableCell>
                    <TableCell>{parcel.village}</TableCell>
                    <TableCell>{parcel.tehsil}</TableCell>
                    <TableCell>{parcel.area} {parcel.area_unit}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{parcel.land_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          parcel.status === "active"
                            ? "success"
                            : parcel.status === "pending"
                            ? "warning"
                            : "secondary"
                        }
                      >
                        {parcel.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(parcel.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/parcels/${parcel.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(parcel.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState
            icon={<Map className="h-16 w-16" />}
            title="No parcels found"
            description="Create your first parcel to get started with land partition."
            actionLabel="Create Parcel"
            onAction={() => setShowCreateDialog(true)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
