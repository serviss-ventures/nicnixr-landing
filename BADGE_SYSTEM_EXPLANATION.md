# NixR Badge System Explanation

## The Little Icons on User Profiles

Those small icons in the bottom right of user avatars are **achievement badges** that appear based on days clean. They're a visual way to celebrate milestones without showing exact numbers.

## Badge Progression

| Days Clean | Badge Icon | Icon Name | Color | Meaning |
|------------|------------|-----------|--------|---------|
| 0-6 days | None | - | - | Still building the habit |
| 7+ days | 🔥 | flame | Red (#EF4444) | One week warrior! |
| 30+ days | ⚡ | flash/lightning | Blue (#3B82F6) | One month champion! |
| 100+ days | 🏆 | trophy | Gold (#F59E0B) | Century legend! |

## Where Badges Appear

- Community feed posts
- Comment avatars
- Buddy lists
- Buddy profiles
- User profiles
- Chat screens

## Technical Implementation

The badge system is defined in `mobile-app/src/utils/badges.ts`:

```typescript
export const getBadgeForDaysClean = (daysClean: number): BadgeInfo | null => {
  if (daysClean >= 100) {
    return { icon: 'trophy', type: 'crown', color: '#F59E0B' };
  } else if (daysClean >= 30) {
    return { icon: 'flash', type: 'lightning', color: '#3B82F6' };
  } else if (daysClean >= 7) {
    return { icon: 'flame', type: 'flame', color: '#EF4444' };
  }
  return null;
};
```

## Design Philosophy

- **Privacy-first**: Shows achievement level without revealing exact days
- **Motivation**: Celebrates milestones to encourage continued progress
- **Visual hierarchy**: Badges get more prestigious with time
- **Consistency**: Same badge system used throughout the app

## Future Considerations

- Could add more milestone badges (60 days, 180 days, etc.)
- Special event badges (holidays, challenges)
- Custom badge colors for premium users
- Animated badges for major milestones 