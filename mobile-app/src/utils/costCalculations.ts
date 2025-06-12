/**
 * Cost calculation utilities
 * Only contains functions not moved to productService
 */

export function formatCost(amount: number): string {
  return `$${Math.round(amount)}`;
}

export function calculateCostProjections(dailyCost: number) {
  return {
    yearly: dailyCost * 365,
    fiveYears: dailyCost * 365 * 5,
    tenYears: dailyCost * 365 * 10,
  };
} 