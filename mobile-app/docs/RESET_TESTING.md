# Reset Testing Guide

## 🔄 **Available Reset Functions**

### **Console Commands (Development Only)**

Open the console in your development environment and use these commands:

```javascript
// Complete reset - clears everything and resets Redux state
appReset.full()

// Reset with confirmation dialog
appReset.confirm()

// Quick development reset
appReset.quick()

// Instant dev reset (most comprehensive)
appReset.dev()
```

### **In-App Reset Options**

1. **Profile Screen → Dev Reset Button** (Development only)
   - Red button in profile screen when `__DEV__` is true
   - Performs complete reset including Redux state
   - Should immediately return to onboarding

2. **Profile Screen → Sign Out Button**
   - Regular sign out with confirmation
   - Clears data and returns to onboarding

## 🧪 **Testing Different Onboarding Flows**

### **What Gets Reset:**
- ✅ Redux state (auth, onboarding, progress)
- ✅ AsyncStorage data
- ✅ Redux Persist data
- ✅ User authentication
- ✅ Onboarding progress
- ✅ All app preferences

### **Testing Steps:**

1. **Complete Onboarding First**
   - Go through entire onboarding flow
   - Reach the main dashboard

2. **Reset to Test Alternative Flows**
   ```javascript
   // In console:
   appReset.dev()
   ```
   - OR use the "Dev Reset" button in Profile screen

3. **Verify Reset Worked**
   - App should show onboarding welcome screen
   - No user data should be present
   - All progress should be cleared

4. **Test Different Paths**
   - Try different nicotine products
   - Test different reasons for quitting
   - Try various goal combinations
   - Test different personalization options

## 🚨 **If Reset Doesn't Work**

### **Manual Fallback:**
```javascript
// Nuclear option - clears everything
await AsyncStorage.clear()
// Then restart the app manually
```

### **Check These:**
1. **Redux State**: Make sure all slices have reset actions
2. **Navigation**: Verify RootNavigator correctly shows onboarding
3. **Persist**: Ensure Redux Persist isn't immediately restoring old state

### **Debug Logs:**
Look for these in console:
```
🧹 CLEARING ALL APP STATE...
🔄 Resetting Redux state...
✅ Redux state reset to initial values
✅ AsyncStorage cleared
✅ Redux Persist state cleared!
```

## 🔧 **Advanced Testing**

### **Test Specific Scenarios:**

1. **Different Nicotine Products:**
   - Reset → Choose Cigarettes → Complete onboarding
   - Reset → Choose Vape → Complete onboarding  
   - Reset → Choose Pouches → Complete onboarding
   - Compare different progress tracking

2. **Different Motivations:**
   - Reset → Choose Health focus → See health-centric content
   - Reset → Choose Financial → See money-saving content
   - Reset → Choose Family → See family-focused messaging

3. **Different Goals:**
   - Reset → Select minimal goals → See simplified experience
   - Reset → Select all goals → See comprehensive tracking

### **Automation (Future):**
```javascript
// Future: Automated testing helper
const testScenarios = [
  { product: 'cigarettes', goals: ['health', 'money'] },
  { product: 'vape', goals: ['freedom', 'family'] },
  { product: 'pouches', goals: ['health'] }
]

// Auto-run through scenarios
for (const scenario of testScenarios) {
  await appReset.dev()
  await simulateOnboarding(scenario)
  await verifyResults(scenario)
}
```

## 📱 **Platform-Specific Notes**

### **iOS Simulator:**
- Reset works immediately
- No app restart required
- Console commands work in Chrome DevTools

### **Android Emulator:**
- Reset works immediately  
- Console commands work in Chrome DevTools
- May need manual navigation refresh

### **Physical Device:**
- Reset works via in-app buttons
- Use Profile → Dev Reset button
- Console commands work via remote debugging

---

**Last Updated**: January 2025  
**Tested On**: iOS Simulator, React Native 0.72+ 