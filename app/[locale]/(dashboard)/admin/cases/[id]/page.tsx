"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Shield,
  User,
  AlertTriangle,
  FileText,
  MapPin,
  Save,
  Loader2,
  CheckCircle,
  MessageCircle,
  Download,
  Users,
  Image,
  Mic,
  Video,
  FolderLock,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Avatar from "@/components/ui/Avatar";
import Modal from "@/components/ui/Modal";

const STATUS_OPTIONS = [
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "investigation", label: "Investigation" },
  { value: "hearing_scheduled", label: "Hearing Scheduled" },
  { value: "hearing_in_progress", label: "Hearing In Progress" },
  { value: "resolution_pending", label: "Resolution Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
  { value: "escalated", label: "Escalated" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

// Helper to calculate days open
function getDaysOpen(createdAt: string) {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
}

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params?.id as string;

  const [activeTab, setActiveTab] = useState<"overview" | "evidence" | "timeline" | "notes">("overview");
  const [complaint, setComplaint] = useState<any>(null);
  const [evidenceFiles, setEvidenceFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Status Update Modal State
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (caseId) fetchCase();
  }, [caseId]);

  async function fetchCase() {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/cases/${caseId}`);
      if (!res.ok) throw new Error("Failed to fetch case");
      const data = await res.json();
      setComplaint(data.case);
      if (data.evidenceFiles) setEvidenceFiles(data.evidenceFiles);
      setStatus(data.case.status);
      setPriority(data.case.priority);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdate = async () => {
    try {
      setSaving(true);
      setError(null);
      const res = await fetch(`/api/admin/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, priority, note }),
      });
      if (!res.ok) throw new Error("Failed to update case");
      const data = await res.json();
      
      // Update local state
      setComplaint(data.case);
      setStatus(data.case.status);
      setPriority(data.case.priority);
      setNote("");
      setShowStatusModal(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadEvidence = async (fileId: string, fileName: string) => {
    try {
      const res = await fetch(`/api/evidence/${fileId}/download`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image": return Image;
      case "audio": return Mic;
      case "video": return Video;
      default: return FileText;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error && !complaint) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-red-600 bg-red-50 rounded-xl mt-12">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Error Loading Case</h2>
        <p>{error || "Case not found"}</p>
        <Button className="mt-4" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cases
        </button>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
              {complaint.isAnonymous ? (
                <Shield className="w-7 h-7 text-gray-500" />
              ) : (
                <Avatar name="User" size="lg" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {complaint.caseId}
                </h1>
                <Badge variant={
                  complaint.status === "resolved" ? "success" :
                  complaint.status.includes("hearing") ? "warning" : "info"
                }>
                  {STATUS_OPTIONS.find(o => o.value === complaint.status)?.label || complaint.status}
                </Badge>
                {complaint.priority === "high" || complaint.priority === "critical" ? (
                  <Badge variant="error" size="sm">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {complaint.priority} Priority
                  </Badge>
                ) : null}
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 flex-wrap">
                <span className="capitalize">{complaint.incidentType.replace(/_/g, " ")}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Submitted {new Date(complaint.createdAt).toLocaleDateString()}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {getDaysOpen(complaint.createdAt)} days open
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button size="sm" onClick={() => setShowStatusModal(true)}>
              Update Status & Priority
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {[
          { id: "overview", label: "Overview", icon: FileText },
          { id: "evidence", label: `Evidence (${evidenceFiles.length})`, icon: FolderLock },
          { id: "timeline", label: "Timeline Logs", icon: Clock },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={
              `flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "overview" && (
            <Card>
              <CardHeader>
                <CardTitle>Case Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                  {complaint.description}
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Incident Date</p>
                    <p className="font-medium">{new Date(complaint.incidentDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Location</p>
                    <p className="font-medium">{complaint.location || "Not specified"}</p>
                  </div>
                </div>

                {complaint.accusedName && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-500 mb-2">Accused Information</p>
                    <div className="bg-red-50 text-red-900 border border-red-100 p-4 rounded-xl flex items-center gap-3">
                      <User className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="font-semibold">{complaint.accusedName}</p>
                        {complaint.accusedDepartment && <p className="text-sm text-red-700">{complaint.accusedDepartment}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "evidence" && (
            <Card>
              <CardHeader>
                <CardTitle>Attached Evidence</CardTitle>
                <CardDescription>Files uploaded by the reporter for this case.</CardDescription>
              </CardHeader>
              <CardContent>
                {evidenceFiles.length === 0 ? (
                  <div className="text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <FolderLock className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No evidence files attached</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {evidenceFiles.map((file) => {
                      const Icon = getFileIcon(file.category);
                      return (
                        <div key={file._id} className="py-4 flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-xl flex items-center justify-center shrink-0">
                              <Icon className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white line-clamp-1">{file.originalName}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <span>{(file.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                                <span>•</span>
                                <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDownloadEvidence(file._id, file.originalName)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "timeline" && (
            <Card>
              <CardHeader>
                <CardTitle>Status Timeline</CardTitle>
                <CardDescription>All status updates and notes for this case.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                  <div className="space-y-6">
                    {/* Add submission as first step if timeline is missing it */}
                    <div className="relative pl-10">
                      <div className="absolute left-0 w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="bg-white border border-gray-100 rounded-lg p-4">
                        <p className="font-medium text-gray-900">Case Submitted</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(complaint.createdAt).toLocaleString()}</p>
                      </div>
                    </div>

                    {complaint.timeline?.map((entry: any, index: number) => (
                      <div key={index} className="relative pl-10">
                        <div className="absolute left-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                Changed to {STATUS_OPTIONS.find(o => o.value === entry.status)?.label || entry.status}
                              </p>
                              {entry.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-100">
                                  {entry.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(entry.createdAt).toLocaleString()} • {entry.updatedByRole === 'admin' ? 'Admin' : 'ICC Member'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Complainant Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Reporter Information</CardTitle>
            </CardHeader>
            <CardContent>
              {complaint.isAnonymous ? (
                <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <Shield className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="font-semibold text-gray-900">Anonymous</p>
                    <p className="text-xs font-mono mt-0.5">{complaint.userId?.anonymousId}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100 text-blue-900">
                  <Avatar name={complaint.userId?.name || "U"} size="md" />
                  <div>
                    <p className="font-semibold">{complaint.userId?.name}</p>
                    <p className="text-sm opacity-80">{complaint.userId?.email}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm" 
                 onClick={() => {
                   setActiveTab("timeline");
                   setShowStatusModal(true);
                 }}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Add Timeline Note
              </Button>
              <Button variant="outline" className="w-full justify-start text-error hover:bg-error/10" size="sm"
                onClick={() => {
                  setStatus("escalated");
                  setShowStatusModal(true);
                }}>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Escalate Case
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Case Status"
        description="Changes will be recorded in the timeline and the reporter will be notified."
      >
        <div className="space-y-4">
          <Select
            label="Current Status"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
          <Select
            label="Priority Level"
            options={PRIORITY_OPTIONS}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Update Note (Required)
            </label>
            <textarea
              className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Explain the reason for this status change or add an internal note..."
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowStatusModal(false)}>
              Cancel
            </Button>
            <Button 
               className="flex-1" 
               onClick={handleUpdate} 
               isLoading={saving}
               disabled={!note.trim()}
            >
              Save Update
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
