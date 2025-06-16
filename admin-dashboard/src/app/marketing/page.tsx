"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  TrendingUp,
  Users,
  Target,
  MessageSquare,
  Share2,
  Eye,
  ThumbsUp,
  Calendar,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
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
  PieChart,
  Pie,
  Scatter,
  ScatterChart,
} from "recharts";
import { useState } from "react";

// Mock data for marketing
const campaignPerformance = [
  { 
    name: "New Year Reset",
    impressions: 45000,
    clicks: 2300,
    conversions: 180,
    spend: 1200,
    ctr: 5.1,
    cvr: 7.8,
    status: "active"
  },
  {
    name: "Second Chance",
    impressions: 38000,
    clicks: 1900,
    conversions: 120,
    spend: 980,
    ctr: 5.0,
    cvr: 6.3,
    status: "active"
  },
  {
    name: "Community Power",
    impressions: 52000,
    clicks: 3100,
    conversions: 210,
    spend: 1500,
    ctr: 6.0,
    cvr: 6.8,
    status: "paused"
  },
  {
    name: "AI Coach Launch",
    impressions: 28000,
    clicks: 1400,
    conversions: 95,
    spend: 800,
    ctr: 5.0,
    cvr: 6.8,
    status: "completed"
  },
];

const contentPerformance = [
  { type: "Blog Posts", published: 24, views: 45000, engagement: 8.2, shares: 1200 },
  { type: "Success Stories", published: 18, views: 62000, engagement: 12.5, shares: 3400 },
  { type: "Video Content", published: 12, views: 38000, engagement: 15.3, shares: 2800 },
  { type: "Infographics", published: 8, views: 28000, engagement: 6.7, shares: 1800 },
  { type: "Podcasts", published: 6, views: 15000, engagement: 22.1, shares: 900 },
];

const socialMediaGrowth = [
  { month: "Jan", instagram: 2400, twitter: 1800, tiktok: 800, linkedin: 600 },
  { month: "Feb", instagram: 3200, twitter: 2200, tiktok: 1200, linkedin: 750 },
  { month: "Mar", instagram: 4100, twitter: 2800, tiktok: 2100, linkedin: 920 },
  { month: "Apr", instagram: 5300, twitter: 3400, tiktok: 3500, linkedin: 1100 },
  { month: "May", instagram: 6800, twitter: 4100, tiktok: 5200, linkedin: 1350 },
  { month: "Jun", instagram: 8500, twitter: 4900, tiktok: 7800, linkedin: 1600 },
];

const topContent = [
  { title: "My 90-Day Journey to Freedom", views: 12500, shares: 890, engagement: 15.2 },
  { title: "5 Science-Backed Tips to Quit", views: 10200, shares: 720, engagement: 12.8 },
  { title: "Building Your Support Network", views: 8900, shares: 650, engagement: 14.1 },
  { title: "Understanding Withdrawal", views: 7800, shares: 420, engagement: 9.5 },
  { title: "The Role of AI in Recovery", views: 6500, shares: 380, engagement: 11.2 },
];

const audienceSegments = [
  { segment: "Age 18-24", value: 22, color: "#C084FC" },
  { segment: "Age 25-34", value: 38, color: "#A78BFA" },
  { segment: "Age 35-44", value: 25, color: "#8B5CF6" },
  { segment: "Age 45+", value: 15, color: "#7C3AED" },
];

const conversionFunnel = [
  { stage: "Website Visits", users: 25000 },
  { stage: "Sign Up Started", users: 8500 },
  { stage: "Email Verified", users: 6200 },
  { stage: "App Downloaded", users: 4800 },
  { stage: "Onboarding Complete", users: 3200 },
  { stage: "Week 1 Retained", users: 2400 },
];

