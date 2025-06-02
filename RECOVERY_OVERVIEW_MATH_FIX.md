# Recovery Overview Math Fix
**Date**: December 30, 2024
**Issue**: Physical Health and Mental Clarity showing incorrect values for new users

## Problem
Users at 0 hours clean were seeing:
- Physical Health: "Good" with 75% progress bar
- Mental Clarity: "Clear" with 80% progress bar
- Recovery phases all appearing active incorrectly

## Root Cause
The values were hardcoded instead of being calculated based on actual days clean.

## Solution Implemented

### 1. Physical Health
**Old**: Always showed "Good" with 75% progress
**New**: Dynamic calculation based on days clean:
- 0 days: "0%" (0% progress)
- 1-2 days: "Starting" (0-3% progress)
- 3-6 days: "Improving" (3-7% progress)
- 7-13 days: "Better" (8-14% progress)
- 14-29 days: "Good" (16-32% progress)
- 30-59 days: "Great" (33-65% progress)
- 60+ days: "Excellent" (67-100% progress)

Progress bar: `(daysClean / 90) * 100` (capped at 100%)

### 2. Mental Clarity
**Old**: Always showed "Clear" with 80% progress
**New**: Dynamic calculation based on days clean:
- 0 days: "0%" (0% progress)
- 1-2 days: "Foggy" (0-5% progress)
- 3-6 days: "Clearing" (5-10% progress)
- 7-13 days: "Better" (12-22% progress)
- 14-29 days: "Clear" (23-48% progress)
- 30-59 days: "Sharp" (50-98% progress)
- 60+ days: "Crystal" (100% progress)

Progress bar: `(daysClean / 60) * 100` (capped at 100%)

### 3. Recovery Phases
**Old**: All phases showed as active if health score was above minimum
**New**: Only the current phase shows as active (between min and max)

## Result
Now the Recovery Overview accurately reflects the user's actual progress from day 0, matching the scientific accuracy of our Progress screen. 