"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  Scale,
  Shield,
  AlertTriangle,
  Building2,
  ClipboardList,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface AdminLayoutProps {
  children: ReactNode;
}

import { NotificationDropdown } from "@/components/layout";

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const [casesCount, setCasesCount] = useState<number>(3);
  const [urgentCount, setUrgentCount] = useState<number>(3);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          if (data.stats) {
            if (typeof data.stats.totalCases === "number") {
              setCasesCount(data.stats.totalCases);
            }
            if (typeof data.stats.urgentCases === "number") {
              setUrgentCount(data.stats.urgentCases);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching admin stats:", err);
      }
    };
    fetchAdminStats();
  }, []);

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Cases",
      href: "/admin/cases",
      icon: FileText,
      badge: casesCount,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "Committees",
      href: "/admin/committees",
      icon: Building2,
    },
    {
      name: "Reports",
      href: "/admin/reports",
      icon: BarChart3,
    },
    {
      name: "Audit Log",
      href: "/admin/audit",
      icon: ClipboardList,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  const strippedPath = pathname?.replace(/^\/(en|hi|mr|ta|te|bn)/, "") || "/";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
            {!collapsed && (
              <Link href="/admin" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    SaahasSetu
                  </span>
                  <Badge variant="info" size="sm" className="ml-2">
                    Admin
                  </Badge>
                </div>
              </Link>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {collapsed ? (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-gray-500" />
              )}
            </button>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = strippedPath === item.href || strippedPath?.startsWith(`${item.href}/`);
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                        isActive
                          ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 font-medium"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      <item.icon className={cn("w-5 h-5 shrink-0", collapsed && "mx-auto")} />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.name}</span>
                          {item.badge && (
                            <Badge variant="error" size="sm">
                               {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50",
                collapsed && "justify-center"
              )}
            >
              <Avatar name={user?.name || "Admin"} size="sm" />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.name || "Admin User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role || "admin"}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => logout()}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 mt-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full",
                collapsed && "justify-center"
              )}
            >
              <LogOut className="w-5 h-5" />
              {!collapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Admin Panel
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Urgent Cases Alert */}
            {urgentCount > 0 && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-error/10 text-error rounded-full text-sm font-medium">
                <AlertTriangle className="w-4 h-4" />
                <span>{urgentCount} urgent {urgentCount === 1 ? 'case' : 'cases'}</span>
              </div>
            )}

            {/* Notifications */}
            <NotificationDropdown />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
