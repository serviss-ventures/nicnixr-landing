# Deploying NIXR Admin Dashboard to Vercel

## Overview

The admin dashboard lives in the `admin-dashboard` subdirectory of your main repository. We'll deploy it as a separate Vercel project from your landing page.

## Step-by-Step Deployment

### 1. Install Vercel CLI (if not already installed)
```bash
npm i -g vercel
```

### 2. Navigate to Admin Dashboard
```bash
cd admin-dashboard
```

### 3. Initialize Vercel Project
```bash
vercel
```

When prompted:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your team/personal account
- **Link to existing project?** → No (create new project)
- **Project name?** → `nixr-admin` (or your preference)
- **Directory?** → `./` (current directory)
- **Override settings?** → No

### 4. Configure Environment Variables

Go to [Vercel Dashboard](https://vercel.com) → Your Project → Settings → Environment Variables

Add these variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://ymvrcfltcvmhytdcsrxv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 5. Deploy to Production
```bash
vercel --prod
```

Your admin dashboard will be available at:
- `https://nixr-admin.vercel.app` (or your custom domain)

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