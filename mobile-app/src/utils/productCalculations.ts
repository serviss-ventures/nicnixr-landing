/**
 * Centralized product calculations utility
 * This is the SINGLE SOURCE OF TRUTH for all product-specific calculations
 */

export type ProductCategory = 'cigarettes' | 'vape' | 'pouches' | 'chewing';

interface ProductConfig {
  displayName: string;
  unitName: string;
  unitNamePlural: string;
  packageName: string;
  packageNamePlural: string;
  unitsPerPackage: number;
  minutesPerUnit: number;
  icon: string;
  color: string;
  description: string;
}

// SINGLE SOURCE OF TRUTH for product configurations
const PRODUCT_CONFIGS: Record<ProductCategory, ProductConfig> = {
  cigarettes: {
    displayName: 'Cigarettes',
    unitName: 'cigarette',
    unitNamePlural: 'cigarettes',
    packageName: 'pack',
    packageNamePlural: 'packs',
    unitsPerPackage: 20,
    minutesPerUnit: 7,
    icon: 'flame',
    color: '#EF4444',
    description: 'Average time to smoke one cigarette',
  },
  vape: {
    displayName: 'Vape',
    unitName: 'pod',
    unitNamePlural: 'pods',
    packageName: 'pod',
    packageNamePlural: 'pods',
    unitsPerPackage: 1,
    minutesPerUnit: 60,
    icon: 'water',
    color: '#3B82F6',
    description: 'Total daily vaping time per pod',
  },
  pouches: {
    displayName: 'Nicotine Pouches',
    unitName: 'pouch',
    unitNamePlural: 'pouches',
    packageName: 'tin',
    packageNamePlural: 'tins',
    unitsPerPackage: 15,
    minutesPerUnit: 30,
    icon: 'cube',
    color: '#10B981',
    description: 'Average time a pouch is kept in',
  },
  chewing: {
    displayName: 'Dip/Chew',
    unitName: 'tin',
    unitNamePlural: 'tins',
    packageName: 'tin',
    packageNamePlural: 'tins',
    unitsPerPackage: 1,
    minutesPerUnit: 40,
    icon: 'leaf',
    color: '#F59E0B',
    description: 'Average time per tin',
  },
};

/**
 * Normalize product category from various sources
 */
export function normalizeProductCategory(
  userProfile: any
): ProductCategory {
  // Get category from various possible locations
  const category = userProfile?.category || 
                  userProfile?.nicotineProduct?.category || 
                  userProfile?.productType || 
                  'pouches'; // Default to pouches instead of 'other'
  
  // Special handling for pouches by ID
  const productId = userProfile?.nicotineProduct?.id || userProfile?.id;
  if (productId === 'zyn') {
    return 'pouches';
  }
  
  // Normalize variations
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
      return 'pouches';
      
    case 'chewing':
    case 'chew':
    case 'dip':
    case 'chew_dip':
    case 'dip_chew':
      return 'chewing';
      
    case 'other': // Map legacy 'other' to pouches
      return 'pouches';
      
    default:
      return 'pouches'; // Default to pouches
  }
}

/**
 * Get product configuration
 */
export function getProductConfig(userProfile: any): ProductConfig {
  const category = normalizeProductCategory(userProfile);
  return PRODUCT_CONFIGS[category];
}

/**
 * Calculate units avoided display (what to show on dashboard)
 */
export function calculateUnitsAvoidedDisplay(
  unitsAvoided: number,
  userProfile: any
): { value: number; unit: string } {
  const config = getProductConfig(userProfile);
  
  // For products with packages, show packages if >= 1
  if (config.unitsPerPackage > 1) {
    const packages = unitsAvoided / config.unitsPerPackage;
    if (packages >= 1) {
      const displayValue = packages % 1 === 0 ? packages : Number(packages.toFixed(1));
      return {
        value: displayValue,
        unit: displayValue === 1 ? config.packageName : config.packageNamePlural,
      };
    }
  }
  
  // Otherwise show individual units
  const displayValue = unitsAvoided % 1 === 0 ? unitsAvoided : Number(unitsAvoided.toFixed(1));
  return {
    value: displayValue,
    unit: displayValue === 1 ? config.unitName : config.unitNamePlural,
  };
}

/**
 * Calculate time saved (in hours)
 */
export function calculateTimeSaved(
  unitsAvoided: number,
  userProfile: any
): number {
  const config = getProductConfig(userProfile);
  const totalMinutes = unitsAvoided * config.minutesPerUnit;
  return totalMinutes / 60; // Return hours
}

/**
 * Get daily amount in units (for progress calculations)
 */
export function getDailyAmountInUnits(userProfile: any): number {
  const category = normalizeProductCategory(userProfile);
  
  switch (category) {
    case 'cigarettes':
      // Convert packs to cigarettes if needed
      if (userProfile?.packagesPerDay) {
        return userProfile.packagesPerDay * 20;
      }
      return userProfile?.dailyAmount || 20;
      
    case 'vape':
      return userProfile?.podsPerDay || userProfile?.dailyAmount || 1;
      
    case 'pouches':
      // Always store as individual pouches
      if (userProfile?.tinsPerDay) {
        return userProfile.tinsPerDay * 15;
      }
      return userProfile?.dailyAmount || 10;
      
    case 'chewing':
      // Store as tins
      return userProfile?.dailyAmount || userProfile?.tinsPerDay || 1;
      
    default:
      return userProfile?.dailyAmount || 1;
  }
}

/**
 * Format time for display
 */
export function formatTimeSaved(totalMinutes: number): {
  display: string;
  days: number;
  hours: number;
  minutes: number;
} {
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const mins = Math.floor(totalMinutes % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0 || parts.length === 0) parts.push(`${mins}m`);
  
  return {
    display: parts.join(' '),
    days,
    hours,
    minutes: mins,
  };
} 