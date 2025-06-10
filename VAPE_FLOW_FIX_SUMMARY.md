# Vape Flow Fix Summary
**Date:** June 10, 2025

## Issues Reported
User signed up as a vaper and on day 30:
1. Time saved shows "0m of your life reclaimed"
2. Shows 0 units avoided  
3. Time Saved Modal incorrectly mentions "Average time a pouch is kept in 30-45 min"

## Root Causes Found

### 1. Vape Data Not Saved Properly
- Onboarding saves `dailyAmount` but not `podsPerDay`
- Dashboard expects `podsPerDay` for vape users
- This causes units avoided to be 0

### 2. Time Calculation Too Low
- progressSlice had `minutesPerUnit = 5` for vape (way too low)
- TimeSavedModal had `minutes: 10` for vape
- Both should be ~60 minutes total vaping time per pod

### 3. Wrong Product Detection
- Time Saved Modal likely showing pouches info due to missing vape data
- When vape data is missing, it might default to pouches text

## Fixes Implemented

### 1. Fixed Onboarding Data Save (NicotineProfileStep.tsx)
```typescript
// Added product-specific data saving
if (selectedProduct.category === 'vape') {
  profileData.podsPerDay = parseFloat(dailyAmount);
}
```

### 2. Fixed Time Calculations
- progressSlice.ts: Changed vape from 5 to 60 minutes per pod (3 locations)
- TimeSavedModal.tsx: Changed vape from 10 to 60 minutes

### 3. Next Steps
Users who already onboarded as vapers need data migration:
- Add `podsPerDay` from their `dailyAmount`
- Ensure category is properly set to 'vape'

## Testing Checklist
1. [ ] New vape user onboarding saves `podsPerDay`
2. [ ] Units avoided calculates correctly (pods/day × days)
3. [ ] Time saved shows 60 minutes per pod
4. [ ] Time Saved Modal shows vape-specific text (not pouches)
5. [ ] Money saved calculates based on pods

## Additional Fixes (Time Saved Modal Detection)
- Updated `getTimePerUnit()` to check both `userProfile?.category` and `userProfile?.nicotineProduct?.category`
- Updated `getUnitName()` to use same detection logic
- Added special handling for 'other' category to not default to pouches

## Migration Script Needed
For existing vape users:
```typescript
if (user.nicotineProduct?.category === 'vape' && !user.podsPerDay) {
  user.podsPerDay = user.dailyAmount || 1;
}
``` 