# Supabase Complete Setup Guide

This guide will walk you through setting up your Supabase database from scratch for the NixR app.

## 📋 Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project in Supabase
3. Wait for the project to finish provisioning

## 🚀 Step-by-Step Setup

### Step 1: Enable Authentication

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable **Email** authentication (it's usually enabled by default)
4. (Optional) Enable social providers like Google, Apple, etc.

### Step 2: Get Your API Keys

1. Go to **Settings** → **API**
2. Copy these values and add them to your environment files:

**For the mobile app** (`mobile-app/.env`):
```
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**For the admin dashboard** (`admin-dashboard/.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 3: Run the Initial Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New query**
3. Copy and paste the entire contents of `admin-dashboard/supabase/01_initial_schema.sql`
4. Click **Run** (or press Cmd/Ctrl + Enter)

This creates:
- ✅ Users table (extends Supabase auth)
- ✅ User stats tracking
- ✅ Achievements system
- ✅ Journal entries
- ✅ Community posts & comments
- ✅ Buddy system (relationships & messages)
- ✅ Daily tips
- ✅ All necessary indexes and RLS policies

### Step 4: Run the AI Coach Schema

1. Create another new query in SQL Editor
2. Copy and paste the entire contents of `admin-dashboard/supabase/02_ai_coach_schema.sql`
3. Click **Run**

This adds:
- ✅ AI coach sessions tracking
- ✅ AI coach messages with sentiment analysis
- ✅ AI coach analytics
- ✅ Crisis intervention tracking

### Step 5: (Optional) Add Sample Daily Tips

Create a new query and run this to add some sample daily tips:

```sql
INSERT INTO public.daily_tips (substance_type, day_range_start, day_range_end, title, content, category) VALUES
('all', 1, 1, 'Your Journey Begins', 'Today is day one of your incredible journey. Every journey starts with a single step, and you''ve just taken yours.', 'motivation'),
('all', 1, 3, 'Understanding Withdrawal', 'The first 72 hours can be challenging as your body adjusts. Remember: every craving you resist makes you stronger.', 'education'),
('cigarettes', 1, 7, 'Breathing Easier', 'Your lungs are already starting to clear. Take deep breaths and notice how each one gets a little easier.', 'health'),
('vape', 1, 7, 'Breaking the Habit', 'Vaping often becomes a hand-to-mouth habit. Try holding a pen or stress ball when you feel the urge.', 'tips'),
('nicotine_pouches', 1, 7, 'Oral Fixation', 'Try sugar-free gum or toothpicks to satisfy the oral fixation that comes with pouch use.', 'tips'),
('chew_dip', 1, 7, 'Healing Begins', 'Your gums and mouth tissues are beginning to heal. Stay hydrated to help the process.', 'health'),
('all', 7, 14, 'One Week Strong', 'You''ve made it a full week! Your body has eliminated most of the nicotine. You''re officially over the hardest part.', 'milestone'),
('all', 30, 30, 'One Month Free', 'A full month nicotine-free! Your risk of heart attack has already started to drop. Celebrate this amazing achievement!', 'milestone');
```

### Step 6: Enable Realtime (Optional but Recommended)

1. Go to **Database** → **Replication**
2. Enable replication for these tables:
   - `community_posts` (for live community feed)
   - `community_comments` (for live comments)
   - `buddy_messages` (for real-time chat)
   - `ai_coach_messages` (for AI chat)

### Step 7: Test Your Setup

1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter a test email and password
4. Go to **Table Editor** → **users**
5. You should see the test user automatically created!

## 🔍 Verify Everything is Working

Run this query in SQL Editor to check your tables:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- achievements
- ai_coach_analytics
- ai_coach_messages
- ai_coach_sessions
- buddy_messages
- buddy_relationships
- community_comments
- community_loves
- community_posts
- daily_tips
- journal_entries
- user_stats
- users

## 🎉 You're Ready!

Your Supabase database is now fully set up with:
- ✅ User authentication system
- ✅ Complete user profiles and stats
- ✅ Community features
- ✅ Buddy system
- ✅ Journal system
- ✅ AI Coach with analytics
- ✅ Row Level Security for data protection

## 🚨 Troubleshooting

### "Permission denied" errors
- Make sure Row Level Security policies are properly set
- Check that you're using the correct API keys

### Tables not showing up
- Refresh the Table Editor page
- Check the SQL query results for any errors
- Make sure you ran the queries in order (01 first, then 02)

### Can't create users
- Ensure email authentication is enabled
- Check that the trigger `on_auth_user_created` was created successfully

## 📚 Next Steps

1. Update your mobile app to use Supabase authentication
2. Test the AI Coach integration
3. Start populating daily tips for your users
4. Configure email templates in Authentication → Email Templates 