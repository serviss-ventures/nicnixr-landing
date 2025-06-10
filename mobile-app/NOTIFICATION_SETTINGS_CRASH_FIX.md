# Notification Settings Crash Fix - June 12, 2025

## Problem
When clicking on "Notifications" under Settings, the app crashed with:
```
TypeError: Cannot read property 'enabled' of undefined
```

## Root Cause
The NotificationsScreen component was trying to access `notifications.quietHours.enabled` in its state initialization:
```javascript
const [quietHoursEnabled, setQuietHoursEnabled] = useState(notifications.quietHours.enabled);
```

But `quietHours` didn't exist in the DEFAULT_SETTINGS object in `constants/app.ts`.

## Solution
Added the missing `quietHours` property to DEFAULT_SETTINGS:
```javascript
notifications: {
  dailyMotivation: true,
  progressUpdates: true,
  healthMilestones: true,
  communityActivity: false,
  quietHours: {
    enabled: false,
    start: '10:00 PM',
    end: '7:00 AM'
  }
}
```

## Why This Happened
The NotificationSettings interface in `types/index.ts` had the quietHours property defined, but the DEFAULT_SETTINGS constant didn't match the interface structure.

## Lesson Learned
Always ensure that default values match the TypeScript interfaces to prevent runtime errors.

## Files Modified
- `mobile-app/src/constants/app.ts` - Added quietHours to DEFAULT_SETTINGS 