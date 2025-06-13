# NixR Design System Documentation

## Design Philosophy

Our UI follows Apple/Tesla minimalist design principles:
- **Minimal visual noise** - Focus on content, not decoration
- **Light typography** - Font weights 300-600, rarely 700+
- **Subtle interactions** - Gentle animations and haptic feedback
- **Muted colors** - Low opacity backgrounds and borders

## Core Design Tokens

### Typography
```typescript
// Font Weights (Apple-inspired)
fontWeight: {
  light: '300',      // Hero numbers, large text
  regular: '400',    // Body text, descriptions
  medium: '500',     // Labels, secondary text
  semibold: '600',   // Primary buttons, headers
  // Avoid: '700', '800', '900' (too heavy)
}

// Font Sizes
fontSize: {
  xs: 12,   // Meta labels, hints
  sm: 14,   // Secondary text, captions
  base: 16, // Body text
  lg: 18,   // Subheadings
  xl: 20,   // Section titles
  '2xl': 24,
  '3xl': 30,
  '4xl': 36, // Modal hero numbers
  '5xl': 48, // Dashboard metrics
}
```

### Colors & Opacity
```typescript
// Backgrounds (Ultra-subtle)
backgrounds: {
  card: 'rgba(255, 255, 255, 0.03)',
  hover: 'rgba(255, 255, 255, 0.05)', 
  input: 'rgba(255, 255, 255, 0.05)',
  success: 'rgba(34, 197, 94, 0.2)',
}

// Borders (Barely visible)
borders: {
  default: 'rgba(255, 255, 255, 0.06)',
  hover: 'rgba(255, 255, 255, 0.08)',
  success: 'rgba(34, 197, 94, 0.3)',
}

// Gradients (Subtle depth)
gradients: {
  primary: ['#000000', '#0A0F1C'],
  card: ['rgba(236, 72, 153, 0.08)', 'rgba(139, 92, 246, 0.04)'],
}
```

### Spacing
```typescript
spacing: {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
}
```

## Component Patterns

### Modal Design
```typescript
// Minimal header - just a close button
header: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
  padding: SPACING.md,
}

// Hero section for main metric
heroSection: {
  alignItems: 'center',
  marginBottom: SPACING.xl,
  paddingTop: SPACING.sm,
}

// Section with uppercase label
section: {
  marginBottom: SPACING.lg,
}
sectionLabel: {
  fontSize: FONTS.xs,
  fontWeight: '600',
  color: COLORS.textMuted,
  letterSpacing: 0.5,
  textTransform: 'uppercase',
  marginBottom: SPACING.sm,
}
```

### Input Fields
```typescript
inputContainer: {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: BORDER_RADIUS.md,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.08)',
  height: 44, // Compact height
}

input: {
  fontSize: FONTS.base,
  fontWeight: '400', // Light weight
  color: COLORS.text,
}
```

### Buttons
```typescript
// Primary action button
button: {
  paddingHorizontal: SPACING.md,
  paddingVertical: 10,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: BORDER_RADIUS.md,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.08)',
}

// Success state
buttonSuccess: {
  backgroundColor: 'rgba(34, 197, 94, 0.2)',
  borderColor: 'rgba(34, 197, 94, 0.3)',
}

buttonText: {
  fontSize: FONTS.sm,
  fontWeight: '600', // Only place we use 600
  color: COLORS.text,
}
```

### Grid Layouts
```typescript
// Clean data grid
grid: {
  flexDirection: 'row',
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  borderRadius: BORDER_RADIUS.lg,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.06)',
  overflow: 'hidden',
}

gridItem: {
  flex: 1,
  padding: SPACING.md,
  alignItems: 'center',
}

gridDivider: {
  width: 1,
  backgroundColor: 'rgba(255, 255, 255, 0.06)',
}
```

## Animation Guidelines

### Subtle Animations Only
```typescript
// Modal entrance
Animated.spring(animation, {
  toValue: 1,
  tension: 65,
  friction: 10,
  useNativeDriver: true,
})

// Gentle fade/slide
transform: [{
  translateY: animation.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0] // Small movement
  })
}]
```

### Haptic Feedback
```typescript
// Light feedback only
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
```

## Implementation Examples

### Money Saved Modal
- Hero amount with light weight (300)
- Inline update button
- Clean projection grid
- Subtle goal progress bar
- No celebration overlays

### Avoided Calculator Modal  
- Single page, no scroll
- Compact spacing
- Simplified nicotine info badge
- Two-column impact grid
- Minimal visual hierarchy

## Don'ts
- ❌ Heavy font weights (700+)
- ❌ Bright colors or high opacity
- ❌ Decorative icons or graphics
- ❌ Multiple gradients
- ❌ Bouncy animations
- ❌ Full-screen overlays
- ❌ Trophy emojis or celebrations

## Do's
- ✅ Light typography (300-600)
- ✅ Subtle borders (0.06-0.08 opacity)
- ✅ Minimal spacing
- ✅ Single-page modals when possible
- ✅ Inline actions
- ✅ Gentle transitions
- ✅ Focus on data clarity 