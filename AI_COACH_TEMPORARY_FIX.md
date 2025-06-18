# AI Coach Temporary Fix

## Issue
- Persistent "Invalid hook call" error with useNavigation
- Multiple approaches failed due to React Navigation context issues

## Temporary Solution
Created `AICoachScreenSimple.tsx` which:
- Uses class component instead of functional component
- Avoids all hooks
- Shows basic UI with "Chat temporarily unavailable" message
- Navigation still works via props

## To Restore Full Functionality
1. Change import in `DashboardStackNavigator.tsx` back to:
   ```typescript
   import RecoveryCoachScreen from '../screens/dashboard/AICoachScreen';
   ```

2. Fix the hooks issue by ensuring:
   - Navigation context is properly provided
   - No duplicate React versions exist
   - All expo/react-navigation packages are compatible

## Possible Root Causes
- Metro bundler cache issues
- React version mismatch
- Navigation context not properly initialized
- Expo SDK version conflicts

## Next Steps
1. Clean install all dependencies
2. Verify React Navigation setup
3. Check for duplicate React instances
4. Consider upgrading/downgrading packages if needed 