export default function MarketingPage() {
  const [selectedCampaign, setSelectedCampaign] = useState("all");
  const [timeRange, setTimeRange] = useState("30d");

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-white">Marketing Dashboard</h1>
            <p className="mt-2 text-white/60">
              Campaign performance and growth analytics
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

        {/* Key Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/60">Total Reach</p>
                  <p className="mt-2 text-2xl font-light text-white">2.4M</p>
                  <p className="mt-1 text-xs text-success">+32% from last month</p>
                </div>
                <Eye className="h-8 w-8 text-white/20" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/60">Engagement Rate</p>
                  <p className="mt-2 text-2xl font-light text-white">8.7%</p>
                  <p className="mt-1 text-xs text-success">+1.2% from last month</p>
                </div>
                <ThumbsUp className="h-8 w-8 text-white/20" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/60">Conversion Rate</p>
                  <p className="mt-2 text-2xl font-light text-white">6.8%</p>
                  <p className="mt-1 text-xs text-warning">-0.3% from last month</p>
                </div>
                <Target className="h-8 w-8 text-white/20" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/60">Social Followers</p>
                  <p className="mt-2 text-2xl font-light text-white">28.5K</p>
                  <p className="mt-1 text-xs text-success">+4.2K this month</p>
                </div>
                <Users className="h-8 w-8 text-white/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Performance */}
        <Card className="mb-8">
          <CardHeader>
            <h3 className="text-lg font-medium text-white">Active Campaigns</h3>
            <p className="text-sm text-white/60">Performance metrics by campaign</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-3 text-left text-sm font-medium text-white/60">Campaign</th>
                    <th className="p-3 text-center text-sm font-medium text-white/60">Status</th>
                    <th className="p-3 text-center text-sm font-medium text-white/60">Impressions</th>
                    <th className="p-3 text-center text-sm font-medium text-white/60">CTR</th>
                    <th className="p-3 text-center text-sm font-medium text-white/60">CVR</th>
                    <th className="p-3 text-center text-sm font-medium text-white/60">Cost/Conv</th>
                    <th className="p-3 text-center text-sm font-medium text-white/60">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignPerformance.map((campaign) => (
                    <tr key={campaign.name} className="border-b border-white/5">
                      <td className="p-3 text-sm text-white">{campaign.name}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex h-6 items-center rounded-full px-2 text-xs ${
                          campaign.status === 'active' ? 'bg-success/20 text-success' : 
                          campaign.status === 'paused' ? 'bg-warning/20 text-warning' : 
                          'bg-white/10 text-white/60'
                        }`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="p-3 text-center text-sm text-white/80">
                        {(campaign.impressions / 1000).toFixed(0)}K
                      </td>
                      <td className="p-3 text-center text-sm text-white/80">{campaign.ctr}%</td>
                      <td className="p-3 text-center text-sm text-white/80">{campaign.cvr}%</td>
                      <td className="p-3 text-center text-sm text-white/80">
                        ${(campaign.spend / campaign.conversions).toFixed(0)}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-sm text-success">
                            {((campaign.conversions * 480 / campaign.spend - 1) * 100).toFixed(0)}%
                          </span>
                          <TrendingUp className="h-3 w-3 text-success" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Social Media & Content Performance */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Social Media Growth</h3>
              <p className="text-sm text-white/60">Follower growth across platforms</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={socialMediaGrowth}>
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
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="instagram"
                    stackId="1"
                    stroke="#C084FC"
                    fill="#C084FC"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="tiktok"
                    stackId="1"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="twitter"
                    stackId="1"
                    stroke="#6D28D9"
                    fill="#6D28D9"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="linkedin"
                    stackId="1"
                    stroke="#5B21B6"
                    fill="#5B21B6"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Content Performance</h3>
              <p className="text-sm text-white/60">Engagement by content type</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="views"
                    type="number"
                    stroke="rgba(255,255,255,0.5)"
                    tickFormatter={(value) => `${value / 1000}K`}
                  />
                  <YAxis
                    dataKey="engagement"
                    type="number"
                    stroke="rgba(255,255,255,0.5)"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                    formatter={(value, name) => {
                      if (name === "views") return [`${(value / 1000).toFixed(1)}K views`, "Views"];
                      if (name === "engagement") return [`${value}%`, "Engagement"];
                      return [value, name];
                    }}
                  />
                  <Scatter
                    name="Content Performance"
                    data={contentPerformance}
                    fill="#C084FC"
                  >
                    {contentPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#C084FC" />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                {contentPerformance.map((item) => (
                  <div key={item.type} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-white/60">{item.type}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Funnel & Audience */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Marketing Funnel</h3>
              <p className="text-sm text-white/60">User journey from awareness to retention</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionFunnel.map((stage, index) => {
                  const percentage = (stage.users / conversionFunnel[0].users) * 100;
                  const dropoff = index > 0 
                    ? ((conversionFunnel[index - 1].users - stage.users) / conversionFunnel[index - 1].users * 100).toFixed(1)
                    : 0;
                  
                  return (
                    <div key={stage.stage}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-white">{stage.stage}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white/60">{stage.users.toLocaleString()}</span>
                          {index > 0 && (
                            <span className="flex items-center text-xs text-destructive">
                              <ArrowDownRight className="h-3 w-3" />
                              {dropoff}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="h-8 rounded-lg bg-white/10">
                        <div
                          className="h-full rounded-lg bg-gradient-to-r from-primary to-primary/60"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Audience Demographics</h3>
              <p className="text-sm text-white/60">Age distribution</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={audienceSegments}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {audienceSegments.map((entry, index) => (
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
              <div className="mt-4 space-y-2">
                {audienceSegments.map((segment) => (
                  <div key={segment.segment} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: segment.color }}
                      />
                      <span className="text-sm text-white/60">{segment.segment}</span>
                    </div>
                    <span className="text-sm text-white">{segment.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Content */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-white">Top Performing Content</h3>
            <p className="text-sm text-white/60">Most engaging content this month</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topContent.map((content, index) => (
                <div key={content.title} className="flex items-center justify-between rounded-lg bg-white/[0.03] p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-sm font-medium text-white">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{content.title}</p>
                      <div className="mt-1 flex items-center gap-4 text-xs text-white/60">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {(content.views / 1000).toFixed(1)}K views
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="h-3 w-3" />
                          {content.shares} shares
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {content.engagement}% engagement
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 