import { supabaseAdmin } from './supabase';

export interface SimpleAdminUser {
  id: string;
  email: string;
  role: string;
  full_name?: string;
  permissions?: any;
  is_active: boolean;
}

class SimpleAdminAuthService {
  private SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Simple hash function for demo purposes
   * In production, use bcrypt or argon2
   */
  private simpleHash(value: string): string {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Login with hardcoded credentials for now
   */
  async login(email: string, password: string): Promise<{ user: SimpleAdminUser; token: string }> {
    // Hardcoded check for demo
    if (email !== 'admin@nixrapp.com' || password !== 'NixrAdmin2025!') {
      throw new Error('Invalid credentials');
    }

    // Get or create admin user
    const { data: adminUser, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();

    console.log('Admin user query result:', { adminUser, error });

    if (error && error.code === 'PGRST116') {
      // User doesn't exist, create a dummy one
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('admin_users')
        .insert({
          id: crypto.randomUUID(),
          email: email,
          full_name: 'Admin User',
          role: 'super_admin',
          permissions: {
            users: ['read', 'write', 'delete'],
            content: ['read', 'write', 'delete'],
            settings: ['read', 'write'],
            analytics: ['read']
          },
          is_active: true
        })
        .select()
        .single();

      if (createError) {
        console.error('Create error:', createError);
        throw new Error('Failed to create admin user');
      }

      return {
        user: newUser,
        token: this.simpleHash(email + Date.now())
      };
    }

    if (error) {
      console.error('Database error:', error);
      throw new Error('Database error: ' + error.message);
    }

    // Update last login
    await supabaseAdmin
      .from('admin_users')
      .update({
        last_login: new Date().toISOString(),
        login_count: (adminUser.login_count || 0) + 1
      })
      .eq('id', adminUser.id);

    // Generate token
    const token = this.simpleHash(email + Date.now());
    
    // Create session record
    const sessionData = {
      admin_id: adminUser.id,
      ip_address: '127.0.0.1', // In production, get from request
      user_agent: 'Admin Dashboard',
      is_active: true
    };
    
    console.log('Creating session with data:', sessionData);
    
    const { data: newSession, error: sessionError } = await supabaseAdmin
      .from('admin_sessions')
      .insert(sessionData)
      .select();

    if (sessionError) {
      console.error('Failed to create session:', sessionError);
      console.error('Session data:', sessionData);
    } else {
      console.log('Session created:', newSession);
    }

    return {
      user: adminUser,
      token
    };
  }

  /**
   * Simple session verification
   */
  async verifySession(token: string): Promise<SimpleAdminUser | null> {
    // For demo purposes, just return a dummy admin user
    // In production, implement proper session management
    if (!token) return null;

    const { data: adminUser } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', 'admin@nixrapp.com')
      .eq('is_active', true)
      .single();

    return adminUser;
  }

  /**
   * Logout
   */
  async logout(token: string): Promise<void> {
    // Mark all active sessions for the admin user as ended
    // In production, we'd match by token hash
    try {
      const { error } = await supabaseAdmin
        .from('admin_sessions')
        .update({
          ended_at: new Date().toISOString(),
          is_active: false
        })
        .eq('admin_id', '819642f7-626c-46e6-a9c6-2921382655b7') // Hardcoded for demo
        .eq('is_active', true);

      if (error) {
        console.error('Failed to end session:', error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}

export const simpleAdminAuth = new SimpleAdminAuthService(); 