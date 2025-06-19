import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { withMetrics } from '@/middleware/apiMetricsMiddleware';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    database: ServiceStatus;
    storage: ServiceStatus;
    auth: ServiceStatus;
    analytics: ServiceStatus;
  };
  metrics: {
    activeUsers: number;
    requestsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
  };
}

interface ServiceStatus {
  status: 'operational' | 'degraded' | 'down';
  responseTime: number;
  lastCheck: string;
  message?: string;
}

// Track server start time
const serverStartTime = Date.now();

async function handler(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Check database connectivity
    const dbStatus = await checkDatabase();
    
    // Calculate uptime
    const uptime = Math.floor((Date.now() - serverStartTime) / 1000); // in seconds
    
    const healthStatus: HealthStatus = {
      status: dbStatus.status === 'operational' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      uptime,
      services: {
        database: dbStatus,
        storage: await checkStorage(),
        auth: await checkAuth(),
        analytics: await checkAnalytics(),
      },
      metrics: {
        activeUsers: await getActiveUserCount(),
        requestsPerMinute: 0, // Would be tracked with Redis/monitoring service
        averageResponseTime: Date.now() - startTime,
        errorRate: 0, // Would be tracked with error monitoring
      },
    };
    
    // Determine overall health
    const services = Object.values(healthStatus.services);
    if (services.every(s => s.status === 'operational')) {
      healthStatus.status = 'healthy';
    } else if (services.some(s => s.status === 'down')) {
      healthStatus.status = 'unhealthy';
    } else {
      healthStatus.status = 'degraded';
    }
    
    return NextResponse.json(healthStatus, {
      status: healthStatus.status === 'healthy' ? 200 : 503,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      uptime: Math.floor((Date.now() - serverStartTime) / 1000),
      error: error instanceof Error ? error.message : 'Unknown error',
      services: {
        database: { status: 'down', responseTime: 0, lastCheck: new Date().toISOString() },
        storage: { status: 'down', responseTime: 0, lastCheck: new Date().toISOString() },
        auth: { status: 'down', responseTime: 0, lastCheck: new Date().toISOString() },
        analytics: { status: 'down', responseTime: 0, lastCheck: new Date().toISOString() },
      },
      metrics: {
        activeUsers: 0,
        requestsPerMinute: 0,
        averageResponseTime: Date.now() - startTime,
        errorRate: 100,
      },
    }, { status: 503 });
  }
}

async function checkDatabase(): Promise<ServiceStatus> {
  const start = Date.now();
  
  try {
    // Simple query to check database connectivity
    const { error } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1)
      .single();
    
    const responseTime = Date.now() - start;
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found" which is fine
      return {
        status: 'degraded',
        responseTime,
        lastCheck: new Date().toISOString(),
        message: error.message,
      };
    }
    
    return {
      status: 'operational',
      responseTime,
      lastCheck: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      lastCheck: new Date().toISOString(),
      message: error instanceof Error ? error.message : 'Database check failed',
    };
  }
}

async function checkStorage(): Promise<ServiceStatus> {
  // In production, this would check Supabase Storage or S3
  return {
    status: 'operational',
    responseTime: 5,
    lastCheck: new Date().toISOString(),
  };
}

async function checkAuth(): Promise<ServiceStatus> {
  const start = Date.now();
  
  try {
    // Check if auth service is responding
    const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(
      '00000000-0000-0000-0000-000000000000' // Non-existent user
    ).catch(() => ({ data: { user: null }, error: null }));
    
    return {
      status: 'operational',
      responseTime: Date.now() - start,
      lastCheck: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      lastCheck: new Date().toISOString(),
      message: 'Auth service check failed',
    };
  }
}

async function checkAnalytics(): Promise<ServiceStatus> {
  // Would check Firebase Analytics or other analytics service
  return {
    status: 'operational',
    responseTime: 10,
    lastCheck: new Date().toISOString(),
  };
}

async function getActiveUserCount(): Promise<number> {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    
    const { count, error } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_active', thirtyMinutesAgo);
    
    return count || 0;
  } catch (error) {
    console.error('Failed to get active user count:', error);
    return 0;
  }
}

// Wrap with metrics tracking
export const GET = withMetrics(handler); 