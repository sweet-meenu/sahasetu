"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Users,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  MoreVertical,
  Filter,
  Download,
  Bell,
  Shield,
  Activity,
  BarChart3,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface CaseItem {
  _id: string;
  caseId: string;
  status: string;
  priority: string;
  createdAt: string;
  incidentType: string;
  isAnonymous: boolean;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "new":
      return <Badge variant="info">New</Badge>;
    case "in-progress":
      return <Badge variant="warning">In Progress</Badge>;
    case "awaiting-response":
      return <Badge variant="secondary">Awaiting Response</Badge>;
    case "resolved":
      return <Badge variant="success">Resolved</Badge>;
    case "closed":
      return <Badge variant="default">Closed</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "high":
      return (
        <span className="flex items-center gap-1 text-error text-sm">
          <AlertTriangle className="w-3 h-3" /> High
        </span>
      );
    case "medium":
      return <span className="text-warning text-sm">Medium</span>;
    case "low":
      return <span className="text-gray-500 text-sm">Low</span>;
    default:
      return priority;
  }
};

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [adminStats, setAdminStats] = useState({ totalComplaints: 0, activeComplaints: 0, resolvedComplaints: 0, urgentComplaints: 0, totalUsers: 0, totalPartners: 0 });
  const [recentCases, setRecentCases] = useState<CaseItem[]>([]);
  const [auditLog, setAuditLog] = useState<{ action: string; details: string; createdAt: string; severity: string }[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      const [statsRes, casesRes, auditRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/cases?limit=5"),
        fetch("/api/admin/audit?limit=5"),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setAdminStats(data.stats || {});
      }
      if (casesRes.ok) {
        const data = await casesRes.json();
        setRecentCases(data.cases || []);
      }
      if (auditRes.ok) {
        const data = await auditRes.json();
        setAuditLog(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    } finally {
      setLoading(false);
    }
  }

  const stats = [
    {
      label: "Total Cases",
      value: adminStats.totalComplaints,
      icon: FileText,
      color: "text-primary-600 bg-primary-100",
    },
    {
      label: "Active Cases",
      value: adminStats.activeComplaints,
      icon: Clock,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Resolved",
      value: adminStats.resolvedComplaints,
      icon: CheckCircle,
      color: "text-success bg-success/10",
    },
    {
      label: "Urgent",
      value: adminStats.urgentComplaints,
      icon: AlertTriangle,
      color: "text-error bg-error/10",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(" ")[0] || "Admin"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here&apos;s what&apos;s happening with your cases today
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            leftIcon={<Download className="w-4 h-4" />}
            onClick={() => { window.location.href = '/api/admin/reports/export'; }}
          >
            Export Report
          </Button>
          <Button 
            leftIcon={<BarChart3 className="w-4 h-4" />}
            onClick={() => router.push('/admin/reports')}
          >
            View Analytics
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent>
              <div className="flex items-start justify-between">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.color)}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Cases */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Cases</CardTitle>
                <CardDescription>Latest cases requiring attention</CardDescription>
              </div>
              <Link href="/admin/cases">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentCases.length === 0 ? (
                  <p className="py-8 text-center text-gray-500">No cases yet</p>
                ) : recentCases.map((caseItem) => (
                  <Link
                    key={caseItem._id}
                    href={`/admin/cases/${caseItem._id}`}
                    className="flex items-center justify-between py-4 hover:bg-gray-50 dark:hover:bg-gray-800 -mx-4 px-4 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        {caseItem.isAnonymous ? (
                          <Shield className="w-5 h-5 text-gray-500" />
                        ) : (
                          <Avatar name="User" size="sm" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {caseItem.caseId}
                          </span>
                          {caseItem.isAnonymous && (
                            <Badge variant="secondary" size="sm">
                              Anonymous
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{caseItem.incidentType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <div className="mb-1">{getStatusBadge(caseItem.status)}</div>
                        <div>{getPriorityBadge(caseItem.priority)}</div>
                      </div>
                      <span className="text-sm text-gray-500 hidden md:block">
                        {new Date(caseItem.createdAt).toLocaleDateString()}
                      </span>
                      <Eye className="w-5 h-5 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Urgent Alert */}
          <Card className="bg-error/5 border-error/20">
            <CardContent>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-error/10 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-error" />
                </div>
                <div>
                  <p className="font-semibold text-error">Urgent Cases</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Require immediate attention
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {recentCases.filter(c => c.priority === "high").slice(0, 3).map((c) => (
                  <Link
                    key={c._id}
                    href={`/admin/cases/${c._id}`}
                    className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg hover:shadow transition-shadow"
                  >
                    <span className="text-sm font-medium">{c.caseId}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                ))}
                {recentCases.filter(c => c.priority === "high").length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-2">No urgent cases</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Hearings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                Upcoming Hearings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentCases.filter(c => c.status === "hearing_scheduled").length > 0 ? (
                  recentCases.filter(c => c.status === "hearing_scheduled").slice(0, 3).map((c, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {c.caseId}
                        </p>
                        <p className="text-xs text-gray-500">{c.incidentType}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No upcoming hearings</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLog.length > 0 ? auditLog.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full mt-2",
                        activity.severity === "high"
                          ? "bg-error"
                          : activity.severity === "medium"
                          ? "bg-warning"
                          : "bg-info"
                      )}
                    />
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.details} • {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
