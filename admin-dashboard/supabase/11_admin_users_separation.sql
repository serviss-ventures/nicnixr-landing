-- Admin Users Table
-- This table is specifically for admin dashboard users, separate from app users

-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT, -- In production, use proper hashing
    role TEXT NOT NULL CHECK (role IN ('Super Admin', 'Admin', 'Moderator', 'Support')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.admin_users(id),
    last_login TIMESTAMP WITH TIME ZONE,
    last_login_ip INET,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON public.admin_users(is_active);

-- Admin audit log for tracking all admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID REFERENCES public.admin_users(id) NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for audit log
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_user ON public.admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON public.admin_audit_log(created_at);

-- Admin sessions table for managing login sessions
CREATE TABLE IF NOT EXISTS public.admin_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID REFERENCES public.admin_users(id) NOT NULL,
    token_hash TEXT UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for sessions
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON public.admin_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON public.admin_sessions(expires_at);

-- Row Level Security (disabled for now - will enable with proper auth)
-- ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Insert default super admin (in production, use secure password)
INSERT INTO public.admin_users (email, role, password_hash)
VALUES ('admin@nixrapp.com', 'Super Admin', 'CHANGE_THIS_IN_PRODUCTION')
ON CONFLICT (email) DO NOTHING;

-- Function to log admin actions (simplified version without auth)
CREATE OR REPLACE FUNCTION log_admin_action(
    p_admin_user_id UUID,
    p_action TEXT,
    p_resource_type TEXT,
    p_resource_id TEXT DEFAULT NULL,
    p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS void AS $$
BEGIN
    INSERT INTO public.admin_audit_log (
        admin_user_id,
        action,
        resource_type,
        resource_id,
        details,
        ip_address
    )
    VALUES (
        p_admin_user_id,
        p_action,
        p_resource_type,
        p_resource_id,
        p_details,
        inet_client_addr()
    );
END;
$$ LANGUAGE plpgsql;

-- Important: Admin users should NOT be in the regular users table
-- The admin dashboard should use admin_users table exclusively
-- Regular app users remain in the users table 