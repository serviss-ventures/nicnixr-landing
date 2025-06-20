-- Comprehensive Achievement System Fix
-- This migration creates all necessary tables and functions for the achievement system

-- 1. First, ensure user_stats table has all required columns
ALTER TABLE public.user_stats 
ADD COLUMN IF NOT EXISTS days_clean INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS health_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cravings_resisted INTEGER DEFAULT 0;

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

-- 3. Insert all badge definitions with CORRECT requirement values
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

-- 4. Create or update the check_and_unlock_achievements function
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
    -- Check if already unlocked
    SELECT 1 
    FROM public.achievements a
    WHERE a.user_id = p_user_id
    AND a.badge_id = ad.badge_id
  )
  AND (
    -- Check if requirements are met
    (ad.requirement_type = 'days_clean' AND v_days_clean >= ad.requirement_value) OR
    (ad.requirement_type = 'health_score' AND v_health_score >= ad.requirement_value) OR
    (ad.requirement_type = 'cravings_resisted' AND v_cravings_resisted >= ad.requirement_value)
  );
END;
$$;

-- 5. Create get_next_achievable_badges function
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
    -- Check if already unlocked
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

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION public.check_and_unlock_achievements(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_next_achievable_badges(UUID) TO authenticated;

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_achievements_user_badge ON public.achievements(user_id, badge_id);
CREATE INDEX IF NOT EXISTS idx_achievement_definitions_active ON public.achievement_definitions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);

-- 8. Update existing user stats to ensure days_clean is synced with actual progress
UPDATE public.user_stats us
SET days_clean = GREATEST(
  0,
  EXTRACT(EPOCH FROM (NOW() - u.quit_date)) / 86400
)::INTEGER
FROM public.users u
WHERE us.user_id = u.id
AND u.quit_date IS NOT NULL;

-- 9. Create trigger to auto-update days_clean
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