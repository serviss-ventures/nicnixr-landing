# Navigation Smooth Transition Fix

## Issue
When clicking "Start Plan" and returning to the dashboard, there was a white screen flash that made the experience feel jarring and not smooth.

## Root Cause
The navigation was using `navigation.reset()` which completely resets the navigation stack, causing a full re-render and resulting in a white flash during the transition.

## Solution Implemented

### 1. Changed Navigation Method (PlanDetailScreen.tsx)
- Replaced `navigation.reset()` with `navigation.navigate('DashboardMain')`
- This maintains the navigation stack and provides a smoother transition
- Moved the success alert to show after navigation completes

### 2. Updated Card Style and Transitions (DashboardStackNavigator.tsx)
- Added `cardStyle: { backgroundColor: '#000000' }` to prevent white background flash
- Changed from `forHorizontalIOS` to `forFadeFromBottomAndroid` for fade transition
- Reduced animation duration to 150ms for a snappier feel
- Added specific transition settings for PlanDetail screen

### 3. Improved Navigation Flow
- Navigate immediately after starting the plan
- Show success alert after a 300ms delay to ensure smooth transition
- This prevents the alert from blocking the navigation animation

## Result
The navigation from Plan Detail back to Dashboard now uses a smooth fade transition without any white screen flash, providing a much better user experience.

## Technical Details
```typescript
// Before
navigation.reset({
  index: 0,
  routes: [{ name: 'DashboardMain' }],
});

// After
navigation.navigate('DashboardMain');
```

```typescript
// Navigation options
screenOptions={{
  headerShown: false,
  gestureEnabled: true,
  cardStyle: { backgroundColor: '#000000' },
  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
  transitionSpec: {
    open: { animation: 'timing', config: { duration: 200 } },
    close: { animation: 'timing', config: { duration: 200 } },
  },
}}
``` 