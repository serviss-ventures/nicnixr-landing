# Nicotine Pouches Calculator Fix
**Date:** January 15, 2025

## Issue
User reported that when clicking "units avoided calculator", it shows their product as "OTHER" even though they signed up with the nicotine pouches flow.

## Root Cause
The `normalizeProductCategory` function in `nicotineProducts.ts` was not properly detecting nicotine pouches because:
1. It was checking for `category === 'other' && productId === 'zyn'` (both conditions)
2. The onboarding flow saves pouches with `category: 'pouches'` and `id: 'zyn'`
3. The function was not returning early when detecting pouches by ID

## Fix Applied

### 1. Updated `normalizeProductCategory` function:
- Changed to check for `productId === 'zyn'` independently (not requiring category to be 'other')
- Returns 'pouches' immediately when 'zyn' ID is detected
- Also returns 'pouches' immediately when pouch brands are detected

### 2. Updated Dashboard `getAvoidedDisplay`:
- Changed condition from `category === 'other' && productId === 'zyn'` to `productId === 'zyn' || category === 'pouches'`
- Now properly detects pouches by either ID or category

### 3. Updated AvoidedCalculatorModal display:
- Added special handling to show "Nicotine Pouches" instead of "Other"
- Falls back to "Nicotine Product" for truly unknown products

## Technical Details
- The user data structure has nicotineProduct nested: `user.nicotineProduct.category` and `user.nicotineProduct.id`
- The calculator now properly handles both legacy data (pouches as 'other') and new data (pouches as 'pouches')
- No data migration needed - the fix handles both formats

## Files Modified
1. `mobile-app/src/utils/nicotineProducts.ts` - Fixed normalization logic
2. `mobile-app/src/screens/dashboard/DashboardScreen.tsx` - Fixed display logic
3. `mobile-app/src/components/dashboard/AvoidedCalculatorModal.tsx` - Fixed product name display

## Result
The units avoided calculator now correctly shows:
- Product: "Nicotine Pouches" (not "OTHER")
- Proper calculations for pouches (15 pouches = 1 tin)
- Consistent behavior across the app 