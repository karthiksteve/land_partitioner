"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParcelCreate, Parcel } from "@/types";
import { PARCEL_TYPES, SOIL_TYPES, AREA_UNITS, IMPROVEMENT_OPTIONS, BOUNDARY_TYPES } from "@/lib/constants";
import { useState } from "react";

const parcelSchema = z.object({
  parcel_id: z.string().min(1, "Parcel ID is required"),
  khasra_number: z.string().min(1, "Khasra number is required"),
  state: z.string().min(1, "State is required"),
  district: z.string().min(1, "District is required"),
  tehsil: z.string().min(1, "Tehsil is required"),
  village: z.string().min(1, "Village is required"),
  area: z.coerce.number().positive("Area must be positive"),
  area_unit: z.string(),
  land_type: z.string().min(1, "Land type is required"),
  soil_type: z.string().min(1, "Soil type is required"),
  boundary_type: z.string(),
  is_commercial: z.boolean(),
  has_road_frontage: z.boolean(),
  road_frontage_length: z.coerce.number().optional(),
});

type ParcelFormData = z.infer<typeof parcelSchema>;

interface ParcelFormProps {
  onSubmit: (data: ParcelCreate) => void;
  initialData?: Parcel;
  isLoading?: boolean;
}

export function ParcelForm({ onSubmit, initialData, isLoading }: ParcelFormProps) {
  const [improvements, setImprovements] = useState<string[]>(initialData?.improvements || []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ParcelFormData>({
    resolver: zodResolver(parcelSchema),
    defaultValues: initialData
      ? {
          parcel_id: initialData.parcel_id,
          khasra_number: initialData.khasra_number,
          state: initialData.state,
          district: initialData.district,
          tehsil: initialData.tehsil,
          village: initialData.village,
          area: initialData.area,
          area_unit: initialData.area_unit,
          land_type: initialData.land_type,
          soil_type: initialData.soil_type,
          boundary_type: initialData.boundary_type,
          is_commercial: initialData.is_commercial,
          has_road_frontage: initialData.has_road_frontage,
          road_frontage_length: initialData.road_frontage_length,
        }
      : {
          area_unit: "sqm",
          boundary_type: "demarcated",
          is_commercial: false,
          has_road_frontage: false,
        },
  });

  const isCommercial = watch("is_commercial");
  const hasRoadFrontage = watch("has_road_frontage");

  const toggleImprovement = (imp: string) => {
    setImprovements((prev) =>
      prev.includes(imp) ? prev.filter((i) => i !== imp) : [...prev, imp]
    );
  };

  const handleFormSubmit = (data: ParcelFormData) => {
    onSubmit({
      ...data,
      improvements,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Parcel" : "Create New Parcel"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="Parcel ID" placeholder="e.g. PAR-001" error={errors.parcel_id?.message} {...register("parcel_id")} />
            <Input label="Khasra Number" placeholder="e.g. 123/456" error={errors.khasra_number?.message} {...register("khasra_number")} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Input label="State" placeholder="e.g. Uttar Pradesh" error={errors.state?.message} {...register("state")} />
            <Input label="District" placeholder="e.g. Lucknow" error={errors.district?.message} {...register("district")} />
            <Input label="Tehsil" placeholder="e.g. Sadar" error={errors.tehsil?.message} {...register("tehsil")} />
            <Input label="Village" placeholder="e.g. Mohanlalganj" error={errors.village?.message} {...register("village")} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Input label="Area" type="number" step="0.01" error={errors.area?.message} {...register("area")} />
            <Select
              label="Area Unit"
              options={AREA_UNITS.map((u) => ({ value: u, label: u.toUpperCase() }))}
              {...register("area_unit")}
            />
            <Select
              label="Land Type"
              options={PARCEL_TYPES.map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
              error={errors.land_type?.message}
              {...register("land_type")}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              label="Soil Type"
              options={SOIL_TYPES.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
              error={errors.soil_type?.message}
              {...register("soil_type")}
            />
            <Select
              label="Boundary Type"
              options={BOUNDARY_TYPES.map((b) => ({ value: b, label: b.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) }))}
              {...register("boundary_type")}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Improvements</label>
            <div className="flex flex-wrap gap-2">
              {IMPROVEMENT_OPTIONS.map((imp) => (
                <button
                  key={imp}
                  type="button"
                  onClick={() => toggleImprovement(imp)}
                  className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                    improvements.includes(imp)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-input hover:border-primary"
                  }`}
                >
                  {imp.charAt(0).toUpperCase() + imp.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_commercial" className="rounded" {...register("is_commercial")} />
              <label htmlFor="is_commercial" className="text-sm font-medium">Commercial Land</label>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="has_road_frontage" className="rounded" {...register("has_road_frontage")} />
              <label htmlFor="has_road_frontage" className="text-sm font-medium">Has Road Frontage</label>
            </div>

            {hasRoadFrontage && (
              <Input label="Road Frontage Length (m)" type="number" step="0.1" {...register("road_frontage_length")} />
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : initialData ? "Update Parcel" : "Create Parcel"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
