"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Owner, OwnerCreate } from "@/types";
import { Plus, Trash2, Upload } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import Papa from "papaparse";

interface OwnerFormProps {
  owners: OwnerCreate[];
  onChange: (owners: OwnerCreate[]) => void;
  onSubmit?: () => void;
  isLoading?: boolean;
  existingOwners?: Owner[];
}

export function OwnerForm({ owners, onChange, onSubmit, isLoading, existingOwners }: OwnerFormProps) {
  const { addToast } = useToast();

  const addOwner = () => {
    onChange([...owners, { parcel_id: "", name: "", share_percentage: 0 }]);
  };

  const removeOwner = (index: number) => {
    onChange(owners.filter((_, i) => i !== index));
  };

  const updateOwner = (index: number, field: keyof OwnerCreate, value: any) => {
    const updated = owners.map((o, i) =>
      i === index ? { ...o, [field]: value } : o
    );
    onChange(updated);
  };

  const totalShare = owners.reduce((sum, o) => sum + (o.share_percentage || 0), 0);
  const isValidShare = Math.abs(totalShare - 100) < 0.01;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const parsed = results.data.map((row: any) => ({
          parcel_id: row.parcel_id || "",
          name: row.name || row.Name || "",
          share_percentage: parseFloat(row.share_percentage || row.SharePercentage || 0),
          has_existing_possession: row.has_existing_possession === "true" || row.HasExistingPossession === "true",
          possession_area: parseFloat(row.possession_area || row.PossessionArea || 0),
        }));
        onChange([...owners, ...parsed]);
        addToast(`Imported ${parsed.length} owners from CSV`, "success");
      },
      error: () => addToast("Failed to parse CSV file", "error"),
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Owners</CardTitle>
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            <Button type="button" variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-1" /> Import CSV
            </Button>
          </label>
          <Button type="button" size="sm" onClick={addOwner}>
            <Plus className="h-4 w-4 mr-1" /> Add Owner
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {existingOwners && existingOwners.length > 0 && (
          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="text-sm font-medium mb-2">Existing Owners</p>
            {existingOwners.map((o) => (
              <div key={o.id} className="flex items-center justify-between text-sm py-1">
                <span>{o.name}</span>
                <span className="text-muted-foreground">{o.share_percentage}%</span>
              </div>
            ))}
          </div>
        )}

        {owners.map((owner, index) => (
          <div key={index} className="flex items-end gap-3 rounded-lg border p-3">
            <div className="flex-1">
              <Input
                label="Name"
                placeholder="Owner name"
                value={owner.name}
                onChange={(e) => updateOwner(index, "name", e.target.value)}
              />
            </div>
            <div className="w-24">
              <Input
                label="Share %"
                type="number"
                step="0.01"
                value={owner.share_percentage || ""}
                onChange={(e) => updateOwner(index, "share_percentage", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="flex items-center gap-1 pb-2">
              <label className="flex items-center gap-1 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={owner.has_existing_possession || false}
                  onChange={(e) => updateOwner(index, "has_existing_possession", e.target.checked)}
                />
                Possession
              </label>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => removeOwner(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {!isValidShare && owners.length > 0 && (
          <p className="text-sm text-destructive">
            Total share: {totalShare.toFixed(2)}%. Must sum to 100%.
          </p>
        )}

        {onSubmit && (
          <Button
            type="button"
            className="w-full"
            onClick={onSubmit}
            disabled={!isValidShare || isLoading || owners.length === 0}
          >
            {isLoading ? "Saving..." : "Save Owners"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
