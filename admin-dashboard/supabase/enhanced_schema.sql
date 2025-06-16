-- Enhanced Schema for Recovery Analytics
-- This extends the basic schema with additional tables for analytics

-- Daily Metrics Table (for engagement tracking)
CREATE TABLE IF NOT EXISTS daily_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  check_ins INTEGER DEFAULT 0,
  journal_entries INTEGER DEFAULT 0,
  ai_sessions INTEGER DEFAULT 0,
  avg_craving_score DECIMAL(3,1) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Extended Analytics
ALTER TABLE users ADD COLUMN IF NOT EXISTS days_clean INTEGER GENERATED ALWAYS AS (
  CASE 
    WHEN sobriety_date IS NOT NULL THEN 
      EXTRACT(DAY FROM NOW() - sobriety_date)::INTEGER
    ELSE 0
  END
) STORED;

ALTER TABLE users ADD COLUMN IF NOT EXISTS total_journal_entries INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_substance substance_type;

-- Support Tickets Table (for crisis intervention tracking)
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  priority TEXT CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  status TEXT CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
  category TEXT,
  description TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- App Downloads Table (for funnel tracking)
CREATE TABLE IF NOT EXISTS app_downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('iOS', 'Android', 'Web')),
  version TEXT,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Funnel Metrics Table (aggregated data)
CREATE TABLE IF NOT EXISTS funnel_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_date DATE DEFAULT CURRENT_DATE,
  downloads INTEGER DEFAULT 0,
  signups INTEGER DEFAULT 0,
  quit_date_set INTEGER DEFAULT 0,
  first_journal INTEGER DEFAULT 0,
  day_7_milestone INTEGER DEFAULT 0,
  day_30_milestone INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger Events Table (for pattern analysis)
CREATE TABLE IF NOT EXISTS trigger_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  trigger_type TEXT CHECK (trigger_type IN ('stress', 'craving', 'social', 'environmental')),
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 10),
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recovery Tool Usage Table
CREATE TABLE IF NOT EXISTS tool_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 10),
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_metrics(date);
CREATE INDEX IF NOT EXISTS idx_users_sobriety_date ON users(sobriety_date);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active_at);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority, created_at);
CREATE INDEX IF NOT EXISTS idx_trigger_events_user_time ON trigger_events(user_id, logged_at);

-- Function to update last_active_at
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update last_active_at
CREATE TRIGGER update_user_last_active
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_last_active();

-- Function to calculate daily metrics (can be called by a cron job)
CREATE OR REPLACE FUNCTION calculate_daily_metrics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS void AS $$
DECLARE
  checkin_count INTEGER;
  journal_count INTEGER;
  ai_count INTEGER;
  avg_craving DECIMAL(3,1);
BEGIN
  -- Calculate metrics for the given date
  -- This is a placeholder - implement based on your actual data structure
  
  INSERT INTO daily_metrics (date, check_ins, journal_entries, ai_sessions, avg_craving_score)
  VALUES (target_date, checkin_count, journal_count, ai_count, avg_craving)
  ON CONFLICT (date) DO UPDATE
  SET 
    check_ins = EXCLUDED.check_ins,
    journal_entries = EXCLUDED.journal_entries,
    ai_sessions = EXCLUDED.ai_sessions,
    avg_craving_score = EXCLUDED.avg_craving_score,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql; 