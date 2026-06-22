import { COLORS, PLAN_COLORS } from "@/lib/constants";

const legendItems = [
  { label: "Original Parcel", color: COLORS.parcel_original },
  { label: "Existing Possession", color: COLORS.possession },
  { label: "Commercial Zone", color: COLORS.commercial },
  { label: "Road Frontage", color: COLORS.road_frontage },
  { label: "Plan A", color: PLAN_COLORS.A },
  { label: "Plan B", color: PLAN_COLORS.B },
  { label: "Plan C", color: PLAN_COLORS.C },
];

export function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] rounded-lg border bg-card p-3 shadow-lg">
      <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase">Legend</p>
      <div className="space-y-1.5">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-sm border border-gray-300"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
