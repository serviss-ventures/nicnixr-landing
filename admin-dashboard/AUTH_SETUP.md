# NIXR Admin Dashboard - Authentication Setup

## Overview

The admin dashboard uses Supabase Auth for authentication. All routes except `/login` are protected by middleware.

## Features

- ✅ Clean, minimal login page
- ✅ Protected routes with middleware
- ✅ Sign out functionality
- ✅ Session management
- ✅ Ready for team access on Vercel

## Setting Up Admin Users

### Method 1: Using the Script (Recommended)

1. Make sure your `.env.local` file has the correct Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. Run the admin user creation script:
   ```bash
   npx tsx scripts/create-admin-user.ts
   ```

3. The script will create an admin user with:
   - Email: `admin@nixr.app`
   - Password: `NixrAdmin2025!`
   - **⚠️ Change this password after first login!**

### Method 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Authentication → Users
3. Click "Add user" → "Create new user"
4. Enter email and password
5. Check "Auto Confirm Email"

### Method 3: Create Multiple Team Members

Create a CSV file with team members:
```csv
email,password,full_name
john@nixr.app,TempPass123!,John Doe
jane@nixr.app,TempPass123!,Jane Smith
```

Then use Supabase's bulk import feature or modify the script to loop through the CSV.

## Deployment on Vercel

1. **Environment Variables**
   Add these to your Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Create Admin Users**
   After deployment, you can:
   - Use the Supabase dashboard to create users
   - Run the script locally (it connects to your production Supabase)
   - Create a secure admin panel for user management

## Security Best Practices

1. **Strong Passwords**: Enforce strong passwords for all admin users
2. **Regular Rotation**: Rotate passwords every 90 days
3. **Limited Access**: Only give admin access to necessary team members
4. **Audit Logs**: Monitor sign-in activity in Supabase dashboard
5. **2FA**: Enable two-factor authentication (coming soon)

## User Flow

1. User navigates to any admin page
2. Middleware checks for valid session
3. If no session, redirect to `/login`
4. User enters credentials
5. On success, redirect to dashboard
6. Session persists across browser sessions
7. Sign out clears session and redirects to login

## Troubleshooting

### "Invalid login credentials"
- Check email/password are correct
- Ensure user exists in Supabase
- Verify email is confirmed

### Redirect loops
- Clear browser cookies
- Check middleware configuration
- Verify environment variables

### Session expires quickly
- Check Supabase JWT expiry settings
- Implement refresh token logic if needed

## Next Steps

1. **Role-Based Access Control (RBAC)**
   - Add roles (super_admin, admin, viewer)
   - Implement permission checks
   - Create role management UI

2. **User Management Panel**
   - List all admin users
   - Add/remove users
   - Reset passwords
   - Activity logs

3. **Enhanced Security**
   - Two-factor authentication
   - IP allowlisting
   - Session management
   - Password policies

## Support

For issues or questions:
- Check Supabase Auth documentation
- Review middleware logs
- Contact: admin@nixr.app 