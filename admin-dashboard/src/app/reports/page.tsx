"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  FileText,
  Download,
  Calendar,
  Clock,
  Send,
  Users,
  TrendingUp,
  BarChart3,
  PieChart,
  Filter,
  Plus,
  Mail,
  CheckCircle,
  AlertCircle,
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
  Legend,
  Cell,
  PieChart as RechartsPieChart,
  Pie,
} from "recharts";
import { useState } from "react";

// Mock data for reports
const scheduledReports = [
  {
    id: "RPT-001",
    name: "Weekly Investor Update",
    type: "investor",
    frequency: "weekly",
    recipients: ["investors@nixr.app", "board@nixr.app"],
    lastSent: "Jan 22, 2024",
    nextSend: "Jan 29, 2024",
    status: "active",
  },
  {
    id: "RPT-002",
    name: "Monthly Business Review",
    type: "business",
    frequency: "monthly",
    recipients: ["leadership@nixr.app"],
    lastSent: "Jan 1, 2024",
    nextSend: "Feb 1, 2024",
    status: "active",
  },
  {
    id: "RPT-003",
    name: "Daily Operations Summary",
    type: "operations",
    frequency: "daily",
    recipients: ["ops@nixr.app"],
    lastSent: "Jan 23, 2024",
    nextSend: "Jan 24, 2024",
    status: "active",
  },
  {
    id: "RPT-004",
    name: "Quarterly Board Report",
    type: "board",
    frequency: "quarterly",
    recipients: ["board@nixr.app"],
    lastSent: "Oct 1, 2023",
    nextSend: "Apr 1, 2024",
    status: "paused",
  },
];

const recentReports = [
  {
    id: "GEN-001",
    name: "January 2024 Performance Report",
    type: "performance",
    generatedOn: "Jan 23, 2024 09:30 AM",
    generatedBy: "System",
    size: "2.4 MB",
    downloads: 12,
  },
  {
    id: "GEN-002",
    name: "User Growth Analysis Q4 2023",
    type: "analytics",
    generatedOn: "Jan 20, 2024 02:15 PM",
    generatedBy: "Sarah Chen",
    size: "1.8 MB",
    downloads: 8,
  },
  {
    id: "GEN-003",
    name: "AI Coach Performance Metrics",
    type: "technical",
    generatedOn: "Jan 18, 2024 11:45 AM",
    generatedBy: "Mike Johnson",
    size: "856 KB",
    downloads: 5,
  },
];

// Investor dashboard data
const investorMetrics = {
  mrr: 125000,
  mrrGrowth: 18.5,
  activeUsers: 5624,
  userGrowth: 24.3,
  churnRate: 4.8,
  nps: 72,
  runway: 18,
  burnRate: 85000,
};

const growthChart = [
  { month: "Aug", users: 1200, revenue: 15000 },
  { month: "Sep", users: 1800, revenue: 28000 },
  { month: "Oct", users: 2400, revenue: 42000 },
  { month: "Nov", users: 3100, revenue: 68000 },
  { month: "Dec", users: 4200, revenue: 95000 },
  { month: "Jan", users: 5600, revenue: 125000 },
];

const cohortRetention = [
  { cohort: "Aug 2023", month1: 100, month2: 75, month3: 62, month4: 55, month5: 48 },
  { cohort: "Sep 2023", month1: 100, month2: 78, month3: 65, month4: 58, month5: 52 },
  { cohort: "Oct 2023", month1: 100, month2: 82, month3: 68, month4: 61, month5: 55 },
  { cohort: "Nov 2023", month1: 100, month2: 85, month3: 72, month4: 65, month5: null },
  { cohort: "Dec 2023", month1: 100, month2: 88, month3: 75, month4: null, month5: null },
  { cohort: "Jan 2024", month1: 100, month2: null, month3: null, month4: null, month5: null },
];

const reportTemplates = [
  { id: 1, name: "Executive Summary", description: "High-level overview for C-suite" },
  { id: 2, name: "Investor Update", description: "Monthly metrics and growth analysis" },
  { id: 3, name: "Operations Report", description: "Detailed operational metrics" },
  { id: 4, name: "Financial Summary", description: "Revenue, costs, and projections" },
  { id: 5, name: "User Analytics", description: "User behavior and engagement" },
];

