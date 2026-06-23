"use client";

export default function MapLegend() {
  return (
    <div className="bg-white rounded-md border border-gov-border shadow-gov p-3 text-xs">
      <h4 className="font-semibold text-gov-text-dark mb-2 text-sm">
        Map Legend
      </h4>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-[#ff4444]" />
          <span className="text-gov-text-dark">Parcel Boundary</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-3 bg-[rgba(255,68,68,0.2)] border border-[#ff4444] rounded" />
          <span className="text-gov-text-dark">Parcel Area</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#ff4444]" />
          <span className="text-gov-text-dark">Boundary Vertex</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-blue-500" />
          <span className="text-gov-text-dark">District Boundary</span>
        </div>
      </div>
    </div>
  );
}
