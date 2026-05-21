"use client";

import { useState, useEffect } from "react";
import {
  ClipboardList,
  Search,
  Download,
  User,
  FileText,
  Shield,
  AlertTriangle,
  Settings,
  LogIn,
  LogOut,
  Upload,
  Loader2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface DBUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface IAuditLog {
  _id: string;
  userId?: DBUser;
  userEmail?: string;
  userRole?: string;
  action: string;
  entityType: 'user' | 'complaint' | 'evidence' | 'counseling' | 'partner' | 'committee' | 'system';
  entityId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  severity: 'info' | 'warning' | 'critical';
  createdAt: string;
}

const getActionIcon = (category: string) => {
  switch (category) {
    case "auth":
      return LogIn;
    case "case":
      return FileText;
    case "evidence":
      return Upload;
    case "user":
      return User;
    case "settings":
      return Settings;
    case "system":
      return Shield;
    default:
      return ClipboardList;
  }
};

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case "critical":
      return <Badge variant="error" size="sm">Critical</Badge>;
    case "warning":
      return <Badge variant="warning" size="sm">Warning</Badge>;
    default:
      return <Badge variant="secondary" size="sm">Info</Badge>;
  }
};

const getCategoryBadge = (category: string) => {
  switch (category) {
    case "auth":
      return <Badge className="bg-blue-100 text-blue-700" size="sm">Auth</Badge>;
    case "case":
      return <Badge className="bg-purple-100 text-purple-700" size="sm">Case</Badge>;
    case "evidence":
      return <Badge className="bg-green-100 text-green-700" size="sm">Evidence</Badge>;
    case "user":
      return <Badge className="bg-yellow-100 text-yellow-700" size="sm">User</Badge>;
    case "settings":
      return <Badge className="bg-gray-100 text-gray-700" size="sm">Settings</Badge>;
    case "system":
      return <Badge className="bg-primary-100 text-primary-700" size="sm">System</Badge>;
    default:
      return <Badge size="sm">{category}</Badge>;
  }
};

const formatActionName = (action: string) => {
  if (!action) return "";
  return action
    .split(".")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .replace(/_/g, " ");
};

const mapEntityTypeToCategory = (entityType: string): "auth" | "case" | "evidence" | "user" | "settings" | "system" => {
  switch (entityType) {
    case "complaint":
      return "case";
    case "user":
      return "user";
    case "evidence":
      return "evidence";
    case "counseling":
    case "partner":
    case "committee":
      return "settings";
    default:
      return "system";
  }
};

export default function AuditPage() {
  const [logs, setLogs] = useState<IAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        let url = `/api/admin/audit?limit=250`;
        if (severityFilter !== "all") {
          url += `&severity=${severityFilter}`;
        }
        if (categoryFilter !== "all") {
          let entityType = categoryFilter;
          if (categoryFilter === "case") entityType = "complaint";
          url += `&entityType=${entityType}`;
        }
        
        const now = new Date();
        if (dateRange === "today") {
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          url += `&startDate=${today.toISOString()}`;
        } else if (dateRange === "week") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          url += `&startDate=${weekAgo.toISOString()}`;
        } else if (dateRange === "month") {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          url += `&startDate=${monthAgo.toISOString()}`;
        }

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
        }
      } catch (err) {
        console.error("Error fetching audit logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [categoryFilter, severityFilter, dateRange]);

  const filteredLogs = logs.filter((log) => {
    const actionLabel = formatActionName(log.action);
    const userName = log.userId?.name || log.userEmail || "System";
    const userRole = log.userId?.role || log.userRole || "System";
    
    const matchesSearch =
      actionLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (log.ipAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      
    return matchesSearch;
  });

  const totalCount = logs.length;
  const caseCount = logs.filter(l => l.entityType === "complaint").length;
  const authCount = logs.filter(l => l.action?.includes("login") || l.action?.includes("logout")).length;
  const criticalCount = logs.filter(l => l.severity === "critical").length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-primary-600" />
            Audit Log
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track all system activities and access logs in real-time
          </p>
        </div>
        <Button 
          variant="outline" 
          leftIcon={<Download className="w-4 h-4" />}
          onClick={() => { window.location.href = '/api/admin/reports/export'; }}
        >
          Export Logs
        </Button>
      </div>

      {/* Security Alert */}
      {logs.some(l => l.severity === "critical") && (
        <Card className="bg-error/5 border-error/20">
          <CardContent className="flex items-center gap-4">
            <div className="w-10 h-10 bg-error/10 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-error" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-error">Security Alert</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Critical security events detected. Please review immediately.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: totalCount, icon: ClipboardList, color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300" },
          { label: "Case Activities", value: caseCount, icon: FileText, color: "bg-purple-100 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400" },
          { label: "Auth Events", value: authCount, icon: LogIn, color: "bg-blue-100 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400" },
          { label: "Critical", value: criticalCount, icon: AlertTriangle, color: "bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-400" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <Input
              placeholder="Search events, users, or IPs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
            />
          </div>
          <Select
            options={[
              { value: "all", label: "All Time" },
              { value: "today", label: "Today" },
              { value: "week", label: "This Week" },
              { value: "month", label: "This Month" },
            ]}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-36"
          />
          <Select
            options={[
              { value: "all", label: "All Categories" },
              { value: "auth", label: "Authentication" },
              { value: "case", label: "Case" },
              { value: "evidence", label: "Evidence" },
              { value: "user", label: "User" },
              { value: "settings", label: "Settings" },
            ]}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-44"
          />
          <Select
            options={[
              { value: "all", label: "All Severity" },
              { value: "info", label: "Info" },
              { value: "warning", label: "Warning" },
              { value: "critical", label: "Critical" },
            ]}
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-36"
          />
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
            <p className="text-sm text-gray-500">Retrieving system audit trails...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No audit events match your criteria</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredLogs.map((log) => {
              const category = mapEntityTypeToCategory(log.entityType);
              const ActionIcon = getActionIcon(category);
              const userName = log.userId?.name || log.userEmail || "System";
              const userRoleLabel = log.userId?.role || log.userRole || "System";

              return (
                <div
                  key={log._id}
                  className={cn(
                    "flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                    log.severity === "critical" && "bg-error/5"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    log.severity === "critical" ? "bg-error/10" :
                    log.severity === "warning" ? "bg-warning/10" : "bg-gray-100 dark:bg-gray-800"
                  )}>
                    <ActionIcon className={cn(
                      "w-5 h-5",
                      log.severity === "critical" ? "text-error" :
                      log.severity === "warning" ? "text-warning" : "text-gray-500"
                    )} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatActionName(log.action)}
                      </span>
                      {getCategoryBadge(category)}
                      {getSeverityBadge(log.severity)}
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {userName}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{userRoleLabel}</span>
                      {log.entityId && (
                        <>
                          <span>•</span>
                          <span className="text-primary-600">{log.entityId}</span>
                        </>
                      )}
                    </div>

                    {log.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-mono break-all">
                        {log.description}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">IP: {log.ipAddress || "System"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Pagination Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {filteredLogs.length} of {totalCount} events
        </p>
      </div>
    </div>
  );
}
