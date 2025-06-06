# Complete Backend Implementation Plan for NixR

## Overview
This document provides a complete backend implementation plan for the NixR app using Supabase. All frontend code is complete and waiting for these endpoints.

## Technology Stack
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage
- **Edge Functions**: Supabase Edge Functions (Deno)
- **Push Notifications**: OneSignal or Firebase Cloud Messaging

## Implementation Timeline: 3 Weeks Total

### Week 1: Core MVP (Launch Ready) ✅

#### Day 1-2: Authentication & User Management
**Time: 16 hours**

**Database Tables:**
```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    display_name TEXT,
    first_name TEXT,
    last_name TEXT,
    avatar TEXT DEFAULT '🦸‍♂️',
    is_anonymous BOOLEAN DEFAULT false,
    date_joined TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User profiles for app-specific data
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    quit_date TIMESTAMP NOT NULL,
    nicotine_product JSONB NOT NULL, -- {id, name, category, avgCostPerDay, nicotineContent, harmLevel}
    daily_cost DECIMAL(10,2) NOT NULL,
    packages_per_day DECIMAL(5,2) NOT NULL,
    motivational_goals TEXT[] DEFAULT '{}',
    bio TEXT,
    support_styles TEXT[] DEFAULT '{}',
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own data and public info of others
CREATE POLICY "Users can view own profile" ON public.users
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view public profiles" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own profile" ON public.user_profiles
    FOR ALL USING (auth.uid() = user_id);
```

**API Endpoints:**
1. `POST /auth/register` - User registration
2. `POST /auth/login` - User login
3. `POST /auth/logout` - User logout
4. `GET /auth/user` - Get current user
5. `PUT /auth/user` - Update user profile
6. `POST /auth/anonymous` - Create anonymous account
7. `POST /auth/convert` - Convert anonymous to full account

#### Day 3-4: Progress Tracking & Streaks
**Time: 16 hours**

**Database Tables:**
```sql
-- Progress tracking
CREATE TABLE public.user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_days_clean INTEGER DEFAULT 0,
    money_saved DECIMAL(10,2) DEFAULT 0,
    cigarettes_avoided INTEGER DEFAULT 0,
    life_regained_hours DECIMAL(10,2) DEFAULT 0,
    last_check_in TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Relapse tracking
CREATE TABLE public.relapses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    relapse_date TIMESTAMP NOT NULL,
    reason TEXT,
    trigger TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Daily check-ins
CREATE TABLE public.daily_check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    check_in_date DATE NOT NULL,
    mood INTEGER CHECK (mood >= 1 AND mood <= 5),
    craving_level INTEGER CHECK (craving_level >= 1 AND craving_level <= 5),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, check_in_date)
);

-- Milestones achieved
CREATE TABLE public.user_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    milestone_id TEXT NOT NULL,
    achieved_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, milestone_id)
);
```

**API Endpoints:**
1. `GET /progress/stats` - Get user's progress statistics
2. `POST /progress/check-in` - Daily check-in
3. `POST /progress/relapse` - Record a relapse
4. `GET /progress/milestones` - Get achieved milestones
5. `GET /progress/streak` - Get streak information
6. `PUT /progress/reset` - Reset progress (with quit date)

**Edge Functions:**
```javascript
// calculate-stats.ts
export async function calculateStats(userId: string) {
  const profile = await getProfile(userId);
  const quitDate = new Date(profile.quit_date);
  const now = new Date();
  
  const daysClean = Math.floor((now - quitDate) / (1000 * 60 * 60 * 24));
  const moneySaved = daysClean * profile.daily_cost;
  const cigarettesAvoided = daysClean * profile.packages_per_day * 20; // 20 per pack
  const lifeRegained = cigarettesAvoided * 11 / 60; // 11 minutes per cigarette
  
  return {
    daysClean,
    moneySaved,
    cigarettesAvoided,
    lifeRegainedHours: lifeRegained
  };
}
```

#### Day 5: Buddy System
**Time: 8 hours**

**Implementation:** See `BUDDY_SYSTEM_BACKEND_INTEGRATION.md` for complete details

**Key Tables:**
- `buddy_connections`
- `buddy_requests`

**Key Endpoints:**
- Potential matches with scoring
- Request/accept/decline flow
- Connected buddies list

#### Day 6-7: Basic Community Features
**Time: 16 hours**

