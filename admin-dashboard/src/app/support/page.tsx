"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  MessageSquare,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  Filter,
  Search,
  Send,
  Phone,
  Mail,
  MoreVertical,
  TrendingUp,
  Bot,
  Zap,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";

// Mock data for support tickets
const supportTickets = [
  {
    id: "TKT-1234",
    user: {
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      avatar: "SJ",
      tier: "premium",
      daysClean: 45,
    },
    subject: "Can't access my journal entries",
    category: "Technical",
    priority: "high",
    status: "open",
    created: "2 hours ago",
    lastUpdate: "30 minutes ago",
    assignee: "Mike Chen",
    messages: 3,
  },
  {
    id: "TKT-1235",
    user: {
      name: "David Miller",
      email: "dmiller@email.com",
      avatar: "DM",
      tier: "free",
      daysClean: 12,
    },
    subject: "Buddy system match not working",
    category: "Feature Request",
    priority: "medium",
    status: "in-progress",
    created: "5 hours ago",
    lastUpdate: "1 hour ago",
    assignee: "Emily Rodriguez",
    messages: 5,
  },
  {
    id: "TKT-1236",
    user: {
      name: "Lisa Chen",
      email: "lchen@email.com",
      avatar: "LC",
      tier: "premium",
      daysClean: 180,
    },
    subject: "Billing issue with subscription",
    category: "Billing",
    priority: "high",
    status: "open",
    created: "1 day ago",
    lastUpdate: "4 hours ago",
    assignee: "Unassigned",
    messages: 2,
  },
  {
    id: "TKT-1237",
    user: {
      name: "Mark Thompson",
      email: "mthompson@email.com",
      avatar: "MT",
      tier: "free",
      daysClean: 3,
    },
    subject: "Need help with withdrawal symptoms",
    category: "Recovery Support",
    priority: "urgent",
    status: "open",
    created: "45 minutes ago",
    lastUpdate: "45 minutes ago",
    assignee: "AI Coach",
    messages: 1,
  },
];

const ticketStats = {
  open: 24,
  inProgress: 18,
  resolved: 156,
  avgResponseTime: "18m",
  avgResolutionTime: "2.4h",
  satisfactionScore: 4.6,
};

const automatedResponses = [
  {
    id: 1,
    trigger: "Password reset",
    response: "I can help you reset your password. Please check your email for reset instructions.",
    usage: 245,
    satisfaction: 92,
  },
  {
    id: 2,
    trigger: "Subscription questions",
    response: "Here's information about our subscription plans...",
    usage: 189,
    satisfaction: 88,
  },
  {
    id: 3,
    trigger: "App crash",
    response: "I'm sorry you're experiencing issues. Please try updating to the latest version.",
    usage: 156,
    satisfaction: 85,
  },
];

const responseTemplates = [
  { id: 1, name: "Welcome Message", category: "Onboarding" },
  { id: 2, name: "Technical Issue", category: "Support" },
  { id: 3, name: "Billing Inquiry", category: "Billing" },
  { id: 4, name: "Recovery Resources", category: "Recovery" },
  { id: 5, name: "Feature Request", category: "Product" },
];

