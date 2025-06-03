# Recovery Journal Feature Documentation

## Overview
The Recovery Journal is a comprehensive daily tracking system that helps users monitor their nicotine recovery journey through various mental, physical, and behavioral factors.

## Key Features

### 1. Core Tracking Factors (Always Enabled)
These 10 essential factors are automatically enabled for all users and cannot be disabled:

#### Mental Health
- **Mood** - Quick yes/no toggle for positive mood
- **Cravings** - Track if nicotine cravings occurred
- **Craving Intensity** - 1-10 scale (only shows if cravings = yes)
- **Stress Level** - Quick yes/no for high stress days
- **Anxiety Level** - 1-10 scale from calm to anxious

#### Physical Recovery
- **Sleep Quality** - Yes/no for good sleep
- **Sleep Duration** - Hours counter (0-24 hours)
- **Energy Level** - 1-10 scale from exhausted to energetic

#### Behavioral
- **Triggers Encountered** - Track trigger exposure
- **Coping Strategies Used** - Log strategy usage

### 2. Additional Tracking Factors (Optional)
Users can enable these additional factors based on their needs:

#### Additional Mental Health
- **Breathing Exercises** - Yes/no toggle
- **Meditation Time** - Minutes counter (0-60 min)
- **Mood Swings** - Yes/no toggle
- **Irritability** - Yes/no toggle
- **Concentration** - 1-10 scale

#### Additional Physical
- **Hydration** - Water glasses counter (0-20)
- **Appetite** - 1-10 scale
- **Headaches** - Yes/no toggle
- **Exercise** - Yes/no toggle
- **Exercise Duration** - Minutes counter (shows only if exercise = yes)

#### Behavioral Tracking
- **Social Support** - Yes/no toggle
- **Avoided Triggers** - Yes/no toggle
- **Productive Day** - Yes/no toggle

### 3. Journal Notes
- Always available custom notes section
- 500 character limit
- For additional thoughts and reflections

## User Interface

### Input Types
1. **Quick Toggle** - Yes/No buttons with checkmark/X icons
2. **Quick Scale** - 1-10 rating scale with visual feedback
3. **Quick Counter** - +/- buttons for numeric values
4. **Text Input** - Tap to open modal for text entry

### Navigation
- Date navigation with < Today > buttons
- Can review past entries
- Smooth sliding animation to customize panel

### Customize Panel
- Settings icon in header opens customization
- Core factors marked with "CORE" badge
- Core factors cannot be disabled
- Changes save automatically

## Technical Implementation

### Data Structure
```typescript
interface JournalData {
  // Core factors
  moodPositive: boolean | null;
  hadCravings: boolean | null;
  cravingIntensity: number;
  stressHigh: boolean | null;
  anxietyLevel: number;
  sleepQuality: boolean | null;
  sleepHours: number;
  energyLevel: number;
  triggersEncountered: boolean | null;
  copingStrategiesUsed: boolean | null;
  
  // Additional factors...
  notes: string;
}
```

### Storage
- Preferences saved to AsyncStorage
- Key: `@recovery_journal_preferences`
- Core factors always enabled on load

### Modal System
- Main journal modal (fullScreen)
- Text input modal (slide from bottom)
- Keyboard handling with KeyboardAvoidingView

## User Experience

### First Time Use
1. Opens with all core factors enabled
2. Additional factors can be enabled via customize
3. AI insights teaser shown at top

### Daily Flow
1. User opens journal from dashboard
2. Tracks relevant factors with quick inputs
3. Adds optional notes
4. Saves entry
5. Receives confirmation

### AI Insights
- Unlocked after 5 days of tracking
- Analyzes patterns and correlations
- Provides personalized recommendations

## Best Practices

### For Users
- Track daily for best insights
- Start with core factors only
- Add more factors as recovery progresses
- Use notes for context

### For Development
- Core factors ensure minimum viable data
- Conditional rendering for dependent fields
- Haptic feedback for all interactions
- Smooth animations enhance UX

## Future Enhancements
- Export journal data
- Weekly/monthly summaries
- Reminder notifications
- Integration with health metrics
- Sharing progress with buddies

## Accessibility
- High contrast colors
- Clear labels and icons
- Haptic feedback
- Large touch targets
- Screen reader compatible

## Performance
- Lazy loading of customize panel
- Debounced text inputs
- Optimized re-renders
- Smooth 60fps animations 