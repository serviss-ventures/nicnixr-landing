# Limited Edition & Seasonal Avatar System

## Overview
The avatar system automatically handles limited-time drops and seasonal exclusives without any manual intervention.

## How It Works

### 1. Limited Time Drops (14 Days)
- **Exclusive Drop** avatar is available for exactly 14 days
- Shows countdown in the UI: "3d left!" when less than 3 days remain
- Automatically disappears from the store when time expires
- Users who purchased it keep it forever

**Current Settings:**
- Available: January 6-20, 2025
- Price: $19.99
- To update dates, change in `DicebearAvatar.tsx`:
```javascript
availableFrom: '2025-01-06',
availableUntil: '2025-01-20',
```

### 2. Seasonal Avatars (Auto-Rotate)
The app automatically shows different avatars based on the current season:

- **Winter Warrior** (Dec, Jan, Feb) - Ice blue theme
- **Spring Bloom** (Mar, Apr, May) - Green & yellow theme  
- **Summer Legend** (Jun, Jul, Aug) - Sun gradient theme
- **Fall Harvest** (Sep, Oct, Nov) - Autumn colors theme

Only the current season's avatar is visible in the store. Users who buy a seasonal avatar keep it forever.

## Features

### Automatic Availability
- Time-limited avatars check the current date
- Seasonal avatars check the current month
- No manual updates needed - just "set it and forget it"

### Smart UI Display
- Shows days remaining for limited drops
- Displays season badge for seasonal avatars
- Red urgent badge when 3 days or less remain
- Hides unavailable avatars (unless owned)

### Purchase Behavior
- Users can always use avatars they've purchased
- Purchased avatars show "Owned" badge
- Can't purchase expired/out-of-season avatars

## Future Limited Drops
To create a new limited drop:

1. Update the dates in `limitedDrop` avatar:
```javascript
availableFrom: 'YYYY-MM-DD',
availableUntil: 'YYYY-MM-DD', // 14 days later
seedModifier: 'limited-drop-YYYY', // Change year
```

2. Optionally change colors/style
3. Deploy update - it handles everything else!

## Testing
To test different seasons/dates during development:
```javascript
// Temporarily override getCurrentSeason() or isDateInRange()
// Remember to remove before deploying!
```

## Benefits
- No manual intervention needed
- Creates urgency and FOMO
- Seasonal relevance keeps app fresh
- Limited drops drive revenue spikes
- Users feel special owning exclusive avatars 