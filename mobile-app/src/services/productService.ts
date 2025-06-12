/**
 * Product Service - Single Source of Truth
 * 
 * This service handles all product-related logic to ensure consistency
 * across the entire app. No more "Nicotine Product" or "units" confusion.
 */

export type ProductType = 'cigarettes' | 'vape' | 'pouches' | 'chewing';

interface ProductInfo {
  id: ProductType;
  displayName: string;
  singularUnit: string;
  pluralUnit: string;
  packageName: string;
  packageNamePlural: string;
  unitsPerPackage: number;
  icon: string;
  color: string;
  timePerUnit: number; // minutes
  defaultDailyUnits: number;
  defaultCostPerPackage: number;
}

// Product configurations - simple and clear
const PRODUCTS: Record<ProductType, ProductInfo> = {
  cigarettes: {
    id: 'cigarettes',
    displayName: 'Cigarettes',
    singularUnit: 'cigarette',
    pluralUnit: 'cigarettes',
    packageName: 'pack',
    packageNamePlural: 'packs',
    unitsPerPackage: 20,
    icon: 'flame',
    color: '#EF4444',
    timePerUnit: 7,
    defaultDailyUnits: 20,
    defaultCostPerPackage: 10,
  },
  vape: {
    id: 'vape',
    displayName: 'Vape',
    singularUnit: 'pod',
    pluralUnit: 'pods',
    packageName: 'pod',
    packageNamePlural: 'pods',
    unitsPerPackage: 1,
    icon: 'water',
    color: '#3B82F6',
    timePerUnit: 60,
    defaultDailyUnits: 1,
    defaultCostPerPackage: 8,
  },
  pouches: {
    id: 'pouches',
    displayName: 'Nicotine Pouches',
    singularUnit: 'pouch',
    pluralUnit: 'pouches',
    packageName: 'tin',
    packageNamePlural: 'tins',
    unitsPerPackage: 15,
    icon: 'cube',
    color: '#10B981',
    timePerUnit: 30,
    defaultDailyUnits: 10,
    defaultCostPerPackage: 5,
  },
  chewing: {
    id: 'chewing',
    displayName: 'Dip/Chew',
    singularUnit: 'tin',
    pluralUnit: 'tins',
    packageName: 'tin',
    packageNamePlural: 'tins',
    unitsPerPackage: 1,
    icon: 'leaf',
    color: '#F59E0B',
    timePerUnit: 40,
    defaultDailyUnits: 1,
    defaultCostPerPackage: 6,
  },
};

/**
 * Get product type from user profile
 * This is the ONLY place where we normalize product categories
 */
export function getProductType(userProfile: any): ProductType {
  // Check various possible locations for category
  const category = userProfile?.nicotineProduct?.category || 
                  userProfile?.category || 
                  userProfile?.productType;
  
  // Check product ID for special cases
  const productId = userProfile?.nicotineProduct?.id || userProfile?.id;
  
  // Normalize Zyn and other pouch brands
  if (productId === 'zyn' || productId === 'nicotine_pouches') {
    return 'pouches';
  }
  
  // Normalize category variations
  switch (category?.toLowerCase()) {
    case 'cigarettes':
    case 'cigarette':
      return 'cigarettes';
      
    case 'vaping':
    case 'vape':
    case 'e-cigarette':
      return 'vape';
      
    case 'pouches':
    case 'nicotine_pouches':
    case 'pouch':
    case 'other': // Handle legacy "other" category - always map to pouches
    case 'zyn':
      return 'pouches';
      
    case 'chewing':
    case 'chew':
    case 'dip':
    case 'chew_dip':
    case 'dip_chew':
      return 'chewing';
      
    default:
      // Default to pouches for any unknown type (safest option)
      return 'pouches';
  }
}

/**
 * Get product info
 */
export function getProductInfo(userProfile: any): ProductInfo {
  const productType = getProductType(userProfile);
  return PRODUCTS[productType];
}

/**
 * Get daily units consumed
 */
export function getDailyUnits(userProfile: any): number {
  const productType = getProductType(userProfile);
  
  switch (productType) {
    case 'cigarettes':
      // Check for dailyAmount first, then calculate from packs
      if (userProfile?.dailyAmount !== undefined) {
        return userProfile.dailyAmount;
      }
      if (userProfile?.packagesPerDay !== undefined) {
        return userProfile.packagesPerDay * 20;
      }
      return 20; // default 1 pack
      
    case 'vape':
      return userProfile?.podsPerDay || userProfile?.dailyAmount || 1;
      
    case 'pouches':
      // For pouches, dailyAmount is in individual pouches
      return userProfile?.dailyAmount || 10;
      
    case 'chewing':
      // For chew/dip, dailyAmount is in tins
      return userProfile?.dailyAmount || userProfile?.tinsPerDay || 1;
      
    default:
      return 1;
  }
}

/**
 * Get daily packages (packs/tins/pods)
 */
export function getDailyPackages(userProfile: any): number {
  const productType = getProductType(userProfile);
  const productInfo = PRODUCTS[productType];
  const dailyUnits = getDailyUnits(userProfile);
  
  return dailyUnits / productInfo.unitsPerPackage;
}

/**
 * Format units for display
 */
export function formatUnitsDisplay(units: number, userProfile: any): string {
  const productInfo = getProductInfo(userProfile);
  
  // For products with packages, show packages if >= 1
  if (productInfo.unitsPerPackage > 1) {
    const packages = units / productInfo.unitsPerPackage;
    if (packages >= 1) {
      const roundedPackages = packages % 1 === 0 ? packages : Number(packages.toFixed(1));
      return `${roundedPackages} ${roundedPackages === 1 ? productInfo.packageName : productInfo.packageNamePlural}`;
    }
  }
  
  // Otherwise show individual units
  const roundedUnits = units % 1 === 0 ? units : Number(units.toFixed(1));
  return `${roundedUnits} ${roundedUnits === 1 ? productInfo.singularUnit : productInfo.pluralUnit}`;
}

/**
 * Calculate time saved
 */
export function calculateTimeSaved(units: number, userProfile: any): number {
  const productInfo = getProductInfo(userProfile);
  const totalMinutes = units * productInfo.timePerUnit;
  return totalMinutes / 60; // Return hours
}

/**
 * Get cost per package for display
 */
export function getCostPerPackage(dailyCost: number, userProfile: any): number {
  const dailyPackages = getDailyPackages(userProfile);
  return dailyPackages > 0 ? dailyCost / dailyPackages : 10;
}

/**
 * Calculate daily cost from package cost
 */
export function calculateDailyCost(packageCost: number, userProfile: any): number {
  const dailyPackages = getDailyPackages(userProfile);
  return packageCost * dailyPackages;
} 