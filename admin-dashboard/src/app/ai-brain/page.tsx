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
  CheckCircle,
  Sparkles,
  Clock,
  Bot,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  BarChart3
} from "lucide-react";

// Simple chart component using CSS
const SimpleLineChart = ({ data, height = 200 }: { data: number[], height?: number }) => {
  const max = Math.max(...data);
  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * 100,
    y: ((max - value) / max) * height
  }));

  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  return (
    <div className="relative w-full" style={{ height }}>
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(192, 132, 252)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(192, 132, 252)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={pathData}
          fill="none"
          stroke="rgb(192, 132, 252)"
          strokeWidth="2"
        />
        <path
          d={`${pathData} L 100 ${height} L 0 ${height} Z`}
          fill="url(#gradient)"
          opacity="0.5"
        />
      </svg>
    </div>
  );
};

// Progress bar component
const ProgressBar = ({ value, label, color = "primary" }: { value: number, label: string, color?: string }) => {
  const colorClasses = {
    primary: "bg-primary",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500"
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-white/60">{label}</span>
        <span className="text-white">{value}%</span>
      </div>
      <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClasses[color as keyof typeof colorClasses]} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

export default function AIBrainPageEnhanced() {
  const [activeView, setActiveView] = useState<'overview' | 'predictions' | 'interventions' | 'learning'>('overview');
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [aiMetrics, setAiMetrics] = useState({
    accuracy: 92.4,
    responseTime: 124,
    activeInterventions: 47,
    usersAtRisk: 128,
    revenueImpact: 45780,
    preventedRelapses: 312
  });

  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // Simulate real-time updates
      setAiMetrics(prev => ({
        ...prev,
        accuracy: Math.min(100, prev.accuracy + (Math.random() - 0.5) * 2),
        responseTime: Math.max(50, prev.responseTime + (Math.random() - 0.5) * 10),
        activeInterventions: Math.max(0, prev.activeInterventions + Math.floor((Math.random() - 0.5) * 5)),
        usersAtRisk: Math.max(0, prev.usersAtRisk + Math.floor((Math.random() - 0.5) * 10))
      }));
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
          title="AI Brain - Advanced Real-Time Monitoring"
          subtitle={`Last updated: ${lastUpdate.toLocaleTimeString()} • Neural Network v2.4`}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="AI Response Time"
                value={`${aiMetrics.responseTime}ms`}
                subtitle="Avg last hour"
                icon={Zap}
                trend={{ value: 15, isPositive: true }}
              />
              <MetricCard
                title="Active Interventions"
                value={aiMetrics.activeInterventions}
                subtitle="Currently running"
                icon={Shield}
                trend={{ value: 8, isPositive: true }}
              />
              <MetricCard
                title="Success Rate"
                value={`${aiMetrics.accuracy.toFixed(1)}%`}
                subtitle="Last 24h"
                icon={CheckCircle}
                trend={{ value: 3.2, isPositive: true }}
              />
              <MetricCard
                title="Users at Risk"
                value={aiMetrics.usersAtRisk}
                subtitle="Needs attention"
                icon={AlertCircle}
                trend={{ value: 12, isPositive: false }}
              />
            </div>

            {/* Advanced Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white/60">Revenue Impact</h3>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-2xl font-light text-white">${(aiMetrics.revenueImpact).toLocaleString()}</p>
                <p className="text-xs text-green-500 mt-2">+23% from AI optimizations</p>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white/60">Prevented Relapses</h3>
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <p className="text-2xl font-light text-white">{aiMetrics.preventedRelapses}</p>
                <p className="text-xs text-primary mt-2">This month</p>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white/60">Learning Rate</h3>
                  <Brain className="h-4 w-4 text-purple-500" />
                </div>
                <p className="text-2xl font-light text-white">0.0025</p>
                <p className="text-xs text-purple-500 mt-2">Adaptive optimization</p>
              </Card>
            </div>

            {/* AI Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Live Activity Feed */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">Live AI Activity Stream</h3>
                      <p className="text-sm text-white/60 mt-1">Real-time decisions and actions</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary animate-pulse" />
                      <StatusBadge status="Processing" variant="warning" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        time: '2 seconds ago',
                        action: 'Critical Intervention Triggered',
                        detail: 'User #4821 showing 89% relapse risk - personalized support activated',
                        type: 'intervention',
                        status: 'active',
                        icon: AlertTriangle,
                        color: 'text-yellow-500'
                      },
                      {
                        time: '15 seconds ago',
                        action: 'Smart Budget Reallocation',
                        detail: 'Moved $500 from Facebook to TikTok - 3.2x better ROI detected',
                        type: 'optimization',
                        status: 'completed',
                        icon: TrendingUp,
                        color: 'text-green-500'
                      },
                      {
                        time: '45 seconds ago',
                        action: 'A/B Test Concluded',
                        detail: 'Purple CTA button wins with 23% higher conversion rate',
                        type: 'learning',
                        status: 'completed',
                        icon: Lightbulb,
                        color: 'text-purple-500'
                      },
                      {
                        time: '1 minute ago',
                        action: 'Pattern Recognition',
                        detail: 'New addiction trigger identified: Sunday evening social media usage',
                        type: 'discovery',
                        status: 'completed',
                        icon: Brain,
                        color: 'text-blue-500'
                      }
                    ].map((activity, index) => {
                      const Icon = activity.icon;
                      return (
                        <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-white/[0.03] hover:bg-white/[0.05] transition-all duration-300 border border-white/[0.06] hover:border-white/[0.1]">
                          <div className="mt-1">
                            <Icon className={`h-5 w-5 ${activity.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-white">{activity.action}</p>
                              <span className="text-xs text-white/40">{activity.time}</span>
                            </div>
                            <p className="text-sm text-white/60 mt-1">{activity.detail}</p>
                          </div>
                          <div className={`mt-1 w-2 h-2 rounded-full ${
                            activity.status === 'active' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
                          }`} />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Neural Network Performance */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">Neural Network Performance</h3>
                      <p className="text-sm text-white/60 mt-1">Real-time accuracy metrics</p>
                    </div>
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <SimpleLineChart 
                      data={[88, 90, 89, 92, 94, 93, 95, 94, 96, 95, 97, 96]} 
                      height={150} 
                    />
                    <p className="text-xs text-white/40 mt-2 text-center">Accuracy over last 12 hours</p>
                  </div>
                  
                  <div className="space-y-4">
                    <ProgressBar value={94} label="Prediction Accuracy" color="success" />
                    <ProgressBar value={87} label="Intervention Success" color="primary" />
                    <ProgressBar value={76} label="Resource Utilization" color="warning" />
                    <ProgressBar value={92} label="Model Confidence" color="success" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">AI-Generated Insights</h3>
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      title: "High-Risk Time Window",
                      insight: "87% of relapses occur between 8-10 PM on weekends",
                      action: "Increase intervention frequency during these hours",
                      confidence: 94
                    },
                    {
                      title: "Buddy System Impact",
                      insight: "Users with active buddies are 3.2x more likely to succeed",
                      action: "Prioritize buddy matching for new users",
                      confidence: 91
                    },
                    {
                      title: "Content Optimization",
                      insight: "Personal stories generate 5x more engagement than tips",
                      action: "Shift content strategy to user testimonials",
                      confidence: 88
                    },
                    {
                      title: "Pricing Sweet Spot",
                      insight: "$14.99/month has optimal conversion vs retention",
                      action: "Test price point with 10% of new users",
                      confidence: 82
                    }
                  ].map((item, index) => (
                    <div key={index} className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                      <h4 className="text-sm font-medium text-white mb-2">{item.title}</h4>
                      <p className="text-sm text-white/60 mb-3">{item.insight}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-primary">{item.action}</p>
                        <span className="text-xs text-white/40">{item.confidence}% confidence</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeView === 'predictions' && (
          <div className="space-y-6">
            {/* Predictive Analytics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                title="30-Day Revenue Forecast"
                value="$478K"
                subtitle="Based on current trends"
                icon={DollarSign}
                trend={{ value: 18, isPositive: true }}
              />
              <MetricCard
                title="User Churn Risk"
                value="234"
                subtitle="Likely to cancel this week"
                icon={AlertTriangle}
                trend={{ value: 8, isPositive: false }}
              />
              <MetricCard
                title="Growth Opportunity"
                value="1.2K"
                subtitle="Potential conversions"
                icon={TrendingUp}
                trend={{ value: 24, isPositive: true }}
              />
            </div>

            {/* Risk Analysis */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-white">User Risk Analysis</h3>
                <p className="text-sm text-white/60 mt-1">AI-powered relapse risk predictions</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { user: "User #4821", risk: 89, days: 3, factors: ["Weekend pattern", "Reduced app usage", "Missed check-ins"] },
                    { user: "User #3967", risk: 76, days: 7, factors: ["Stress indicators", "Social triggers", "Late night activity"] },
                    { user: "User #2145", risk: 68, days: 14, factors: ["Milestone approaching", "Historical pattern"] },
                    { user: "User #5632", risk: 54, days: 21, factors: ["Irregular schedule", "New environment"] }
                  ].map((item, index) => (
                    <div key={index} className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-medium text-white">{item.user}</p>
                          <p className="text-xs text-white/60">{item.days} days clean</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-medium ${
                            item.risk > 80 ? 'text-red-500' : item.risk > 60 ? 'text-yellow-500' : 'text-green-500'
                          }`}>{item.risk}%</p>
                          <p className="text-xs text-white/40">risk score</p>
                        </div>
                      </div>
                      <ProgressBar value={item.risk} label="" color={item.risk > 80 ? 'danger' : item.risk > 60 ? 'warning' : 'success'} />
                      <div className="flex flex-wrap gap-2 mt-3">
                        {item.factors.map((factor, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded-full bg-white/[0.06] text-white/60">
                            {factor}
                          </span>
                        ))}
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
            {/* Active Interventions Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricCard
                title="Active Interventions"
                value={aiMetrics.activeInterventions}
                subtitle="Currently running"
                icon={Shield}
                trend={{ value: 12, isPositive: true }}
              />
              <MetricCard
                title="Success Rate"
                value="87%"
                subtitle="Last 7 days"
                icon={CheckCircle}
                trend={{ value: 5, isPositive: true }}
              />
              <MetricCard
                title="Avg Response Time"
                value="2.3s"
                subtitle="To trigger"
                icon={Clock}
                trend={{ value: 18, isPositive: true }}
              />
              <MetricCard
                title="Lives Saved"
                value="42"
                subtitle="This month"
                icon={Activity}
                trend={{ value: 33, isPositive: true }}
              />
            </div>

            {/* Intervention Types */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-white">Intervention Performance</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { type: "Crisis Support Message", count: 156, success: 92, trend: "up" },
                    { type: "Buddy Alert", count: 89, success: 88, trend: "up" },
                    { type: "Motivational Push", count: 234, success: 76, trend: "stable" },
                    { type: "Check-in Reminder", count: 412, success: 84, trend: "up" },
                    { type: "Resource Recommendation", count: 178, success: 79, trend: "down" }
                  ].map((intervention, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03]">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{intervention.type}</p>
                        <p className="text-xs text-white/60 mt-1">{intervention.count} triggered</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">{intervention.success}%</p>
                          <p className="text-xs text-white/40">success</p>
                        </div>
                        {intervention.trend === 'up' ? (
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        ) : intervention.trend === 'down' ? (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        ) : (
                          <Activity className="h-4 w-4 text-white/40" />
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-white">Recent Interventions</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        time: "5 min ago",
                        user: "User #2847",
                        type: "Crisis Support",
                        result: "Engaged - crisis averted",
                        status: "success"
                      },
                      {
                        time: "12 min ago",
                        user: "User #3291",
                        type: "Buddy Alert",
                        result: "Buddy connected within 3 min",
                        status: "success"
                      },
                      {
                        time: "28 min ago",
                        user: "User #1876",
                        type: "Check-in",
                        result: "No response - escalating",
                        status: "warning"
                      },
                      {
                        time: "45 min ago",
                        user: "User #4102",
                        type: "Motivation",
                        result: "User re-engaged with app",
                        status: "success"
                      }
                    ].map((item, index) => (
                      <div key={index} className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-white/40">{item.time}</span>
                          <StatusBadge 
                            status={item.status === 'success' ? 'Active' : 'Warning'} 
                            variant={item.status === 'success' ? 'success' : 'warning'} 
                          />
                        </div>
                        <p className="text-sm font-medium text-white">{item.user} - {item.type}</p>
                        <p className="text-xs text-white/60 mt-1">{item.result}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeView === 'learning' && (
          <div className="space-y-6">
            {/* Model Learning Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white/60">Training Cycles</h3>
                  <Brain className="h-4 w-4 text-purple-500" />
                </div>
                <p className="text-2xl font-light text-white">24,531</p>
                <p className="text-xs text-purple-500 mt-2">+128 today</p>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white/60">Patterns Learned</h3>
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                </div>
                <p className="text-2xl font-light text-white">1,847</p>
                <p className="text-xs text-yellow-500 mt-2">+23 new patterns</p>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white/60">Model Version</h3>
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <p className="text-2xl font-light text-white">v2.4.7</p>
                <p className="text-xs text-primary mt-2">Deployed 3 hours ago</p>
              </Card>
            </div>

            {/* Learning Insights */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-white">Recent Learning Discoveries</h3>
                <p className="text-sm text-white/60 mt-1">New patterns and optimizations</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "Social Media Trigger Pattern",
                      description: "Identified correlation between Instagram usage after 10 PM and next-day cravings",
                      impact: "Affects 34% of users",
                      date: "2 hours ago",
                      confidence: 91
                    },
                    {
                      title: "Buddy Success Formula",
                      description: "Users with similar quit dates (±3 days) have 2.8x higher success rate",
                      impact: "Improved matching algorithm",
                      date: "5 hours ago",
                      confidence: 88
                    },
                    {
                      title: "Motivational Message Timing",
                      description: "Messages sent 30 min after wake time have 45% higher engagement",
                      impact: "Updating notification system",
                      date: "1 day ago",
                      confidence: 94
                    },
                    {
                      title: "Relapse Prevention Window",
                      description: "Days 3-5 and 28-30 are critical - 67% of relapses occur here",
                      impact: "Enhanced monitoring periods",
                      date: "2 days ago",
                      confidence: 97
                    }
                  ].map((discovery, index) => (
                    <div key={index} className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-white">{discovery.title}</h4>
                        <span className="text-xs text-white/40">{discovery.date}</span>
                      </div>
                      <p className="text-sm text-white/60 mb-2">{discovery.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-primary">{discovery.impact}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 bg-white/[0.06] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-500"
                              style={{ width: `${discovery.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs text-white/40">{discovery.confidence}%</span>
                        </div>
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