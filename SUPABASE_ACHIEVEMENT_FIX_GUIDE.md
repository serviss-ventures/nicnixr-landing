# Supabase Achievement System Fix Guide

## Overview
The achievement system is missing some required tables and columns. Follow these steps to fix the errors.

## Quick Fix - Single Migration

I've created a complete migration that handles everything in the correct order:

### Migration: `admin-dashboard/supabase/27_complete_achievement_system_fix.sql`

This single migration does everything:
- Adds missing columns to `user_stats` table (days_clean, health_score, cravings_resisted, total_points)
- Creates the `achievement_definitions` table
- Inserts all 16 badge definitions
- Recreates the `achievements` table with proper structure including the `badge_id` column
- Creates all necessary functions for achievement management
- Sets up RLS policies and permissions
- Creates triggers to auto-update days_clean based on quit_date

## How to Apply

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the entire contents of `27_complete_achievement_system_fix.sql`
4. Paste and run it
5. You should see "Achievement system setup complete!" at the end

### Option 2: Using psql
```bash
# From the admin-dashboard directory
psql "your-database-url" -f supabase/27_complete_achievement_system_fix.sql
```

### Option 3: Using Supabase CLI
```bash
# From the admin-dashboard directory
supabase db push --db-url "your-database-url" < supabase/27_complete_achievement_system_fix.sql
```

## Verification
After applying the migration, verify everything works:

1. Check that the `achievement_definitions` table exists with 16 badges:
   ```sql
   SELECT COUNT(*) FROM achievement_definitions;
   -- Should return 16
   ```

2. Check that `user_stats` has the new columns:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'user_stats' 
   AND column_name IN ('days_clean', 'health_score', 'cravings_resisted', 'total_points');
   -- Should return 4 rows
   ```

3. Check that the `achievements` table has the `badge_id` column:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'achievements' 
   AND column_name = 'badge_id';
   -- Should return 1 row
   ```

4. The app should no longer show any achievement-related errors

## What This Migration Fixes
- ✅ Missing `achievement_definitions` table
- ✅ Missing `days_clean` column in user_stats
- ✅ Missing `badge_id` column in achievements table
- ✅ Badge progress showing incorrect values
- ✅ 0 points and 0% completion issues
- ✅ Automatic days_clean calculation based on quit_date
- ✅ "relation public.achievement_definitions does not exist" error

## Alternative: Individual Migrations
If you prefer to run the migrations separately (not recommended), you can use:
1. `25_comprehensive_achievement_fix.sql` - Creates tables and columns
2. `26_fix_achievements_table.sql` - Fixes achievements table structure

But the complete migration (`27_complete_achievement_system_fix.sql`) is safer as it handles everything in the correct order. 