"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserCheck,
  MessageSquare,
  Calendar,
  BookOpen,
  Settings,
  Bell,
  Menu,
  X,
  Building2,
  LogOut,
  Phone,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

import { NotificationDropdown } from "@/components/layout";

const navItems = [
  { href: "/partner", label: "Dashboard", icon: LayoutDashboard },
  { href: "/partner/sessions", label: "Sessions", icon: MessageSquare, badge: 2 },
  { href: "/partner/resources", label: "Resources", icon: BookOpen },
  { href: "/partner/committee", label: "Committee", icon: UserCheck },
  { href: "/partner/settings", label: "Settings", icon: Settings },
];

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const strippedPath = pathname?.replace(/^\/(en|hi|mr|ta|te|bn)/, "") || "/";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-secondary-600" />
              <span className="font-semibold">Partner Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationDropdown />
            <Avatar name="Partner Admin" size="sm" />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <Link href="/partner" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-secondary-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                  P
                </div>
                <div>
                  <span className="font-bold text-lg">Partner Portal</span>
                  <p className="text-xs text-gray-500">SaahasSetu Partner</p>
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Organization Info */}
          <div className="p-4 mx-4 mt-4 bg-secondary-50 dark:bg-secondary-900/30 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Avatar name="Women's Rights Foundation" size="sm" />
              <div>
                <p className="font-medium text-sm">Women's Rights Foundation</p>
                <p className="text-xs text-gray-500">Verified Partner</p>
              </div>
            </div>
            <Badge variant="success" size="sm">Active Organization</Badge>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = strippedPath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    isActive
                      ? "bg-secondary-50 text-secondary-600 dark:bg-secondary-900/30"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Emergency Hotline */}
          <div className="p-4 m-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl text-white">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-5 h-5" />
              <span className="font-semibold">Helpline</span>
            </div>
            <p className="text-2xl font-bold">181</p>
            <p className="text-xs text-primary-100 mt-1">Women Helpline (24/7)</p>
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={user?.name || "Partner User"} size="md" />
                <div>
                  <p className="font-medium text-sm">{user?.name || "Partner User"}</p>
                  <p className="text-xs text-gray-500">Coordinator</p>
                </div>
              </div>
              <button onClick={() => logout()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen p-6">{children}</main>
    </div>
  );
}
