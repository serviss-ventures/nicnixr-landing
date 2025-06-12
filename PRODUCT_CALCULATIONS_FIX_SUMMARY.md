# Product Calculations Fix Summary

## Issue
Chew/Dip users who entered 1 tin per day during onboarding were seeing 3 tins per day on their dashboard, resulting in incorrect calculations (9 tins after 3 days instead of 3).

## Root Cause
1. **Hardcoded migration** in `DashboardScreen.tsx` was forcing chew/dip users to 3 tins per day if their daily cost was less than $10
2. **Inconsistent calculations** throughout the codebase - different files were calculating daily amounts differently
3. **No single source of truth** for product-specific calculations

## Solution

### 1. Removed Hardcoded Migration
- Deleted the problematic migration in `DashboardScreen.tsx` that was overriding user-entered values

### 2. Created Centralized Product Calculations
- Created `productCalculations.ts` as the single source of truth for all product calculations
- Standardized product configurations:
  - **Cigarettes**: 20 per pack, 7 min/cigarette
  - **Vape**: 1 pod = 1 unit, 60 min/pod
  - **Nicotine Pouches**: 15 per tin, 30 min/pouch
  - **Chew/Dip**: 1 tin = 1 unit, 40 min/tin

### 3. Updated Progress Tracking
- Modified `progressSlice.ts` to use `getDailyAmountInUnits()` from the centralized utility
- Ensures consistent calculations across the entire app

### 4. Key Functions in productCalculations.ts
- `normalizeProductCategory()`: Handles all variations of product names
- `getDailyAmountInUnits()`: Returns the correct daily amount based on product type
- `calculateUnitsAvoidedDisplay()`: Formats the display (e.g., "3 tins" vs "45 pouches")
- `calculateTimeSaved()`: Calculates time saved based on product-specific usage patterns

## Testing
Created `testProductCalculations.ts` to verify all calculations work correctly for:
- Cigarettes (packs)
- Vape (pods)
- Nicotine Pouches (individual pouches converted to tins for display)
- Chew/Dip (tins)

## Data Flow
1. **Onboarding**: User enters daily amount (e.g., 1 tin per day for chew/dip)
2. **Storage**: Saved as `dailyAmount: 1` and `tinsPerDay: 1` in user profile
3. **Progress Tracking**: Uses `getDailyAmountInUnits()` to get the correct value
4. **Display**: Shows "3 tins" after 3 days (not 9)

## Benefits
- Single source of truth prevents future inconsistencies
- Easy to add new product types
- Consistent calculations throughout the app
- Clear separation between storage units and display units 