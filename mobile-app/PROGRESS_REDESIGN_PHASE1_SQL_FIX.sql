-- Progress Screen Redesign - Database Updates
-- Phase 1: Optional Schema Enhancements

-- Enhanced achievements tracking
-- Adding new columns to existing achievements table
ALTER TABLE achievements 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS icon TEXT,
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Progress milestones table (new)
-- Tracks specific recovery milestones achieved by users
CREATE TABLE IF NOT EXISTS progress_milestones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  milestone_type TEXT, -- 'body_system', 'time_based', 'health_metric'
  milestone_key TEXT,  -- 'respiratory_24h', 'day_7', etc.
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  value JSONB DEFAULT '{}', -- Flexible data storage for milestone details
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, milestone_key)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_progress_milestones_user_id ON progress_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_milestones_type ON progress_milestones(milestone_type);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);

-- Enable RLS for progress_milestones
ALTER TABLE progress_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for progress_milestones
CREATE POLICY "Users can view own milestones" ON progress_milestones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones" ON progress_milestones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones" ON progress_milestones
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_progress_milestones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_progress_milestones_updated_at 
  BEFORE UPDATE ON progress_milestones
  FOR EACH ROW 
  EXECUTE FUNCTION update_progress_milestones_updated_at(); 