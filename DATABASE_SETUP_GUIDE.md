# Complete Database Setup Guide for NixR

## Quick Setup Instructions

1. **Go to Supabase SQL Editor**
   - Open your Supabase project
   - Click "SQL Editor" in the left sidebar

2. **Run These SQL Files in Order:**
   - First: `01_initial_schema.sql` 
   - Second: `02_ai_coach_schema.sql`
   - Third: `03_journal_entries_fix.sql`

All your tables will be created! 🎉

## What Tables You'll Have

### 📊 Core User Data
1. **users** - User profiles, quit dates, substance types
2. **user_stats** - Money saved, cigarettes avoided, health gains
3. **journal_entries** - Daily check-ins (mood, cravings, sleep, etc.)
4. **achievements** - Badges and milestones unlocked

### 🤖 AI Coach System  
5. **ai_coach_sessions** - Conversation sessions
6. **ai_coach_messages** - Individual messages with sentiment
7. **ai_coach_analytics** - Dashboard metrics

### 👥 Community Features
8. **community_posts** - User posts in community feed
9. **post_comments** - Comments on posts
10. **post_loves** - Likes on posts
11. **buddy_relationships** - Buddy connections
12. **buddy_messages** - Direct messages between buddies

### 📱 App Features
13. **daily_tips** - Motivational tips by day count

## Quick Verification

After running the SQL files, verify everything worked:

```sql
-- Check all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see 13 tables!

## Test It Out

Create a test user to make sure everything works:

```sql
-- Create a test user (use the UUID from Supabase Auth)
INSERT INTO public.users (
  id, 
  email, 
  username, 
  substance_type, 
  quit_date
) VALUES (
  'YOUR-AUTH-USER-UUID', -- Get this from Authentication tab
  'test@example.com',
  'testuser',
  'cigarettes',
  NOW() - INTERVAL '7 days'
);
```

## What Each Table Stores

### users
- Profile info (username, avatar)
- Recovery data (quit date, days clean, streaks)
- Preferences (support styles, notifications)

### journal_entries
- Daily mood (yes/no)
- Craving intensity (1-10)
- Sleep quality & hours
- Energy levels
- Gratitude notes
- And 20+ other wellness metrics!

### ai_coach_messages
- Chat history with AI
- Sentiment analysis (positive/negative/crisis)
- Topics discussed (cravings, stress, etc.)
- Risk levels for intervention

### community_posts
- User stories and updates
- Anonymous posting option
- Love counts and comments

### buddy_relationships
- Matched accountability partners
- Pending/accepted/declined status
- Direct messaging between buddies

## Next Steps

Once tables are created:
1. ✅ Set up authentication in Supabase
2. ✅ Remove test bypasses in code
3. ✅ Configure storage for avatars
4. ✅ Test with real user accounts
5. ✅ Deploy to production!

## Need Help?

- **Tables not showing?** Make sure you're in the right Supabase project
- **Errors running SQL?** The tables might already exist (that's OK!)
- **Want to start fresh?** Drop all tables first (be careful!)

```sql
-- DANGER: This deletes everything!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
``` 