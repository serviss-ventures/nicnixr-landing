# Progress Screen Component Structure

## Main Component
```typescript
ProgressScreen
├── HeaderSection
│   ├── RecoveryScore (animated number)
│   ├── PhaseIndicator (badge with icon)
│   └── DaysCleanCounter (with subtle pulse)
│
├── TabNavigation
│   ├── TabButton (Timeline)
│   ├── TabButton (Achievements) 
│   └── TabButton (Stats)
│
└── TabContent (animated transitions)
    ├── TimelineTab
    ├── AchievementsTab
    └── StatsTab
```

## Timeline Tab Components
```typescript
TimelineTab
├── CurrentPhaseCard
│   ├── PhaseProgress (visual bar)
│   ├── PhaseDescription
│   └── KeyProcesses (list)
│
├── ActiveBenefitsSection
│   └── BenefitCard[] (expandable)
│       ├── BenefitIcon
│       ├── BenefitTitle
│       ├── TimeIndicator
│       └── ExpandedDetails (animated)
│
└── BodySystemsGrid
    └── SystemCard[]
        ├── SystemIcon
        ├── SystemName
        ├── ProgressBar
        └── Percentage
```

## Achievements Tab Components
```typescript
AchievementsTab
├── NextMilestoneHero
│   ├── MilestoneBadge (large)
│   ├── ProgressToMilestone
│   ├── DaysRemaining
│   └── MotivationalQuote
│
├── AchievementCategories
│   ├── CategorySelector
│   └── CategoryContent
│
├── AchievementGrid
│   └── AchievementBadge[]
│       ├── BadgeIcon (locked/unlocked)
│       ├── BadgeTitle
│       ├── UnlockCriteria
│       └── UnlockDate (if achieved)
│
└── AchievementHistory
    └── HistoryItem[]
        ├── BadgeIcon (mini)
        ├── AchievementName
        ├── UnlockDate
        └── ShareButton
```

## Stats Tab Components
```typescript
StatsTab
├── MetricsGrid
│   └── MetricCard[]
│       ├── MetricIcon
│       ├── MetricValue (animated)
│       ├── MetricLabel
│       └── TrendIndicator
│
├── ProgressChart
│   ├── ChartHeader
│   ├── TimeRangeSelector
│   └── LineChart (animated)
│
├── StreakCalendar
│   ├── MonthView
│   ├── DayCell[] (colored by status)
│   └── StreakLegend
│
└── PersonalRecords
    └── RecordCard[]
        ├── RecordIcon
        ├── RecordTitle
        ├── RecordValue
        └── DateAchieved
```

## Shared Components
```typescript
// Reusable across tabs
ProgressBar
├── BackgroundTrack
├── FillBar (animated)
├── Milestone markers
└── ValueLabel

AnimatedNumber
├── CurrentValue
├── TargetValue
└── AnimationDuration

GradientCard
├── LinearGradient (based on progress)
├── CardContent
└── BorderGlow (optional)
```

## State Management
```typescript
// Redux slices needed
progressSlice
├── stats (days, money, units)
├── recoveryData (phases, systems)
├── activeTab
└── expandedCards

achievementSlice
├── unlockedBadges[]
├── nextMilestone
├── totalPoints
└── categories

// Selectors
selectCurrentPhase()
selectActivebenefits()
selectNextMilestone()
selectAchievementProgress()
```

## Animation Specs
- Tab transitions: 300ms ease-out
- Progress bars: 500ms spring animation
- Number counters: 1000ms with easing
- Card expansions: 250ms ease-in-out
- Badge unlocks: Scale + fade + confetti

## Color Variables
```typescript
const progressColors = {
  early: 'rgba(255, 255, 255, 0.15)',
  building: 'rgba(251, 191, 36, 0.2)',
  establishing: 'rgba(147, 197, 253, 0.2)',
  thriving: 'rgba(134, 239, 172, 0.2)',
  mastery: 'rgba(250, 204, 21, 0.2)',
};
``` 