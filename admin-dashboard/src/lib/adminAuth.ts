import { supabase } from './supabase';

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  last_login?: string;
  metadata?: any;
}

export interface AdminSession {
  id: string;
  admin_user_id: string;
  token_hash: string;
  expires_at: string;
  ip_address?: string;
  user_agent?: string;
}

class AdminAuthService {
  private SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  /**
   * Hash a password or token
   */
  private async hash(value: string): Promise<string> {
    if (typeof window !== 'undefined') {
      // Browser environment - use Web Crypto API
      const encoder = new TextEncoder();
      const data = encoder.encode(value);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
      // Node.js environment
      const { createHash } = await import('crypto');
      return createHash('sha256').update(value).digest('hex');
    }
  }

  /**
   * Generate a secure random token
   */
  private generateToken(): string {
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined') {
      window.crypto.getRandomValues(array);
    } else {
      // Server-side
      require('crypto').randomFillSync(array);
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Login an admin user
   */
  async login(email: string, password: string, ipAddress?: string, userAgent?: string): Promise<{ user: AdminUser; token: string }> {
    try {
      // Check if admin user exists and password matches
      // First, get the user by email
      const { data: adminUser, error: userError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (userError || !adminUser) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const passwordHash = await this.hash(password);
      if (adminUser.password_hash !== passwordHash) {
        throw new Error('Invalid credentials');
      }

      // Generate session token
      const token = this.generateToken();
      const tokenHash = await this.hash(token);
      const expiresAt = new Date(Date.now() + this.SESSION_DURATION);

      // Create session
      const { data: session, error: sessionError } = await supabase
        .from('admin_sessions')
        .insert({
          admin_user_id: adminUser.id,
          token_hash: tokenHash,
          expires_at: expiresAt.toISOString(),
          ip_address: ipAddress,
          user_agent: userAgent,
        })
        .select()
        .single();

      if (sessionError) {
        throw new Error('Failed to create session');
      }

      // Update last login
      await supabase
        .from('admin_users')
        .update({
          last_login: new Date().toISOString(),
          last_login_ip: ipAddress,
        })
        .eq('id', adminUser.id);

      // Log the action
      await this.logAction(adminUser.id, 'login', 'admin_session', session.id, {
        ip_address: ipAddress,
        user_agent: userAgent,
      });

      return {
        user: adminUser,
        token,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Verify a session token
   */
  async verifySession(token: string): Promise<AdminUser | null> {
    try {
      const tokenHash = await this.hash(token);

      // Get session
      const { data: session, error: sessionError } = await supabase
        .from('admin_sessions')
        .select(`
          *,
          admin_users:admin_user_id (*)
        `)
        .eq('token_hash', tokenHash)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (sessionError || !session) {
        return null;
      }

      // Check if user is still active
      if (!session.admin_users.is_active) {
        return null;
      }

      return session.admin_users;
    } catch (error) {
      console.error('Session verification error:', error);
      return null;
    }
  }

  /**
   * Logout (invalidate session)
   */
  async logout(token: string): Promise<void> {
    try {
      const tokenHash = await this.hash(token);

      // Get session for logging
      const { data: session } = await supabase
        .from('admin_sessions')
        .select('admin_user_id')
        .eq('token_hash', tokenHash)
        .single();

      // Delete session
      await supabase
        .from('admin_sessions')
        .delete()
        .eq('token_hash', tokenHash);

      // Log the action if we found the session
      if (session) {
        await this.logAction(session.admin_user_id, 'logout', 'admin_session', null);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    try {
      await supabase
        .from('admin_sessions')
        .delete()
        .lt('expires_at', new Date().toISOString());
    } catch (error) {
      console.error('Session cleanup error:', error);
    }
  }

  /**
   * Log an admin action
   */
  async logAction(
    adminUserId: string,
    action: string,
    resourceType: string,
    resourceId?: string,
    details?: any
  ): Promise<void> {
    try {
      await supabase.rpc('log_admin_action', {
        p_admin_user_id: adminUserId,
        p_action: action,
        p_resource_type: resourceType,
        p_resource_id: resourceId,
        p_details: details || {},
      });
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  }

  /**
   * Get admin user by ID
   */
  async getAdminUser(userId: string): Promise<AdminUser | null> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Get admin user error:', error);
      return null;
    }
  }
}

export const adminAuth = new AdminAuthService(); 