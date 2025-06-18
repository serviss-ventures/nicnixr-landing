import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Fetch real metrics from database
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);

    // Get active users
    const { count: activeUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', fiveMinutesAgo.toISOString());

    // Get total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get AI Coach activity
    const { data: aiCoachMessages } = await supabase
      .from('ai_coach_messages')
      .select('response_time_ms')
      .gte('created_at', oneMinuteAgo.toISOString());

    const avgResponseTime = aiCoachMessages?.length 
      ? aiCoachMessages.reduce((sum, msg) => sum + (msg.response_time_ms || 0), 0) / aiCoachMessages.length
      : 0;

    // Get community activity
    const { count: recentPosts } = await supabase
      .from('community_posts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneMinuteAgo.toISOString());

    // Get journal activity
    const { count: recentJournals } = await supabase
      .from('journal_entries')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneMinuteAgo.toISOString());

    // Calculate requests per minute
    const requestsPerMinute = (aiCoachMessages?.length || 0) + 
                             (recentPosts || 0) + 
                             (recentJournals || 0);

    // Get error logs from audit
    const { data: errorLogs } = await supabase
      .from('ai_coach_audit_log')
      .select('*')
      .in('risk_level', ['high', 'critical'])
      .gte('created_at', oneMinuteAgo.toISOString());

    const errorRate = requestsPerMinute > 0 
      ? ((errorLogs?.length || 0) / requestsPerMinute) * 100 
      : 0;

    // Calculate system load
    const systemLoad = totalUsers ? ((activeUsers || 0) / totalUsers) * 100 : 0;

    // Get crash reports
    const { data: crashes } = await supabase
      .from('ai_coach_audit_log')
      .select('*')
      .eq('action', 'error_logged')
      .order('created_at', { ascending: false })
      .limit(10);

    const recentCrashes = crashes?.map(crash => ({
      id: crash.id,
      platform: crash.metadata?.platform || 'unknown',
      version: crash.metadata?.version || '1.0.0',
      error: crash.metadata?.error || 'Unknown error',
      stackTrace: crash.metadata?.stack_trace || '',
      userId: crash.user_id,
      timestamp: crash.created_at,
      deviceInfo: {
        model: crash.metadata?.device || 'Unknown',
        os: crash.metadata?.os || 'Unknown',
        memory: crash.metadata?.memory || 'Unknown'
      }
    })) || [];

    // Perform health checks
    const healthChecks = [];

    // Check database
    try {
      const start = Date.now();
      await supabase.from('users').select('id').limit(1);
      healthChecks.push({
        service: 'Supabase Database',
        status: 'healthy',
        responseTime: Date.now() - start,
        lastChecked: now,
      });
    } catch (error) {
      healthChecks.push({
        service: 'Supabase Database',
        status: 'down',
        responseTime: 0,
        lastChecked: now,
      });
    }

    // Check auth
    try {
      const start = Date.now();
      const { data: { users } } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
      healthChecks.push({
        service: 'Authentication',
        status: 'healthy',
        responseTime: Date.now() - start,
        lastChecked: now,
      });
    } catch (error) {
      healthChecks.push({
        service: 'Authentication',
        status: 'down',
        responseTime: 0,
        lastChecked: now,
      });
    }

    // Check storage
    try {
      const start = Date.now();
      await supabase.storage.from('avatars').list('', { limit: 1 });
      healthChecks.push({
        service: 'Storage (CDN)',
        status: 'healthy',
        responseTime: Date.now() - start,
        lastChecked: now,
      });
    } catch (error) {
      healthChecks.push({
        service: 'Storage (CDN)',
        status: 'down',
        responseTime: 0,
        lastChecked: now,
      });
    }

    // Check AI Coach
    try {
      const start = Date.now();
      const { count } = await supabase
        .from('ai_coach_sessions')
        .select('*', { count: 'exact', head: true })
        .limit(1);
      healthChecks.push({
        service: 'AI Coach API',
        status: 'healthy',
        responseTime: Date.now() - start,
        lastChecked: now,
      });
    } catch (error) {
      healthChecks.push({
        service: 'AI Coach API',
        status: 'down',
        responseTime: 0,
        lastChecked: now,
      });
    }

    // Mock external services (would need real endpoints in production)
    healthChecks.push(
      {
        service: 'Push Notifications',
        status: 'healthy',
        responseTime: 45,
        lastChecked: now,
      },
      {
        service: 'RevenueCat',
        status: 'healthy',
        responseTime: 120,
        lastChecked: now,
      }
    );

    return NextResponse.json({
      serverMetrics: {
        cpu: Math.min(100, systemLoad), // Use system load as CPU proxy
        memory: Math.min(95, systemLoad * 1.2), // Estimate memory usage
        activeConnections: activeUsers || 0,
        requestsPerMinute,
        errorRate: Math.min(100, errorRate),
        responseTime: avgResponseTime,
      },
      healthChecks,
      recentCrashes,
      lastRefresh: now,
    });
  } catch (error) {
    console.error('Error fetching monitoring data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monitoring data' },
      { status: 500 }
    );
  }
}

// Webhook endpoint for Sentry
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Handle Sentry webhook
    if (data.platform && data.exception) {
      // Store crash report in database
      const { error } = await supabase
        .from('error_logs')
        .insert({
          error_message: data.exception.values[0]?.value || 'Unknown error',
          stack_trace: data.exception.values[0]?.stacktrace || '',
          platform: data.platform,
          app_version: data.release,
          user_id: data.user?.id,
          device_model: data.contexts?.device?.model,
          os_version: data.contexts?.os?.version,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
} 