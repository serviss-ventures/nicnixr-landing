# Admin Dashboard Deployment Fix Guide

## Build Error Fixes

### 1. Linting Errors Fixed
- Fixed unescaped apostrophes in `src/app/page.tsx`
- Fixed unescaped quotes in testimonial section
- Replaced `<a>` tags with Next.js `<Link>` components in privacy and terms pages

### 2. Sentry Warnings (Can Ignore)
The Sentry warnings are coming from the main landing page project, not the admin dashboard. These can be safely ignored as the admin dashboard doesn't use Sentry.

## Vercel Deployment Steps

1. **Environment Variables Required**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://ymvrcfltcvmhytdcsrxv.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[your anon key]
   SUPABASE_SERVICE_ROLE_KEY=[your service role key]
   SUPABASE_URL=https://ymvrcfltcvmhytdcsrxv.supabase.co
   SUPABASE_ANON_KEY=[same as NEXT_PUBLIC_SUPABASE_ANON_KEY]
   ```

2. **Build Settings**:
   - Framework Preset: Next.js
   - Root Directory: `admin-dashboard`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Important Notes**:
   - Make sure all environment variables point to the `ymvrcfltcvmhytdcsrxv` Supabase project
   - This is the same project used by the mobile app
   - The admin user has been created: admin@nixrapp.com / NixrAdmin2025!

## Verifying Deployment

After deployment:
1. Visit your Vercel URL
2. You should be redirected to `/login`
3. Sign in with admin@nixrapp.com / NixrAdmin2025!
4. Verify you can access all dashboard pages

## Troubleshooting

If you see "Application error":
1. Check Vercel logs for specific errors
2. Verify all environment variables are set correctly
3. Make sure the Supabase project ID matches (ymvrcfltcvmhytdcsrxv) 