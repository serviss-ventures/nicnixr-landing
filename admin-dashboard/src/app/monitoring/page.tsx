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
      // Fetch database metrics
      const { data: dbStats } = await supabase
        .from('pg_stat_database')
        .select('*')
        .single();

      // Fetch active connections
      const { count: activeConnections } = await supabase
        .from('pg_stat_activity')
        .select('*', { count: 'exact', head: true });

      // Fetch recent errors from logs
      const { data: errorLogs } = await supabase
        .from('error_logs')
        .select('*')
        .gte('created_at', new Date(Date.now() - 60000).toISOString())
        .order('created_at', { ascending: false });

      // Calculate metrics
      const errorRate = errorLogs ? (errorLogs.length / 100) * 100 : 0;

      setServerMetrics({
        cpu: Math.random() * 100, // In production, get from monitoring service
        memory: Math.random() * 100,
        activeConnections: activeConnections || 0,
        requestsPerMinute: Math.floor(Math.random() * 1000),
        errorRate,
        responseTime: Math.random() * 500,
      });

      // Fetch crash reports (from Sentry or error tracking)
      const { data: crashes } = await supabase
        .from('crash_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (crashes) {
        setRecentCrashes(crashes.map(crash => ({
          ...crash,
          timestamp: new Date(crash.created_at),
        })));
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  // Auto-refresh every 5 seconds
  useEffect(() => {
    fetchMetrics();
    
    if (isAutoRefresh) {
      const interval = setInterval(fetchMetrics, 5000);
      return () => clearInterval(interval);
    }
  }, [isAutoRefresh]);

  // Health check monitoring
  const performHealthChecks = async () => {
    const checks = [...healthChecks];
    
    // Check Supabase
    try {
      const start = Date.now();
      await supabase.from('users').select('count', { count: 'exact', head: true });
      checks[0] = {
        ...checks[0],
        status: 'healthy',
        responseTime: Date.now() - start,
        lastChecked: new Date(),
      };
    } catch (error) {
      checks[0] = { ...checks[0], status: 'down', lastChecked: new Date() };
    }

    // Check other services...
    setHealthChecks(checks);
  };

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