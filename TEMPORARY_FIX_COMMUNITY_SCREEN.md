# Temporary Fix for CommunityScreen

## Quick Fix to Get App Running

While we complete the migration, you can apply this temporary fix:

### Option 1: Comment Out Problem Areas

In `CommunityScreen.tsx`, comment out the navigation calls that still reference avatar:

```typescript
// Line ~443
navigation.navigate('BuddyProfile' as never, { 
  buddy: {
    id: buddy.id,
    name: buddy.name,
    // avatar: buddy.avatar,  // Comment out
    daysClean: buddy.daysClean,
    status: buddy.status,
    bio: buddy.bio,
    supportStyles: [...]
  }
} as never);
```

### Option 2: Add Avatar Back Temporarily

Add avatar field back to Buddy interface temporarily:

```typescript
interface Buddy {
  id: string;
  name: string;
  avatar?: string; // Add temporarily
  // ... rest of fields
}
```

## Permanent Solution (In Progress)

1. Replace all `Avatar` components with `DicebearAvatar`
2. Remove all avatar property references from navigation
3. Ensure all avatars use user ID for generation

## Testing Avatar Consistency

Even with the temporary fix, test that avatars are consistent:

1. Check your profile avatar
2. Restart the app
3. Avatar should be exactly the same

This confirms the avatar system is working correctly! 