# Calculator System Fixes - June 10, 2025

## Overview
Fixed critical issues with the Units Avoided Calculator, Money Saved Modal, and Time Saved Modal for all nicotine product types, with special focus on chew/dip calculations.

## Issues Fixed

### 1. Chew/Dip Portions Confusion
**Problem**: 
- Onboarding asked for "tins per day" but calculator showed confusing "portions" conversion
- Example: User entered 1 tin/day, calculator showed "0.70 tins/day = 3.5 portions/day"

**Solution**:
- Removed all portions calculations for chew/dip
- Everything now displays in tins only
- Clear, consistent units throughout

### 2. Decimal Input Support
**Problem**: 
- Calculator limited to whole numbers only (couldn't enter 1.5 tins)
- Used `parseInt()` which stripped decimal values

**Solution**:
- Increased `maxLength` to allow decimal input
- Changed all `parseInt()` to `parseFloat()`
- Added input validation for decimal values
- Display formatting with `.toFixed(1)` for clean decimals

### 3. Time Saved Modal Unit Names
**Problem**: 
- Showed generic "units avoided" instead of product-specific names
- Showed portions reference for chew/dip

**Solution**:
- Added `getUnitName()` function for proper unit names
- Shows "cigarettes", "pods", "pouches", or "tins" as appropriate
- Removed portions reference from chew/dip explanation

### 4. Cost Preservation Issues
**Problem**: 
- When updating quantity, cost per unit would reset to defaults ($10/pack, $8/tin, etc.)
- Cost changes in Money Saved Modal weren't syncing properly

**Solution**:
- All calculators now read from Redux state for latest data
- Preserve existing cost per unit when updating quantities
- Dashboard's `updateCustomDailyCost` now updates both auth and progress slices

### 5. Data Flow Between Components
**Problem**: 
- Updates in one modal didn't reflect in others
- Dashboard, Money Saved, and Time Saved showed different values

**Solution**:
- Added `updateUserProfile` action to progress slice for immediate updates
- All modals read from Redux stats
- Unified data flow ensures consistency

### 6. Incorrect Migration for Chew/Dip Users
**Problem**: 
- Migration assumed >2 tins meant weekly usage (converted 3 tins/day to 0.43 tins/day)
- Caused cascading calculation errors

**Solution**:
- Updated migration to only run for >7 tins (more reasonable threshold)
- Added automatic fix in Dashboard for affected users
- Fix sets correct values: 3 tins/day at $6/tin = $18/day

## Technical Changes

### Files Modified

1. **`mobile-app/src/components/dashboard/AvoidedCalculatorModal.tsx`**
   - Removed portions calculations
   - Added decimal input support
   - Fixed data persistence for all product types
   - Uses Redux state for current values

2. **`mobile-app/src/components/dashboard/MoneySavedModal.tsx`**
   - Uses stats from Redux instead of local calculations
   - Shows cost per unit correctly
   - Preserves cost when quantity changes

3. **`mobile-app/src/components/dashboard/TimeSavedModal.tsx`**
   - Added proper unit name display
   - Updated time calculations for all products
   - Removed portions reference

4. **`mobile-app/src/store/slices/progressSlice.ts`**
   - Added `updateUserProfile` action for immediate updates
   - Fixed chew/dip calculations (no portions conversion)
   - Updated time per unit for chew/dip (40 min/tin)

5. **`mobile-app/src/screens/dashboard/DashboardScreen.tsx`**
   - Enhanced `updateCustomDailyCost` to update Redux
   - Added automatic fix for incorrectly migrated chew/dip data
   - Imports `updateUserData` from auth slice

6. **`mobile-app/src/utils/chewDipMigration.ts`**
   - Updated threshold from >2 to >7 tins for migration
   - Added `resetChewDipDailyAmount` function for manual fixes

## User Experience Improvements

### Before:
- Confusing portions display for chew/dip
- No decimal support
- Cost resets when changing quantity
- Inconsistent data between modals

### After:
- Clear tin-based display for chew/dip
- Full decimal support (1.5 tins, etc.)
- Cost per unit preserved
- All modals show consistent data
- Automatic fix for migration issues

## Testing Checklist
- [x] Chew/dip shows tins only (no portions)
- [x] Can enter decimal values (1.5 tins)
- [x] Cost per unit preserved when updating quantity
- [x] All modals show same values
- [x] Time saved shows proper unit names
- [x] Dashboard updates immediately
- [x] Migration fix works for affected users 