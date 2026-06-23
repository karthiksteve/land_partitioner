"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { BIHAR_DISTRICTS } from "@/lib/constants";
import { validatePlotNumber } from "@/utils";
import { Search } from "lucide-react";

interface ParcelSearchFormProps {
  onSearch: (data: {
    district: string;
    circle?: string;
    mouza?: string;
    plot_number?: string;
  }) => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function ParcelSearchForm({
  onSearch,
  isLoading = false,
  error = null,
}: ParcelSearchFormProps) {
  const [district, setDistrict] = useState("");
  const [circle, setCircle] = useState("");
  const [mouza, setMouza] = useState("");
  const [plotNumber, setPlotNumber] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const districtOptions = BIHAR_DISTRICTS.map((d) => ({
    value: d,
    label: d,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!district) {
      errors.district = "Please select a district";
    }
    if (!plotNumber) {
      errors.plot_number = "Please enter a plot number";
    } else if (!validatePlotNumber(plotNumber)) {
      errors.plot_number =
        "Plot number can only contain letters, numbers, hyphens, and slashes";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    onSearch({
      district,
      circle: circle || undefined,
      mouza: mouza || undefined,
      plot_number: plotNumber,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gov-text-dark mb-1">
            District <span className="text-red-500">*</span>
          </label>
          <Select
            options={districtOptions}
            placeholder="Select District"
            value={district}
            onChange={(e) => {
              setDistrict(e.target.value);
              setValidationErrors((prev) => ({ ...prev, district: "" }));
            }}
          />
          {validationErrors.district && (
            <p className="text-xs text-red-500 mt-1">
              {validationErrors.district}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gov-text-dark mb-1">
            Circle
          </label>
          <Input
            placeholder="Enter Circle (optional)"
            value={circle}
            onChange={(e) => setCircle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gov-text-dark mb-1">
            Mouza / Village
          </label>
          <Input
            placeholder="Enter Mouza (optional)"
            value={mouza}
            onChange={(e) => setMouza(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gov-text-dark mb-1">
            Plot Number <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Enter Plot Number"
            value={plotNumber}
            onChange={(e) => {
              setPlotNumber(e.target.value);
              setValidationErrors((prev) => ({ ...prev, plot_number: "" }));
            }}
          />
          {validationErrors.plot_number && (
            <p className="text-xs text-red-500 mt-1">
              {validationErrors.plot_number}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-center">
        <Button
          type="submit"
          variant="saffron"
          size="lg"
          disabled={isLoading}
          className="min-w-[200px]"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Searching BhuNaksha...
            </>
          ) : (
            <>
              <Search className="h-5 w-5 mr-2" />
              Search Parcel
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
