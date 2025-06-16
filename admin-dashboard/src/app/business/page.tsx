"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  TrendingUp,
  DollarSign,
  Target,
  Users,
  Calculator,
  PieChart,
  BarChart3,
  Activity,
  Calendar,
  Download,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart as RechartsPieChart,
  Pie,
} from "recharts";
import { useState } from "react";

// Mock data for business intelligence
const revenueProjection = [
  { month: "Jan", projected: 0, actual: 0, users: 1200 },
  { month: "Feb", projected: 0, actual: 0, users: 1800 },
  { month: "Mar", projected: 0, actual: 0, users: 2400 },
  { month: "Apr", projected: 15000, actual: 0, users: 3100 },
  { month: "May", projected: 42000, actual: 0, users: 4200 },
  { month: "Jun", projected: 84000, actual: 0, users: 5600 },
  { month: "Jul", projected: 126000, actual: 0, users: 7200 },
  { month: "Aug", projected: 180000, actual: 0, users: 9000 },
  { month: "Sep", projected: 245000, actual: 0, users: 11000 },
  { month: "Oct", projected: 320000, actual: 0, users: 13500 },
  { month: "Nov", projected: 405000, actual: 0, users: 16200 },
  { month: "Dec", projected: 500000, actual: 0, users: 19000 },
];

const marketShare = [
  { name: "NixR (Us)", value: 2.5, color: "#C084FC" },
  { name: "Competitor A", value: 28, color: "#8B5CF6" },
  { name: "Competitor B", value: 22, color: "#6D28D9" },
  { name: "Competitor C", value: 15, color: "#5B21B6" },
  { name: "Others", value: 32.5, color: "#4C1D95" },
];

const customerAcquisition = [
  { channel: "Organic Search", cost: 12, conversions: 850, cac: 14 },
  { channel: "Social Media", cost: 25, conversions: 620, cac: 40 },
  { channel: "App Store", cost: 8, conversions: 1200, cac: 7 },
  { channel: "Referrals", cost: 5, conversions: 450, cac: 11 },
  { channel: "Content Marketing", cost: 15, conversions: 380, cac: 39 },
];

const competitorAnalysis = [
  { metric: "Price", nixr: 85, competitorA: 120, competitorB: 95, industry: 100 },
  { metric: "Features", nixr: 92, competitorA: 88, competitorB: 85, industry: 80 },
  { metric: "User Experience", nixr: 95, competitorA: 75, competitorB: 82, industry: 78 },
  { metric: "Community", nixr: 88, competitorA: 92, competitorB: 70, industry: 75 },
  { metric: "AI Integration", nixr: 98, competitorA: 65, competitorB: 55, industry: 60 },
  { metric: "Success Rate", nixr: 85, competitorA: 78, competitorB: 72, industry: 70 },
];

const unitEconomics = {
  cac: 32,
  ltv: 480,
  paybackPeriod: 3.2,
  monthlyChurn: 4.8,
  arpu: 15,
  grossMargin: 85,
};

