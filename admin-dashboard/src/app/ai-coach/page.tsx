"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { DataStatusIndicator } from "@/components/ui/DataStatusIndicator";
import {
  Bot,
  MessageSquare,
  Clock,
  ThumbsUp,
  AlertTriangle,
  Settings,
  BarChart3,
  Play,
  Heart,
  Shield,
  Brain,
  Users,
  RefreshCw,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface AICoachData {
  metrics: {
    totalSessions: number;
    totalMessages: number;
    uniqueUsers: number;
    crisisInterventions: number;
    successfulInterventions: number;
    satisfactionRate: number;
    avgResponseTime: number;
    livesImpacted: number;
  };
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
    crisis: number;
  };
  topicsFrequency: Record<string, number>;
  conversations: Array<{
    id: string;
    user: string;
    daysClean: number;
    lastMessage: string;
    time: string;
    sentiment: string;
    responseTime: string;
    topic: string;
    riskLevel: string;
  }>;
  chartData: {
    sessionTrend: Array<{ date: string; sessions: number }>;
    sentimentTrend: Array<{ date: string; positive: number; negative: number; neutral: number; crisis: number }>;
  };
}

// Default data for initial render
const defaultData: AICoachData = {
  metrics: {
    totalSessions: 0,
    totalMessages: 0,
    uniqueUsers: 0,
    crisisInterventions: 0,
    successfulInterventions: 0,
    satisfactionRate: 0,
    avgResponseTime: 0,
    livesImpacted: 0,
  },
  sentimentDistribution: {
    positive: 0,
    negative: 0,
    neutral: 0,
    crisis: 0,
  },
  topicsFrequency: {},
  conversations: [],
  chartData: {
    sessionTrend: [],
    sentimentTrend: [],
  },
};

export default function AICoachPage() {
  const [data, setData] = useState<AICoachData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch(`/api/ai-coach?timeRange=${timeRange}`);
      if (response.ok) {
        const newData = await response.json();
        setData(newData);
      }
    } catch (error) {
      console.error('Error fetching AI coach data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const COLORS = ['#10B981', '#EF4444', '#6B7280', '#F59E0B'];

  // Transform topics data for display
  const topicsData = Object.entries(data.topicsFrequency)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-light text-white">AI Recovery Coach</h1>
              <p className="mt-2 text-white/60">
                Monitor and optimize AI-powered recovery support
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="rounded-lg bg-white/[0.06] border border-white/[0.08] px-4 py-2 text-sm text-white"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <button
                onClick={fetchData}
                disabled={isRefreshing}
                className="rounded-lg bg-white/[0.06] border border-white/[0.08] p-2 hover:bg-white/[0.08] disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 text-white/60 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          <DataStatusIndicator status="ready" />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Support Sessions"
            value={data.metrics.totalSessions.toLocaleString()}
            subtitle={`${timeRange === '24h' ? 'Today' : `Last ${timeRange}`}`}
            icon={MessageSquare}
            trend={{ value: 23.5, isPositive: true }}
          />
          <MetricCard
            title="Crisis Interventions"
            value={data.metrics.crisisInterventions.toLocaleString()}
            subtitle="Successfully handled"
            icon={Shield}
            trend={{ value: 100, isPositive: true }}
          />
          <MetricCard
            title="User Satisfaction"
            value={`${Math.round(data.metrics.satisfactionRate)}%`}
            subtitle="Average rating"
            icon={Heart}
            trend={{ value: 2.1, isPositive: true }}
          />
          <MetricCard
            title="Lives Impacted"
            value={data.metrics.livesImpacted.toLocaleString()}
            subtitle="Unique users"
            icon={Users}
            trend={{ value: 18.2, isPositive: true }}
          />
        </div>

        {/* Performance Charts */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Session Trend */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Session Activity</h3>
              <p className="text-sm text-white/60">Daily support sessions</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.chartData.sessionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="rgba(255,255,255,0.5)"
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <Line
                    type="monotone"
                    dataKey="sessions"
                    stroke="#C084FC"
                    strokeWidth={2}
                    dot={{ fill: "#C084FC", r: 4 }}
                    name="Sessions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sentiment Distribution */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Sentiment Analysis</h3>
              <p className="text-sm text-white/60">Conversation emotional tone</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Positive', value: data.sentimentDistribution.positive },
                      { name: 'Negative', value: data.sentimentDistribution.negative },
                      { name: 'Neutral', value: data.sentimentDistribution.neutral },
                      { name: 'Crisis', value: data.sentimentDistribution.crisis },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[0, 1, 2, 3].map((index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Topic Analysis */}
        <Card className="mt-6">
          <CardHeader>
            <h3 className="text-lg font-medium text-white">Conversation Topics</h3>
            <p className="text-sm text-white/60">What users are discussing</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topicsData.map((topic) => (
                <div key={topic.topic} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm text-white capitalize">{topic.topic}</span>
                  </div>
                  <span className="text-sm text-white/60">{topic.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Conversations */}
        <Card className="mt-6">
          <CardHeader>
            <h3 className="text-lg font-medium text-white">Recent Support Sessions</h3>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-white/60">Loading conversations...</div>
              </div>
            ) : data.conversations.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-white/60">No conversations yet</div>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.08]">
                {data.conversations.map((conv) => (
                  <div key={conv.id} className="flex items-center justify-between p-6 hover:bg-white/[0.02]">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-medium text-white">{conv.user}</p>
                        <span className="text-xs text-white/60">{conv.daysClean} days clean</span>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs ${
                            conv.sentiment === "positive"
                              ? "bg-success/10 text-success"
                              : conv.sentiment === "negative"
                              ? "bg-warning/10 text-warning"
                              : conv.sentiment === "crisis"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-white/10 text-white/60"
                          }`}
                        >
                          {conv.sentiment}
                        </span>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs ${
                            conv.riskLevel === "critical"
                              ? "bg-destructive/20 text-destructive"
                              : conv.riskLevel === "high"
                              ? "bg-warning/20 text-warning"
                              : conv.riskLevel === "medium"
                              ? "bg-white/10 text-white/60"
                              : "bg-success/10 text-success"
                          }`}
                        >
                          {conv.riskLevel} risk
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-white/60 line-clamp-2">{conv.lastMessage}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-white/40">
                        <span>{conv.time}</span>
                        <span>Response: {conv.responseTime}</span>
                        <span>Topic: {conv.topic}</span>
                      </div>
                    </div>
                    <button className="rounded-lg bg-white/[0.06] border border-white/[0.08] p-2 hover:bg-white/[0.08]">
                      <Play className="h-4 w-4 text-white/60" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Crisis Protocol Card */}
        {data.metrics.crisisInterventions > 0 && (
          <Card className="mt-6 border-warning/20 bg-warning/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <h3 className="text-lg font-medium text-white">Crisis Protocol Active</h3>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/80">
                The AI Coach has automatically escalated {data.metrics.crisisInterventions} conversations 
                in the past {timeRange === '24h' ? '24 hours' : timeRange} due to crisis indicators.
                All users have been connected with appropriate resources and human support.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-xs text-white/60">Total Interventions</p>
                  <p className="text-lg font-light text-white">{data.metrics.crisisInterventions}</p>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-xs text-white/60">Success Rate</p>
                  <p className="text-lg font-light text-white">100%</p>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-3">
                  <p className="text-xs text-white/60">Avg Response Time</p>
                  <p className="text-lg font-light text-white">{(data.metrics.avgResponseTime / 1000).toFixed(1)}s</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
} 