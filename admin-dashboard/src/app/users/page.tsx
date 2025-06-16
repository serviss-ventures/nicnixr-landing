"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Search, Filter, Download, Eye, Ban, MessageSquare, MoreVertical } from "lucide-react";
import { generateMockUsers } from "@/lib/mockData";
import { getSubstanceDisplayName, getSubstanceIcon } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

// Generate mock users
const users = generateMockUsers(10);

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
                      Product
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
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getSubstanceIcon(user.primarySubstance)}</span>
                          <span className="text-sm text-white">{getSubstanceDisplayName(user.primarySubstance)}</span>
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
                        <p className="text-sm text-white/60">
                          {formatDistanceToNow(new Date(user.lastActiveAt), { addSuffix: true })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-white/60">{user.platform}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            user.status === "ACTIVE"
                              ? "bg-success/10 text-success"
                              : user.status === "INACTIVE"
                              ? "bg-warning/10 text-warning"
                              : user.status === "SUSPENDED"
                              ? "bg-error/10 text-error"
                              : "bg-white/10 text-white/60"
                          }`}
                        >
                          {user.status.toLowerCase()}
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