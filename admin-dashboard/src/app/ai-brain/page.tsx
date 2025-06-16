"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Zap,
  ArrowRight,
  Play,
  Pause,
  RefreshCw,
  Shield,
  Gauge,
  Timer,
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
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import { useState, useEffect } from "react";

// Mock real-time insights that would come from Firebase, RevenueCat, AppsFlyer
const aiInsights = [
  {
    id: 1,
    priority: "high",
    source: "AppsFlyer",
    insight: "TikTok campaigns showing 3x better CAC than Facebook",
    recommendation: "Shift $500/day from Facebook to TikTok immediately",
    impact: "+$45K monthly revenue",
    confidence: 94,
    status: "pending",
  },
  {
    id: 2,
    priority: "critical",
    source: "RevenueCat",
    insight: "Trial-to-paid conversion dropping on weekends (12% vs 18%)",
    recommendation: "Launch weekend-specific offer: 'Friday Freedom' 20% off",
    impact: "+$12K monthly revenue",
    confidence: 87,
    status: "pending",
  },
  {
    id: 3,
    priority: "medium",
    source: "Firebase",
    insight: "Users who complete onboarding in <5 min have 2.3x higher LTV",
    recommendation: "Simplify step 3 of onboarding (remove optional fields)",
    impact: "+15% retention",
    confidence: 92,
    status: "applied",
  },
  {
    id: 4,
    priority: "high",
    source: "AppsFlyer",
    insight: "Reddit organic traffic converting at 4.2x average",
    recommendation: "Create weekly 'Success Story Saturday' posts on r/stopsmoking",
    impact: "+200 organic installs/month",
    confidence: 78,
    status: "pending",
  },
];

// Real-time campaign performance
const campaignPerformance = [
  { hour: "12am", facebook: 12, tiktok: 28, google: 8, reddit: 15 },
  { hour: "4am", facebook: 8, tiktok: 22, google: 5, reddit: 12 },
  { hour: "8am", facebook: 45, tiktok: 85, google: 32, reddit: 42 },
  { hour: "12pm", facebook: 68, tiktok: 120, google: 55, reddit: 78 },
  { hour: "4pm", facebook: 52, tiktok: 95, google: 48, reddit: 65 },
  { hour: "8pm", facebook: 78, tiktok: 145, google: 62, reddit: 88 },
  { hour: "Now", facebook: 82, tiktok: 162, google: 72, reddit: 95 },
];

// User quality scores by source
const userQualityScores = [
  { source: "TikTok", score: 85, avgLTV: 142, color: "#C084FC" },
  { source: "Reddit", score: 78, avgLTV: 128, color: "#8B5CF6" },
  { source: "Google", score: 65, avgLTV: 95, color: "#6D28D9" },
  { source: "Facebook", score: 52, avgLTV: 72, color: "#5B21B6" },
];

// Predictive metrics
const predictions = {
  nextWeek: {
    installs: 1245,
    trials: 498,
    conversions: 89,
    revenue: 42300,
    confidence: 88,
  },
  optimalBudget: {
    tiktok: 1500,
    reddit: 800,
    google: 500,
    facebook: 200,
    total: 3000,
  },
};

// Real-time alerts
const alerts = [
  {
    type: "success",
    message: "TikTok creative 'Quit Journey' CTR up 230%",
    action: "Scale budget",
    time: "2 min ago",
  },
  {
    type: "warning",
    message: "Facebook iOS 17.2 users showing 15% higher churn",
    action: "Investigate",
    time: "8 min ago",
  },
  {
    type: "critical",
    message: "Payment failures spike detected (3% → 8%)",
    action: "Check Stripe",
    time: "15 min ago",
  },
];

// AI Brain metrics
const brainMetrics = {
  decisionsToday: 42,
  revenueImpact: 8500,
  timeSaved: 14.5,
  accuracy: 91,
};

