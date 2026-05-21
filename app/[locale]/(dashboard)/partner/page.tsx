"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  MessageSquare,
  Clock,
  ChevronRight,
  ArrowUpRight,
  Phone,
  Video,
  FileText,
  BookOpen,
  Download,
  Share2,
  Bell,
  CheckCircle,
  Upload,
  ExternalLink,
  Loader2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";

export default function PartnerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: { activeSessions: 0, pendingUpdates: 0, resourcesShared: 0, committeeMembers: 0 },
    upcomingSessions: [] as any[],
    recentUpdates: [] as any[],
    resources: [] as any[],
    partnerInfo: null as any,
  });

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceDesc, setResourceDesc] = useState("");
  const [resourceCat, setResourceCat] = useState("policy_template");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [committeeMembersList, setCommitteeMembersList] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    try {
      const [res, commRes] = await Promise.all([
        fetch("/api/partner/dashboard"),
        fetch("/api/committees")
      ]);
      
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
      
      if (commRes.ok) {
        const cData = await commRes.json();
        const allMembers: any[] = [];
        (cData.committees || []).forEach((c: any) => {
          (c.members || []).forEach((m: any) => {
            allMembers.push({
              name: m.name,
              role: m.role === 'presiding_officer' ? "Presiding Officer" : "Committee Member",
              status: m.isActive ? "active" : "inactive"
            });
          });
        });
        setCommitteeMembersList(allMembers.slice(0, 5));
      }
    } catch (error) {
      console.error("Failed to fetch Partner dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUploadResource = async () => {
    if (!resourceTitle || !resourceDesc || !selectedFile) {
      alert("Title, description, and a file attachment are required.");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", resourceTitle);
      formData.append("description", resourceDesc);
      formData.append("category", resourceCat);
      formData.append("file", selectedFile);

      const res = await fetch("/api/resources", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setShowUploadModal(false);
        setResourceTitle("");
        setResourceDesc("");
        setSelectedFile(null);
        fetchDashboardData(); // Refresh the dash to show new resource
      } else {
        const err = await res.json();
        alert(err.error || "Failed to upload resource file.");
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(false);
    }
  };

  const statsList = [
    {
      label: "Active Sessions",
      value: data.stats.activeSessions,
      icon: MessageSquare,
      color: "bg-blue-500",
    },
    {
      label: "Pending Updates",
      value: data.stats.pendingUpdates,
      icon: Bell,
      color: "bg-orange-500",
    },
    {
      label: "Resources Shared",
      value: data.stats.resourcesShared,
      icon: BookOpen,
      color: "bg-green-500",
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
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage sessions, resources, and committee updates
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsList.map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardContent>
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 ${stat.color} rounded-lg text-white`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sessions Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upcoming Sessions</CardTitle>
              <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.upcomingSessions.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No upcoming sessions</p>
                ) : data.upcomingSessions.map((session: any) => (
                  <div
                    key={session._id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/30 rounded-full flex items-center justify-center">
                        {session.type?.includes("video") ? (
                          <Video className="w-6 h-6 text-secondary-600" />
                        ) : (
                          <Phone className="w-6 h-6 text-secondary-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{session.userId?.anonymousId || "Anonymous User"}</p>
                        <p className="text-sm text-gray-500 capitalize">{session.type}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                          <Clock className="w-3 h-3" />
                          {new Date(session.scheduledAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="info" size="sm">
                        {session.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Updates */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Updates</CardTitle>
              <Badge variant="warning" size="sm">3 New</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentUpdates.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No recent updates</p>
                ) : data.recentUpdates.map((update: any) => (
                  <div
                    key={update._id}
                    className="flex items-start gap-4 p-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{update.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{update.message}</p>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(update.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Resources to Share */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Resources</CardTitle>
              <Button variant="ghost" size="sm">
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.resources.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No resources yet</p>
              ) : data.resources.map((resource: any) => (
                <div
                  key={resource._id}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary-600" />
                      <p className="font-medium text-sm line-clamp-1">{resource.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {resource.downloadCount}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" size="sm" leftIcon={<Upload className="w-4 h-4" />} onClick={() => setShowUploadModal(true)}>
                Upload New Resource
              </Button>
            </CardContent>
          </Card>

          {/* Committee Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Committee Members</CardTitle>
              <Badge variant="info" size="sm">{committeeMembersList.length} Members</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {committeeMembersList.length === 0 ? (
                <p className="text-gray-500 text-xs text-center py-4">No committee members registered yet.</p>
              ) : committeeMembersList.map((member, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={member.name} size="sm" />
                    <div>
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    member.status === "active" ? "bg-green-500" : "bg-yellow-500"
                  }`} />
                </div>
              ))}
              <Button variant="outline" className="w-full" size="sm" leftIcon={<ExternalLink className="w-4 h-4" />}>
                View Full Committee
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" leftIcon={<Calendar className="w-4 h-4" />}>
                Schedule Session
              </Button>
              <Button variant="outline" className="w-full justify-start" leftIcon={<BookOpen className="w-4 h-4" />}>
                Share Resource
              </Button>
              <Button variant="outline" className="w-full justify-start" leftIcon={<Users className="w-4 h-4" />}>
                Committee Meeting
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upload Resource Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Educational Resource"
        description="Share a guideline, policy template, or handbook with the platform users."
      >
        <div className="space-y-4">
          <Input 
            label="Resource Title" 
            placeholder="e.g. 2024 PoSH Handbook" 
            value={resourceTitle} 
            onChange={(e) => setResourceTitle(e.target.value)} 
          />
          <Select 
            label="Category"
            value={resourceCat}
            onChange={(e) => setResourceCat(e.target.value)}
            options={[
              { label: "Policy Template", value: "policy_template" },
              { label: "PoSH Handbook", value: "posh_handbook" },
              { label: "Legal Guide", value: "legal_guide" },
              { label: "Training Video", value: "training_video" }
            ]}
          />
          <Textarea 
            label="Description" 
            placeholder="A short summary of what this document contains..." 
            value={resourceDesc}
            onChange={(e) => setResourceDesc(e.target.value)}
          />
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">File Attachment</label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              required
            />
          </div>
          
          <div className="pt-4 flex gap-3">
            <Button variant="outline" className="flex-1 cursor-pointer" onClick={() => setShowUploadModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1 cursor-pointer" onClick={handleUploadResource} isLoading={uploading}>
              Upload
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
