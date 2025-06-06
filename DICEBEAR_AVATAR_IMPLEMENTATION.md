# Dicebear Avatar Implementation Guide

## Overview
This guide shows how to replace the current emoji/SVG avatar system with Dicebear's Micah style avatars for a more modern, unique avatar system.

## Installation
```bash
npm install @dicebear/core @dicebear/micah
```

## Implementation Status
✅ Created `DicebearAvatar` component
✅ Added migration utilities
✅ Demonstrated usage in ProfileScreen
🔲 Full app-wide replacement (optional)

## How to Use DicebearAvatar

### Basic Usage
```tsx
import DicebearAvatar from '../../components/common/DicebearAvatar';

// Simple avatar
<DicebearAvatar
  seed="unique-user-id"
  size="medium"
/>

// Avatar with recovery progress styling
<DicebearAvatar
  seed={user.id}
  size="large"
  rarity={daysClean >= 100 ? 'epic' : 'rare'}
  badgeIcon="shield-checkmark"
  glassesProbability={daysClean >= 30 ? 50 : 0}
/>
```

### Migration from Emoji Avatars
```tsx
import { generateSeedFromEmoji } from '../../components/common/DicebearAvatar';

// Convert existing emoji to Dicebear
const seed = generateSeedFromEmoji(buddy.avatar, buddy.id);

<DicebearAvatar
  seed={seed}
  size="medium"
  rarity={getRarityFromDays(buddy.daysClean)}
/>
```

## Customization Options

### Rarity Frames (based on recovery progress)
- **Common** (0-29 days): Gray frame
- **Rare** (30-99 days): Blue frame
- **Epic** (100-364 days): Purple frame
- **Legendary** (365+ days): Gold frame

### Progressive Unlocks
- **Glasses**: Unlock at 30 days clean
- **Earrings**: Unlock at 365 days (legendary status)
- **Frame effects**: Get more elaborate with progress

### Size Options
- `small`: 40px (for lists)
- `medium`: 56px (default)
- `large`: 80px (for profiles)
- `xlarge`: 120px (for main profile)

## Advantages Over Current System

### Current System Issues:
- Limited emoji selection
- Emoji rendering inconsistencies across devices
- Complex SVG components for custom avatars
- Not unique per user

### Dicebear Benefits:
- **Unique avatars**: Each user ID generates a completely unique avatar
- **Consistent rendering**: SVG-based, looks the same everywhere
- **Scalable**: Works at any size without quality loss
- **Customizable**: Can change based on recovery progress
- **Open source**: Free to use, no licensing issues

## Full Migration Plan (Optional)

### Phase 1: Profile Avatars
Replace CustomAvatar with DicebearAvatar in:
- ProfileScreen ✅
- Edit profile modal
- Profile preview cards

### Phase 2: Buddy System
Replace emoji avatars with Dicebear in:
- BuddySearchScreen
- BuddyProfileScreen
- BuddyChatScreen
- Community posts

### Phase 3: System-wide
- Navigation headers
- Notification avatars
- Achievement displays

## Code Examples

### Profile Screen (Already Implemented)
```tsx
<DicebearAvatar
  seed={user?.id || 'default-user'}
  size="xlarge"
  rarity={getAvatarRarity()}
  badgeIcon={daysClean >= 100 ? "shield-checkmark" : undefined}
  badgeColor="#FFD700"
  glassesProbability={daysClean >= 30 ? 50 : 0}
/>
```

### Buddy List Item
```tsx
<DicebearAvatar
  seed={generateSeedFromEmoji(buddy.avatar, buddy.id)}
  size="medium"
  rarity={getRarityFromDays(buddy.daysClean)}
  showFrame={true}
/>
```

### Community Post Avatar
```tsx
<DicebearAvatar
  seed={post.userId}
  size="small"
  rarity="common" // Or fetch from user data
  showFrame={false} // Simpler for small sizes
/>
```

## Customization Ideas

### 1. Recovery-Themed Accessories
- Add breathing masks/health symbols at certain milestones
- Change shirt colors based on streak length
- Add achievement badges as avatar decorations

### 2. Seasonal Themes
- Holiday accessories during special events
- Seasonal color palettes

### 3. Community Features
- Special frame for buddy helpers
- Unique colors for mentors
- Team badges for group challenges

## Next Steps

1. **Test Current Implementation**: The ProfileScreen now shows Dicebear avatars
2. **Gather Feedback**: See if users prefer this style
3. **Gradual Rollout**: Replace avatars section by section
4. **Add Customization**: Let users adjust their avatar colors/style

## Notes
- User IDs are used as seeds, ensuring each user gets a unique, consistent avatar
- The same user will always generate the same avatar (deterministic)
- Avatars are generated client-side, no server storage needed
- SVG format means perfect quality at any size 