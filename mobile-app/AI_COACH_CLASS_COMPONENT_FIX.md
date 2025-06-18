# AI Coach Class Component Fix

## Issue
"Invalid hook call" error when navigating to AI Coach screen. This persisted through multiple attempts to fix using different patterns.

## Root Cause
React Navigation context issues with hooks in functional components, possibly due to:
- Metro bundler cache corruption
- React version mismatches
- Navigation context initialization problems

## Solution
Converted `RecoveryCoachScreen` from functional component to class component:
- Removed all hooks (useNavigation, useState, useEffect, useRef)
- Used class component state and lifecycle methods
- Navigation passed as props instead of using hooks
- Animations handled with instance variables

## Key Changes
1. **Component Structure**: Class component with state and lifecycle methods
2. **Redux Access**: Using `store.getState()` directly instead of `useSelector`
3. **Refs**: Using `React.createRef()` instead of `useRef`
4. **State Management**: Using `this.state` and `this.setState()`
5. **Navigation**: Passed as props from Stack Navigator

## Benefits
- Avoids all hooks-related issues
- More stable in React Navigation context
- Works with existing OpenAI integration
- Maintains all functionality

## To Revert (if needed)
The functional component version is preserved in git history. To revert:
```bash
git revert 9866ef7
```

## Future Considerations
Once the React Navigation setup is stabilized, consider:
1. Upgrading all packages to latest versions
2. Clean install of node_modules
3. Converting back to functional component with proper context setup 