-- Complete Achievement System Fix
-- This migration sets up the entire achievement system from scratch in the correct order

-- 1. First, ensure user_stats table has all required columns
ALTER TABLE public.user_stats 
ADD COLUMN IF NOT EXISTS days_clean INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS health_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cravings_resisted INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;

-- 2. Create achievement_definitions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.achievement_definitions (
  badge_id TEXT PRIMARY KEY,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  category TEXT NOT NULL CHECK (category IN ('progress', 'community', 'health', 'resilience')),
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  points INTEGER NOT NULL DEFAULT 10,
  icon_name TEXT,
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('days_clean', 'health_score', 'cravings_resisted', 'journal_entries', 'buddy_connections')),
  requirement_value INTEGER NOT NULL,
  requirement_description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Insert all badge definitions
INSERT INTO public.achievement_definitions (badge_id, badge_name, badge_description, category, rarity, points, icon_name, requirement_type, requirement_value, requirement_description) VALUES
-- Progress Badges (9 total)
('first_day_hero', 'First Day Hero', 'Completed your first 24 hours nicotine-free', 'progress', 'common', 10, 'checkmark-circle', 'days_clean', 1, 'Complete 1 day nicotine-free'),
('72_hour_warrior', '72 Hour Warrior', 'Conquered the hardest 72 hours', 'progress', 'common', 20, 'flash', 'days_clean', 3, 'Reach 3 days nicotine-free'),
('week_warrior', 'Week Warrior', 'One full week of freedom', 'progress', 'rare', 50, 'shield-checkmark', 'days_clean', 7, 'Complete 7 days nicotine-free'),
('fortnight_fighter', 'Fortnight Fighter', 'Two weeks of strength', 'progress', 'rare', 75, 'trending-up', 'days_clean', 14, 'Reach 14 days nicotine-free'),
('monthly_master', 'Monthly Master', 'One month milestone achieved', 'progress', 'epic', 150, 'calendar', 'days_clean', 30, 'Complete 30 days nicotine-free'),
('quarterly_queen', 'Quarterly Queen', 'Three months of triumph', 'progress', 'epic', 300, 'medal', 'days_clean', 90, 'Reach 90 days nicotine-free'),
('biannual_boss', 'Biannual Boss', 'Six months smoke-free', 'progress', 'legendary', 500, 'ribbon', 'days_clean', 180, 'Complete 180 days nicotine-free'),
('annual_ace', 'Annual Ace', 'One year of freedom', 'progress', 'legendary', 1000, 'trophy', 'days_clean', 365, 'Reach 365 days nicotine-free'),
('lifetime_legend', 'Lifetime Legend', 'Two years nicotine-free', 'progress', 'legendary', 2000, 'diamond', 'days_clean', 730, 'Complete 730 days nicotine-free'),

-- Community Badges (3 total)
('social_butterfly', 'Social Butterfly', 'Connected with 5 quit buddies', 'community', 'rare', 100, 'people', 'buddy_connections', 5, 'Connect with 5 buddies'),
('support_pillar', 'Support Pillar', 'Helped 10 community members', 'community', 'epic', 200, 'heart-circle', 'buddy_connections', 10, 'Support 10 community members'),
('community_champion', 'Community Champion', 'Active supporter of 20 members', 'community', 'legendary', 500, 'star-half', 'buddy_connections', 20, 'Help 20 community members'),

-- Health Badges (2 total)
('health_warrior', 'Health Warrior', 'Achieved 80% health score', 'health', 'epic', 200, 'fitness', 'health_score', 80, 'Reach 80% health score'),
('wellness_wizard', 'Wellness Wizard', 'Perfect 100% health score', 'health', 'legendary', 500, 'pulse', 'health_score', 100, 'Achieve 100% health score'),

-- Resilience Badges (2 total)
('craving_crusher', 'Craving Crusher', 'Resisted 50 cravings', 'resilience', 'rare', 100, 'shield', 'cravings_resisted', 50, 'Resist 50 cravings'),
('temptation_titan', 'Temptation Titan', 'Resisted 200 cravings', 'resilience', 'legendary', 500, 'shield-checkmark', 'cravings_resisted', 200, 'Resist 200 cravings')
ON CONFLICT (badge_id) DO UPDATE SET
  requirement_value = EXCLUDED.requirement_value,
  requirement_description = EXCLUDED.requirement_description,
  updated_at = NOW();

-- 4. Drop and recreate achievements table with correct structure
DROP TABLE IF EXISTS public.achievements CASCADE;

CREATE TABLE public.achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES public.achievement_definitions(badge_id),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- 5. Create indexes
CREATE INDEX idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX idx_achievements_badge_id ON public.achievements(badge_id);
CREATE INDEX idx_achievements_unlocked_at ON public.achievements(unlocked_at);
CREATE INDEX IF NOT EXISTS idx_achievement_definitions_active ON public.achievement_definitions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);

