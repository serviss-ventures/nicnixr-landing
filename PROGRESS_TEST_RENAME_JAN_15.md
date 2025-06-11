# Progress Test Rename
## January 15, 2025

### User Request
"that neural test is actual just a test for the whole app now so maybe we shouold rename it just to not confuse our dev team"

### Changes Made

#### 1. File Rename
- **Old Name**: `neuralGrowthTest.ts`
- **New Name**: `progressTest.ts`
- **Reason**: The file tests the entire app's progress system, not just neural features

#### 2. Global Variable Update
- **Old**: `global.neuralTest`
- **New**: `global.progressTest`
- **Impact**: All console commands now use `progressTest` instead of `neuralTest`

#### 3. Function Updates
- `testNeuralGrowthProgression` → `testProgressProgression`
- Console messages updated to say "Progress Test" instead of "Neural Growth Test"

#### 4. Import Update
- Updated `DashboardScreen.tsx` to import the renamed file

### Usage (Unchanged)
Developers can still use all the same test functions:
```javascript
// Set specific days clean
progressTest.setDays(30)

// Show all recovery stages
progressTest.progression()

// Quick functions
progressTest.day0()
progressTest.week1()
progressTest.month1()
// etc...
```

### Benefits
1. **Clearer Purpose**: Name accurately reflects that it tests overall app progress
2. **Less Confusion**: No longer implies it's specific to neural/brain features
3. **Better Documentation**: Team members will understand its broader purpose

### Files Modified
- `mobile-app/src/debug/neuralGrowthTest.ts` → `mobile-app/src/debug/progressTest.ts`
- `mobile-app/src/screens/dashboard/DashboardScreen.tsx` (import update) 