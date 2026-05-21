"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  Eye,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  Shield,
  Calendar,
  ArrowUpDown,
  Grid,
  List,
  Loader2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

interface Case {
  _id: string;
  caseId: string;
  status: string;
  priority: string;
  createdAt: string;
  incidentType: string;
  isAnonymous: boolean;
  assignment?: {
    committee?: string;
    members?: string[];
  };
}

export default function CasesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  useEffect(() => {
    fetchCases();
  }, [statusFilter, priorityFilter, pagination.page]);

  async function fetchCases() {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(pagination.page), limit: "20" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (priorityFilter !== "all") params.set("priority", priorityFilter);
      const res = await fetch(`/api/admin/cases?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCases(data.cases || []);
        setPagination((prev) => ({ ...prev, totalPages: data.pagination?.totalPages || 1, total: data.pagination?.total || 0 }));
      }
    } catch (err) {
      console.error("Failed to fetch cases:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredCases = cases.filter((c) => {
    const matchesSearch = c.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.incidentType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  function getDaysOpen(createdAt: string) {
    return Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft": return <Badge variant="default">Draft</Badge>;
      case "submitted": return <Badge variant="info">Submitted</Badge>;
      case "acknowledged": return <Badge variant="info">Acknowledged</Badge>;
      case "under_review": return <Badge variant="warning">Under Review</Badge>;
      case "investigation": return <Badge variant="warning">Investigation</Badge>;
      case "hearing_scheduled": return <Badge variant="warning">Hearing Scheduled</Badge>;
      case "hearing_completed": return <Badge variant="warning">Hearing Done</Badge>;
      case "resolved": return <Badge variant="success">Resolved</Badge>;
      case "closed": return <Badge variant="default">Closed</Badge>;
      case "escalated": return <Badge variant="error">Escalated</Badge>;
      case "appealed": return <Badge variant="error">Appealed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case "high": case "critical": return <span className="w-2 h-2 rounded-full bg-error" />;
      case "medium": return <span className="w-2 h-2 rounded-full bg-warning" />;
      case "low": return <span className="w-2 h-2 rounded-full bg-gray-400" />;
      default: return null;
    }
  };

  if (loading && cases.length === 0) {
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary-600" />
            Case Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage all reported cases
          </p>
        </div>
        <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
          Export Cases
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "All Cases", value: pagination.total, color: "bg-gray-100 text-gray-600", filterVal: "all" },
          { label: "New", value: cases.filter(c => c.status === "submitted").length, color: "bg-blue-100 text-blue-600", filterVal: "submitted" },
          { label: "Under Review", value: cases.filter(c => c.status === "under_review").length, color: "bg-yellow-100 text-yellow-600", filterVal: "under_review" },
          { label: "Resolved", value: cases.filter(c => c.status === "resolved").length, color: "bg-green-100 text-green-600", filterVal: "resolved" },
          { label: "Escalated", value: cases.filter(c => c.status === "escalated").length, color: "bg-red-100 text-red-600", filterVal: "escalated" },
        ].map((stat, i) => (
          <button
            key={i}
            onClick={() => setStatusFilter(stat.filterVal)}
            className={cn(
              "p-4 rounded-xl text-left transition-all",
              stat.color,
              statusFilter === stat.filterVal ? "ring-2 ring-primary-500" : "hover:opacity-80"
            )}
          >
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm opacity-70">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <Input
              placeholder="Search by case ID or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
            />
          </div>
          <Select
            options={[
              { value: "all", label: "All Status" },
              { value: "submitted", label: "Submitted" },
              { value: "under_review", label: "Under Review" },
              { value: "investigation", label: "Investigation" },
              { value: "hearing_scheduled", label: "Hearing Scheduled" },
              { value: "resolved", label: "Resolved" },
              { value: "escalated", label: "Escalated" },
              { value: "closed", label: "Closed" },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-44"
          />
          <Select
            options={[
              { value: "all", label: "All Priority" },
              { value: "high", label: "High" },
              { value: "medium", label: "Medium" },
              { value: "low", label: "Low" },
            ]}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-36"
          />
          <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "p-2 rounded-lg transition-colors",
                viewMode === "table"
                  ? "bg-primary-100 text-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={cn(
                "p-2 rounded-lg transition-colors",
                viewMode === "cards"
                  ? "bg-primary-100 text-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Grid className="w-5 h-5" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Cases Table/Grid */}
      {viewMode === "table" ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-4 font-medium text-gray-500 text-sm">
                    <button className="flex items-center gap-1 hover:text-gray-700">
                      Case ID <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-left py-4 px-4 font-medium text-gray-500 text-sm">Category</th>
                  <th className="text-left py-4 px-4 font-medium text-gray-500 text-sm">Status</th>
                  <th className="text-left py-4 px-4 font-medium text-gray-500 text-sm">Priority</th>
                  <th className="text-left py-4 px-4 font-medium text-gray-500 text-sm">Assigned To</th>
                  <th className="text-left py-4 px-4 font-medium text-gray-500 text-sm">Submitted</th>
                  <th className="text-left py-4 px-4 font-medium text-gray-500 text-sm">Days Open</th>
                  <th className="text-right py-4 px-4 font-medium text-gray-500 text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((caseItem) => (
                  <tr
                    key={caseItem._id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          {caseItem.isAnonymous ? (
                            <Shield className="w-4 h-4 text-gray-500" />
                          ) : (
                            <Avatar name="User" size="xs" />
                          )}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {caseItem.caseId}
                          </span>
                          {caseItem.isAnonymous && (
                            <Badge variant="secondary" size="sm" className="ml-2">
                              Anonymous
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                      {caseItem.incidentType}
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(caseItem.status)}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {getPriorityDot(caseItem.priority)}
                        <span className="capitalize text-sm">{caseItem.priority}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-400 text-sm">
                        {caseItem.assignment?.committee ? "Assigned" : "Unassigned"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-sm">
                      {new Date(caseItem.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant={getDaysOpen(caseItem.createdAt) > 3 ? "error" : getDaysOpen(caseItem.createdAt) > 1 ? "warning" : "success"}
                        size="sm"
                      >
                        {getDaysOpen(caseItem.createdAt)} days
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link href={`/admin/cases/${caseItem._id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCases.map((caseItem) => (
            <Link key={caseItem._id} href={`/admin/cases/${caseItem._id}`}>
              <Card hover className="h-full">
                <CardContent>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getPriorityDot(caseItem.priority)}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {caseItem.caseId}
                      </span>
                    </div>
                    {getStatusBadge(caseItem.status)}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      {caseItem.isAnonymous ? (
                        <Shield className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Avatar name="User" size="xs" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {caseItem.isAnonymous ? "Anonymous" : "Identified User"}
                      </p>
                      <p className="text-xs text-gray-500">{caseItem.incidentType}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(caseItem.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {getDaysOpen(caseItem.createdAt)}d
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {filteredCases.length} of {pagination.total} cases
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
