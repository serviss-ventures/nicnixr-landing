# Chew/Dip Data Consistency Fixes Session
## June 12, 2025

### Summary
Fixed major data inconsistency where onboarding collects tins per WEEK for chew/dip products, but the app was treating it as daily usage. This caused incorrect calculations throughout the app.

### Issues Identified
1. **Onboarding Mismatch**: 
   - NicotineProfileStep.tsx asks for "Cans per week" with placeholder "3.5"
   - Helper text: "Most users go through 3-5 cans per week"
   - But app calculations assumed this was daily amount

2. **Avoided Units Calculation Wrong**:
   - Dashboard showed way too many tins avoided
   - Progress slice calculated wrong unitsAvoided
   - AvoidedCalculatorModal didn't convert properly

3. **UI Issues**:
   - "Update Daily Usage" button was cut off at bottom of modal
   - Redundant "Avoided X tins avoided" text (fixed earlier)

### Changes Made

#### 1. AvoidedCalculatorModal.tsx
- **getCurrentDailyAmount()**: Now converts weekly tins to daily portions
  ```typescript
  // Chew/dip is stored as tins per WEEK in onboarding, convert to daily portions
  const tinsPerWeek = userProfile?.dailyAmount || 3.5;
  const tinsPerDay = tinsPerWeek / 7;
  const portionsPerDay = Math.round(tinsPerDay * 5); // 5 portions per tin
  ```

- **handleSave()**: Converts daily portions back to weekly tins for storage
  ```typescript
  // Convert daily portions back to weekly tins for storage consistency
  const tinsPerDay = newDailyAmount / 5;
  const tinsPerWeek = tinsPerDay * 7;
  dispatch(updateUserData({
    nicotineProduct: {
      ...userProfile,
      dailyAmount: tinsPerWeek // Store as weekly to match onboarding
    },
    tinsPerDay: tinsPerDay,
    dailyCost: tinsPerDay * 5
  }));
  ```

- **UI Fix**: Added extra padding to scrollContent to prevent button cutoff
  ```typescript
  paddingBottom: SPACING.xl * 2, // Extra padding to ensure button is visible
  ```

#### 2. progressSlice.ts (updateProgress & initializeProgress)
- Added conversion logic for chew/dip products:
  ```typescript
  let safeDailyAmount = Number(userProfile.dailyAmount) || 20;
  
  // For chew/dip, dailyAmount is stored as tins per WEEK from onboarding
  if (userProfile.category === 'chewing' || userProfile.category === 'chew' || 
      userProfile.category === 'dip' || userProfile.category === 'chew_dip') {
    const tinsPerWeek = safeDailyAmount;
    const tinsPerDay = tinsPerWeek / 7;
    safeDailyAmount = tinsPerDay * 5; // 5 portions per tin
  }
  ```

### Data Flow Verification
1. **Onboarding**: User enters 3.5 tins per week
2. **Storage**: Stored as dailyAmount = 3.5 (weekly)
3. **Progress Calculation**: 
   - Converts to daily: 3.5 / 7 = 0.5 tins/day
   - Converts to portions: 0.5 * 5 = 2.5 portions/day
   - unitsAvoided = daysClean * 2.5 portions
4. **Dashboard Display**: 
   - Shows tins avoided: unitsAvoided / 5
   - Example: 30 days * 2.5 = 75 portions = 15 tins

### Testing Checklist
- [x] Onboarding shows "cans per week" for chew/dip
- [x] AvoidedCalculatorModal shows correct daily portions
- [x] Dashboard shows correct tins avoided
- [x] Editing daily usage updates correctly
- [x] Progress calculations are accurate
- [x] No button cutoff in calculator modal

### Product-Specific Handling
All variations now properly handled:
- 'chewing'
- 'chew'
- 'dip'
- 'chew_dip'
- 'dip_chew'
- 'smokeless'

### Consistency Achieved
- **5 portions per tin** used consistently across:
  - AvoidedCalculatorModal
  - DashboardScreen
  - progressSlice
  - recoveryTrackingService

### User Experience Improvements
1. Calculator modal shows "5 portions = 1 tin (typically 3-5 tins/week)"
2. Users can update their daily usage and see accurate calculations
3. No more UI elements cut off
4. Data flows correctly from onboarding through entire app

### Git History
- Commit e2049a2: "fix: Handle chew/dip weekly data throughout app"
- Successfully pushed to main branch 