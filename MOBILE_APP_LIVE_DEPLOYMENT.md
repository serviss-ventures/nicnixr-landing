# 🚀 NixR Mobile App - LIVE Deployment Guide

## 🎯 What We've Built

A complete mobile app onboarding flow that:
- ✅ **Creates real user accounts** in Supabase
- ✅ **Tracks every step** of the conversion funnel
- ✅ **Saves all user data** to the database
- ✅ **Shows real-time analytics** in the admin dashboard
- ✅ **Supports A/B testing** and attribution tracking

## 📊 Database Tables Created

1. **onboarding_analytics** - Tracks every step (started, completed, abandoned)
2. **user_onboarding_data** - Stores all collected user information
3. **conversion_events** - Tracks key conversion events (signup, onboarding_complete)
4. **ab_test_assignments** - Records A/B test variants

## 🔥 Getting It Live (Staging Environment)

### 1. Set Up Supabase Project

```bash
# 1. Create a new Supabase project at https://app.supabase.com
# 2. Get your project URL and anon key
# 3. Create .env files in both mobile-app and admin-dashboard
```

**mobile-app/.env:**
```
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**admin-dashboard/.env.local:**
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

### 2. Run Database Migrations

```bash
# In Supabase SQL editor, run these in order:
1. admin-dashboard/supabase/01_initial_schema.sql
2. admin-dashboard/supabase/04_onboarding_analytics.sql
```

### 3. Deploy Mobile App (Expo)

```bash
cd mobile-app

# Install Expo CLI if needed
npm install -g expo-cli

# Build for testing
expo build:ios  # For iOS
expo build:android  # For Android

# Or use EAS Build (recommended)
npm install -g eas-cli
eas build --platform ios
eas build --platform android
```

### 4. Deploy Admin Dashboard (Vercel)

```bash
cd admin-dashboard

# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard
```

## 📱 Testing the Live App

### Mobile App Flow:
1. **Welcome Screen** → Tracks: Step 1 started
2. **Sign Up** → Creates Supabase user + tracks conversion event
3. **Demographics** → Saves age, gender, location
4. **Nicotine Profile** → Saves usage habits, costs
5. **Reasons & Fears** → Saves motivations
6. **Triggers** → Saves trigger patterns
7. **Past Attempts** → Saves quit history
8. **Quit Date** → Saves planned quit date
9. **Data Analysis** → Shows processing animation
10. **Blueprint Reveal** → Marks onboarding complete

### Admin Dashboard Views:
- **Onboarding Funnel** (http://localhost:3001/onboarding-analytics)
  - Real-time active users
  - Today's signups counter
  - Conversion rate percentage
  - Step-by-step funnel visualization
  - Drop-off analysis
  - Time per step metrics
  - Live activity feed

## 🎪 Demo Script for Your Team

```bash
# 1. Start everything
./start-editor.sh

# 2. Open admin dashboard
# Go to: http://localhost:3001/onboarding-analytics

# 3. Start mobile app
cd mobile-app && npm start
# Scan QR code with Expo Go app

# 4. Create a test user
# - Go through full onboarding
# - Watch the dashboard update in real-time
# - Show data being saved at each step
```

## 📈 What the Analytics Track

### Per User:
- Device info (iOS/Android, version, model)
- Time spent on each step
- Where they drop off
- Complete profile data
- Attribution source

### Aggregate Metrics:
- Conversion funnel (% completing each step)
- Average time to complete
- Drop-off points
- A/B test performance

## 🔍 Viewing the Data

### In Supabase:
```sql
-- See all signups today
SELECT * FROM conversion_events 
WHERE event_type = 'signup' 
AND created_at >= CURRENT_DATE;

-- See onboarding progress
SELECT * FROM onboarding_analytics 
ORDER BY created_at DESC;

-- See user profiles
SELECT * FROM user_onboarding_data;
```

### In Admin Dashboard:
- Real-time metrics update every 30 seconds
- Charts show last 30 days of data
- Live activity feed shows recent actions

## 🚨 Troubleshooting

### App not saving data?
1. Check Supabase connection in mobile-app/.env
2. Verify RLS policies are applied
3. Check Supabase logs for errors

### Analytics not showing?
1. Make sure migrations ran successfully
2. Check admin dashboard has service role key
3. Verify the RPC function was created

### User can't sign up?
1. Check Supabase auth settings
2. Enable email auth if disabled
3. Check for rate limiting

## 🎉 Success Metrics

When it's working, you'll see:
- ✅ Users appearing in Supabase auth.users table
- ✅ Each onboarding step tracked in onboarding_analytics
- ✅ User data saved in user_onboarding_data
- ✅ Real-time updates in admin dashboard
- ✅ Conversion events logged

## 🔥 Next Steps

1. **Deploy to TestFlight/Play Store Beta**
2. **Set up push notifications**
3. **Add Mixpanel/Amplitude integration**
4. **Create marketing attribution links**
5. **Set up automated email campaigns**

Your team won't believe this is real until they see users flowing through the funnel in real-time! 