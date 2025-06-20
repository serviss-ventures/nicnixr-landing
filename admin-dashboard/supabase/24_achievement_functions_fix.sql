-- Create the missing check_and_unlock_achievements function
-- This function checks if a user has met requirements for any new achievements

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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_and_unlock_achievements(UUID) TO authenticated;

-- Also create a function to get next achievable badges
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_next_achievable_badges(UUID) TO authenticated; 