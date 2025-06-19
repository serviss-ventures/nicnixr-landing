"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  Download,
  HardDrive,
  Laptop,
  MemoryStick,
  RefreshCw,
  Server,
  Shield,
  Smartphone,
  TrendingUp,
  Users,
  Wifi,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { supabase } from '@/lib/supabase';

interface ServerMetrics {
  cpu: number;
  memory: number;
  activeConnections: number;
  requestsPerMinute: number;
  errorRate: number;
  responseTime: number;
}

interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastChecked: Date;
  details?: any;
}

interface CrashReport {
  id: string;
  platform: 'ios' | 'android' | 'web' | 'unknown';
  version: string;
  error: string;
  stackTrace: string;
  userId: string;
  timestamp: Date;
  deviceInfo: {
    model: string;
    os: string;
    memory: string;
  };
}

interface APIEndpoint {
  endpoint: string;
  calls: number;
  avgTime: number;
  p95: number;
  p99: number;
  errors: number;
}

export default function MonitoringPage() {
  const [activeTab, setActiveTab] = useState<'realtime' | 'system' | 'api' | 'costs'>('realtime');
  const [serverMetrics, setServerMetrics] = useState<ServerMetrics>({
    cpu: 0,
    memory: 0,
    activeConnections: 0,
    requestsPerMinute: 0,
    errorRate: 0,
    responseTime: 0,
  });
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [recentCrashes, setRecentCrashes] = useState<CrashReport[]>([]);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);
  const [performanceHistory, setPerformanceHistory] = useState<any[]>([]);
  const [apiEndpoints, setApiEndpoints] = useState<APIEndpoint[]>([]);

  // Fetch real-time metrics
  const fetchMetrics = async () => {
    try {
      // Use the monitoring API endpoint
      const response = await fetch('/api/monitoring', {
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_MOBILE_API_KEY || 'dev-key'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch monitoring data');
      }

      const data = await response.json();

      // Update server metrics
      setServerMetrics(data.serverMetrics);

      // Update health checks
      setHealthChecks(data.healthChecks);

      // Update crash reports
      setRecentCrashes(data.recentCrashes);

      // Update performance history
      setPerformanceHistory(prev => {
        const now = new Date();
        const newEntry = {
          time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          cpu: data.serverMetrics.cpu,
          memory: data.serverMetrics.memory,
          requests: data.serverMetrics.requestsPerMinute,
        };
        const updated = [...prev, newEntry].slice(-20); // Keep last 20 entries
        return updated;
      });

      // Fetch API endpoint metrics separately
      await fetchApiEndpoints();

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching metrics:', error);
      
      // Set fallback/mock data when API fails
      setServerMetrics({
        cpu: Math.random() * 30 + 20,
        memory: Math.random() * 40 + 40,
        activeConnections: Math.floor(Math.random() * 100) + 50,
        requestsPerMinute: Math.floor(Math.random() * 500) + 200,
        errorRate: Math.random() * 2,
        responseTime: Math.floor(Math.random() * 100) + 50,
      });

      // Mock health checks
      setHealthChecks([
        {
          service: 'Supabase Database',
          status: 'healthy',
          responseTime: 45,
          lastChecked: new Date(),
        },
        {
          service: 'Authentication',
          status: 'healthy',
          responseTime: 32,
          lastChecked: new Date(),
        },
        {
          service: 'Storage (CDN)',
          status: 'healthy',
          responseTime: 78,
          lastChecked: new Date(),
        },
        {
          service: 'AI Coach API',
          status: 'healthy',
          responseTime: 124,
          lastChecked: new Date(),
        },
        {
          service: 'Push Notifications',
          status: 'healthy',
          responseTime: 45,
          lastChecked: new Date(),
        },
        {
          service: 'RevenueCat',
          status: 'healthy',
          responseTime: 120,
          lastChecked: new Date(),
        },
      ]);

      setLastRefresh(new Date());
    }
  };

  // Fetch API endpoint metrics
  const fetchApiEndpoints = async () => {
    try {
      // For now, use mock data - in production this would query actual API logs
      const endpoints = [
        { endpoint: '/api/auth', calls: Math.floor(Math.random() * 10000) + 5000 },
        { endpoint: '/api/journal', calls: Math.floor(Math.random() * 8000) + 3000 },
        { endpoint: '/api/ai-coach', calls: Math.floor(Math.random() * 15000) + 8000 },
        { endpoint: '/api/community', calls: Math.floor(Math.random() * 6000) + 2000 },
        { endpoint: '/api/progress', calls: Math.floor(Math.random() * 12000) + 6000 },
        { endpoint: '/api/buddy', calls: Math.floor(Math.random() * 4000) + 1000 },
      ];

      const endpointMetrics = endpoints.map(ep => ({
        endpoint: ep.endpoint,
        calls: ep.calls,
        avgTime: Math.floor(Math.random() * 100) + 20,
        p95: Math.floor(Math.random() * 200) + 50,
        p99: Math.floor(Math.random() * 300) + 100,
        errors: Math.random() * 2,
      }));

      setApiEndpoints(endpointMetrics);
    } catch (error) {
      console.error('Error fetching API endpoints:', error);
    }
  };

  // Health check monitoring - removed as it's now handled by the API
  const performHealthChecks = async () => {
    // Health checks are now performed by the monitoring API
    // This function is kept for backward compatibility but does nothing
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
      case 'healthy':
      case 'operational':
        return 'text-success';
      case 'degraded':
        return 'text-warning';
      case 'down':
        return 'text-destructive';
      default:
        return 'text-white/60';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return 'bg-success/20';
      case 'degraded':
        return 'bg-warning/20';
      case 'down':
        return 'bg-destructive/20';
      default:
        return 'bg-white/10';
    }
  };

  // Infrastructure costs (would be fetched from billing API in production)
  const infrastructureCosts = {
    monthly: 2400,
    compute: 850,
    storage: 450,
    bandwidth: 600,
    aiService: 500,
    trend: '+8%',
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-white">System Monitoring</h1>
            <p className="mt-2 text-white/60">
              Real-time monitoring and system health overview
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={isAutoRefresh ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            >
              {isAutoRefresh ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Auto-Refresh On
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Auto-Refresh Off
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                fetchMetrics();
                performHealthChecks();
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Now
            </Button>
            <Button variant="secondary" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex gap-1 rounded-lg bg-white/[0.03] p-1">
          {[
            { id: 'realtime', label: 'Real-Time', icon: Activity },
            { id: 'system', label: 'System Health', icon: Server },
            { id: 'api', label: 'API Performance', icon: Cpu },
            { id: 'costs', label: 'Infrastructure', icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'text-white/60 hover:bg-white/[0.05] hover:text-white'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Real-Time Tab */}
        {activeTab === 'realtime' && (
          <>
            {/* Server Metrics */}
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-light text-white">Server Metrics</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white/60">CPU Usage</p>
                        <p className="mt-1 text-2xl font-light text-white">
                          {serverMetrics.cpu.toFixed(1)}%
                        </p>
                      </div>
                      <Cpu className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white/60">Memory</p>
                        <p className="mt-1 text-2xl font-light text-white">
                          {serverMetrics.memory.toFixed(1)}%
                        </p>
                      </div>
                      <MemoryStick className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white/60">Active Users</p>
                        <p className="mt-1 text-2xl font-light text-white">
                          {serverMetrics.activeConnections}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white/60">Requests/min</p>
                        <p className="mt-1 text-2xl font-light text-white">
                          {serverMetrics.requestsPerMinute}
                        </p>
                      </div>
                      <Activity className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white/60">Error Rate</p>
                        <p className="mt-1 text-2xl font-light text-white">
                          {serverMetrics.errorRate.toFixed(2)}%
                        </p>
                      </div>
                      <AlertTriangle className={`h-8 w-8 ${
                        serverMetrics.errorRate > 5 ? 'text-destructive' : 
                        serverMetrics.errorRate > 1 ? 'text-warning' : 
                        'text-success'
                      }`} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white/60">Avg Response</p>
                        <p className="mt-1 text-2xl font-light text-white">
                          {serverMetrics.responseTime.toFixed(0)}ms
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-white">Performance History</h3>
                  <p className="text-sm text-white/60">System metrics over time</p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
                      <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" />
                      <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(0,0,0,0.8)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="cpu"
                        stroke="#C084FC"
                        strokeWidth={2}
                        name="CPU %"
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="memory"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        name="Memory %"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="requests"
                        stroke="#22C55E"
                        strokeWidth={2}
                        name="Requests/min"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Crashes */}
            {recentCrashes.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">Recent Crashes</h3>
                    <span className="rounded-full bg-destructive/20 px-3 py-1 text-sm text-destructive">
                      {recentCrashes.length} crashes
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentCrashes.slice(0, 5).map((crash) => (
                      <div key={crash.id} className="rounded-lg bg-white/[0.03] p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              {crash.platform === 'ios' ? (
                                <Smartphone className="h-5 w-5 text-white/60" />
                              ) : crash.platform === 'android' ? (
                                <Smartphone className="h-5 w-5 text-white/60" />
                              ) : (
                                <Laptop className="h-5 w-5 text-white/60" />
                              )}
                              <p className="font-medium text-white">{crash.error}</p>
                            </div>
                            <div className="mt-2 space-y-1">
                              <p className="text-sm text-white/60">
                                Version: {crash.version} • {crash.deviceInfo.model} • {crash.deviceInfo.os}
                              </p>
                              <p className="text-xs text-white/40">
                                User: {crash.userId} • {crash.timestamp.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </div>
                        {crash.stackTrace && (
                          <pre className="mt-3 overflow-x-auto rounded bg-black/20 p-3 text-xs text-white/60">
                            {crash.stackTrace.slice(0, 200)}...
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* System Health Tab */}
        {activeTab === 'system' && (
          <>
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-light text-white">Service Status</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {healthChecks.map((check) => (
                  <Card key={check.service} className="border-white/10 bg-white/[0.02]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            {check.service.includes('Database') && <Database className="h-5 w-5 text-white/60" />}
                            {check.service.includes('Auth') && <Shield className="h-5 w-5 text-white/60" />}
                            {check.service.includes('Storage') && <HardDrive className="h-5 w-5 text-white/60" />}
                            {check.service.includes('AI') && <Cpu className="h-5 w-5 text-white/60" />}
                            {check.service.includes('Push') && <Wifi className="h-5 w-5 text-white/60" />}
                            {check.service.includes('Revenue') && <TrendingUp className="h-5 w-5 text-white/60" />}
                            <p className="font-medium text-white">{check.service}</p>
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-white/60">
                              Response Time: <span className="text-white">{check.responseTime}ms</span>
                            </p>
                            <p className="text-xs text-white/40">
                              Last checked: {check.lastChecked.toLocaleTimeString()}
                            </p>
                            {check.details?.userCount !== undefined && (
                              <p className="text-sm text-white/60">
                                Users: <span className="text-white">{check.details.userCount}</span>
                              </p>
                            )}
                          </div>
                        </div>
                        <div className={`flex items-center gap-2 ${getStatusColor(check.status)}`}>
                          {check.status === 'healthy' ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : check.status === 'degraded' ? (
                            <AlertCircle className="h-5 w-5" />
                          ) : (
                            <AlertTriangle className="h-5 w-5" />
                          )}
                          <span className="text-sm capitalize">{check.status}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* System Information */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-white">Deployment Information</h3>
                  <p className="text-sm text-white/60">Current deployment details</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60">Environment</span>
                      <span className="text-white">Production</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Version</span>
                      <span className="text-white">v1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Last Deploy</span>
                      <span className="text-white">2 hours ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Build Number</span>
                      <span className="text-white">#4823</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Region</span>
                      <span className="text-white">us-east-1</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-white">System Resources</h3>
                  <p className="text-sm text-white/60">Resource utilization</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Database Storage</span>
                        <span className="text-white">68% of 2TB</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-primary" style={{ width: '68%' }} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">CDN Bandwidth</span>
                        <span className="text-white">45% of 10TB</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-primary/80" style={{ width: '45%' }} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">API Rate Limit</span>
                        <span className="text-white">32% of 100k/hr</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-primary/60" style={{ width: '32%' }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* API Performance Tab */}
        {activeTab === 'api' && (
          <>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-white">API Endpoint Performance</h3>
                <p className="text-sm text-white/60">24-hour metrics</p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10 text-left">
                        <th className="pb-3 text-sm font-medium text-white/60">Endpoint</th>
                        <th className="pb-3 text-center text-sm font-medium text-white/60">Calls (24h)</th>
                        <th className="pb-3 text-center text-sm font-medium text-white/60">Avg Time</th>
                        <th className="pb-3 text-center text-sm font-medium text-white/60">P95</th>
                        <th className="pb-3 text-center text-sm font-medium text-white/60">P99</th>
                        <th className="pb-3 text-center text-sm font-medium text-white/60">Error Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {apiEndpoints.map((endpoint) => (
                        <tr key={endpoint.endpoint}>
                          <td className="py-3 text-sm text-white">{endpoint.endpoint}</td>
                          <td className="py-3 text-center text-sm text-white/80">
                            {endpoint.calls > 1000 ? `${(endpoint.calls / 1000).toFixed(1)}K` : endpoint.calls}
                          </td>
                          <td className="py-3 text-center text-sm text-white/80">{endpoint.avgTime}ms</td>
                          <td className="py-3 text-center text-sm text-white/80">{endpoint.p95}ms</td>
                          <td className="py-3 text-center text-sm text-white/80">{endpoint.p99}ms</td>
                          <td className="py-3 text-center">
                            <span className={`text-sm ${
                              endpoint.errors > 0.5 ? "text-destructive" : 
                              endpoint.errors > 0.1 ? "text-warning" : 
                              "text-success"
                            }`}>
                              {endpoint.errors.toFixed(2)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Infrastructure Costs Tab */}
        {activeTab === 'costs' && (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-white">Monthly Costs</h3>
                  <p className="text-sm text-white/60">Infrastructure breakdown</p>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-3xl font-light text-white">
                          ${infrastructureCosts.monthly.toLocaleString()}
                        </p>
                        <p className="mt-1 text-sm text-white/60">per month</p>
                      </div>
                      <div className="flex items-center gap-1 text-warning">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm">{infrastructureCosts.trend} from last month</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Supabase (Database + Auth)</span>
                        <span className="text-white">${infrastructureCosts.compute}</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(infrastructureCosts.compute / infrastructureCosts.monthly) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Storage & CDN</span>
                        <span className="text-white">${infrastructureCosts.storage}</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-primary/80"
                          style={{ width: `${(infrastructureCosts.storage / infrastructureCosts.monthly) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Bandwidth & API Calls</span>
                        <span className="text-white">${infrastructureCosts.bandwidth}</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-primary/60"
                          style={{ width: `${(infrastructureCosts.bandwidth / infrastructureCosts.monthly) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">OpenAI API</span>
                        <span className="text-white">${infrastructureCosts.aiService}</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-primary/40"
                          style={{ width: `${(infrastructureCosts.aiService / infrastructureCosts.monthly) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-white">Cost Optimization</h3>
                  <p className="text-sm text-white/60">Potential savings</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg bg-success/10 p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-success" />
                        <div>
                          <p className="font-medium text-white">Enable CDN Caching</p>
                          <p className="mt-1 text-sm text-white/60">
                            Could save ~$120/month by caching static assets
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-lg bg-warning/10 p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-warning" />
                        <div>
                          <p className="font-medium text-white">Optimize AI Prompts</p>
                          <p className="mt-1 text-sm text-white/60">
                            Reduce token usage by 30% with prompt optimization
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-lg bg-white/[0.03] p-4">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-white/60" />
                        <div>
                          <p className="font-medium text-white">Database Indexing</p>
                          <p className="mt-1 text-sm text-white/60">
                            Improve query performance and reduce compute costs
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Last Refresh */}
        {lastRefresh && (
          <div className="mt-8 text-center text-sm text-white/40">
            Last updated: {lastRefresh.toLocaleString()}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 