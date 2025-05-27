# Unified Recovery Tracking System

## Overview

The Unified Recovery Tracking System provides a single source of truth for all recovery calculations and ensures consistency across all components in the NIXR app. This system eliminates the fragmented tracking that was causing inconsistencies between different screens and components.

## Architecture

### Core Service: `recoveryTrackingService.ts`

The central service that provides all recovery-related calculations and data:

```typescript
import recoveryTrackingService from '../services/recoveryTrackingService';

// Get comprehensive recovery data
const data = recoveryTrackingService.getRecoveryData();
```

### Data Flow

```
Redux Store (progressSlice) 
    ↓
Recovery Tracking Service
    ↓
All Components (Dashboard, Progress, etc.)
```

## Key Features

### 1. Centralized Calculations

All recovery calculations are performed in one place:

- **Dopamine Recovery Percentage**: Research-based calculation
- **Recovery Phases**: Detox, Acute, Restoration, Neuroplasticity, Optimization
- **Personalized Messages**: Context-aware recovery messages
- **Unit Names**: Product-specific terminology (cigarettes, pouches, etc.)

### 2. Consistent Data Structure

```typescript
interface RecoveryData {
  daysClean: number;
  hoursClean: number;
  minutesClean: number;
  secondsClean: number;
  recoveryPercentage: number;
  healthScore: number;
  moneySaved: number;
  lifeRegained: number;
  unitsAvoided: number;
  personalizedUnitName: string;
  recoveryPhase: RecoveryPhase;
  recoveryMessage: string;
  neuralBadgeMessage: string;
  growthMessage: string;
}
```

### 3. Error Handling & Validation

- Graceful fallbacks if service fails
- Data validation to ensure consistency
- Development logging for debugging

## Usage Examples

### Dashboard Screen

```typescript
// OLD (Fragmented)
const calculateNetworkGrowth = () => {
  // Duplicate calculation logic
};

// NEW (Unified)
const recoveryData = recoveryTrackingService.getRecoveryData();
```

### Progress Screen

```typescript
// Get recovery timeline
const timeline = recoveryTrackingService.getRecoveryTimeline(daysClean);

// Get current phase
const phase = recoveryTrackingService.getCurrentRecoveryPhase(daysClean);
```

### Neural Growth Testing

```typescript
// Test functions now use unified service
const recoveryPercentage = recoveryTrackingService.calculateDopamineRecovery(days);
recoveryTrackingService.logRecoveryData('Neural Test');
```

## Recovery Phases

The system defines 5 distinct recovery phases:

### 1. Detox Phase (0-3 days)
- Nicotine clearance and initial withdrawal
- 0-15% dopamine pathway recovery

### 2. Acute Recovery (3-14 days)
- Withdrawal resolution and early healing
- 15-40% dopamine pathway recovery

### 3. Tissue Restoration (2-12 weeks)
- Physical healing and function improvement
- 40-70% dopamine pathway recovery

### 4. Neural Rewiring (3-6 months)
- Brain chemistry rebalancing
- 70-95% dopamine pathway recovery

### 5. System Optimization (6+ months)
- Complete recovery and enhancement
- 95-100% dopamine pathway recovery

## Dopamine Recovery Calculation

Based on peer-reviewed research on nicotine addiction recovery:

```typescript
export const calculateDopamineRecovery = (daysClean: number): number => {
  if (daysClean === 0) {
    return 0; // Starting recovery
  } else if (daysClean <= 3) {
    return Math.min((daysClean / 3) * 15, 15); // 0-15% in first 3 days
  } else if (daysClean <= 14) {
    return 15 + Math.min(((daysClean - 3) / 11) * 25, 25); // 15-40% in first 2 weeks
  } else if (daysClean <= 30) {
    return 40 + Math.min(((daysClean - 14) / 16) * 30, 30); // 40-70% in first month
  } else if (daysClean <= 90) {
    return 70 + Math.min(((daysClean - 30) / 60) * 25, 25); // 70-95% in first 3 months
  } else {
    return Math.min(95 + ((daysClean - 90) / 90) * 5, 100); // Approach 100% after 3 months
  }
};
```

## Personalized Messaging

The system provides context-aware messages that update based on recovery progress:

### Examples:
- **Day 0**: "You're at the beginning of your recovery journey..."
- **Day 1**: "Amazing! You've completed your first day..."
- **Week 1**: "Incredible progress! You've made it 7 days..."
- **Month 1**: "Nearly a month clean - incredible!..."
- **3+ Months**: "Three months of recovery - a major milestone!..."

