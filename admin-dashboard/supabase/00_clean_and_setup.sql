-- Clean and Setup Script for NixR Database
-- This script safely drops existing objects before recreating them

-- Drop existing triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users CASCADE;
DROP TRIGGER IF EXISTS update_journal_entries_updated_at ON public.journal_entries CASCADE;
DROP TRIGGER IF EXISTS update_community_posts_updated_at ON public.community_posts CASCADE;
DROP TRIGGER IF EXISTS update_buddy_relationships_updated_at ON public.buddy_relationships CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_days_clean() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Drop existing indexes
DROP INDEX IF EXISTS public.idx_users_email;
DROP INDEX IF EXISTS public.idx_user_stats_user_date;
DROP INDEX IF EXISTS public.idx_achievements_user;
DROP INDEX IF EXISTS public.idx_journal_entries_user_date;
DROP INDEX IF EXISTS public.idx_community_posts_created;
DROP INDEX IF EXISTS public.idx_community_posts_user;
DROP INDEX IF EXISTS public.idx_buddy_relationships_users;
DROP INDEX IF EXISTS public.idx_buddy_messages_users;

-- Drop existing tables (in reverse dependency order)
DROP TABLE IF EXISTS public.buddy_messages CASCADE;
DROP TABLE IF EXISTS public.buddy_relationships CASCADE;
DROP TABLE IF EXISTS public.community_loves CASCADE;
DROP TABLE IF EXISTS public.community_comments CASCADE;
DROP TABLE IF EXISTS public.community_posts CASCADE;
DROP TABLE IF EXISTS public.journal_entries CASCADE;
DROP TABLE IF EXISTS public.achievements CASCADE;
DROP TABLE IF EXISTS public.user_stats CASCADE;
DROP TABLE IF EXISTS public.daily_tips CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop AI Coach tables if they exist
DROP TABLE IF EXISTS public.ai_coach_analytics CASCADE;
DROP TABLE IF EXISTS public.ai_coach_messages CASCADE;
DROP TABLE IF EXISTS public.ai_coach_sessions CASCADE;

-- Now run the setup scripts
-- You should run these after this cleanup:
-- 1. 01_initial_schema.sql
-- 2. 02_ai_coach_schema.sql
-- 3. 03_journal_entries_fix.sql 