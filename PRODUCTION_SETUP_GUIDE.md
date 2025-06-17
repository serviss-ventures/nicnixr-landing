# NixR Production Setup Guide

## 🚀 Overview
This guide walks through the complete production setup for NixR, from database configuration to deployment.

## 📋 Pre-Launch Checklist Status

### ✅ Completed Items
- [x] Apple Developer Account ($99/year)
- [x] Google Play Console ($25 one-time)
- [x] RevenueCat Production Configuration
- [x] Privacy Policy & Terms of Service
- [x] Cookie Policy & EULA
- [x] Sentry Error Tracking
- [x] Analytics Events
- [x] App Store Description
- [x] SEO Optimization
- [x] Press Kit & Help Documentation

### 🔄 In Progress
- [ ] Beta Testing Program (100+ testers)
- [ ] Marketing Website Deployment

### ⏳ Critical Items Remaining
1. **Production Environment Setup** (2 hours)
2. **Database Migration** (4 hours)
3. **Environment Variables** (1 hour)
4. **In-App Purchase Products** (2 hours)
5. **App Store Screenshots** (1 day)
6. **SSL Certificates** (2 hours)
7. **API Security Audit** (1 day)

## 🗄️ Production Database Setup

### 1. Create Production Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create new project:
   - Name: `nixr-production`
   - Database Password: Use a strong, unique password
   - Region: Choose closest to target audience (e.g., US East)
   - Pricing Plan: Pro ($25/month) for production features

### 2. Configure Production Settings

```sql
-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
-- ... continue for all tables

-- Create RLS policies (example for users table)
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);
```

### 3. Database Migration

```bash
# Export development schema
pg_dump -h db.ymvrcfltcvmhytdcsrxv.supabase.co \
  -U postgres \
  -d postgres \
  --schema-only \
  -f nixr_schema.sql

# Import to production
psql -h db.[PRODUCTION_URL].supabase.co \
  -U postgres \
  -d postgres \
  -f nixr_schema.sql
```

## 🔐 Environment Variables

### Mobile App (.env)
```env
# Production Supabase
EXPO_PUBLIC_SUPABASE_URL=https://[PRODUCTION_PROJECT_ID].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[PRODUCTION_ANON_KEY]

# RevenueCat
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=[PRODUCTION_IOS_KEY]
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=[PRODUCTION_ANDROID_KEY]

# Sentry
SENTRY_DSN=[PRODUCTION_SENTRY_DSN]
```

### Admin Dashboard (.env.local)
```env
# Production Supabase
NEXT_PUBLIC_SUPABASE_PROD_URL=https://[PRODUCTION_PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_PROD_ANON_KEY=[PRODUCTION_ANON_KEY]
SUPABASE_PROD_SERVICE_ROLE_KEY=[PRODUCTION_SERVICE_KEY]

# Next.js
NEXT_PUBLIC_APP_URL=https://admin.nixr.com
```

### Marketing Website (.env.local)
```env
# Production URLs
NEXT_PUBLIC_APP_URL=https://nixr.com
NEXT_PUBLIC_ADMIN_URL=https://admin.nixr.com
```

## 🛡️ Security Configuration

### 1. SSL Certificates (CloudFlare)
1. Add domains to CloudFlare:
   - nixr.com
   - admin.nixr.com
   - api.nixr.com
2. Enable Full SSL/TLS encryption
3. Enable HSTS
4. Configure security headers

### 2. API Rate Limiting (Supabase)
```sql
-- Create rate limiting function
CREATE OR REPLACE FUNCTION check_rate_limit(
    user_id UUID,
    action TEXT,
    max_requests INT,
    window_minutes INT
) RETURNS BOOLEAN AS $$
DECLARE
    request_count INT;
BEGIN
    SELECT COUNT(*)
    INTO request_count
    FROM api_requests
    WHERE user_id = user_id
      AND action = action
      AND created_at > NOW() - INTERVAL window_minutes || ' minutes';
    
    RETURN request_count < max_requests;
END;
$$ LANGUAGE plpgsql;
```

### 3. Security Headers (Vercel)
```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

## 📱 App Store Deployment

### iOS (App Store Connect)
1. Create app in App Store Connect
2. Configure In-App Purchases:
   - `nixr_monthly` - $4.99/month
   - `nixr_yearly` - $39.99/year
   - `nixr_lifetime` - $99.99 one-time
3. Upload build via Xcode
4. Submit for review

### Android (Google Play Console)
1. Create app listing
2. Configure In-App Products
3. Upload AAB file
4. Submit for review

## 🚀 Deployment Steps

### 1. Admin Dashboard (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
cd admin-dashboard
vercel --prod

# Set custom domain
vercel domains add admin.nixr.com
```

### 2. Marketing Website (Vercel)
```bash
# Deploy website
cd ../
vercel --prod

# Set custom domain
vercel domains add nixr.com
```

### 3. Mobile App
```bash
# Build for production
cd mobile-app
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## 📊 Monitoring Setup

### 1. Uptime Monitoring (UptimeRobot)
- Monitor: https://nixr.com
- Monitor: https://admin.nixr.com
- Monitor: Supabase API endpoints
- Alert via: Email, SMS, Slack

### 2. Performance Monitoring
- Vercel Analytics (built-in)
- Supabase Dashboard metrics
- Custom dashboards in admin panel

### 3. Error Tracking
- Sentry alerts for critical errors
- Daily error summary emails
- Slack integration for urgent issues

## 🎯 Launch Day Checklist

### T-7 Days
- [ ] Complete all App Store assets
- [ ] Finalize beta testing
- [ ] Prepare launch emails

### T-3 Days
- [ ] Deploy production backend
- [ ] Run final security audit
- [ ] Test all payment flows

### T-1 Day
- [ ] Deploy websites
- [ ] Enable monitoring
- [ ] Team standup

### Launch Day
- [ ] Submit apps to stores
- [ ] Send launch emails
- [ ] Monitor dashboards
- [ ] Celebrate! 🎉

## 📞 Emergency Contacts

- **Technical Issues**: tech-oncall@nixr.com
- **Supabase Support**: support.supabase.com
- **Vercel Support**: vercel.com/support
- **RevenueCat**: support@revenuecat.com

## 🔄 Post-Launch

1. Monitor user feedback
2. Address critical bugs immediately
3. Plan weekly updates
4. Analyze onboarding funnel
5. Optimize based on data

---

**Estimated Total Setup Time**: 2-3 days
**Estimated Review Time**: 3-7 days (Apple), 2-3 days (Google) 