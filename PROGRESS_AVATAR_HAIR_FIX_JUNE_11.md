# Progress Avatar Hair Fix - June 11, 2025

## Summary
Fixed issue where Week Warrior and other progress unlock avatars were missing hair or showing very little hair.

## Problem
The Week Warrior avatar (7-day unlock) and potentially other progress avatars were generating without proper hair despite having hair colors defined.

## Solution

### Updated Seed Modifiers
Changed seed modifiers for all progress avatars to ensure better hair generation:

1. **Week Warrior** (7 days): `week-warrior-v2` → `week-warrior-v3-hair`
2. **Month Master** (30 days): `month-master-v2` → `month-master-v3-hair`
3. **Season Survivor** (90 days): `season-survivor-v2` → `season-survivor-v3-hair`
4. **Year Legend** (365 days): `year-legend-v2` → `year-legend-v3-hair`

### Combined with Previous Fix
This works in conjunction with the earlier fix that sets:
- `hairProbability: 80%` for progress avatars
- `hairProbability: 100%` for premium avatars

## Result
All progress avatars now generate with proper hair consistently:
- Week Warrior: Rich chestnut hair
- Month Master: Sleek black hair
- Season Survivor: Fierce red hair
- Year Legend: Luxurious brown hair

## File Modified
- `/mobile-app/src/components/common/DicebearAvatar.tsx` 