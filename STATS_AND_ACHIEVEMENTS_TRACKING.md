# Stats and Achievements Tracking - Supabase Integration

## Overview
Your NixR app now syncs all user progress stats and achievements to Supabase for cloud persistence and cross-device sync.

## What's Being Tracked

### 📊 Daily Stats (user_stats table)
- **Money Saved**: Calculated based on daily cost × days clean
- **Substances Avoided**: Units avoided (cigarettes, pouches, etc.)
- **Health Improvements**: JSON object containing:
  - Health score (0-100)
  - Life regained (in hours)
  - Days clean
  - Streak days
  - Longest streak
  - Recovery strength
  - Improvement trend

### 🏆 Achievements (achievements table)
- **Achievement Type**: Category of the badge (milestone, streak, health, etc.)
- **Achievement Name**: Name of the specific badge
- **Unlocked At**: Timestamp when achieved
- **Milestone Value**: The requirement that was met

## How It Works

1. **Automatic Syncing**: Every time the app updates progress (on app launch, daily), it syncs to Supabase
2. **Achievement Detection**: Middleware automatically checks for new achievements when stats update
3. **Offline Support**: Data is still saved locally first, then synced when online

## Verification Steps

### Mobile App
1. Open the app and check your home screen stats
2. Force quit and reopen the app - stats should persist
3. Check "Your Journey" screen - achievements should be saved

### Admin Dashboard  
Check the API endpoint: `http://localhost:3001/api/users/stats`
- View aggregate stats for all users
- Add `?userId=<user-id>` to see specific user stats
- Add `?days=7` to change the time range

### Direct Database Check
In Supabase Dashboard:
1. Go to Table Editor
2. Check `user_stats` table - should see daily entries
3. Check `achievements` table - should see unlocked badges

## Troubleshooting

### Stats Not Syncing?
1. Ensure user is authenticated (has a valid user ID)
2. Check network connectivity
3. Look for console errors in the app

### Achievements Not Unlocking?
1. Verify the user has met the requirements
2. Check that the badge ID matches between app and database
3. Ensure the middleware is properly registered in the store

## Future Enhancements
- Historical stats graphs in admin dashboard
- Achievement leaderboards
- Export stats to CSV
- Push notifications for achievements 