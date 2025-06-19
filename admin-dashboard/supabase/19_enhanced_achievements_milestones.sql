-- Drop existing achievements table to rebuild with better structure
DROP TABLE IF EXISTS public.achievements CASCADE;

-- Create enhanced achievements table
CREATE TABLE public.achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id VARCHAR(50) NOT NULL, -- e.g., 'first_day', 'week_warrior', 'month_master'
  badge_name VARCHAR(100) NOT NULL,
  badge_description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('progress', 'community', 'health', 'resilience')),
  rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  icon_name VARCHAR(50), -- Ionicons name
  color VARCHAR(50), -- Color code for the badge
  milestone_value INTEGER, -- Days, posts, etc. depending on category
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  viewed BOOLEAN DEFAULT FALSE, -- Track if user has seen the achievement
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Create progress_milestones table for journey tracking
CREATE TABLE public.progress_milestones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  milestone_day INTEGER NOT NULL,
  milestone_title VARCHAR(100) NOT NULL,
  milestone_description TEXT,
  is_achieved BOOLEAN DEFAULT FALSE,
  achieved_at TIMESTAMP WITH TIME ZONE,
  gender_specific_content JSONB DEFAULT '{}', -- Store male/female specific messages
  nicotine_type_content JSONB DEFAULT '{}', -- Store product-specific messages
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, milestone_day)
);

