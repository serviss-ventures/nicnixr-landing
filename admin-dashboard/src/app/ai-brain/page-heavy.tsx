"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader, StatusBadge, TabNavigation } from "@/components";
import {
  Brain,
  TrendingUp,
  AlertCircle,
  Users,
  DollarSign,
  Activity,
  Target,
  Zap,
  Shield,
  RefreshCw,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  RadialBarChart,
  RadialBar,
} from "recharts";

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
  const [activeView, setActiveView] = useState<'overview' | 'predictions' | 'interventions' | 'learning'>('overview');
  const [timeRange, setTimeRange] = useState('24h');
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Real-time data refresh
  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // In production, this would fetch real data
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Brain },
    { id: 'predictions', label: 'Predictions', icon: Sparkles },
    { id: 'interventions', label: 'Interventions', icon: Shield },
    { id: 'learning', label: 'Learning', icon: Target },
  ];

  const headerActions = (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10">
        <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        <span className="text-sm text-white/60">{isLive ? 'Live' : 'Paused'}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsLive(!isLive)}
      >
        {isLive ? 'Pause' : 'Resume'}
      </Button>
      <Button variant="primary" size="sm">
        <RefreshCw className="mr-2 h-4 w-4" />
        Force Analysis
      </Button>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        <PageHeader
          title="AI Brain - Real-Time Monitoring"
          subtitle={`Last updated: ${lastUpdate.toLocaleTimeString()}`}
          actions={headerActions}
        />

        <TabNavigation
          tabs={tabs}
          activeTab={activeView}
          onTabChange={(tab) => setActiveView(tab as any)}
          className="mb-6"
        />

        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* Real-Time System Health */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricCard
                title="AI Response Time"
                value="124ms"
                change="-15%"
                trend="up"
                subtitle="Avg last hour"
                icon={<Zap className="h-5 w-5" />}
              />
              <MetricCard
                title="Active Interventions"
                value="47"
                change="+8"
                trend="up"
                subtitle="Currently running"
                icon={<Shield className="h-5 w-5" />}
              />
              <MetricCard
                title="Success Rate"
                value="92.4%"
                change="+3.2%"
                trend="up"
                subtitle="Last 24h"
                icon={<CheckCircle className="h-5 w-5" />}
              />
              <MetricCard
                title="Users at Risk"
                value="128"
                change="-12"
                trend="down"
                subtitle="Needs attention"
                icon={<AlertCircle className="h-5 w-5" />}
              />
            </div>

            {/* Live Activity Feed */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Live AI Activity</h3>
                    <p className="text-sm text-white/60 mt-1">Real-time decisions and actions</p>
                  </div>
                  <StatusBadge status="Processing" variant="warning" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      time: '2 seconds ago',
                      action: 'Triggered intervention',
                      detail: 'User showing high relapse risk patterns',
                      type: 'intervention',
                      status: 'active'
                    },
                    {
                      time: '15 seconds ago',
                      action: 'Budget reallocation',
                      detail: 'Moved $500 from Facebook to TikTok ads',
                      type: 'optimization',
                      status: 'completed'
                    },
                    {
                      time: '45 seconds ago',
                      action: 'A/B test winner',
                      detail: 'Purple CTA button outperforming blue by 23%',
                      type: 'learning',
                      status: 'completed'
                    },
                    {
                      time: '1 minute ago',
                      action: 'Buddy match created',
                      detail: 'Found optimal support partner based on recovery patterns',
                      type: 'matching',
                      status: 'completed'
                    },
                    {
                      time: '2 minutes ago',
                      action: 'Content personalization',
                      detail: 'Adjusted daily tips for 1,247 users',
                      type: 'personalization',
                      status: 'completed'
                    }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-white/[0.03] hover:bg-white/[0.05] transition-colors">
                      <div className={`mt-1 w-2 h-2 rounded-full ${
                        activity.status === 'active' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-white">{activity.action}</p>
                          <span className="text-xs text-white/40">{activity.time}</span>
                        </div>
                        <p className="text-sm text-white/60 mt-1">{activity.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-white">Decision Accuracy</h3>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[
                        { time: '00:00', accuracy: 88 },
                        { time: '04:00', accuracy: 91 },
                        { time: '08:00', accuracy: 89 },
                        { time: '12:00', accuracy: 93 },
                        { time: '16:00', accuracy: 92 },
                        { time: '20:00', accuracy: 94 },
                        { time: 'Now', accuracy: 92.4 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
                        <YAxis stroke="rgba(255,255,255,0.5)" domain={[85, 95]} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0,0,0,0.8)', 
                            border: '1px solid rgba(255,255,255,0.2)' 
                          }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="accuracy" 
                          stroke="#C084FC" 
                          strokeWidth={2}
                          dot={{ fill: '#C084FC' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-white">Resource Allocation</h3>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'User Support', value: 35, color: '#C084FC' },
                            { name: 'Marketing', value: 25, color: '#F472B6' },
                            { name: 'Content', value: 20, color: '#60A5FA' },
                            { name: 'Infrastructure', value: 15, color: '#34D399' },
                            { name: 'R&D', value: 5, color: '#FBBF24' }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={(entry) => `${entry.name}: ${entry.value}%`}
                        >
                          {[
                            { name: 'User Support', value: 35, color: '#C084FC' },
                            { name: 'Marketing', value: 25, color: '#F472B6' },
                            { name: 'Content', value: 20, color: '#60A5FA' },
                            { name: 'Infrastructure', value: 15, color: '#34D399' },
                            { name: 'R&D', value: 5, color: '#FBBF24' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0,0,0,0.8)', 
                            border: '1px solid rgba(255,255,255,0.2)' 
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeView === 'predictions' && (
          <div className="space-y-6">
            {/* Revenue Predictions */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-white">Revenue Projections</h3>
                <p className="text-sm text-white/60 mt-1">AI-powered forecasting based on current trends</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="p-4 rounded-lg bg-white/[0.03]">
                    <p className="text-sm text-white/60">Next 7 Days</p>
                    <p className="text-2xl font-semibold text-white mt-1">$42,500</p>
                    <div className="flex items-center gap-1 mt-2">
                      <ArrowUpRight className="h-4 w-4 text-success" />
                      <span className="text-sm text-success">95% confidence</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-white/[0.03]">
                    <p className="text-sm text-white/60">Next 30 Days</p>
                    <p className="text-2xl font-semibold text-white mt-1">$156,000</p>
                    <div className="flex items-center gap-1 mt-2">
                      <ArrowUpRight className="h-4 w-4 text-success" />
                      <span className="text-sm text-success">87% confidence</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-white/[0.03]">
                    <p className="text-sm text-white/60">Next Quarter</p>
                    <p className="text-2xl font-semibold text-white mt-1">$520,000</p>
                    <div className="flex items-center gap-1 mt-2">
                      <ArrowUpRight className="h-4 w-4 text-warning" />
                      <span className="text-sm text-warning">72% confidence</span>
                    </div>
                  </div>
                </div>

                {/* User Growth Predictions */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { month: 'Jan', actual: 2500, predicted: 2500 },
                      { month: 'Feb', actual: 3200, predicted: 3200 },
                      { month: 'Mar', actual: 4100, predicted: 4100 },
                      { month: 'Apr', actual: 5300, predicted: 5300 },
                      { month: 'May', actual: 6800, predicted: 6800 },
                      { month: 'Jun', actual: null, predicted: 8500 },
                      { month: 'Jul', actual: null, predicted: 10200 },
                      { month: 'Aug', actual: null, predicted: 12100 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                      <YAxis stroke="rgba(255,255,255,0.5)" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(0,0,0,0.8)', 
                          border: '1px solid rgba(255,255,255,0.2)' 
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="actual" 
                        stroke="#C084FC" 
                        fill="#C084FC" 
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="predicted" 
                        stroke="#60A5FA" 
                        fill="#60A5FA" 
                        fillOpacity={0.2}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Risk Predictions */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-white">Risk Analysis</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { risk: 'Churn spike expected', probability: 78, impact: 'high', timeframe: '3-5 days' },
                    { risk: 'Server capacity threshold', probability: 65, impact: 'medium', timeframe: '7-10 days' },
                    { risk: 'Competitor campaign launch', probability: 82, impact: 'medium', timeframe: '1-2 weeks' },
                    { risk: 'Seasonal usage drop', probability: 45, impact: 'low', timeframe: '3-4 weeks' }
                  ].map((risk, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-white/[0.03]">
                      <div>
                        <p className="text-sm font-medium text-white">{risk.risk}</p>
                        <p className="text-xs text-white/60 mt-1">Expected in {risk.timeframe}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">{risk.probability}%</p>
                          <p className="text-xs text-white/60">probability</p>
                        </div>
                        <StatusBadge 
                          status={risk.impact} 
                          variant={risk.impact === 'high' ? 'error' : risk.impact === 'medium' ? 'warning' : 'secondary'}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeView === 'interventions' && (
          <div className="space-y-6">
            {/* Active Interventions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">Active Interventions</h3>
                  <StatusBadge status="47 Active" variant="success" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      user: 'User #2847',
                      intervention: 'Buddy match + Daily check-in',
                      trigger: 'High stress patterns detected',
                      started: '2 hours ago',
                      status: 'In Progress',
                      effectiveness: 78
                    },
                    {
                      user: 'User #3921',
                      intervention: 'Motivational push notification sequence',
                      trigger: 'Engagement drop detected',
                      started: '45 minutes ago',
                      status: 'Active',
                      effectiveness: 65
                    },
                    {
                      user: 'User #1563',
                      intervention: 'Premium trial offer',
                      trigger: 'High value user at churn risk',
                      started: '1 hour ago',
                      status: 'Monitoring',
                      effectiveness: 82
                    }
                  ].map((intervention, index) => (
                    <div key={index} className="p-4 rounded-lg bg-white/[0.03] hover:bg-white/[0.05] transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">{intervention.user}</p>
                          <p className="text-sm text-white/80 mt-1">{intervention.intervention}</p>
                          <p className="text-xs text-white/60 mt-2">Trigger: {intervention.trigger}</p>
                        </div>
                        <div className="text-right">
                          <StatusBadge status={intervention.status} variant="warning" />
                          <p className="text-xs text-white/60 mt-2">{intervention.started}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                          <span>Effectiveness</span>
                          <span>{intervention.effectiveness}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            style={{ width: `${intervention.effectiveness}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeView === 'learning' && (
          <div className="space-y-6">
            {/* AI Learning Progress */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-white">Model Performance</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { model: 'User Behavior Prediction', accuracy: 91.2, improvement: '+2.3%' },
                    { model: 'Relapse Risk Detection', accuracy: 88.7, improvement: '+4.1%' },
                    { model: 'Buddy Matching Algorithm', accuracy: 86.3, improvement: '+1.8%' },
                    { model: 'Content Personalization', accuracy: 93.5, improvement: '+3.2%' }
                  ].map((model, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white">{model.model}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white/80">{model.accuracy}%</span>
                          <span className="text-xs text-success">{model.improvement}</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: `${model.accuracy}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 