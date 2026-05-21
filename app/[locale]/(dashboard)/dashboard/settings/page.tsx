"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  User,
  Shield,
  Bell,
  Globe,
  Lock,
  Eye,
  Download,
  Trash2,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Smartphone,
  Mail,
  Key,
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Toggle from "@/components/ui/Toggle";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

const languages = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिंदी (Hindi)" },
  { value: "mr", label: "मराठी (Marathi)" },
  { value: "ta", label: "தமிழ் (Tamil)" },
  { value: "te", label: "తెలుగు (Telugu)" },
  { value: "bn", label: "বাংলা (Bengali)" },
];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const params = useParams();
  const currentLocale = (params?.locale as string) || "en";
  const t = useTranslations("settings");

  const [activeSection, setActiveSection] = useState("profile");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    // Profile
    name: "",
    email: "",
    phone: "",

    // Privacy
    anonymousMode: false,
    hideIdentity: true,
    encryptEverything: true,
    autoDeleteDrafts: false,
    autoDeleteDays: "30",

    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    caseUpdates: true,
    counselingReminders: true,
    workshopAlerts: false,

    // Appearance
    language: "en",
    darkMode: false,
    compactView: false,

    // Security
    twoFactorEnabled: true,
    loginAlerts: true,
    sessionTimeout: "30",
  });

  useEffect(() => {
    if (user) {
      setSettings((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        language: user.languages?.[0] || currentLocale || "en",
      }));
    }
  }, [user, currentLocale]);

  // Saves language instantly and redirects dynamically
  async function handleLanguageChange(newLang: string) {
    setSettings((prev) => ({ ...prev, language: newLang }));
    
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: newLang,
        }),
      });

      if (!res.ok) {
        console.error("Failed to automatically save language setting");
      }
    } catch (err) {
      console.error("Auto language save failed:", err);
    }

    // Set the cookie so next-intl middleware picks it up
    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000`;

    if (newLang !== currentLocale) {
      const pathname = window.location.pathname;
      const segments = pathname.split('/');
      const supportedLocales = ['en', 'hi', 'mr', 'ta', 'te', 'bn'];

      if (segments[1] && segments[1].length === 2 && supportedLocales.includes(segments[1])) {
        if (newLang === 'en') {
          segments.splice(1, 1);
        } else {
          segments[1] = newLang;
        }
        window.location.href = segments.join('/') || '/';
      } else {
        if (newLang !== 'en') {
          window.location.href = `/${newLang}${pathname}`;
        } else {
          window.location.reload();
        }
      }
    }
  }

  async function handleSaveSettings() {
    setSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: settings.name,
          phone: settings.phone,
          language: settings.language,
        }),
      });
      if (!res.ok) {
        console.error("Failed to save settings");
        return;
      }

      // Automatically change path segment locale if saved language changes
      if (settings.language) {
        document.cookie = `NEXT_LOCALE=${settings.language}; path=/; max-age=31536000`;

        if (settings.language !== currentLocale) {
          const pathname = window.location.pathname;
          const segments = pathname.split('/');
          const supportedLocales = ['en', 'hi', 'mr', 'ta', 'te', 'bn'];

          if (segments[1] && segments[1].length === 2 && supportedLocales.includes(segments[1])) {
            if (settings.language === 'en') {
              segments.splice(1, 1);
            } else {
              segments[1] = settings.language;
            }
            window.location.href = segments.join('/') || '/';
          } else {
            if (settings.language !== 'en') {
              window.location.href = `/${settings.language}${pathname}`;
            } else {
              window.location.reload();
            }
          }
        }
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  }

  const sections = [
    { id: "profile", label: t("profile"), icon: User },
    { id: "privacy", label: t("privacy"), icon: Shield },
    { id: "notifications", label: t("notifications"), icon: Bell },
    { id: "appearance", label: t("appearance"), icon: Globe },
    { id: "data", label: t("data"), icon: Download },
    { id: "account", label: t("account"), icon: Settings },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar name={settings.name} size="xl" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {settings.name}
                </h3>
                <p className="text-sm text-gray-500">{settings.email}</p>
                <Button variant="outline" size="sm" className="mt-2">
                  {t("changePhoto")}
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label={t("fullName")}
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              />
              <Input
                label={t("emailAddress")}
                type="email"
                value={settings.email}
                disabled
              />
              <Input
                label={t("phone")}
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              />
            </div>

            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="flex gap-3 py-3">
                <Info className="w-5 h-5 text-blue-500 shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {t("profileNotice")}
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("identityProtection")}</CardTitle>
                <CardDescription>{t("controlIdentity")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Toggle
                  checked={settings.anonymousMode}
                  onChange={(checked) => setSettings({ ...settings, anonymousMode: checked })}
                  label={t("anonymousMode")}
                  description={t("anonymousModeDesc")}
                />
                <Toggle
                  checked={settings.hideIdentity}
                  onChange={(checked) => setSettings({ ...settings, hideIdentity: checked })}
                  label={t("hideIdentity")}
                  description={t("hideIdentityDesc")}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("dataSecurity")}</CardTitle>
                <CardDescription>{t("encryptionSettings")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Toggle
                  checked={settings.encryptEverything}
                  onChange={(checked) => setSettings({ ...settings, encryptEverything: checked })}
                  label={t("e2e")}
                  description={t("e2eDesc")}
                />
                <Toggle
                  checked={settings.autoDeleteDrafts}
                  onChange={(checked) => setSettings({ ...settings, autoDeleteDrafts: checked })}
                  label={t("autoDeleteDrafts")}
                  description={t("autoDeleteDraftsDesc")}
                />
                {settings.autoDeleteDrafts && (
                  <Select
                    label={t("deleteAfter")}
                    options={[
                      { value: "7", label: t("days7") },
                      { value: "14", label: t("days14") },
                      { value: "30", label: t("days30") },
                      { value: "90", label: t("days90") },
                    ]}
                    value={settings.autoDeleteDays}
                    onChange={(e) => setSettings({ ...settings, autoDeleteDays: e.target.value })}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("securitySettings")}</CardTitle>
                <CardDescription>{t("protectAccess")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Toggle
                  checked={settings.twoFactorEnabled}
                  onChange={(checked) => setSettings({ ...settings, twoFactorEnabled: checked })}
                  label={t("tfa")}
                  description={t("tfaDesc")}
                />
                <Toggle
                  checked={settings.loginAlerts}
                  onChange={(checked) => setSettings({ ...settings, loginAlerts: checked })}
                  label={t("loginAlerts")}
                  description={t("loginAlertsDesc")}
                />
                <Select
                  label={t("sessionTimeout")}
                  options={[
                    { value: "15", label: `15 ${currentLocale === "en" ? "minutes" : "मिनट"}` },
                    { value: "30", label: `30 ${currentLocale === "en" ? "minutes" : "मिनट"}` },
                    { value: "60", label: `1 ${currentLocale === "en" ? "hour" : "घंटा"}` },
                    { value: "120", label: `2 ${currentLocale === "en" ? "hours" : "घंटे"}` },
                  ]}
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                />
                <Button variant="outline" leftIcon={<Key className="w-4 h-4" />}>
                  {t("changePassword")}
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("notificationChannels")}</CardTitle>
                <CardDescription>{t("chooseNotify")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Toggle
                  checked={settings.emailNotifications}
                  onChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                  label={t("emailNotifications")}
                  description={t("emailNotifyDesc")}
                />
                <Toggle
                  checked={settings.smsNotifications}
                  onChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
                  label={t("smsNotifications")}
                  description={t("smsNotifyDesc")}
                />
                <Toggle
                  checked={settings.pushNotifications}
                  onChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
                  label={t("pushNotifications")}
                  description={t("pushNotifyDesc")}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("notificationTypes")}</CardTitle>
                <CardDescription>{t("selectNotifyTypes")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Toggle
                  checked={settings.caseUpdates}
                  onChange={(checked) => setSettings({ ...settings, caseUpdates: checked })}
                  label={t("caseUpdates")}
                  description={t("caseUpdatesDesc")}
                />
                <Toggle
                  checked={settings.counselingReminders}
                  onChange={(checked) => setSettings({ ...settings, counselingReminders: checked })}
                  label={t("counselingReminders")}
                  description={t("counselingRemindersDesc")}
                />
                <Toggle
                  checked={settings.workshopAlerts}
                  onChange={(checked) => setSettings({ ...settings, workshopAlerts: checked })}
                  label={t("workshopAlerts")}
                  description={t("workshopAlertsDesc")}
                />
              </CardContent>
            </Card>
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("language")}</CardTitle>
                <CardDescription>{t("chooseLanguage")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  options={languages}
                  value={settings.language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("theme")}</CardTitle>
                <CardDescription>{t("customizeAppearance")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, darkMode: false })}
                    className={cn(
                      "flex-1 p-4 rounded-xl border-2 transition-all",
                      !settings.darkMode
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-950/20"
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-800"
                    )}
                  >
                    <Sun className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                    <p className="text-sm font-medium">{t("light")}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, darkMode: true })}
                    className={cn(
                      "flex-1 p-4 rounded-xl border-2 transition-all",
                      settings.darkMode
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-950/20"
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-800"
                    )}
                  >
                    <Moon className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                    <p className="text-sm font-medium">{t("dark")}</p>
                  </button>
                </div>
                <Toggle
                  checked={settings.compactView}
                  onChange={(checked) => setSettings({ ...settings, compactView: checked })}
                  label={t("compactView")}
                  description={t("compactViewDesc")}
                />
              </CardContent>
            </Card>
          </div>
        );

      case "data":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("exportData")}</CardTitle>
                <CardDescription>{t("downloadCopy")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t("exportDesc")}
                </p>
                <Button
                  variant="outline"
                  leftIcon={<Download className="w-4 h-4" />}
                  onClick={() => setShowExportModal(true)}
                >
                  {t("requestExport")}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-900/50">
              <CardHeader>
                <CardTitle className="text-base text-red-600 dark:text-red-400">{t("deleteData")}</CardTitle>
                <CardDescription>{t("permanentlyRemove")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t("deleteDesc")}
                </p>
                <Button
                  variant="danger"
                  leftIcon={<Trash2 className="w-4 h-4" />}
                  onClick={() => setShowDeleteModal(true)}
                >
                  {t("deleteAllData")}
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case "account":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("accountStatus")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      {t("accountVerified")}
                    </span>
                  </div>
                  <Badge variant="success" size="sm">{t("active")}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t("memberSince")}
                  </span>
                  <span className="text-sm font-medium">{t("memberDate")}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("activeSessions")}</CardTitle>
                <CardDescription>{t("loggedDevices")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">{t("thisDevice")}</p>
                      <p className="text-xs text-gray-500">{t("deviceInfo")}</p>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">{t("current")}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-900/50">
              <CardHeader>
                <CardTitle className="text-base text-red-600 dark:text-red-400">{t("dangerZone")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-between" leftIcon={<LogOut className="w-4 h-4" />}>
                  {t("signOutAll")}
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="danger"
                  className="w-full justify-between"
                  leftIcon={<Trash2 className="w-4 h-4" />}
                  onClick={() => setShowDeleteModal(true)}
                >
                  {t("deleteAccount")}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
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
          {t("title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t("subtitle")}
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
      <div className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8">
        <Button size="lg" className="shadow-lg" onClick={handleSaveSettings} disabled={saving}>
          {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle className="w-5 h-5 mr-2" />}
          {saving ? t("saving") : t("saveChanges")}
        </Button>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t("confirmDeleteTitle")}
        description={t("confirmDeleteDesc")}
      >
        <div className="space-y-4">
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50">
            <CardContent className="flex gap-3 py-4">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <p className="font-medium text-red-600 mb-1">{t("warning")}</p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {t("deleteWarningText")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Input
            label={t("typeDelete")}
            placeholder={t("deletePlaceholder")}
          />

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowDeleteModal(false)}>
              {t("cancelBtn")}
            </Button>
            <Button variant="danger" className="flex-1">
              {t("deleteEverythingBtn")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title={t("confirmExportTitle")}
        description={t("confirmExportDesc")}
      >
        <div className="space-y-4">
          <div className="space-y-3">
            {[
              { id: "reports", label: t("exportReports") },
              { id: "evidence", label: t("exportEvidence") },
              { id: "counseling", label: t("exportCounseling") },
              { id: "account", label: t("exportAccount") }
            ].map((item) => (
              <label key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-primary-600 focus:ring-primary-500" />
                <span className="text-sm">{item.label}</span>
              </label>
            ))}
          </div>

          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="flex gap-3 py-3">
              <Shield className="w-5 h-5 text-blue-500 shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {t("exportNotice")}
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowExportModal(false)}>
              {t("cancelBtn")}
            </Button>
            <Button className="flex-1" leftIcon={<Download className="w-4 h-4" />}>
              {t("generateExportBtn")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