-- Create achievement_definitions table for all possible achievements
CREATE TABLE public.achievement_definitions (
  badge_id VARCHAR(50) PRIMARY KEY,
  badge_name VARCHAR(100) NOT NULL,
  badge_description TEXT,
  category VARCHAR(50) NOT NULL,
  rarity VARCHAR(20) NOT NULL,
  icon_name VARCHAR(50),
  color VARCHAR(50),
  requirement_type VARCHAR(50) NOT NULL, -- 'days_clean', 'posts_count', 'buddies_helped', etc.
  requirement_value INTEGER NOT NULL,
  requirement_description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert achievement definitions
INSERT INTO public.achievement_definitions (badge_id, badge_name, badge_description, category, rarity, icon_name, color, requirement_type, requirement_value, requirement_description) VALUES
-- Progress achievements
('first_day', 'First Day Hero', 'Completed your first 24 hours nicotine-free', 'progress', 'common', 'checkmark-circle', 'rgba(255, 255, 255, 0.9)', 'days_clean', 1, 'Stay clean for 1 day'),
('three_day_warrior', '72 Hour Warrior', 'Conquered the hardest 72 hours', 'progress', 'common', 'flash', 'rgba(255, 255, 255, 0.9)', 'days_clean', 3, 'Stay clean for 3 days'),
('week_warrior', 'Week Warrior', 'One full week of freedom', 'progress', 'rare', 'shield-checkmark', 'rgba(251, 191, 36, 0.9)', 'days_clean', 7, 'Stay clean for 1 week'),
('two_week_champion', 'Fortnight Fighter', 'Two weeks of strength', 'progress', 'rare', 'trending-up', 'rgba(251, 191, 36, 0.9)', 'days_clean', 14, 'Stay clean for 2 weeks'),
('month_master', 'Month Master', 'One month milestone achieved', 'progress', 'epic', 'ribbon', 'rgba(147, 197, 253, 0.9)', 'days_clean', 30, 'Stay clean for 1 month'),
('two_month_titan', 'Two Month Titan', 'Two months of transformation', 'progress', 'epic', 'flame', 'rgba(147, 197, 253, 0.9)', 'days_clean', 60, 'Stay clean for 2 months'),
('quarter_conqueror', 'Quarter Conqueror', 'Three months nicotine-free', 'progress', 'epic', 'rocket', 'rgba(134, 239, 172, 0.9)', 'days_clean', 90, 'Stay clean for 3 months'),
('half_year_hero', 'Half Year Hero', 'Six months of success', 'progress', 'legendary', 'star', 'rgba(134, 239, 172, 0.9)', 'days_clean', 180, 'Stay clean for 6 months'),
('year_legend', 'Year Legend', 'One full year of freedom', 'progress', 'legendary', 'trophy', 'rgba(250, 204, 21, 0.9)', 'days_clean', 365, 'Stay clean for 1 year'),

-- Community achievements
('first_post', 'Community Voice', 'Shared your first post', 'community', 'common', 'chatbubble', 'rgba(192, 132, 252, 0.9)', 'posts_count', 1, 'Create your first post'),
('supportive_soul', 'Supportive Soul', 'Helped 5 community members', 'community', 'rare', 'heart', 'rgba(239, 68, 68, 0.9)', 'loves_given', 5, 'Give 5 loves to posts'),
('buddy_bond', 'Buddy Bond', 'Connected with your first buddy', 'community', 'rare', 'people', 'rgba(192, 132, 252, 0.9)', 'buddies_count', 1, 'Connect with a buddy'),

-- Health achievements
('health_boost', 'Health Boost', 'Reached 50% health recovery', 'health', 'common', 'fitness', 'rgba(134, 239, 172, 0.9)', 'health_score', 50, 'Reach 50% health score'),
('vitality_victor', 'Vitality Victor', 'Reached 80% health recovery', 'health', 'epic', 'pulse', 'rgba(134, 239, 172, 0.9)', 'health_score', 80, 'Reach 80% health score'),

-- Resilience achievements
('craving_crusher', 'Craving Crusher', 'Resisted 10 cravings', 'resilience', 'rare', 'shield', 'rgba(251, 191, 36, 0.9)', 'cravings_resisted', 10, 'Resist 10 cravings'),
('journal_journey', 'Journal Journey', 'Logged 7 journal entries', 'resilience', 'common', 'book', 'rgba(147, 197, 253, 0.9)', 'journal_entries', 7, 'Create 7 journal entries');

-- Create indexes
CREATE INDEX idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX idx_achievements_category ON public.achievements(category);
CREATE INDEX idx_achievements_unlocked_at ON public.achievements(unlocked_at DESC);
CREATE INDEX idx_progress_milestones_user_id ON public.progress_milestones(user_id);
CREATE INDEX idx_progress_milestones_day ON public.progress_milestones(milestone_day);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievements
CREATE POLICY "Users can view own achievements" ON public.achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON public.achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements" ON public.achievements
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for progress_milestones
CREATE POLICY "Users can view own milestones" ON public.progress_milestones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones" ON public.progress_milestones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones" ON public.progress_milestones
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for achievement_definitions
CREATE POLICY "Anyone can view achievement definitions" ON public.achievement_definitions
  FOR SELECT USING (true);

-- Function to check and unlock achievements
CREATE OR REPLACE FUNCTION public.check_and_unlock_achievements(p_user_id UUID)
RETURNS TABLE (
  unlocked_badge_id VARCHAR(50),
  unlocked_badge_name VARCHAR(100)
) AS $$
DECLARE
  v_days_clean INTEGER;
  v_health_score INTEGER;
  v_posts_count INTEGER;
  v_loves_given INTEGER;
  v_buddies_count INTEGER;
  v_cravings_resisted INTEGER;
  v_journal_entries INTEGER;
BEGIN
  -- Get user stats
  SELECT 
    COALESCE(EXTRACT(DAY FROM (NOW() - u.quit_date))::INTEGER, 0),
    COALESCE((SELECT AVG((health_improvements->>'overall')::INTEGER) FROM user_stats WHERE user_id = p_user_id), 0)::INTEGER
  INTO v_days_clean, v_health_score
  FROM users u
  WHERE u.id = p_user_id;

  -- Get community stats
  SELECT COUNT(*) INTO v_posts_count FROM community_posts WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_loves_given FROM community_loves WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_buddies_count FROM buddy_relationships 
    WHERE (requester_id = p_user_id OR requested_id = p_user_id) AND status = 'accepted';
  
  -- Get resilience stats
  SELECT COALESCE(SUM(cravings_resisted), 0) INTO v_cravings_resisted FROM user_stats WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_journal_entries FROM journal_entries WHERE user_id = p_user_id;

  -- Check each achievement definition
  RETURN QUERY
  WITH achievement_checks AS (
    SELECT 
      ad.badge_id,
      ad.badge_name,
      ad.badge_description,
      ad.category,
      ad.rarity,
      ad.icon_name,
      ad.color,
      CASE 
        WHEN ad.requirement_type = 'days_clean' AND v_days_clean >= ad.requirement_value THEN TRUE
        WHEN ad.requirement_type = 'health_score' AND v_health_score >= ad.requirement_value THEN TRUE
        WHEN ad.requirement_type = 'posts_count' AND v_posts_count >= ad.requirement_value THEN TRUE
        WHEN ad.requirement_type = 'loves_given' AND v_loves_given >= ad.requirement_value THEN TRUE
        WHEN ad.requirement_type = 'buddies_count' AND v_buddies_count >= ad.requirement_value THEN TRUE
        WHEN ad.requirement_type = 'cravings_resisted' AND v_cravings_resisted >= ad.requirement_value THEN TRUE
        WHEN ad.requirement_type = 'journal_entries' AND v_journal_entries >= ad.requirement_value THEN TRUE
        ELSE FALSE
      END as should_unlock
    FROM achievement_definitions ad
    WHERE ad.is_active = TRUE
  )
  INSERT INTO achievements (
    user_id, badge_id, badge_name, badge_description, 
    category, rarity, icon_name, color, milestone_value
  )
  SELECT 
    p_user_id, 
    ac.badge_id, 
    ac.badge_name, 
    ac.badge_description,
    ac.category,
    ac.rarity,
    ac.icon_name,
    ac.color,
    CASE 
      WHEN ac.badge_id LIKE '%day%' OR ac.badge_id LIKE '%week%' OR ac.badge_id LIKE '%month%' OR ac.badge_id LIKE '%year%' 
      THEN v_days_clean
      ELSE NULL
    END
  FROM achievement_checks ac
  WHERE ac.should_unlock = TRUE
  AND NOT EXISTS (
    SELECT 1 FROM achievements a 
    WHERE a.user_id = p_user_id AND a.badge_id = ac.badge_id
  )
  RETURNING badge_id, badge_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update progress milestones
CREATE OR REPLACE FUNCTION public.update_progress_milestones(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_days_clean INTEGER;
BEGIN
  -- Get current days clean
  SELECT COALESCE(EXTRACT(DAY FROM (NOW() - quit_date))::INTEGER, 0)
  INTO v_days_clean
  FROM users
  WHERE id = p_user_id;

  -- Update achieved milestones
  UPDATE progress_milestones
  SET 
    is_achieved = TRUE,
    achieved_at = NOW()
  WHERE user_id = p_user_id
  AND milestone_day <= v_days_clean
  AND is_achieved = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update milestones when user stats change
CREATE OR REPLACE FUNCTION public.trigger_update_milestones()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_progress_milestones(NEW.user_id);
  PERFORM check_and_unlock_achievements(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_milestones_on_stats_change
AFTER INSERT OR UPDATE ON public.user_stats
FOR EACH ROW
EXECUTE FUNCTION public.trigger_update_milestones(); 