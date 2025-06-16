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
  Heart,
  Shield,
  Award,
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

// Mock data for recovery-focused business intelligence
const revenueProjection = [
  { month: "Jan", projected: 0, actual: 0, users: 1200, recoveryRate: 42 },
  { month: "Feb", projected: 0, actual: 0, users: 1800, recoveryRate: 45 },
  { month: "Mar", projected: 0, actual: 0, users: 2400, recoveryRate: 48 },
  { month: "Apr", projected: 15000, actual: 0, users: 3100, recoveryRate: 52 },
  { month: "May", projected: 42000, actual: 0, users: 4200, recoveryRate: 55 },
  { month: "Jun", projected: 84000, actual: 0, users: 5600, recoveryRate: 58 },
  { month: "Jul", projected: 126000, actual: 0, users: 7200, recoveryRate: 61 },
  { month: "Aug", projected: 180000, actual: 0, users: 9000, recoveryRate: 64 },
  { month: "Sep", projected: 245000, actual: 0, users: 11000, recoveryRate: 67 },
  { month: "Oct", projected: 320000, actual: 0, users: 13500, recoveryRate: 70 },
  { month: "Nov", projected: 405000, actual: 0, users: 16200, recoveryRate: 72 },
  { month: "Dec", projected: 500000, actual: 0, users: 19000, recoveryRate: 75 },
];

const recoveryMarketShare = [
  { name: "NixR (Us)", value: 2.5, color: "#C084FC" },
  { name: "Traditional Programs", value: 35, color: "#8B5CF6" },
  { name: "Other Apps", value: 22, color: "#6D28D9" },
  { name: "Telehealth", value: 18, color: "#5B21B6" },
  { name: "In-Person Only", value: 22.5, color: "#4C1D95" },
];

const customerAcquisition = [
  { channel: "Healthcare Partners", cost: 8, conversions: 1200, cac: 7, successRate: 78 },
  { channel: "Recovery Centers", cost: 12, conversions: 850, cac: 14, successRate: 82 },
  { channel: "Therapist Referrals", cost: 5, conversions: 620, cac: 8, successRate: 85 },
  { channel: "Organic Search", cost: 15, conversions: 450, cac: 33, successRate: 68 },
  { channel: "Community Outreach", cost: 10, conversions: 380, cac: 26, successRate: 72 },
];

const competitorAnalysis = [
  { metric: "Price", nixr: 85, traditional: 20, apps: 75, telehealth: 40 },
  { metric: "Accessibility", nixr: 98, traditional: 45, apps: 85, telehealth: 70 },
  { metric: "Success Rate", nixr: 82, traditional: 88, apps: 65, telehealth: 75 },
  { metric: "User Experience", nixr: 95, traditional: 50, apps: 80, telehealth: 72 },
  { metric: "AI Support", nixr: 98, traditional: 10, apps: 45, telehealth: 30 },
  { metric: "Community", nixr: 88, traditional: 95, apps: 70, telehealth: 60 },
];

const unitEconomics = {
  cac: 32,
  ltv: 680,
  paybackPeriod: 2.8,
  monthlyChurn: 3.2,
  arpu: 15,
  grossMargin: 85,
  lifesSaved: 142,
  costPerLifeSaved: 1250,
};

