"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Search, Filter, Download, Eye, Ban, MessageSquare, MoreVertical, RefreshCw } from "lucide-react";
import { getSubstanceDisplayName, getSubstanceIcon } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  display_name: string | null;
  nicotine_product?: {
    category: string;
  } | null;
  days_clean: number;
  journal_streak: number;
  last_active_at: string;
  created_at: string;
  subscription_status?: string;
  is_anonymous: boolean;
}

interface UserStats {
  totalUsers: number;
  activeToday: number;
  newThisWeek: number;
  atRisk: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    activeToday: 0,
    newThisWeek: 0,
    atRisk: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch users from Supabase
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch users with their latest data
      let query = supabase
        .from('users')
        .select(`
          id,
          email,
          username,
          full_name,
          display_name,
          nicotine_product,
          days_clean,
          journal_streak,
          last_active_at,
          created_at,
          subscription_status,
          is_anonymous
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
      }

      const { data: usersData, error } = await query;

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      setUsers(usersData || []);

      // Fetch user statistics
      await fetchUserStats();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Total users
      const { count: totalCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Active today (last_active_at is today)
      const { count: activeCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('last_active_at', today.toISOString());

      // New this week
      const { count: newCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      // At risk (no activity in 7+ days but were active before)
      const { count: atRiskCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .lt('last_active_at', weekAgo.toISOString())
        .gt('days_clean', 0);

      setUserStats({
        totalUsers: totalCount || 0,
        activeToday: activeCount || 0,
        newThisWeek: newCount || 0,
        atRisk: atRiskCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('users-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatusBadge = (user: User) => {
    if (user.is_anonymous) return { text: 'Anonymous', class: 'bg-white/10 text-white/60' };
    if (!user.last_active_at) return { text: 'Inactive', class: 'bg-warning/10 text-warning' };
    
    const lastActive = new Date(user.last_active_at);
    const daysSinceActive = Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceActive < 1) return { text: 'Active', class: 'bg-success/10 text-success' };
    if (daysSinceActive < 7) return { text: 'Recent', class: 'bg-primary/10 text-primary' };
    return { text: 'Inactive', class: 'bg-warning/10 text-warning' };
  };

  const getPlatform = (user: User) => {
    // In a real app, this would come from device tracking
    return user.is_anonymous ? 'Mobile' : 'Web/Mobile';
  };

  const exportUsers = () => {
    // Convert to CSV
    const headers = ['Email', 'Username', 'Name', 'Days Clean', 'Product', 'Last Active', 'Status'];
    const csvData = users.map(user => [
      user.email || 'N/A',
      user.username || 'N/A',
      user.full_name || 'N/A',
      user.days_clean || 0,
      user.nicotine_product?.category || 'N/A',
      user.last_active_at || 'Never',
      getStatusBadge(user).text
    ]);
    
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nixr-users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

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
                  placeholder="Search users by name, email, username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg bg-white/[0.06] border border-white/[0.08] py-2 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:border-primary focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button 
                  onClick={fetchUsers}
                  className="flex items-center gap-2 rounded-lg bg-white/[0.06] border border-white/[0.08] px-4 py-2 text-sm text-white/60 hover:bg-white/[0.08] hover:text-white"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button 
                  onClick={exportUsers}
                  className="flex items-center gap-2 rounded-lg bg-white/[0.06] border border-white/[0.08] px-4 py-2 text-sm text-white/60 hover:bg-white/[0.08] hover:text-white"
                >
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
            <p className="mt-1 text-2xl font-light text-white">
              {userStats.totalUsers.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.08] p-4">
            <p className="text-sm text-white/60">Active Today</p>
            <p className="mt-1 text-2xl font-light text-success">
              {userStats.activeToday.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.08] p-4">
            <p className="text-sm text-white/60">New This Week</p>
            <p className="mt-1 text-2xl font-light text-primary">
              {userStats.newThisWeek.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.08] p-4">
            <p className="text-sm text-white/60">At Risk</p>
            <p className="mt-1 text-2xl font-light text-warning">
              {userStats.atRisk.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-white">User Directory</h3>
            {users.length > 0 && (
              <p className="text-sm text-white/60">Showing {users.length} users</p>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : users.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-white/60">No users found</p>
              </div>
            ) : (
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
                    {users.map((user) => {
                      const status = getStatusBadge(user);
                      return (
                        <tr key={user.id} className="hover:bg-white/[0.02]">
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-white">
                                {user.display_name || user.full_name || user.username || 'Anonymous User'}
                              </p>
                              <p className="text-xs text-white/60">
                                {user.username ? `@${user.username}` : 'No username'}
                              </p>
                              <p className="text-xs text-white/40">
                                {user.is_anonymous ? 'Anonymous' : user.email || 'No email'}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {user.nicotine_product?.category && (
                                <>
                                  <span className="text-lg">{getSubstanceIcon(user.nicotine_product.category)}</span>
                                  <span className="text-sm text-white">{getSubstanceDisplayName(user.nicotine_product.category)}</span>
                                </>
                              )}
                              {!user.nicotine_product?.category && (
                                <span className="text-sm text-white/40">Not set</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm text-white">{user.days_clean || 0} days clean</p>
                              <p className="text-xs text-white/60">
                                {user.journal_streak || 0} day streak
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-white/60">
                              {user.last_active_at 
                                ? formatDistanceToNow(new Date(user.last_active_at), { addSuffix: true })
                                : 'Never active'}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-white/60">{getPlatform(user)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${status.class}`}>
                              {status.text}
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 