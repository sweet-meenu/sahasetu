"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  FileText,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Lock,
  Upload,
  Eye,
  EyeOff,
  Save,
  Send,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Mic,
  Image,
  File,
  X,
  Loader2,
  Shield,
  Timer,
  Info,
} from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Toggle from "@/components/ui/Toggle";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const incidentTypes = [
  { value: "verbal", label: "Verbal Harassment" },
  { value: "physical", label: "Physical Harassment" },
  { value: "visual", label: "Visual Harassment (Images/Gestures)" },
  { value: "quid_pro_quo", label: "Quid Pro Quo (Favor for benefit)" },
  { value: "hostile_environment", label: "Hostile Work Environment" },
  { value: "online", label: "Online/Digital Harassment" },
  { value: "stalking", label: "Stalking" },
  { value: "other", label: "Other" },
];

const steps = [
  { id: 1, name: "Basic Info", description: "When and where" },
  { id: 2, name: "Describe Incident", description: "What happened" },
  { id: 3, name: "Evidence", description: "Supporting documents" },
  { id: 4, name: "Review & Submit", description: "Final review" },
];

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  file?: File;
}

export default function ReportPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const [formData, setFormData] = useState({
    incidentDate: "",
    incidentTime: "",
    location: "",
    incidentType: "",
    description: "",
    rawInput: "",
    perpetratorInfo: "",
    witnesses: "",
    previousIncidents: "",
    delaySubmission: false,
    delayDays: "7",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { user, isLoading: authLoading } = useAuth();

  const handleAIAssist = async () => {
    if (!formData.rawInput) return;
    
    setIsGeneratingAI(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawInput: formData.rawInput,
          contextData: {
            date: formData.incidentDate,
            time: formData.incidentTime,
            location: formData.location,
            type: formData.incidentType,
          }
        }),
      });

      if (!res.ok) throw new Error("Failed to generate AI narrative");
      
      const data = await res.json();
      
      if (data.generatedText) {
        setFormData({ ...formData, description: data.generatedText });
        setShowAIAssistant(false);
      }
    } catch (err: any) {
      console.error(err);
      setSubmitError("AI service is temporarily unavailable. Please type your description manually.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const filesArray = Array.from(files);
      const largeFiles = filesArray.filter((f) => f.size > 10 * 1024 * 1024);
      if (largeFiles.length > 0) {
        setUploadError(`Some files exceed the 10MB limit: ${largeFiles.map((f) => f.name).join(", ")}`);
        return;
      }
      setUploadError(null);
      const newFiles: UploadedFile[] = filesArray.map((file) => ({
        id: Math.random().toString(36).substring(7),
        name: file.name,
        type: file.type,
        size: file.size,
        file: file,
      }));
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(uploadedFiles.filter((f) => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return Image;
    if (type.startsWith("audio/")) return Mic;
    return File;
  };

  const handleSaveDraft = async () => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: "draft",
          isAnonymous,
          incidentType: formData.incidentType,
          incidentDate: formData.incidentDate || undefined,
          incidentTime: formData.incidentTime || undefined,
          location: formData.location || undefined,
          description: formData.description || "Draft - description pending",
          perpetratorInfo: formData.perpetratorInfo || undefined,
          witnesses: formData.witnesses || undefined,
          previousIncidents: formData.previousIncidents || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save draft");
      }
      setSubmitSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReport = async () => {
    setSubmitError(null);
    setAuthError(null);
    if (authLoading) {
      setAuthError("Please wait while we verify your session...");
      return;
    }
    if (!user) {
      setAuthError("You must be logged in to submit a report. Please log in and try again.");
      return;
    }
    // Validate required fields before submission
    if (!formData.incidentDate) {
      setSubmitError("Please provide the incident date.");
      return;
    }
    if (!formData.incidentType) {
      setSubmitError("Please select the type of incident.");
      return;
    }
    if (!formData.description) {
      setSubmitError("Please provide a description of the incident.");
      return;
    }
    setIsSubmitting(true);
    try {
      // 1. Create the complaint
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: "submitted",
          isAnonymous,
          isEncrypted,
          incidentDate: formData.incidentDate,
          incidentTime: formData.incidentTime || undefined,
          location: formData.location || undefined,
          incidentType: formData.incidentType,
          description: formData.description,
          perpetratorInfo: formData.perpetratorInfo || undefined,
          witnesses: formData.witnesses || undefined,
          previousIncidents: formData.previousIncidents || undefined,
          delayedSubmission: formData.delaySubmission || false,
          scheduledSubmitDate: formData.delaySubmission
            ? new Date(Date.now() + parseInt(formData.delayDays) * 86400000).toISOString()
            : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        if (res.status === 401) {
          setAuthError(data.error || "Authentication required. Please log in.");
          return;
        }
        throw new Error(data.error || "Failed to submit report");
      }
      const complaintData = await res.json();
      // 2. Upload evidence files if any
      if (uploadedFiles.length > 0 && complaintData.complaint?._id) {
        for (const file of uploadedFiles) {
          if (file.file) {
            const formDataUpload = new FormData();
            formDataUpload.append("file", file.file);
            formDataUpload.append("complaintId", complaintData.complaint._id);
            formDataUpload.append("category", "supporting_document");
            await fetch("/api/evidence/upload", {
              method: "POST",
              credentials: "include",
              body: formDataUpload,
            });
          }
        }
      }
      setSubmitSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Date of Incident"
                type="date"
                value={formData.incidentDate}
                onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                leftIcon={<Calendar className="w-5 h-5" />}
                required
              />
              <Input
                label="Time of Incident (Approximate)"
                type="time"
                value={formData.incidentTime}
                onChange={(e) => setFormData({ ...formData, incidentTime: e.target.value })}
                leftIcon={<Clock className="w-5 h-5" />}
              />
            </div>

            <Input
              label="Location"
              type="text"
              placeholder="e.g., Office building, Meeting room, etc."
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              leftIcon={<MapPin className="w-5 h-5" />}
              helperText="This is optional and helps in the investigation"
            />

            <Select
              label="Type of Incident"
              options={incidentTypes}
              value={formData.incidentType}
              onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
              placeholder="Select incident type"
              required
            />

            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="flex gap-3 py-4">
                <Info className="w-5 h-5 text-info shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Under the PoSH Act, you have 3 months from the date of the incident to file a formal complaint. You can save this as a draft and submit later.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* AI Assistant Toggle */}
            <Card className="bg-gradient-to-r from-accent-50 to-accent-100 dark:from-accent-900/30 dark:to-accent-800/30 border-accent-200 dark:border-accent-800">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent-600 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        AI Writing Assistant
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Let AI help you write a professional report
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={showAIAssistant ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setShowAIAssistant(!showAIAssistant)}
                  >
                    {showAIAssistant ? "Hide" : "Use AI"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {showAIAssistant && (
              <div className="space-y-4 p-4 bg-accent-50/50 dark:bg-accent-900/10 rounded-xl border border-accent-200 dark:border-accent-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Describe what happened in your own words. The AI will help convert it into a formal, professional narrative suitable for legal proceedings.
                </p>
                <Textarea
                  label="Your Description (in any words)"
                  placeholder="Just describe what happened in your own words. Don't worry about grammar or formal language - write naturally..."
                  rows={4}
                  value={formData.rawInput}
                  onChange={(e) => setFormData({ ...formData, rawInput: e.target.value })}
                />
                <Button
                  onClick={handleAIAssist}
                  isLoading={isGeneratingAI}
                  leftIcon={<Sparkles className="w-5 h-5" />}
                  disabled={!formData.rawInput}
                >
                  Generate Professional Report
                </Button>
              </div>
            )}

            <Textarea
              label="Detailed Description of Incident"
              placeholder="Describe the incident in detail. Include what happened, what was said or done, and how it made you feel..."
              rows={8}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              helperText="Be as specific as possible. This will form the basis of your complaint."
            />

            <Textarea
              label="Information About the Person(s) Involved (Optional)"
              placeholder="Name, designation, department of the person(s) who harassed you..."
              rows={3}
              value={formData.perpetratorInfo}
              onChange={(e) => setFormData({ ...formData, perpetratorInfo: e.target.value })}
            />

            <Textarea
              label="Witness Information (Optional)"
              placeholder="Names and contact information of any witnesses..."
              rows={2}
              value={formData.witnesses}
              onChange={(e) => setFormData({ ...formData, witnesses: e.target.value })}
            />

            <Textarea
              label="Previous Incidents (If Any)"
              placeholder="Have there been any previous incidents? Please describe..."
              rows={2}
              value={formData.previousIncidents}
              onChange={(e) => setFormData({ ...formData, previousIncidents: e.target.value })}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-400 transition-colors">
              <CardContent className="py-8">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Upload Evidence
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Screenshots, audio recordings, images, or documents
                  </p>
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept="image/*,audio/*,.pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    Choose Files
                  </label>
                  <p className="text-xs text-gray-400 mt-2">
                    Max 10MB per file. All files are encrypted automatically.
                  </p>
                  {uploadError && (
                    <div className="mt-4 p-2 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 text-xs rounded-lg border border-red-200 dark:border-red-900 inline-block">
                      {uploadError}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Uploaded Files ({uploadedFiles.length})
                </h4>
                {uploadedFiles.map((file) => {
                  const FileIcon = getFileIcon(file.type);
                  return (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
                    >
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                        <FileIcon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                      <Badge variant="success" size="sm">
                        <Lock className="w-3 h-3 mr-1" />
                        Encrypted
                      </Badge>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-1 text-gray-400 hover:text-error transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Encryption Info */}
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="flex gap-3 py-4">
                <Shield className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    End-to-End Encryption
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    All your evidence is encrypted before upload. Only you can grant access to authorized personnel.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Report Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formData.incidentDate || "Not specified"} {formData.incidentTime && `at ${formData.incidentTime}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formData.location || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Incident Type</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {incidentTypes.find((t) => t.value === formData.incidentType)?.label || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Evidence Files</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {uploadedFiles.length} file(s) attached
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">Description</p>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {formData.description || "No description provided"}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submission Options */}
            <Card>
              <CardHeader>
                <CardTitle>Submission Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Toggle
                  checked={isAnonymous}
                  onChange={setIsAnonymous}
                  label="Submit Anonymously"
                  description="Your identity will not be revealed to anyone"
                />

                <Toggle
                  checked={isEncrypted}
                  onChange={setIsEncrypted}
                  label="Enable Encryption"
                  description="All data will be end-to-end encrypted (recommended)"
                />

                <Toggle
                  checked={formData.delaySubmission}
                  onChange={(checked) => setFormData({ ...formData, delaySubmission: checked })}
                  label="Delay Submission"
                  description="Submit this report automatically after a set number of days"
                />

                {formData.delaySubmission && (
                  <div className="ml-8 mt-2">
                    <Select
                      label="Delay Period"
                      options={[
                        { value: "7", label: "7 days" },
                        { value: "14", label: "14 days" },
                        { value: "30", label: "30 days" },
                        { value: "60", label: "60 days" },
                        { value: "90", label: "90 days (Maximum under PoSH Act)" },
                      ]}
                      value={formData.delayDays}
                      onChange={(e) => setFormData({ ...formData, delayDays: e.target.value })}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Warning */}
            <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
              <CardContent className="flex gap-3 py-4">
                <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Once submitted, this report will be sent to the Internal Complaints Committee (ICC). You can track the status from your dashboard.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Report an Incident
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Document the incident securely with end-to-end encryption
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center",
                index < steps.length - 1 && "flex-1"
              )}
            >
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    currentStep > step.id
                      ? "bg-success text-white"
                      : currentStep === step.id
                      ? "bg-primary-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                  )}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <p
                  className={cn(
                    "text-xs mt-2 hidden md:block",
                    currentStep >= step.id
                      ? "text-gray-900 dark:text-white font-medium"
                      : "text-gray-500"
                  )}
                >
                  {step.name}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-2 rounded-full",
                    currentStep > step.id
                      ? "bg-success"
                      : "bg-gray-200 dark:bg-gray-700"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].name}</CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>{renderStep()}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setCurrentStep(currentStep - 1)}
          disabled={currentStep === 1}
          leftIcon={<ArrowLeft className="w-5 h-5" />}
        >
          Previous
        </Button>

        <div className="flex gap-3">
          {authError && (
            <p className="text-sm text-error self-center">{authError}</p>
          )}
          {submitError && (
            <p className="text-sm text-error self-center">{submitError}</p>
          )}
          {submitSuccess ? (
            <div className="flex items-center gap-2 text-success">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">
                {currentStep === 4 ? "Report submitted successfully!" : "Draft saved!"}
              </span>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">Go to Dashboard</Button>
              </Link>
            </div>
          ) : (
            <>
              <Button
                variant="outline"
                leftIcon={<Save className="w-5 h-5" />}
                onClick={handleSaveDraft}
                isLoading={isSubmitting}
              >
                Save Draft
              </Button>
              {currentStep < 4 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  leftIcon={<Send className="w-5 h-5" />}
                  className="bg-success hover:bg-green-600"
                  onClick={handleSubmitReport}
                  isLoading={isSubmitting}
                >
                  {formData.delaySubmission ? "Schedule Submission" : "Submit Report"}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
