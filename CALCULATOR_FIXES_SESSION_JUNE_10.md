# Calculator System Fixes - June 10, 2025

## Session Summary
Fixed multiple calculation issues in the NixR mobile app's home page components, specifically for nicotine pouches, chew/dip products, and overall calculator consistency.

## Major Issues Fixed

### 1. Chew/Dip Portions Confusion
**Problem**: User input of 1 tin/day was showing as "0.70 tins/day = 3.5 portions/day" in the calculator.

**Solution**: 
- Removed all portions calculations for chew/dip products
- Simplified to show only tins as the unit of measurement
- Fixed migration logic to properly convert weekly tins to daily tins

**Files Modified**:
- `mobile-app/src/screens/dashboard/DashboardScreen.tsx` - Updated getAvoidedDisplay logic
- `mobile-app/src/store/slices/progressSlice.ts` - Fixed portions removal

### 2. Decimal Input Limitation
**Problem**: Users couldn't enter decimal values (e.g., 0.43 tins/day) in the Avoided Calculator.

**Solution**: 
- Implemented proper decimal input handling
- Added validation for single decimal point
- Limited to 2 decimal places for precision
- Removed integer-only restriction

**Files Modified**:
- `mobile-app/src/components/dashboard/AvoidedCalculatorModal.tsx` - Updated TextInput validation

### 3. Nicotine Pouches Data Flow Issues
**Problem**: 
- Money Saved Modal showing incorrect tins/day (0.5 instead of actual value)
- Cost per tin being incorrectly calculated
- Data not syncing between modals

**Root Cause**: 
- Dashboard was passing `user?.nicotineProduct` to modals, but `tinsPerDay` is stored at root user level
- Modals were reading stale props data instead of updated Redux state

**Solution**:
1. Updated Dashboard to pass full `user` object to all modals
2. Added Redux selectors to MoneySavedModal to get real-time data
3. Fixed category detection to check both `nicotineProduct.category` and root `category`
4. Corrected getDailyAmount logic for pouches to use `tinsPerDay`

**Files Modified**:
- `mobile-app/src/screens/dashboard/DashboardScreen.tsx` - Changed userProfile prop
- `mobile-app/src/components/dashboard/MoneySavedModal.tsx` - Added Redux integration
- `mobile-app/src/components/dashboard/AvoidedCalculatorModal.tsx` - Updated interface
- `mobile-app/src/store/slices/progressSlice.ts` - Fixed pouches calculations

### 4. Life Regained Calculation for Pouches
**Problem**: Life regained was calculating incorrectly when units avoided changed from pouches to tins.

**Solution**: 
- Updated minutesPerUnit for pouches from 3 to 45 (15 pouches/tin × 3 minutes/pouch)
- This ensures correct calculation when unitsAvoided shows tins

**Files Modified**:
- `mobile-app/src/store/slices/progressSlice.ts` - All three calculation locations

## Technical Details

### Data Structure for Pouches:
- `dailyAmount`: Stores individual pouches (e.g., 15)
- `tinsPerDay`: Stores tins per day (e.g., 1.0)
- Units avoided: Shows tins
- Money saved: Calculates based on tins × cost per tin
- Life regained: Calculates based on tins × 45 minutes per tin

### TypeScript Interface Updates:
Added `nicotineProduct` optional property to userProfile interfaces in both modals:
```typescript
nicotineProduct?: {
  category?: string;
  id?: string;
  brand?: string;
};
```

### Redux Integration:
MoneySavedModal now uses:
```typescript
const reduxUser = useSelector(selectUser);
const currentUserProfile = reduxUser || userProfile;
```

## Testing Scenarios

1. **Pouches Flow**:
   - Enter 15 pouches/day → Should show 1 tin/day in Money Saved
   - Enter 10 pouches/day → Should show 0.67 tins/day in Money Saved
   - Cost per tin should remain constant when changing quantities

2. **Chew/Dip Flow**:
   - Enter 3 tins/day → Should show "3 tins" avoided (no portions)
   - Decimal inputs (e.g., 0.43) should work correctly

3. **Data Sync**:
   - Changes in Avoided Calculator should immediately reflect in Money Saved Modal
   - Redux state should be the source of truth for all calculations

## Debug Logging Added
Added console logs for pouches debugging:
- Product category detection
- Tins per day values
- Cost calculations
- Redux vs props data usage

## Next Steps
- Monitor user feedback on calculator accuracy
- Consider adding unit conversion helper text for pouches
- Potentially add visual indicators for data syncing 