# Avatar Consistency Guide

## Overview
NixR uses DiceBear avatars that are uniquely generated based on user IDs. This ensures that each user always sees the same avatar across all sessions, devices, and screens.

## Key Principle: Same User ID = Same Avatar

### How It Works

1. **User ID Generation (Once per user)**
   ```typescript
   // Generated during onboarding in authSlice.ts
   let userId = state.auth.user?.id || `user_${Date.now()}`;
   ```

2. **User ID Storage (Persistent)**
   ```typescript
   // Stored in AsyncStorage for cross-session persistence
   await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
   ```

3. **Avatar Generation (Deterministic)**
   ```typescript
   // DicebearAvatar uses userId as seed - always generates same avatar
   <DicebearAvatar
     userId={user.id}  // e.g., "user_1704123456789"
     style="micah"     // Avatar style
     daysClean={30}    // Affects frame color/badges
   />
   ```

## Privacy & Security

- **No Personal Info Exposed**: User IDs are opaque (e.g., `user_1704123456789`)
- **No Email/Name in Public**: Only the ID is used for avatar generation
- **Unique but Anonymous**: Each user has a unique avatar without revealing identity

## Cross-Device Consistency (Future)

When backend is implemented:
1. User logs in on new device
2. User ID syncs from backend
3. Same avatar appears automatically

## Implementation Checklist

✅ **Current Implementation:**
- User ID generated once during onboarding
- User ID stored in AsyncStorage
- DicebearAvatar uses user ID as seed
- Same avatar appears across all screens
- Avatar persists between app sessions

🔜 **Future Backend Integration:**
- User ID stored in database
- Sync user ID on login
- Ensure same ID across devices

## Usage Examples

### Correct Usage ✅
```typescript
// Always use user.id from auth state
<DicebearAvatar
  userId={user.id}
  size="large"
  daysClean={stats.daysClean}
/>
```

### Incorrect Usage ❌
```typescript
// Don't use random values or changing data
<DicebearAvatar
  userId={Date.now().toString()}  // ❌ Changes every render
  userId={user.email}              // ❌ Exposes personal info
  userId={Math.random().toString()} // ❌ Not consistent
/>
```

## Testing Avatar Consistency

1. **Session Persistence Test**:
   - Open app, note your avatar
   - Close app completely
   - Reopen app - avatar should be identical

2. **Screen Consistency Test**:
   - Check avatar on Profile tab
   - Check avatar in Community/Buddy screens
   - All should show same avatar

3. **Progress Test**:
   - Avatar frame/badges change with progress
   - But base avatar remains the same

## Troubleshooting

**Avatar Changed Unexpectedly?**
- Check if user ID is consistent: `console.log(user.id)`
- Ensure using auth state user, not local variables
- Verify AsyncStorage hasn't been cleared

**Different Avatars on Different Screens?**
- Ensure all screens use `user.id` from Redux state
- Don't pass different IDs to different components

## Summary

The avatar system guarantees:
- 🔒 **Consistency**: Same user always sees same avatar
- 🌐 **Persistence**: Avatar survives app restarts
- 🛡️ **Privacy**: No personal info in avatar generation
- 📱 **Scalability**: Ready for multi-device support 