export default function AIBrainPage() {
  const [autoMode, setAutoMode] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-light text-white">AI Marketing Brain</h1>
              <p className="mt-1 text-white/60">
                Real-time insights from Firebase, RevenueCat & AppsFlyer
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={autoMode ? "primary" : "secondary"}
              size="sm"
              onClick={() => setAutoMode(!autoMode)}
            >
              {autoMode ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Auto Mode ON
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Auto Mode OFF
                </>
              )}
            </Button>
            <Button variant="secondary" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              {lastRefresh.toLocaleTimeString()}
            </Button>
          </div>
        </div>

        {/* AI Brain Status */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/60">Decisions Today</p>
                  <p className="mt-2 text-2xl font-light text-white">{brainMetrics.decisionsToday}</p>
                  <p className="mt-1 text-xs text-white/40">14 automated</p>
                </div>
                <Zap className="h-8 w-8 text-primary/40" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/60">Revenue Impact</p>
                  <p className="mt-2 text-2xl font-light text-white">+${brainMetrics.revenueImpact}</p>
                  <p className="mt-1 text-xs text-success">Today's optimization</p>
                </div>
                <DollarSign className="h-8 w-8 text-success/40" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/60">Time Saved</p>
                  <p className="mt-2 text-2xl font-light text-white">{brainMetrics.timeSaved}h</p>
                  <p className="mt-1 text-xs text-white/40">vs manual analysis</p>
                </div>
                <Timer className="h-8 w-8 text-white/20" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/60">Accuracy</p>
                  <p className="mt-2 text-2xl font-light text-white">{brainMetrics.accuracy}%</p>
                  <p className="mt-1 text-xs text-white/40">Last 30 days</p>
                </div>
                <Gauge className="h-8 w-8 text-white/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Critical Insights & Recommendations */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">AI Insights & Recommendations</h3>
                <p className="text-sm text-white/60">Actionable insights from your marketing data</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40">Auto-apply threshold:</span>
                <span className="text-sm text-primary">90% confidence</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiInsights.map((insight) => (
              <div
                key={insight.id}
                className={`rounded-lg border p-4 ${
                  insight.priority === "critical"
                    ? "border-destructive/50 bg-destructive/5"
                    : insight.priority === "high"
                    ? "border-warning/50 bg-warning/5"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Lightbulb
                        className={`h-5 w-5 ${
                          insight.priority === "critical"
                            ? "text-destructive"
                            : insight.priority === "high"
                            ? "text-warning"
                            : "text-primary"
                        }`}
                      />
                      <span className="text-sm font-medium text-white">{insight.insight}</span>
                      <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-white/60">
                        {insight.source}
                      </span>
                    </div>
                    <div className="ml-8 mt-2">
                      <p className="text-sm text-white/80">
                        <span className="text-white/60">Recommendation:</span> {insight.recommendation}
                      </p>
                      <div className="mt-2 flex items-center gap-4">
                        <span className="text-xs text-white/60">
                          Impact: <span className="text-success">{insight.impact}</span>
                        </span>
                        <span className="text-xs text-white/60">
                          Confidence: <span className="text-white">{insight.confidence}%</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    {insight.status === "pending" ? (
                      <>
                        <Button variant="secondary" size="sm">
                          Reject
                        </Button>
                        <Button variant="primary" size="sm">
                          Apply
                        </Button>
                      </>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-success">
                        <CheckCircle className="h-4 w-4" />
                        Applied
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Real-time Campaign Performance */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Live Campaign Performance</h3>
              <p className="text-sm text-white/60">Conversions by channel (last 24h)</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={campaignPerformance}>
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
                  <Area
                    type="monotone"
                    dataKey="tiktok"
                    stackId="1"
                    stroke="#C084FC"
                    fill="#C084FC"
                    fillOpacity={0.8}
                  />
                  <Area
                    type="monotone"
                    dataKey="reddit"
                    stackId="1"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="google"
                    stackId="1"
                    stroke="#6D28D9"
                    fill="#6D28D9"
                    fillOpacity={0.4}
                  />
                  <Area
                    type="monotone"
                    dataKey="facebook"
                    stackId="1"
                    stroke="#5B21B6"
                    fill="#5B21B6"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                <div className="text-center">
                  <p className="text-xs text-white/60">Best Performer</p>
                  <p className="text-sm font-medium text-primary">TikTok</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-white/60">Worst CAC</p>
                  <p className="text-sm font-medium text-destructive">Facebook</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-white/60">Rising Star</p>
                  <p className="text-sm font-medium text-success">Reddit</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Quality Scores */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">User Quality by Source</h3>
              <p className="text-sm text-white/60">LTV prediction by acquisition channel</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="20%"
                  outerRadius="90%"
                  data={userQualityScores}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                  />
                  <RadialBar
                    dataKey="score"
                    cornerRadius={10}
                    fill="#8884d8"
                    animationDuration={1000}
                  >
                    {userQualityScores.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </RadialBar>
                  <Tooltip />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {userQualityScores.map((source) => (
                  <div key={source.source} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: source.color }}
                      />
                      <span className="text-sm text-white/80">{source.source}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-white/60">
                        Score: <span className="text-white">{source.score}</span>
                      </span>
                      <span className="text-sm text-white/60">
                        LTV: <span className="text-success">${source.avgLTV}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Predictions & Budget Allocation */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Next Week Predictions</h3>
              <p className="text-sm text-white/60">ML-based forecast with {predictions.nextWeek.confidence}% confidence</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                <div className="rounded-lg bg-white/[0.03] p-4">
                  <p className="text-sm text-white/60">Installs</p>
                  <p className="mt-1 text-2xl font-light text-white">{predictions.nextWeek.installs.toLocaleString()}</p>
                  <p className="mt-1 text-xs text-success">+18% vs last week</p>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-4">
                  <p className="text-sm text-white/60">Trials</p>
                  <p className="mt-1 text-2xl font-light text-white">{predictions.nextWeek.trials}</p>
                  <p className="mt-1 text-xs text-success">+22% vs last week</p>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-4">
                  <p className="text-sm text-white/60">Conversions</p>
                  <p className="mt-1 text-2xl font-light text-white">{predictions.nextWeek.conversions}</p>
                  <p className="mt-1 text-xs text-warning">+5% vs last week</p>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-4">
                  <p className="text-sm text-white/60">Revenue</p>
                  <p className="mt-1 text-2xl font-light text-white">${(predictions.nextWeek.revenue / 1000).toFixed(1)}K</p>
                  <p className="mt-1 text-xs text-success">+15% vs last week</p>
                </div>
              </div>
              
              <div className="mt-6 rounded-lg bg-primary/10 p-4">
                <p className="text-sm font-medium text-white">Recommended Budget Allocation</p>
                <div className="mt-3 space-y-2">
                  {Object.entries(predictions.optimalBudget).filter(([key]) => key !== 'total').map(([channel, budget]) => (
                    <div key={channel} className="flex items-center justify-between">
                      <span className="text-sm capitalize text-white/80">{channel}</span>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-32 rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${(budget / predictions.optimalBudget.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-white">${budget}/day</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real-time Alerts */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Live Alerts</h3>
              <p className="text-sm text-white/60">Requires your attention</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-3 ${
                    alert.type === "critical"
                      ? "bg-destructive/10"
                      : alert.type === "warning"
                      ? "bg-warning/10"
                      : "bg-success/10"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      {alert.type === "critical" ? (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      ) : alert.type === "warning" ? (
                        <AlertTriangle className="h-4 w-4 text-warning" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-success" />
                      )}
                      <div>
                        <p className="text-sm text-white">{alert.message}</p>
                        <p className="mt-1 text-xs text-white/60">{alert.time}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      {alert.action}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 