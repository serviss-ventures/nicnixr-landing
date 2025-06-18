-- NixR Journal Entries Table Fix
-- Run this in your Supabase SQL editor to ensure the journal_entries table has all required columns

-- First, let's check if the anxiety_level column exists and add it if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'journal_entries' 
    AND column_name = 'anxiety_level'
  ) THEN
    ALTER TABLE public.journal_entries 
    ADD COLUMN anxiety_level INTEGER CHECK (anxiety_level >= 1 AND anxiety_level <= 10);
  END IF;
END $$;

-- Let's also ensure all other columns exist (in case any are missing)

-- Core Mental Health columns
DO $$ 
BEGIN
  -- mood_positive
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journal_entries' AND column_name = 'mood_positive') THEN
    ALTER TABLE public.journal_entries ADD COLUMN mood_positive BOOLEAN;
  END IF;
  
  -- had_cravings
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journal_entries' AND column_name = 'had_cravings') THEN
    ALTER TABLE public.journal_entries ADD COLUMN had_cravings BOOLEAN;
  END IF;
  
  -- craving_intensity
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journal_entries' AND column_name = 'craving_intensity') THEN
    ALTER TABLE public.journal_entries ADD COLUMN craving_intensity INTEGER CHECK (craving_intensity >= 1 AND craving_intensity <= 10);
  END IF;
  
  -- stress_high
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journal_entries' AND column_name = 'stress_high') THEN
    ALTER TABLE public.journal_entries ADD COLUMN stress_high BOOLEAN;
  END IF;
END $$;

-- Core Physical columns
DO $$ 
BEGIN
  -- sleep_quality
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journal_entries' AND column_name = 'sleep_quality') THEN
    ALTER TABLE public.journal_entries ADD COLUMN sleep_quality BOOLEAN;
  END IF;
  
  -- sleep_hours
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journal_entries' AND column_name = 'sleep_hours') THEN
    ALTER TABLE public.journal_entries ADD COLUMN sleep_hours NUMERIC(3,1) CHECK (sleep_hours >= 0 AND sleep_hours <= 24);
  END IF;
  
  -- energy_level
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journal_entries' AND column_name = 'energy_level') THEN
    ALTER TABLE public.journal_entries ADD COLUMN energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10);
  END IF;
END $$;

-- Core Behavioral columns
DO $$ 
BEGIN
  -- triggers_encountered
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journal_entries' AND column_name = 'triggers_encountered') THEN
    ALTER TABLE public.journal_entries ADD COLUMN triggers_encountered BOOLEAN;
  END IF;
  
  -- coping_strategies_used
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journal_entries' AND column_name = 'coping_strategies_used') THEN
    ALTER TABLE public.journal_entries ADD COLUMN coping_strategies_used BOOLEAN;
  END IF;
END $$;

-- Additional Mental Health columns
DO $$ 
BEGIN
  -- used_breathing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journal_entries' AND column_name = 'used_breathing') THEN
    ALTER TABLE public.journal_entries ADD COLUMN used_breathing BOOLEAN;
  END IF;
  
  -- meditation_minutes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journal_entries' AND column_name = 'meditation_minutes') THEN
    ALTER TABLE public.journal_entries ADD COLUMN meditation_minutes INTEGER DEFAULT 0 CHECK (meditation_minutes >= 0);
  END IF;
  
  -- mood_swings
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journal_entries' AND column_name = 'mood_swings') THEN
    ALTER TABLE public.journal_entries ADD COLUMN mood_swings BOOLEAN;
  END IF;
  
  -- irritability
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journal_entries' AND column_name = 'irritability') THEN
    ALTER TABLE public.journal_entries ADD COLUMN irritability BOOLEAN;
  END IF;
  
  -- concentration
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journal_entries' AND column_name = 'concentration') THEN
    ALTER TABLE public.journal_entries ADD COLUMN concentration INTEGER CHECK (concentration >= 1 AND concentration <= 10);
  END IF;
END $$;

-- Additional Physical columns
DO $$ 
BEGIN
  -- water_glasses
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journal_entries' AND column_name = 'water_glasses') THEN
    ALTER TABLE public.journal_entries ADD COLUMN water_glasses INTEGER DEFAULT 0 CHECK (water_glasses >= 0);
  END IF;
  
  -- exercised
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journal_entries' AND column_name = 'exercised') THEN
    ALTER TABLE public.journal_entries ADD COLUMN exercised BOOLEAN;
  END IF;
  
  -- exercise_minutes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journal_entries' AND column_name = 'exercise_minutes') THEN
    ALTER TABLE public.journal_entries ADD COLUMN exercise_minutes INTEGER DEFAULT 0 CHECK (exercise_minutes >= 0);
  END IF;
  
  -- appetite
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journal_entries' AND column_name = 'appetite') THEN
    ALTER TABLE public.journal_entries ADD COLUMN appetite INTEGER CHECK (appetite >= 1 AND appetite <= 10);
  END IF;
  
  -- headaches
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journal_entries' AND column_name = 'headaches') THEN
    ALTER TABLE public.journal_entries ADD COLUMN headaches BOOLEAN;
  END IF;
END $$;

-- Additional Behavioral columns
DO $$ 
BEGIN
  -- social_support
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journal_entries' AND column_name = 'social_support') THEN
    ALTER TABLE public.journal_entries ADD COLUMN social_support BOOLEAN;
  END IF;
  
  -- avoided_triggers
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journal_entries' AND column_name = 'avoided_triggers') THEN
    ALTER TABLE public.journal_entries ADD COLUMN avoided_triggers BOOLEAN;
  END IF;
  
  -- productive_day
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journal_entries' AND column_name = 'productive_day') THEN
    ALTER TABLE public.journal_entries ADD COLUMN productive_day BOOLEAN;
  END IF;
END $$;

-- Additional Wellness text columns
DO $$ 
BEGIN
  -- grateful_for
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journal_entries' AND column_name = 'grateful_for') THEN
    ALTER TABLE public.journal_entries ADD COLUMN grateful_for TEXT;
  END IF;
  
  -- biggest_challenge
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journal_entries' AND column_name = 'biggest_challenge') THEN
    ALTER TABLE public.journal_entries ADD COLUMN biggest_challenge TEXT;
  END IF;
  
  -- tomorrow_goal
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journal_entries' AND column_name = 'tomorrow_goal') THEN
    ALTER TABLE public.journal_entries ADD COLUMN tomorrow_goal TEXT;
  END IF;
  
  -- notes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'journal_entries' AND column_name = 'notes') THEN
    ALTER TABLE public.journal_entries ADD COLUMN notes TEXT;
  END IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'journal_entries'
ORDER BY ordinal_position;

-- Count how many journal entries exist
SELECT COUNT(*) as total_entries FROM public.journal_entries;

-- Show a sample of recent entries (if any)
SELECT entry_date, user_id, mood_positive, had_cravings, anxiety_level
FROM public.journal_entries
ORDER BY entry_date DESC
LIMIT 5; 