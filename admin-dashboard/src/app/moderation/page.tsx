"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Flag,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Users,
  Eye,
  Bot,
  TrendingUp,
  Filter,
  Clock,
  UserX,
  Ban,
} from "lucide-react";
import { useState } from "react";

// Mock data for moderation
const flaggedContent = [
  {
    id: "MOD-001",
    type: "post",
    content: "Feeling really down today, thinking about giving up...",
    author: {
      name: "Anonymous User",
      id: "user_1234",
      avatar: "AU",
      previousFlags: 0,
      daysClean: 15,
    },
    flagReason: "Potential self-harm",
    flaggedBy: "AI Auto-Detection",
    severity: "high",
    timestamp: "10 minutes ago",
    status: "pending",
    context: "Recovery Journal",
  },
  {
    id: "MOD-002",
    type: "comment",
    content: "You should try [substance name], it really helped me...",
    author: {
      name: "Mike Johnson",
      id: "user_5678",
      avatar: "MJ",
      previousFlags: 2,
      daysClean: 3,
    },
    flagReason: "Substance promotion",
    flaggedBy: "3 users",
    severity: "high",
    timestamp: "25 minutes ago",
    status: "pending",
    context: "Community Forum",
  },
  {
    id: "MOD-003",
    type: "message",
    content: "Check out this link for quick recovery tips: bit.ly/...",
    author: {
      name: "Sarah Chen",
      id: "user_9012",
      avatar: "SC",
      previousFlags: 1,
      daysClean: 0,
    },
    flagReason: "Suspicious link",
    flaggedBy: "AI Auto-Detection",
    severity: "medium",
    timestamp: "1 hour ago",
    status: "pending",
    context: "Direct Message",
  },
  {
    id: "MOD-004",
    type: "post",
    content: "Just hit 30 days clean! So grateful for this community 🎉",
    author: {
      name: "David Park",
      id: "user_3456",
      avatar: "DP",
      previousFlags: 0,
      daysClean: 30,
    },
    flagReason: "False positive - celebration",
    flaggedBy: "AI Auto-Detection",
    severity: "low",
    timestamp: "2 hours ago",
    status: "reviewed",
    action: "approved",
    context: "Success Stories",
  },
];

const moderationStats = {
  pendingReview: 18,
  reviewedToday: 42,
  autoResolved: 28,
  escalated: 3,
  avgReviewTime: "4.2m",
  accuracyRate: 94,
};

const reportReasons = [
  { reason: "Substance promotion", count: 34, trend: "up" },
  { reason: "Self-harm content", count: 28, trend: "down" },
  { reason: "Harassment", count: 19, trend: "stable" },
  { reason: "Spam", count: 15, trend: "up" },
  { reason: "Misinformation", count: 12, trend: "down" },
  { reason: "Inappropriate content", count: 8, trend: "stable" },
];

const bannedUsers = [
  {
    id: "user_banned_1",
    name: "John Doe",
    email: "john.doe@email.com",
    banReason: "Repeated substance promotion",
    banDate: "Jan 20, 2024",
    banDuration: "Permanent",
    previousViolations: 5,
  },
  {
    id: "user_banned_2",
    name: "Jane Smith",
    email: "jsmith@email.com",
    banReason: "Harassment of other users",
    banDate: "Jan 18, 2024",
    banDuration: "30 days",
    previousViolations: 3,
  },
];

