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
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock data
const performanceData = [
  { time: "00:00", responseTime: 1.2 },
  { time: "04:00", responseTime: 1.1 },
  { time: "08:00", responseTime: 1.5 },
  { time: "12:00", responseTime: 1.8 },
  { time: "16:00", responseTime: 1.6 },
  { time: "20:00", responseTime: 1.3 },
];

const satisfactionData = [
  { day: "Mon", score: 92 },
  { day: "Tue", score: 94 },
  { day: "Wed", score: 91 },
  { day: "Thu", score: 95 },
  { day: "Fri", score: 93 },
  { day: "Sat", score: 96 },
  { day: "Sun", score: 94 },
];

const conversations = [
  {
    id: 1,
    user: "Sarah J.",
    lastMessage: "Thank you so much! This really helped with my cravings today.",
    time: "5 min ago",
    sentiment: "positive",
    responseTime: "1.2s",
  },
  {
    id: 2,
    user: "Mike C.",
    lastMessage: "I don't think the AI understood my question about withdrawal symptoms",
    time: "12 min ago",
    sentiment: "negative",
    responseTime: "2.1s",
  },
  {
    id: 3,
    user: "Emma W.",
    lastMessage: "Can you help me create a plan for the weekend?",
    time: "23 min ago",
    sentiment: "neutral",
    responseTime: "0.9s",
  },
];

export default function AICoachPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-white">AI Coach Management</h1>
          <p className="mt-2 text-white/60">
            Monitor and optimize your AI recovery assistant
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Conversations"
            value="12,847"
            subtitle="This month"
            icon={MessageSquare}
            trend={{ value: 23.5, isPositive: true }}
          />
          <MetricCard
            title="Avg Response Time"
            value="1.4s"
            subtitle="Last 24 hours"
            icon={Clock}
            trend={{ value: 8.2, isPositive: true }}
          />
          <MetricCard
            title="User Satisfaction"
            value="94%"
            subtitle="7-day average"
            icon={ThumbsUp}
            trend={{ value: 2.1, isPositive: true }}
          />
          <MetricCard
            title="Flagged Responses"
            value="3"
            subtitle="Needs review"
            icon={AlertTriangle}
            trend={{ value: 15, isPositive: false }}
          />
        </div>

        {/* Performance Charts */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Response Time */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Response Time</h3>
              <p className="text-sm text-white/60">Average response time throughout the day</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
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
                    dataKey="responseTime"
                    stroke="#C084FC"
                    strokeWidth={2}
                    dot={{ fill: "#C084FC", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Satisfaction Score */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">User Satisfaction</h3>
              <p className="text-sm text-white/60">Daily satisfaction scores</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={satisfactionData}>
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
                  <Bar dataKey="score" fill="#22C55E" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* A/B Testing */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">A/B Test: AI Personalities</h3>
                <p className="text-sm text-white/60">Testing empathetic vs. motivational responses</p>
              </div>
              <button className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/30 px-4 py-2 text-sm text-primary hover:bg-primary/20">
                <Settings className="h-4 w-4" />
                Configure Test
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Variant A */}
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.08] p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-base font-medium text-white">Variant A: Empathetic</h4>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                    50% traffic
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-white/60">Engagement Rate</span>
                    <span className="text-sm text-white">87%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-white/60">Satisfaction</span>
                    <span className="text-sm text-white">92%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-white/60">Retention</span>
                    <span className="text-sm text-white">78%</span>
                  </div>
                </div>
              </div>

              {/* Variant B */}
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.08] p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-base font-medium text-white">Variant B: Motivational</h4>
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-xs text-accent">
                    50% traffic
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-white/60">Engagement Rate</span>
                    <span className="text-sm text-white">91%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-white/60">Satisfaction</span>
                    <span className="text-sm text-success">95%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-white/60">Retention</span>
                    <span className="text-sm text-white">82%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Conversations */}
        <Card className="mt-6">
          <CardHeader>
            <h3 className="text-lg font-medium text-white">Recent Conversations</h3>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/[0.08]">
              {conversations.map((conv) => (
                <div key={conv.id} className="flex items-center justify-between p-6 hover:bg-white/[0.02]">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium text-white">{conv.user}</p>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs ${
                          conv.sentiment === "positive"
                            ? "bg-success/10 text-success"
                            : conv.sentiment === "negative"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-white/10 text-white/60"
                        }`}
                      >
                        {conv.sentiment}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-white/60">{conv.lastMessage}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-white/40">
                      <span>{conv.time}</span>
                      <span>Response: {conv.responseTime}</span>
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
      </div>
    </DashboardLayout>
  );
} 