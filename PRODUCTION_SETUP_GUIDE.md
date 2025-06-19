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

## Step 1: Create Production Supabase (15 minutes)

### 1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)

### 2. Click "New Project" and enter:
- **Name**: nixr-production
- **Database Password**: (Generate a strong one and save in 1Password!)
- **Region**: US East (N. Virginia) - closest to most users
- **Plan**: Pro ($25/month) - needed for:
  - No pause after 1 week
  - Automatic backups
  - Better performance
  - Email sending

### 3. Wait for project to provision (~2 minutes)

### 4. Get your keys:
```bash
# Go to Settings > API
# Copy these values:

PRODUCTION_SUPABASE_URL=https://[your-project-id].supabase.co
PRODUCTION_SUPABASE_ANON_KEY=[your-anon-key]
PRODUCTION_SUPABASE_SERVICE_KEY=[your-service-key]
```

## Step 2: Migrate Database Schema (20 minutes)

### Option A: Using Supabase CLI (Recommended)
```bash
# From admin-dashboard directory
cd admin-dashboard

# Link to production project
supabase link --project-ref [your-project-id]

# Push all migrations
supabase db push

# This will run all SQL files in order:
# 01_initial_schema.sql
# 02_auth_triggers.sql
# ... etc
```

### Option B: Manual via Dashboard
1. Go to SQL Editor in Supabase Dashboard
2. Run each file in order from `admin-dashboard/supabase/`:
   - Start with `01_initial_schema.sql`
   - Then `02_auth_triggers.sql`
   - Continue through all numbered files
3. Check for any errors after each file

## Step 3: Update Mobile App Environment (5 minutes)

### 1. Create production env file:
```bash
cd mobile-app
cp .env .env.production
```

### 2. Edit `.env.production`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
EXPO_PUBLIC_SENTRY_DSN=[if-you-have-sentry]
EXPO_PUBLIC_ADMIN_API_URL=https://admin.nixr.app
```

### 3. Update `eas.json` for production:
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "[your-url]",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "[your-key]"
      }
    }
  }
}
```

## Step 4: Update Admin Dashboard (5 minutes)

### 1. Create production env:
```bash
cd admin-dashboard
cp .env.local .env.production.local
```

### 2. Edit `.env.production.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-key]
OPENAI_API_KEY=[your-openai-key]
NEXTAUTH_SECRET=[generate-with: openssl rand -base64 32]
NEXTAUTH_URL=https://admin.nixr.app
```

## Step 5: Configure Supabase Auth (10 minutes)

### 1. Go to Authentication > Providers
- Enable Email (already enabled by default)
- Disable all other providers for now

### 2. Go to Authentication > URL Configuration
- Site URL: `nixr://`
- Redirect URLs:
  ```
  nixr://
  http://localhost:3000/**
  https://admin.nixr.app/**
  ```

### 3. Go to Authentication > Email Templates
- Customize the confirmation email
- Add your branding

## Step 6: Test Everything (15 minutes)

### 1. Test Mobile App with Production:
```bash
cd mobile-app
# Temporarily rename .env
mv .env .env.dev
mv .env.production .env

# Start the app
npm start

# Test:
# - User registration
# - Login
# - Create a post
# - Check AI Coach
```

### 2. Test Admin Dashboard:
```bash
cd admin-dashboard
npm run build
npm run start

# Test:
# - Login
# - View users
# - Check monitoring
```

## Step 7: RevenueCat Setup (30 minutes)

### 1. Create RevenueCat account at [revenuecat.com](https://revenuecat.com)

### 2. Create new project:
- Name: NixR
- Platform: iOS and Android

### 3. Configure products:
- Monthly: $7.99
- Annual: $59.99 (save 37%)

### 4. Get API keys and add to env files

## You're Ready to Build! 🚀

### Next: Create Production Builds
```bash
# iOS
eas build --platform ios --profile production

# Android  
eas build --platform android --profile production
```

## Troubleshooting

### If migrations fail:
- Check for typos in SQL
- Ensure tables don't already exist
- Run one file at a time

### If auth doesn't work:
- Check redirect URLs match exactly
- Verify anon key is correct
- Check RLS policies are enabled

### If builds fail:
- Ensure all env vars are set in eas.json
- Check bundle identifiers match
- Verify certificates are valid

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