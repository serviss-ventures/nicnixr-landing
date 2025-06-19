-- Simplified Admin Users Table for development/testing
-- This version works without Supabase auth

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS public.admin_audit_log CASCADE;
DROP TABLE IF EXISTS public.admin_sessions CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;

-- Create admin_users table
CREATE TABLE public.admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT, -- In production, use proper hashing
    role TEXT NOT NULL CHECK (role IN ('Super Admin', 'Admin', 'Moderator', 'Support')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID,
    last_login TIMESTAMP WITH TIME ZONE,
    last_login_ip INET,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for performance
CREATE INDEX idx_admin_users_email ON public.admin_users(email);
CREATE INDEX idx_admin_users_role ON public.admin_users(role);
CREATE INDEX idx_admin_users_is_active ON public.admin_users(is_active);

-- Admin audit log for tracking all admin actions
CREATE TABLE public.admin_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID REFERENCES public.admin_users(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for audit log
CREATE INDEX idx_admin_audit_log_admin_user ON public.admin_audit_log(admin_user_id);
CREATE INDEX idx_admin_audit_log_created_at ON public.admin_audit_log(created_at);

-- Admin sessions table for managing login sessions
CREATE TABLE public.admin_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID REFERENCES public.admin_users(id) NOT NULL,
    token_hash TEXT UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for sessions
CREATE INDEX idx_admin_sessions_token ON public.admin_sessions(token_hash);
CREATE INDEX idx_admin_sessions_expires ON public.admin_sessions(expires_at);

-- Insert default super admin
INSERT INTO public.admin_users (email, role, password_hash)
VALUES ('admin@nixrapp.com', 'Super Admin', 'NixrAdmin2025!')
ON CONFLICT (email) DO UPDATE
SET role = 'Super Admin',
    is_active = true;

-- Add foreign key constraint for created_by after inserting first admin
ALTER TABLE public.admin_users 
ADD CONSTRAINT fk_created_by 
FOREIGN KEY (created_by) 
REFERENCES public.admin_users(id);

-- Simple function to log admin actions
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
        details
    )
    VALUES (
        p_admin_user_id,
        p_action,
        p_resource_type,
        p_resource_id,
        p_details
    );
END;
$$ LANGUAGE plpgsql;

-- Important notes:
-- 1. Admin users are completely separate from app users
-- 2. The admin dashboard should use admin_users table
-- 3. The mobile app uses the regular users table
-- 4. In production, implement proper password hashing and auth 