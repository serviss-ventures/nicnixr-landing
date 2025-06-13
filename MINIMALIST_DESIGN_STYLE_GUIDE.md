# NixR Minimalist Design Style Guide

## Design Philosophy
Apple/Tesla-inspired minimalism - clean, sophisticated, content-focused.

## Color Palette
```
Background Gradient: ['#000000', '#0A0F1C', '#0F172A']
Primary Text: #FFFFFF
Secondary Text: #9CA3AF  
Muted Text: #6B7280
Accent (subtle): rgba(255, 255, 255, 0.1-0.2)
```

## Typography
```
Font Weights:
- Light: 300 (body text, descriptions)
- Regular: 400 (most UI elements)
- Medium: 500 (headers, emphasis only)

Font Sizes:
- Headers: 22px (main), 18px (section)
- Body: 13-14px
- Small: 11-12px
- Tiny: 10px (labels)

Letter Spacing: -0.2 to -0.5 (tighter for headers)
```

## UI Elements

### Backgrounds & Borders
```
Card Background: rgba(255, 255, 255, 0.03)
Hover/Active: rgba(255, 255, 255, 0.04-0.06)
Borders: rgba(255, 255, 255, 0.06-0.08)
Border Radius: 10-16px (subtle curves)
```

### Spacing
```
xs: 4px
sm: 8px  
md: 16px
lg: 24px
xl: 32px
```

### Interactive Elements
```
Buttons:
- Background: rgba(255, 255, 255, 0.1)
- Border: 1px solid rgba(255, 255, 255, 0.08)
- Text: Weight 400-500, no uppercase

Icons:
- Size: 18-22px (reduced from 24-28px)
- Color: #9CA3AF (neutral gray)
- Containers: 36-44px with subtle backgrounds

Progress Bars:
- Height: 4px (thin)
- Background: rgba(255, 255, 255, 0.06)
- Fill: rgba(255, 255, 255, 0.15-0.2)
```

## Recovery Journal Specific
```
Entry Cards:
- Subtle shadow: 0.1 opacity
- Emotion badges: Ultra-light backgrounds
- Mood tracker: Minimalist dots with gentle animation
- Typography: Light weights with good hierarchy

Success Animation:
- Gentle confetti with subtle opacity
- Smooth, refined transitions
- Minimal celebration - sophisticated feel
```

## Key Principles
1. **Less is More**: Remove unnecessary decoration
2. **Subtle Depth**: Use opacity, not colors, for hierarchy  
3. **Content First**: Let the user's data be the hero
4. **Refined Motion**: Smooth, purposeful animations only
5. **Consistent Spacing**: Breathable, balanced layouts
6. **Neutral Palette**: Grays over colors (except for data viz)

## Implementation Notes
- All purple (#8B5CF6) replaced with grays
- Shadows minimal (0.1 opacity max)
- No gradients except main background
- Thin dividers instead of heavy borders
- Small, refined UI elements throughout

This design system creates a premium, sophisticated experience that puts the focus on the user's recovery journey rather than the interface itself. 