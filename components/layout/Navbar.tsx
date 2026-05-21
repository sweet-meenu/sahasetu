"use client";

import { cn } from "@/lib/utils";
import {
  Menu,
  X,
  Shield,
  Phone,
  Globe,
  ChevronDown,
  User,
  LayoutDashboard,
  Bell,
  FileText,
} from "lucide-react";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition, useEffect, useRef } from "react";
import Button from "../ui/Button";
import Avatar from "../ui/Avatar";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  { name: "home", href: "/" },
  { name: "about", href: "/about" },
  { name: "resources", href: "/resources" },
  { name: "support", href: "/support" },
];

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिंदी" },
  { code: "mr", name: "मराठी" },
  { code: "ta", name: "தமிழ்" },
  { code: "te", name: "తెలుగు" },
  { code: "bn", name: "বাংলা" },
] as const;

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user) {
      fetch("/api/notifications")
        .then(res => res.json())
        .then(data => {
          if (data.notifications) setNotifications(data.notifications);
        })
        .catch(console.error);
    }
  }, [user]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: "all" }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const selectedLanguage = languages.find((lang) => lang.code === locale) || languages[0];

  const handleLanguageChange = (langCode: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: langCode });
    });
    setLanguageMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return "/dashboard";
    if (user.role === "admin") return "/admin";
    if (user.role === "partner" || user.role === "counselor") return "/partner";
    return "/dashboard";
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-shadow">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                SaahasSetu
              </span>
              <span className="text-xs block text-gray-500 dark:text-gray-400 -mt-1">
                {tCommon("secureWorkplace")}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {t(item.name)}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Emergency Helpline */}
            <a
              href="tel:181"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-error/10 text-error rounded-full text-sm font-medium hover:bg-error/20 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>181</span>
            </a>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{selectedLanguage.name}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {languageMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setLanguageMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        disabled={isPending}
                        className={cn(
                          "w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50",
                          selectedLanguage.code === lang.code
                            ? "text-primary-600 font-medium"
                            : "text-gray-600 dark:text-gray-300"
                        )}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Auth Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              {user ? (
                <>
                  <Link href={getDashboardLink()}>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      {t("dashboard")}
                    </Button>
                  </Link>
                  <div className="relative border-l border-gray-200 dark:border-gray-700 pl-4 ml-2" ref={dropdownRef}>
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Bell className="w-5 h-5" />
                      {notifications.some(n => !n.isRead) && (
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error rounded-full ring-2 ring-white dark:ring-gray-900" />
                      )}
                    </button>

                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 animate-fade-in flex flex-col">
                        <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900 rounded-t-xl sticky top-0 z-10">
                          <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                          {notifications.some(n => !n.isRead) && (
                            <button onClick={markAllAsRead} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                              Mark all as read
                            </button>
                          )}
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                          {notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 text-sm">No new notifications</div>
                          ) : (
                            notifications.map(notif => (
                              <div key={notif._id} className={`p-3 transition-colors ${!notif.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                                <div className="flex gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!notif.isRead ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
                                    {notif.type === 'status_update' ? <FileText className="w-4 h-4"/> : <Bell className="w-4 h-4"/>}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                      <p className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                                        {notif.title}
                                      </p>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">{notif.message}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 pl-4 ml-4 border-l border-gray-200 dark:border-gray-700">
                    <Avatar name={user.name} size="sm" />
                    <button
                      onClick={() => logout()}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-error transition-colors"
                    >
                      {tCommon("signOut")}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      {tCommon("signIn")}
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm">
                      {tCommon("getStarted")}
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 animate-slide-up">
          <div className="px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {t(item.name)}
              </Link>
            ))}

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              {user ? (
                <>
                  <Link href={getDashboardLink()} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full">
                      {t("dashboard")}
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                    {tCommon("signOut")}
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      {tCommon("signIn")}
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full">
                      {tCommon("getStarted")}
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Emergency Helpline Mobile */}
            <a
              href="tel:181"
              className="flex items-center justify-center gap-2 mt-4 px-4 py-3 bg-error/10 text-error rounded-xl text-sm font-medium"
            >
              <Phone className="w-4 h-4" />
              <span>{tCommon("emergencyHelpline")}: 181</span>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
