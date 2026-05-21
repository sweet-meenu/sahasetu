"use client";

import { useState, useEffect } from "react";
import {
  Video,
  Phone,
  Clock,
  Calendar,
  Search,
  Filter,
  ChevronRight,
  CheckCircle,
  XCircle,
  MessageSquare,
  User as UserIcon,
  Star,
  Loader2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Textarea from "@/components/ui/Textarea";
import Avatar from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

interface Session {
  id: string;
  user: string;
  type: string;
  date: string;
  time: string;
  duration: string;
  status: string;
  counselor: string;
  notes: string;
  feedback?: number;
}

export default function PartnerSessionsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [counselorsList, setCounselorsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [sessionType, setSessionType] = useState("video");
  const [assignedCounselorId, setAssignedCounselorId] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [sessionDuration, setSessionDuration] = useState("45");
  const [sessionNotes, setSessionNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSessions();
    fetchCounselors();
  }, [activeTab]);

  async function fetchCounselors() {
    try {
      const res = await fetch("/api/counseling/counselors");
      if (res.ok) {
        const data = await res.json();
        setCounselorsList(data.counselors || []);
        if (data.counselors?.length > 0) {
          setAssignedCounselorId(data.counselors[0]._id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchSessions() {
    try {
      setLoading(true);
      const res = await fetch("/api/counseling");
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.sessions || []).map((s: any) => {
          const dateObj = new Date(s.scheduledAt);
          return {
            id: s._id,
            user: s.isAnonymous ? "Anonymous User" : (s.userId?.name || "Client"),
            type: s.type === "video" ? "Video Counseling" : s.type === "voice" ? "Voice Call" : "Follow-up Call",
            date: dateObj.toLocaleDateString(),
            time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            duration: "45 mins",
            status: s.status === "scheduled" ? "confirmed" : s.status,
            counselor: s.counselorId?.name || "Counselor",
            notes: s.notes || "Professional support session",
            feedback: s.rating || undefined,
          };
        });

        // Filter based on activeTab
        const filtered = mapped.filter((s: Session) => {
          const isPast = s.status === "completed" || s.status === "cancelled";
          if (activeTab === "past") return isPast;
          return !isPast;
        });

        setSessions(filtered);
      }
    } catch (e) {
      console.error("Failed to load sessions:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSchedule() {
    if (!assignedCounselorId || !sessionDate || !sessionTime) {
      alert("Please select counselor, date, and time.");
      return;
    }
    setSubmitting(true);
    try {
      const scheduledAt = new Date(`${sessionDate}T${sessionTime}`);
      const res = await fetch("/api/counseling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          counselorId: assignedCounselorId,
          type: sessionType,
          scheduledAt,
          notes: sessionNotes,
        }),
      });
      if (res.ok) {
        setShowSessionModal(false);
        setSessionNotes("");
        fetchSessions();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to schedule session.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateStatus(id: string, newStatus: string) {
    try {
      const res = await fetch(`/api/counseling/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setSelectedSession(null);
        fetchSessions();
      }
    } catch (e) {
      console.error(e);
    }
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "success" | "warning" | "info" | "error"; label: string }> = {
      confirmed: { variant: "success", label: "Confirmed" },
      pending: { variant: "warning", label: "Pending" },
      completed: { variant: "info", label: "Completed" },
      cancelled: { variant: "error", label: "Cancelled" },
    };
    const { variant, label } = config[status] || { variant: "info", label: status };
    return <Badge variant={variant} size="sm">{label}</Badge>;
  };

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch = s.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.counselor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filter === "all" ||
      (filter === "video" && s.type.includes("Video")) ||
      (filter === "voice" && s.type.includes("Voice")) ||
      (filter === "followup" && s.type.includes("Follow-up"));
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Sessions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage counseling and support sessions securely
          </p>
        </div>
        <Button leftIcon={<Calendar className="w-4 h-4" />} onClick={() => setShowSessionModal(true)}>
          Schedule Session
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-2xl font-bold text-blue-600">
              {sessions.filter(s => s.status !== "completed" && s.status !== "cancelled").length}
            </p>
            <p className="text-sm text-gray-500">Upcoming Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-2xl font-bold text-green-600">
              {sessions.filter(s => s.status === "confirmed").length}
            </p>
            <p className="text-sm text-gray-500">Confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-2xl font-bold text-orange-600">
              {sessions.filter(s => s.status === "pending").length}
            </p>
            <p className="text-sm text-gray-500">Pending Setup</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-2xl font-bold text-gray-600">
              {sessions.filter(s => s.status === "completed").length}
            </p>
            <p className="text-sm text-gray-500">Completed Sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={cn(
            "px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer",
            activeTab === "upcoming"
              ? "bg-secondary-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
          )}
        >
          Upcoming Sessions
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={cn(
            "px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer",
            activeTab === "past"
              ? "bg-secondary-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
          )}
        >
          Past Sessions
        </button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="flex gap-3">
              <Select
                options={[
                  { value: "all", label: "All Types" },
                  { value: "video", label: "Video Counseling" },
                  { value: "voice", label: "Voice Call" },
                  { value: "followup", label: "Follow-up Call" },
                ]}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <Card
              key={session.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedSession(session)}
            >
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/30 rounded-full flex items-center justify-center">
                      {session.type.includes("Video") ? (
                        <Video className="w-6 h-6 text-secondary-600" />
                      ) : (
                        <Phone className="w-6 h-6 text-secondary-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{session.user}</p>
                        {getStatusBadge(session.status)}
                      </div>
                      <p className="text-sm text-gray-500">{session.type}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {session.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {session.time} ({session.duration})
                        </span>
                        <span className="flex items-center gap-1">
                          <UserIcon className="w-3 h-3" />
                          {session.counselor}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.feedback && (
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-yellow-500" />
                        <span className="text-sm font-medium">{session.feedback}</span>
                      </div>
                    )}
                    {session.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<CheckCircle className="w-4 h-4" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(session.id, "confirmed");
                        }}
                      >
                        Confirm
                      </Button>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredSessions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No sessions scheduled.
            </div>
          )}
        </div>
      )}

      {/* Schedule Session Modal */}
      <Modal
        isOpen={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        title="Schedule New Session"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Session Type"
            options={[
              { value: "video", label: "Video Counseling" },
              { value: "voice", label: "Voice Call" },
              { value: "followup", label: "Follow-up Call" },
            ]}
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value)}
          />
          <Select
            label="Assign Counselor"
            options={counselorsList.map(c => ({ value: c._id, label: c.name }))}
            value={assignedCounselorId}
            onChange={(e) => setAssignedCounselorId(e.target.value)}
          />
          <Input
            label="Date"
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
          />
          <Input
            label="Time"
            type="time"
            value={sessionTime}
            onChange={(e) => setSessionTime(e.target.value)}
          />
          <Select
            label="Duration"
            options={[
              { value: "30", label: "30 minutes" },
              { value: "45", label: "45 minutes" },
              { value: "60", label: "60 minutes" },
            ]}
            value={sessionDuration}
            onChange={(e) => setSessionDuration(e.target.value)}
          />
          <Textarea
            label="Session Notes"
            placeholder="Add any notes for this session..."
            rows={3}
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
          />
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 cursor-pointer" onClick={() => setShowSessionModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1 cursor-pointer" onClick={handleSchedule} disabled={submitting}>
              {submitting ? "Scheduling..." : "Schedule Session"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Session Detail Modal */}
      <Modal
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        title="Session Details"
        size="md"
      >
        {selectedSession && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/30 rounded-full flex items-center justify-center">
                {selectedSession.type.includes("Video") ? (
                  <Video className="w-6 h-6 text-secondary-600" />
                ) : (
                  <Phone className="w-6 h-6 text-secondary-600" />
                )}
              </div>
              <div>
                <p className="font-semibold">{selectedSession.user}</p>
                <p className="text-sm text-gray-500">{selectedSession.type}</p>
              </div>
              {getStatusBadge(selectedSession.status)}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-medium">{selectedSession.date}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500">Time</p>
                <p className="font-medium">{selectedSession.time}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500">Duration</p>
                <p className="font-medium">{selectedSession.duration}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500">Counselor</p>
                <p className="font-medium">{selectedSession.counselor}</p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Notes</p>
              <p className="text-sm">{selectedSession.notes}</p>
            </div>

            {selectedSession.feedback && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">User Feedback</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-5 h-5",
                        star <= (selectedSession.feedback || 0)
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              {selectedSession.status !== "cancelled" && selectedSession.status !== "completed" && (
                <Button
                  variant="outline"
                  className="flex-1 cursor-pointer text-error hover:bg-red-50 dark:hover:bg-red-950/20"
                  leftIcon={<XCircle className="w-4 h-4" />}
                  onClick={() => handleUpdateStatus(selectedSession.id, "cancelled")}
                >
                  Cancel Session
                </Button>
              )}
              {selectedSession.status !== "completed" && selectedSession.status !== "cancelled" && (
                <Button
                  className="flex-1 cursor-pointer bg-green-600 hover:bg-green-700 text-white"
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                  onClick={() => handleUpdateStatus(selectedSession.id, "completed")}
                >
                  Complete Session
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
