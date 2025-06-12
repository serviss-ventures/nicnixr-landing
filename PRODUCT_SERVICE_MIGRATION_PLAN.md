# Product Service Migration Plan

## Overview
Complete refactoring of product-related logic to fix the issues:
1. Nicotine Pouches showing as "Nicotine Product" 
2. Generic "units" terminology instead of product-specific terms
3. "Cost per unit" instead of "cost per tin" for pouches

## New Architecture

### 1. Single Source of Truth: `productService.ts`
- **Location**: `/services/productService.ts`
- **Purpose**: Centralized product logic to ensure consistency
- **Key Functions**:
  - `getProductType()`: Normalizes all product variations
  - `getProductInfo()`: Returns complete product configuration
  - `getDailyUnits()`: Gets daily consumption in units
  - `formatUnitsDisplay()`: Formats display with proper units
  - `calculateTimeSaved()`: Calculates time saved
  - `getCostPerPackage()`: Gets cost per package (pack/tin/pod)

### 2. Product Types
- `cigarettes`: 20 per pack, 7 min each
- `vape`: 1 pod = 1 unit, 60 min each
- `pouches`: 15 per tin, 30 min each (NEVER "Nicotine Product")
- `chewing`: 1 tin = 1 unit, 40 min each

## Migration Status

### ✅ Completed
1. Created new `productService.ts`
2. Updated `AvoidedCalculatorModal` to use productService
3. Updated `MoneySavedModal` to use productService
4. Updated `DashboardScreen` to use productService
5. Removed old utilities (`nicotineProducts.ts`, most of `costCalculations.ts`)

### 🔄 In Progress
1. Testing all product types thoroughly
2. Fixing any remaining "Nicotine Product" displays
3. Ensuring cost inputs match how users buy products

### 📋 TODO
1. Update `TimeSavedModal` if needed
2. Update progress tracking to use productService
3. Test onboarding flow with all product types
4. Remove any remaining references to old utilities

## Key Fixes

### 1. Pouches Recognition
- Special handling for Zyn (id: 'zyn')
- Legacy "other" category now maps to pouches
- Always shows "Nicotine Pouches" not "Nicotine Product"

### 2. Proper Unit Display
- Dashboard shows "pouches" not "units"
- Calculator shows "40 pouches consumed" not "40 daily units consumed"
- Time saved shows "pods avoided" not "units avoided"

### 3. Cost Per Package
- Money saved shows "UPDATE YOUR COST PER TIN" for pouches
- Cigarettes: "UPDATE YOUR COST PER PACK"
- Vape: "UPDATE YOUR COST PER POD"
- Chew/Dip: "UPDATE YOUR COST PER TIN"

## Testing Checklist

### Cigarettes
- [ ] Shows "cigarettes" on dashboard
- [ ] Calculator shows "cigarettes" 
- [ ] Money modal shows "cost per pack"
- [ ] Time saved shows "cigarettes avoided"

### Vape
- [ ] Shows "pods" on dashboard
- [ ] Calculator shows "pods"
- [ ] Money modal shows "cost per pod"
- [ ] Time saved shows "pods avoided"

### Nicotine Pouches
- [ ] Shows "pouches" on dashboard (NOT "units")
- [ ] Calculator shows "Nicotine Pouches" (NOT "Nicotine Product")
- [ ] Money modal shows "cost per tin"
- [ ] Time saved shows "pouches avoided"

### Chew/Dip
- [ ] Shows "tins" on dashboard
- [ ] Calculator shows "Dip/Chew"
- [ ] Money modal shows "cost per tin"
- [ ] Time saved shows "tins avoided"

## Benefits
1. **Consistency**: One service = one truth
2. **Clarity**: No more generic "units" or "Nicotine Product"
3. **Accuracy**: Cost inputs match real-world purchasing
4. **Maintainability**: Easy to add new products or modify existing ones 