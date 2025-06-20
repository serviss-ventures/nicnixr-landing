-- Fix user_stats days_clean calculation
-- This ensures days_clean is properly calculated from quit_date

-- 1. First, ensure all users have a user_stats entry
INSERT INTO public.user_stats (user_id, days_clean, health_score, cravings_resisted, total_points)
SELECT 
  u.id,
  GREATEST(0, EXTRACT(EPOCH FROM (NOW() - u.quit_date)) / 86400)::INTEGER,
  50, -- Default health score
  0,  -- Default cravings resisted
  0   -- Default total points
FROM public.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_stats us WHERE us.user_id = u.id
)
AND u.quit_date IS NOT NULL;

-- 2. Add updated_at column if it doesn't exist
ALTER TABLE public.user_stats 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Update existing user_stats to ensure days_clean is correct
UPDATE public.user_stats us
SET 
  days_clean = GREATEST(0, EXTRACT(EPOCH FROM (NOW() - u.quit_date)) / 86400)::INTEGER,
  updated_at = NOW()
FROM public.users u
WHERE us.user_id = u.id
AND u.quit_date IS NOT NULL;

-- 4. Create or replace the trigger function to auto-update days_clean
CREATE OR REPLACE FUNCTION update_days_clean_on_stats_access()
RETURNS TRIGGER AS $$
DECLARE
  v_days_clean INTEGER;
BEGIN
  -- If this is a SELECT operation, update days_clean first
  IF TG_OP = 'SELECT' OR OLD.days_clean IS DISTINCT FROM NEW.days_clean THEN
    SELECT GREATEST(0, EXTRACT(EPOCH FROM (NOW() - quit_date)) / 86400)::INTEGER
    INTO v_days_clean
    FROM public.users
    WHERE id = COALESCE(NEW.user_id, OLD.user_id);
    
    IF v_days_clean IS NOT NULL THEN
      UPDATE public.user_stats
      SET days_clean = v_days_clean
      WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create a function to ensure days_clean is always current
CREATE OR REPLACE FUNCTION get_current_days_clean(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_quit_date TIMESTAMPTZ;
  v_days_clean INTEGER;
BEGIN
  -- Get quit date
  SELECT quit_date INTO v_quit_date
  FROM public.users
  WHERE id = p_user_id;
  
  IF v_quit_date IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Calculate days clean
  v_days_clean := GREATEST(0, EXTRACT(EPOCH FROM (NOW() - v_quit_date)) / 86400)::INTEGER;
  
  -- Update user_stats
  UPDATE public.user_stats
  SET days_clean = v_days_clean
  WHERE user_id = p_user_id;
  
  RETURN v_days_clean;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION get_current_days_clean(UUID) TO authenticated;

-- 7. Create a view that always shows current stats
CREATE OR REPLACE VIEW public.current_user_stats AS
SELECT 
  us.user_id,
  GREATEST(0, EXTRACT(EPOCH FROM (NOW() - u.quit_date)) / 86400)::INTEGER as days_clean,
  us.health_score,
  us.cravings_resisted,
  us.total_points,
  us.created_at,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_stats' 
                 AND column_name = 'updated_at') 
    THEN us.updated_at 
    ELSE NOW() 
  END as updated_at
FROM public.user_stats us
JOIN public.users u ON u.id = us.user_id;

-- 8. Grant permissions on the view
GRANT SELECT ON public.current_user_stats TO authenticated;

-- 9. Update the check_and_unlock_achievements function to use current days_clean
CREATE OR REPLACE FUNCTION public.check_and_unlock_achievements(p_user_id UUID)
RETURNS TABLE (
  unlocked_badge_id TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_days_clean INTEGER;
  v_health_score INTEGER;
  v_cravings_resisted INTEGER;
  v_new_achievement RECORD;
BEGIN
  -- Get user's current stats with fresh days_clean calculation
  SELECT 
    GREATEST(0, EXTRACT(EPOCH FROM (NOW() - u.quit_date)) / 86400)::INTEGER,
    COALESCE(us.health_score, 0),
    COALESCE(us.cravings_resisted, 0)
  INTO 
    v_days_clean,
    v_health_score,
    v_cravings_resisted
  FROM public.users u
  LEFT JOIN public.user_stats us ON us.user_id = u.id
  WHERE u.id = p_user_id;

  -- Update user_stats with current days_clean
  UPDATE public.user_stats
  SET days_clean = v_days_clean
  WHERE user_id = p_user_id;

  -- Check and insert new achievements
  FOR v_new_achievement IN
    SELECT 
      ad.badge_id,
      ad.points
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
    )
  LOOP
    -- Insert the achievement
    INSERT INTO public.achievements (user_id, badge_id, points_earned)
    VALUES (p_user_id, v_new_achievement.badge_id, v_new_achievement.points)
    ON CONFLICT (user_id, badge_id) DO NOTHING;
    
    -- Update total points
    UPDATE public.user_stats
    SET total_points = COALESCE(total_points, 0) + v_new_achievement.points
    WHERE user_id = p_user_id;
    
    -- Return the unlocked badge
    RETURN QUERY SELECT v_new_achievement.badge_id;
  END LOOP;
END;
$$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'User stats days_clean calculation fixed!';
END $$; 