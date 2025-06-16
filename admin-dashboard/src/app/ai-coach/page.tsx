"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
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
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock data
const performanceData = [
  { time: "00:00", responseTime: 1.2, crisisInterventions: 8 },
  { time: "04:00", responseTime: 1.1, crisisInterventions: 12 },
  { time: "08:00", responseTime: 1.5, crisisInterventions: 5 },
  { time: "12:00", responseTime: 1.8, crisisInterventions: 3 },
  { time: "16:00", responseTime: 1.6, crisisInterventions: 7 },
  { time: "20:00", responseTime: 1.3, crisisInterventions: 15 },
];

const topicsData = [
  { topic: "Cravings", count: 3842, sentiment: 65 },
  { topic: "Withdrawal", count: 2156, sentiment: 42 },
  { topic: "Relapse Prevention", count: 1893, sentiment: 78 },
  { topic: "Progress Celebration", count: 1654, sentiment: 92 },
  { topic: "Triggers", count: 1432, sentiment: 58 },
  { topic: "Support System", count: 1289, sentiment: 85 },
  { topic: "Daily Check-in", count: 4521, sentiment: 75 },
];

const conversations = [
  {
    id: 1,
    user: "Sarah J.",
    daysClean: 127,
    lastMessage: "Thank you so much! Your breathing exercise really helped with my cravings today.",
    time: "5 min ago",
    sentiment: "positive",
    responseTime: "1.2s",
    topic: "Cravings",
    riskLevel: "low",
  },
  {
    id: 2,
    user: "Mike C.",
    daysClean: 3,
    lastMessage: "I'm really struggling with withdrawal symptoms. The headaches won't stop.",
    time: "12 min ago",
    sentiment: "negative",
    responseTime: "0.8s",
    topic: "Withdrawal",
    riskLevel: "high",
  },
  {
    id: 3,
    user: "Emma W.",
    daysClean: 45,
    lastMessage: "Can you help me create a plan for handling triggers at the wedding this weekend?",
    time: "23 min ago",
    sentiment: "neutral",
    responseTime: "0.9s",
    topic: "Triggers",
    riskLevel: "medium",
  },
  {
    id: 4,
    user: "David P.",
    daysClean: 0,
    lastMessage: "I relapsed last night. I feel like giving up completely.",
    time: "28 min ago",
    sentiment: "crisis",
    responseTime: "0.3s",
    topic: "Relapse",
    riskLevel: "critical",
  },
];

const aiModels = [
  {
    name: "Empathetic Coach",
    version: "2.3.1",
    successRate: 92,
    avgSessionLength: "12m",
    userPreference: 68,
  },
  {
    name: "Motivational Coach",
    version: "2.3.1",
    successRate: 95,
    avgSessionLength: "8m",
    userPreference: 82,
  },
];

export default function AICoachPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-white">AI Recovery Coach</h1>
          <p className="mt-2 text-white/60">
            Monitor and optimize AI-powered recovery support
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Support Sessions"
            value="12,847"
            subtitle="This month"
            icon={MessageSquare}
            trend={{ value: 23.5, isPositive: true }}
          />
          <MetricCard
            title="Crisis Interventions"
            value="142"
            subtitle="Successfully handled"
            icon={Shield}
            trend={{ value: 95, isPositive: true }}
          />
          <MetricCard
            title="User Satisfaction"
            value="94%"
            subtitle="7-day average"
            icon={Heart}
            trend={{ value: 2.1, isPositive: true }}
          />
          <MetricCard
            title="Lives Impacted"
            value="5,624"
            subtitle="Active users"
            icon={Users}
            trend={{ value: 18.2, isPositive: true }}
          />
        </div>

        {/* Performance Charts */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Response Time & Crisis */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Response Time & Crisis Management</h3>
              <p className="text-sm text-white/60">24-hour performance overview</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={performanceData}>
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
                    dataKey="responseTime"
                    stroke="#C084FC"
                    strokeWidth={2}
                    dot={{ fill: "#C084FC", r: 4 }}
                    name="Response Time (s)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="crisisInterventions"
                    stroke="#EF4444"
                    strokeWidth={2}
                    dot={{ fill: "#EF4444", r: 4 }}
                    name="Crisis Interventions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Topic Analysis */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Conversation Topics</h3>
              <p className="text-sm text-white/60">What users are discussing</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topicsData.slice(0, 5).map((topic) => (
                  <div key={topic.topic} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-sm text-white">{topic.topic}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-white/60">{topic.count}</span>
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-16 rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full ${
                              topic.sentiment > 70 ? "bg-success" : 
                              topic.sentiment > 40 ? "bg-warning" : "bg-destructive"
                            }`}
                            style={{ width: `${topic.sentiment}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/40">{topic.sentiment}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Model Performance */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">AI Model Performance</h3>
                <p className="text-sm text-white/60">Comparing different coaching approaches</p>
              </div>
              <button className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/30 px-4 py-2 text-sm text-primary hover:bg-primary/20">
                <Settings className="h-4 w-4" />
                Configure Models
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {aiModels.map((model) => (
                <div key={model.name} className="rounded-lg bg-white/[0.03] border border-white/[0.08] p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-base font-medium text-white">{model.name}</h4>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                      v{model.version}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-white/60">Success Rate</span>
                      <span className="text-sm text-white">{model.successRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-white/60">Avg Session</span>
                      <span className="text-sm text-white">{model.avgSessionLength}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-white/60">User Preference</span>
                      <span className={`text-sm ${model.userPreference > 75 ? "text-success" : "text-white"}`}>
                        {model.userPreference}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 rounded bg-white/[0.03] p-3">
                    <p className="text-xs text-white/60">
                      {model.name === "Empathetic Coach" 
                        ? "Best for: Early recovery, emotional support, crisis situations"
                        : "Best for: Long-term recovery, goal setting, motivation"}
                    </p>
                  </div>
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
            <div className="divide-y divide-white/[0.08]">
              {conversations.map((conv) => (
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
                    <p className="mt-1 text-sm text-white/60">{conv.lastMessage}</p>
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
          </CardContent>
        </Card>

        {/* Crisis Protocol Card */}
        <Card className="mt-6 border-warning/20 bg-warning/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h3 className="text-lg font-medium text-white">Crisis Protocol Active</h3>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/80">
              The AI Coach has automatically escalated 3 conversations in the past 24 hours due to crisis indicators.
              All users have been connected with appropriate resources and human support.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-white/[0.03] p-3">
                <p className="text-xs text-white/60">Suicide Prevention</p>
                <p className="text-lg font-light text-white">2 escalations</p>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-3">
                <p className="text-xs text-white/60">Severe Relapse Risk</p>
                <p className="text-lg font-light text-white">1 escalation</p>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-3">
                <p className="text-xs text-white/60">Response Time</p>
                <p className="text-lg font-light text-white">&lt; 15 seconds</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 