# Milestone-Based Avatar Badge System Update

## Summary
Updated the avatar badge system to use journey milestones instead of health score-based progress indicators. Added epic long-term badges for 2, 5, and 10-year milestones.

## Changes Made

### 1. Updated Badge System (`badges.ts`)
- Replaced health score calculation with milestone-based approach
- Badge now shows based on highest milestone achieved:
  - Day 1: ✅ checkmark-circle (green)
  - Day 3: ⚡ flash (orange)
  - Day 7: 🛡️ shield-checkmark (blue)
  - Day 14: 📈 trending-up (purple)
  - Day 30: 🏅 medal (pink)
  - Day 60: 🔥 flame (red)
  - Day 90: 🚀 rocket (cyan)
  - Day 180: ⭐ star (yellow)
  - Day 365: 🏆 trophy (gold)
  - **Day 730 (2 Years): 💎 diamond (bright teal)**
  - **Day 1825 (5 Years): 🪐 planet (bright purple)**
  - **Day 3650 (10 Years): ♾️ infinite (hot pink)**

### 2. Updated ProfileScreen
- Added epic milestones to the journey grid
- Fixed isNext calculation to include new milestone days
- Journey section now shows all 12 milestones

### 3. Recovery Phases
- Extended recovery phases for long-term users:
  - < 365 days: Original phases
  - 365-730 days: "Mastery"
  - 730-1825 days: "Legend"
  - 1825+ days: "Immortal"

## Visual Impact
- Avatars now display milestone-based badges that match the journey section
- Long-term users get epic badges with vibrant colors
- More intuitive progression that matches user expectations
- Easier to add future milestones (15 year, 20 year, etc.)

## Technical Details
- Badge type now uses icon name for flexibility
- Added `milestone` property to BadgeInfo for future use
- Exported JOURNEY_MILESTONES for consistency across app 