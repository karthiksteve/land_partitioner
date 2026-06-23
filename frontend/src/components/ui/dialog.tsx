"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function Dialog({
  open,
  onClose,
  children,
  title,
  className,
}: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-50 w-full max-w-lg rounded-lg border border-gov-border bg-white shadow-gov-lg",
          className
        )}
      >
        <div className="flex items-center justify-between border-b border-gov-border px-6 py-4">
          {title && (
            <h2 className="text-lg font-semibold text-gov-text-dark">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="ml-auto rounded-md p-1 text-gov-text-light hover:bg-gov-gray hover:text-gov-text-dark"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}
