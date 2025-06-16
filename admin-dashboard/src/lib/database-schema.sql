-- NixR Recovery App Database Schema for Supabase
-- This schema is designed for PostgreSQL and includes RLS policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE substance_type AS ENUM (
  'alcohol',
  'opioids',
  'stimulants',
  'cannabis',
  'nicotine',
  'gambling',
  'other'
);

CREATE TYPE user_tier AS ENUM (
  'free',
  'premium',
  'enterprise'
);

CREATE TYPE subscription_status AS ENUM (
  'active',
  'cancelled',
  'expired',
  'trial'
);

CREATE TYPE platform AS ENUM (
  'ios',
  'android',
  'web'
);

CREATE TYPE user_status AS ENUM (
  'active',
  'inactive',
  'suspended',
  'deleted'
);

CREATE TYPE risk_level AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

CREATE TYPE mood_type AS ENUM (
  'excellent',
  'good',
  'neutral',
  'struggling',
  'crisis'
);

CREATE TYPE post_category AS ENUM (
  'success_story',
  'need_support',
  'daily_check_in',
  'resources',
  'questions'
);

CREATE TYPE moderation_status AS ENUM (
  'pending',
  'approved',
  'flagged',
  'removed'
);

CREATE TYPE sentiment_type AS ENUM (
  'very_positive',
  'positive',
  'neutral',
  'negative',
  'crisis'
);

CREATE TYPE ticket_category AS ENUM (
  'technical',
  'billing',
  'recovery_support',
  'feature_request',
  'account',
  'other'
);

CREATE TYPE ticket_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

CREATE TYPE ticket_status AS ENUM (
  'open',
  'in_progress',
  'waiting_user',
  'resolved',
  'closed'
);

CREATE TYPE environment AS ENUM (
  'development',
  'staging',
  'production'
);

CREATE TYPE test_status AS ENUM (
  'draft',
  'running',
  'paused',
  'completed'
);

CREATE TYPE service_status AS ENUM (
  'operational',
  'degraded',
  'down'
);

CREATE TYPE report_type AS ENUM (
  'investor',
  'operations',
  'financial',
  'user_analytics',
  'custom'
);

CREATE TYPE report_frequency AS ENUM (
  'daily',
  'weekly',
  'monthly',
  'quarterly'
);

CREATE TYPE report_status AS ENUM (
  'scheduled',
  'generating',
  'completed',
  'failed'
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Recovery-specific fields
  sobriety_date DATE NOT NULL,
  days_clean INTEGER GENERATED ALWAYS AS (
    EXTRACT(DAY FROM NOW() - sobriety_date)::INTEGER
  ) STORED,
  primary_substance substance_type NOT NULL,
  secondary_substances substance_type[],
  
  -- App engagement
  journal_streak INTEGER DEFAULT 0,
  last_journal_entry TIMESTAMP WITH TIME ZONE,
  total_journal_entries INTEGER DEFAULT 0,
  community_posts INTEGER DEFAULT 0,
  buddy_connections INTEGER DEFAULT 0,
  
  -- Subscription
  tier user_tier DEFAULT 'free',
  subscription_status subscription_status DEFAULT 'trial',
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  
  -- Platform & Status
  platform platform NOT NULL,
  app_version TEXT,
  status user_status DEFAULT 'active',
  risk_level risk_level DEFAULT 'low',
  
  -- Support
  support_tickets INTEGER DEFAULT 0,
  flagged_content INTEGER DEFAULT 0,
  reports INTEGER DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Indexes
  CONSTRAINT valid_email CHECK (email ~* '^.+@.+\..+$')
);

-- Journal entries
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mood mood_type NOT NULL,
  triggers TEXT[],
  craving_level INTEGER CHECK (craving_level >= 1 AND craving_level <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_private BOOLEAN DEFAULT false,
  ai_insights TEXT,
  
  -- Indexes
  INDEX idx_journal_user_id ON journal_entries(user_id),
  INDEX idx_journal_created_at ON journal_entries(created_at DESC)
);

-- Community posts
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category post_category NOT NULL,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  moderation_status moderation_status DEFAULT 'pending',
  
  -- Indexes
  INDEX idx_posts_user_id ON community_posts(user_id),
  INDEX idx_posts_category ON community_posts(category),
  INDEX idx_posts_created_at ON community_posts(created_at DESC)
);

-- AI Coach sessions
CREATE TABLE ai_coach_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  sentiment sentiment_type,
  helpfulness_rating INTEGER CHECK (helpfulness_rating >= 1 AND helpfulness_rating <= 5),
  topics_discussed TEXT[],
  intervention_triggered BOOLEAN DEFAULT false,
  
  -- Indexes
  INDEX idx_sessions_user_id ON ai_coach_sessions(user_id),
  INDEX idx_sessions_started_at ON ai_coach_sessions(started_at DESC)
);

-- AI Messages
CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES ai_coach_sessions(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sentiment sentiment_type,
  
  -- Indexes
  INDEX idx_messages_session_id ON ai_messages(session_id),
  INDEX idx_messages_timestamp ON ai_messages(timestamp)
);

-- Support tickets
CREATE TABLE support_tickets (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category ticket_category NOT NULL,
  priority ticket_priority DEFAULT 'medium',
  status ticket_status DEFAULT 'open',
  assigned_to TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- Indexes
  INDEX idx_tickets_user_id ON support_tickets(user_id),
  INDEX idx_tickets_status ON support_tickets(status),
  INDEX idx_tickets_created_at ON support_tickets(created_at DESC)
);

