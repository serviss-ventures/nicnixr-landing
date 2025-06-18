# AI Coach Navigation Error - Final Fix Approach

## What We've Done

1. **Created a wrapper component pattern**:
   - Split the component into `RecoveryCoachScreenContent` (main logic)
   - Created `RecoveryCoachScreen` wrapper that handles navigation context
   - Moved `useNavigation()` to the wrapper and passed as prop

2. **Added initialization delay**:
   - Wrapper ensures React context is ready before rendering content
   - Shows loading indicator briefly while initializing

## Complete Process to Test

1. **Force quit the Expo Go app** on your device/simulator
2. **Clear all caches**:
   ```bash
   # Already done - we killed all processes and cleared .expo
   ```

3. **Restart your device/simulator** (important!)

4. **Wait for Expo to fully start** (running now)

5. **Open fresh in Expo Go**

## If Still Not Working

Try this nuclear option:
```bash
# Stop everything
pkill -f node

# Remove ALL caches
rm -rf node_modules
rm -rf .expo
rm -rf ios/Pods (if exists)
rm package-lock.json

# Fresh install
npm install

# Start with maximum cache clearing
npx react-native start --reset-cache &
npx expo start -c
```

## Alternative Solution

If hooks still don't work, we can refactor to use navigation props from the stack navigator:

```typescript
// In DashboardStackNavigator.tsx
<Stack.Screen 
  name="AICoach" 
  component={RecoveryCoachScreen}
  options={({ navigation }) => ({
    title: 'Recovery Coach',
    headerShown: false,
    // Pass navigation via screenProps if needed
  })}
/>
```

## Why This Error Happens

1. **React Native navigation context** isn't available when component first mounts
2. **Metro bundler cache** can hold onto old component definitions
3. **Multiple React instances** in node_modules (rare but possible)

## Current Status

- Expo is restarting with cleared cache
- All node processes were killed
- Component has been refactored with wrapper pattern
- Navigation is passed as prop to avoid hook timing issues

The app should work now - just need to wait for Expo to start and test with a fresh app load! 