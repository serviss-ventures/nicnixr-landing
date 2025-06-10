# Smooth Tab Navigation Fix - June 12, 2025

## Problem
The previous aggressive reset approach using `navigation.reset()` caused visual glitches/twitches when switching tabs.

## Solution
Switched to using `StackActions.popToTop()` which provides a smooth transition:

```javascript
listeners={({ navigation, route }) => ({
  tabPress: (e) => {
    const isFocused = navigation.isFocused();
    
    if (isFocused) {
      // If already on this tab, pop to top of its stack
      navigation.dispatch(StackActions.popToTop());
    }
  },
})}
```

## Benefits
- **No visual glitches**: Smooth transitions between tabs
- **Fixes toggle issue**: When already on a tab, tapping it returns to main screen
- **Better UX**: Natural navigation behavior without jarring resets
- **Simpler code**: Much cleaner than the complex reset logic

## How It Works
1. User taps a tab that's already active
2. `popToTop()` smoothly navigates back to the root screen of that stack
3. No full state replacement = no visual artifacts

## Example Flow
1. Navigate to BuddyChat from notification
2. Tap Community tab while already on it → Smoothly returns to feed
3. No more toggling, no more twitches! 