// Cost calculation utilities for nicotine products

import { ProductCategory } from './nicotineProducts';

/**
 * Default costs per package for each product type
 */
export const DEFAULT_COSTS = {
  cigarettes: 10,  // per pack
  vape: 15,         // per pod
  pouches: 8,       // per tin
  chewing: 10,      // per tin
  other: 10         // per unit
};

/**
 * Calculate cost per package (pack/tin/pod) from daily cost and daily packages
 */
export const calculateCostPerPackage = (
  dailyCost: number,
  dailyPackages: number,
  productCategory: ProductCategory
): number => {
  if (dailyPackages <= 0) {
    return DEFAULT_COSTS[productCategory] || DEFAULT_COSTS.other;
  }
  return dailyCost / dailyPackages;
};

/**
 * Calculate daily cost from packages per day and cost per package
 */
export const calculateDailyCost = (
  packagesPerDay: number,
  costPerPackage: number
): number => {
  return packagesPerDay * costPerPackage;
};

/**
 * Calculate cost projections for different time periods
 */
export const calculateCostProjections = (dailyCost: number) => {
  return {
    weekly: dailyCost * 7,
    monthly: dailyCost * 30,
    yearly: dailyCost * 365,
    fiveYears: dailyCost * 365 * 5,
    tenYears: dailyCost * 365 * 10
  };
};

/**
 * Format cost for display (handles large numbers)
 */
export const formatCost = (amount: number): string => {
  if (amount >= 10000) {
    return `$${Math.round(amount / 1000)}k`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  } else {
    return `$${Math.round(amount)}`;
  }
};

/**
 * Get existing cost per package from current user data
 */
export const getExistingCostPerPackage = (
  userProfile: any,
  productCategory: ProductCategory
): number => {
  const dailyCost = userProfile?.dailyCost || DEFAULT_COSTS[productCategory];
  
  switch (productCategory) {
    case 'cigarettes':
      const packagesPerDay = userProfile?.packagesPerDay || 1;
      return calculateCostPerPackage(dailyCost, packagesPerDay, productCategory);
      
    case 'pouches':
      const tinsPerDay = userProfile?.tinsPerDay || 
        (userProfile?.dailyAmount ? userProfile.dailyAmount / 15 : 0.5);
      return calculateCostPerPackage(dailyCost, tinsPerDay, productCategory);
      
    case 'vape':
      const podsPerDay = userProfile?.podsPerDay || 1;
      return calculateCostPerPackage(dailyCost, podsPerDay, productCategory);
      
    case 'chewing':
      const dailyAmount = userProfile?.dailyAmount || 1;
      return calculateCostPerPackage(dailyCost, dailyAmount, productCategory);
      
    default:
      return DEFAULT_COSTS.other;
  }
};

/**
 * Calculate new daily cost when daily amount changes
 */
export const calculateNewDailyCost = (
  newDailyUnits: number,
  userProfile: any,
  productCategory: ProductCategory
): number => {
  const costPerPackage = getExistingCostPerPackage(userProfile, productCategory);
  
  switch (productCategory) {
    case 'cigarettes':
      const packsPerDay = newDailyUnits / 20;
      return calculateDailyCost(packsPerDay, costPerPackage);
      
    case 'pouches':
      const tinsPerDay = newDailyUnits / 15;
      return calculateDailyCost(tinsPerDay, costPerPackage);
      
    case 'vape':
      // For vape, units are already pods
      return calculateDailyCost(newDailyUnits, costPerPackage);
      
    case 'chewing':
      // For chew/dip, units are already tins
      return calculateDailyCost(newDailyUnits, costPerPackage);
      
    default:
      return calculateDailyCost(newDailyUnits, costPerPackage);
  }
}; 