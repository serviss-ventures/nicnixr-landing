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
  Heart,
  Brain,
  Shield,
  AlertCircle,
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
import { useState, useEffect } from "react";

// Mock data for features not yet connected to database
const triggerPatternsData = [
  { hour: "00", stress: 120, craving: 180, social: 45, environmental: 65 },
  { hour: "03", stress: 185, craving: 220, social: 25, environmental: 45 },
  { hour: "06", stress: 320, craving: 180, social: 95, environmental: 120 },
  { hour: "09", stress: 580, craving: 420, social: 280, environmental: 320 },
  { hour: "12", stress: 420, craving: 380, social: 520, environmental: 450 },
  { hour: "15", stress: 650, craving: 520, social: 480, environmental: 420 },
  { hour: "18", stress: 880, craving: 920, social: 780, environmental: 650 },
  { hour: "21", stress: 950, craving: 1100, social: 920, environmental: 780 },
];

const recoveryToolsUsage = [
  { tool: "Daily Check-ins", adoption: 92, effectiveness: 85 },
  { tool: "AI Coach Sessions", adoption: 78, effectiveness: 88 },
  { tool: "Journal Writing", adoption: 65, effectiveness: 82 },
  { tool: "Buddy System", adoption: 45, effectiveness: 91 },
  { tool: "Emergency Hotline", adoption: 23, effectiveness: 95 },
  { tool: "Community Support", adoption: 58, effectiveness: 79 },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedMetric, setSelectedMetric] = useState("engagement");
  const [isLoading, setIsLoading] = useState(true);
  
  // Data states
  const [recoveryEngagementData, setRecoveryEngagementData] = useState<any[]>([]);
  const [sobrietyCohortData, setSobrietyCohortData] = useState<any[]>([]);
  const [recoveryFunnelData, setRecoveryFunnelData] = useState<any[]>([]);
  const [keyMetrics, setKeyMetrics] = useState({
    retention30Day: 68.4,
    avgDaysClean: 127,
    crisisInterventions: 42,
    recoveryScore: 8.2,
  });
  const [substanceBreakdown, setSubstanceBreakdown] = useState<any[]>([]);

  // Fetch data on component mount and when timeRange changes
  useEffect(() => {
    async function fetchAnalyticsData() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/analytics?timeRange=${timeRange}`);
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        
        const data = await response.json();
        
        setRecoveryEngagementData(data.engagement || []);
        setSobrietyCohortData(data.cohorts || []);
        setRecoveryFunnelData(data.funnel || []);
        setKeyMetrics(data.metrics || {
          retention30Day: 0,
          avgDaysClean: 0,
          crisisInterventions: 0,
          recoveryScore: 0,
        });
        setSubstanceBreakdown(data.substances || []);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        // Set default values on error
        setRecoveryEngagementData([]);
        setSobrietyCohortData([]);
        setRecoveryFunnelData([]);
        setKeyMetrics({
          retention30Day: 0,
          avgDaysClean: 0,
          crisisInterventions: 0,
          recoveryScore: 0,
        });
        setSubstanceBreakdown([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalyticsData();
  }, [timeRange]);

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-white">Recovery Analytics</h1>
            <p className="mt-2 text-white/60">
              Deep insights into recovery journeys and user behavior
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

        {/* Key Recovery Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/60">30-Day Retention</p>
                  <p className="mt-2 text-2xl font-light text-white">{keyMetrics.retention30Day}%</p>
                  <p className="mt-1 text-xs text-success">+5.2% from last month</p>
                </div>
                <Shield className="h-8 w-8 text-white/20" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/60">Avg Days Clean</p>
                  <p className="mt-2 text-2xl font-light text-white">{keyMetrics.avgDaysClean}</p>
                  <p className="mt-1 text-xs text-success">+12 days from last month</p>
                </div>
                <Heart className="h-8 w-8 text-white/20" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/60">Crisis Interventions</p>
                  <p className="mt-2 text-2xl font-light text-white">{keyMetrics.crisisInterventions}</p>
                  <p className="mt-1 text-xs text-warning">98% resolved safely</p>
                </div>
                <AlertCircle className="h-8 w-8 text-white/20" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/60">Recovery Score</p>
                  <p className="mt-2 text-2xl font-light text-white">{keyMetrics.recoveryScore}/10</p>
                  <p className="mt-1 text-xs text-success">+0.4 from last month</p>
                </div>
                <Brain className="h-8 w-8 text-white/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recovery Engagement Trends */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Recovery Engagement Metrics</h3>
              <p className="text-sm text-white/60">Daily check-ins, journal entries, and craving levels</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={recoveryEngagementData}>
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
                  <Bar yAxisId="left" dataKey="checkins" fill="#8B5CF6" opacity={0.8} name="Check-ins" />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="journalEntries"
                    stroke="#22C55E"
                    strokeWidth={2}
                    name="Journal Entries"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cravingScores"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Avg Craving (1-10)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recovery Journey Funnel */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Recovery Journey Milestones</h3>
              <p className="text-sm text-white/60">User progression through key milestones</p>
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
                    data={recoveryFunnelData}
                    isAnimationActive
                  >
                    <LabelList position="center" fill="#fff" />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Sobriety Cohort Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <h3 className="text-lg font-medium text-white">Sobriety Retention by Starting Point</h3>
            <p className="text-sm text-white/60">Long-term retention based on initial sobriety days</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-3 text-left text-sm font-medium text-white/60">Starting Cohort</th>
                    <th className="p-3 text-center text-sm font-medium text-white/60">Day 7</th>
                    <th className="p-3 text-center text-sm font-medium text-white/60">Day 30</th>
                    <th className="p-3 text-center text-sm font-medium text-white/60">Day 60</th>
                    <th className="p-3 text-center text-sm font-medium text-white/60">Day 90</th>
                    <th className="p-3 text-center text-sm font-medium text-white/60">Day 180</th>
                    <th className="p-3 text-center text-sm font-medium text-white/60">1 Year</th>
                  </tr>
                </thead>
                <tbody>
                  {sobrietyCohortData.map((cohort) => (
                    <tr key={cohort.cohort} className="border-b border-white/5">
                      <td className="p-3 text-sm text-white">{cohort.cohort}</td>
                      <td className="p-3 text-center">
                        <div
                          className="inline-flex h-8 w-16 items-center justify-center rounded text-sm text-white"
                          style={{
                            backgroundColor: `rgba(192, 132, 252, ${cohort.day7 / 100})`,
                          }}
                        >
                          {cohort.day7}%
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div
                          className="inline-flex h-8 w-16 items-center justify-center rounded text-sm text-white"
                          style={{
                            backgroundColor: `rgba(192, 132, 252, ${cohort.day30 / 100})`,
                          }}
                        >
                          {cohort.day30}%
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div
                          className="inline-flex h-8 w-16 items-center justify-center rounded text-sm text-white"
                          style={{
                            backgroundColor: `rgba(192, 132, 252, ${cohort.day60 / 100})`,
                          }}
                        >
                          {cohort.day60}%
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div
                          className="inline-flex h-8 w-16 items-center justify-center rounded text-sm text-white"
                          style={{
                            backgroundColor: `rgba(192, 132, 252, ${cohort.day90 / 100})`,
                          }}
                        >
                          {cohort.day90}%
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div
                          className="inline-flex h-8 w-16 items-center justify-center rounded text-sm text-white"
                          style={{
                            backgroundColor: `rgba(192, 132, 252, ${cohort.day180 / 100})`,
                          }}
                        >
                          {cohort.day180}%
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div
                          className="inline-flex h-8 w-16 items-center justify-center rounded text-sm text-white"
                          style={{
                            backgroundColor: `rgba(192, 132, 252, ${cohort.day365 / 100})`,
                          }}
                        >
                          {cohort.day365}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Trigger Patterns & Recovery Tools */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Trigger Patterns by Time</h3>
              <p className="text-sm text-white/60">When users report different trigger types</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={triggerPatternsData}>
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
                    dataKey="stress"
                    stackId="1"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="craving"
                    stackId="1"
                    stroke="#F59E0B"
                    fill="#F59E0B"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="social"
                    stackId="1"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="environmental"
                    stackId="1"
                    stroke="#22C55E"
                    fill="#22C55E"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Recovery Tools Effectiveness</h3>
              <p className="text-sm text-white/60">Adoption rate vs reported effectiveness</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={recoveryToolsUsage} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.5)" />
                  <YAxis type="category" dataKey="tool" stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="adoption" fill="#C084FC" radius={[0, 4, 4, 0]} opacity={0.8} name="Adoption %" />
                  <Bar dataKey="effectiveness" fill="#22C55E" radius={[0, 4, 4, 0]} opacity={0.8} name="Effectiveness %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Substance Breakdown */}
        <Card className="mt-8">
          <CardHeader>
            <h3 className="text-lg font-medium text-white">User Distribution by Primary Substance</h3>
            <p className="text-sm text-white/60">Understanding our community's recovery needs</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {substanceBreakdown.map((item) => (
                <div key={item.substance} className="rounded-lg bg-white/[0.03] p-4">
                  <p className="text-sm font-medium text-white">{item.substance}</p>
                  <p className="mt-2 text-2xl font-light text-white">{item.percentage}%</p>
                  <p className="mt-1 text-xs text-white/60">{item.users.toLocaleString()} users</p>
                  <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 