import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gov-blue focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gov-blue text-white",
        saffron:
          "border-transparent bg-gov-saffron text-white",
        green:
          "border-transparent bg-gov-green text-white",
        secondary:
          "border-transparent bg-gov-gray-dark text-gov-text-dark",
        outline: "text-gov-text-dark border-gov-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
