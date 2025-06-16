"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Search, Filter, Download, Eye, Ban, MessageSquare, MoreVertical } from "lucide-react";

// Mock user data
const users = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    joinDate: "2024-01-15",
    daysClean: 127,
    lastActive: "2 hours ago",
    status: "active",
    platform: "iOS",
    journalStreak: 45,
  },
  {
    id: 2,
    name: "Mike Chen",
    email: "mike.chen@email.com",
    joinDate: "2024-02-20",
    daysClean: 89,
    lastActive: "5 minutes ago",
    status: "active",
    platform: "Android",
    journalStreak: 23,
  },
  {
    id: 3,
    name: "Emma Wilson",
    email: "emma.w@email.com",
    joinDate: "2024-03-10",
    daysClean: 45,
    lastActive: "1 day ago",
    status: "inactive",
    platform: "iOS",
    journalStreak: 2,
  },
  {
    id: 4,
    name: "David Park",
    email: "d.park@email.com",
    joinDate: "2024-01-28",
    daysClean: 112,
    lastActive: "3 hours ago",
    status: "active",
    platform: "Android",
    journalStreak: 67,
  },
];

export default function UsersPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-white">User Management</h1>
          <p className="mt-2 text-white/60">
            Monitor and manage your recovery community
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search users by name, email..."
                  className="w-full rounded-lg bg-white/[0.06] border border-white/[0.08] py-2 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:border-primary focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex items-center gap-2 rounded-lg bg-white/[0.06] border border-white/[0.08] px-4 py-2 text-sm text-white/60 hover:bg-white/[0.08] hover:text-white">
                  <Filter className="h-4 w-4" />
                  Filter
                </button>
                <button className="flex items-center gap-2 rounded-lg bg-white/[0.06] border border-white/[0.08] px-4 py-2 text-sm text-white/60 hover:bg-white/[0.08] hover:text-white">
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Stats Overview */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.08] p-4">
            <p className="text-sm text-white/60">Total Users</p>
            <p className="mt-1 text-2xl font-light text-white">5,624</p>
          </div>
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.08] p-4">
            <p className="text-sm text-white/60">Active Today</p>
            <p className="mt-1 text-2xl font-light text-success">3,421</p>
          </div>
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.08] p-4">
            <p className="text-sm text-white/60">New This Week</p>
            <p className="mt-1 text-2xl font-light text-primary">287</p>
          </div>
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.08] p-4">
            <p className="text-sm text-white/60">At Risk</p>
            <p className="mt-1 text-2xl font-light text-warning">142</p>
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-white">User Directory</h3>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                      Progress
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                      Activity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                      Platform
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.08]">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-white">{user.name}</p>
                          <p className="text-xs text-white/60">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-white">{user.daysClean} days clean</p>
                          <p className="text-xs text-white/60">
                            {user.journalStreak} day streak
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-white/60">{user.lastActive}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-white/60">{user.platform}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            user.status === "active"
                              ? "bg-success/10 text-success"
                              : "bg-warning/10 text-warning"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="rounded p-1 hover:bg-white/[0.06]">
                            <Eye className="h-4 w-4 text-white/40 hover:text-white" />
                          </button>
                          <button className="rounded p-1 hover:bg-white/[0.06]">
                            <MessageSquare className="h-4 w-4 text-white/40 hover:text-white" />
                          </button>
                          <button className="rounded p-1 hover:bg-white/[0.06]">
                            <MoreVertical className="h-4 w-4 text-white/40 hover:text-white" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 