# Substance Type Mapping Fix

## Issue
Users were getting this error during onboarding:
```
ERROR  Error updating onboarding data: {"code": "23514", "details": null, "hint": null, "message": "new row for relation \"user_onboarding_data\" violates check constraint \"user_onboarding_data_substance_type_check\""}
```

## Root Cause
The database has a check constraint that only allows these substance types:
- `cigarettes`
- `vape`
- `nicotine_pouches`
- `chew_dip`

But the mobile app was sending:
- `chewing` (instead of `chew_dip`)
- `pouches` (instead of `nicotine_pouches`)

## Solution
Added mapping in `onboardingAnalytics.ts` to convert mobile app values to database values:

```typescript
// Map mobile app categories to database substance types
let substanceType = data.substanceType || data.nicotineProduct?.category;
if (substanceType === 'chewing' || substanceType === 'chew' || substanceType === 'dip') {
  substanceType = 'chew_dip';
} else if (substanceType === 'pouches') {
  substanceType = 'nicotine_pouches';
}
```

## Testing
1. Go through onboarding and select "Chew" as nicotine product
2. Should now save successfully without constraint violation
3. Check database - should see `chew_dip` in `substance_type` column

## Future Considerations
- Consider updating the mobile app to use the same values as the database
- Or maintain this mapping layer for backward compatibility
- Update any other places that might be sending these values 