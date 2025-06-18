-- AI Coach Security Setup for Supabase (SAFE VERSION)
-- This version checks before making any changes

-- 1. Check current RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'journal_entries', 'ai_coach_sessions', 'ai_coach_messages', 'achievements');

-- 2. Enable RLS only if not already enabled
DO $$ 
BEGIN
  -- Enable RLS on users table if not enabled
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users' AND rowsecurity = true) THEN
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on users table';
  ELSE
    RAISE NOTICE 'RLS already enabled on users table';
  END IF;

  -- Enable RLS on journal_entries if not enabled
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'journal_entries' AND rowsecurity = true) THEN
    ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on journal_entries table';
  END IF;

  -- Enable RLS on ai_coach_sessions if not enabled
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'ai_coach_sessions' AND rowsecurity = true) THEN
    ALTER TABLE ai_coach_sessions ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on ai_coach_sessions table';
  END IF;

  -- Enable RLS on ai_coach_messages if not enabled
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'ai_coach_messages' AND rowsecurity = true) THEN
    ALTER TABLE ai_coach_messages ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on ai_coach_messages table';
  END IF;

  -- Enable RLS on achievements if not enabled
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'achievements' AND rowsecurity = true) THEN
    ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on achievements table';
  END IF;
END $$;

-- 3. Create RLS Policies (only if they don't exist)

-- Users table policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile" ON users
      FOR SELECT USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON users
      FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- Journal entries policy
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'journal_entries' AND policyname = 'Users can manage own journal entries'
  ) THEN
    CREATE POLICY "Users can manage own journal entries" ON journal_entries
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- AI coach policies
DO $$ 
BEGIN
  -- Sessions policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ai_coach_sessions' AND policyname = 'Users can view own AI sessions'
  ) THEN
    CREATE POLICY "Users can view own AI sessions" ON ai_coach_sessions
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ai_coach_sessions' AND policyname = 'Users can create own AI sessions'
  ) THEN
    CREATE POLICY "Users can create own AI sessions" ON ai_coach_sessions
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ai_coach_sessions' AND policyname = 'Users can update own AI sessions'
  ) THEN
    CREATE POLICY "Users can update own AI sessions" ON ai_coach_sessions
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  -- Messages policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ai_coach_messages' AND policyname = 'Users can view own AI messages'
  ) THEN
    CREATE POLICY "Users can view own AI messages" ON ai_coach_messages
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ai_coach_messages' AND policyname = 'Users can create own AI messages'
  ) THEN
    CREATE POLICY "Users can create own AI messages" ON ai_coach_messages
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Achievements policy
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'achievements' AND policyname = 'Users can view own achievements'
  ) THEN
    CREATE POLICY "Users can view own achievements" ON achievements
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- 4. Create audit log table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS ai_coach_audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  session_id UUID REFERENCES ai_coach_sessions(id),
  action TEXT NOT NULL,
  risk_level TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON ai_coach_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON ai_coach_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_risk_level ON ai_coach_audit_log(risk_level) 
  WHERE risk_level IN ('high', 'critical');

-- 5. Create archive table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS ai_coach_messages_archive (
  LIKE ai_coach_messages INCLUDING ALL
);

-- 6. Create or replace functions (safe to run multiple times)

-- High-risk interaction logging
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

-- Create trigger only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'ai_message_risk_audit'
  ) THEN
    CREATE TRIGGER ai_message_risk_audit
    AFTER INSERT ON ai_coach_messages
    FOR EACH ROW EXECUTE FUNCTION log_high_risk_interaction();
  END IF;
END $$;

-- Cleanup function (safe to replace)
CREATE OR REPLACE FUNCTION cleanup_old_ai_sessions()
RETURNS void AS $$
DECLARE
  v_sessions_closed INTEGER;
  v_messages_archived INTEGER;
BEGIN
  -- Count sessions that will be closed
  SELECT COUNT(*) INTO v_sessions_closed
  FROM ai_coach_sessions 
  WHERE ended_at IS NULL 
  AND started_at < NOW() - INTERVAL '30 days';

  -- Close abandoned sessions older than 30 days
  UPDATE ai_coach_sessions 
  SET ended_at = NOW()
  WHERE ended_at IS NULL 
  AND started_at < NOW() - INTERVAL '30 days';
  
  -- Count messages that will be archived
  SELECT COUNT(*) INTO v_messages_archived
  FROM ai_coach_messages
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Archive messages older than 90 days
  INSERT INTO ai_coach_messages_archive
  SELECT * FROM ai_coach_messages
  WHERE created_at < NOW() - INTERVAL '90 days'
  ON CONFLICT (id) DO NOTHING;
  
  -- Delete archived messages from main table
  DELETE FROM ai_coach_messages
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Log cleanup action
  IF v_sessions_closed > 0 OR v_messages_archived > 0 THEN
    INSERT INTO ai_coach_audit_log (action, metadata)
    VALUES (
      'cleanup_executed',
      jsonb_build_object(
        'sessions_closed', v_sessions_closed,
        'messages_archived', v_messages_archived
      )
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create performance indexes (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date 
  ON journal_entries(user_id, entry_date DESC);

CREATE INDEX IF NOT EXISTS idx_achievements_user_unlocked 
  ON achievements(user_id, unlocked_at DESC) 
  WHERE unlocked_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ai_coach_messages_session 
  ON ai_coach_messages(session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_coach_sessions_user_active 
  ON ai_coach_sessions(user_id, started_at DESC) 
  WHERE ended_at IS NULL;

-- 8. Verify final state
SELECT 'RLS Status:' as info;
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'journal_entries', 'ai_coach_sessions', 'ai_coach_messages', 'achievements');

SELECT 'Active Policies:' as info;
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

SELECT 'Indexes Created:' as info;
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY indexname; 