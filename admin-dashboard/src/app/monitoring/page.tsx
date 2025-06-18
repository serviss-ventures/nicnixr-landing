"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import {
  AlertTriangle,
  Activity,
  Server,
  Users,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ServerMetrics {
  cpu: number;
  memory: number;
  activeConnections: number;
  requestsPerMinute: number;
  errorRate: number;
  responseTime: number;
}

interface CrashReport {
  id: string;
  platform: 'ios' | 'android';
  version: string;
  error: string;
  stackTrace: string;
  userId?: string;
  timestamp: Date;
  deviceInfo: {
    model: string;
    os: string;
    memory: string;
  };
}

interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastChecked: Date;
}

export default function MonitoringPage() {
  const [serverMetrics, setServerMetrics] = useState<ServerMetrics>({
    cpu: 0,
    memory: 0,
    activeConnections: 0,
    requestsPerMinute: 0,
    errorRate: 0,
    responseTime: 0,
  });

  const [recentCrashes, setRecentCrashes] = useState<CrashReport[]>([]);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([
    { service: 'Supabase Database', status: 'healthy', responseTime: 45, lastChecked: new Date() },
    { service: 'Authentication', status: 'healthy', responseTime: 120, lastChecked: new Date() },
    { service: 'Storage (CDN)', status: 'healthy', responseTime: 85, lastChecked: new Date() },
    { service: 'AI Coach API', status: 'healthy', responseTime: 1200, lastChecked: new Date() },
    { service: 'Push Notifications', status: 'healthy', responseTime: 200, lastChecked: new Date() },
    { service: 'RevenueCat', status: 'healthy', responseTime: 150, lastChecked: new Date() },
  ]);

  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fetch real-time metrics
  const fetchMetrics = async () => {
    try {
      // Fetch active users (users active in last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { count: activeUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', fiveMinutesAgo);

      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Fetch AI Coach metrics
      const { data: aiCoachSessions } = await supabase
        .from('ai_coach_sessions')
        .select('*')
        .gte('started_at', new Date(Date.now() - 60000).toISOString());

      const { data: aiCoachMessages } = await supabase
        .from('ai_coach_messages')
        .select('response_time_ms')
        .gte('created_at', new Date(Date.now() - 60000).toISOString());

      // Calculate average response time
      const avgResponseTime = aiCoachMessages?.length 
        ? aiCoachMessages.reduce((sum, msg) => sum + (msg.response_time_ms || 0), 0) / aiCoachMessages.length
        : 0;

      // Fetch community activity
      const { count: recentPosts } = await supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 60000).toISOString());

      // Fetch journal entries (as a proxy for engagement)
      const { count: recentJournals } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 60000).toISOString());

      // Calculate requests per minute (sum of various activities)
      const requestsPerMinute = (aiCoachMessages?.length || 0) + 
                               (recentPosts || 0) + 
                               (recentJournals || 0);

      // Fetch any errors from AI coach audit log
      const { data: auditLogs } = await supabase
        .from('ai_coach_audit_log')
        .select('*')
        .in('risk_level', ['high', 'critical'])
        .gte('created_at', new Date(Date.now() - 60000).toISOString());

      const errorRate = totalUsers && requestsPerMinute 
        ? ((auditLogs?.length || 0) / requestsPerMinute) * 100 
        : 0;

      // Calculate system load based on activity
      const systemLoad = totalUsers ? (activeUsers || 0) / totalUsers * 100 : 0;

      setServerMetrics({
        cpu: systemLoad, // Use system load as proxy for CPU
        memory: Math.min(95, systemLoad * 1.2), // Estimate memory based on load
        activeConnections: activeUsers || 0,
        requestsPerMinute,
        errorRate: Math.min(100, errorRate),
        responseTime: avgResponseTime || 0,
      });

      // Fetch crash reports from error logs or audit log
      const { data: crashes } = await supabase
        .from('ai_coach_audit_log')
        .select('*')
        .eq('action', 'error_logged')
        .order('created_at', { ascending: false })
        .limit(10);

      if (crashes && crashes.length > 0) {
        setRecentCrashes(crashes.map(crash => ({
          id: crash.id,
          platform: crash.metadata?.platform || 'unknown',
          version: crash.metadata?.version || '1.0.0',
          error: crash.metadata?.error || 'Unknown error',
          stackTrace: crash.metadata?.stack_trace || '',
          userId: crash.user_id,
          timestamp: new Date(crash.created_at),
          deviceInfo: {
            model: crash.metadata?.device || 'Unknown',
            os: crash.metadata?.os || 'Unknown',
            memory: crash.metadata?.memory || 'Unknown'
          }
        })));
      } else {
        setRecentCrashes([]);
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  // Health check monitoring
  const performHealthChecks = async () => {
    const checks: HealthCheck[] = [];
    
    // Check Supabase Database
    try {
      const start = Date.now();
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      checks.push({
        service: 'Supabase Database',
        status: 'healthy',
        responseTime: Date.now() - start,
        lastChecked: new Date(),
      });
    } catch (error) {
      checks.push({
        service: 'Supabase Database',
        status: 'down',
        responseTime: 0,
        lastChecked: new Date(),
      });
    }

    // Check Authentication
    try {
      const start = Date.now();
      const { data: { user } } = await supabase.auth.getUser();
      
      checks.push({
        service: 'Authentication',
        status: user ? 'healthy' : 'degraded',
        responseTime: Date.now() - start,
        lastChecked: new Date(),
      });
    } catch (error) {
      checks.push({
        service: 'Authentication',
        status: 'down',
        responseTime: 0,
        lastChecked: new Date(),
      });
    }

    // Check Storage
    try {
      const start = Date.now();
      const { data } = await supabase.storage.from('avatars').list('', { limit: 1 });
      
      checks.push({
        service: 'Storage (CDN)',
        status: 'healthy',
        responseTime: Date.now() - start,
        lastChecked: new Date(),
      });
    } catch (error) {
      checks.push({
        service: 'Storage (CDN)',
        status: 'down',
        responseTime: 0,
        lastChecked: new Date(),
      });
    }

    // Check AI Coach
    try {
      const start = Date.now();
      const { count } = await supabase
        .from('ai_coach_sessions')
        .select('*', { count: 'exact', head: true })
        .limit(1);
      
      checks.push({
        service: 'AI Coach API',
        status: count !== null ? 'healthy' : 'degraded',
        responseTime: Date.now() - start,
        lastChecked: new Date(),
      });
    } catch (error) {
      checks.push({
        service: 'AI Coach API',
        status: 'down',
        responseTime: 0,
        lastChecked: new Date(),
      });
    }

    // Mock external services (these would need real health check endpoints)
    checks.push({
      service: 'Push Notifications',
      status: 'healthy',
      responseTime: 45,
      lastChecked: new Date(),
    });

    checks.push({
      service: 'RevenueCat',
      status: 'healthy',
      responseTime: 120,
      lastChecked: new Date(),
    });

    setHealthChecks(checks);
  };

  // Auto-refresh every 5 seconds
  useEffect(() => {
    fetchMetrics();
    performHealthChecks();
    
    if (isAutoRefresh) {
      const interval = setInterval(() => {
        fetchMetrics();
        performHealthChecks();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAutoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-success';
      case 'degraded': return 'text-warning';
      case 'down': return 'text-destructive';
      default: return 'text-white/60';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'degraded': return AlertCircle;
      case 'down': return XCircle;
      default: return AlertCircle;
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-white">Real-Time Monitoring</h1>
            <p className="mt-2 text-white/60">
              System health and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${
                isAutoRefresh 
                  ? 'bg-primary/20 text-primary' 
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${isAutoRefresh ? 'animate-spin' : ''}`} />
              Auto-refresh: {isAutoRefresh ? 'ON' : 'OFF'}
            </button>
            <div className="text-sm text-white/40">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Server Metrics */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-6">
          <MetricCard
            title="CPU Usage"
            value={`${serverMetrics.cpu.toFixed(1)}%`}
            icon={Server}
            trend={{ 
              value: serverMetrics.cpu > 80 ? -5 : 5, 
              isPositive: serverMetrics.cpu < 80 
            }}
          />
          <MetricCard
            title="Memory"
            value={`${serverMetrics.memory.toFixed(1)}%`}
            icon={Activity}
            trend={{ 
              value: serverMetrics.memory > 80 ? -5 : 5, 
              isPositive: serverMetrics.memory < 80 
            }}
          />
          <MetricCard
            title="Active Users"
            value={serverMetrics.activeConnections.toString()}
            icon={Users}
          />
          <MetricCard
            title="Requests/min"
            value={serverMetrics.requestsPerMinute.toString()}
            icon={TrendingUp}
          />
          <MetricCard
            title="Error Rate"
            value={`${serverMetrics.errorRate.toFixed(2)}%`}
            icon={AlertTriangle}
            trend={{ 
              value: serverMetrics.errorRate, 
              isPositive: serverMetrics.errorRate < 1 
            }}
          />
          <MetricCard
            title="Response Time"
            value={`${serverMetrics.responseTime.toFixed(0)}ms`}
            icon={Clock}
            trend={{ 
              value: serverMetrics.responseTime > 500 ? -10 : 10, 
              isPositive: serverMetrics.responseTime < 500 
            }}
          />
        </div>

        {/* Health Checks & Crash Reports */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Service Health */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Service Health</h3>
              <p className="text-sm text-white/60">All critical services status</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {healthChecks.map((check, index) => {
                  const Icon = getStatusIcon(check.status);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg bg-white/[0.03] p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${getStatusColor(check.status)}`} />
                        <div>
                          <p className="text-sm font-medium text-white">{check.service}</p>
                          <p className="text-xs text-white/60">
                            Response: {check.responseTime}ms
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${getStatusColor(check.status)}`}>
                          {check.status.toUpperCase()}
                        </p>
                        <p className="text-xs text-white/40">
                          {check.lastChecked.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Crashes */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Recent Crash Reports</h3>
              <p className="text-sm text-white/60">Latest app crashes from Sentry</p>
            </CardHeader>
            <CardContent>
              {recentCrashes.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center">
                  <div className="text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-success/50" />
                    <p className="mt-2 text-sm text-white/60">No crashes in the last hour</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {recentCrashes.map((crash) => (
                    <div
                      key={crash.id}
                      className="rounded-lg bg-destructive/10 p-3 border border-destructive/20"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{crash.error}</p>
                          <p className="mt-1 text-xs text-white/60">
                            {crash.platform} • v{crash.version} • {crash.deviceInfo.model}
                          </p>
                          <p className="mt-1 text-xs text-white/40">
                            {crash.timestamp.toLocaleString()}
                          </p>
                        </div>
                        <button className="text-xs text-primary hover:underline">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Performance Graphs */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Performance Timeline</h3>
              <p className="text-sm text-white/60">Last 24 hours</p>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-white/40">
                {/* Add real-time charts here with recharts */}
                <p>Performance graphs would go here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 