-- Ticket messages
CREATE TABLE ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id TEXT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL,
  author_type TEXT CHECK (author_type IN ('user', 'support', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_ticket_messages_ticket_id ON ticket_messages(ticket_id)
);

-- Daily metrics
CREATE TABLE daily_metrics (
  date DATE PRIMARY KEY,
  active_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  journal_entries INTEGER DEFAULT 0,
  community_posts INTEGER DEFAULT 0,
  ai_coach_sessions INTEGER DEFAULT 0,
  relapse_reports INTEGER DEFAULT 0,
  support_tickets INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  
  -- Indexes
  INDEX idx_metrics_date ON daily_metrics(date DESC)
);

-- User engagement
CREATE TABLE user_engagement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  app_opens INTEGER DEFAULT 0,
  session_duration INTEGER DEFAULT 0, -- in seconds
  journals_written INTEGER DEFAULT 0,
  posts_created INTEGER DEFAULT 0,
  posts_liked INTEGER DEFAULT 0,
  ai_coach_messages INTEGER DEFAULT 0,
  buddy_interactions INTEGER DEFAULT 0,
  
  -- Indexes
  UNIQUE INDEX idx_engagement_user_date ON user_engagement(user_id, date),
  INDEX idx_engagement_date ON user_engagement(date DESC)
);

-- Revenue metrics
CREATE TABLE revenue_metrics (
  date DATE PRIMARY KEY,
  mrr DECIMAL(10, 2) DEFAULT 0,
  arr DECIMAL(10, 2) DEFAULT 0,
  new_mrr DECIMAL(10, 2) DEFAULT 0,
  churned_mrr DECIMAL(10, 2) DEFAULT 0,
  expansion_mrr DECIMAL(10, 2) DEFAULT 0,
  ltv DECIMAL(10, 2) DEFAULT 0,
  cac DECIMAL(10, 2) DEFAULT 0,
  payback_period DECIMAL(5, 2) DEFAULT 0 -- in months
);

-- Feature flags
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  environments environment[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT
);

-- A/B tests
CREATE TABLE ab_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status test_status DEFAULT 'draft',
  start_date DATE,
  end_date DATE,
  primary_metric TEXT,
  secondary_metrics TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test variants
CREATE TABLE test_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  allocation INTEGER CHECK (allocation >= 0 AND allocation <= 100),
  participants INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5, 2) DEFAULT 0,
  confidence DECIMAL(5, 2)
);

-- Service health
CREATE TABLE service_health (
  service TEXT PRIMARY KEY,
  status service_status DEFAULT 'operational',
  uptime DECIMAL(5, 2) DEFAULT 100, -- percentage
  latency INTEGER DEFAULT 0, -- milliseconds
  error_rate DECIMAL(5, 2) DEFAULT 0, -- percentage
  last_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type report_type NOT NULL,
  frequency report_frequency,
  recipients TEXT[],
  last_generated TIMESTAMP WITH TIME ZONE,
  next_scheduled TIMESTAMP WITH TIME ZONE,
  status report_status DEFAULT 'scheduled'
);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_coach_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_engagement ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view own journal entries" ON journal_entries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view approved community posts" ON community_posts
  FOR SELECT USING (moderation_status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Users can create own posts" ON community_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own AI sessions" ON ai_coach_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own support tickets" ON support_tickets
  FOR ALL USING (auth.uid() = user_id);

-- Admin policies (assuming admin role)
CREATE POLICY "Admins can view all data" ON users
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can view all journal entries" ON journal_entries
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage all posts" ON community_posts
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Indexes for performance
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_risk_level ON users(risk_level);
CREATE INDEX idx_users_substance ON users(primary_substance);
CREATE INDEX idx_users_tier ON users(tier);

-- Functions for metrics
CREATE OR REPLACE FUNCTION update_user_engagement()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user engagement metrics
  INSERT INTO user_engagement (user_id, date, journals_written)
  VALUES (NEW.user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, date) DO UPDATE
  SET journals_written = user_engagement.journals_written + 1;
  
  -- Update user's journal streak
  UPDATE users
  SET journal_streak = journal_streak + 1,
      last_journal_entry = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER journal_entry_created
AFTER INSERT ON journal_entries
FOR EACH ROW
EXECUTE FUNCTION update_user_engagement();

-- Function to calculate risk level
CREATE OR REPLACE FUNCTION calculate_risk_level(user_id UUID)
RETURNS risk_level AS $$
DECLARE
  days_clean_val INTEGER;
  recent_craving_level INTEGER;
  last_activity TIMESTAMP;
BEGIN
  SELECT days_clean, last_active_at INTO days_clean_val, last_activity
  FROM users WHERE id = user_id;
  
  SELECT MAX(craving_level) INTO recent_craving_level
  FROM journal_entries
  WHERE journal_entries.user_id = user_id
  AND created_at > NOW() - INTERVAL '7 days';
  
  IF days_clean_val < 7 OR recent_craving_level >= 8 THEN
    RETURN 'critical';
  ELSIF days_clean_val < 30 OR recent_craving_level >= 6 THEN
    RETURN 'high';
  ELSIF days_clean_val < 90 OR recent_craving_level >= 4 THEN
    RETURN 'medium';
  ELSE
    RETURN 'low';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Scheduled job to update risk levels (run daily)
CREATE OR REPLACE FUNCTION update_all_risk_levels()
RETURNS void AS $$
BEGIN
  UPDATE users
  SET risk_level = calculate_risk_level(id);
END;
$$ LANGUAGE plpgsql; 