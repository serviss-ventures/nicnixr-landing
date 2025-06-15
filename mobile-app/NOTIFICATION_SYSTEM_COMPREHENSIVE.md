# NixR Notification System - Comprehensive Documentation

## Overview

The NixR app features a comprehensive notification system that includes both in-app notifications and push notifications using Expo's notification service. The system is designed with a minimalist aesthetic following the app's design guidelines.

## Architecture

### 1. **Push Notification Service** (`pushNotificationService.ts`)
- Singleton service for managing push notifications
- Handles permissions, scheduling, and notification lifecycle
- Integrates with expo-notifications API
- Supports both immediate and scheduled notifications

### 2. **In-App Notification Service** (`notificationService.ts`)
- Creates in-app notification entries
- Manages different notification types:
  - Buddy requests
  - Buddy messages
  - Milestones
  - Health benefits
  - Mentions
  - System notifications

### 3. **Redux Integration**
- `notificationSlice.ts`: Manages notification state
- Persisted through Redux persist for offline access
- Tracks read/unread status and unread count

### 4. **Middleware** (`notificationMiddleware.ts`)
- Automatically checks for milestones when progress updates
- Creates notifications for achievements without manual dispatch

## Features

### Push Notifications

1. **Daily Motivation** (9 AM)
   - Rotating motivational messages
   - Customizable through settings

2. **Progress Reminders** (8 PM)
   - Evening check-in prompts
   - Encourages daily reflection

3. **Milestone Notifications**
   - Scheduled based on quit date
   - Major milestones: 1, 3, 7, 14, 30, 60, 90, 180, 365 days

4. **Health Benefit Notifications**
   - Triggered when health improvements unlock
   - Science-based recovery timeline

### In-App Notifications

1. **Notification Center**
   - Slide-up modal with elegant UI
   - Grouped by "Today" and "Earlier"
   - Swipe gestures for actions

2. **Notification Bell**
   - Header component with unread count
   - Subtle badge design
   - Haptic feedback on tap

3. **Filtering**
   - Respects user notification settings
   - Only shows enabled notification types
   - Real-time unread count updates

## User Settings

Located in Settings > Notifications:

- **Daily Motivation**: Toggle daily inspirational messages
- **Progress Updates**: Toggle milestone and progress notifications
- **Health Milestones**: Toggle health benefit notifications
- **Community Activity**: Toggle buddy requests, messages, and mentions

## Design System Integration

### Colors
- Notification badges: `rgba(255, 255, 255, 0.15)`
- Icon colors:
  - Daily Motivation: Amber
  - Progress Updates: Green
  - Health Milestones: Pink
  - Community Activity: Blue

### Typography
- Font weights: 300-500 only
- Title: 400 weight
- Body: 300 weight
- Timestamps: 300 weight, muted color

### Spacing
- Consistent use of SPACING constants
- Card padding: SPACING.lg
- Section margins: SPACING.xl

## Developer Tools

### Notification Test Screen
Available in Profile > Developer Tools > Notification Test

Features:
- Send test push notification
- Create test milestone notification
- Create test buddy request
- Schedule all notifications
- View scheduled notifications
- Clear all scheduled notifications
- Display push token

## Setup Requirements

### iOS
- Info.plist configured with NSUserNotificationsUsageDescription
- Notification permissions handled gracefully

### Android
- Notification permissions in app.json
- Custom notification icon and color configured

## Implementation Notes

### Permission Handling
```typescript
// Graceful permission request
const hasPermission = await this.requestPermissions();
if (!hasPermission) {
  console.log('Notification permissions not granted');
  return false;
}
```

### Scheduling Notifications
```typescript
// Daily notification at specific time
await Notifications.scheduleNotificationAsync({
  identifier: 'daily-motivation',
  content: {
    title: 'Daily Motivation 🌟',
    body: motivationalMessage,
    data: { type: 'motivation' },
    sound: 'default',
    badge: 1,
  },
  trigger: {
    hour: 9,
    minute: 0,
    repeats: true,
  },
});
```

### Milestone Checking
```typescript
// Automatic milestone checking via middleware
if (updateProgress.fulfilled.match(action)) {
  if (currentDaysClean > previousDaysClean) {
    await NotificationService.checkMilestones(dispatch, currentDaysClean, previousDaysClean);
  }
}
```

## Testing

1. **Manual Testing**
   - Use Notification Test screen
   - Verify permissions on fresh install
   - Test notification delivery timing
   - Verify deep linking from notifications

2. **Automated Testing**
   - Mock expo-notifications for unit tests
   - Test notification creation logic
   - Verify Redux state updates

## Troubleshooting

### Common Issues

1. **Notifications not appearing**
   - Check device notification permissions
   - Verify push token is obtained
   - Check notification settings in app

2. **Scheduled notifications not firing**
   - Ensure app has background permissions
   - Check if notifications are actually scheduled
   - Verify trigger configuration

3. **Badge count incorrect**
   - Check filtering logic matches settings
   - Verify Redux state is persisted
   - Ensure markAsRead updates properly

### Debug Tools

- Notification Test screen shows:
  - Current push token
  - All scheduled notifications
  - Test notification triggers

- Console logs for:
  - Permission status
  - Scheduling success/failure
  - Notification lifecycle events

## Future Enhancements

1. **Rich Notifications**
   - Add images to milestone notifications
   - Interactive notification actions

2. **Smart Scheduling**
   - Learn user's active times
   - Personalized notification timing

3. **Backend Integration**
   - Remote push notifications
   - Server-triggered buddy notifications
   - Real-time message notifications

4. **Analytics**
   - Track notification engagement
   - Optimize message content
   - A/B test notification timing

## Code Quality

- TypeScript for type safety
- Singleton pattern for service
- Proper error handling
- Memory leak prevention with cleanup
- Follows app's minimalist design principles 