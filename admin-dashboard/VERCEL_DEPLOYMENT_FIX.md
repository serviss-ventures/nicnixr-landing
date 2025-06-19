# Vercel Admin Dashboard Deployment - Correct Setup

## The Issue
Vercel can't find the Next.js project because it's in the `admin-dashboard` subdirectory, not the root.

## Solution: Configure Root Directory in Vercel Dashboard

### Step 1: Go to Vercel Project Settings
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → General

### Step 2: Set Root Directory
In the "Root Directory" field, enter:
```
admin-dashboard
```

### Step 3: Clear Build & Deploy Settings
Make sure these are all empty/default:
- Build Command: (leave empty - will use `npm run build`)
- Output Directory: (leave empty - will use `.next`)
- Install Command: (leave empty - will use `npm install`)

### Step 4: Environment Variables
Ensure these are set:
```
NEXT_PUBLIC_SUPABASE_URL=https://ymvrcfltcvmhytdcsrxv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your anon key]
SUPABASE_SERVICE_ROLE_KEY=[your service role key]
```

### Step 5: Redeploy
1. Go to Deployments tab
2. Click on the three dots menu on the latest deployment
3. Select "Redeploy"

## Alternative: Create New Vercel Project
If the above doesn't work, create a new Vercel project:

1. Delete the current project in Vercel
2. Import the repository again
3. During import, set:
   - Root Directory: `admin-dashboard`
   - Framework Preset: Next.js
4. Add environment variables
5. Deploy

## Important Notes
- DO NOT use a vercel.json in the root directory
- The admin-dashboard has its own vercel.json for API function settings
- Vercel will automatically detect Next.js once the root directory is set correctly 