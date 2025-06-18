# AI Coach SQL Setup for Supabase

## Run this SQL in your Supabase SQL Editor:

```sql
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_coach_sessions_user_id ON ai_coach_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_coach_sessions_started_at ON ai_coach_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_ai_coach_messages_session_id ON ai_coach_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_coach_messages_created_at ON ai_coach_messages(created_at);

-- Row Level Security
ALTER TABLE ai_coach_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_coach_messages ENABLE ROW LEVEL SECURITY;

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
```

## How to Run:
1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the SQL above
5. Click "Run" (or press Cmd/Ctrl + Enter)

## Verify Tables Were Created:
After running, you should see:
- `ai_coach_sessions` table
- `ai_coach_messages` table

In the Table Editor, you can verify the tables exist and have the correct columns. 