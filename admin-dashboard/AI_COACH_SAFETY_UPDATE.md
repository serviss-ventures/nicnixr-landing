# AI Coach Safety Update - Critical Risk Assessment Fix

## Date: January 13, 2025

## Issue Identified
The AI Coach was incorrectly classifying messages with self-harm implications as "low risk". This was a critical safety failure that could have serious consequences.

### Example Case
- User ID: 258b1f2a-5246-4a93-a04b-82ffb242bc80
- Message implied self-harm
- System classified as: **low risk** ❌
- Should have been: **critical** ✅

## Root Cause
The `assessRiskLevel()` and `analyzeSentiment()` functions in both the admin dashboard API and mobile app were missing self-harm detection keywords.

## Changes Made

### 1. Enhanced Risk Assessment (`assessRiskLevel`)
Added comprehensive self-harm detection:
```javascript
const selfHarmKeywords = [
  'hurt myself', 'hurt me', 'harm myself', 'harm me',
  'kill myself', 'kill me', 'suicide', 'suicidal',
  'end it all', 'end my life', 'not worth living',
  'better off dead', 'want to die', 'wish i was dead',
  'no point', 'no reason to live', 'can\'t go on',
  'overdose', 'od', 'cut myself', 'cutting'
];
```

### 2. Updated Sentiment Analysis
- Added same self-harm keywords to sentiment analysis
- Ensures crisis sentiment is detected alongside risk level

### 3. Enhanced System Prompt
Added critical safety protocol to AI system prompt:
- Express genuine concern
- Provide crisis resources (988 lifeline)
- Ask "Are you safe right now?"
- Connect to professional help
- Never minimize crisis

### 4. Risk Level Categories
- **Critical**: Self-harm, suicide ideation, relapse intent
- **High**: Strong cravings, about to use, buying substances
- **Medium**: General cravings, stress, anxiety, depression
- **Low**: General conversation

## Files Updated
1. `/admin-dashboard/src/app/api/ai-coach/chat/route.ts`
2. `/mobile-app/src/services/aiCoachService.ts`

## Testing Required
1. Test with various self-harm phrases to ensure critical detection
2. Verify AI responds appropriately with crisis resources
3. Check that intervention is triggered for critical cases
4. Monitor false positive rate

## Future Improvements
1. Add more nuanced risk detection
2. Implement automatic escalation to human support
3. Add regional crisis resources
4. Create audit trail for all critical interactions
5. Implement real-time alerting for crisis situations

## Crisis Resources
- US: National Suicide Prevention Lifeline - 988
- US: Crisis Text Line - Text HOME to 741741
- Emergency: 911

## Important Note
This is a life-critical system. Any changes to risk assessment must be:
1. Thoroughly tested
2. Reviewed by multiple team members
3. Monitored closely after deployment
4. Documented completely 