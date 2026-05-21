"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Download,
  Upload,
  Search,
  Eye,
  Trash2,
  Edit3,
  Video,
  File,
  FolderOpen,
  Loader2,
  CheckCircle,
  Archive,
  Globe,
  Lock,
  Users,
  AlertCircle,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Textarea from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

interface Resource {
  _id: string;
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  category: string;
  tags: string[];
  partnerName: string;
  visibility: "public" | "private" | "shared";
  status: "draft" | "published" | "archived";
  downloadCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  { value: "all", label: "All Resources" },
  { value: "legal_guide", label: "Legal Guides" },
  { value: "posh_handbook", label: "PoSH Handbooks" },
  { value: "workshop_material", label: "Workshop Materials" },
  { value: "counseling_resource", label: "Counseling Resources" },
  { value: "policy_template", label: "Policy Templates" },
  { value: "training_video", label: "Training Videos" },
  { value: "helpline_directory", label: "Helpline Directories" },
  { value: "other", label: "Other" },
];

const CATEGORY_OPTIONS = CATEGORIES.filter((c) => c.value !== "all");

export default function PartnerResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadCategory, setUploadCategory] = useState("legal_guide");
  const [uploadVisibility, setUploadVisibility] = useState("public");
  const [uploadStatus, setUploadStatus] = useState("published");
  const [uploadTags, setUploadTags] = useState("");
  const [uploading, setUploading] = useState(false);

  // Edit state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editVisibility, setEditVisibility] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editTags, setEditTags] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete
  const [deleting, setDeleting] = useState(false);

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ mine: "true", limit: "100" });
      if (activeCategory !== "all") params.set("category", activeCategory);
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("sort", sortBy);

      const res = await fetch(`/api/resources?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setResources(data.resources || []);
    } catch {
      setError("Failed to load resources");
    } finally {
      setLoading(false);
    }
  }, [activeCategory, statusFilter, sortBy]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Client-side search filter on top of server results
  const filteredResources = resources.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  // Stats
  const totalResources = resources.length;
  const publishedCount = resources.filter((r) => r.status === "published").length;
  const totalDownloads = resources.reduce((sum, r) => sum + r.downloadCount, 0);
  const totalViews = resources.reduce((sum, r) => sum + r.viewCount, 0);

  const categoryCountMap = resources.reduce<Record<string, number>>((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {});

  // Upload handler
  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle || !uploadDescription || !uploadCategory) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("title", uploadTitle);
      formData.append("description", uploadDescription);
      formData.append("category", uploadCategory);
      formData.append("visibility", uploadVisibility);
      formData.append("status", uploadStatus);
      if (uploadTags) formData.append("tags", uploadTags);

      const res = await fetch("/api/resources", { method: "POST", body: formData });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Upload failed");
      }

      setShowUploadModal(false);
      resetUploadForm();
      fetchResources();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      alert(message);
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadTitle("");
    setUploadDescription("");
    setUploadCategory("legal_guide");
    setUploadVisibility("public");
    setUploadStatus("published");
    setUploadTags("");
  };

  // Edit handler
  const openEditModal = (resource: Resource) => {
    setSelectedResource(resource);
    setEditTitle(resource.title);
    setEditDescription(resource.description);
    setEditCategory(resource.category);
    setEditVisibility(resource.visibility);
    setEditStatus(resource.status);
    setEditTags(resource.tags.join(", "));
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    if (!selectedResource) return;
    try {
      setSaving(true);
      const body: Record<string, unknown> = {
        title: editTitle,
        description: editDescription,
        category: editCategory,
        visibility: editVisibility,
        status: editStatus,
        tags: editTags.split(",").map((t) => t.trim()).filter(Boolean),
      };
      const res = await fetch(`/api/resources/${selectedResource._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Update failed");
      setShowEditModal(false);
      fetchResources();
    } catch {
      alert("Failed to update resource");
    } finally {
      setSaving(false);
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!selectedResource) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/resources/${selectedResource._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setShowDeleteModal(false);
      setSelectedResource(null);
      fetchResources();
    } catch {
      alert("Failed to delete resource");
    } finally {
      setDeleting(false);
    }
  };

  // Quick status toggle
  const handleToggleStatus = async (resource: Resource, newStatus: string) => {
    try {
      await fetch(`/api/resources/${resource._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchResources();
    } catch {
      alert("Failed to update status");
    }
  };

  // Download
  const handleDownload = async (resource: Resource) => {
    try {
      const res = await fetch(`/api/resources/${resource._id}/download`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = resource.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("Download failed");
    }
  };

  const getTypeIcon = (mimeType: string) => {
    if (mimeType?.includes("pdf")) return <FileText className="w-6 h-6 text-red-500" />;
    if (mimeType?.includes("video")) return <Video className="w-6 h-6 text-purple-500" />;
    return <File className="w-6 h-6 text-blue-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getCategoryLabel = (val: string) =>
    CATEGORIES.find((c) => c.value === val)?.label || val;

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "success" | "warning" | "secondary"; icon: React.ReactNode }> = {
      published: { variant: "success", icon: <CheckCircle className="w-3 h-3" /> },
      draft: { variant: "warning", icon: <Edit3 className="w-3 h-3" /> },
      archived: { variant: "secondary", icon: <Archive className="w-3 h-3" /> },
    };
    const c = config[status] || config.draft;
    return (
      <Badge variant={c.variant} size="sm">
        <span className="flex items-center gap-1">
          {c.icon}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </Badge>
    );
  };

  const getVisibilityIcon = (visibility: string) => {
    if (visibility === "public") return <Globe className="w-3.5 h-3.5 text-green-500" />;
    if (visibility === "private") return <Lock className="w-3.5 h-3.5 text-red-500" />;
    return <Users className="w-3.5 h-3.5 text-blue-500" />;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Resources
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Upload and manage resources for users
          </p>
        </div>
        <Button leftIcon={<Upload className="w-4 h-4" />} onClick={() => setShowUploadModal(true)}>
          Upload Resource
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-2xl font-bold text-blue-600">{totalResources}</p>
            <p className="text-sm text-gray-500">Total Resources</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-2xl font-bold text-green-600">{publishedCount}</p>
            <p className="text-sm text-gray-500">Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-2xl font-bold text-purple-600">{totalDownloads}</p>
            <p className="text-sm text-gray-500">Total Downloads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-2xl font-bold text-orange-600">{totalViews}</p>
            <p className="text-sm text-gray-500">Total Views</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setActiveCategory(cat.value)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      activeCategory === cat.value
                        ? "bg-secondary-50 text-secondary-600 dark:bg-secondary-900/30"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4" />
                      {cat.label}
                    </span>
                    <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                      {cat.value === "all" ? totalResources : (categoryCountMap[cat.value] || 0)}
                    </span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>

          {/* Status Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {[
                  { value: "all", label: "All Statuses" },
                  { value: "published", label: "Published" },
                  { value: "draft", label: "Drafts" },
                  { value: "archived", label: "Archived" },
                ].map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStatusFilter(s.value)}
                    className={cn(
                      "w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      statusFilter === s.value
                        ? "bg-secondary-50 text-secondary-600 dark:bg-secondary-900/30"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Resources List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search & Sort */}
          <Card>
            <CardContent className="py-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search resources..."
                    leftIcon={<Search className="w-4 h-4" />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  options={[
                    { value: "recent", label: "Most Recent" },
                    { value: "downloads", label: "Most Downloads" },
                    { value: "title", label: "Title A-Z" },
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <Card>
              <CardContent className="py-8 text-center">
                <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
                <p className="text-red-600">{error}</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={fetchResources}>
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!loading && !error && filteredResources.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium mb-1">No resources found</p>
                <p className="text-sm text-gray-400 mb-4">
                  {resources.length === 0
                    ? "Upload your first resource to get started"
                    : "Try adjusting your filters"}
                </p>
                {resources.length === 0 && (
                  <Button size="sm" onClick={() => setShowUploadModal(true)}>
                    Upload Resource
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Resources Grid */}
          {!loading && (
            <div className="space-y-4">
              {filteredResources.map((resource) => (
                <Card key={resource._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
                          {getTypeIcon(resource.mimeType)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="font-semibold truncate">{resource.title}</p>
                            {getStatusBadge(resource.status)}
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              {getVisibilityIcon(resource.visibility)}
                              {resource.visibility}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-2 line-clamp-2">{resource.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                            <span>{getCategoryLabel(resource.category)}</span>
                            <span>{formatFileSize(resource.fileSize)}</span>
                            <span className="flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              {resource.downloadCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {resource.viewCount}
                            </span>
                            <span>
                              {new Date(resource.createdAt).toLocaleDateString()}
                            </span>
                            {resource.tags.length > 0 && (
                              <span className="flex items-center gap-1">
                                {resource.tags.slice(0, 3).map((t) => (
                                  <span
                                    key={t}
                                    className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-4">
                        {resource.status === "draft" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Publish"
                            onClick={() => handleToggleStatus(resource, "published")}
                          >
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </Button>
                        )}
                        {resource.status === "published" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Archive"
                            onClick={() => handleToggleStatus(resource, "archived")}
                          >
                            <Archive className="w-4 h-4 text-gray-500" />
                          </Button>
                        )}
                        {resource.status === "archived" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Republish"
                            onClick={() => handleToggleStatus(resource, "published")}
                          >
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" title="Edit" onClick={() => openEditModal(resource)}>
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Download" onClick={() => handleDownload(resource)}>
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Delete"
                          onClick={() => {
                            setSelectedResource(resource);
                            setShowDeleteModal(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          resetUploadForm();
        }}
        title="Upload Resource"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            placeholder="Enter resource title"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
          />
          <Textarea
            label="Description"
            placeholder="Brief description of the resource"
            rows={3}
            value={uploadDescription}
            onChange={(e) => setUploadDescription(e.target.value)}
          />
          <Select
            label="Category"
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value)}
            options={CATEGORY_OPTIONS}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Visibility"
              value={uploadVisibility}
              onChange={(e) => setUploadVisibility(e.target.value)}
              options={[
                { value: "public", label: "Public" },
                { value: "private", label: "Private" },
                { value: "shared", label: "Shared" },
              ]}
            />
            <Select
              label="Status"
              value={uploadStatus}
              onChange={(e) => setUploadStatus(e.target.value)}
              options={[
                { value: "published", label: "Publish Now" },
                { value: "draft", label: "Save as Draft" },
              ]}
            />
          </div>
          <Input
            label="Tags (comma-separated)"
            placeholder="e.g. posh, legal, training"
            value={uploadTags}
            onChange={(e) => setUploadTags(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              File
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
              {uploadFile ? (
                <div className="flex items-center justify-center gap-3">
                  {getTypeIcon(uploadFile.type)}
                  <div className="text-left">
                    <p className="text-sm font-medium">{uploadFile.name}</p>
                    <p className="text-xs text-gray-400">{formatFileSize(uploadFile.size)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadFile(null)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Click to select a file
                  </p>
                  <p className="text-xs text-gray-400 mb-3">
                    PDF, DOC, DOCX, MP4, Images (Max 100MB)
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    id="resource-file-input"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.mp3,.png,.jpg,.jpeg,.gif,.txt,.csv"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setUploadFile(e.target.files[0]);
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("resource-file-input")?.click()}
                  >
                    Browse Files
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowUploadModal(false);
                resetUploadForm();
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleUpload}
              disabled={uploading || !uploadFile || !uploadTitle || !uploadDescription}
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </span>
              ) : (
                "Upload"
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Resource"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <Textarea
            label="Description"
            rows={3}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
          <Select
            label="Category"
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
            options={CATEGORY_OPTIONS}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Visibility"
              value={editVisibility}
              onChange={(e) => setEditVisibility(e.target.value)}
              options={[
                { value: "public", label: "Public" },
                { value: "private", label: "Private" },
                { value: "shared", label: "Shared" },
              ]}
            />
            <Select
              label="Status"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              options={[
                { value: "published", label: "Published" },
                { value: "draft", label: "Draft" },
                { value: "archived", label: "Archived" },
              ]}
            />
          </div>
          <Input
            label="Tags (comma-separated)"
            value={editTags}
            onChange={(e) => setEditTags(e.target.value)}
          />
          {selectedResource && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-500">
              <p>File: {selectedResource.fileName} ({formatFileSize(selectedResource.fileSize)})</p>
              <p>Uploaded: {new Date(selectedResource.createdAt).toLocaleDateString()}</p>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleEdit} disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Resource"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                This action cannot be undone
              </p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                The file &quot;{selectedResource?.title}&quot; will be permanently deleted.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
