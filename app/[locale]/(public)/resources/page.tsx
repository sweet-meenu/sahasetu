"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  BookOpen,
  Video,
  Headphones,
  ExternalLink,
  Search,
  Scale,
  Shield,
  Heart,
  Phone,
  Globe,
  Play,
  Clock,
  Eye,
  File,
  Loader2,
  FolderOpen,
} from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card, { CardContent } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
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
  visibility: string;
  status: string;
  downloadCount: number;
  viewCount: number;
  createdAt: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const categories = [
  { id: "all", label: "All Resources", icon: BookOpen },
  { id: "legal_guide", label: "Legal Guides", icon: Scale },
  { id: "posh_handbook", label: "PoSH Handbooks", icon: FileText },
  { id: "workshop_material", label: "Workshop Materials", icon: BookOpen },
  { id: "counseling_resource", label: "Counseling", icon: Heart },
  { id: "policy_template", label: "Policy Templates", icon: FileText },
  { id: "training_video", label: "Training Videos", icon: Video },
  { id: "helpline_directory", label: "Helpline Directories", icon: Phone },
];

const externalResources = [
  {
    title: "National Commission for Women",
    description: "Official NCW portal with resources and complaint mechanisms",
    url: "http://ncw.nic.in",
    icon: Globe,
  },
  {
    title: "Ministry of Women & Child Development",
    description: "Government schemes and policies for women's safety",
    url: "https://wcd.nic.in",
    icon: Shield,
  },
  {
    title: "She-Box Portal",
    description: "Online complaint management system for sexual harassment",
    url: "http://shebox.nic.in",
    icon: FileText,
  },
];

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: "50", sort: "recent" });
      if (activeCategory !== "all") params.set("category", activeCategory);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/resources?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setResources(data.resources || []);
    } catch {
      console.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    const debounce = setTimeout(() => fetchResources(), 300);
    return () => clearTimeout(debounce);
  }, [fetchResources]);

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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getTypeIcon = (mimeType: string) => {
    if (mimeType?.includes("pdf")) return <FileText className="w-5 h-5 text-red-500" />;
    if (mimeType?.includes("video")) return <Video className="w-5 h-5 text-purple-500" />;
    if (mimeType?.includes("audio")) return <Headphones className="w-5 h-5 text-indigo-500" />;
    return <File className="w-5 h-5 text-blue-500" />;
  };

  const getTypeBadge = (mimeType: string) => {
    if (mimeType?.includes("pdf")) return <Badge variant="primary" size="sm">PDF</Badge>;
    if (mimeType?.includes("video")) return <Badge variant="info" size="sm">Video</Badge>;
    if (mimeType?.includes("audio")) return <Badge variant="secondary" size="sm">Audio</Badge>;
    if (mimeType?.includes("image")) return <Badge variant="success" size="sm">Image</Badge>;
    return <Badge variant="primary" size="sm">Document</Badge>;
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      legal_guide: "from-blue-500 to-blue-600",
      posh_handbook: "from-purple-500 to-purple-600",
      workshop_material: "from-green-500 to-green-600",
      counseling_resource: "from-pink-500 to-pink-600",
      policy_template: "from-orange-500 to-orange-600",
      training_video: "from-red-500 to-red-600",
      helpline_directory: "from-teal-500 to-teal-600",
      other: "from-gray-500 to-gray-600",
    };
    return colors[cat] || colors.other;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary-400 rounded-full blur-3xl" />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              <span>Knowledge is Power</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Resources & Learning Center
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Access comprehensive guides, legal documents, and educational materials 
              to understand your rights and navigate the reporting process with confidence.
            </p>
            <p className="text-sm text-primary-200">
              Resources uploaded and managed by verified Partners and organizations.
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              className="fill-gray-50 dark:fill-gray-900"
            />
          </svg>
        </div>
      </section>

      {/* All Resources */}
      <section className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1">
                <Input
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                    activeCategory === category.id
                      ? "bg-primary-600 text-white shadow-lg shadow-primary-600/25"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  )}
                >
                  <category.icon className="w-4 h-4" />
                  {category.label}
                </button>
              ))}
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
              </div>
            )}

            {/* Empty */}
            {!loading && resources.length === 0 && (
              <div className="text-center py-16">
                <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium mb-2">No resources found</p>
                <p className="text-sm text-gray-400">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Check back later for new resources from our partner Partners"}
                </p>
              </div>
            )}

            {/* Resources Grid */}
            {!loading && resources.length > 0 && (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {resources.map((resource) => (
                  <motion.div
                    key={resource._id}
                    variants={fadeInUp}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="h-full overflow-hidden group hover:shadow-lg transition-shadow">
                      {/* Color header based on category */}
                      <div className={cn(
                        "h-32 bg-gradient-to-br flex items-center justify-center relative",
                        getCategoryColor(resource.category)
                      )}>
                        <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          {getTypeIcon(resource.mimeType)}
                        </div>
                        <div className="absolute top-3 left-3">
                          {getTypeBadge(resource.mimeType)}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                          {resource.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                          {resource.description}
                        </p>
                        <p className="text-xs text-gray-400 mb-3">
                          By {resource.partnerName}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {formatFileSize(resource.fileSize)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            {resource.downloadCount.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {resource.viewCount.toLocaleString()}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          className="w-full"
                          rightIcon={<Download className="w-4 h-4" />}
                          onClick={() => handleDownload(resource)}
                        >
                          Download
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* External Resources */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-8">
            <span className="w-10 h-1 bg-secondary-500 rounded-full" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Government & Official Resources
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {externalResources.map((resource, index) => (
              <motion.a
                key={resource.title}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="h-full hover:shadow-lg hover:border-primary-300 transition-all">
                  <CardContent className="flex items-start gap-4">
                    <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl group-hover:bg-primary-200 transition-colors">
                      <resource.icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                          {resource.title}
                        </h3>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary-600" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {resource.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Helpline Banner */}
      <section className="bg-gradient-to-r from-error/10 via-error/5 to-primary-100 dark:from-error/20 dark:to-primary-900/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-error/20 rounded-full animate-pulse">
                <Phone className="w-8 h-8 text-error" />
              </div>
              <div>
                <p className="font-bold text-xl text-gray-900 dark:text-white">
                  Need Immediate Help?
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Call Women Helpline - Available 24/7
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="tel:181"
                className="flex items-center gap-2 px-8 py-4 bg-error text-white rounded-xl font-bold text-2xl hover:bg-error/90 transition-colors shadow-lg shadow-error/25"
              >
                <Phone className="w-6 h-6" />
                181
              </a>
              <a
                href="tel:100"
                className="flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-xl font-bold text-2xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/25"
              >
                <Phone className="w-6 h-6" />
                100
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
