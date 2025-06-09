# Grammar Fixes - June 11, 2025

## Summary
Fixed improper English where "1 days" was displayed instead of "1 day" in various places throughout the app.

## Changes Made

### 1. ProfileScreen.tsx
- **Your Journey milestones**: Fixed "1 days until First Day" to display "1 day" when appropriate
  ```tsx
  // Before: {milestone.days - daysClean} days
  // After: {milestone.days - daysClean} {milestone.days - daysClean === 1 ? 'day' : 'days'}
  ```

- **Premium rotation timer**: Fixed "New collection in 1 days" to display "1 day"
  ```tsx
  // Before: New collection in {getDaysUntilRotation()} days
  // After: New collection in {getDaysUntilRotation()} {getDaysUntilRotation() === 1 ? 'day' : 'days'}
  ```

### 2. BlueprintRevealStep.tsx
- **Quit date message**: Fixed "In 1 days, you'll begin your freedom"
  ```tsx
  // Before: In ${daysUntilQuit} days
  // After: In ${daysUntilQuit} ${daysUntilQuit === 1 ? 'day' : 'days'}
  ```

### 3. DashboardScreen.tsx
- **Savings goal message**: Fixed "1 more days to reach your goal"
  ```tsx
  // Before: {days} more days to reach your goal!
  // After: {days} more {days === 1 ? 'day' : 'days'} to reach your goal!
  ```

## Result
All day-related text now properly handles singular vs plural forms, displaying "1 day" instead of "1 days" throughout the app. 