"use client";

import { cn } from "@/lib/utils";
import {
  Home,
  FileText,
  FolderLock,
  MessageCircle,
  Building2,
  Settings,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
  Bell,
  HelpCircle,
  Users,
  BarChart3,
  Gavel,
  BookOpen,
  Activity,
  Loader2,
  Download,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Avatar from "../ui/Avatar";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  userRole?: "user" | "admin" | "partner";
  mobileOpen?: boolean;
  onClose?: () => void;
}

const userNavigation = [
  { key: "dashboard", href: "/dashboard", icon: Home },
  { key: "reportIncident", href: "/dashboard/report", icon: FileText },
  { key: "evidenceVault", href: "/dashboard/evidence", icon: FolderLock },
  { key: "counseling", href: "/dashboard/counseling", icon: MessageCircle },
  { key: "partners", href: "/dashboard/partners", icon: Building2 },
  { key: "help", href: "/dashboard/help", icon: HelpCircle },
  { key: "settings", href: "/dashboard/settings", icon: Settings },
];

const adminNavigation = [
  { key: "dashboard", href: "/admin", icon: Home },
  { key: "cases", href: "/admin/cases", icon: FileText },
  { key: "users", href: "/admin/users", icon: Users },
  { key: "committees", href: "/admin/committees", icon: Gavel },
  { key: "reports", href: "/admin/reports", icon: BarChart3 },
  { key: "auditLog", href: "/admin/audit", icon: Activity },
  { key: "settings", href: "/admin/settings", icon: Settings },
];

const partnerNavigation = [
  { key: "dashboard", href: "/partner", icon: Home },
  { key: "sessions", href: "/partner/sessions", icon: MessageCircle },
  { key: "committee", href: "/partner/committee", icon: Gavel },
  { key: "resources", href: "/partner/resources", icon: BookOpen },
];

