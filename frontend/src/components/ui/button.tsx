"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gov-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gov-blue text-white hover:bg-gov-blue-dark shadow-gov",
        saffron: "bg-gov-saffron text-white hover:bg-gov-saffron-dark shadow-gov",
        green: "bg-gov-green text-white hover:bg-gov-green-dark shadow-gov",
        outline:
          "border border-gov-border bg-white text-gov-text-dark hover:bg-gov-gray shadow-gov",
        ghost: "text-gov-text-dark hover:bg-gov-gray",
        link: "text-gov-blue underline-offset-4 hover:underline",
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-gov",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        xl: "h-14 rounded-lg px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
