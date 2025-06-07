# Limited Drops & Seasonal Collection Split - June 6, 2025

## Summary
Split the merged "Limited Edition" avatar collection into two distinct sections as requested by the user:
- **Limited Drops**: 4 time-limited avatars (14 days only)
- **Seasonal Collection**: 4 seasonal avatars (one for each season)

## Limited Drops Collection (4 Avatars)
### 1. **Exclusive Drop** - $19.99
- Icon: Flash ⚡
- Colors: Red to gold gradient
- Description: Limited time only!
- Available: June 6-20, 2025 (14 days)

### 2. **Rare Release** - $24.99
- Icon: Star ⭐
- Colors: Purple to pink gradient
- Description: Super rare edition
- Available: June 6-20, 2025 (14 days)

### 3. **Special Edition** - $21.99
- Icon: Sparkles ✨
- Colors: Cyan to teal gradient
- Description: Collectors item
- Available: June 6-20, 2025 (14 days)

### 4. **Founder Edition** - $29.99
- Icon: Medal 🏅
- Colors: Dark red to amber gradient
- Description: Early supporter
- Features: Laughing expression (proud founder smile)
- Available: June 6-20, 2025 (14 days)

## Seasonal Collection (4 Avatars)
### 1. **Winter Warrior** - $14.99
- Icon: Snow ❄️
- Colors: Ice blue gradient
- Season: Winter exclusive

### 2. **Spring Bloom** - $14.99
- Icon: Flower 🌸
- Colors: Spring green to yellow
- Season: Spring exclusive

### 3. **Summer Legend** - $14.99
- Icon: Sunny ☀️
- Colors: Sun gradient
- Season: Summer exclusive (Currently Available!)

### 4. **Fall Harvest** - $14.99
- Icon: Leaf 🍂
- Colors: Autumn colors
- Season: Fall exclusive

## UI Changes
1. **Limited Drops Section**
   - Header: "Limited Drops" with flash icon
   - Subtitle: "⏰ 14 days only - once they're gone, they're gone!"
   - Shows countdown timers (e.g., "3d left!" for urgent ones)

2. **Seasonal Collection Section**
   - Header: "Seasonal Collection" with leaf icon
   - Subtitle: "🌸 Exclusive seasonal avatars - collect them all!"
   - Highlights current season avatars with green badge

## Technical Implementation
- Created separate exports: `LIMITED_DROP_AVATARS` and `SEASONAL_AVATARS`
- Updated ProfileScreen to show two distinct sections
- Added `getCurrentSeason()` helper function
- Added visual indicators for current season avatars
- Maintained automatic date-based availability

## Files Modified
- `mobile-app/src/components/common/DicebearAvatar.tsx`
- `mobile-app/src/screens/profile/ProfileScreen.tsx`

## User Feedback
"hmm you got rid of our seasonal strategy and limited drop and merged em to just limited edition i wanted 3-5 for each"

## Result
Successfully implemented 4 avatars for Limited Drops and 4 avatars for Seasonal Collection, displayed in two separate sections as requested. 