"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TableLoading } from "@/components/ui/loading";
import { EmptyState } from "@/components/shared/EmptyState";
import { useToast } from "@/components/ui/toast";
import { useParcels } from "@/hooks/useParcels";
import { Search, Users, Edit, Trash2 } from "lucide-react";

export default function OwnersPage() {
  const [search, setSearch] = useState("");
  const { data: parcels, isLoading } = useParcels();
  const { addToast } = useToast();

  const allOwners = parcels?.flatMap((p) =>
    (p.owners || []).map((o) => ({ ...o, parcel_id: p.parcel_id, parcel_khasra: p.khasra_number }))
  ).filter((o) => !search || o.name.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Owners</h1>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by owner name..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <TableLoading />
        ) : allOwners.length > 0 ? (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Parcel</TableHead>
                  <TableHead>Khasra</TableHead>
                  <TableHead>Share %</TableHead>
                  <TableHead>Possession</TableHead>
                  <TableHead>Possession Area</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allOwners.map((owner: any) => (
                  <TableRow key={owner.id}>
                    <TableCell className="font-medium">{owner.name}</TableCell>
                    <TableCell>{owner.parcel_id}</TableCell>
                    <TableCell>{owner.parcel_khasra}</TableCell>
                    <TableCell>{owner.share_percentage}%</TableCell>
                    <TableCell>
                      <Badge variant={owner.has_existing_possession ? "success" : "secondary"}>
                        {owner.has_existing_possession ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>{owner.possession_area || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={owner.is_active ? "success" : "destructive"}>
                        {owner.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState
            icon={<Users className="h-16 w-16" />}
            title="No owners found"
            description="Owners are added when you create a parcel with co-owners."
          />
        )}
      </div>
    </DashboardLayout>
  );
}
