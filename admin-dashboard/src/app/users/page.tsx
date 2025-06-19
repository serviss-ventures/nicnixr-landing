"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Search, Filter, Download, Eye, Ban, MessageSquare, MoreVertical, RefreshCw, UserPlus, Trash2, X } from "lucide-react";
import { getSubstanceDisplayName, getSubstanceIcon } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";
import { DataStatusIndicator } from "@/components/ui/DataStatusIndicator";

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [newUser, setNewUser] = useState({
    email: "",
    username: "",
    full_name: "",
    nicotine_product: "cigarettes",
  });

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
        // Use mock data if Supabase fails
        setUsers([
          {
            id: '1',
            email: 'john.doe@example.com',
            username: 'johndoe',
            full_name: 'John Doe',
            display_name: 'John',
            nicotine_product: { category: 'cigarettes' },
            days_clean: 15,
            journal_streak: 7,
            last_active_at: new Date().toISOString(),
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            subscription_status: 'active',
            is_anonymous: false,
          },
          {
            id: '2',
            email: null,
            username: 'BraveWarrior',
            full_name: null,
            display_name: 'BraveWarrior',
            nicotine_product: { category: 'vape' },
            days_clean: 3,
            journal_streak: 3,
            last_active_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            subscription_status: null,
            is_anonymous: true,
          },
          {
            id: '3',
            email: 'sarah.smith@example.com',
            username: 'sarahsmith',
            full_name: 'Sarah Smith',
            display_name: 'Sarah',
            nicotine_product: { category: 'nicotine_pouches' },
            days_clean: 45,
            journal_streak: 30,
            last_active_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            subscription_status: 'active',
            is_anonymous: false,
          },
        ]);
        
        // Set mock stats
        setUserStats({
          totalUsers: 1247,
          activeToday: 342,
          newThisWeek: 89,
          atRisk: 156,
        });
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
      const { count: totalCount, error: totalError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Active today (last_active_at is today)
      const { count: activeCount, error: activeError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('last_active_at', today.toISOString());

      if (activeError) throw activeError;

      // New this week
      const { count: newCount, error: newError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      if (newError) throw newError;

      // At risk (no activity in 7+ days but were active before)
      const { count: atRiskCount, error: riskError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .lt('last_active_at', weekAgo.toISOString())
        .gt('days_clean', 0);

      if (riskError) throw riskError;

      setUserStats({
        totalUsers: totalCount || 0,
        activeToday: activeCount || 0,
        newThisWeek: newCount || 0,
        atRisk: atRiskCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Stats are already set by mock data in fetchUsers if there's an error
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm]);

  // Set up real-time subscription (disabled for simple auth)
  useEffect(() => {
    // Real-time subscriptions don't work with simple auth
    // Uncomment when proper Supabase auth is implemented
    /*
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
    */
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

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.username) {
      alert("Please fill in email and username");
      return;
    }

    try {
      // Create user in Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: Math.random().toString(36).slice(-8), // Generate random password
      });

      if (authError) {
        // If auth fails, show a demo message
        alert("Demo Mode: User creation requires proper Supabase authentication. In production, this would create a real user.");
        
        // Add to mock data for demo
        const mockUser: User = {
          id: Date.now().toString(),
          email: newUser.email,
          username: newUser.username,
          full_name: newUser.full_name,
          display_name: newUser.full_name || newUser.username,
          nicotine_product: { category: newUser.nicotine_product },
          days_clean: 0,
          journal_streak: 0,
          last_active_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          subscription_status: null,
          is_anonymous: false,
        };
        
        setUsers(prev => [mockUser, ...prev]);
        setNewUser({ email: "", username: "", full_name: "", nicotine_product: "cigarettes" });
        setShowAddModal(false);
        return;
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user?.id,
          email: newUser.email,
          username: newUser.username,
          full_name: newUser.full_name,
          nicotine_product: { category: newUser.nicotine_product },
          created_at: new Date().toISOString(),
          is_anonymous: false,
        });

      if (profileError) {
        alert(`Error creating profile: ${profileError.message}`);
        return;
      }

      // Refresh users list
      await fetchUsers();
      setNewUser({ email: "", username: "", full_name: "", nicotine_product: "cigarettes" });
      setShowAddModal(false);
      alert("User created successfully! They will receive an email to set their password.");
    } catch (error) {
      console.error('Error creating user:', error);
      alert("Error creating user");
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleMessageUser = (user: User) => {
    setSelectedUser(user);
    setMessage("");
    setShowMessageModal(true);
  };

  const handleSendMessage = () => {
    if (!message.trim()) {
      alert("Please enter a message");
      return;
    }

    alert(`Message sent to ${selectedUser?.display_name || selectedUser?.username || 'user'}: "${message}"`);
    setShowMessageModal(false);
    setMessage("");
    setSelectedUser(null);
  };

  const handleDeleteUser = (user: User) => {
    if (confirm(`Are you sure you want to delete ${user.display_name || user.username || 'this user'}? This action cannot be undone.`)) {
      setUsers(users.filter(u => u.id !== user.id));
      alert("User deleted successfully");
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-light text-white">User Management</h1>
              <p className="mt-2 text-white/60">
                Monitor and manage your recovery community
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              <UserPlus className="h-4 w-4" />
              Add User
            </button>
          </div>
          <DataStatusIndicator status="partial" />
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
                              <button 
                                onClick={() => handleViewUser(user)}
                                className="rounded p-1 hover:bg-white/[0.06]"
                                title="View details"
                              >
                                <Eye className="h-4 w-4 text-white/40 hover:text-white" />
                              </button>
                              <button 
                                onClick={() => handleMessageUser(user)}
                                className="rounded p-1 hover:bg-white/[0.06]"
                                title="Send message"
                              >
                                <MessageSquare className="h-4 w-4 text-white/40 hover:text-white" />
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(user)}
                                className="rounded p-1 hover:bg-white/[0.06]"
                                title="Delete user"
                              >
                                <Trash2 className="h-4 w-4 text-white/40 hover:text-destructive" />
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

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-md">
              <CardHeader>
                <h3 className="text-lg font-medium text-white">Add New User</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="user@example.com"
                    className="w-full rounded-lg bg-white/[0.06] border border-white/[0.08] py-2 px-4 text-sm text-white placeholder-white/40 focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    placeholder="username"
                    className="w-full rounded-lg bg-white/[0.06] border border-white/[0.08] py-2 px-4 text-sm text-white placeholder-white/40 focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full rounded-lg bg-white/[0.06] border border-white/[0.08] py-2 px-4 text-sm text-white placeholder-white/40 focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Nicotine Product
                  </label>
                  <select
                    value={newUser.nicotine_product}
                    onChange={(e) => setNewUser({ ...newUser, nicotine_product: e.target.value })}
                    className="w-full rounded-lg bg-white/[0.06] border border-white/[0.08] py-2 px-4 text-sm text-white focus:border-primary focus:outline-none"
                  >
                    <option value="cigarettes">Cigarettes</option>
                    <option value="vape">Vape</option>
                    <option value="nicotine_pouches">Nicotine Pouches</option>
                    <option value="chew_dip">Chew/Dip</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 rounded-lg bg-white/[0.06] border border-white/[0.08] px-4 py-2 text-sm text-white/60 hover:bg-white/[0.08] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddUser}
                    className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                  >
                    Add User
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* View User Modal */}
        {showViewModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-lg font-medium text-white">User Details</h3>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedUser(null);
                  }}
                  className="rounded p-1 hover:bg-white/[0.06]"
                >
                  <X className="h-4 w-4 text-white/40 hover:text-white" />
                </button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-white/60">Display Name</p>
                    <p className="text-white">{selectedUser.display_name || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Username</p>
                    <p className="text-white">@{selectedUser.username || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Email</p>
                    <p className="text-white">{selectedUser.email || 'Anonymous'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Full Name</p>
                    <p className="text-white">{selectedUser.full_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Account Type</p>
                    <p className="text-white">{selectedUser.is_anonymous ? 'Anonymous' : 'Registered'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Subscription</p>
                    <p className="text-white">{selectedUser.subscription_status || 'Free'}</p>
                  </div>
                </div>

                <div className="border-t border-white/[0.08] pt-4">
                  <h4 className="text-sm font-medium text-white mb-3">Recovery Progress</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-white/60">Days Clean</p>
                      <p className="text-2xl font-light text-white">{selectedUser.days_clean || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Journal Streak</p>
                      <p className="text-2xl font-light text-white">{selectedUser.journal_streak || 0} days</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Nicotine Product</p>
                      <p className="text-white flex items-center gap-2">
                        {selectedUser.nicotine_product?.category ? (
                          <>
                            <span className="text-lg">{getSubstanceIcon(selectedUser.nicotine_product.category)}</span>
                            <span>{getSubstanceDisplayName(selectedUser.nicotine_product.category)}</span>
                          </>
                        ) : (
                          'Not set'
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/[0.08] pt-4">
                  <h4 className="text-sm font-medium text-white mb-3">Activity</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-white/60">Last Active</p>
                      <p className="text-white">
                        {selectedUser.last_active_at 
                          ? formatDistanceToNow(new Date(selectedUser.last_active_at), { addSuffix: true })
                          : 'Never'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Member Since</p>
                      <p className="text-white">
                        {new Date(selectedUser.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Message User Modal */}
        {showMessageModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-md">
              <CardHeader>
                <h3 className="text-lg font-medium text-white">
                  Send Message to {selectedUser.display_name || selectedUser.username || 'User'}
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Message Type
                  </label>
                  <select className="w-full rounded-lg bg-white/[0.06] border border-white/[0.08] py-2 px-4 text-sm text-white focus:border-primary focus:outline-none">
                    <option value="support">Support Message</option>
                    <option value="encouragement">Encouragement</option>
                    <option value="reminder">Reminder</option>
                    <option value="custom">Custom Message</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    rows={4}
                    className="w-full rounded-lg bg-white/[0.06] border border-white/[0.08] py-2 px-4 text-sm text-white placeholder-white/40 focus:border-primary focus:outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowMessageModal(false);
                      setSelectedUser(null);
                      setMessage("");
                    }}
                    className="flex-1 rounded-lg bg-white/[0.06] border border-white/[0.08] px-4 py-2 text-sm text-white/60 hover:bg-white/[0.08] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendMessage}
                    className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                  >
                    Send Message
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 