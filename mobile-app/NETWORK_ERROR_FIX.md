# Network Error Fix - Onboarding Issues

## Problem
Getting repeated "Network request failed" errors every 2 seconds during onboarding, preventing progress past step 2.

## Root Cause
The app was trying to make analytics calls to Supabase without proper configuration, causing repeated network failures.

## Solution Applied

1. **Created Development Configuration** (`src/config/development.ts`)
   - Disabled analytics by default during development
   - Added feature flags to control network requests
   - Prevents network errors when Supabase isn't configured

2. **Updated Analytics Service**
   - Added checks for analytics being enabled before making network calls
   - Added retry logic with exponential backoff
   - Better error handling for network failures

3. **Fixed Root Navigator**
   - Only fetches user profile after onboarding is complete
   - Prevents unnecessary network calls during onboarding

## How to Configure Properly

### Option 1: Run Without Backend (Recommended for UI Development)
The app now runs with analytics disabled by default. Just run:
```bash
npx expo start
```

### Option 2: Enable Full Backend Integration
1. Create a `.env` file in the mobile-app directory:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_ADMIN_API_URL=http://192.168.1.171:3000
```

2. Update `src/config/development.ts`:
```typescript
enableAnalytics: true,
enableRemoteLogging: true,
```

3. Make sure admin dashboard is running:
```bash
cd admin-dashboard
npm run dev
```

## Quick Fixes

If you're still seeing network errors:

1. **Clear Expo cache**:
   ```bash
   npx expo start -c
   ```

2. **Check if it's the progress test logs**:
   The console messages like "progressTest.year5() - 5 years" are just debug helpers, not errors.

3. **Verify admin dashboard is running**:
   ```bash
   curl http://localhost:3000/api/health
   ```

## What This Fixes
- ✅ Can now complete onboarding without network errors
- ✅ App works offline or without backend configuration
- ✅ No more repeated error messages every 2 seconds
- ✅ Smooth progression through all onboarding steps

The app is now configured to work seamlessly whether you're doing UI development (no backend) or full integration testing (with backend). 