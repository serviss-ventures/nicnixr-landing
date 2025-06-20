-- Fix achievements table structure
-- This migration ensures the achievements table has the correct structure

-- 1. Drop the existing achievements table if it exists (we'll recreate it properly)
DROP TABLE IF EXISTS public.achievements CASCADE;

-- 2. Create achievements table with correct structure
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

-- 3. Create indexes for performance
CREATE INDEX idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX idx_achievements_badge_id ON public.achievements(badge_id);
CREATE INDEX idx_achievements_unlocked_at ON public.achievements(unlocked_at);

-- 4. Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
-- Users can view their own achievements
CREATE POLICY "Users can view own achievements" ON public.achievements
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own achievements (through functions)
CREATE POLICY "Users can insert own achievements" ON public.achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Grant permissions
GRANT SELECT, INSERT ON public.achievements TO authenticated;

-- 7. Create function to unlock an achievement
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

-- 8. Grant permission to the unlock function
GRANT EXECUTE ON FUNCTION public.unlock_achievement(TEXT) TO authenticated;

-- 9. Add total_points column to user_stats if it doesn't exist
ALTER TABLE public.user_stats 
ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;

-- 10. Create a function to get user's achievement summary
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

-- 11. Grant permission to the summary function
GRANT EXECUTE ON FUNCTION public.get_user_achievement_summary(UUID) TO authenticated; 