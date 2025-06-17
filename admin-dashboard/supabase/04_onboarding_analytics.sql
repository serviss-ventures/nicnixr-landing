-- Onboarding Analytics Schema
-- Track every step of the user journey for conversion optimization

-- Create onboarding_analytics table
CREATE TABLE IF NOT EXISTS public.onboarding_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_id UUID DEFAULT uuid_generate_v4(),
  step_number INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  action TEXT NOT NULL, -- 'started', 'completed', 'skipped', 'abandoned'
  time_spent_seconds INTEGER,
  device_info JSONB DEFAULT '{}',
  utm_params JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, session_id, step_number, action)
);

-- Create user_onboarding_data table to store all collected info
CREATE TABLE IF NOT EXISTS public.user_onboarding_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Demographics (Step 3)
  age_range TEXT,
  gender TEXT,
  location_country TEXT,
  location_state TEXT,
  
  -- Nicotine Profile (Step 4)
  substance_type TEXT CHECK (substance_type IN ('cigarettes', 'vape', 'nicotine_pouches', 'chew_dip')),
  brand TEXT,
  daily_usage INTEGER,
  years_using INTEGER,
  cost_per_unit DECIMAL(10,2),
  
  -- Reasons & Fears (Step 5)
  quit_reasons TEXT[],
  biggest_fears TEXT[],
  motivation_level INTEGER, -- 1-10 scale
  
  -- Triggers (Step 6)
  trigger_situations TEXT[],
  trigger_emotions TEXT[],
  trigger_times TEXT[],
  
  -- Past Attempts (Step 7)
  previous_quit_attempts INTEGER,
  longest_quit_duration TEXT,
  relapse_reasons TEXT[],
  successful_strategies TEXT[],
  
  -- Quit Date (Step 8)
  planned_quit_date DATE,
  quit_approach TEXT, -- 'cold_turkey', 'gradual', 'nrt', 'medication'
  
  -- Support Preferences
  preferred_support_styles TEXT[],
  buddy_preference BOOLEAN DEFAULT true,
  
  -- Tracking
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  profile_completion_score INTEGER DEFAULT 0, -- 0-100
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversion_events table for marketing attribution
CREATE TABLE IF NOT EXISTS public.conversion_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'signup', 'onboarding_complete', 'first_checkin', 'day_7_retention', etc.
  event_value DECIMAL(10,2), -- For LTV tracking
  attribution_source TEXT,
  attribution_medium TEXT,
  attribution_campaign TEXT,
  device_type TEXT,
  app_version TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ab_test_assignments table
CREATE TABLE IF NOT EXISTS public.ab_test_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  variant TEXT NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, test_name)
);

-- Indexes for performance
CREATE INDEX idx_onboarding_analytics_user ON public.onboarding_analytics(user_id);
CREATE INDEX idx_onboarding_analytics_session ON public.onboarding_analytics(session_id);
CREATE INDEX idx_onboarding_analytics_created ON public.onboarding_analytics(created_at DESC);
CREATE INDEX idx_user_onboarding_data_substance ON public.user_onboarding_data(substance_type);
CREATE INDEX idx_conversion_events_user ON public.conversion_events(user_id);
CREATE INDEX idx_conversion_events_type ON public.conversion_events(event_type);
CREATE INDEX idx_ab_test_assignments_user ON public.ab_test_assignments(user_id);

-- Enable RLS
ALTER TABLE public.onboarding_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_onboarding_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own analytics" ON public.onboarding_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics" ON public.onboarding_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own onboarding data" ON public.user_onboarding_data
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own events" ON public.conversion_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events" ON public.conversion_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own test assignments" ON public.ab_test_assignments
  FOR SELECT USING (auth.uid() = user_id);

-- Function to calculate onboarding completion score
CREATE OR REPLACE FUNCTION public.calculate_profile_completion(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  data RECORD;
BEGIN
  SELECT * INTO data FROM public.user_onboarding_data WHERE user_onboarding_data.user_id = calculate_profile_completion.user_id;
  
  IF data IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Calculate score based on filled fields (each section worth points)
  IF data.age_range IS NOT NULL THEN score := score + 5; END IF;
  IF data.gender IS NOT NULL THEN score := score + 5; END IF;
  IF data.substance_type IS NOT NULL THEN score := score + 10; END IF;
  IF data.daily_usage IS NOT NULL THEN score := score + 10; END IF;
  IF array_length(data.quit_reasons, 1) > 0 THEN score := score + 15; END IF;
  IF array_length(data.trigger_situations, 1) > 0 THEN score := score + 15; END IF;
  IF data.previous_quit_attempts IS NOT NULL THEN score := score + 10; END IF;
  IF data.planned_quit_date IS NOT NULL THEN score := score + 15; END IF;
  IF array_length(data.preferred_support_styles, 1) > 0 THEN score := score + 15; END IF;
  
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update profile completion score
CREATE OR REPLACE FUNCTION public.update_profile_completion_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completion_score := public.calculate_profile_completion(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_completion_score 
  BEFORE INSERT OR UPDATE ON public.user_onboarding_data
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_completion_score();

-- View for funnel analysis
CREATE OR REPLACE VIEW public.onboarding_funnel AS
SELECT 
  step_number,
  step_name,
  COUNT(DISTINCT user_id) as users_reached,
  COUNT(DISTINCT CASE WHEN action = 'completed' THEN user_id END) as users_completed,
  AVG(time_spent_seconds) as avg_time_seconds,
  COUNT(DISTINCT CASE WHEN action = 'abandoned' THEN user_id END) as users_abandoned
FROM public.onboarding_analytics
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY step_number, step_name
ORDER BY step_number;

-- RPC function for fetching funnel data (allows access from service role)
CREATE OR REPLACE FUNCTION public.get_onboarding_funnel_data()
RETURNS TABLE (
  step_number INTEGER,
  step_name TEXT,
  users_reached BIGINT,
  users_completed BIGINT,
  avg_time_seconds NUMERIC,
  users_abandoned BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    oa.step_number,
    oa.step_name,
    COUNT(DISTINCT oa.user_id) as users_reached,
    COUNT(DISTINCT CASE WHEN oa.action = 'completed' THEN oa.user_id END) as users_completed,
    AVG(oa.time_spent_seconds) as avg_time_seconds,
    COUNT(DISTINCT CASE WHEN oa.action = 'abandoned' THEN oa.user_id END) as users_abandoned
  FROM public.onboarding_analytics oa
  WHERE oa.created_at >= NOW() - INTERVAL '30 days'
  GROUP BY oa.step_number, oa.step_name
  ORDER BY oa.step_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 