export default function ModerationPage() {
  const [selectedContent, setSelectedContent] = useState(flaggedContent[0]);
  const [filterSeverity, setFilterSeverity] = useState("all");

  const filteredContent = filterSeverity === "all"
    ? flaggedContent
    : flaggedContent.filter(c => c.severity === filterSeverity);

  const handleAction = (action: "approve" | "remove" | "escalate") => {
    console.log(`Action: ${action} for content ${selectedContent.id}`);
    // Handle moderation action
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-white">Content Moderation</h1>
            <p className="mt-2 text-white/60">
              Review flagged content and maintain community safety
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm">
              <Bot className="mr-2 h-4 w-4" />
              AI Settings
            </Button>
            <Button variant="secondary" size="sm">
              <Shield className="mr-2 h-4 w-4" />
              Guidelines
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-white/60">Pending Review</p>
              <p className="mt-2 text-2xl font-light text-white">{moderationStats.pendingReview}</p>
              <p className="mt-1 text-xs text-warning">Needs attention</p>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-white/60">Reviewed Today</p>
              <p className="mt-2 text-2xl font-light text-white">{moderationStats.reviewedToday}</p>
              <p className="mt-1 text-xs text-success">On track</p>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-white/60">Auto-Resolved</p>
              <p className="mt-2 text-2xl font-light text-white">{moderationStats.autoResolved}</p>
              <p className="mt-1 text-xs text-success">67% of total</p>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-white/60">Escalated</p>
              <p className="mt-2 text-2xl font-light text-white">{moderationStats.escalated}</p>
              <p className="mt-1 text-xs text-destructive">Requires admin</p>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-white/60">Avg Review Time</p>
              <p className="mt-2 text-2xl font-light text-white">{moderationStats.avgReviewTime}</p>
              <p className="mt-1 text-xs text-success">-30s from last week</p>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-white/60">AI Accuracy</p>
              <p className="mt-2 text-2xl font-light text-white">{moderationStats.accuracyRate}%</p>
              <p className="mt-1 text-xs text-success">+2% this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Content Review Section */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Flagged Content List */}
          <div className="lg:col-span-1">
            <Card className="h-[600px]">
              <CardHeader className="border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">Flagged Content</h3>
                  <Button variant="ghost" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-3 flex gap-1 rounded-lg bg-white/[0.03] p-1">
                  {["all", "high", "medium", "low"].map((severity) => (
                    <button
                      key={severity}
                      onClick={() => setFilterSeverity(severity)}
                      className={`flex-1 rounded px-2 py-1 text-xs capitalize transition-all ${
                        filterSeverity === severity
                          ? "bg-white/10 text-white"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      {severity}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="overflow-y-auto p-0" style={{ height: "calc(100% - 120px)" }}>
                <div className="divide-y divide-white/5">
                  {filteredContent.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedContent(item)}
                      className={`w-full p-4 text-left transition-colors hover:bg-white/[0.02] ${
                        selectedContent?.id === item.id ? "bg-white/[0.03]" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            item.severity === "high" ? "bg-destructive/20 text-destructive" :
                            item.severity === "medium" ? "bg-warning/20 text-warning" :
                            "bg-white/10 text-white/60"
                          }`}>
                            <Flag className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-white">{item.flagReason}</p>
                            <p className="text-xs text-white/60">{item.context} • {item.type}</p>
                          </div>
                        </div>
                        {item.status === "pending" && (
                          <span className="rounded-full bg-warning/20 px-2 py-1 text-xs text-warning">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs text-white/40">{item.content}</p>
                      <p className="mt-2 text-xs text-white/40">{item.timestamp}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Details */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader className="border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Content Review</h3>
                    <p className="mt-1 text-sm text-white/60">
                      {selectedContent.id} • Flagged by {selectedContent.flaggedBy}
                    </p>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-sm ${
                    selectedContent.severity === "high" ? "bg-destructive/20 text-destructive" :
                    selectedContent.severity === "medium" ? "bg-warning/20 text-warning" :
                    "bg-white/10 text-white/60"
                  }`}>
                    {selectedContent.severity} severity
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* User Info */}
                <Card className="mb-6 border-white/10 bg-white/[0.02]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-lg font-medium text-white">
                          {selectedContent.author.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-white">{selectedContent.author.name}</p>
                          <div className="mt-1 flex items-center gap-3 text-xs text-white/60">
                            <span>ID: {selectedContent.author.id}</span>
                            <span>{selectedContent.author.daysClean} days clean</span>
                            {selectedContent.author.previousFlags > 0 && (
                              <span className="text-warning">
                                {selectedContent.author.previousFlags} previous flags
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Content Display */}
                <div className="mb-6 rounded-lg bg-white/[0.03] p-6">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-white">
                      {selectedContent.type.charAt(0).toUpperCase() + selectedContent.type.slice(1)} Content
                    </span>
                    <span className="text-xs text-white/40">{selectedContent.context}</span>
                  </div>
                  <p className="text-white">{selectedContent.content}</p>
                </div>

                {/* Flag Details */}
                <div className="mb-6 space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-white/[0.03] p-3">
                    <span className="text-sm text-white/60">Flag Reason</span>
                    <span className="text-sm text-white">{selectedContent.flagReason}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/[0.03] p-3">
                    <span className="text-sm text-white/60">Flagged By</span>
                    <span className="text-sm text-white">{selectedContent.flaggedBy}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/[0.03] p-3">
                    <span className="text-sm text-white/60">Timestamp</span>
                    <span className="text-sm text-white">{selectedContent.timestamp}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedContent.status === "pending" && (
                  <div className="flex gap-3">
                    <Button
                      variant="success"
                      className="flex-1"
                      onClick={() => handleAction("approve")}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleAction("remove")}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => handleAction("escalate")}
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Escalate
                    </Button>
                  </div>
                )}

                {selectedContent.status === "reviewed" && (
                  <div className="rounded-lg bg-white/[0.03] p-4">
                    <p className="text-sm text-white/60">
                      This content was {selectedContent.action} on {selectedContent.timestamp}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Report Analytics & Banned Users */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Report Trends */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Report Trends</h3>
              <p className="text-sm text-white/60">Common reasons for content flags</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportReasons.map((report) => (
                  <div key={report.reason} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-sm text-white">{report.reason}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-white/60">{report.count} reports</span>
                      <div className={`flex items-center gap-1 text-xs ${
                        report.trend === "up" ? "text-destructive" :
                        report.trend === "down" ? "text-success" :
                        "text-white/40"
                      }`}>
                        {report.trend === "up" && <TrendingUp className="h-3 w-3 rotate-0" />}
                        {report.trend === "down" && <TrendingUp className="h-3 w-3 rotate-180" />}
                        {report.trend}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-lg bg-white/[0.03] p-4">
                <p className="text-sm text-white/60">
                  AI detection has prevented <span className="text-white">84%</span> of harmful content 
                  from being posted this month.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Banned Users */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Banned Users</h3>
                <Button variant="ghost" size="sm">
                  <UserX className="mr-2 h-4 w-4" />
                  Ban User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bannedUsers.map((user) => (
                  <div key={user.id} className="rounded-lg bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-white/60">{user.email}</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs ${
                        user.banDuration === "Permanent" 
                          ? "bg-destructive/20 text-destructive"
                          : "bg-warning/20 text-warning"
                      }`}>
                        {user.banDuration}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-white/40">
                      <p>Reason: {user.banReason}</p>
                      <p>Banned on: {user.banDate}</p>
                      <p>Previous violations: {user.previousViolations}</p>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button variant="ghost" size="xs">
                        Review
                      </Button>
                      <Button variant="ghost" size="xs">
                        Appeal
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 