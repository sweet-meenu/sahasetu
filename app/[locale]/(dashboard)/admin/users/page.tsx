"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Shield,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  UserPlus,
  Download,
  Eye,
  Loader2,
  Lock,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin" | "partner" | "counselor" | "committee_member";
  status: "active" | "inactive" | "suspended";
  verified: boolean;
  joinedAt: string;
  lastActive: string;
  casesReported: number;
}

const getRoleBadge = (role: string) => {
  switch (role) {
    case "admin":
      return <Badge variant="error">Admin</Badge>;
    case "committee_member":
    case "icc":
      return <Badge variant="info">ICC Member</Badge>;
    case "partner":
      return <Badge variant="success">Partner</Badge>;
    default:
      return <Badge variant="secondary">User</Badge>;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge variant="success" size="sm">Active</Badge>;
    case "inactive":
      return <Badge variant="default" size="sm">Inactive</Badge>;
    case "suspended":
      return <Badge variant="error" size="sm">Suspended</Badge>;
    default:
      return <Badge size="sm">{status}</Badge>;
  }
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState("user");

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, searchQuery]);

  async function fetchUsers() {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (roleFilter !== "all") query.set("role", roleFilter);
      if (searchQuery) query.set("search", searchQuery);

      const res = await fetch(`/api/admin/users?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.users || []).map((u: any) => ({
          id: u._id,
          name: u.name,
          email: u.email,
          phone: u.phone || "Hidden",
          role: u.role,
          status: u.isActive ? "active" : "suspended",
          verified: u.isVerified,
          joinedAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A",
          lastActive: u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : "Never",
          casesReported: 0,
        }));
        setUsers(mapped);
      }
    } catch (e) {
      console.error("Failed to load admin users:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddUser() {
    if (!newName || !newEmail || !newRole) {
      alert("Name, email, and role are required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          phone: newPhone,
          role: newRole,
        }),
      });
      if (res.ok) {
        setNewName("");
        setNewEmail("");
        setNewPhone("");
        setNewRole("user");
        setShowAddModal(false);
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create user account.");
      }
    } catch (err) {
      console.error("Error creating user:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm("Are you sure you want to delete this user account permanently?")) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete user.");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  }

  async function handleToggleStatus(userId: string, currentStatus: string) {
    const isCurrentlyActive = currentStatus === "active";
    if (!confirm(`Are you sure you want to ${isCurrentlyActive ? 'SUSPEND' : 'ACTIVATE'} this user account?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isCurrentlyActive }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error("Error toggling user status:", err);
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-primary-600" />
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage users, ICC members, and Partner accounts securely
          </p>
        </div>
        <div className="flex gap-3">
          <Button leftIcon={<UserPlus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
            Add User
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: users.filter(u => u.role === "user").length, color: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300" },
          { label: "ICC Members", value: users.filter(u => (u.role as string) === "committee_member" || (u.role as string) === "icc").length, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
          { label: "Partners", value: users.filter(u => u.role === "partner").length, color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" },
          { label: "Suspended", value: users.filter(u => u.status === "suspended").length, color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" },
        ].map((stat, i) => (
          <div key={i} className={cn("p-4 rounded-xl border border-gray-100 dark:border-gray-800", stat.color)}>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm opacity-70">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
            />
          </div>
          <Select
            options={[
              { value: "all", label: "All Roles" },
              { value: "user", label: "Users" },
              { value: "committee_member", label: "ICC Members" },
              { value: "partner", label: "Partners" },
              { value: "admin", label: "Admins" },
            ]}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-48"
          />
          <Select
            options={[
              { value: "all", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "suspended", label: "Suspended" },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-40"
          />
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-4 font-medium text-gray-500 text-sm">User</th>
                  <th className="text-left py-4 px-4 font-medium text-gray-500 text-sm">Role</th>
                  <th className="text-left py-4 px-4 font-medium text-gray-500 text-sm">Status</th>
                  <th className="text-left py-4 px-4 font-medium text-gray-500 text-sm">Joined</th>
                  <th className="text-left py-4 px-4 font-medium text-gray-500 text-sm">Last Active</th>
                  <th className="text-right py-4 px-4 font-medium text-gray-500 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} size="sm" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {user.name}
                            </span>
                            {user.verified && (
                              <CheckCircle className="w-4 h-4 text-success" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">{getRoleBadge(user.role)}</td>
                    <td className="py-4 px-4">{getStatusBadge(user.status)}</td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-sm">
                      {user.joinedAt}
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-sm">
                      {user.lastActive}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(user.id, user.status)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          title="Toggle User Status"
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1 text-error hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No users found.
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New User"
        description="Create a new user or ICC member account"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Enter full name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="email@example.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <Input
            label="Phone Number (Optional)"
            placeholder="+91 98765 43210"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
          />
          <Select
            label="Role"
            options={[
              { value: "user", label: "User" },
              { value: "committee_member", label: "ICC Member" },
              { value: "partner", label: "Partner Representative" },
              { value: "admin", label: "Admin" },
            ]}
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
          />
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 cursor-pointer" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1 cursor-pointer" onClick={handleAddUser} disabled={submitting}>
              {submitting ? "Creating..." : "Create User"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
