# Avatar System Documentation

## Overview
The NicNixr app now features a comprehensive avatar system that rivals Reddit's customization options. Users can unlock avatars based on their recovery progress, creating a gamified experience that encourages long-term engagement.

## Avatar Types

### 1. Character-Based Avatars (Currently Implemented)
- **Starter Avatars** (Unlocked from Day 0):
  - 🥷 Shadow Ninja
  - 👨‍🚀 Space Explorer  
  - 🧙‍♂️ Wise Wizard
  - 🦸 Hero
  - 🦹‍♀️ Heroine

- **Progress Unlocks**:
  - 🤖 Tech Bot (Day 7)
  - 🧞 Wish Master (Day 14)
  - 👽 Cosmic Being (Day 30)
  - 🦾 Cyborg Elite (Day 90)
  - 🌟 Ascended Master (Day 365)

### 2. Other Avatar Styles (Available for Future Implementation)
- **Emoji-Based**: Simple, clean icons (⚔️ Warrior, 🔥 Phoenix, etc.)
- **Animal Spirits**: Symbolic animals (🐺 Lone Wolf, 🦅 Soaring Eagle, etc.)
- **Cosmic/Abstract**: Space-themed avatars (☀️ Solar Power, 🌙 Lunar Energy, etc.)

## Rarity System
Avatars have dynamic rarity frames based on user progress:
- **Common** (Gray): Days 0-6
- **Rare** (Blue): Days 7-29  
- **Epic** (Purple): Days 30-89
- **Legendary** (Gold): Days 90+

## Achievement Badges
Users can earn badges that appear on their avatars:
- 🔥 **Streak Master** (7 days)
- 💎 **Diamond Will** (30 days)
- 👑 **Recovery Royalty** (100 days)
- ⚡ **Lightning Reflexes** (Helped 5 buddies)
- 🌟 **Community Star** (10 support messages)

## Implementation Details

### Components
1. **Avatar.tsx** - Core avatar display component with:
   - Multiple size options (small, medium, large, xlarge)
   - Rarity frame rendering
   - Badge overlay system
   - Online status indicator

2. **avatars.ts** - Avatar data and utilities:
   - Avatar definitions with unlock requirements
   - Badge definitions
   - Helper functions for unlocked avatars
   - Frame color mappings

### Integration Points
- **Profile Screen**: Large avatar display with edit functionality
- **Community/Buddy System**: Medium avatars with online status
- **Navigation Tab**: Small avatar in profile tab
- **Chat Screens**: Small avatars in message bubbles

## User Experience
1. Users start with 5 starter avatars
2. New avatars unlock automatically based on recovery progress
3. Tap avatar on profile to open selection modal
4. Locked avatars show requirements to encourage progress
5. Rarity frames upgrade automatically as users progress

## Technical Architecture
```
Avatar System
├── Display Layer
│   ├── Avatar Component
│   ├── Size Variants
│   └── Frame/Badge Rendering
├── Data Layer
│   ├── Avatar Definitions
│   ├── Unlock Logic
│   └── Progress Integration
└── UI Integration
    ├── Profile Screen
    ├── Community Features
    └── Chat Systems
```

## Future Enhancements
1. **Avatar Creator**: Custom avatar builder
2. **Seasonal Avatars**: Limited-time unlocks
3. **Achievement Avatars**: Special avatars for milestones
4. **Avatar Animations**: Subtle idle animations
5. **Avatar Marketplace**: Trade/gift avatars to buddies

## Testing Notes
- All avatars display correctly with proper styling
- Unlock system functions based on recovery progress
- Modal navigation works smoothly across categories
- Visual effects render properly on Epic/Legendary avatars
- Grid layout centers properly (fixed alignment issues)

## Conclusion
The avatar selection system successfully adds gamification and personalization to the NIXR recovery app while maintaining the premium design aesthetic. Users can express their recovery journey through avatar choices while being motivated by unlock requirements tied to their actual progress. 