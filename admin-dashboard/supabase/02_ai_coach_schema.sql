-- AI Coach Chat Sessions
CREATE TABLE IF NOT EXISTS ai_coach_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'negative', 'neutral', 'crisis')),
  helpfulness_rating INTEGER CHECK (helpfulness_rating BETWEEN 1 AND 5),
  intervention_triggered BOOLEAN DEFAULT FALSE,
  topics_discussed TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Coach Messages
CREATE TABLE IF NOT EXISTS ai_coach_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES ai_coach_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  is_user_message BOOLEAN NOT NULL,
  sentiment VARCHAR(20),
  topics TEXT[],
  risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Coach Analytics
CREATE TABLE IF NOT EXISTS ai_coach_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE DEFAULT CURRENT_DATE,
  total_sessions INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  avg_session_duration_minutes DECIMAL(10,2),
  crisis_interventions INTEGER DEFAULT 0,
  successful_interventions INTEGER DEFAULT 0,
  avg_helpfulness_rating DECIMAL(3,2),
  unique_users INTEGER DEFAULT 0,
  topics_frequency JSONB,
  sentiment_distribution JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

-- Indexes for performance
CREATE INDEX idx_ai_coach_sessions_user_id ON ai_coach_sessions(user_id);
CREATE INDEX idx_ai_coach_sessions_started_at ON ai_coach_sessions(started_at);
CREATE INDEX idx_ai_coach_messages_session_id ON ai_coach_messages(session_id);
CREATE INDEX idx_ai_coach_messages_created_at ON ai_coach_messages(created_at);
CREATE INDEX idx_ai_coach_analytics_date ON ai_coach_analytics(date);

-- Row Level Security
ALTER TABLE ai_coach_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_coach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_coach_analytics ENABLE ROW LEVEL SECURITY;

-- Policies for users to access their own data
CREATE POLICY "Users can view own sessions" ON ai_coach_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON ai_coach_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON ai_coach_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" ON ai_coach_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own messages" ON ai_coach_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies (for dashboard)
CREATE POLICY "Admins can view all sessions" ON ai_coach_sessions
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can view all messages" ON ai_coach_messages
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage analytics" ON ai_coach_analytics
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin'); 