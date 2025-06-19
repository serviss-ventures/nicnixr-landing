-- Add password authentication to admin_users table
-- This allows admin login without Supabase Auth

-- Add password_hash column if it doesn't exist
ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Update the existing admin user with a hashed password
-- In production, use proper bcrypt or argon2 hashing
UPDATE public.admin_users
SET password_hash = '5e0b7c0f5d8b8e5c5d8f5e5c5d8f5e5c5d8f5e5c5d8f5e5c5d8f5e5c5d8f5e5c'
WHERE email = 'admin@nixrapp.com';

-- Create a simple function to verify admin credentials
CREATE OR REPLACE FUNCTION public.verify_admin_credentials(
  p_email TEXT,
  p_password_hash TEXT
)
RETURNS TABLE(
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  permissions JSONB,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    au.full_name,
    au.role,
    au.permissions,
    au.is_active
  FROM public.admin_users au
  WHERE au.email = p_email
    AND au.password_hash = p_password_hash
    AND au.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.verify_admin_credentials TO anon;
GRANT EXECUTE ON FUNCTION public.verify_admin_credentials TO authenticated; 