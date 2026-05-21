"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  FolderLock,
  MessageCircle,
  Building2,
  Settings,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Shield,
  Calendar,
  ArrowRight,
  Bell,
  Sparkles,
  Loader2,
  CircleDot,
  ArrowUpRight,
  MapPin,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { useAuth } from "@/contexts/AuthContext";

interface Complaint {
  _id: string;
  caseId: string;
  incidentType: string;
  incidentDate: string;
  location?: string;
  status: string;
  priority: string;
  timeline: Array<{ status: string; description: string; createdAt: string }>;
  createdAt: string;
  updatedAt: string;
}

interface EvidenceFile {
  _id: string;
  originalName: string;
  category: string;
  createdAt: string;
}

interface Session {
  _id: string;
  counselorId: { name: string } | null;
  type: string;
  status: string;
  scheduledAt: string;
}

const statusLabels: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  investigation: "Investigation",
  hearing_scheduled: "Hearing Scheduled",
  hearing_in_progress: "Hearing In Progress",
  resolution_pending: "Resolution Pending",
  resolved: "Resolved",
  closed: "Closed",
  appealed: "Appealed",
  escalated: "Escalated",
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  submitted: "bg-blue-100 text-blue-700",
  under_review: "bg-yellow-100 text-yellow-700",
  investigation: "bg-orange-100 text-orange-700",
  hearing_scheduled: "bg-purple-100 text-purple-700",
  hearing_in_progress: "bg-purple-200 text-purple-800",
  resolution_pending: "bg-cyan-100 text-cyan-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-200 text-gray-600",
  appealed: "bg-red-100 text-red-700",
  escalated: "bg-red-200 text-red-800",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [evidenceCount, setEvidenceCount] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const t = useTranslations("dashboard");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tReport = useTranslations("report");
  const tCounseling = useTranslations("counseling");
  const tEvidence = useTranslations("evidence");
  const tSupport = useTranslations("support");
  const tStatus = useTranslations("status");
  const tCases = useTranslations("cases");

  const formatStatus = (status: string) => {
    try {
      return tStatus(status);
    } catch {
      return statusLabels[status] || status;
    }
  };

  const formatLocation = (loc: string) => {
    if (!loc) return "";
    const key = loc.toLowerCase();
    try {
      return tCases(key);
    } catch {
      return loc;
    }
  };

  const formatIncidentType = (type: string) => {
    if (!type) return "";
    const key = type.toLowerCase();
    try {
      return tCases(key);
    } catch {
      return type.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
    }
  };

  const formatTimelineDescription = (desc: string) => {
    if (!desc) return "";
    
    if (desc === "Complaint drafted") {
      try { return tCases("draftedDesc"); } catch {}
    }
    if (desc === "Complaint submitted successfully") {
      try { return tCases("submittedDesc"); } catch {}
    }
    
    if (desc.startsWith("Status updated to ")) {
      const statusPart = desc.replace("Status updated to ", "").trim();
      const statusKey = Object.keys(statusLabels).find(key => statusLabels[key].toLowerCase() === statusPart.toLowerCase()) || statusPart;
      const translatedStatus = formatStatus(statusKey);
      try {
        return tCases("statusUpdatedDesc", { status: translatedStatus });
      } catch {}
    }

    const lowerDesc = desc.toLowerCase();
    if (lowerDesc === "high" || lowerDesc === "medium" || lowerDesc === "low") {
      try {
        return tCases(lowerDesc);
      } catch {}
    }

    return desc;
  };

  const formatNotificationTitle = (title: string) => {
    if (!title) return "";
    
    const createdMatch = title.match(/^Case\s+([\w-]+)\s+Created$/i);
    if (createdMatch) {
      try {
        return tCases("caseCreatedTitle", { caseId: createdMatch[1] });
      } catch {}
    }

    const updatedMatch = title.match(/^Case\s+([\w-]+)\s+Updated$/i);
    if (updatedMatch) {
      try {
        return tCases("caseUpdatedTitle", { caseId: updatedMatch[1] });
      } catch {}
    }

    if (title.toLowerCase() === "evidence file uploaded") {
      try {
        return tCases("evidenceUploadedTitle");
      } catch {}
    }

    return title;
  };

  const formatNotificationMessage = (message: string) => {
    if (!message) return "";

    if (message.toLowerCase() === "your complaint has been successfully registered.") {
      try { return tCases("caseCreatedMsg"); } catch {}
    }

    const statusMatch = message.match(/Your case status has been updated to "([^"]+)"/i);
    if (statusMatch) {
      const englishStatus = statusMatch[1];
      const statusKey = Object.keys(statusLabels).find(key => statusLabels[key].toLowerCase() === englishStatus.toLowerCase()) || englishStatus;
      const translatedStatus = formatStatus(statusKey);
      let translatedMsg = "";
      try {
        translatedMsg = tCases("caseUpdatedMsg", { status: translatedStatus });
      } catch {
        translatedMsg = `Your case status has been updated to "${translatedStatus}".`;
      }
      
      const noteMatch = message.match(/Note from reviewer:\s*(.+)$/i);
      if (noteMatch) {
        const note = noteMatch[1].trim();
        const lowerNote = note.toLowerCase();
        let translatedNote = note;
        if (lowerNote === "high" || lowerNote === "medium" || lowerNote === "low") {
          try {
            translatedNote = tCases(lowerNote);
          } catch {}
        }
        try {
          translatedMsg += " " + tCases("noteFromReviewer", { note: translatedNote });
        } catch {
          translatedMsg += ` Note from reviewer: ${translatedNote}`;
        }
      }
      return translatedMsg;
    }

    if (message.toLowerCase() === "new evidence file added to the case.") {
      try { return tCases("evidenceUploadedMsg"); } catch {}
    }

    return message;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [complaintsRes, evidenceRes, sessionsRes, notifRes] = await Promise.all([
          fetch("/api/complaints"),
          fetch("/api/evidence"),
          fetch("/api/counseling"),
          fetch("/api/notifications"),
        ]);

        if (complaintsRes.ok) {
          const data = await complaintsRes.json();
          setComplaints(data.complaints || []);
        }
        if (evidenceRes.ok) {
          const data = await evidenceRes.json();
          setEvidenceCount(data.files?.length || 0);
        }
        if (sessionsRes.ok) {
          const data = await sessionsRes.json();
          setSessions(data.sessions || []);
        }
        if (notifRes.ok) {
          const data = await notifRes.json();
          setNotifications(data.notifications || []);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeComplaints = complaints.filter((c) => !["draft", "resolved", "closed"].includes(c.status));
  const upcomingSessions = sessions.filter((s) => s.status === "scheduled");
  const totalReports = complaints.length;
  const pendingCount = complaints.filter((c) => c.status !== "draft" && c.status !== "resolved" && c.status !== "closed").length;
  const counselingHours = sessions.filter((s) => s.status === "completed").length * 0.75;

  const stats = [
    {
      label: t("totalReports"),
      value: String(totalReports),
      subtext: `${pendingCount} pending`,
      icon: FileText,
      color: "text-primary-600",
      bg: "bg-primary-100",
    },
    {
      label: tEvidence("title"),
      value: String(evidenceCount),
      subtext: tEvidence("encryptedStorage"),
      icon: FolderLock,
      color: "text-secondary-600",
      bg: "bg-secondary-100",
    },
    {
      label: tCounseling("title"),
      value: counselingHours.toFixed(1),
      subtext: tCounseling("certifiedCounselors"),
      icon: MessageCircle,
      color: "text-accent-600",
      bg: "bg-accent-100",
    },
    {
      label: t("activeCases"),
      value: String(activeComplaints.length),
      subtext: tCommon("loading"),
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
  ];

  const quickActions = [
    {
      title: t("newReport"),
      description: tReport("subtitle"),
      icon: Plus,
      href: "/dashboard/report",
      color: "bg-primary-600",
      textColor: "text-white",
    },
    {
      title: t("viewEvidence"),
      description: tEvidence("subtitle"),
      icon: FolderLock,
      href: "/dashboard/evidence",
      color: "bg-secondary-600",
      textColor: "text-white",
    },
    {
      title: t("bookCounseling"),
      description: tCounseling("subtitle"),
      icon: MessageCircle,
      href: "/dashboard/counseling",
      color: "bg-accent-600",
      textColor: "text-white",
    },
    {
      title: t("findPartner"),
      description: tNav("partners"),
      icon: Building2,
      href: "/dashboard/partners",
      color: "bg-blue-600",
      textColor: "text-white",
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
            {t("welcome")}, {user?.name?.split(" ")[0] || "User"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t("overview")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/report">
            <Button leftIcon={<Plus className="w-5 h-5" />}>
              {t("newReport")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Complaint Tracking (Top-most Prominent Tracking Panel) */}
      {complaints.length > 0 && (
        <Card className="border-primary-100 dark:border-primary-900 bg-white dark:bg-gray-800 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              {t("caseProgressDetails")}
            </CardTitle>
            <CardDescription>{t("caseProgressSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {complaints.slice(0, 3).map((complaint) => (
                <div key={complaint._id} className="border border-gray-100 dark:border-gray-700 rounded-xl p-5 bg-gray-50/50 dark:bg-gray-900/30">
                  {/* Case Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {complaint.caseId}
                        </h4>
                        <Badge className={statusColors[complaint.status]} size="sm">
                          {formatStatus(complaint.status)}
                        </Badge>
                      </div>
                       <p className="text-sm text-gray-500 mt-1">
                         {complaint.incidentType ? formatIncidentType(complaint.incidentType) : ""}
                         {complaint.location && (complaint.incidentType ? ` • ${formatLocation(complaint.location)}` : formatLocation(complaint.location))}
                         {complaint.incidentDate && ` • ${new Date(complaint.incidentDate).toLocaleDateString()}`}
                       </p>
                    </div>
                    <Link href={`/dashboard/report?id=${complaint._id}`}>
                      <Button variant="ghost" size="sm">
                        <ArrowUpRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>

                  {/* Timeline */}
                  {complaint.timeline && complaint.timeline.length > 0 && (
                    <div className="relative pl-6 space-y-3">
                      <div className="absolute left-2 top-1 bottom-1 w-0.5 bg-gray-200 dark:bg-gray-700" />
                      {complaint.timeline.slice(-4).map((entry, idx) => (
                        <div key={idx} className="relative flex items-start gap-3">
                          <div className={`absolute -left-4 w-3 h-3 rounded-full border-2 ${
                            idx === complaint.timeline.length - 1
                              ? "border-primary-600 bg-primary-600"
                              : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900"
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatStatus(entry.status)}
                              </p>
                              <span className="text-xs text-gray-400">
                                {new Date(entry.createdAt || (entry as any).created_at || new Date()).toLocaleDateString()}
                              </span>
                            </div>
                            {entry.description && (
                              <p className="text-xs text-gray-500 mt-0.5">{formatTimelineDescription(entry.description)}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {complaints.length > 3 && (
                <div className="text-center pt-2">
                  <Link href="/dashboard/report" className="text-sm text-primary-600 hover:underline">
                    View all {complaints.length} complaints →
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Privacy Banner */}
      <Card className="bg-gradient-to-r from-primary-600 to-primary-700 text-white border-0">
        <CardContent className="flex flex-col md:flex-row items-center gap-4 py-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-semibold">{tEvidence("encryptedStorage")}</h3>
            <p className="text-sm text-primary-100">
              {tEvidence("subtitle")}
            </p>
          </div>
          <Link href="/dashboard/settings">
            <Button
              variant="outline"
              size="sm"
              className="border-white text-white hover:bg-white/10"
            >
              {tNav("settings")}
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Col - Notifications & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">

          {/* Recent Activity & Case Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary-600" />
                {t("caseActivityLogs")}
              </CardTitle>
              <CardDescription>{t("caseActivityLogsSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">{t("noActivityLogs")}</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {notifications.slice(0, 5).map((notif) => (
                    <div key={notif._id} className="py-3 flex gap-3 first:pt-0 last:pb-0">
                      <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0 text-primary-600">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatNotificationTitle(notif.title)}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{formatNotificationMessage(notif.message)}</p>
                        <span className="text-[10px] text-gray-400 block mt-1">
                          {new Date(notif.createdAt || notif.created_at || new Date()).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                {tCounseling("upcomingSessions")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingSessions.length > 0 ? (
                <div className="space-y-3">
                  {upcomingSessions.slice(0, 2).map((session) => (
                    <div
                      key={session._id}
                      className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar name={typeof session.counselorId === "object" && session.counselorId?.name ? session.counselorId.name : "Counselor"} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {typeof session.counselorId === "object" && session.counselorId?.name ? session.counselorId.name : "Counselor"}
                          </p>
                          <p className="text-xs text-gray-500">{session.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(session.scheduledAt).toLocaleDateString()} at{" "}
                          {new Date(session.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {tCommon("close")}
                </p>
              )}
              <Link href="/dashboard/counseling">
                <Button variant="outline" size="sm" className="w-full mt-4">
                  {tCounseling("bookSession")}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* AI Assistant Tip */}
          <Card className="bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/30 dark:to-accent-800/30 border-accent-200 dark:border-accent-800">
            <CardContent>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-accent-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {tCommon("safeHer")} AI
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {tReport("subtitle")}
              </p>
              <Link href="/dashboard/report">
                <Button size="sm" variant="secondary" className="w-full">
                  {tCommon("getStarted")}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="bg-error/5 border-error/20">
            <CardContent className="text-center">
              <AlertCircle className="w-8 h-8 text-error mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {tSupport("emergencyHelplines")}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {tSupport("womenHelpline")}
              </p>
              <a href="tel:181">
                <Button variant="danger" size="sm" className="w-full">
                  {tCommon("callNow")}: 181
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {stat.subtext}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("quickActions")}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Card hover className="h-full group">
                <CardContent>
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className={`w-6 h-6 ${action.textColor}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                    {action.title}
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {action.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
