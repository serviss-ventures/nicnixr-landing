# Admin Dashboard Authentication Guide

## Overview

The admin dashboard uses a simple authentication system that's separate from the main app's user authentication.

## Login Credentials

- **Email**: admin@nixrapp.com
- **Password**: NixrAdmin2025!

## How It Works

1. **Login**: The admin enters credentials on the `/login` page
2. **Authentication**: The system verifies credentials against the `admin_users` table
3. **Session**: A secure token is stored in an HTTP-only cookie
4. **Middleware**: All admin routes are protected by middleware that verifies the session

## Technical Details

- **Service**: `simpleAdminAuth` in `/src/lib/simpleAdminAuth.ts`
- **API Routes**: 
  - POST `/api/auth/login` - Login endpoint
  - POST `/api/auth/logout` - Logout endpoint
- **Database**: Uses the `admin_users` table with service role access
- **Session Duration**: 24 hours

## Security Notes

- The current implementation is simplified for development
- In production, implement:
  - Proper password hashing (bcrypt/argon2)
  - Session storage in database
  - Rate limiting on login attempts
  - Two-factor authentication
  - IP whitelisting for admin access

## Admin User Management

The admin user is stored in the `admin_users` table with:
- Unique ID
- Email address
- Role (super_admin, admin, support)
- Permissions object
- Activity tracking (last_login, login_count)

## Troubleshooting

If you can't log in:
1. Check that the admin dashboard is running on port 3002
2. Verify the admin user exists in the database
3. Check for any RLS policy issues (the service uses service role key to bypass RLS)
4. Look for errors in the browser console or server logs 