export default function ReportsPage() {
  const [selectedView, setSelectedView] = useState("scheduled");

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-white">Reports & Analytics</h1>
            <p className="mt-2 text-white/60">
              Automated reporting and investor dashboards
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Report
            </Button>
            <Button variant="primary" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-1 rounded-lg bg-white/[0.03] p-1">
          {[
            { id: "scheduled", label: "Scheduled Reports" },
            { id: "generated", label: "Generated Reports" },
            { id: "investor", label: "Investor Dashboard" },
            { id: "templates", label: "Templates" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedView(tab.id)}
              className={`flex-1 rounded-lg px-4 py-2 text-sm transition-all ${
                selectedView === tab.id
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scheduled Reports */}
        {selectedView === "scheduled" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">Scheduled Reports</h3>
                  <Button variant="ghost" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Schedule
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scheduledReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between rounded-lg bg-white/[0.03] p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{report.name}</p>
                          <div className="mt-1 flex items-center gap-4 text-xs text-white/60">
                            <span className="capitalize">{report.frequency}</span>
                            <span>{report.recipients.length} recipients</span>
                            <span>Next: {report.nextSend}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-2 py-1 text-xs ${
                          report.status === 'active'
                            ? 'bg-success/20 text-success'
                            : 'bg-white/10 text-white/60'
                        }`}>
                          {report.status}
                        </span>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Report Schedule Calendar */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-white">Upcoming Reports</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { date: "Jan 24", reports: ["Daily Operations Summary"] },
                      { date: "Jan 25", reports: ["Daily Operations Summary"] },
                      { date: "Jan 26", reports: ["Daily Operations Summary"] },
                      { date: "Jan 29", reports: ["Weekly Investor Update", "Daily Operations Summary"] },
                      { date: "Feb 1", reports: ["Monthly Business Review", "Daily Operations Summary"] },
                    ].map((day) => (
                      <div key={day.date} className="flex items-start gap-3">
                        <div className="w-16 text-sm text-white/60">{day.date}</div>
                        <div className="flex-1 space-y-1">
                          {day.reports.map((report) => (
                            <div key={report} className="text-sm text-white">{report}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-white">Delivery Stats</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/60">Reports sent this month</span>
                      <span className="text-lg font-light text-white">42</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/60">Average open rate</span>
                      <span className="text-lg font-light text-white">87%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/60">Failed deliveries</span>
                      <span className="text-lg font-light text-destructive">2</span>
                    </div>
                    <div className="mt-6 rounded-lg bg-white/[0.03] p-4">
                      <p className="text-sm text-white/60">
                        Next scheduled report will be sent in
                      </p>
                      <p className="mt-1 text-2xl font-light text-white">14h 32m</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Generated Reports */}
        {selectedView === "generated" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">Recent Reports</h3>
                  <Button variant="ghost" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="p-3 text-left text-sm font-medium text-white/60">Report Name</th>
                        <th className="p-3 text-left text-sm font-medium text-white/60">Type</th>
                        <th className="p-3 text-left text-sm font-medium text-white/60">Generated</th>
                        <th className="p-3 text-left text-sm font-medium text-white/60">By</th>
                        <th className="p-3 text-center text-sm font-medium text-white/60">Size</th>
                        <th className="p-3 text-center text-sm font-medium text-white/60">Downloads</th>
                        <th className="p-3 text-center text-sm font-medium text-white/60">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentReports.map((report) => (
                        <tr key={report.id} className="border-b border-white/5">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-white/40" />
                              <span className="text-sm text-white">{report.name}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/60 capitalize">
                              {report.type}
                            </span>
                          </td>
                          <td className="p-3 text-sm text-white/60">{report.generatedOn}</td>
                          <td className="p-3 text-sm text-white/60">{report.generatedBy}</td>
                          <td className="p-3 text-center text-sm text-white/60">{report.size}</td>
                          <td className="p-3 text-center text-sm text-white/60">{report.downloads}</td>
                          <td className="p-3 text-center">
                            <div className="flex justify-center gap-2">
                              <Button variant="ghost" size="xs">
                                <Download className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="xs">
                                <Mail className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Quick Generate */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-white">Quick Generate</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="secondary" className="w-full justify-start">
                    <TrendingUp className="mr-3 h-4 w-4" />
                    Weekly Performance Report
                  </Button>
                  <Button variant="secondary" className="w-full justify-start">
                    <Users className="mr-3 h-4 w-4" />
                    User Analytics Report
                  </Button>
                  <Button variant="secondary" className="w-full justify-start">
                    <BarChart3 className="mr-3 h-4 w-4" />
                    Financial Summary
                  </Button>
                  <Button variant="secondary" className="w-full justify-start">
                    <PieChart className="mr-3 h-4 w-4" />
                    Market Analysis
                  </Button>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <h3 className="text-lg font-medium text-white">Report Generation Queue</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg bg-white/[0.03] p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <div>
                          <p className="text-sm text-white">Q4 2023 Financial Report</p>
                          <p className="text-xs text-white/60">Processing... 45%</p>
                        </div>
                      </div>
                      <span className="text-xs text-white/40">2 min remaining</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-white/[0.03] p-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-8 w-8 text-success" />
                        <div>
                          <p className="text-sm text-white">User Engagement Analysis</p>
                          <p className="text-xs text-white/60">Completed</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="xs">
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Investor Dashboard */}
        {selectedView === "investor" && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-white/10 bg-white/[0.02]">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-white/60">Monthly Recurring Revenue</p>
                  <p className="mt-2 text-2xl font-light text-white">
                    ${investorMetrics.mrr.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-success">+{investorMetrics.mrrGrowth}% MoM</p>
                </CardContent>
              </Card>
              
              <Card className="border-white/10 bg-white/[0.02]">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-white/60">Active Users</p>
                  <p className="mt-2 text-2xl font-light text-white">
                    {investorMetrics.activeUsers.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-success">+{investorMetrics.userGrowth}% MoM</p>
                </CardContent>
              </Card>
              
              <Card className="border-white/10 bg-white/[0.02]">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-white/60">Monthly Churn</p>
                  <p className="mt-2 text-2xl font-light text-white">{investorMetrics.churnRate}%</p>
                  <p className="mt-1 text-xs text-warning">+0.3% from last month</p>
                </CardContent>
              </Card>
              
              <Card className="border-white/10 bg-white/[0.02]">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-white/60">Runway</p>
                  <p className="mt-2 text-2xl font-light text-white">{investorMetrics.runway} months</p>
                  <p className="mt-1 text-xs text-white/60">
                    ${(investorMetrics.burnRate / 1000).toFixed(0)}K/month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Growth Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-white">Revenue & User Growth</h3>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={growthChart}>
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
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#C084FC"
                        strokeWidth={2}
                        name="Revenue ($)"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="users"
                        stroke="#22C55E"
                        strokeWidth={2}
                        name="Active Users"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-white">Cohort Retention</h3>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="p-2 text-left text-white/60">Cohort</th>
                          <th className="p-2 text-center text-white/60">M1</th>
                          <th className="p-2 text-center text-white/60">M2</th>
                          <th className="p-2 text-center text-white/60">M3</th>
                          <th className="p-2 text-center text-white/60">M4</th>
                          <th className="p-2 text-center text-white/60">M5</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cohortRetention.map((cohort) => (
                          <tr key={cohort.cohort} className="border-b border-white/5">
                            <td className="p-2 text-white">{cohort.cohort}</td>
                            <td className="p-2 text-center">
                              <div
                                className="mx-auto flex h-8 w-12 items-center justify-center rounded text-xs text-white"
                                style={{
                                  backgroundColor: `rgba(192, 132, 252, ${cohort.month1 / 100})`,
                                }}
                              >
                                {cohort.month1}%
                              </div>
                            </td>
                            <td className="p-2 text-center">
                              {cohort.month2 && (
                                <div
                                  className="mx-auto flex h-8 w-12 items-center justify-center rounded text-xs text-white"
                                  style={{
                                    backgroundColor: `rgba(192, 132, 252, ${cohort.month2 / 100})`,
                                  }}
                                >
                                  {cohort.month2}%
                                </div>
                              )}
                            </td>
                            <td className="p-2 text-center">
                              {cohort.month3 && (
                                <div
                                  className="mx-auto flex h-8 w-12 items-center justify-center rounded text-xs text-white"
                                  style={{
                                    backgroundColor: `rgba(192, 132, 252, ${cohort.month3 / 100})`,
                                  }}
                                >
                                  {cohort.month3}%
                                </div>
                              )}
                            </td>
                            <td className="p-2 text-center">
                              {cohort.month4 && (
                                <div
                                  className="mx-auto flex h-8 w-12 items-center justify-center rounded text-xs text-white"
                                  style={{
                                    backgroundColor: `rgba(192, 132, 252, ${cohort.month4 / 100})`,
                                  }}
                                >
                                  {cohort.month4}%
                                </div>
                              )}
                            </td>
                            <td className="p-2 text-center">
                              {cohort.month5 && (
                                <div
                                  className="mx-auto flex h-8 w-12 items-center justify-center rounded text-xs text-white"
                                  style={{
                                    backgroundColor: `rgba(192, 132, 252, ${cohort.month5 / 100})`,
                                  }}
                                >
                                  {cohort.month5}%
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-white">Export Investor Data</h3>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary">
                    <Download className="mr-2 h-4 w-4" />
                    Download Pitch Deck
                  </Button>
                  <Button variant="secondary">
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Investor Update
                  </Button>
                  <Button variant="secondary">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Export Financial Model
                  </Button>
                  <Button variant="secondary">
                    <Send className="mr-2 h-4 w-4" />
                    Share Dashboard Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Templates */}
        {selectedView === "templates" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-white">Report Templates</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between rounded-lg bg-white/[0.03] p-4"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{template.name}</p>
                        <p className="text-xs text-white/60">{template.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm">
                          Use
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="secondary" className="mt-4 w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-white">Template Builder</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-white/60">Template Name</label>
                    <input
                      type="text"
                      placeholder="Enter template name"
                      className="mt-1 w-full rounded-lg bg-white/[0.05] px-4 py-2 text-white placeholder-white/40 outline-none focus:bg-white/[0.08]"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/60">Data Sources</label>
                    <div className="mt-2 space-y-2">
                      {["User Analytics", "Financial Data", "AI Performance", "Community Metrics"].map((source) => (
                        <label key={source} className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm text-white">{source}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-white/60">Sections</label>
                    <div className="mt-2 space-y-2">
                      <div className="rounded-lg bg-white/[0.03] p-3">
                        <p className="text-sm text-white">Executive Summary</p>
                      </div>
                      <div className="rounded-lg bg-white/[0.03] p-3">
                        <p className="text-sm text-white">Key Metrics</p>
                      </div>
                      <Button variant="ghost" size="sm" className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Section
                      </Button>
                    </div>
                  </div>
                  <Button variant="primary" className="w-full">
                    Save Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 