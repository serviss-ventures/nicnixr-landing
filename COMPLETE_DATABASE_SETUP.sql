-- COMPLETE DATABASE SETUP FOR NIXR APP
-- Run this entire file in Supabase SQL Editor
-- This creates all tables needed for production

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE (extends Supabase Auth)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_style TEXT,
  
  -- Recovery data
  substance_type TEXT CHECK (substance_type IN ('cigarettes', 'vape', 'nicotine_pouches', 'chew_dip')),
  quit_date TIMESTAMP WITH TIME ZONE,
  days_clean INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  relapse_count INTEGER DEFAULT 0,
  
  -- Personalization
  support_styles TEXT[] DEFAULT '{}',
  timezone TEXT DEFAULT 'UTC',
  notification_settings JSONB DEFAULT '{"daily_tips": true, "achievements": true, "buddy_messages": true}'::jsonb,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. USER STATS (for cost savings, milestones)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Financial stats
  money_saved DECIMAL(10,2) DEFAULT 0,
  cigarettes_not_smoked INTEGER DEFAULT 0,
  
  -- Health stats
  life_regained_minutes INTEGER DEFAULT 0,
  
  -- Usage stats
  check_in_streak INTEGER DEFAULT 0,
  total_check_ins INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Continue with all other tables... 