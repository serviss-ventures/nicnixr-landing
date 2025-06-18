import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric');

    if (metric === 'crashes') {
      // In production, this would fetch from Sentry API
      // For now, we'll check error logs in Supabase
      const { data: errorLogs, error } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Transform to crash report format
      const crashes = errorLogs?.map(log => ({
        id: log.id,
        platform: log.platform || 'unknown',
        version: log.app_version || '1.0.0',
        error: log.error_message,
        stackTrace: log.stack_trace,
        userId: log.user_id,
        timestamp: new Date(log.created_at),
        deviceInfo: {
          model: log.device_model || 'Unknown',
          os: log.os_version || 'Unknown',
          memory: log.available_memory || 'Unknown'
        }
      })) || [];

      return NextResponse.json({ crashes });
    }

    if (metric === 'health') {
      // Perform health checks
      const healthChecks = [];
      
      // Check Supabase
      try {
        const start = Date.now();
        const { count } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        
        healthChecks.push({
          service: 'Supabase Database',
          status: 'healthy',
          responseTime: Date.now() - start,
          details: { userCount: count }
        });
      } catch (error) {
        healthChecks.push({
          service: 'Supabase Database',
          status: 'down',
          responseTime: 0,
          error: error.message
        });
      }

      // Check Storage
      try {
        const start = Date.now();
        const { data } = await supabase.storage.from('avatars').list('', { limit: 1 });
        
        healthChecks.push({
          service: 'Storage (CDN)',
          status: 'healthy',
          responseTime: Date.now() - start
        });
      } catch (error) {
        healthChecks.push({
          service: 'Storage (CDN)',
          status: 'down',
          responseTime: 0,
          error: error.message
        });
      }

      return NextResponse.json({ healthChecks });
    }

    // Default: return server metrics
    // Get active connections
    const { count: activeUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_seen_at', new Date(Date.now() - 300000).toISOString()); // Active in last 5 min

    // Get request metrics from logs
    const { data: recentRequests } = await supabase
      .from('api_logs')
      .select('response_time')
      .gte('created_at', new Date(Date.now() - 60000).toISOString());

    const avgResponseTime = recentRequests?.length 
      ? recentRequests.reduce((sum, r) => sum + (r.response_time || 0), 0) / recentRequests.length
      : 0;

    // Get error rate
    const { count: errorCount } = await supabase
      .from('error_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 60000).toISOString());

    const totalRequests = recentRequests?.length || 100;
    const errorRate = (errorCount || 0) / totalRequests * 100;

    return NextResponse.json({
      metrics: {
        activeUsers: activeUsers || 0,
        requestsPerMinute: recentRequests?.length || 0,
        avgResponseTime: Math.round(avgResponseTime),
        errorRate: errorRate.toFixed(2),
        // These would come from actual monitoring service
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
      }
    });

  } catch (error) {
    console.error('Monitoring API error:', error);
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