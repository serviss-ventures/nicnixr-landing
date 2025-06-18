-- AI Coach Security Setup for Supabase
-- Run this after your initial schema setup

-- 1. Enable Row Level Security on all sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_coach_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_coach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS Policies

-- Users table: Users can only see and update their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Journal entries: Strict user isolation
CREATE POLICY "Users can manage own journal entries" ON journal_entries
  FOR ALL USING (auth.uid() = user_id);

-- AI coach sessions: User-specific access only
CREATE POLICY "Users can view own AI sessions" ON ai_coach_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own AI sessions" ON ai_coach_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI sessions" ON ai_coach_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- AI coach messages: User-specific access only
CREATE POLICY "Users can view own AI messages" ON ai_coach_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own AI messages" ON ai_coach_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievements: Read own achievements only
CREATE POLICY "Users can view own achievements" ON achievements
  FOR SELECT USING (auth.uid() = user_id);

-- 3. Create audit log table
CREATE TABLE IF NOT EXISTS ai_coach_audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  session_id UUID REFERENCES ai_coach_sessions(id),
  action TEXT NOT NULL,
  risk_level TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX idx_audit_log_user_id ON ai_coach_audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON ai_coach_audit_log(created_at DESC);
CREATE INDEX idx_audit_log_risk_level ON ai_coach_audit_log(risk_level) WHERE risk_level IN ('high', 'critical');

-- 4. Create function to log high-risk interactions
CREATE OR REPLACE FUNCTION log_high_risk_interaction()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.risk_level IN ('high', 'critical') THEN
    INSERT INTO ai_coach_audit_log (user_id, session_id, action, risk_level, metadata)
    VALUES (
      NEW.user_id, 
      NEW.session_id, 
      'high_risk_message', 
      NEW.risk_level,
      jsonb_build_object(
        'message_id', NEW.id,
        'topics', NEW.topics,
        'sentiment', NEW.sentiment
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create trigger for high-risk message logging
CREATE TRIGGER ai_message_risk_audit
AFTER INSERT ON ai_coach_messages
FOR EACH ROW EXECUTE FUNCTION log_high_risk_interaction();

-- 6. Create archive table for old messages
CREATE TABLE IF NOT EXISTS ai_coach_messages_archive (
  LIKE ai_coach_messages INCLUDING ALL
);

-- 7. Create cleanup function for old sessions and messages
CREATE OR REPLACE FUNCTION cleanup_old_ai_sessions()
RETURNS void AS $$
BEGIN
  -- Close abandoned sessions older than 30 days
  UPDATE ai_coach_sessions 
  SET ended_at = NOW()
  WHERE ended_at IS NULL 
  AND started_at < NOW() - INTERVAL '30 days';
  
  -- Archive messages older than 90 days
  INSERT INTO ai_coach_messages_archive
  SELECT * FROM ai_coach_messages
  WHERE created_at < NOW() - INTERVAL '90 days'
  ON CONFLICT (id) DO NOTHING;
  
  -- Delete archived messages from main table
  DELETE FROM ai_coach_messages
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Log cleanup action
  INSERT INTO ai_coach_audit_log (action, metadata)
  VALUES (
    'cleanup_executed',
    jsonb_build_object(
      'sessions_closed', (SELECT COUNT(*) FROM ai_coach_sessions WHERE ended_at = NOW()),
      'messages_archived', (SELECT COUNT(*) FROM ai_coach_messages WHERE created_at < NOW() - INTERVAL '90 days')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create function to get secure user context (for API use)
CREATE OR REPLACE FUNCTION get_secure_user_context(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_context JSON;
BEGIN
  -- Only allow users to get their own context
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized access attempt';
  END IF;
  
  SELECT json_build_object(
    'user_id', u.id,
    'username', u.username,
    'days_clean', u.days_clean,
    'substance_type', u.substance_type,
    'recovery_stage', 
      CASE 
        WHEN u.days_clean = 0 THEN 'just_started'
        WHEN u.days_clean = 1 THEN 'first_day'
        WHEN u.days_clean <= 3 THEN 'critical_72_hours'
        WHEN u.days_clean <= 7 THEN 'first_week'
        WHEN u.days_clean <= 30 THEN 'building_habits'
        WHEN u.days_clean <= 90 THEN 'establishing_recovery'
        ELSE 'long_term_recovery'
      END,
    'recent_journal_summary', (
      SELECT json_build_object(
        'total_entries', COUNT(*),
        'positive_mood_days', COUNT(*) FILTER (WHERE mood_positive = true),
        'craving_days', COUNT(*) FILTER (WHERE had_cravings = true),
        'good_sleep_days', COUNT(*) FILTER (WHERE sleep_quality = true)
      )
      FROM journal_entries
      WHERE user_id = p_user_id
      AND entry_date >= CURRENT_DATE - INTERVAL '7 days'
    ),
    'achievement_count', (
      SELECT COUNT(*)
      FROM achievements
      WHERE user_id = p_user_id
      AND unlocked_at IS NOT NULL
    )
  ) INTO v_context
  FROM users u
  WHERE u.id = p_user_id;
  
  RETURN v_context;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_secure_user_context TO authenticated;

-- 10. Create index for efficient AI coach queries
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date 
ON journal_entries(user_id, entry_date DESC);

CREATE INDEX IF NOT EXISTS idx_achievements_user_unlocked 
ON achievements(user_id, unlocked_at DESC) 
WHERE unlocked_at IS NOT NULL;

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'journal_entries', 'ai_coach_sessions', 'ai_coach_messages', 'achievements');

-- Show all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname; 