# NixR Badge System Explanation

## The Little Icons on User Profiles

Those small icons in the bottom right of user avatars are **recovery stage badges** that appear based on your recovery journey progress. They're a visual way to show which recovery phase you're in, aligned with the app's overall recovery system.

## Badge Progression (Unified with Recovery Stages)

| Recovery Stage | Days (Approx) | Badge Icon | Icon Name | Color | Health Score |
|----------------|---------------|------------|-----------|--------|--------------|
| Starting Out | 0-3 days | None | - | - | < 10% |
| Early Progress | 3-14 days | 📈 | trending-up | Cyan (#06B6D4) | 10-30% |
| Building Strength | 14-30 days | 💪 | barbell | Purple (#8B5CF6) | 30-60% |
| Major Recovery | 30-90 days | 🛡️ | shield-checkmark | Gold (#F59E0B) | 60-85% |
| Freedom | 90+ days | ⭐ | star | Red (#EF4444) | 85%+ |

## Where Badges Appear

- Community feed posts
- Comment avatars
- Buddy lists
- Buddy profiles
- User profiles
- Chat screens

## Technical Implementation

The badge system is defined in `mobile-app/src/utils/badges.ts` and is now unified with the recovery stage system:

```typescript
export const getBadgeForDaysClean = (daysClean: number): BadgeInfo | null => {
  // Calculate approximate health score from days clean
  let healthScore = calculateHealthScoreFromDays(daysClean);
  
  // Return badge based on recovery phase (aligned with dashboard phases)
  if (healthScore < 10) {
    return null; // Starting Out - no badge yet
  } else if (healthScore < 30) {
    return { icon: 'trending-up', type: 'trending-up', color: '#06B6D4' }; // Early Progress
  } else if (healthScore < 60) {
    return { icon: 'barbell', type: 'barbell', color: '#8B5CF6' }; // Building Strength
  } else if (healthScore < 85) {
    return { icon: 'shield-checkmark', type: 'shield', color: '#F59E0B' }; // Major Recovery
  } else {
    return { icon: 'star', type: 'star', color: '#EF4444' }; // Freedom
  }
};
```

## Design Philosophy

- **Unified System**: Badges now match the recovery stages shown throughout the app
- **Privacy-first**: Shows recovery phase without revealing exact days
- **Motivation**: Celebrates progress through recovery journey stages
- **Visual hierarchy**: Badges evolve with your recovery phase
- **Consistency**: Same recovery stage system used in dashboard, profiles, and badges

## Benefits of the Unified System

1. **Single Source of Truth**: Recovery stages are consistent everywhere
2. **Better User Understanding**: Users see the same phases throughout their journey
3. **Clearer Progress**: Badge changes align with major recovery milestones
4. **Reduced Confusion**: No more separate systems for badges vs. recovery stages

## Future Considerations

- Add badge animations when transitioning between stages
- Special badges for completing challenges within each stage
- Premium badge effects (glow, animation, etc.)
- Seasonal variations of stage badges 