**Database Tables:**
```sql
-- Community posts
CREATE TABLE public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('story', 'question', 'milestone', 'crisis')),
    tags TEXT[] DEFAULT '{}',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Post likes
CREATE TABLE public.post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- Comments
CREATE TABLE public.post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**API Endpoints:**
1. `GET /community/posts` - Get community feed
2. `POST /community/posts` - Create new post
3. `POST /community/posts/:id/like` - Like/unlike post
4. `POST /community/posts/:id/comment` - Add comment
5. `GET /community/posts/:id/comments` - Get comments

### Week 2: Enhanced Features 🚀

#### Day 8-9: Recovery Systems & Health Tracking
**Time: 16 hours**

**Database Tables:**
```sql
-- Recovery metrics tracking
CREATE TABLE public.recovery_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    neurological_recovery DECIMAL(5,2),
    chemical_detox DECIMAL(5,2),
    cardiovascular_health DECIMAL(5,2),
    respiratory_function DECIMAL(5,2),
    gum_health DECIMAL(5,2),
    energy_metabolism DECIMAL(5,2),
    digestive_health DECIMAL(5,2),
    immune_system DECIMAL(5,2),
    overall_health_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, metric_date)
);

-- Recovery journal entries
CREATE TABLE public.recovery_journal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    mood INTEGER CHECK (mood >= 1 AND mood <= 5),
    energy INTEGER CHECK (energy >= 1 AND energy <= 5),
    cravings INTEGER CHECK (cravings >= 1 AND cravings <= 5),
    entry_text TEXT,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Recovery Calculation Functions:**
```javascript
// calculate-recovery.ts
export function calculateBodySystemRecovery(
  systemType: string,
  daysClean: number,
  product: string
): number {
  const recoveryRates = {
    neurological: { halfLife: 30, maxDays: 365 },
    chemical: { halfLife: 3, maxDays: 30 },
    cardiovascular: { halfLife: 30, maxDays: 365 },
    respiratory: { halfLife: 45, maxDays: 730 },
    // ... etc
  };
  
  const system = recoveryRates[systemType];
  const k = Math.log(2) / system.halfLife;
  const recovery = (1 - Math.exp(-k * daysClean)) * 100;
  
  return Math.min(recovery, 100);
}
```

**API Endpoints:**
1. `GET /recovery/metrics` - Get recovery metrics
2. `GET /recovery/benefits` - Get personalized benefits
3. `POST /recovery/journal` - Create journal entry
4. `GET /recovery/journal` - Get journal entries
5. `GET /recovery/tips` - Get daily tips

#### Day 10-11: Push Notifications
**Time: 16 hours**

**Database Tables:**
```sql
-- Notification preferences
CREATE TABLE public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    daily_check_in BOOLEAN DEFAULT true,
    milestone_achievements BOOLEAN DEFAULT true,
    buddy_requests BOOLEAN DEFAULT true,
    community_interactions BOOLEAN DEFAULT true,
    motivational_quotes BOOLEAN DEFAULT true,
    check_in_time TIME DEFAULT '09:00:00',
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Push tokens
CREATE TABLE public.push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform VARCHAR(10) CHECK (platform IN ('ios', 'android')),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, token)
);
```

**Notification Triggers:**
- Daily check-in reminders
- Milestone achievements
- Buddy request received
- Buddy accepted request
- Crisis support needed
- Weekly progress summary

#### Day 12-14: Analytics & Admin Dashboard
**Time: 24 hours**

**Database Tables:**
```sql
-- User analytics events
CREATE TABLE public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- App metrics
CREATE TABLE public.app_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date DATE NOT NULL,
    total_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    total_days_saved INTEGER DEFAULT 0,
    total_money_saved DECIMAL(12,2) DEFAULT 0,
    buddy_connections INTEGER DEFAULT 0,
    community_posts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(metric_date)
);
```

**Admin Endpoints:**
1. `GET /admin/users` - List all users
2. `GET /admin/metrics` - App-wide metrics
3. `GET /admin/content/flagged` - Flagged content
4. `POST /admin/content/moderate` - Moderate content
5. `GET /admin/analytics` - Analytics dashboard data

### Week 3: Polish & Scale 🎯

#### Day 15-16: Performance Optimization
**Time: 16 hours**

**Tasks:**
1. Add database indexes for common queries
2. Implement caching with Redis
3. Optimize image storage and delivery
4. Add pagination to all list endpoints
5. Implement query result caching

**Key Optimizations:**
```sql
-- Performance indexes
CREATE INDEX idx_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX idx_buddy_connections_users ON buddy_connections(user_id_1, user_id_2);
CREATE INDEX idx_progress_user_date ON user_progress(user_id, updated_at);
CREATE INDEX idx_analytics_user_type ON analytics_events(user_id, event_type);
```

#### Day 17-18: Security & Privacy
**Time: 16 hours**

**Security Implementation:**
1. Rate limiting on all endpoints
2. Input validation and sanitization
3. CORS configuration
4. API key management
5. Data encryption for sensitive fields