const impactMetrics = [
  { metric: "Lives Touched", value: "5,624", trend: "+18%", icon: Heart },
  { metric: "Relapses Prevented", value: "1,847", trend: "+24%", icon: Shield },
  { metric: "Recovery Years", value: "3,215", trend: "+31%", icon: Award },
  { metric: "Crisis Interventions", value: "142", trend: "+12%", icon: Activity },
];

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

        {/* Impact Metrics - New Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-light text-white">Social Impact & Value Creation</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {impactMetrics.map((metric) => (
              <Card key={metric.metric} className="border-white/10 bg-white/[0.02]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/60">{metric.metric}</p>
                      <p className="mt-2 text-2xl font-light text-white">{metric.value}</p>
                      <p className="mt-1 text-xs text-success">{metric.trend} YTD</p>
                    </div>
                    <metric.icon className="h-8 w-8 text-white/20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Unit Economics */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-light text-white">Unit Economics & Recovery Impact</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-8">
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
                <p className="mt-1 text-xs text-success">+12% MoM</p>
              </CardContent>
            </Card>
            
            <Card className="border-white/10 bg-white/[0.02]">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-white/60">LTV:CAC</p>
                <p className="mt-2 text-2xl font-light text-white">
                  {(unitEconomics.ltv / unitEconomics.cac).toFixed(1)}x
                </p>
                <p className="mt-1 text-xs text-success">Excellent</p>
              </CardContent>
            </Card>
            
            <Card className="border-white/10 bg-white/[0.02]">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-white/60">Payback</p>
                <p className="mt-2 text-2xl font-light text-white">{unitEconomics.paybackPeriod}mo</p>
                <p className="mt-1 text-xs text-success">Below target</p>
              </CardContent>
            </Card>
            
            <Card className="border-white/10 bg-white/[0.02]">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-white/60">Churn</p>
                <p className="mt-2 text-2xl font-light text-white">{unitEconomics.monthlyChurn}%</p>
                <p className="mt-1 text-xs text-success">Industry: 8%</p>
              </CardContent>
            </Card>
            
            <Card className="border-white/10 bg-white/[0.02]">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-white/60">Margin</p>
                <p className="mt-2 text-2xl font-light text-white">{unitEconomics.grossMargin}%</p>
                <p className="mt-1 text-xs text-success">Industry: 75%</p>
              </CardContent>
            </Card>
            
            <Card className="border-white/10 bg-primary/[0.05]">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-white/60">Lives Saved</p>
                <p className="mt-2 text-2xl font-light text-white">{unitEconomics.lifesSaved}</p>
                <p className="mt-1 text-xs text-primary">This year</p>
              </CardContent>
            </Card>
            
            <Card className="border-white/10 bg-primary/[0.05]">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-white/60">Cost/Life</p>
                <p className="mt-2 text-2xl font-light text-white">${unitEconomics.costPerLifeSaved}</p>
                <p className="mt-1 text-xs text-primary">vs $25K traditional</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Revenue & Recovery Success */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Revenue & Recovery Outcomes</h3>
              <p className="text-sm text-white/60">Financial growth tied to recovery success</p>
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
                      if (name === "recoveryRate") {
                        return [`${value}%`, "Recovery Rate"];
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
                    name="Revenue"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="recoveryRate"
                    stroke="#22C55E"
                    strokeWidth={2}
                    name="Recovery Rate"
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 flex justify-around border-t border-white/10 pt-4">
                <div className="text-center">
                  <p className="text-sm text-white/60">Year 1 Target</p>
                  <p className="text-lg font-light text-white">$500K</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-white/60">Recovery Goal</p>
                  <p className="text-lg font-light text-white">75% at 1yr</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-white/60">Impact Goal</p>
                  <p className="text-lg font-light text-white">10K lives</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Share */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Recovery Market Position</h3>
              <p className="text-sm text-white/60">Share of addiction recovery market</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={recoveryMarketShare}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {recoveryMarketShare.map((entry, index) => (
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
                    <span className="text-white">$44B</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Digital Growth</span>
                    <span className="text-success">+42% YoY</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Our Growth</span>
                    <span className="text-primary">+315% YoY</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Competitive Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <h3 className="text-lg font-medium text-white">Recovery Solution Comparison</h3>
            <p className="text-sm text-white/60">How we compare to other recovery options</p>
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
                  name="Traditional Programs"
                  dataKey="traditional"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Other Apps"
                  dataKey="apps"
                  stroke="#6D28D9"
                  fill="#6D28D9"
                  fillOpacity={0.2}
                />
                <Radar
                  name="Telehealth"
                  dataKey="telehealth"
                  stroke="#5B21B6"
                  fill="#5B21B6"
                  fillOpacity={0.1}
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
            <h3 className="text-lg font-medium text-white">Partnership & Acquisition Channels</h3>
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
                    <th className="p-3 text-center text-sm font-medium text-white/60">Success Rate</th>
                    <th className="p-3 text-center text-sm font-medium text-white/60">ROI</th>
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
                      <td className="p-3 text-center">
                        <span className={`text-sm ${channel.successRate > 80 ? 'text-success' : 'text-white/80'}`}>
                          {channel.successRate}%
                        </span>
                      </td>
                      <td className="p-3 text-center text-sm text-white/80">
                        {((unitEconomics.ltv / channel.cac - 1) * 100).toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Quick Insights */}
            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-white/10 pt-6 md:grid-cols-3">
              <div className="rounded-lg bg-success/10 p-4">
                <p className="text-sm font-medium text-white">Best Partnership</p>
                <p className="mt-1 text-xs text-white/60">Healthcare Partners: 85% success rate</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-4">
                <p className="text-sm font-medium text-white">Growth Opportunity</p>
                <p className="mt-1 text-xs text-white/60">Insurance partnerships: Untapped market</p>
              </div>
              <div className="rounded-lg bg-warning/10 p-4">
                <p className="text-sm font-medium text-white">Focus Area</p>
                <p className="mt-1 text-xs text-white/60">Enterprise wellness programs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics & Targets */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Recovery Targets</h3>
              <p className="text-sm text-white/60">Progress toward recovery goals</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">30-Day Retention</span>
                  <span className="text-white">68% / 75%</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-white/10">
                  <div className="h-full w-[91%] rounded-full bg-primary" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">1-Year Success</span>
                  <span className="text-white">42% / 50%</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-white/10">
                  <div className="h-full w-[84%] rounded-full bg-success" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Lives Impacted</span>
                  <span className="text-white">5.6K / 10K</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-white/10">
                  <div className="h-full w-[56%] rounded-full bg-warning" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Crisis Response</span>
                  <span className="text-white">98% / 99%</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-white/10">
                  <div className="h-full w-[99%] rounded-full bg-success" />
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
                <span className="text-sm text-white">$35-45M</span>
              </div>
              <div className="flex justify-between py-2 border-t border-white/10 pt-3">
                <span className="text-sm text-white/60">Impact Multiple</span>
                <span className="text-sm text-primary">21x social ROI</span>
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
                <p className="text-sm font-medium text-white">Insurance Coverage</p>
                <p className="text-xs text-white/60">Target: Q2 • 3 providers in talks</p>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-3">
                <p className="text-sm font-medium text-white">Clinical Validation Study</p>
                <p className="text-xs text-white/60">Target: Q3 • 500 participants</p>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-3">
                <p className="text-sm font-medium text-white">Enterprise Wellness</p>
                <p className="text-xs text-white/60">Target: Q4 • Pipeline: 12 companies</p>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-3">
                <p className="text-sm font-medium text-white">Family Support Features</p>
                <p className="text-xs text-white/60">Target: Q2 • +30% TAM</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 