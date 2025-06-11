// Shared utilities for nicotine product calculations and details

export type ProductCategory = 'cigarettes' | 'vape' | 'pouches' | 'chewing' | 'other';

export interface ProductDetails {
  unit: string;
  unitPlural: string;
  perPackage: number;
  packageName: string;
  packageNamePlural: string;
  example: string;
  icon: string;
  perUnit?: number;
  unitDescription?: string;
}

/**
 * Get product-specific details for display and calculations
 */
export const getProductDetails = (category: string | undefined): ProductDetails => {
  switch (category?.toLowerCase()) {
    case 'cigarettes':
    case 'cigarette':
      return {
        unit: 'cigarette',
        unitPlural: 'cigarettes',
        perPackage: 20,
        packageName: 'pack',
        packageNamePlural: 'packs',
        example: '20 cigarettes = 1 pack',
        icon: 'flame',
        perUnit: 20,
        unitDescription: 'Pack of 20 cigarettes',
      };
      
    case 'vaping':
    case 'vape':
    case 'e-cigarette':
      return {
        unit: 'pod',
        unitPlural: 'pods',
        perPackage: 1,
        packageName: 'pod',
        packageNamePlural: 'pods',
        example: '1 pod per day',
        icon: 'water',
        perUnit: 1,
        unitDescription: 'Vape pod',
      };
      
    case 'pouches':
    case 'nicotine_pouches':
    case 'pouch':
      return {
        unit: 'pouch',
        unitPlural: 'pouches',
        perPackage: 15,
        packageName: 'tin',
        packageNamePlural: 'tins',
        example: '15 pouches = 1 tin',
        icon: 'cube',
        perUnit: 15,
        unitDescription: 'Tin of 15 pouches',
      };
      
    case 'chewing':
    case 'chew':
    case 'dip':
    case 'chew_dip':
      return {
        unit: 'tin',
        unitPlural: 'tins',
        perPackage: 1,
        packageName: 'tin',
        packageNamePlural: 'tins',
        example: 'Tins per day',
        icon: 'leaf',
        perUnit: 1,
        unitDescription: 'Tin of dip/chew',
      };
      
    default:
      return {
        unit: 'unit',
        unitPlural: 'units',
        perPackage: 1,
        packageName: 'unit',
        packageNamePlural: 'units',
        example: '1 unit per day',
        icon: 'help-circle',
        perUnit: 1,
        unitDescription: 'Unit',
      };
  }
};

/**
 * Normalize product category from various formats
 */
export const normalizeProductCategory = (
  userProfile: any
): ProductCategory => {
  // Get category from nicotineProduct or root level
  let category = userProfile?.nicotineProduct?.category || userProfile?.category || 'other';
  
  // Special handling for pouches - check ID first
  const productId = userProfile?.nicotineProduct?.id || userProfile?.id;
  if (productId === 'zyn') {
    return 'pouches';
  }
  
  // Check brand for pouches
  const productBrand = userProfile?.nicotineProduct?.brand || userProfile?.brand;
  if (productBrand) {
    const pouchBrands = ['zyn', 'velo', 'rogue', 'on!', 'lucy', 'lyft', 'nordic spirit'];
    if (pouchBrands.some(brand => productBrand.toLowerCase().includes(brand))) {
      return 'pouches';
    }
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
      return 'chewing';
      
    default:
      return 'other';
  }
};

/**
 * Get daily consumption in individual units (cigarettes, pouches, pods, tins)
 */
export const getDailyUnits = (
  userProfile: any,
  category: ProductCategory
): number => {
  switch (category) {
    case 'cigarettes':
      // Prefer dailyAmount if available, otherwise calculate from packs
      return userProfile?.dailyAmount || (userProfile?.packagesPerDay ? userProfile.packagesPerDay * 20 : 20);
    
    case 'pouches':
      // For pouches, dailyAmount is in pouches, tinsPerDay is in tins
      return userProfile?.dailyAmount || (userProfile?.tinsPerDay ? userProfile.tinsPerDay * 15 : 15);
    
    case 'vape':
      // For vape, pods per day
      return userProfile?.podsPerDay || 1;
    
    case 'chewing':
      // For chew/dip, dailyAmount is already in tins per day
      return userProfile?.dailyAmount || 1;
    
    default:
      return userProfile?.dailyAmount || 1;
  }
};

/**
 * Get daily consumption in packages (packs, tins, pods)
 */
export const getDailyPackages = (
  userProfile: any,
  category: ProductCategory
): number => {
  switch (category) {
    case 'cigarettes':
      return userProfile?.packagesPerDay || 1;
    
    case 'pouches':
      // If tinsPerDay is set, use it
      if (userProfile?.tinsPerDay !== undefined) {
        return userProfile.tinsPerDay;
      }
      // Otherwise calculate from dailyAmount (pouches per day)
      if (userProfile?.dailyAmount !== undefined) {
        return userProfile.dailyAmount / 15; // 15 pouches per tin
      }
      // Default fallback
      return 0.5;
    
    case 'vape':
      return userProfile?.podsPerDay || 1;
    
    case 'chewing':
      // For chew/dip, dailyAmount is already in tins
      return userProfile?.dailyAmount || 1;
    
    default:
      return userProfile?.dailyAmount || 1;
  }
};

/**
 * Convert units to packages based on product type
 */
export const unitsToPackages = (
  units: number,
  category: ProductCategory
): number => {
  const details = getProductDetails(category);
  return units / details.perPackage;
};

/**
 * Convert packages to units based on product type
 */
export const packagesToUnits = (
  packages: number,
  category: ProductCategory
): number => {
  const details = getProductDetails(category);
  return packages * details.perPackage;
}; 