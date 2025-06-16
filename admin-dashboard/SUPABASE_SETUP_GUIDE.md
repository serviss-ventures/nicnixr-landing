# Supabase Setup Guide for NixR

This guide will walk you through setting up your Supabase backend from scratch. No backend experience required!

## Step 1: Get Your Supabase Credentials

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click on your project
3. In the sidebar, click **Settings** (gear icon)
4. Click **API** under Configuration
5. You'll see two important things:
   - **Project URL**: Looks like `https://xxxxxxxxxxxx.supabase.co`
   - **Project API keys**: You'll see `anon` and `service_role` keys

## Step 2: Create Your Environment File

1. In the `admin-dashboard` folder, create a new file called `.env.local`
2. Copy and paste this template:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Replace the values:
   - `your_project_url_here` → Your Project URL from Supabase
   - `your_anon_key_here` → Your anon key from Supabase
   - `your_service_role_key_here` → Your service_role key from Supabase

## Step 3: Set Up the Database

### Option A: Using Supabase Dashboard (Easier)

1. In your Supabase project, click **SQL Editor** in the sidebar
2. Click **New query**
3. Copy the ENTIRE contents of `admin-dashboard/src/lib/database-schema.sql`
4. Paste it into the SQL editor
5. Click **Run** (or press Ctrl/Cmd + Enter)
6. You should see "Success. No rows returned"

### Option B: Let Me Help You (If you share access)

If you want, you can share temporary access and I'll run the setup for you.

## Step 4: Enable Authentication

1. In Supabase, go to **Authentication** → **Providers**
2. Enable **Email** provider (it's usually on by default)
3. Optional: Enable social providers (Google, Apple, etc.)

## Step 5: Test the Connection

1. In your terminal, navigate to the admin-dashboard:
   ```bash
   cd admin-dashboard
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 in your browser

## Step 6: Create Your First Admin User

1. Go to Supabase **Authentication** → **Users**
2. Click **Invite user**
3. Enter your email
4. Check your email for the invite link
5. Set your password

## Common Issues & Solutions

### "Invalid API key"
- Double-check you copied the keys correctly
- Make sure there are no extra spaces
- Ensure you're using the `anon` key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### "Connection refused"
- Check your Supabase project is not paused
- Verify the project URL is correct

### Changes not showing up
- Restart your Next.js dev server after changing .env.local
- Clear your browser cache

## Next Steps

Once everything is working:

1. **For Mobile App**: Create a similar .env file in the `mobile-app` folder
2. **Security**: Never commit .env.local to git (it's already in .gitignore)
3. **Production**: You'll need to add these same environment variables to your hosting platform (Vercel, etc.)

## Need Help?

If you get stuck at any step, just let me know:
- What step you're on
- What error message you're seeing
- Screenshot if helpful

We'll get it working! 🚀 