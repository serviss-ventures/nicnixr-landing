-- Fix achievement function return type issue
-- First drop the existing function
DROP FUNCTION IF EXISTS check_and_unlock_achievements(uuid);

-- Then recreate it with the correct return type
CREATE OR REPLACE FUNCTION check_and_unlock_achievements(p_user_id uuid)
RETURNS TABLE(
  achievement_id uuid,
  achievement_name text,
  achievement_description text,
  achievement_category text,
  achievement_icon text,
  achievement_rarity text,
  unlocked_at timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_stats RECORD;
  v_achievement RECORD;
  v_unlocked_count int;
BEGIN
  -- Get user stats
  SELECT * INTO v_user_stats
  FROM user_stats
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Check each achievement
  FOR v_achievement IN 
    SELECT * FROM achievement_definitions
    WHERE is_active = true
  LOOP
    -- Check if already unlocked
    IF EXISTS (
      SELECT 1 FROM user_achievements 
      WHERE user_id = p_user_id 
      AND achievement_definition_id = v_achievement.id
    ) THEN
      CONTINUE;
    END IF;
    
    -- Check unlock criteria
    CASE v_achievement.unlock_criteria->>'type'
      WHEN 'days_clean' THEN
        IF v_user_stats.days_clean >= (v_achievement.unlock_criteria->>'value')::int THEN
          -- Unlock achievement
          INSERT INTO user_achievements (user_id, achievement_definition_id)
          VALUES (p_user_id, v_achievement.id)
          ON CONFLICT (user_id, achievement_definition_id) DO NOTHING;
          
          -- Return the unlocked achievement
          RETURN QUERY
          SELECT 
            v_achievement.id,
            v_achievement.name,
            v_achievement.description,
            v_achievement.category,
            v_achievement.icon,
            v_achievement.rarity,
            NOW() as unlocked_at;
        END IF;
        
      WHEN 'cravings_resisted' THEN
        IF v_user_stats.cravings_resisted >= (v_achievement.unlock_criteria->>'value')::int THEN
          INSERT INTO user_achievements (user_id, achievement_definition_id)
          VALUES (p_user_id, v_achievement.id)
          ON CONFLICT (user_id, achievement_definition_id) DO NOTHING;
          
          RETURN QUERY
          SELECT 
            v_achievement.id,
            v_achievement.name,
            v_achievement.description,
            v_achievement.category,
            v_achievement.icon,
            v_achievement.rarity,
            NOW() as unlocked_at;
        END IF;
        
      WHEN 'money_saved' THEN
        IF v_user_stats.money_saved >= (v_achievement.unlock_criteria->>'value')::numeric THEN
          INSERT INTO user_achievements (user_id, achievement_definition_id)
          VALUES (p_user_id, v_achievement.id)
          ON CONFLICT (user_id, achievement_definition_id) DO NOTHING;
          
          RETURN QUERY
          SELECT 
            v_achievement.id,
            v_achievement.name,
            v_achievement.description,
            v_achievement.category,
            v_achievement.icon,
            v_achievement.rarity,
            NOW() as unlocked_at;
        END IF;
        
      WHEN 'health_score' THEN
        IF v_user_stats.health_score >= (v_achievement.unlock_criteria->>'value')::int THEN
          INSERT INTO user_achievements (user_id, achievement_definition_id)
          VALUES (p_user_id, v_achievement.id)
          ON CONFLICT (user_id, achievement_definition_id) DO NOTHING;
          
          RETURN QUERY
          SELECT 
            v_achievement.id,
            v_achievement.name,
            v_achievement.description,
            v_achievement.category,
            v_achievement.icon,
            v_achievement.rarity,
            NOW() as unlocked_at;
        END IF;
        
      WHEN 'journal_entries' THEN
        -- Count journal entries
        SELECT COUNT(*) INTO v_unlocked_count
        FROM journal_entries
        WHERE user_id = p_user_id;
        
        IF v_unlocked_count >= (v_achievement.unlock_criteria->>'value')::int THEN
          INSERT INTO user_achievements (user_id, achievement_definition_id)
          VALUES (p_user_id, v_achievement.id)
          ON CONFLICT (user_id, achievement_definition_id) DO NOTHING;
          
          RETURN QUERY
          SELECT 
            v_achievement.id,
            v_achievement.name,
            v_achievement.description,
            v_achievement.category,
            v_achievement.icon,
            v_achievement.rarity,
            NOW() as unlocked_at;
        END IF;
        
      WHEN 'community_posts' THEN
        -- Count community posts
        SELECT COUNT(*) INTO v_unlocked_count
        FROM community_posts
        WHERE user_id = p_user_id;
        
        IF v_unlocked_count >= (v_achievement.unlock_criteria->>'value')::int THEN
          INSERT INTO user_achievements (user_id, achievement_definition_id)
          VALUES (p_user_id, v_achievement.id)
          ON CONFLICT (user_id, achievement_definition_id) DO NOTHING;
          
          RETURN QUERY
          SELECT 
            v_achievement.id,
            v_achievement.name,
            v_achievement.description,
            v_achievement.category,
            v_achievement.icon,
            v_achievement.rarity,
            NOW() as unlocked_at;
        END IF;
    END CASE;
  END LOOP;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_and_unlock_achievements(uuid) TO authenticated; 