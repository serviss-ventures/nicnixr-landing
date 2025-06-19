"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Shield, UserPlus, Mail, MoreVertical, Trash2, Edit } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AdminUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
  last_login?: string;
}

export default function AdminPermissionsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([
    {
      id: "1",
      email: "admin@nixrapp.com",
      role: "Super Admin",
      created_at: "2025-01-01T00:00:00Z",
      last_login: new Date().toISOString(),
    }
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [newAdmin, setNewAdmin] = useState({
    email: "",
    role: "Admin",
  });

  const roles = [
    { value: "Super Admin", description: "Full access to all features" },
    { value: "Admin", description: "Access to most features except critical settings" },
    { value: "Moderator", description: "Can moderate content and manage users" },
    { value: "Support", description: "Can view users and respond to support tickets" },
  ];

  const handleAddAdmin = async () => {
    if (!newAdmin.email) {
      alert("Please enter an email address");
      return;
    }

    // In production, this would create via API
    const tempAdmin: AdminUser = {
      id: Date.now().toString(),
      email: newAdmin.email,
      role: newAdmin.role,
      created_at: new Date().toISOString(),
    };

    setAdmins([...admins, tempAdmin]);
    setNewAdmin({ email: "", role: "Admin" });
    setShowAddModal(false);
    alert("Admin user added successfully!");
  };

  const handleDeleteAdmin = (id: string) => {
    if (id === "1") {
      alert("Cannot delete the primary admin account");
      return;
    }

    if (confirm("Are you sure you want to remove this admin?")) {
      setAdmins(admins.filter(admin => admin.id !== id));
    }
  };

  const handleEditAdmin = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setShowEditModal(true);
  };

  const handleUpdateAdmin = () => {
    if (!editingAdmin) return;

    setAdmins(admins.map(admin => 
      admin.id === editingAdmin.id 
        ? { ...admin, role: editingAdmin.role }
        : admin
    ));
    
    setShowEditModal(false);
    setEditingAdmin(null);
    alert("Admin role updated successfully!");
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-white">Admin Permissions</h1>
            <p className="mt-2 text-white/60">
              Manage admin users and their access levels
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            <UserPlus className="h-4 w-4" />
            Add Admin
          </button>
        </div>

        {/* Roles Overview */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          {roles.map((role) => (
            <Card key={role.value} className="bg-white/[0.03]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-white">{role.value}</p>
                    <p className="text-xs text-white/60">{role.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Admin Users Table */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-white">Admin Users</h3>
            <p className="text-sm text-white/60">
              {admins.length} admin{admins.length !== 1 ? 's' : ''} with access
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                      Added
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                      Last Login
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.08]">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-white/40" />
                          <span className="text-sm text-white">{admin.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          <Shield className="h-3 w-3" />
                          {admin.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-white/60">
                          {new Date(admin.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-white/60">
                          {admin.last_login 
                            ? new Date(admin.last_login).toLocaleString()
                            : 'Never'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEditAdmin(admin)}
                            className="rounded p-1 hover:bg-white/[0.06]"
                            title="Edit role"
                          >
                            <Edit className="h-4 w-4 text-white/40 hover:text-white" />
                          </button>
                          <button 
                            onClick={() => handleDeleteAdmin(admin.id)}
                            className="rounded p-1 hover:bg-white/[0.06]"
                            title="Remove admin"
                          >
                            <Trash2 className="h-4 w-4 text-white/40 hover:text-destructive" />
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

        {/* Add Admin Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-md">
              <CardHeader>
                <h3 className="text-lg font-medium text-white">Add New Admin</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    placeholder="admin@example.com"
                    className="w-full rounded-lg bg-white/[0.06] border border-white/[0.08] py-2 px-4 text-sm text-white placeholder-white/40 focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Role
                  </label>
                  <select
                    value={newAdmin.role}
                    onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                    className="w-full rounded-lg bg-white/[0.06] border border-white/[0.08] py-2 px-4 text-sm text-white focus:border-primary focus:outline-none"
                  >
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.value}
                      </option>
                    ))}
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
                    onClick={handleAddAdmin}
                    className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                  >
                    Add Admin
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Admin Modal */}
        {showEditModal && editingAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-md">
              <CardHeader>
                <h3 className="text-lg font-medium text-white">Edit Admin Role</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editingAdmin.email}
                    disabled
                    className="w-full rounded-lg bg-white/[0.03] border border-white/[0.08] py-2 px-4 text-sm text-white/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Role
                  </label>
                  <select
                    value={editingAdmin.role}
                    onChange={(e) => setEditingAdmin({ ...editingAdmin, role: e.target.value })}
                    className="w-full rounded-lg bg-white/[0.06] border border-white/[0.08] py-2 px-4 text-sm text-white focus:border-primary focus:outline-none"
                  >
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.value}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingAdmin(null);
                    }}
                    className="flex-1 rounded-lg bg-white/[0.06] border border-white/[0.08] px-4 py-2 text-sm text-white/60 hover:bg-white/[0.08] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateAdmin}
                    className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                  >
                    Update Role
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