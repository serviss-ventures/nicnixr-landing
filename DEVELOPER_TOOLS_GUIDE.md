# NixR Developer Tools Guide

## Overview
This guide covers all developer tools available for testing the NixR app. These tools are essential for comprehensive testing before launch.

## 🧪 Progress Test Tools

### Basic Usage
```javascript
// Set specific days clean
progressTest.setDays(30)

// Change nicotine type
progressTest.setType('vape')  // Options: 'cigarettes', 'vape', 'pouches', 'chew_dip'

// Quick shortcuts
progressTest.cigarettes()  // Switch to cigarettes
progressTest.vape()        // Switch to vaping
progressTest.pouches()     // Switch to pouches
progressTest.dip()         // Switch to dip/chew

// Time period shortcuts
progressTest.day0()    // Start of journey
progressTest.day1()    // Day 1
progressTest.day3()    // Day 3
progressTest.week1()   // 1 week
progressTest.week2()   // 2 weeks
progressTest.week3()   // 3 weeks
progressTest.month1()  // 1 month
progressTest.month2()  // 2 months
progressTest.month3()  // 3 months
progressTest.month6()  // 6 months
progressTest.month9()  // 9 months
progressTest.year1()   // 1 year
progressTest.year2()   // 2 years
progressTest.year5()   // 5 years
progressTest.year10()  // 10 years

// Show recovery progression
progressTest.progression()

// Reset to day 0
progressTest.reset()
```

### What Gets Updated
When you change days or nicotine type:
- ✅ Redux store updates
- ✅ AsyncStorage updates
- ✅ Supabase user stats sync
- ✅ Achievements checked and unlocked
- ✅ Milestones updated
- ✅ Progress calculations (money saved, health score, etc.)
- ✅ UI refreshes automatically

## 🔄 App Reset Tools

```javascript
// Full reset with no confirmation
appReset.full()

// Reset with confirmation dialog
appReset.confirm()

// Quick reset for development
appReset.quick()

// Instant dev reset (recommended)
appReset.dev()
```

### What Gets Cleared
- User authentication (signs out from Supabase)
- All AsyncStorage data
- Redux state (returns to onboarding step 1)
- Push notification tokens
- All cached data

## 🧬 System Test Suite

### Run Comprehensive Test
```javascript
testAll()
```

This tests:
1. Supabase connection
2. Progress system
3. Achievement system
4. Notification system
5. Nicotine type switching

### Test Specific Scenarios
```javascript
// Test 30 days with cigarettes
testScenarios.day30Cigarettes()

// Test 7 days with vaping
testScenarios.day7Vape()

// Test 90 days with pouches
testScenarios.day90Pouches()

// Test 1 year with dip
testScenarios.yearDip()
```

## 🏆 Achievement Tools

```javascript
// Fix achievement issues
fixAchievements()
```

This will:
- Create user_stats if missing
- Check all achievement criteria
- Unlock any earned achievements
- Sync with Supabase

## 📱 Notification Testing

Navigate to: Profile → Settings → Developer Tools → Test Notifications

Or use the test functions:
- Send test push notification
- Create milestone notification
- Create buddy request notification
- Schedule all notifications
- Clear all scheduled notifications

## 🧪 Testing Workflow for Tomorrow

### 1. Basic Functionality Test
```javascript
// First, run comprehensive test
testAll()

// If any systems fail, investigate specific issues
```

### 2. Test Different User Journeys
```javascript
// Test cigarette user at 30 days
testScenarios.day30Cigarettes()
// Check: Achievements tab, milestones, recovery info

// Test vape user at 7 days
testScenarios.day7Vape()
// Check: Product-specific milestones, health benefits

// Test long-term recovery
progressTest.year1()
// Check: All achievements unlocked, milestone messages
```

### 3. Test Edge Cases
```javascript
// Test day 0
progressTest.day0()

// Test switching products mid-journey
progressTest.setDays(30)
progressTest.vape()  // Switch from default to vape

// Test reset functionality
appReset.dev()
// App should return to onboarding
```

### 4. Achievement Testing
```javascript
// Set different days and check achievements
progressTest.day1()   // Should unlock "First Day Hero"
progressTest.week1()  // Should unlock "Week Warrior"
progressTest.month1() // Should unlock "Month Master"

// If achievements don't show, run:
fixAchievements()
```

## 🐛 Troubleshooting

### Achievements not updating?
1. Run `fixAchievements()`
2. Check console for errors
3. Verify user is logged in with `testAll()`

### Progress not syncing?
1. Check Supabase connection with `testAll()`
2. Look for sync errors in console
3. Try `progressTest.setDays(X)` again

### App in weird state?
1. Run `appReset.dev()`
2. Restart the app
3. Start fresh testing

### Notifications not working?
1. Check permissions in device settings
2. Navigate to notification test screen
3. Try "Send Test Push Notification"

## 📊 What to Check After Each Test

1. **Home Screen**: Days clean, money saved, health score
2. **Progress Tab**: 
   - Journey tab: Milestones, recovery phase
   - Achievements tab: Unlocked badges, progress
3. **Profile**: Achievement count, stats
4. **Community**: Make sure posts load properly
5. **AI Coach**: Verify it recognizes progress level

## 🚀 Launch Day Checklist

Before launch, ensure:
- [ ] `testAll()` shows all systems operational
- [ ] All 4 nicotine types work correctly
- [ ] Achievements unlock at correct milestones
- [ ] Notifications can be sent and received
- [ ] App reset returns to clean onboarding
- [ ] No console errors during normal use
- [ ] Supabase sync works reliably

---

Remember: All these tools only work in development mode. They will not be available in the production build. 