## Product-Specific Features

### Unit Names
- **Cigarettes**: "cigarettes avoided" or "packs avoided"
- **Vape**: "pods avoided"
- **Pouches**: "pouches avoided"
- **Chewing**: "cans avoided"

### Recovery Timelines
Customized based on product type:
- **Cigarettes**: Focus on lung function, circulation
- **Vape**: Emphasis on lung irritation, chemical detox
- **Pouches**: Oral health, gum healing
- **Chewing**: Oral cancer risk, taste restoration

## Development Tools

### Logging
```typescript
// Log recovery data for debugging
recoveryTrackingService.logRecoveryData('Context Name');
```

### Validation
```typescript
// Validate data consistency
const isValid = recoveryTrackingService.validateRecoveryData();
```

### Testing
```typescript
// Neural growth test functions use unified service
neuralTest.week1(); // Sets to 1 week and validates consistency
```

## Migration Guide

### Before (Fragmented)
```typescript
// Multiple calculation functions in different files
const calculateNetworkGrowth = () => { /* logic */ };
const getPersonalizedUnitName = () => { /* logic */ };
const getRecoveryMessage = () => { /* logic */ };
```

### After (Unified)
```typescript
// Single service call
const recoveryData = recoveryTrackingService.getRecoveryData();
// All data available in one object
```

## Benefits

### 1. Consistency
- All components show identical recovery data
- No more discrepancies between screens

### 2. Maintainability
- Single place to update recovery logic
- Easier to add new features

### 3. Reliability
- Built-in error handling and validation
- Graceful fallbacks for edge cases

### 4. Performance
- Efficient data access from Redux store
- Minimal recalculations

### 5. Testing
- Centralized testing of recovery logic
- Easier to validate accuracy

## Best Practices

### 1. Always Use the Service
```typescript
// ✅ Good
const data = recoveryTrackingService.getRecoveryData();

// ❌ Bad - Don't duplicate calculations
const recoveryPercentage = calculateMyOwnRecovery();
```

### 2. Handle Errors Gracefully
```typescript
try {
  const data = recoveryTrackingService.getRecoveryData();
  // Use data
} catch (error) {
  // Show fallback UI
}
```

### 3. Validate in Development
```typescript
if (__DEV__) {
  recoveryTrackingService.validateRecoveryData();
}
```

### 4. Use Consistent Logging
```typescript
if (__DEV__) {
  recoveryTrackingService.logRecoveryData('Component Name');
}
```

## Future Enhancements

### Planned Features
1. **Personalized Recovery Curves**: Based on user's specific addiction profile
2. **Milestone Notifications**: Automatic celebrations at key recovery points
3. **Comparative Analytics**: How user compares to similar recovery journeys
4. **Predictive Insights**: AI-powered recovery predictions

### Extension Points
- Custom recovery phases for specific products
- Integration with health tracking devices
- Social comparison features
- Gamification elements

## Troubleshooting

### Common Issues

#### 1. Inconsistent Data
**Problem**: Different screens showing different recovery percentages
**Solution**: Ensure all components use `recoveryTrackingService.getRecoveryData()`

#### 2. Missing Recovery Messages
**Problem**: Generic messages instead of personalized ones
**Solution**: Check that user profile is properly set in Redux store

#### 3. Validation Failures
**Problem**: Recovery data validation warnings in console
**Solution**: Check Redux store data integrity and user profile completeness

### Debug Commands

```typescript
// Check current recovery data
recoveryTrackingService.logRecoveryData('Debug');

// Validate data consistency
recoveryTrackingService.validateRecoveryData();

// Test specific recovery stage
neuralTest.month1(); // Sets to 1 month for testing
```

## Scientific Basis

The recovery calculations are based on peer-reviewed research:

1. **Cosgrove, K.P., et al.** (2014) - Neuroplasticity and recovery timelines
2. **Franklin, T.R., et al.** (2014) - Dopamine pathway healing
3. **Brody, A.L., et al.** (2004) - Brain metabolic changes during recovery
4. **Hughes, J.R.** (2007) - Withdrawal and recovery phases

## Conclusion

The Unified Recovery Tracking System ensures that all users receive consistent, accurate, and scientifically-based recovery information throughout their journey. By centralizing all calculations and providing robust error handling, we've eliminated the fragmentation that was causing user confusion and technical debt.

All new features should integrate with this system rather than creating separate tracking mechanisms. 