export default function BusinessPage() {
  const [timeframe, setTimeframe] = useState("12m");

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-white">Business Intelligence</h1>
            <p className="mt-2 text-white/60">
              Strategic insights and market positioning
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              {timeframe === "6m" ? "6 Months" : timeframe === "12m" ? "12 Months" : "24 Months"}
            </Button>
            <Button variant="secondary" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Unit Economics */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-light text-white">Unit Economics</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <Card className="border-white/10 bg-white/[0.02]">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-white/60">CAC</p>
                <p className="mt-2 text-2xl font-light text-white">${unitEconomics.cac}</p>
                <p className="mt-1 text-xs text-success">-15% MoM</p>
              </CardContent>
            </Card>
            
            <Card className="border-white/10 bg-white/[0.02]">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-white/60">LTV</p>
                <p className="mt-2 text-2xl font-light text-white">${unitEconomics.ltv}</p>
                <p className="mt-1 text-xs text-success">+8% MoM</p>
              </CardContent>
            </Card>
            
            <Card className="border-white/10 bg-white/[0.02]">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-white/60">LTV:CAC</p>
                <p className="mt-2 text-2xl font-light text-white">
                  {(unitEconomics.ltv / unitEconomics.cac).toFixed(1)}x
                </p>
                <p className="mt-1 text-xs text-success">Healthy</p>
              </CardContent>
            </Card>
            
            <Card className="border-white/10 bg-white/[0.02]">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-white/60">Payback</p>
                <p className="mt-2 text-2xl font-light text-white">{unitEconomics.paybackPeriod}mo</p>
                <p className="mt-1 text-xs text-warning">Target: 3mo</p>
              </CardContent>
            </Card>
            
            <Card className="border-white/10 bg-white/[0.02]">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-white/60">Churn</p>
                <p className="mt-2 text-2xl font-light text-white">{unitEconomics.monthlyChurn}%</p>
                <p className="mt-1 text-xs text-destructive">+0.3% MoM</p>
              </CardContent>
            </Card>
            
            <Card className="border-white/10 bg-white/[0.02]">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-white/60">Margin</p>
                <p className="mt-2 text-2xl font-light text-white">{unitEconomics.grossMargin}%</p>
                <p className="mt-1 text-xs text-success">Industry: 75%</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Revenue & Growth */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Revenue Projection</h3>
              <p className="text-sm text-white/60">Monthly revenue with user growth</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueProjection}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                  <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" />
                  <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                    formatter={(value, name) => {
                      if (name === "projected" || name === "actual") {
                        return [`$${value.toLocaleString()}`, name];
                      }
                      return [value.toLocaleString(), name];
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="projected"
                    stroke="#C084FC"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="users"
                    stroke="#22C55E"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 flex justify-around border-t border-white/10 pt-4">
                <div className="text-center">
                  <p className="text-sm text-white/60">Year 1 Target</p>
                  <p className="text-lg font-light text-white">$500K</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-white/60">Break-even</p>
                  <p className="text-lg font-light text-white">Month 8</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-white/60">Runway</p>
                  <p className="text-lg font-light text-white">18 months</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Share */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Market Position</h3>
              <p className="text-sm text-white/60">Current market share in recovery apps</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={marketShare}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {marketShare.map((entry, index) => (
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
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="mt-4 border-t border-white/10 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Total Market Size</span>
                    <span className="text-white">$2.8B</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Growth Rate</span>
                    <span className="text-success">+18% YoY</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Our Growth</span>
                    <span className="text-primary">+245% YoY</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Competitive Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <h3 className="text-lg font-medium text-white">Competitive Analysis</h3>
            <p className="text-sm text-white/60">How we stack up against competitors</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={competitorAnalysis}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="metric" stroke="rgba(255,255,255,0.5)" />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  stroke="rgba(255,255,255,0.3)"
                />
                <Radar
                  name="NixR"
                  dataKey="nixr"
                  stroke="#C084FC"
                  fill="#C084FC"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Competitor A"
                  dataKey="competitorA"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Industry Avg"
                  dataKey="industry"
                  stroke="#6D28D9"
                  fill="#6D28D9"
                  fillOpacity={0.1}
                  strokeDasharray="5 5"
                />
                <Legend />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Acquisition Channels */}
        <Card className="mb-8">
          <CardHeader>
            <h3 className="text-lg font-medium text-white">Customer Acquisition Channels</h3>
            <p className="text-sm text-white/60">Performance by acquisition channel</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-3 text-left text-sm font-medium text-white/60">Channel</th>
                    <th className="p-3 text-center text-sm font-medium text-white/60">Monthly Cost</th>
                    <th className="p-3 text-center text-sm font-medium text-white/60">Conversions</th>
                    <th className="p-3 text-center text-sm font-medium text-white/60">CAC</th>
                    <th className="p-3 text-center text-sm font-medium text-white/60">ROI</th>
                    <th className="p-3 text-center text-sm font-medium text-white/60">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {customerAcquisition.map((channel) => (
                    <tr key={channel.channel} className="border-b border-white/5">
                      <td className="p-3 text-sm text-white">{channel.channel}</td>
                      <td className="p-3 text-center text-sm text-white/80">${channel.cost}K</td>
                      <td className="p-3 text-center text-sm text-white/80">{channel.conversions}</td>
                      <td className="p-3 text-center">
                        <span className={`text-sm ${channel.cac < 20 ? 'text-success' : channel.cac < 35 ? 'text-warning' : 'text-destructive'}`}>
                          ${channel.cac}
                        </span>
                      </td>
                      <td className="p-3 text-center text-sm text-white/80">
                        {((unitEconomics.ltv / channel.cac - 1) * 100).toFixed(0)}%
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center">
                          <TrendingUp className={`h-4 w-4 ${channel.cac < 20 ? 'text-success' : 'text-warning'}`} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Quick Insights */}
            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-white/10 pt-6 md:grid-cols-3">
              <div className="rounded-lg bg-success/10 p-4">
                <p className="text-sm font-medium text-white">Best Performer</p>
                <p className="mt-1 text-xs text-white/60">App Store: $7 CAC, 1200 conversions</p>
              </div>
              <div className="rounded-lg bg-warning/10 p-4">
                <p className="text-sm font-medium text-white">Needs Optimization</p>
                <p className="mt-1 text-xs text-white/60">Social Media: High CAC at $40</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-4">
                <p className="text-sm font-medium text-white">Growth Opportunity</p>
                <p className="mt-1 text-xs text-white/60">Referrals: Low cost, high quality</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics & Targets */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Q4 Targets</h3>
              <p className="text-sm text-white/60">Progress toward quarterly goals</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Revenue</span>
                  <span className="text-white">$125K / $500K</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-white/10">
                  <div className="h-full w-[25%] rounded-full bg-primary" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Active Users</span>
                  <span className="text-white">5.6K / 20K</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-white/10">
                  <div className="h-full w-[28%] rounded-full bg-success" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Retention</span>
                  <span className="text-white">73% / 80%</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-white/10">
                  <div className="h-full w-[91%] rounded-full bg-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Investor Metrics</h3>
              <p className="text-sm text-white/60">Key metrics for stakeholders</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-sm text-white/60">Burn Rate</span>
                <span className="text-sm text-white">$85K/month</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-white/60">Runway</span>
                <span className="text-sm text-white">18 months</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-white/60">Next Raise</span>
                <span className="text-sm text-white">Series A - Q2</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-white/60">Valuation Target</span>
                <span className="text-sm text-white">$25-30M</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Strategic Initiatives</h3>
              <p className="text-sm text-white/60">Key focus areas</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg bg-white/[0.03] p-3">
                <p className="text-sm font-medium text-white">Launch Premium Tier</p>
                <p className="text-xs text-white/60">Target: April • Impact: +$150K ARR</p>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-3">
                <p className="text-sm font-medium text-white">Enterprise Partnerships</p>
                <p className="text-xs text-white/60">Target: Q3 • Pipeline: 5 companies</p>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-3">
                <p className="text-sm font-medium text-white">Android Launch</p>
                <p className="text-xs text-white/60">Target: May • +40% addressable market</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 