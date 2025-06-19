# Progress Screen Redesign Proposal

## Overview
Combine the scientific recovery timeline with achievement milestones into one comprehensive progress view.

## Design Structure

### Header Section
- **Recovery Score** (Big number, e.g., "73%")
- **Current Phase** badge (e.g., "System Recovery")
- **Days Clean** counter with subtle animation

### Tab Navigation (3 tabs)
```
[Timeline] [Achievements] [Stats]
```

### Tab 1: Timeline (Default)
**Current Benefits Section**
- Show what's happening NOW in their body
- Gender-specific benefits with icons
- Expandable cards for more details
- Progress indicators for each benefit

**Body Systems Recovery**
- Visual progress bars for each system:
  - 🧠 Neurological (dopamine receptors healing)
  - ❤️ Cardiovascular (blood pressure normalizing)
  - 🫁 Respiratory (lung capacity improving)
  - 🧪 Chemical Detox (nicotine elimination)
- Percentage complete with subtle animations
- Tap for detailed explanations

### Tab 2: Achievements
**Milestone Grid**
- Visual badges for each milestone
- Locked/Unlocked states with progress
- Categories:
  - Time-based (1 day, 7 days, 30 days, etc.)
  - Health-based (25% recovery, 50% recovery, etc.)
  - Action-based (First craving resisted, etc.)

**Next Milestone Card**
- Prominent display of next achievement
- Progress bar showing how close they are
- Motivational message

**Achievement History**
- Scrollable list of unlocked achievements
- Date/time unlocked
- Share button for social proof

### Tab 3: Stats
**Key Metrics Grid**
- 💰 Money Saved
- 🚭 Units Avoided
- ⏱️ Time Regained
- 💪 Health Score

**Visual Charts**
- Progress over time graph
- Streak calendar view
- Comparison to average recovery

**Personal Records**
- Longest streak
- Best week
- Total days clean

## Visual Design Elements

### Color Progression System
Based on recovery phase:
- **Early (1-7 days)**: Subtle white/gray tones
- **Building (1-4 weeks)**: Soft amber gradients
- **Establishing (1-3 months)**: Soft blue gradients  
- **Thriving (3+ months)**: Soft green gradients
- **Mastery (1+ year)**: Soft gold accents

### Animation Strategy
- Subtle progress bar fills
- Gentle pulsing for next milestone
- Smooth tab transitions
- Micro-interactions on achievement unlocks

### Typography
- Large numbers for key stats (font-weight: 300)
- Clear hierarchy with size/opacity
- Minimal text, focus on visuals

## Key Improvements

1. **Single Source of Truth**: All progress in one place
2. **Clear Navigation**: Tabs make it easy to explore different aspects
3. **Motivation + Science**: Combines emotional rewards with health facts
4. **Visual Progress**: Multiple ways to see advancement
5. **Personalized**: Adapts to user's product type and gender

## Implementation Notes

- Keep loading states minimal
- Cache data for offline viewing
- Smooth animations under 300ms
- Accessibility: High contrast ratios
- Pull-to-refresh on main view

## Next Steps

1. Get design approval
2. Create component structure
3. Implement tab navigation
4. Build each tab section
5. Add animations
6. Integrate with Redux store
7. Connect to Supabase (later phase) 