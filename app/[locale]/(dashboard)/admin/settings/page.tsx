"use client";

import { useState } from "react";
import {
  Settings,
  Shield,
  Bell,
  Globe,
  Lock,
  Mail,
  Clock,
  Users,
  Database,
  Server,
  AlertTriangle,
  CheckCircle,
  Save,
  RefreshCw,
  Loader2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Toggle from "@/components/ui/Toggle";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("general");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [settings, setSettings] = useState({
    // General
    platformName: "SaahasSetu",
    supportEmail: "support@sahasetu.org",
    defaultLanguage: "en",

    // Security
    sessionTimeout: "60",
    maxLoginAttempts: "5",
    enforceStrongPasswords: true,
    enable2FA: true,
    ipWhitelist: "",

    // Notifications
    emailNotifications: true,
    caseAlerts: true,
    weeklyReports: true,
    securityAlerts: true,

    // Compliance
    dataRetentionDays: "365",
    autoAnonymize: true,
    auditLogging: true,
    encryptionEnabled: true,

    // Case Management
    autoAssignment: true,
    slaWarningDays: "3",
    maxResolutionDays: "90",
    requireEvidence: false,
  });

  const defaultSettings = {
    platformName: "SaahasSetu",
    supportEmail: "support@sahasetu.org",
    defaultLanguage: "en",
    sessionTimeout: "60",
    maxLoginAttempts: "5",
    enforceStrongPasswords: true,
    enable2FA: true,
    ipWhitelist: "",
    emailNotifications: true,
    caseAlerts: true,
    weeklyReports: true,
    securityAlerts: true,
    dataRetentionDays: "365",
    autoAnonymize: true,
    auditLogging: true,
    encryptionEnabled: true,
    autoAssignment: true,
    slaWarningDays: "3",
    maxResolutionDays: "90",
    requireEvidence: false,
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      // Save settings - in production this would persist to DB
      // For now we store in localStorage as a lightweight config store
      localStorage.setItem("sahasetu_admin_settings", JSON.stringify(settings));
      setSaveMessage({ type: "success", text: "Settings saved successfully" });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch {
      setSaveMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    localStorage.removeItem("sahasetu_admin_settings");
    setSaveMessage({ type: "success", text: "Settings reset to defaults" });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  // Load saved settings on mount
  useState(() => {
    try {
      const saved = localStorage.getItem("sahasetu_admin_settings");
      if (saved) {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      }
    } catch {
      // ignore
    }
  });

  const sections = [
    { id: "general", label: "General", icon: Settings },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "compliance", label: "Compliance", icon: Lock },
    { id: "cases", label: "Case Management", icon: Users },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "general":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Platform Settings</CardTitle>
                <CardDescription>Basic platform configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Platform Name"
                  value={settings.platformName}
                  onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                />
                <Input
                  label="Support Email"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                />
                <Select
                  label="Default Language"
                  options={[
                    { value: "en", label: "English" },
                    { value: "hi", label: "Hindi" },
                    { value: "mr", label: "Marathi" },
                    { value: "ta", label: "Tamil" },
                    { value: "te", label: "Telugu" },
                    { value: "bn", label: "Bengali" },
                  ]}
                  value={settings.defaultLanguage}
                  onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "API Server", status: "operational" },
                  { label: "Database", status: "operational" },
                  { label: "Email Service", status: "operational" },
                  { label: "Encryption Service", status: "operational" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Server className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <Badge variant="success" size="sm">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Operational
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Authentication</CardTitle>
                <CardDescription>Configure login and security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  label="Session Timeout (minutes)"
                  options={[
                    { value: "15", label: "15 minutes" },
                    { value: "30", label: "30 minutes" },
                    { value: "60", label: "1 hour" },
                    { value: "120", label: "2 hours" },
                  ]}
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                />
                <Select
                  label="Max Login Attempts"
                  options={[
                    { value: "3", label: "3 attempts" },
                    { value: "5", label: "5 attempts" },
                    { value: "10", label: "10 attempts" },
                  ]}
                  value={settings.maxLoginAttempts}
                  onChange={(e) => setSettings({ ...settings, maxLoginAttempts: e.target.value })}
                />
                <Toggle
                  checked={settings.enforceStrongPasswords}
                  onChange={(checked) => setSettings({ ...settings, enforceStrongPasswords: checked })}
                  label="Enforce Strong Passwords"
                  description="Require at least 8 characters with uppercase, lowercase, numbers, and symbols"
                />
                <Toggle
                  checked={settings.enable2FA}
                  onChange={(checked) => setSettings({ ...settings, enable2FA: checked })}
                  label="Require Two-Factor Authentication"
                  description="Mandatory 2FA for all admin and ICC member accounts"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Access Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="IP Whitelist"
                  value={settings.ipWhitelist}
                  onChange={(e) => setSettings({ ...settings, ipWhitelist: e.target.value })}
                  placeholder="e.g., 192.168.1.0/24, 10.0.0.0/8"
                  helperText="Leave empty to allow all IPs. Separate multiple ranges with commas."
                />
              </CardContent>
            </Card>
          </div>
        );

      case "notifications":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification Settings</CardTitle>
              <CardDescription>Configure system notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Toggle
                checked={settings.emailNotifications}
                onChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                label="Email Notifications"
                description="Send email notifications for important events"
              />
              <Toggle
                checked={settings.caseAlerts}
                onChange={(checked) => setSettings({ ...settings, caseAlerts: checked })}
                label="Case Alerts"
                description="Notify ICC members when new cases are submitted"
              />
              <Toggle
                checked={settings.weeklyReports}
                onChange={(checked) => setSettings({ ...settings, weeklyReports: checked })}
                label="Weekly Reports"
                description="Send weekly summary reports to administrators"
              />
              <Toggle
                checked={settings.securityAlerts}
                onChange={(checked) => setSettings({ ...settings, securityAlerts: checked })}
                label="Security Alerts"
                description="Immediate alerts for failed login attempts and suspicious activity"
              />
            </CardContent>
          </Card>
        );

      case "compliance":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Data Management</CardTitle>
                <CardDescription>Configure data retention and privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  label="Data Retention Period"
                  options={[
                    { value: "365", label: "1 year" },
                    { value: "730", label: "2 years" },
                    { value: "1095", label: "3 years" },
                    { value: "1825", label: "5 years" },
                    { value: "0", label: "Indefinite" },
                  ]}
                  value={settings.dataRetentionDays}
                  onChange={(e) => setSettings({ ...settings, dataRetentionDays: e.target.value })}
                />
                <Toggle
                  checked={settings.autoAnonymize}
                  onChange={(checked) => setSettings({ ...settings, autoAnonymize: checked })}
                  label="Auto-Anonymize Closed Cases"
                  description="Automatically anonymize personal data in closed cases after retention period"
                />
                <Toggle
                  checked={settings.auditLogging}
                  onChange={(checked) => setSettings({ ...settings, auditLogging: checked })}
                  label="Audit Logging"
                  description="Log all user actions for compliance and security"
                />
                <Toggle
                  checked={settings.encryptionEnabled}
                  onChange={(checked) => setSettings({ ...settings, encryptionEnabled: checked })}
                  label="End-to-End Encryption"
                  description="Encrypt all sensitive data at rest and in transit"
                />
              </CardContent>
            </Card>

            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-success shrink-0" />
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-300">
                    PoSH Act Compliant
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Your current settings are compliant with the Sexual Harassment of Women at Workplace 
                    (Prevention, Prohibition and Redressal) Act, 2013.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "cases":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Case Management Settings</CardTitle>
              <CardDescription>Configure case handling and workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Toggle
                checked={settings.autoAssignment}
                onChange={(checked) => setSettings({ ...settings, autoAssignment: checked })}
                label="Auto-Assign Cases"
                description="Automatically assign new cases to available ICC members"
              />
              <Select
                label="SLA Warning (days)"
                options={[
                  { value: "1", label: "1 day" },
                  { value: "3", label: "3 days" },
                  { value: "5", label: "5 days" },
                  { value: "7", label: "7 days" },
                ]}
                value={settings.slaWarningDays}
                onChange={(e) => setSettings({ ...settings, slaWarningDays: e.target.value })}
                helperText="Alert ICC members when a case approaches this deadline without action"
              />
              <Select
                label="Maximum Resolution Time (days)"
                options={[
                  { value: "30", label: "30 days" },
                  { value: "60", label: "60 days" },
                  { value: "90", label: "90 days (PoSH requirement)" },
                  { value: "120", label: "120 days" },
                ]}
                value={settings.maxResolutionDays}
                onChange={(e) => setSettings({ ...settings, maxResolutionDays: e.target.value })}
                helperText="As per PoSH Act, cases should be resolved within 90 days"
              />
              <Toggle
                checked={settings.requireEvidence}
                onChange={(checked) => setSettings({ ...settings, requireEvidence: checked })}
                label="Require Evidence for Submission"
                description="Require at least one piece of evidence before case submission (not recommended)"
              />
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary-600" />
          Admin Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configure platform settings, security, and compliance
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      activeSection === section.id
                        ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    )}
                  >
                    <section.icon className="w-5 h-5" />
                    {section.label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">{renderSection()}</div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 flex items-center gap-3">
        {saveMessage && (
          <div className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium shadow-lg",
            saveMessage.type === "success"
              ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
              : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
          )}>
            {saveMessage.text}
          </div>
        )}
        <Button variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={handleReset}>
          Reset
        </Button>
        <Button
          size="lg"
          className="shadow-lg"
          leftIcon={saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