export default function SupportPage() {
  const [selectedTicket, setSelectedTicket] = useState(supportTickets[0]);
  const [messageText, setMessageText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredTickets = filterStatus === "all" 
    ? supportTickets 
    : supportTickets.filter(t => t.status === filterStatus);

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-white">Support Center</h1>
            <p className="mt-2 text-white/60">
              Manage support tickets and user communications
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm">
              <Bot className="mr-2 h-4 w-4" />
              AI Assist
            </Button>
            <Button variant="primary" size="sm">
              <MessageSquare className="mr-2 h-4 w-4" />
              New Ticket
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-white/60">Open Tickets</p>
              <p className="mt-2 text-2xl font-light text-white">{ticketStats.open}</p>
              <p className="mt-1 text-xs text-destructive">+3 from yesterday</p>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-white/60">In Progress</p>
              <p className="mt-2 text-2xl font-light text-white">{ticketStats.inProgress}</p>
              <p className="mt-1 text-xs text-warning">2 overdue</p>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-white/60">Resolved Today</p>
              <p className="mt-2 text-2xl font-light text-white">12</p>
              <p className="mt-1 text-xs text-success">Above target</p>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-white/60">Avg Response</p>
              <p className="mt-2 text-2xl font-light text-white">{ticketStats.avgResponseTime}</p>
              <p className="mt-1 text-xs text-success">-5m from last week</p>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-white/60">Resolution Time</p>
              <p className="mt-2 text-2xl font-light text-white">{ticketStats.avgResolutionTime}</p>
              <p className="mt-1 text-xs text-warning">+15m from last week</p>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-white/60">Satisfaction</p>
              <p className="mt-2 text-2xl font-light text-white">{ticketStats.satisfactionScore}/5</p>
              <p className="mt-1 text-xs text-success">⭐⭐⭐⭐⭐</p>
            </CardContent>
          </Card>
        </div>

        {/* Ticket Management */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Ticket List */}
          <div className="lg:col-span-1">
            <Card className="h-[calc(100vh-24rem)]">
              <CardHeader className="border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">Tickets</h3>
                  <Button variant="ghost" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-3 flex gap-1 rounded-lg bg-white/[0.03] p-1">
                  {["all", "open", "in-progress", "resolved"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`flex-1 rounded px-2 py-1 text-xs capitalize transition-all ${
                        filterStatus === status
                          ? "bg-white/10 text-white"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="overflow-y-auto p-0" style={{ height: "calc(100% - 120px)" }}>
                <div className="divide-y divide-white/5">
                  {filteredTickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`w-full p-4 text-left transition-colors hover:bg-white/[0.02] ${
                        selectedTicket?.id === ticket.id ? "bg-white/[0.03]" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-white">
                            {ticket.user.avatar}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{ticket.user.name}</p>
                            <p className="text-xs text-white/60">{ticket.subject}</p>
                          </div>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-xs ${
                          ticket.priority === "urgent" ? "bg-destructive/20 text-destructive" :
                          ticket.priority === "high" ? "bg-warning/20 text-warning" :
                          "bg-white/10 text-white/60"
                        }`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-white/40">
                        <span>{ticket.created}</span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {ticket.messages}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ticket Details */}
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-24rem)]">
              <CardHeader className="border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-medium text-white">{selectedTicket.subject}</h3>
                      <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/60">
                        {selectedTicket.id}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-white/60">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {selectedTicket.user.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {selectedTicket.user.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {selectedTicket.created}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex h-[calc(100%-160px)] flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-4">
                    {/* User Info Card */}
                    <Card className="border-white/10 bg-white/[0.02]">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-lg font-medium text-white">
                              {selectedTicket.user.avatar}
                            </div>
                            <div>
                              <p className="font-medium text-white">{selectedTicket.user.name}</p>
                              <div className="mt-1 flex items-center gap-3 text-xs text-white/60">
                                <span className={`rounded-full px-2 py-0.5 ${
                                  selectedTicket.user.tier === "premium" 
                                    ? "bg-primary/20 text-primary" 
                                    : "bg-white/10 text-white/60"
                                }`}>
                                  {selectedTicket.user.tier}
                                </span>
                                <span>{selectedTicket.user.daysClean} days clean</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Mail className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Sample Messages */}
                    <div className="rounded-lg bg-white/[0.03] p-4">
                      <p className="text-sm text-white">
                        Hi, I've been using the app for about 45 days now and suddenly I can't access any of my journal entries. 
                        When I tap on the journal section, it just shows a blank screen. I've tried restarting the app but it's 
                        still not working. This is really frustrating as I use the journal feature daily.
                      </p>
                      <p className="mt-2 text-xs text-white/40">2 hours ago</p>
                    </div>

                    <div className="ml-12 rounded-lg bg-primary/10 p-4">
                      <p className="text-sm text-white">
                        Hi Sarah, I'm sorry to hear you're experiencing issues with the journal feature. Let me help you resolve 
                        this. First, can you tell me which version of the app you're using? You can find this in Settings → About.
                      </p>
                      <p className="mt-2 text-xs text-white/40">Mike Chen • 1 hour ago</p>
                    </div>

                    <div className="rounded-lg bg-white/[0.03] p-4">
                      <p className="text-sm text-white">
                        I'm using version 2.3.0 on iOS. I just checked and there's an update available. Should I update?
                      </p>
                      <p className="mt-2 text-xs text-white/40">30 minutes ago</p>
                    </div>
                  </div>
                </div>

                {/* Message Input */}
                <div className="border-t border-white/10 p-4">
                  <div className="flex gap-3">
                    <Button variant="ghost" size="sm">
                      <Zap className="h-4 w-4" />
                    </Button>
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type your response..."
                      className="flex-1 rounded-lg bg-white/[0.05] px-4 py-2 text-sm text-white placeholder-white/40 outline-none focus:bg-white/[0.08]"
                    />
                    <Button variant="primary" size="sm">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="xs">
                        Use Template
                      </Button>
                      <Button variant="ghost" size="xs">
                        Add Note
                      </Button>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span>Assigned to: {selectedTicket.assignee}</span>
                      <Button variant="ghost" size="xs">
                        Reassign
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Automation & Resources */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Automated Responses</h3>
              <p className="text-sm text-white/60">AI-powered response suggestions</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automatedResponses.map((response) => (
                  <div key={response.id} className="rounded-lg bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{response.trigger}</p>
                        <p className="mt-1 text-xs text-white/60">{response.response}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs text-white/40">
                      <span>Used {response.usage} times</span>
                      <span>{response.satisfaction}% satisfaction</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="secondary" size="sm" className="mt-4 w-full">
                Configure AI Responses
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-white">Response Templates</h3>
              <p className="text-sm text-white/60">Quick responses for common issues</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {responseTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between rounded-lg bg-white/[0.03] p-3"
                  >
                    <div>
                      <p className="text-sm text-white">{template.name}</p>
                      <p className="text-xs text-white/40">{template.category}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="xs">
                        Use
                      </Button>
                      <Button variant="ghost" size="xs">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="secondary" size="sm" className="mt-4 w-full">
                Create New Template
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 