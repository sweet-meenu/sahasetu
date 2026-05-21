"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FolderLock,
  Upload,
  Search,
  Filter,
  Grid,
  List,
  Lock,
  Share2,
  Download,
  Trash2,
  Eye,
  Calendar,
  FileText,
  Image,
  Mic,
  Video,
  File,
  Plus,
  MoreVertical,
  Clock,
  Shield,
  Users,
  AlertCircle,
  CheckCircle,
  X,
  Loader2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import { cn } from "@/lib/utils";

interface EvidenceFile {
  id: string;
  name: string;
  type: "image" | "audio" | "video" | "document";
  size: string;
  uploadDate: string;
  incidentId?: string;
  incidentTitle?: string;
  encrypted: boolean;
  sharedWith: string[];
  accessExpiry?: string;
  complaintId?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function getFileCategory(mimeType: string): "image" | "audio" | "video" | "document" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.startsWith("video/")) return "video";
  return "document";
}

const getFileIcon = (type: string) => {
  switch (type) {
    case "image":
      return Image;
    case "audio":
      return Mic;
    case "video":
      return Video;
    case "document":
      return FileText;
    default:
      return File;
  }
};

const getFileColor = (type: string) => {
  switch (type) {
    case "image":
      return "bg-blue-100 text-blue-600";
    case "audio":
      return "bg-purple-100 text-purple-600";
    case "video":
      return "bg-pink-100 text-pink-600";
    case "document":
      return "bg-orange-100 text-orange-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export default function EvidenceVaultPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedFile, setSelectedFile] = useState<EvidenceFile | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([]);
  const [complaints, setComplaints] = useState<{ _id: string; caseId: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadComplaintId, setUploadComplaintId] = useState("");
  const [uploadCategory, setUploadCategory] = useState("document");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New active states for detailed sharing, preview, and options dropdown
  const [shareRecipient, setShareRecipient] = useState("counselor");
  const [shareDuration, setShareDuration] = useState("7");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<EvidenceFile | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [activeDropdownFileId, setActiveDropdownFileId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvidence();
    fetchComplaints();
  }, []);

  async function fetchEvidence() {
    try {
      setLoading(true);
      const res = await fetch("/api/evidence");
      if (res.ok) {
        const data = await res.json();
        const mapped: EvidenceFile[] = (data.files || []).map((e: Record<string, unknown>) => ({
          id: e._id as string,
          name: e.originalName as string || "Unknown file",
          type: getFileCategory(e.mimeType as string || "application/octet-stream"),
          size: formatFileSize(e.fileSize as number || 0),
          uploadDate: e.createdAt as string || new Date().toISOString(),
          complaintId: e.complaintId as string || undefined,
          encrypted: true,
          sharedWith: ((e.sharedWith as Array<{ entity: string }>) || []).map((s) => s.entity || s),
        }));
        setEvidenceFiles(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch evidence:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchComplaints() {
    try {
      const res = await fetch("/api/complaints");
      if (res.ok) {
        const data = await res.json();
        setComplaints((data.complaints || []).map((c: Record<string, string>) => ({ _id: c._id, caseId: c.caseId })));
      }
    } catch (err) {
      console.error("Failed to fetch complaints:", err);
    }
  }

  async function handleUpload() {
    if (uploadFiles.length === 0) return;
    setUploading(true);
    try {
      for (const file of uploadFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", uploadCategory);
        if (uploadComplaintId) formData.append("complaintId", uploadComplaintId);
        await fetch("/api/evidence/upload", { method: "POST", body: formData });
      }
      setShowUploadModal(false);
      setUploadFiles([]);
      setUploadComplaintId("");
      fetchEvidence();
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(fileId: string, fileName: string) {
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
  }

  // Active operations: Delete, Share, Revoke, Preview
  async function handleDelete(fileId: string) {
    if (!confirm("Are you sure you want to delete this file? This will permanently remove the evidence from your secure vault.")) return;
    try {
      const res = await fetch(`/api/evidence/${fileId}`, { method: "DELETE" });
      if (res.ok) {
        fetchEvidence();
      } else {
        alert("Failed to delete file. Please check permissions.");
      }
    } catch (err) {
      console.error("Failed to delete file:", err);
    }
  }

  async function handleShareSubmit() {
    if (!selectedFile) return;
    try {
      const res = await fetch(`/api/evidence/${selectedFile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "share", recipient: shareRecipient }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedFile({
          ...selectedFile,
          sharedWith: data.sharedWith || [],
        });
        fetchEvidence();
        setShowShareModal(false);
      }
    } catch (err) {
      console.error("Failed to share file:", err);
    }
  }

  async function handleRevoke(recipient: string) {
    if (!selectedFile) return;
    try {
      const res = await fetch(`/api/evidence/${selectedFile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke", recipient }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedFile({
          ...selectedFile,
          sharedWith: data.sharedWith || [],
        });
        fetchEvidence();
      }
    } catch (err) {
      console.error("Failed to revoke access:", err);
    }
  }

  async function handlePreview(file: EvidenceFile) {
    setPreviewFile(file);
    setShowPreviewModal(true);
    setPreviewLoading(true);
    setPreviewUrl(null);
    try {
      const res = await fetch(`/api/evidence/${file.id}/download`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      }
    } catch (err) {
      console.error("Failed to fetch file for preview:", err);
    } finally {
      setPreviewLoading(false);
    }
  }

  const filteredFiles = evidenceFiles.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || file.type === filterType;
    return matchesSearch && matchesType;
  });

  const stats = [
    { label: "Total Files", value: evidenceFiles.length, icon: FolderLock },
    { label: "Images", value: evidenceFiles.filter((f) => f.type === "image").length, icon: Image },
    { label: "Documents", value: evidenceFiles.filter((f) => f.type === "document").length, icon: FileText },
    { label: "Audio/Video", value: evidenceFiles.filter((f) => f.type === "audio" || f.type === "video").length, icon: Video },
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FolderLock className="w-8 h-8 text-primary-600" />
            Evidence Vault
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Your encrypted digital locker for sensitive documents
          </p>
        </div>
        <Button
          leftIcon={<Upload className="w-5 h-5" />}
          onClick={() => setShowUploadModal(true)}
        >
          Upload Evidence
        </Button>
      </div>

      {/* Security Banner */}
      <Card className="bg-gradient-to-r from-secondary-600 to-secondary-700 text-white border-0">
        <CardContent className="flex flex-col md:flex-row items-center gap-4 py-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-semibold">Zero-Knowledge Encryption</h3>
            <p className="text-sm text-secondary-100">
              All files are encrypted client-side. We cannot access your data — only you control who sees it.
            </p>
          </div>
          <Badge className="bg-white/20 text-white border-0">
            <Lock className="w-3 h-3 mr-1" />
            AES-256 Encrypted
          </Badge>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
          />
        </div>
        <div className="flex gap-2">
          <Select
            options={[
              { value: "all", label: "All Types" },
              { value: "image", label: "Images" },
              { value: "audio", label: "Audio" },
              { value: "video", label: "Video" },
              { value: "document", label: "Documents" },
            ]}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-40"
          />
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2.5 transition-colors",
                viewMode === "grid"
                  ? "bg-primary-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2.5 transition-colors",
                viewMode === "list"
                  ? "bg-primary-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Files Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => {
            const FileIcon = getFileIcon(file.type);
            return (
              <Card key={file.id} hover className="group relative">
                <CardContent>
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", getFileColor(file.type))}>
                      <FileIcon className="w-6 h-6" />
                    </div>
                    
                    {/* More Options Dropdown - Functional */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveDropdownFileId(activeDropdownFileId === file.id ? null : file.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      
                      {activeDropdownFileId === file.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownFileId(null)} />
                          <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1.5 z-20">
                            <button
                              onClick={() => {
                                handlePreview(file);
                                setActiveDropdownFileId(null);
                              }}
                              className="w-full px-3 py-1.5 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 cursor-pointer"
                            >
                              <Eye className="w-4 h-4" /> Preview
                            </button>
                            <button
                              onClick={() => {
                                setSelectedFile(file);
                                setShowShareModal(true);
                                setActiveDropdownFileId(null);
                              }}
                              className="w-full px-3 py-1.5 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 cursor-pointer"
                            >
                              <Share2 className="w-4 h-4" /> Share
                            </button>
                            <button
                              onClick={() => {
                                handleDownload(file.id, file.name);
                                setActiveDropdownFileId(null);
                              }}
                              className="w-full px-3 py-1.5 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 cursor-pointer"
                            >
                              <Download className="w-4 h-4" /> Download
                            </button>
                            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                            <button
                              onClick={() => {
                                handleDelete(file.id);
                                setActiveDropdownFileId(null);
                              }}
                              className="w-full px-3 py-1.5 text-left text-sm text-error hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 cursor-pointer font-medium"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <h3 className="font-medium text-gray-900 dark:text-white mb-1 truncate">
                    {file.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {file.size} • {new Date(file.uploadDate).toLocaleDateString()}
                  </p>

                  {file.incidentId && (
                    <Badge variant="info" size="sm" className="mb-3">
                      {file.incidentId}
                    </Badge>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Lock className="w-4 h-4 text-success" />
                      <span>Encrypted</span>
                    </div>
                    {file.sharedWith.length > 0 && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>{file.sharedWith.length}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handlePreview(file)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedFile(file);
                        setShowShareModal(true);
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDownload(file.id, file.name)}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredFiles.map((file) => {
              const FileIcon = getFileIcon(file.type);
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", getFileColor(file.type))}>
                    <FileIcon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {file.size} • {new Date(file.uploadDate).toLocaleDateString()}
                    </p>
                  </div>

                  {file.incidentId && (
                    <Badge variant="info" size="sm" className="hidden md:flex">
                      {file.incidentId}
                    </Badge>
                  )}

                  <div className="flex items-center gap-1 text-sm text-gray-500 hidden md:flex">
                    <Lock className="w-4 h-4 text-success" />
                  </div>

                  {file.sharedWith.length > 0 && (
                    <Badge variant="secondary" size="sm" className="hidden md:flex">
                      <Users className="w-3 h-3 mr-1" />
                      {file.sharedWith.length}
                    </Badge>
                  )}

                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handlePreview(file)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(file);
                        setShowShareModal(true);
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(file.id, file.name)}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-error hover:text-error cursor-pointer" onClick={() => handleDelete(file.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {filteredFiles.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderLock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              No files found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "Upload your first piece of evidence to get started"}
            </p>
            <Button onClick={() => setShowUploadModal(true)}>
              <Upload className="w-5 h-5 mr-2" />
              Upload Evidence
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Share Modal - Fully Functional */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Access"
        description="Control who can view this evidence"
      >
        <div className="space-y-4">
          <Select
            label="Share with"
            options={[
              { value: "counselor", label: "My Counselor" },
              { value: "partner", label: "Partner Representative" },
              { value: "icc", label: "Internal Complaints Committee" },
              { value: "lawyer", label: "Legal Representative" },
            ]}
            value={shareRecipient}
            onChange={(e) => setShareRecipient(e.target.value)}
          />

          <Select
            label="Access Duration"
            options={[
              { value: "7", label: "7 days" },
              { value: "14", label: "14 days" },
              { value: "30", label: "30 days" },
              { value: "90", label: "90 days" },
            ]}
            value={shareDuration}
            onChange={(e) => setShareDuration(e.target.value)}
          />

          <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="flex gap-3 py-3">
              <AlertCircle className="w-5 h-5 text-warning shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Access will automatically expire after the selected duration. You can revoke access at any time.
              </p>
            </CardContent>
          </Card>

          {selectedFile?.sharedWith && selectedFile.sharedWith.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Currently shared with:
              </p>
              {selectedFile.sharedWith.map((person, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg mb-2 animate-fade-in"
                >
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {person}
                  </span>
                  <Button variant="ghost" size="sm" className="text-error cursor-pointer" onClick={() => handleRevoke(person)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 cursor-pointer" onClick={() => setShowShareModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1 cursor-pointer" onClick={handleShareSubmit}>
              <Share2 className="w-4 h-4 mr-2" />
              Share Access
            </Button>
          </div>
        </div>
      </Modal>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Evidence"
        description="Add files to your encrypted vault"
      >
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                const filesArray = Array.from(e.target.files);
                const largeFiles = filesArray.filter((f) => f.size > 10 * 1024 * 1024);
                if (largeFiles.length > 0) {
                  setUploadError(`Some files exceed the 10MB limit: ${largeFiles.map((f) => f.name).join(", ")}`);
                  setUploadFiles([]);
                } else {
                  setUploadError(null);
                  setUploadFiles(filesArray);
                }
              }
            }}
          />
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            {uploadFiles.length > 0 ? (
              <>
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  {uploadFiles.length} file(s) selected
                </p>
                <p className="text-sm text-gray-500">
                  {uploadFiles.map((f) => f.name).join(", ")}
                </p>
              </>
            ) : (
              <>
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  Drop files here or click to upload
                </p>
                <p className="text-sm text-gray-500">
                  Images, audio, video, or documents up to 10MB
                </p>
              </>
            )}
          </div>

          {uploadError && (
            <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-900 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{uploadError}</span>
            </div>
          )}

          <Select
            label="File Category"
            options={[
              { value: "document", label: "Document" },
              { value: "image", label: "Image" },
              { value: "audio", label: "Audio" },
              { value: "video", label: "Video" },
              { value: "screenshot", label: "Screenshot" },
              { value: "communication", label: "Communication Record" },
            ]}
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value)}
          />

          <Select
            label="Link to Complaint (Optional)"
            options={[
              { value: "", label: "No complaint linked" },
              ...complaints.map((c) => ({ value: c._id, label: c.caseId })),
            ]}
            value={uploadComplaintId}
            onChange={(e) => setUploadComplaintId(e.target.value)}
          />

          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="flex gap-3 py-3">
              <Shield className="w-5 h-5 text-success shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-300">
                Files are encrypted with AES-256-GCM before storage. Your data is secure.
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => { setShowUploadModal(false); setUploadFiles([]); setUploadError(null); }}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleUpload} disabled={uploadFiles.length === 0 || uploading || !!uploadError}>
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              {uploading ? "Encrypting & Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Dynamic File Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
          }
          setPreviewFile(null);
        }}
        title={`Preview: ${previewFile?.name}`}
        description="Encrypted Vault Previewer"
      >
        <div className="flex flex-col items-center justify-center p-4 min-h-[300px] bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-150 dark:border-gray-800">
          {previewLoading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
              <p className="text-xs text-gray-500">Decrypting secure file streams...</p>
            </div>
          ) : previewUrl ? (
            previewFile?.type === "image" ? (
              <img src={previewUrl} alt={previewFile.name} className="max-w-full max-h-[60vh] rounded-lg object-contain shadow-md" />
            ) : previewFile?.type === "audio" ? (
              <div className="w-full text-center space-y-4 p-4">
                <Mic className="w-16 h-16 text-purple-500 mx-auto animate-pulse" />
                <audio src={previewUrl} controls className="w-full" />
              </div>
            ) : previewFile?.type === "video" ? (
              <video src={previewUrl} controls className="max-w-full max-h-[60vh] rounded-lg shadow-md" />
            ) : (
              <div className="text-center p-6 space-y-4">
                <FileText className="w-16 h-16 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Previews are not supported for documents. Please download the file to view its contents securely.
                </p>
                <Button onClick={() => handleDownload(previewFile!.id, previewFile!.name)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </Button>
              </div>
            )
          ) : (
            <p className="text-error font-medium">Failed to decrypt or load file preview.</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
