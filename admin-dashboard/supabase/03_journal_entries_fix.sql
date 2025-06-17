-- Fix journal_entries table to match mobile app structure
-- First, drop the old table
DROP TABLE IF EXISTS public.journal_entries CASCADE;

-- Create new journal_entries table with correct structure
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  entry_date DATE DEFAULT CURRENT_DATE,
  
  -- Core Mental Health
  mood_positive BOOLEAN,
  had_cravings BOOLEAN,
  craving_intensity INTEGER CHECK (craving_intensity >= 1 AND craving_intensity <= 10),
  stress_high BOOLEAN,
  anxiety_level INTEGER CHECK (anxiety_level >= 1 AND anxiety_level <= 10),
  
  -- Core Physical
  sleep_quality BOOLEAN,
  sleep_hours NUMERIC(3,1) CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  
  -- Core Behavioral
  triggers_encountered BOOLEAN,
  coping_strategies_used BOOLEAN,
  
  -- Additional Mental Health
  used_breathing BOOLEAN,
  meditation_minutes INTEGER DEFAULT 0 CHECK (meditation_minutes >= 0),
  mood_swings BOOLEAN,
  irritability BOOLEAN,
  concentration INTEGER CHECK (concentration >= 1 AND concentration <= 10),
  
  -- Additional Physical
  water_glasses INTEGER DEFAULT 0 CHECK (water_glasses >= 0),
  exercised BOOLEAN,
  exercise_minutes INTEGER DEFAULT 0 CHECK (exercise_minutes >= 0),
  appetite INTEGER CHECK (appetite >= 1 AND appetite <= 10),
  headaches BOOLEAN,
  
  -- Additional Behavioral
  social_support BOOLEAN,
  avoided_triggers BOOLEAN,
  productive_day BOOLEAN,
  
  -- Additional Wellness (text fields)
  grateful_for TEXT,
  biggest_challenge TEXT,
  tomorrow_goal TEXT,
  
  -- Custom Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one entry per user per date
  UNIQUE(user_id, entry_date)
);

-- Create indexes for performance
CREATE INDEX idx_journal_entries_user_date ON public.journal_entries(user_id, entry_date DESC);
CREATE INDEX idx_journal_entries_date ON public.journal_entries(entry_date DESC);

-- Enable RLS
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only manage their own journal entries
CREATE POLICY "Users can manage own journal entries" ON public.journal_entries
  FOR ALL USING (auth.uid() = user_id);

-- Update trigger for updated_at
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment explaining the table structure
COMMENT ON TABLE public.journal_entries IS 'Recovery journal entries with detailed mental, physical, and behavioral tracking. Matches mobile app RecoveryJournal component structure.';

-- Add comments for field groups
COMMENT ON COLUMN public.journal_entries.mood_positive IS 'Core Mental Health: Feeling positive today?';
COMMENT ON COLUMN public.journal_entries.had_cravings IS 'Core Mental Health: Had nicotine cravings?';
COMMENT ON COLUMN public.journal_entries.craving_intensity IS 'Core Mental Health: Craving intensity (1-10 scale)';
COMMENT ON COLUMN public.journal_entries.stress_high IS 'Core Mental Health: High stress today?';
COMMENT ON COLUMN public.journal_entries.anxiety_level IS 'Core Mental Health: Anxiety level (1-10 scale)';

COMMENT ON COLUMN public.journal_entries.sleep_quality IS 'Core Physical: Good sleep quality?';
COMMENT ON COLUMN public.journal_entries.sleep_hours IS 'Core Physical: Hours of sleep';
COMMENT ON COLUMN public.journal_entries.energy_level IS 'Core Physical: Energy level (1-10 scale)';

COMMENT ON COLUMN public.journal_entries.triggers_encountered IS 'Core Behavioral: Encountered triggers?';
COMMENT ON COLUMN public.journal_entries.coping_strategies_used IS 'Core Behavioral: Used coping strategies?'; 