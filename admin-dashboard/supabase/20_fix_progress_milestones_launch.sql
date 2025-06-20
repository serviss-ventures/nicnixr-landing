-- Fix progress_milestones table for launch
-- This migration ensures the progress_milestones table has all required columns

-- First, check if the table exists and create it if not
CREATE TABLE IF NOT EXISTS public.progress_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_day INTEGER NOT NULL,
  milestone_title TEXT NOT NULL,
  milestone_description TEXT,
  is_achieved BOOLEAN DEFAULT false,
  achieved_at TIMESTAMPTZ,
  gender_specific_content JSONB DEFAULT '{}',
  nicotine_type_content JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, milestone_day)
);

-- Add columns if they don't exist (safe migration)
DO $$ 
BEGIN
  -- Add gender_specific_content if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'progress_milestones' 
    AND column_name = 'gender_specific_content'
  ) THEN
    ALTER TABLE public.progress_milestones 
    ADD COLUMN gender_specific_content JSONB DEFAULT '{}';
  END IF;

  -- Add milestone_day if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'progress_milestones' 
    AND column_name = 'milestone_day'
  ) THEN
    ALTER TABLE public.progress_milestones 
    ADD COLUMN milestone_day INTEGER NOT NULL DEFAULT 0;
  END IF;

  -- Add nicotine_type_content if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'progress_milestones' 
    AND column_name = 'nicotine_type_content'
  ) THEN
    ALTER TABLE public.progress_milestones 
    ADD COLUMN nicotine_type_content JSONB DEFAULT '{}';
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_progress_milestones_user_id ON public.progress_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_milestones_day ON public.progress_milestones(milestone_day);

-- Enable RLS
ALTER TABLE public.progress_milestones ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own milestones" ON public.progress_milestones;
DROP POLICY IF EXISTS "Users can insert own milestones" ON public.progress_milestones;
DROP POLICY IF EXISTS "Users can update own milestones" ON public.progress_milestones;

-- Create RLS policies
CREATE POLICY "Users can view own milestones" ON public.progress_milestones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones" ON public.progress_milestones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones" ON public.progress_milestones
  FOR UPDATE USING (auth.uid() = user_id);

-- Create or replace the update function
CREATE OR REPLACE FUNCTION public.update_progress_milestones(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_quit_date TIMESTAMPTZ;
  v_days_clean INTEGER;
BEGIN
  -- Get user's quit date
  SELECT quit_date INTO v_quit_date
  FROM public.users
  WHERE id = p_user_id;

  -- Calculate days clean
  IF v_quit_date IS NOT NULL THEN
    v_days_clean := EXTRACT(DAY FROM NOW() - v_quit_date);
    
    -- Update milestones based on days clean
    UPDATE public.progress_milestones
    SET 
      is_achieved = TRUE,
      achieved_at = NOW()
    WHERE user_id = p_user_id
      AND milestone_day <= v_days_clean
      AND is_achieved = FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_progress_milestones(UUID) TO authenticated;

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_progress_milestones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_progress_milestones_updated_at ON public.progress_milestones;
CREATE TRIGGER update_progress_milestones_updated_at
  BEFORE UPDATE ON public.progress_milestones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_progress_milestones_updated_at();

-- Check if milestone_title column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'progress_milestones' 
    AND column_name = 'milestone_title'
  ) THEN
    ALTER TABLE public.progress_milestones 
    ADD COLUMN milestone_title TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'progress_milestones' 
    AND column_name = 'milestone_description'
  ) THEN
    ALTER TABLE public.progress_milestones 
    ADD COLUMN milestone_description TEXT;
  END IF;
END $$;

-- Initialize default milestones for existing users who don't have them
INSERT INTO public.progress_milestones (user_id, milestone_day, milestone_title, milestone_description)
SELECT 
  u.id,
  m.day,
  m.title,
  m.description
FROM public.users u
CROSS JOIN (
  VALUES 
    (1, 'First Day Free', 'Your journey begins'),
    (3, '72 Hour Warrior', 'The hardest part is behind you'),
    (7, 'One Week Strong', 'A full week of freedom'),
    (14, 'Two Week Champion', 'Building new habits'),
    (21, 'Three Week Victor', 'New neural pathways forming'),
    (30, 'One Month Master', 'A major milestone achieved'),
    (60, 'Two Month Titan', 'Transformation in progress'),
    (90, 'Quarter Conqueror', 'Three months of success'),
    (120, 'Four Month Fighter', 'Stronger every day'),
    (180, 'Half Year Hero', 'Six months of freedom'),
    (365, 'One Year Legend', 'A full year nicotine-free'),
    (730, 'Two Year Master', 'Long-term success achieved')
) AS m(day, title, description)
WHERE NOT EXISTS (
  SELECT 1 
  FROM public.progress_milestones pm 
  WHERE pm.user_id = u.id AND pm.milestone_day = m.day
);

-- Update any achieved milestones for existing users
SELECT update_progress_milestones(id) FROM public.users WHERE quit_date IS NOT NULL;

-- Add comment for documentation
COMMENT ON TABLE public.progress_milestones IS 'Tracks user progress milestones in their recovery journey';
COMMENT ON COLUMN public.progress_milestones.gender_specific_content IS 'JSON object containing gender-specific milestone messages';
COMMENT ON COLUMN public.progress_milestones.nicotine_type_content IS 'JSON object containing nicotine-type specific milestone messages'; 