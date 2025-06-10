# Buddy Chat Navigation Fix - June 12, 2025

## Problem
When clicking on a buddy message notification from Mike S., the app was throwing an error:
```
ERROR The action 'NAVIGATE' with payload {"name":"BuddyChat","params":{"buddy":{...}}} was not handled by any navigator.
Do you have a screen named 'BuddyChat'?
```

## Root Cause
The NotificationCenter was attempting to navigate to BuddyChat in two separate steps:
1. First navigate to Community tab with buddies selected
2. Then navigate to BuddyChat directly

The issue was that BuddyChat is nested inside the Community stack navigator and isn't accessible from the root navigator.

## Solution
Changed the navigation to properly route through the Community stack in a single navigation call:

```typescript
// Before (incorrect):
navigation.navigate('Community', {
  screen: 'CommunityMain',
  params: { initialTab: 'buddies' }
});
setTimeout(() => {
  navigation.navigate('BuddyChat', { buddy: {...} }); // This fails!
}, 150);

// After (correct):
navigation.navigate('Community', {
  screen: 'BuddyChat',  // Navigate directly to BuddyChat within Community stack
  params: { buddy: {...} }
});
```

## Navigation Structure
```
Root Navigator
├── Dashboard
├── Community (Stack Navigator)
│   ├── CommunityMain
│   ├── BuddyChat      ← Must be accessed through Community stack
│   ├── BuddyProfile
│   └── BuddySearch
├── Progress
└── Profile
```

## Files Modified
- `mobile-app/src/components/common/NotificationCenter.tsx` - Fixed handleMessageTap function

## Testing
1. Reset notifications in developer settings
2. Click on Mike S. message notification
3. Should navigate directly to BuddyChat screen
4. Back button should return to Community screen (buddies tab) 