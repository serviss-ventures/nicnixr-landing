import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get admin user ID from headers (set by middleware)
    const adminUserId = request.headers.get('x-admin-user-id');
    
    if (!adminUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all sessions for the current admin
    const { data: sessions, error } = await supabaseAdmin
      .from('admin_sessions')
      .select('*')
      .eq('admin_id', adminUserId)
      .order('started_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching sessions:', error);
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    // Get count of active sessions
    const { count: activeCount } = await supabaseAdmin
      .from('admin_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('admin_id', adminUserId)
      .eq('is_active', true);

    return NextResponse.json({
      sessions: sessions || [],
      activeCount: activeCount || 0,
      currentAdminId: adminUserId
    });
  } catch (error) {
    console.error('Sessions API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 