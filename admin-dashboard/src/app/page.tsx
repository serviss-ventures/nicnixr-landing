"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/ui/MetricCard";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { DataStatusIndicator } from "@/components/ui/DataStatusIndicator";
import {
  Users,
  TrendingUp,
  Clock,
  DollarSign,
  Activity,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// 🟥 [MOCK] - All dashboard data is mock. Connect to real user_stats table
const userGrowthData = [
  { month: "Jan", users: 1200 },
  { month: "Feb", users: 1800 },
  { month: "Mar", users: 2400 },
  { month: "Apr", users: 3100 },
  { month: "May", users: 4200 },
  { month: "Jun", users: 5600 },
];

const retentionData = [
  { day: "Day 1", rate: 100 },
  { day: "Day 7", rate: 75 },
  { day: "Day 30", rate: 52 },
  { day: "Day 60", rate: 41 },
  { day: "Day 90", rate: 38 },
];

const featureUsageData = [
  { feature: "Journal", usage: 85 },
  { feature: "AI Coach", usage: 72 },
  { feature: "Community", usage: 64 },
  { feature: "Plans", usage: 58 },
];

const platformData = [
  { name: "iOS", value: 62, color: "#C084FC" },
  { name: "Android", value: 38, color: "#8B5CF6" },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light text-white">Central Brain Dashboard</h1>
              <p className="mt-2 text-white/60">
                Real-time insights into your recovery platform
              </p>
            </div>
            <DataStatusIndicator status="mock" />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Active Users"
            value="5,624"
            subtitle="Currently using the app"
            icon={Users}
            trend={{ value: 12.5, isPositive: true }}
          />
          <MetricCard
            title="Success Rate"
            value="73%"
            subtitle="Users still quit"
            icon={TrendingUp}
            trend={{ value: 5.2, isPositive: true }}
          />
          <MetricCard
            title="Days Saved"
            value="142K"
            subtitle="Cumulative across all users"
            icon={Clock}
            trend={{ value: 18.3, isPositive: true }}
          />
          <MetricCard
            title="Revenue (Est)"
            value="$0"
            subtitle="Pre-monetization"
            icon={DollarSign}
          />
        </div>

        {/* Charts Section */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* User Growth */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">User Growth</h3>
              <p className="text-sm text-white/60">Monthly active users</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userGrowthData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C084FC" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#C084FC" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#C084FC"
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Retention Curve */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Retention Curve</h3>
              <p className="text-sm text-white/60">User retention over time</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={retentionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#22C55E"
                    strokeWidth={2}
                    dot={{ fill: "#22C55E", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Feature Usage */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Feature Adoption</h3>
              <p className="text-sm text-white/60">Most used features</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={featureUsageData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.5)" />
                  <YAxis type="category" dataKey="feature" stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="usage" fill="#8B5CF6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Platform Distribution */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Platform Distribution</h3>
              <p className="text-sm text-white/60">iOS vs Android users</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 flex justify-center gap-6">
                {platformData.map((platform) => (
                  <div key={platform.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: platform.color }}
                    />
                    <span className="text-sm text-white/60">
                      {platform.name}: {platform.value}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* System Alerts */}
          <Card>
            <CardHeader>
              <h3 className="flex items-center gap-2 text-lg font-medium text-white">
                <AlertCircle className="h-5 w-5 text-warning" />
                System Alerts
              </h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-3">
                <div className="h-2 w-2 rounded-full bg-destructive mt-1.5" />
                <div>
                  <p className="text-sm font-medium text-white">High Error Rate</p>
                  <p className="text-xs text-white/60">API errors increased by 23%</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-warning/10 p-3">
                <div className="h-2 w-2 rounded-full bg-warning mt-1.5" />
                <div>
                  <p className="text-sm font-medium text-white">Storage Warning</p>
                  <p className="text-xs text-white/60">85% of storage capacity used</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Support Tickets */}
          <Card>
            <CardHeader>
              <h3 className="flex items-center gap-2 text-lg font-medium text-white">
                <MessageSquare className="h-5 w-5 text-primary" />
                Recent Support
              </h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-sm font-medium text-white">Account recovery</p>
                  <p className="text-xs text-white/60">2 minutes ago • High priority</p>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-sm font-medium text-white">Buddy system issue</p>
                  <p className="text-xs text-white/60">15 minutes ago • Medium priority</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Coach Performance */}
          <Card>
            <CardHeader>
              <h3 className="flex items-center gap-2 text-lg font-medium text-white">
                <Activity className="h-5 w-5 text-success" />
                AI Coach Status
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Response Time</span>
                    <span className="text-white">1.2s avg</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-white/10">
                    <div className="h-full w-[85%] rounded-full bg-success" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">User Satisfaction</span>
                    <span className="text-white">94%</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-white/10">
                    <div className="h-full w-[94%] rounded-full bg-primary" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