export default function Sidebar({ userRole = "user", mobileOpen = false, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const locale = useLocale();

  const [installable, setInstallable] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkIfInstallable = () => {
      const isInstalled = (window as any).isPWAInstalled || window.matchMedia('(display-mode: standalone)').matches;
      const hasPrompt = !!(window as any).deferredPrompt;
      setInstallable(hasPrompt && !isInstalled);
    };

    // Initial check
    checkIfInstallable();

    // Listen for custom events
    const handleInstallable = () => setInstallable(true);
    const handleInstalledStatus = (e: any) => {
      if (e.detail === true) {
        setInstallable(false);
      } else {
        checkIfInstallable();
      }
    };

    window.addEventListener("pwa-installable", handleInstallable);
    window.addEventListener("pwa-installed-status", handleInstalledStatus);

    return () => {
      window.removeEventListener("pwa-installable", handleInstallable);
      window.removeEventListener("pwa-installed-status", handleInstalledStatus);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = (window as any).deferredPrompt;
    if (!promptEvent) return;

    // Show the native install prompt
    promptEvent.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await promptEvent.userChoice;
    console.log(`PWA install prompt outcome: ${outcome}`);

    // We've used the prompt, and can't use it again, discard it
    (window as any).deferredPrompt = null;
    setInstallable(false);
  };

  const pwaTranslations: Record<string, { title: string; desc: string; btn: string }> = {
    en: { title: "Install SaahasSetu", desc: "Get secure offline access and instant notifications.", btn: "Install App" },
    hi: { title: "SaahasSetu इंस्टॉल करें", desc: "सुरक्षित ऑफ़लाइन पहुँच और त्वरित सूचनाएं प्राप्त करें।", btn: "ऐप इंस्टॉल करें" },
    mr: { title: "SaahasSetu स्थापित करा", desc: "सुरक्षित ऑफलाइन प्रवेश आणि त्वरित सूचना मिळवा।", btn: "अॅप स्थापित करा" },
    ta: { title: "SaahasSetu ஐ நிறுவுக", desc: "பாதுகாப்பான ஆஃப்லைன் அணுகல் மற்றும் உடனடி அறிவிப்புகளைப் பெறுக।", btn: "செயலியை நிறுவுக" },
    te: { title: "SaahasSetu ఇన్‌స్టాల్ చేయి", desc: "సురక్షితమైన ఆఫ్‌లైన్ యాక్సెస్ మరియు శీఘ్ర నోటిఫికేషన్‌లను పొందండి।", btn: "యాప్ ఇన్‌స్టాల్ చేయి" },
    bn: { title: "SaahasSetu ইন্সটল করুন", desc: "সুরক্ষিত অফলাইন অ্যাক্সেস এবং তাত্ক্ষণিক বিজ্ঞপ্তি পান।", btn: "অ্যাপ ইন্সটল করুন" }
  };

  const pwaText = pwaTranslations[locale] || pwaTranslations["en"];

  const tNav = useTranslations("nav");
  const tAdmin = useTranslations("admin");
  const tCommon = useTranslations("common");
  const tAuth = useTranslations("auth");

  const loading = user === undefined;
  const effectiveRole = user?.role || userRole;

  const navigation =
    effectiveRole === "admin"
      ? adminNavigation
      : effectiveRole === "partner" || effectiveRole === "counselor"
      ? partnerNavigation
      : userNavigation;

  const displayName = user?.name || "User";

  const roleLabel =
    effectiveRole === "admin"
      ? tAuth("hrIcc")
      : effectiveRole === "partner" || effectiveRole === "counselor"
      ? tAuth("partnerCounselor")
      : tAuth("individual");

  const getTranslatedName = (key: string) => {
    try {
      if (tNav.has(key as any)) return tNav(key as any);
    } catch {}
    try {
      if (tAdmin.has(key as any)) return tAdmin(key as any);
    } catch {}
    try {
      if (tCommon.has(key as any)) return tCommon(key as any);
    } catch {}
    try {
      if (tAuth.has(key as any)) return tAuth(key as any);
    } catch {}
    return key;
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40 transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Header */}
      <div className="h-16 md:h-20 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
        <Link href="/" className="flex items-center gap-2 overflow-hidden">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">
                SaahasSetu
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors hidden lg:block"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors lg:hidden cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const strippedPath = pathname.replace(/^\/(en|hi|mr|ta|te|bn)/, "");
            const isActive =
              strippedPath === item.href ||
              (item.href !== "/" &&
                item.href !== "/dashboard" &&
                item.href !== "/admin" &&
                item.href !== "/partner" &&
                strippedPath.startsWith(item.href));
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 shrink-0",
                      isActive && "text-primary-600 dark:text-primary-400"
                    )}
                  />
                  {!collapsed && <span>{getTranslatedName(item.key)}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* PWA Install Promo Box */}
      {installable && !dismissed && (
        collapsed ? (
          <div className="flex justify-center mb-4">
            <button
              onClick={handleInstallClick}
              className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-full shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 hover:scale-105 active:scale-95 transition-all duration-200 relative group animate-pulse-gentle cursor-pointer"
              title={pwaText.btn}
            >
              <Download className="w-4 h-4" />
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                {pwaText.btn}
              </span>
            </button>
          </div>
        ) : (
          <div className="mx-3 mb-4 p-4 rounded-2xl bg-gradient-to-br from-primary-50 to-pink-50 dark:from-primary-950/20 dark:to-pink-950/20 border border-primary-100 dark:border-primary-900/30 relative overflow-hidden animate-fade-in group">
            <button
              onClick={() => setDismissed(true)}
              className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-200 cursor-pointer"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            
            <div className="flex gap-3 items-start">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-primary-600 dark:text-primary-400 shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">
                  {pwaText.title}
                </h4>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-normal mb-3">
                  {pwaText.desc}
                </p>
                <button
                  onClick={handleInstallClick}
                  className="w-full py-1.5 px-3 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-xs font-semibold rounded-lg transition-all duration-200 shadow-sm shadow-primary-500/10 hover:shadow-md hover:shadow-primary-500/20 hover:-translate-y-0.5 cursor-pointer text-center"
                >
                  {pwaText.btn}
                </button>
              </div>
            </div>
          </div>
        )
      )}

      {/* User Section */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <div
          className={cn(
            "flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800",
            collapsed && "justify-center"
          )}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          ) : (
            <>
              <Avatar name={displayName} size="sm" />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {roleLabel}
                  </p>
                </div>
              )}
              {!collapsed && (
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-error transition-colors"
                  title={tCommon("signOut")}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
