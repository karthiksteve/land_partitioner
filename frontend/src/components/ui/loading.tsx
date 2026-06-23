"use client";

import { cn } from "@/lib/utils";

interface LoadingProps {
  message?: string;
  fullPage?: boolean;
  className?: string;
}

export function Loading({
  message = "Loading...",
  fullPage = false,
  className,
}: LoadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        fullPage && "fixed inset-0 z-50 bg-white/80",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gov-blue border-t-transparent" />
        <span className="text-sm font-medium text-gov-text-dark">
          {message}
        </span>
      </div>
    </div>
  );
}