**RLS Policies for All Tables:**
```sql
-- Example comprehensive RLS
CREATE POLICY "Users can only see their own analytics" ON analytics_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only modify their own data" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anonymous users have limited access" ON community_posts
    FOR SELECT USING (
        CASE 
            WHEN auth.uid() IS NULL THEN false
            ELSE true
        END
    );
```

#### Day 19-21: Testing & Deployment
**Time: 24 hours**

**Testing Suite:**
1. Unit tests for all edge functions
2. Integration tests for API endpoints
3. Load testing with k6
4. Security penetration testing
5. User acceptance testing

**Deployment Checklist:**
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Backup strategy implemented
- [ ] Monitoring setup (Sentry, LogRocket)
- [ ] CI/CD pipeline configured
- [ ] Documentation complete

## Complete API Documentation

### Base URL
```
Production: https://api.nixr.app
Staging: https://staging-api.nixr.app
```

### Authentication
All authenticated endpoints require:
```
Authorization: Bearer <jwt_token>
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

## Database Schema Summary

**Total Tables: 20**
1. `users` - Core user data
2. `user_profiles` - Extended profile info
3. `user_progress` - Progress tracking
4. `relapses` - Relapse records
5. `daily_check_ins` - Daily check-ins
6. `user_milestones` - Achievement tracking
7. `buddy_connections` - Buddy relationships
8. `community_posts` - Community content
9. `post_likes` - Like tracking
10. `post_comments` - Comments
11. `recovery_metrics` - Health tracking
12. `recovery_journal` - Journal entries
13. `notification_preferences` - Notification settings
14. `push_tokens` - Device tokens
15. `analytics_events` - User analytics
16. `app_metrics` - App-wide metrics
17. `invite_codes` - Buddy invites
18. `support_messages` - In-app support
19. `daily_tips` - Motivational content
20. `admin_users` - Admin access

## Supabase-Specific Implementation

### Edge Functions Structure
```
supabase/functions/
├── auth/
│   ├── register.ts
│   ├── login.ts
│   └── anonymous.ts
├── progress/
│   ├── calculate-stats.ts
│   ├── check-in.ts
│   └── milestones.ts
├── buddy/
│   ├── find-matches.ts
│   ├── send-request.ts
│   └── manage-connection.ts
├── community/
│   ├── create-post.ts
│   ├── moderate.ts
│   └── interact.ts
├── recovery/
│   ├── calculate-metrics.ts
│   ├── get-benefits.ts
│   └── journal.ts
└── shared/
    ├── utils.ts
    ├── validation.ts
    └── constants.ts
```

### Real-time Subscriptions
```javascript
// Example real-time setup
const channel = supabase
  .channel('buddy-updates')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'buddy_connections',
    filter: `user_id_2=eq.${userId}`
  }, (payload) => {
    // Handle new buddy request
  })
  .subscribe();
```

## Cost Estimation (Supabase)

**Free Tier Covers:**
- Up to 50,000 monthly active users
- 500MB database
- 1GB file storage
- 2GB bandwidth
- 500K edge function invocations

**Estimated Monthly Cost at Scale (10K users):**
- Database: $25/month
- Auth: Free
- Storage: $25/month
- Functions: $10/month
- **Total: ~$60/month**

## Success Metrics

**Week 1 Deliverables:**
- [ ] User registration and login working
- [ ] Progress tracking functional
- [ ] Basic buddy system operational
- [ ] Community feed live

**Week 2 Deliverables:**
- [ ] Recovery tracking complete
- [ ] Push notifications working
- [ ] Admin dashboard functional

**Week 3 Deliverables:**
- [ ] Performance optimized
- [ ] Security hardened
- [ ] Fully tested and deployed

## Engineer Handoff Checklist

1. **Access Needed:**
   - [ ] Supabase project access
   - [ ] GitHub repository access
   - [ ] OneSignal/FCM account
   - [ ] Sentry error tracking
   - [ ] Deployment platform (Vercel/Netlify)

2. **Documentation Provided:**
   - [ ] This implementation plan
   - [ ] Buddy system integration guide
   - [ ] Frontend code documentation
   - [ ] API endpoint specifications

3. **First Steps:**
   - [ ] Set up Supabase project
   - [ ] Create initial database schema
   - [ ] Implement auth endpoints
   - [ ] Test with frontend locally

## Questions for Product Decisions

1. **Content Moderation:** Automated or manual review for community posts?
2. **Data Retention:** How long to keep user data after account deletion?
3. **Analytics:** What specific metrics are most important?
4. **Notifications:** Frequency limits to prevent spam?
5. **Buddy Limits:** Maximum number of buddies per user?

---

**This plan covers 100% of the NixR app features. A skilled engineer can deliver the MVP in Week 1 and have a production-ready backend by Week 3.** 