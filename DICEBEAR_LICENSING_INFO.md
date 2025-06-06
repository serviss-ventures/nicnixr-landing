# DiceBear Avatar System & Licensing

## Overview
NicNixr uses DiceBear's avatar generation system to create unique, progress-based avatars for users in their recovery journey.

## Avatar Styles & Unlock System

| Style | Name | Unlock Requirement | License |
|-------|------|-------------------|---------|
| Micah | Unique Hero | Day 0 (Start) | CC BY 4.0 |
| Adventurer | Adventurer | Day 7 | CC BY 4.0 |
| Lorelei | Lorelei | Day 14 | CC0 1.0 |
| Avataaars | Classic | Day 30 | Free for personal and commercial use |
| Bottts | Robot | Day 60 | Free for personal and commercial use |
| Fun Emoji | Fun Emoji | Day 90 | CC BY 4.0 |
| Miniavs | Minimalist | Day 180 | CC BY 4.0 |
| Open Peeps | Open Peeps | 1 Year | CC0 1.0 |
| Personas | Personas | 2 Years | CC BY 4.0 |

## Commercial Use Rights

### ✅ You CAN:
- Use DiceBear avatars in commercial apps (like NicNixr)
- Charge for your app that includes DiceBear avatars
- Implement avatar unlocking as a gamification feature
- Use avatars as rewards for milestones
- Customize avatar options based on user progress

### ❌ You CANNOT:
- Sell the avatar images themselves as standalone products
- Claim ownership of the DiceBear system or styles
- Remove attribution where required

### 📋 Attribution Requirements:
For styles with CC BY 4.0 license, include attribution in your app's credits or about section:
```
Avatar styles powered by DiceBear (dicebear.com)
- Micah by Micah Lanier
- Adventurer by Lisa Wischofsky
- Fun Emoji by Davis Uche
- Miniavs by Webpixels
- Personas by Draftbit
```

## Implementation in NicNixr

### Progressive Unlocking
- Avatars unlock based on recovery milestones
- Creates positive reinforcement for staying clean
- Visual progression matches recovery journey

### Unique Generation
- Each user gets a unique avatar based on their user ID
- Same user always gets same avatar (consistent identity)
- Special features unlock with progress (glasses at 30 days, earrings at 365 days)

### Frame Rarity System
- Common (Green): Days 0-29
- Rare (Blue): Days 30-89  
- Epic (Purple): Days 90-179
- Legendary (Gold): Days 180+
- Unique (Emerald): Special Micah style

## Revenue Model Compatibility

### ✅ Allowed Revenue Models:
1. **App Purchase/Subscription**: Charge for the app that includes avatars
2. **Feature Unlocking**: Avatars as part of premium features
3. **Gamification Rewards**: Avatars as achievement rewards
4. **Recovery Milestones**: Natural progression system

### ⚠️ Not Recommended:
- Direct avatar sales (selling individual avatar images)
- Avatar NFTs (without additional rights/agreements)
- Reselling avatar generation as a service

## Best Practices

1. **Clear Communication**: Tell users avatars unlock with progress
2. **Motivation Tool**: Use avatars to encourage recovery milestones
3. **Attribution**: Include proper credits in app settings/about
4. **Respect Licenses**: Follow each style's specific license terms

## Technical Implementation

```typescript
// Avatar unlocks based on recovery progress
const isAvatarUnlocked = (styleName: string, daysClean: number) => {
  const style = AVATAR_STYLES[styleName];
  return daysClean >= style.unlockDays;
};

// Generate consistent avatar for user
const getUserAvatar = (userId: string, style: string) => {
  return createAvatar(AVATAR_STYLES[style].collection, {
    seed: userId, // Ensures same user always gets same avatar
    // ... other options
  });
};
```

## Summary

DiceBear's licensing allows NicNixr to:
- ✅ Use avatars in a commercial recovery app
- ✅ Implement progress-based unlocking
- ✅ Create unique avatars for each user
- ✅ Use avatars as motivational tools

This creates a positive, gamified experience that supports users in their nicotine recovery journey while respecting all licensing requirements. 