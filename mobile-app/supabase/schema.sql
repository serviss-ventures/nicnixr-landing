-- NixR Database Schema
-- The Foundation for AI-Driven Marketing & User Success

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum types
CREATE TYPE substance_type AS ENUM ('cigarettes', 'vape', 'nicotine_pouches', 'chew_dip');
CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'cancelled', 'expired', 'paused');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'deleted');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    phone TEXT,
    full_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    
    -- Demographics
    age INTEGER,
    gender TEXT,
    location_country TEXT,
    location_state TEXT,
    timezone TEXT DEFAULT 'UTC',
    
    -- Substance profile
    primary_substance substance_type,
    secondary_substances substance_type[],
    usage_years INTEGER,
    daily_usage_amount DECIMAL,
    
    -- Recovery data
    quit_date TIMESTAMP WITH TIME ZONE,
    sobriety_date TIMESTAMP WITH TIME ZONE,
    relapse_count INTEGER DEFAULT 0,
    longest_streak_days INTEGER DEFAULT 0,
    current_streak_days INTEGER GENERATED ALWAYS AS (
        CASE 
            WHEN sobriety_date IS NOT NULL THEN 
                EXTRACT(DAY FROM NOW() - sobriety_date)::INTEGER
            ELSE 0
        END
    ) STORED,
    
    -- Acquisition & Attribution
    signup_channel TEXT,
    signup_campaign TEXT,
    signup_source TEXT,
    signup_medium TEXT,
    referrer_user_id UUID REFERENCES users(id),
    acquisition_cost DECIMAL,
    
    -- User properties
    properties JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    
    -- Status
    status user_status DEFAULT 'active',
    is_anonymous BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_primary_substance ON users(primary_substance);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_sobriety_date ON users(sobriety_date);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    session_id TEXT NOT NULL,
    event_name TEXT NOT NULL,
    properties JSONB DEFAULT '{}',
    
    -- Context
    platform TEXT,
    app_version TEXT,
    device_info JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for analytics
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    product_id TEXT NOT NULL,
    
    -- Status
    status subscription_status NOT NULL,
    
    -- Dates
    purchase_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Financial
    price DECIMAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    
    -- Platform specific
    platform TEXT,
    receipt_data JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_expiry_date ON subscriptions(expiry_date);

-- User properties table (for segmentation)
CREATE TABLE IF NOT EXISTS user_properties (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    properties JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily metrics table (for engagement tracking)
CREATE TABLE IF NOT EXISTS daily_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    
    -- Engagement metrics
    check_ins INTEGER DEFAULT 0,
    journal_entries INTEGER DEFAULT 0,
    ai_sessions INTEGER DEFAULT 0,
    community_posts INTEGER DEFAULT 0,
    buddy_messages INTEGER DEFAULT 0,
    
    -- User metrics
    active_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    churned_users INTEGER DEFAULT 0,
    
    -- Financial metrics
    revenue DECIMAL DEFAULT 0,
    new_subscriptions INTEGER DEFAULT 0,
    cancelled_subscriptions INTEGER DEFAULT 0,
    
    -- Health metrics
    avg_craving_score DECIMAL(3,1),
    crisis_interventions INTEGER DEFAULT 0,
    relapses_reported INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_daily_metrics_date ON daily_metrics(date);

-- Cohort retention table
CREATE TABLE IF NOT EXISTS cohort_retention (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cohort_date DATE NOT NULL,
    days_since_signup INTEGER NOT NULL,
    users_count INTEGER DEFAULT 0,
    retained_users INTEGER DEFAULT 0,
    retention_rate DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN users_count > 0 THEN 
                (retained_users::DECIMAL / users_count * 100)
            ELSE 0
        END
    ) STORED,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(cohort_date, days_since_signup)
);

CREATE INDEX idx_cohort_retention_cohort_date ON cohort_retention(cohort_date);

-- Journal entries table
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Content
    title TEXT,
    content TEXT,
    mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
    craving_score INTEGER CHECK (craving_score >= 0 AND craving_score <= 10),
    
    -- Metadata
    tags TEXT[],
    is_milestone BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at);

-- Community posts table
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Content
    content TEXT NOT NULL,
    image_urls TEXT[],
    
    -- Engagement
    love_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    
    -- Status
    is_deleted BOOLEAN DEFAULT FALSE,
    is_flagged BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at);

-- A/B test experiments table
CREATE TABLE IF NOT EXISTS experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    
    -- Configuration
    variants JSONB NOT NULL,
    traffic_allocation JSONB NOT NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Results
    results JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE
);

-- Experiment assignments table
CREATE TABLE IF NOT EXISTS experiment_assignments (
    user_id UUID NOT NULL REFERENCES users(id),
    experiment_id UUID NOT NULL REFERENCES experiments(id),
    variant TEXT NOT NULL,
    
    -- Outcome tracking
    converted BOOLEAN DEFAULT FALSE,
    conversion_value DECIMAL,
    
    -- Timestamps
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    converted_at TIMESTAMP WITH TIME ZONE,
    
    PRIMARY KEY (user_id, experiment_id)
);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own analytics" ON analytics_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own journal" ON journal_entries
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view all community posts" ON community_posts
    FOR SELECT USING (NOT is_deleted);

CREATE POLICY "Users can manage own posts" ON community_posts
    FOR ALL USING (auth.uid() = user_id);

-- Functions for analytics
CREATE OR REPLACE FUNCTION update_daily_metrics()
RETURNS void AS $$
BEGIN
    INSERT INTO daily_metrics (date, active_users, new_users)
    VALUES (
        CURRENT_DATE,
        (SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE DATE(created_at) = CURRENT_DATE),
        (SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURRENT_DATE)
    )
    ON CONFLICT (date) DO UPDATE
    SET 
        active_users = EXCLUDED.active_users,
        new_users = EXCLUDED.new_users,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user last_active_at
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users 
    SET last_active_at = NOW() 
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_last_active
AFTER INSERT ON analytics_events
FOR EACH ROW
EXECUTE FUNCTION update_user_last_active();

-- Function to calculate cohort retention
CREATE OR REPLACE FUNCTION calculate_cohort_retention(cohort_date DATE, days_since INTEGER)
RETURNS void AS $$
DECLARE
    total_users INTEGER;
    retained INTEGER;
BEGIN
    -- Get total users in cohort
    SELECT COUNT(*) INTO total_users
    FROM users
    WHERE DATE(created_at) = cohort_date;
    
    -- Get retained users
    SELECT COUNT(DISTINCT u.id) INTO retained
    FROM users u
    JOIN analytics_events ae ON u.id = ae.user_id
    WHERE DATE(u.created_at) = cohort_date
    AND DATE(ae.created_at) = cohort_date + INTERVAL '1 day' * days_since;
    
    -- Insert or update retention data
    INSERT INTO cohort_retention (cohort_date, days_since_signup, users_count, retained_users)
    VALUES (cohort_date, days_since, total_users, retained)
    ON CONFLICT (cohort_date, days_since_signup) DO UPDATE
    SET 
        users_count = EXCLUDED.users_count,
        retained_users = EXCLUDED.retained_users;
END;
$$ LANGUAGE plpgsql; 