# Vercel Deployment Guide - Admin Dashboard

## Project Structure
The admin dashboard is located in the `/admin-dashboard` subdirectory of the main repository.

## Vercel Configuration

### Root vercel.json
A `vercel.json` file at the repository root configures the build:
```json
{
  "buildCommand": "cd admin-dashboard && npm run build",
  "outputDirectory": "admin-dashboard/.next",
  "installCommand": "cd admin-dashboard && npm install",
  "framework": "nextjs"
}
```

### Important Settings in Vercel Dashboard

1. **Framework Preset**: Next.js
2. **Root Directory**: Leave empty (we handle it in vercel.json)
3. **Build Command**: Use default (it will use vercel.json)
4. **Output Directory**: Use default (it will use vercel.json)
5. **Install Command**: Use default (it will use vercel.json)

### Environment Variables Required

Add these in Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://ymvrcfltcvmhytdcsrxv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your anon key]
SUPABASE_SERVICE_ROLE_KEY=[your service role key]
SUPABASE_URL=https://ymvrcfltcvmhytdcsrxv.supabase.co
SUPABASE_ANON_KEY=[same as NEXT_PUBLIC_SUPABASE_ANON_KEY]
```

### Deployment Steps

1. Push changes to GitHub
2. Vercel will automatically deploy
3. Check build logs if there are issues

### Troubleshooting

If you see module resolution errors:
- Ensure TypeScript paths are correct in `tsconfig.json`
- Check that all imports use the correct paths
- Verify node_modules are installed correctly

### Build Optimizations

Currently we have:
- ESLint disabled during builds (`ignoreDuringBuilds: true`)
- TypeScript errors disabled during builds (`ignoreBuildErrors: true`)

These should be re-enabled once all linting and type errors are fixed.

## Setting Up Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add custom domain: `admin.nixr.app` (or your preference)
3. Follow DNS configuration instructions

## Important Notes

### Root Directory Configuration
Since the admin dashboard is in a subdirectory, Vercel needs to know where to find it. The deployment process handles this automatically when you run `vercel` from within the `admin-dashboard` directory.

### Separate from Landing Page
- Your landing page: `nixr.app` (main directory)
- Your admin dashboard: `admin.nixr.app` (admin-dashboard subdirectory)
- Both can exist in the same repository but deploy as separate Vercel projects

### Environment Variables
Make sure to add the same environment variables in Vercel that you have in your local `.env.local` file.

## Creating Admin Users for Your Team

After deployment:

1. **Option A: Use Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to Authentication → Users
   - Add users manually

2. **Option B: Run Script Locally**
   ```bash
   cd admin-dashboard
   npx tsx scripts/create-admin-user.ts
   ```
   This connects to your production Supabase instance.

3. **Option C: Create a Secure Endpoint** (future enhancement)
   - Build an API endpoint for user creation
   - Protect it with admin-only access

## Continuous Deployment

Once set up, every push to your main branch will automatically deploy:
- Landing page updates → `nixr.app`
- Admin dashboard updates → `admin.nixr.app`

## Troubleshooting

### "404 Not Found" after deployment
- Check that Vercel is using the correct root directory
- Verify the build output includes all necessary files

### Environment variables not working
- Ensure they're added to Vercel project settings
- Redeploy after adding variables: `vercel --prod`

### Authentication issues
- Verify Supabase URL and keys are correct
- Check that users exist in your Supabase project
- Clear cookies and try again

## Team Access

1. Share the admin dashboard URL with your team
2. Create user accounts for each team member
3. They can log in with their credentials
4. Consider implementing roles for different access levels

## Next Steps

1. **Set up monitoring**: Add error tracking (Sentry)
2. **Analytics**: Track admin usage
3. **Backup**: Regular database backups
4. **Security**: IP allowlisting for extra security 