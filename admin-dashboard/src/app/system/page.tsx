"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Server,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  HardDrive,
  MemoryStick,
  Wifi,
  Shield,
  RefreshCw,
  Download,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
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
  Cell,
} from "recharts";
import { useState } from "react";

// Mock data for system monitoring
const systemStatus = {
  api: { status: "operational", uptime: 99.98, latency: 45 },
  database: { status: "operational", uptime: 99.95, latency: 12 },
  storage: { status: "operational", usage: 68, capacity: "2.1TB" },
  cdn: { status: "operational", uptime: 99.99, latency: 22 },
  aiService: { status: "degraded", uptime: 98.5, latency: 320 },
  push: { status: "operational", uptime: 99.9, deliveryRate: 98.2 },
};

const performanceMetrics = [
  { time: "00:00", cpu: 45, memory: 62, requests: 1200 },
  { time: "04:00", cpu: 32, memory: 58, requests: 800 },
  { time: "08:00", cpu: 68, memory: 72, requests: 2400 },
  { time: "12:00", cpu: 85, memory: 78, requests: 3200 },
  { time: "16:00", cpu: 72, memory: 75, requests: 2800 },
  { time: "20:00", cpu: 58, memory: 68, requests: 2100 },
  { time: "24:00", cpu: 42, memory: 60, requests: 1500 },
];

const apiEndpoints = [
  { endpoint: "/api/auth", calls: 45200, avgTime: 32, p95: 68, p99: 125, errors: 0.02 },
  { endpoint: "/api/journal", calls: 38400, avgTime: 45, p95: 92, p99: 180, errors: 0.05 },
  { endpoint: "/api/ai-coach", calls: 28900, avgTime: 320, p95: 680, p99: 1200, errors: 1.2 },
  { endpoint: "/api/community", calls: 22100, avgTime: 58, p95: 120, p99: 220, errors: 0.08 },
  { endpoint: "/api/user", calls: 18500, avgTime: 28, p95: 55, p99: 98, errors: 0.01 },
];

const recentErrors = [
  {
    id: "ERR-001",
    message: "AI service timeout",
    endpoint: "/api/ai-coach/chat",
    count: 45,
    firstSeen: "2 hours ago",
    lastSeen: "5 minutes ago",
    severity: "high",
  },
  {
    id: "ERR-002",
    message: "Rate limit exceeded",
    endpoint: "/api/community/posts",
    count: 23,
    firstSeen: "1 hour ago",
    lastSeen: "15 minutes ago",
    severity: "medium",
  },
  {
    id: "ERR-003",
    message: "Database connection timeout",
    endpoint: "/api/journal/save",
    count: 12,
    firstSeen: "3 hours ago",
    lastSeen: "1 hour ago",
    severity: "high",
  },
  {
    id: "ERR-004",
    message: "Invalid auth token",
    endpoint: "/api/auth/refresh",
    count: 8,
    firstSeen: "30 minutes ago",
    lastSeen: "10 minutes ago",
    severity: "low",
  },
];

const infrastructureCosts = {
  monthly: 8542,
  compute: 3200,
  storage: 1850,
  bandwidth: 2100,
  aiService: 1392,
  trend: "+12%",
};

