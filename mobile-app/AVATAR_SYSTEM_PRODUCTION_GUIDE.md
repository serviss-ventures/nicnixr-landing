# Avatar System Production Guide - June 11, 2025

## Current Issue
You noticed Mike S. has different avatars in notifications vs his profile. This is because we're using mock/demo data.

## How It Works Now (Demo Mode)

### Demo Notifications
```typescript
// In NotificationService.createDemoNotifications()
await this.createBuddyMessageNotification({
  id: 'buddy-mike-456',
  name: 'Mike S.',
  daysClean: 120,
  avatar: 'hero',  // ← Hardcoded avatar style
}, 'message...');
```

### Community/Profile
Each user gets a `DicebearAvatar` based on:
1. **userId**: Generates unique base avatar
2. **style**: User's selected avatar style (warrior, hero, etc.)
3. **daysClean**: Affects frame color and badges

## Production Implementation

### 1. Backend User Model
```typescript
interface User {
  id: string;
  displayName: string;
  selectedAvatar: {
    type: 'dicebear';
    style: string;  // 'warrior', 'hero', 'night-rider', etc.
    name: string;   // Display name of avatar
  };
  daysClean: number;
  // ... other fields
}
```

### 2. Notification Service (Production)
```typescript
// When creating real notifications
static async createBuddyRequestNotification(fromUserId: string) {
  // Fetch user from backend
  const fromUser = await api.getUser(fromUserId);
  
  return dispatch(createNotification(
    'buddy-request',
    'New Buddy Request',
    `${fromUser.displayName} wants to connect`,
    {
      buddyId: fromUser.id,
      buddyName: fromUser.displayName,
      buddyDaysClean: fromUser.daysClean,
      buddyAvatar: fromUser.selectedAvatar?.style || 'warrior', // ← Real avatar
      buddyProduct: fromUser.product,
      // ... other data
    }
  ));
}
```

### 3. Consistency Across App
- **Profile**: Shows user's actual selected avatar
- **Notifications**: Shows sender's actual selected avatar
- **Community**: Shows each user's actual selected avatar
- **Buddy System**: Shows each buddy's actual selected avatar

## Avatar System Features

### User-Selected Avatars
- Users can choose from starter avatars (warrior, fighter, hero)
- Unlock progress avatars by staying clean
- Purchase premium avatars

### Consistent Generation
- Same userId + style = Same avatar appearance
- Works across devices when synced via backend
- No random changes or inconsistencies

## Launch Readiness Checklist

✅ **Ready Now:**
- Avatar selection and storage system
- DicebearAvatar component with all styles
- Notification display infrastructure
- Consistent avatar rendering

🔧 **Needs Backend Integration:**
1. Store selectedAvatar in user profile
2. Include avatar style in API responses
3. Update notification creation to use real user data
4. Remove demo notification creation

## Quick Fix for Demo
To make demo notifications consistent with profiles:

```typescript
// Update demo data to match actual avatars
await this.createBuddyMessageNotification({
  id: 'buddy-mike-456',
  name: 'Mike S.',
  daysClean: 120,
  avatar: 'warrior',  // ← Match what's shown in profile
}, 'message...');
```

## Summary
- **Current inconsistency**: Demo data uses hardcoded avatars
- **Production ready**: System is built correctly
- **Backend needed**: To fetch real user avatar preferences
- **No bad code**: Just needs real data instead of mock data

The avatar system is production-ready. The inconsistency you noticed only exists because we're using demo data. Once connected to a backend that provides real user data, avatars will be consistent everywhere. 