-- 6. Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies
CREATE POLICY "Users can view own achievements" ON public.achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON public.achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. Grant permissions
GRANT SELECT, INSERT ON public.achievements TO authenticated;
GRANT SELECT ON public.achievement_definitions TO authenticated;

-- 9. Create or replace check_and_unlock_achievements function
CREATE OR REPLACE FUNCTION public.check_and_unlock_achievements(p_user_id UUID)
RETURNS TABLE (
  badge_id TEXT,
  badge_name TEXT,
  badge_description TEXT,
  category TEXT,
  rarity TEXT,
  points INTEGER,
  icon_name TEXT,
  requirement_type TEXT,
  requirement_value INTEGER,
  requirement_description TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_days_clean INTEGER;
  v_health_score INTEGER;
  v_cravings_resisted INTEGER;
BEGIN
  -- Get user's current stats
  SELECT 
    COALESCE(days_clean, 0),
    COALESCE(health_score, 0),
    COALESCE(cravings_resisted, 0)
  INTO 
    v_days_clean,
    v_health_score,
    v_cravings_resisted
  FROM public.user_stats
  WHERE user_id = p_user_id;

  -- Return achievements that should be unlocked
  RETURN QUERY
  SELECT 
    ad.badge_id,
    ad.badge_name,
    ad.badge_description,
    ad.category,
    ad.rarity,
    ad.points,
    ad.icon_name,
    ad.requirement_type,
    ad.requirement_value,
    ad.requirement_description
  FROM public.achievement_definitions ad
  WHERE ad.is_active = true
  AND NOT EXISTS (
    SELECT 1 
    FROM public.achievements a
    WHERE a.user_id = p_user_id
    AND a.badge_id = ad.badge_id
  )
  AND (
    (ad.requirement_type = 'days_clean' AND v_days_clean >= ad.requirement_value) OR
    (ad.requirement_type = 'health_score' AND v_health_score >= ad.requirement_value) OR
    (ad.requirement_type = 'cravings_resisted' AND v_cravings_resisted >= ad.requirement_value)
  );
END;
$$;

-- 10. Create get_next_achievable_badges function
CREATE OR REPLACE FUNCTION public.get_next_achievable_badges(p_user_id UUID)
RETURNS TABLE (
  badge_id TEXT,
  badge_name TEXT,
  badge_description TEXT,
  category TEXT,
  rarity TEXT,
  points INTEGER,
  icon_name TEXT,
  requirement_type TEXT,
  requirement_value INTEGER,
  requirement_description TEXT,
  current_progress INTEGER,
  progress_percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_days_clean INTEGER;
  v_health_score INTEGER;
  v_cravings_resisted INTEGER;
BEGIN
  -- Get user's current stats
  SELECT 
    COALESCE(days_clean, 0),
    COALESCE(health_score, 0),
    COALESCE(cravings_resisted, 0)
  INTO 
    v_days_clean,
    v_health_score,
    v_cravings_resisted
  FROM public.user_stats
  WHERE user_id = p_user_id;

  -- Return next achievable badges with progress
  RETURN QUERY
  SELECT 
    ad.badge_id,
    ad.badge_name,
    ad.badge_description,
    ad.category,
    ad.rarity,
    ad.points,
    ad.icon_name,
    ad.requirement_type,
    ad.requirement_value,
    ad.requirement_description,
    CASE 
      WHEN ad.requirement_type = 'days_clean' THEN v_days_clean
      WHEN ad.requirement_type = 'health_score' THEN v_health_score
      WHEN ad.requirement_type = 'cravings_resisted' THEN v_cravings_resisted
      ELSE 0
    END as current_progress,
    CASE 
      WHEN ad.requirement_type = 'days_clean' THEN 
        LEAST(100, ROUND((v_days_clean::NUMERIC / ad.requirement_value) * 100, 2))
      WHEN ad.requirement_type = 'health_score' THEN 
        LEAST(100, ROUND((v_health_score::NUMERIC / ad.requirement_value) * 100, 2))
      WHEN ad.requirement_type = 'cravings_resisted' THEN 
        LEAST(100, ROUND((v_cravings_resisted::NUMERIC / ad.requirement_value) * 100, 2))
      ELSE 0
    END as progress_percentage
  FROM public.achievement_definitions ad
  WHERE ad.is_active = true
  AND NOT EXISTS (
    SELECT 1 
    FROM public.achievements a
    WHERE a.user_id = p_user_id
    AND a.badge_id = ad.badge_id
  )
  ORDER BY 
    CASE 
      WHEN ad.requirement_type = 'days_clean' THEN 
        (v_days_clean::NUMERIC / ad.requirement_value)
      WHEN ad.requirement_type = 'health_score' THEN 
        (v_health_score::NUMERIC / ad.requirement_value)
      WHEN ad.requirement_type = 'cravings_resisted' THEN 
        (v_cravings_resisted::NUMERIC / ad.requirement_value)
      ELSE 0
    END DESC
  LIMIT 5;
END;
$$;

-- 11. Create unlock_achievement function
CREATE OR REPLACE FUNCTION public.unlock_achievement(p_badge_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_achievement RECORD;
  v_points INTEGER;
BEGIN
  -- Get the current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Check if achievement already unlocked
  IF EXISTS (
    SELECT 1 FROM public.achievements 
    WHERE user_id = v_user_id AND badge_id = p_badge_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Achievement already unlocked');
  END IF;

  -- Get achievement details
  SELECT * INTO v_achievement
  FROM public.achievement_definitions
  WHERE badge_id = p_badge_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Achievement not found');
  END IF;

  -- Insert the achievement
  INSERT INTO public.achievements (user_id, badge_id, points_earned)
  VALUES (v_user_id, p_badge_id, v_achievement.points);

  -- Update user's total points
  UPDATE public.user_stats
  SET 
    total_points = COALESCE(total_points, 0) + v_achievement.points,
    updated_at = NOW()
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'badge_id', p_badge_id,
    'badge_name', v_achievement.badge_name,
    'points_earned', v_achievement.points,
    'rarity', v_achievement.rarity
  );
END;
$$;

-- 12. Grant permissions to functions
GRANT EXECUTE ON FUNCTION public.check_and_unlock_achievements(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_next_achievable_badges(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unlock_achievement(TEXT) TO authenticated;

-- 13. Update existing user stats to ensure days_clean is synced with actual progress
UPDATE public.user_stats us
SET days_clean = GREATEST(
  0,
  EXTRACT(EPOCH FROM (NOW() - u.quit_date)) / 86400
)::INTEGER
FROM public.users u
WHERE us.user_id = u.id
AND u.quit_date IS NOT NULL;

-- 14. Create trigger to auto-update days_clean
CREATE OR REPLACE FUNCTION update_user_days_clean()
RETURNS TRIGGER AS $$
BEGIN
  -- Update days_clean based on quit_date
  UPDATE public.user_stats
  SET days_clean = GREATEST(
    0,
    EXTRACT(EPOCH FROM (NOW() - NEW.quit_date)) / 86400
  )::INTEGER
  WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_days_clean_trigger ON public.users;

-- Create trigger
CREATE TRIGGER update_days_clean_trigger
AFTER UPDATE OF quit_date ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_user_days_clean();

-- 15. Create a function to get user's achievement summary
CREATE OR REPLACE FUNCTION public.get_user_achievement_summary(p_user_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_total_earned INTEGER;
  v_total_possible INTEGER;
  v_by_category JSONB;
  v_recent_achievements JSONB;
BEGIN
  -- Use provided user_id or current user
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Not authenticated');
  END IF;

  -- Get total earned points
  SELECT COALESCE(SUM(points_earned), 0) INTO v_total_earned
  FROM public.achievements
  WHERE user_id = v_user_id;

  -- Get total possible points
  SELECT COALESCE(SUM(points), 0) INTO v_total_possible
  FROM public.achievement_definitions
  WHERE is_active = true;

  -- Get achievements by category
  SELECT jsonb_object_agg(
    category,
    jsonb_build_object(
      'earned', earned_count,
      'total', total_count,
      'points', earned_points
    )
  ) INTO v_by_category
  FROM (
    SELECT 
      ad.category,
      COUNT(a.id) as earned_count,
      COUNT(ad.badge_id) as total_count,
      COALESCE(SUM(a.points_earned), 0) as earned_points
    FROM public.achievement_definitions ad
    LEFT JOIN public.achievements a ON a.badge_id = ad.badge_id AND a.user_id = v_user_id
    WHERE ad.is_active = true
    GROUP BY ad.category
  ) cat_summary;

  -- Get recent achievements
  SELECT jsonb_agg(
    jsonb_build_object(
      'badge_id', a.badge_id,
      'badge_name', ad.badge_name,
      'category', ad.category,
      'rarity', ad.rarity,
      'icon_name', ad.icon_name,
      'points', a.points_earned,
      'unlocked_at', a.unlocked_at
    ) ORDER BY a.unlocked_at DESC
  ) INTO v_recent_achievements
  FROM public.achievements a
  JOIN public.achievement_definitions ad ON ad.badge_id = a.badge_id
  WHERE a.user_id = v_user_id
  LIMIT 5;

  RETURN jsonb_build_object(
    'total_earned', v_total_earned,
    'total_possible', v_total_possible,
    'completion_percentage', ROUND((v_total_earned::NUMERIC / NULLIF(v_total_possible, 0)) * 100, 2),
    'by_category', v_by_category,
    'recent_achievements', COALESCE(v_recent_achievements, '[]'::jsonb)
  );
END;
$$;

-- 16. Grant permission to the summary function
GRANT EXECUTE ON FUNCTION public.get_user_achievement_summary(UUID) TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Achievement system setup complete!';
END $$; 