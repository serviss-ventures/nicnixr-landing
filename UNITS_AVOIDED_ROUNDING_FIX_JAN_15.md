# Units Avoided Rounding Fix
## January 15, 2025

### Issue Reported
User reported: "When I put in the units avoided calculator and I put in 1 cig a day and after 30 days I have 30 cigs which is 1.5 packs but on the home page it says 2 packs avoided"

### Root Cause
The dashboard was using `Math.round()` to round pack calculations to the nearest whole number:
- 30 cigarettes ÷ 20 = 1.5 packs
- Math.round(1.5) = 2 packs (incorrect)

This was inconsistent with:
1. The Units Avoided Calculator modal which correctly showed 1.5 packs
2. The recovery tracking service which used decimal precision

### Fix Applied
Updated `DashboardScreen.tsx` `getAvoidedDisplay()` function to show actual decimal values instead of rounding:

#### For Cigarettes:
```typescript
// Before:
const roundedPacks = Math.round(packs);

// After:
const displayPacks = packs % 1 === 0 ? packs : Number(packs.toFixed(1));
```

#### Similar fixes applied to:
- Nicotine pouches (tins calculation)
- Pouches stored as 'other' category with 'zyn' id
- Vape pods

### Technical Details
- Shows whole numbers without decimals (e.g., 2 packs)
- Shows one decimal place for fractional values (e.g., 1.5 packs)
- Consistent with calculator modal and other displays
- More accurate representation of actual progress

### Files Modified
- `mobile-app/src/screens/dashboard/DashboardScreen.tsx`

### Testing
- 1 cigarette/day for 30 days now correctly shows "1.5 packs" instead of "2 packs"
- All product types now show accurate decimal values when appropriate
- Maintains clean display for whole numbers 