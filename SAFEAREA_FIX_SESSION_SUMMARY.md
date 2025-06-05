# SafeAreaView Fix Session Summary

## Date: January 7, 2025

### Issue
The Recovery Journal's back button was appearing behind the iPhone's clock/status bar on first load, but displaying correctly on subsequent loads.

### Root Cause
The component hierarchy was different between Recovery Journal and Recovery Overview:
- **Recovery Journal**: SafeAreaView > LinearGradient > Content
- **Recovery Overview**: LinearGradient > SafeAreaView > Content

This ordering caused SafeAreaView to not properly apply safe area insets when the gradient was a child component.

### Solution
Restructured the Recovery Journal component hierarchy to match the working Recovery Overview pattern:

```jsx
// Before:
<Modal>
  <SafeAreaView edges={['top', 'left', 'right', 'bottom']}>
    <LinearGradient>
      <KeyboardAvoidingView>
        {/* Header with back button */}
      </KeyboardAvoidingView>
    </LinearGradient>
  </SafeAreaView>
</Modal>

// After:
<Modal>
  <LinearGradient>
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView>
        {/* Header with back button */}
      </KeyboardAvoidingView>
    </SafeAreaView>
  </LinearGradient>
</Modal>
```

### Key Points
1. **LinearGradient must be the outermost component** (after Modal) for proper safe area handling
2. **SafeAreaView with edges prop** ensures content respects device safe areas
3. **Consistent structure** between modals prevents similar issues

### Files Modified
- `mobile-app/src/components/dashboard/RecoveryJournal.tsx`

### Result
✅ Back button no longer appears behind status bar on any device
✅ Consistent behavior between first load and subsequent loads
✅ Matches the working pattern used in Recovery Overview modal 