# Chew/Dip Calculation Test Checklist

## Test Scenarios

### 1. Fresh Onboarding Flow
- [ ] Go through onboarding as a chew/dip user
- [ ] Enter daily tins (e.g., 0.7 tins/day)
- [ ] Verify dashboard shows:
  - Correct portions avoided (0.7 × 5 = 3.5 portions after 1 day)
  - Correct tins avoided (0.7 tins after 1 day)
  - Correct money saved based on daily cost

### 2. Neural Test Integration
- [ ] Complete onboarding
- [ ] Use `neuralTest.day3()` in console
- [ ] Verify immediate updates (no refresh needed):
  - Money saved updates instantly
  - Units avoided shows correctly (10.5 portions or 2.1 tins)
  - All calculations are accurate

### 3. Avoided Calculator Updates
- [ ] Open avoided calculator
- [ ] Verify current usage shows correctly (e.g., 3.5 portions/day)
- [ ] Update to 4 portions/day
- [ ] Verify:
  - Conversion to 0.8 tins/day is correct
  - Stats update immediately on dashboard
  - Money saved recalculates properly

### 4. Money Saved Modal
- [ ] Open money saved modal
- [ ] Verify it shows "UPDATE YOUR COST PER TIN"
- [ ] Update cost per tin
- [ ] Verify daily cost calculation is correct

### 5. Migration for Existing Users
- [ ] If user had > 2 tins stored (weekly data)
- [ ] On dashboard load, should auto-convert to daily
- [ ] Check console for migration messages

## Expected Calculations

### For 5 tins/week user:
- Daily tins: 5 ÷ 7 = 0.714 tins/day
- Daily portions: 0.714 × 5 = 3.57 portions/day
- After 1 day: 0.7 tins avoided (displayed)
- After 7 days: 5 tins avoided

### Money Calculation:
- If tin costs $5
- Daily cost: 0.714 × $5 = $3.57/day
- After 30 days: $107.10 saved

## Common Issues Fixed

1. **Hard refresh needed after neural test** ✅
   - Now dispatches Redux updates automatically
   
2. **Avoided calculator not updating stats** ✅
   - Now calls updateProgress after changes
   
3. **Math inconsistencies** ✅
   - All calculations use daily tins consistently
   
4. **Storage/display mismatch** ✅
   - updateUserData now saves to AsyncStorage
   
5. **Weekly vs daily confusion** ✅
   - Onboarding now collects daily tins
   - Migration handles old weekly data

## Debug Commands

```javascript
// Check current user data
const userData = await AsyncStorage.getItem('@nixr_user');
console.log(JSON.parse(userData));

// Check progress data
const progressData = await AsyncStorage.getItem('@nixr_progress');
console.log(JSON.parse(progressData));

// Force migration (if needed)
const { migrateChewDipToDaily } = await import('./src/utils/chewDipMigration');
await migrateChewDipToDaily();

// Test calculations
neuralTest.day3(); // Should update immediately
``` 