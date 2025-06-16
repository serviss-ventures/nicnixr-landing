import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { SubstanceType } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Helper function to get display name for substance types
export function getSubstanceDisplayName(substance: SubstanceType): string {
  const displayNames: Record<SubstanceType, string> = {
    [SubstanceType.CIGARETTES]: "Cigarettes",
    [SubstanceType.VAPE]: "Vape",
    [SubstanceType.NICOTINE_POUCHES]: "Nicotine Pouches",
    [SubstanceType.CHEW_DIP]: "Chew/Dip",
  };
  
  return displayNames[substance] || substance;
}

// Helper function to get substance icon/emoji
export function getSubstanceIcon(substance: SubstanceType): string {
  const icons: Record<SubstanceType, string> = {
    [SubstanceType.CIGARETTES]: "🚬",
    [SubstanceType.VAPE]: "💨",
    [SubstanceType.NICOTINE_POUCHES]: "🟦",
    [SubstanceType.CHEW_DIP]: "🟫",
  };
  
  return icons[substance] || "📦";
}

// Helper function to get substance color for charts
export function getSubstanceColor(substance: SubstanceType): string {
  const colors: Record<SubstanceType, string> = {
    [SubstanceType.CIGARETTES]: "#EF4444", // Red
    [SubstanceType.VAPE]: "#8B5CF6", // Purple
    [SubstanceType.NICOTINE_POUCHES]: "#3B82F6", // Blue
    [SubstanceType.CHEW_DIP]: "#A16207", // Brown
  };
  
  return colors[substance] || "#6B7280";
} 