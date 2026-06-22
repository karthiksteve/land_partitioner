import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

export function formatArea(area: number, unit: string = "sqm"): string {
  if (unit === "hectare" || unit === "ha") {
    return `${(area / 10000).toFixed(2)} ha`;
  }
  if (unit === "acre") {
    return `${(area / 4046.86).toFixed(2)} acres`;
  }
  return `${area.toFixed(2)} sq.m`;
}

export function truncate(str: string, length: number = 50): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + "...";
}
