"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OwnerCreate, Parcel } from "@/types";
import { OwnerForm } from "./OwnerForm";
import { useParcels } from "@/hooks/useParcels";
import { Loader2, Sparkles } from "lucide-react";

interface PartitionFormProps {
  onGenerate: (data: { parcelId: string; owners: OwnerCreate[] }) => void;
  isLoading?: boolean;
}

export function PartitionForm({ onGenerate, isLoading }: PartitionFormProps) {
  const [step, setStep] = useState(1);
  const [selectedParcelId, setSelectedParcelId] = useState("");
  const [owners, setOwners] = useState<OwnerCreate[]>([]);
  const [mode, setMode] = useState<"equal" | "custom">("equal");
  const [numOwners, setNumOwners] = useState(2);

  const { data: parcels } = useParcels({ status: "active" });

  const handleParcelSelect = (parcelId: string) => {
    setSelectedParcelId(parcelId);
    const parcel = parcels?.find((p) => p.id === parcelId);
    if (parcel?.owners) {
      setOwners(
        parcel.owners.map((o) => ({
          parcel_id: parcelId,
          name: o.name,
          share_percentage: mode === "equal" ? 100 / parcel.owners.length : o.share_percentage,
          has_existing_possession: o.has_existing_possession,
          possession_area: o.possession_area,
        }))
      );
    }
  };

  const handleModeChange = (newMode: "equal" | "custom") => {
    setMode(newMode);
    if (newMode === "equal" && owners.length > 0) {
      const equalShare = 100 / owners.length;
      setOwners(owners.map((o) => ({ ...o, share_percentage: equalShare })));
    }
  };

  const handleGenerate = () => {
    if (!selectedParcelId) return;
    onGenerate({ parcelId: selectedParcelId, owners });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Partition Plans</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step indicators */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </div>
              {s < 4 && <div className={`h-0.5 w-8 ${step > s ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-medium">Select Parcel</h3>
            <Select
              placeholder="Choose a parcel..."
              options={(parcels || []).map((p) => ({
                value: p.id,
                label: `${p.parcel_id} - ${p.khasra_number}, ${p.village}`,
              }))}
              value={selectedParcelId}
              onChange={(e) => handleParcelSelect(e.target.value)}
            />
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!selectedParcelId}>
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-medium">Partition Mode</h3>
            <div className="flex gap-3">
              <button
                onClick={() => handleModeChange("equal")}
                className={`flex-1 rounded-lg border p-4 text-center transition-colors ${
                  mode === "equal" ? "border-primary bg-primary/5" : "hover:border-primary/50"
                }`}
              >
                <p className="font-medium">Equal Shares</p>
                <p className="text-sm text-muted-foreground">All owners get equal area</p>
              </button>
              <button
                onClick={() => handleModeChange("custom")}
                className={`flex-1 rounded-lg border p-4 text-center transition-colors ${
                  mode === "custom" ? "border-primary bg-primary/5" : "hover:border-primary/50"
                }`}
              >
                <p className="font-medium">Custom Shares</p>
                <p className="text-sm text-muted-foreground">Define each owner's share</p>
              </button>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)}>Next</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-medium">Review Owners</h3>
            <OwnerForm owners={owners} onChange={setOwners} />
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={() => setStep(4)} disabled={owners.length === 0}>Next</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-medium">Generate Plans</h3>
            <div className="rounded-lg border bg-muted/50 p-4 text-sm space-y-1">
              <p>Parcel: {parcels?.find((p) => p.id === selectedParcelId)?.parcel_id}</p>
              <p>Owners: {owners.length}</p>
              <p>Mode: {mode === "equal" ? "Equal Shares" : "Custom Shares"}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              This will generate 3 partition plans (A, B, C) using AI algorithms optimized for Rule 109 compliance.
            </p>
            <Button className="w-full" onClick={handleGenerate} disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Plans...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" /> Generate All 3 Plans</>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
