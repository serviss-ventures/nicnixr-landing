-- Simple fix for progress_milestones table
-- First, let's check what columns exist in your current table

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.progress_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_day INTEGER NOT NULL,
  milestone_title TEXT,
  milestone_description TEXT,
  is_achieved BOOLEAN DEFAULT false,
  achieved_at TIMESTAMPTZ,
  gender_specific_content JSONB DEFAULT '{}',
  nicotine_type_content JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, milestone_day)
);

-- Add any missing columns one by one
DO $$ 
BEGIN
  BEGIN
    ALTER TABLE public.progress_milestones ADD COLUMN gender_specific_content JSONB DEFAULT '{}';
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.progress_milestones ADD COLUMN milestone_day INTEGER;
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.progress_milestones ADD COLUMN milestone_title TEXT;
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.progress_milestones ADD COLUMN milestone_description TEXT;
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.progress_milestones ADD COLUMN nicotine_type_content JSONB DEFAULT '{}';
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.progress_milestones ADD COLUMN is_achieved BOOLEAN DEFAULT false;
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.progress_milestones ADD COLUMN achieved_at TIMESTAMPTZ;
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_progress_milestones_user_id ON public.progress_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_milestones_day ON public.progress_milestones(milestone_day);

-- Enable RLS
ALTER TABLE public.progress_milestones ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Users can view own milestones" ON public.progress_milestones;
DROP POLICY IF EXISTS "Users can insert own milestones" ON public.progress_milestones;
DROP POLICY IF EXISTS "Users can update own milestones" ON public.progress_milestones;

CREATE POLICY "Users can view own milestones" ON public.progress_milestones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones" ON public.progress_milestones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones" ON public.progress_milestones
  FOR UPDATE USING (auth.uid() = user_id);

-- Create the update function
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
    v_days_clean := GREATEST(0, EXTRACT(EPOCH FROM (NOW() - v_quit_date)) / 86400)::INTEGER;
    
    -- Update milestones based on days clean
    UPDATE public.progress_milestones
    SET 
      is_achieved = TRUE,
      achieved_at = CASE 
        WHEN is_achieved = FALSE THEN NOW() 
        ELSE achieved_at 
      END
    WHERE user_id = p_user_id
      AND milestone_day <= v_days_clean
      AND is_achieved = FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.update_progress_milestones(UUID) TO authenticated;

-- Create trigger function
CREATE OR REPLACE FUNCTION public.update_progress_milestones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_progress_milestones_updated_at ON public.progress_milestones;
CREATE TRIGGER update_progress_milestones_updated_at
  BEFORE UPDATE ON public.progress_milestones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_progress_milestones_updated_at(); 