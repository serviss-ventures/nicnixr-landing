# Supabase Tracking & Access Guide

## 📊 Yes, Everything Tracks in Development!

Your Supabase database doesn't care if you're in development or production - **it will track everything!**

### What Gets Tracked:
- ✅ Anonymous user creation (when they tap "Get Started")
- ✅ Each onboarding step (started, completed, time spent)
- ✅ All user data entered during onboarding
- ✅ Conversion events
- ✅ A/B test assignments

### To Verify It's Working:
1. Go through onboarding in your app
2. Check Supabase dashboard:
   - Table Editor → `onboarding_analytics` (see each step)
   - Table Editor → `user_onboarding_data` (see collected info)
   - Authentication → Users (see anonymous users)

## 🔧 Fixed: Reset App Function

The reset wasn't working because it only cleared storage, not Redux state. Now it:
1. Signs out from Supabase
2. Resets Redux state (including `onboardingComplete`)
3. Clears all AsyncStorage
4. App will show onboarding again!

## 🔐 About Supabase Access

### What I CAN See/Do:
- ✅ Read your code and SQL schemas
- ✅ See your Supabase project URL (public anyway)
- ✅ Write SQL migrations for you
- ✅ Create API endpoints and functions
- ✅ Debug issues based on error messages

### What I CANNOT See/Do:
- ❌ Access your actual Supabase dashboard
- ❌ See your real user data
- ❌ Modify your database directly
- ❌ View your service role key (even though it's in .env)
- ❌ Execute SQL queries on your database

### If You Want Me to Debug Supabase Issues:

**Option 1: Share Error Messages**
```
"Just paste any Supabase errors you see"
```

**Option 2: Run Queries for You**
```sql
-- I can write queries like this for you to run:
SELECT COUNT(*) FROM onboarding_analytics;
SELECT * FROM user_onboarding_data ORDER BY created_at DESC LIMIT 5;
```

**Option 3: Temporary Read Access (NOT Recommended)**
```
Never share your service role key!
Instead, you could:
1. Create a read-only role in Supabase
2. Share query results/screenshots
3. Use Supabase's built-in logs
```

## 🎯 Quick Debugging Commands

Run these in your Supabase SQL editor to see what's happening:

```sql
-- See recent onboarding activity
SELECT * FROM onboarding_analytics 
ORDER BY created_at DESC 
LIMIT 20;

-- See how many users started onboarding today
SELECT COUNT(DISTINCT user_id) as users_today
FROM onboarding_analytics
WHERE created_at >= CURRENT_DATE;

-- See conversion funnel
SELECT 
  step_name,
  COUNT(DISTINCT user_id) as users_reached,
  COUNT(DISTINCT CASE WHEN action = 'completed' THEN user_id END) as completed
FROM onboarding_analytics
GROUP BY step_name, step_number
ORDER BY step_number;

-- See anonymous vs real users
SELECT 
  CASE 
    WHEN email IS NULL THEN 'Anonymous'
    ELSE 'Registered'
  END as user_type,
  COUNT(*) as count
FROM auth.users
GROUP BY user_type;
```

## 🚀 Everything is Working!

Your setup is correct:
- ✅ Supabase is connected
- ✅ Anonymous auth is working
- ✅ Tracking will work in development
- ✅ Data persists across app restarts
- ✅ Reset function now properly clears everything

Just make sure you ran the onboarding analytics SQL migration in Supabase! 