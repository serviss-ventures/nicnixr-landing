# Debug Guide: Reset to Onboarding

## What Should Happen

When you tap "Reset App" in Developer Tools:
1. ✅ Clears all AsyncStorage
2. ✅ Signs out from Supabase
3. ✅ Resets Redux state (including `onboardingComplete` to false)
4. ✅ Navigates immediately to onboarding screen

## If Still Not Working

### Option 1: Force App Restart (Recommended)
After the reset completes:
1. Double-tap home button (or swipe up)
2. Swipe up on the NixR app to close it
3. Reopen the app
4. You should see onboarding

### Option 2: Add RNRestart (Nuclear Option)
If you want automatic restart:
```bash
cd mobile-app
npm install react-native-restart
cd ios && pod install
```

Then in ProfileScreen.tsx:
```typescript
import RNRestart from 'react-native-restart';

// After reset...
RNRestart.Restart();
```

### Option 3: Debug the Navigation
Add these console logs to see what's happening:
```typescript
// In ProfileScreen.tsx after the reset:
console.log('Navigation state:', navigation.getState());
console.log('Parent nav:', navigation.getParent()?.getState());
console.log('Redux onboarding state:', store.getState().onboarding.isComplete);
```

## Quick Test Checklist

1. **Check Redux State**
   - After reset, `onboardingComplete` should be `false`
   - Add this to check: `console.log('Onboarding complete?', store.getState().onboarding.isComplete);`

2. **Check Navigation Stack**
   - The root navigator should have "Onboarding" as the active route
   - Not "Main" > "ProfileTab" > "Profile"

3. **Check AsyncStorage**
   - Should be completely empty after reset
   - No `persist:root` or other keys

## The Nuclear Option: Direct State Reset

If nothing else works, replace the entire reset logic with:
```typescript
import { NativeModules } from 'react-native';

// iOS only - will restart the app
NativeModules.DevSettings.reload();
```

## Why This Might Happen

1. **Navigation Hierarchy**: ProfileScreen is deeply nested (Main > Tabs > Profile)
2. **Redux Persist**: Sometimes doesn't immediately reflect state changes
3. **React Navigation Cache**: May cache screen state

The current fix attempts to:
- Get the root navigator using `getParent()` calls
- Reset the entire navigation stack
- Add a small delay for Redux to update

But sometimes a full app restart is the cleanest solution! 