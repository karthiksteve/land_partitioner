"use client";

import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { RULE_109_DESCRIPTIONS } from "@/lib/constants";

interface ComplianceBadgeProps {
  rule: string;
  status: "compliant" | "partial" | "violated";
  details?: string;
  suggestions?: string[];
}

const statusConfig = {
  compliant: {
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-50 border-green-200 dark:bg-green-950",
    label: "Compliant",
  },
  partial: {
    icon: AlertTriangle,
    color: "text-yellow-500",
    bg: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950",
    label: "Partial",
  },
  violated: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50 border-red-200 dark:bg-red-950",
    label: "Violated",
  },
};

export function ComplianceBadge({ rule, status, details, suggestions }: ComplianceBadgeProps) {
  const [showDetails, setShowDetails] = useState(false);
  const config = statusConfig[status];
  const Icon = config.icon;
  const description = RULE_109_DESCRIPTIONS[rule] || "";

  return (
    <div className="space-y-1">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 text-left w-full"
      >
        <Icon className={cn("h-4 w-4", config.color)} />
        <span className="text-sm font-medium">{rule}</span>
        <Badge
          variant={
            status === "compliant"
              ? "success"
              : status === "partial"
              ? "warning"
              : "destructive"
          }
          className="ml-auto"
        >
          {config.label}
        </Badge>
      </button>

      {showDetails && (
        <div className={cn("ml-6 rounded-lg border p-3 text-sm", config.bg)}>
          <p className="text-muted-foreground mb-1">{description}</p>
          {details && <p className="mb-2">{details}</p>}
          {suggestions && suggestions.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Suggestions:</p>
              {suggestions.map((s, i) => (
                <p key={i} className="text-xs text-muted-foreground">• {s}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