export default function SystemPage() {
  const [selectedMetric, setSelectedMetric] = useState("overview");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "text-success";
      case "degraded":
        return "text-warning";
      case "down":
        return "text-destructive";
      default:
        return "text-white/60";
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-white">System Health</h1>
            <p className="mt-2 text-white/60">
              Infrastructure monitoring and performance metrics
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="secondary" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* System Status Grid */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-light text-white">Service Status</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* API Service */}
            <Card className="border-white/10 bg-white/[0.02]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Server className="h-5 w-5 text-white/60" />
                      <p className="font-medium text-white">API Service</p>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-white/60">
                        Uptime: <span className="text-white">{systemStatus.api.uptime}%</span>
                      </p>
                      <p className="text-sm text-white/60">
                        Latency: <span className="text-white">{systemStatus.api.latency}ms</span>
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 ${getStatusColor(systemStatus.api.status)}`}>
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm capitalize">{systemStatus.api.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Database */}
            <Card className="border-white/10 bg-white/[0.02]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-white/60" />
                      <p className="font-medium text-white">Database</p>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-white/60">
                        Uptime: <span className="text-white">{systemStatus.database.uptime}%</span>
                      </p>
                      <p className="text-sm text-white/60">
                        Query Time: <span className="text-white">{systemStatus.database.latency}ms</span>
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 ${getStatusColor(systemStatus.database.status)}`}>
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm capitalize">{systemStatus.database.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Storage */}
            <Card className="border-white/10 bg-white/[0.02]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-5 w-5 text-white/60" />
                      <p className="font-medium text-white">Storage</p>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-white/60">
                        Usage: <span className="text-white">{systemStatus.storage.usage}%</span>
                      </p>
                      <p className="text-sm text-white/60">
                        Capacity: <span className="text-white">{systemStatus.storage.capacity}</span>
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 ${getStatusColor(systemStatus.storage.status)}`}>
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm capitalize">{systemStatus.storage.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CDN */}
            <Card className="border-white/10 bg-white/[0.02]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Wifi className="h-5 w-5 text-white/60" />
                      <p className="font-medium text-white">CDN</p>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-white/60">
                        Uptime: <span className="text-white">{systemStatus.cdn.uptime}%</span>
                      </p>
                      <p className="text-sm text-white/60">
                        Latency: <span className="text-white">{systemStatus.cdn.latency}ms</span>
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 ${getStatusColor(systemStatus.cdn.status)}`}>
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm capitalize">{systemStatus.cdn.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Service */}
            <Card className="border-white/10 bg-white/[0.02]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Cpu className="h-5 w-5 text-white/60" />
                      <p className="font-medium text-white">AI Service</p>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-white/60">
                        Uptime: <span className="text-white">{systemStatus.aiService.uptime}%</span>
                      </p>
                      <p className="text-sm text-white/60">
                        Response: <span className="text-white">{systemStatus.aiService.latency}ms</span>
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 ${getStatusColor(systemStatus.aiService.status)}`}>
                    <AlertTriangle className="h-5 w-5" />
                    <span className="text-sm capitalize">{systemStatus.aiService.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Push Notifications */}
            <Card className="border-white/10 bg-white/[0.02]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-white/60" />
                      <p className="font-medium text-white">Push Service</p>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-white/60">
                        Uptime: <span className="text-white">{systemStatus.push.uptime}%</span>
                      </p>
                      <p className="text-sm text-white/60">
                        Delivery: <span className="text-white">{systemStatus.push.deliveryRate}%</span>
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 ${getStatusColor(systemStatus.push.status)}`}>
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm capitalize">{systemStatus.push.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">System Performance</h3>
              <p className="text-sm text-white/60">CPU, memory, and request volume</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceMetrics}>
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

          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Infrastructure Costs</h3>
              <p className="text-sm text-white/60">Monthly breakdown</p>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-light text-white">
                      ${infrastructureCosts.monthly.toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-white/60">Monthly total</p>
                  </div>
                  <div className="flex items-center gap-1 text-warning">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">{infrastructureCosts.trend}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Compute</span>
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
                    <span className="text-white/60">Storage</span>
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
                    <span className="text-white/60">Bandwidth</span>
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
                    <span className="text-white/60">AI Service</span>
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
        </div>

        {/* API Endpoints & Errors */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">API Endpoint Performance</h3>
              <p className="text-sm text-white/60">Response times and error rates</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 text-left">
                      <th className="pb-3 text-sm font-medium text-white/60">Endpoint</th>
                      <th className="pb-3 text-center text-sm font-medium text-white/60">Calls</th>
                      <th className="pb-3 text-center text-sm font-medium text-white/60">Avg</th>
                      <th className="pb-3 text-center text-sm font-medium text-white/60">P95</th>
                      <th className="pb-3 text-center text-sm font-medium text-white/60">Errors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {apiEndpoints.map((endpoint) => (
                      <tr key={endpoint.endpoint}>
                        <td className="py-3 text-sm text-white">{endpoint.endpoint}</td>
                        <td className="py-3 text-center text-sm text-white/80">
                          {(endpoint.calls / 1000).toFixed(1)}K
                        </td>
                        <td className="py-3 text-center text-sm text-white/80">{endpoint.avgTime}ms</td>
                        <td className="py-3 text-center text-sm text-white/80">{endpoint.p95}ms</td>
                        <td className="py-3 text-center">
                          <span className={`text-sm ${
                            endpoint.errors > 0.5 ? "text-destructive" : 
                            endpoint.errors > 0.1 ? "text-warning" : 
                            "text-success"
                          }`}>
                            {endpoint.errors}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Recent Errors</h3>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentErrors.map((error) => (
                  <div key={error.id} className="rounded-lg bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{error.message}</p>
                        <p className="mt-1 text-xs text-white/60">{error.endpoint}</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs ${
                        error.severity === "high" ? "bg-destructive/20 text-destructive" :
                        error.severity === "medium" ? "bg-warning/20 text-warning" :
                        "bg-white/10 text-white/60"
                      }`}>
                        {error.severity}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-white/40">
                      <span>{error.count} occurrences</span>
                      <span>First: {error.firstSeen}</span>
                      <span>Last: {error.lastSeen}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 