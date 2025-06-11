# Recovery Journal AI Insights Update
**Date:** January 16, 2025

## Overview
Simplified the AI insights section in the Recovery Journal from a large promotional banner to a minimal, subtle card.

## Changes Made

### Before
- Large banner with "Unlock AI Insights" title
- Verbose subtitle: "Insights now available! Tap to view" or countdown message
- Analytics icon
- Full-width card with gradient background
- Prominent positioning

### After
- Small pill-shaped "Insights" card
- Just the word "Insights" - no subtitle
- Lightbulb icon (more intuitive)
- Self-sizing card (only as wide as content)
- Subtle styling with muted colors

## Visual Details

### Inactive State (< 5 days tracked)
- Gray background: `rgba(255, 255, 255, 0.05)`
- Gray border: `rgba(255, 255, 255, 0.08)`
- Gray text and icon: `#6B7280`

### Active State (≥ 5 days tracked)
- Purple-tinted background: `rgba(139, 92, 246, 0.08)`
- Purple border: `rgba(139, 92, 246, 0.2)`
- Purple text and icon: `#8B5CF6`
- Small purple dot indicator

## User Experience
- Less pushy/promotional feeling
- More integrated with the journal UI
- Still discoverable but not distracting
- Alert content simplified and more encouraging

## Code Changes
- Replaced `insightsPreview` styles with `insightsCard`
- New compact layout with pill shape
- Conditional styling for active/inactive states
- Updated alert messaging

This change makes the Recovery Journal feel more premium and less cluttered while maintaining the insights feature discovery. 