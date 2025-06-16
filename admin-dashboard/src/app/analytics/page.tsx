"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  TrendingUp,
  Users,
  Activity,
  Clock,
  Target,
  Filter,
  Download,
  Calendar,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
} from "recharts";
import { useState } from "react";

// Mock data for analytics
const engagementData = [
  { date: "Mon", sessions: 3200, duration: 12.5, actions: 8.2 },
  { date: "Tue", sessions: 3500, duration: 13.1, actions: 8.7 },
  { date: "Wed", sessions: 3100, duration: 11.8, actions: 7.9 },
  { date: "Thu", sessions: 3800, duration: 14.2, actions: 9.1 },
  { date: "Fri", sessions: 4200, duration: 15.3, actions: 9.8 },
  { date: "Sat", sessions: 4500, duration: 16.1, actions: 10.2 },
  { date: "Sun", sessions: 4100, duration: 14.8, actions: 9.5 },
];

const cohortData = [
  { cohort: "Week 1", week1: 100, week2: 75, week3: 62, week4: 55, week5: 48, week6: 42 },
  { cohort: "Week 2", week1: 100, week2: 78, week3: 65, week4: 58, week5: 52, week6: 46 },
  { cohort: "Week 3", week1: 100, week2: 82, week3: 68, week4: 61, week5: 55, week6: 50 },
  { cohort: "Week 4", week1: 100, week2: 85, week3: 72, week4: 65, week5: 59, week6: 54 },
];

const funnelData = [
  { name: "App Opened", value: 10000, fill: "#C084FC" },
  { name: "Signed Up", value: 6500, fill: "#A78BFA" },
  { name: "Completed Onboarding", value: 5200, fill: "#8B5CF6" },
  { name: "First Journal Entry", value: 3800, fill: "#7C3AED" },
  { name: "Week 1 Retention", value: 2850, fill: "#6D28D9" },
  { name: "Month 1 Retention", value: 1900, fill: "#5B21B6" },
];

const behaviorPatterns = [
  { hour: "00", journaling: 120, coaching: 80, community: 45 },
  { hour: "03", journaling: 85, coaching: 50, community: 25 },
  { hour: "06", journaling: 320, coaching: 180, community: 95 },
  { hour: "09", journaling: 580, coaching: 420, community: 280 },
  { hour: "12", journaling: 720, coaching: 580, community: 420 },
  { hour: "15", journaling: 650, coaching: 520, community: 380 },
  { hour: "18", journaling: 880, coaching: 720, community: 580 },
  { hour: "21", journaling: 950, coaching: 680, community: 520 },
];

const featureAdoptionData = [
  { feature: "Daily Check-ins", adopted: 85, active: 72 },
  { feature: "AI Coaching", adopted: 78, active: 65 },
  { feature: "Community Posts", adopted: 62, active: 48 },
  { feature: "Buddy System", adopted: 45, active: 38 },
  { feature: "Recovery Plans", adopted: 58, active: 51 },
  { feature: "Progress Tracking", adopted: 92, active: 85 },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedMetric, setSelectedMetric] = useState("engagement");

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-white">Analytics Dashboard</h1>
            <p className="mt-2 text-white/60">
              Deep insights into user behavior and platform performance
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              {timeRange === "7d" ? "Last 7 Days" : timeRange === "30d" ? "Last 30 Days" : "Last 90 Days"}
            </Button>
            <Button variant="secondary" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button variant="secondary" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/60">Avg Session Duration</p>
                  <p className="mt-2 text-2xl font-light text-white">14.2m</p>
                  <p className="mt-1 text-xs text-success">+8.3% from last period</p>
                </div>
                <Clock className="h-8 w-8 text-white/20" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/60">Daily Active Users</p>
                  <p className="mt-2 text-2xl font-light text-white">3,847</p>
                  <p className="mt-1 text-xs text-success">+12.5% from last period</p>
                </div>
                <Users className="h-8 w-8 text-white/20" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/60">Feature Adoption</p>
                  <p className="mt-2 text-2xl font-light text-white">68.4%</p>
                  <p className="mt-1 text-xs text-success">+5.2% from last period</p>
                </div>
                <Target className="h-8 w-8 text-white/20" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/60">Engagement Score</p>
                  <p className="mt-2 text-2xl font-light text-white">7.8/10</p>
                  <p className="mt-1 text-xs text-warning">-0.2 from last period</p>
                </div>
                <Activity className="h-8 w-8 text-white/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Engagement Trends */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">User Engagement Trends</h3>
              <p className="text-sm text-white/60">Sessions, duration, and actions over time</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                  <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" />
                  <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="sessions" fill="#8B5CF6" opacity={0.8} />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="duration"
                    stroke="#22C55E"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="actions"
                    stroke="#F59E0B"
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Funnel Analysis */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">User Journey Funnel</h3>
              <p className="text-sm text-white/60">Conversion through key milestones</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <FunnelChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                  <Funnel
                    dataKey="value"
                    data={funnelData}
                    isAnimationActive
                  >
                    <LabelList position="center" fill="#fff" />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Cohort Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <h3 className="text-lg font-medium text-white">Cohort Retention Analysis</h3>
            <p className="text-sm text-white/60">Weekly retention by user cohort</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-3 text-left text-sm font-medium text-white/60">Cohort</th>
                    <th className="p-3 text-center text-sm font-medium text-white/60">Week 1</th>
                    <th className="p-3 text-center text-sm font-medium text-white/60">Week 2</th>
                    <th className="p-3 text-center text-sm font-medium text-white/60">Week 3</th>
                    <th className="p-3 text-center text-sm font-medium text-white/60">Week 4</th>
                    <th className="p-3 text-center text-sm font-medium text-white/60">Week 5</th>
                    <th className="p-3 text-center text-sm font-medium text-white/60">Week 6</th>
                  </tr>
                </thead>
                <tbody>
                  {cohortData.map((cohort) => (
                    <tr key={cohort.cohort} className="border-b border-white/5">
                      <td className="p-3 text-sm text-white">{cohort.cohort}</td>
                      <td className="p-3 text-center">
                        <div className="inline-flex h-8 w-16 items-center justify-center rounded bg-primary/20 text-sm text-white">
                          {cohort.week1}%
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div
                          className="inline-flex h-8 w-16 items-center justify-center rounded text-sm text-white"
                          style={{
                            backgroundColor: `rgba(192, 132, 252, ${cohort.week2 / 100})`,
                          }}
                        >
                          {cohort.week2}%
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div
                          className="inline-flex h-8 w-16 items-center justify-center rounded text-sm text-white"
                          style={{
                            backgroundColor: `rgba(192, 132, 252, ${cohort.week3 / 100})`,
                          }}
                        >
                          {cohort.week3}%
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div
                          className="inline-flex h-8 w-16 items-center justify-center rounded text-sm text-white"
                          style={{
                            backgroundColor: `rgba(192, 132, 252, ${cohort.week4 / 100})`,
                          }}
                        >
                          {cohort.week4}%
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div
                          className="inline-flex h-8 w-16 items-center justify-center rounded text-sm text-white"
                          style={{
                            backgroundColor: `rgba(192, 132, 252, ${cohort.week5 / 100})`,
                          }}
                        >
                          {cohort.week5}%
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div
                          className="inline-flex h-8 w-16 items-center justify-center rounded text-sm text-white"
                          style={{
                            backgroundColor: `rgba(192, 132, 252, ${cohort.week6 / 100})`,
                          }}
                        >
                          {cohort.week6}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Behavior Patterns & Feature Adoption */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">User Activity Heatmap</h3>
              <p className="text-sm text-white/60">Feature usage by time of day</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={behaviorPatterns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="hour" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="journaling"
                    stackId="1"
                    stroke="#C084FC"
                    fill="#C084FC"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="coaching"
                    stackId="1"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="community"
                    stackId="1"
                    stroke="#6D28D9"
                    fill="#6D28D9"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Feature Adoption Rate</h3>
              <p className="text-sm text-white/60">Adoption vs active usage</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={featureAdoptionData} layout="horizontal">
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
                  <Legend />
                  <Bar dataKey="adopted" fill="#C084FC" radius={[0, 4, 4, 0]} opacity={0.8} />
                  <Bar dataKey="active" fill="#22C55E" radius={[0, 4, 4, 0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 