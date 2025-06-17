"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Bot,
  MessageSquare,
  Shield,
  DollarSign,
  Activity,
  Smartphone,
  FileText,
  Target,
  LogOut,
  Sparkles,
  Brain,
  Globe,
  Rocket,
  Building2,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Launch Checklist", href: "/launch-checklist", icon: Rocket },
  { name: "AI Brain", href: "/ai-brain", icon: Brain },
  { name: "Users", href: "/users", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "AI Coach", href: "/ai-coach", icon: MessageSquare },
  { name: "Marketing", href: "/marketing", icon: Target },
  { name: "Website", href: "/website", icon: Globe },
  { name: "Business Intel", href: "/business", icon: DollarSign },
  { name: "Support", href: "/support", icon: MessageSquare },
  { name: "Moderation", href: "/moderation", icon: Shield },
  { name: "System Health", href: "/system", icon: Activity },
  { name: "App Control", href: "/app-control", icon: Smartphone },
  { name: "Reports", href: "/reports", icon: FileText },
];

const marketingItems = [
  { name: "Website Preview", href: "/website", icon: Globe },
  { name: "Campaigns", href: "/marketing", icon: Target },
  { name: "Business Intel", href: "/business", icon: Building2 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col bg-black/50 backdrop-blur-xl border-r border-white/[0.08]">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          {/* Clean, minimal logo */}
          <div className="relative">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center">
              <span className="text-white font-medium text-sm">N</span>
            </div>
          </div>
          <div>
            <span className="text-base font-light tracking-[0.01em] text-white">
              NixR
            </span>
            <span className="text-base font-light tracking-[0.01em] text-white/40 ml-1">
              Admin
            </span>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="border-b border-white/[0.08] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent"></div>
          <div>
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs text-muted">Super Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-white/[0.08] text-white"
                  : "text-white/60 hover:bg-white/[0.03] hover:text-white"
              }`}
            >
              <item.icon
                className={`h-5 w-5 ${
                  isActive ? "text-primary" : "text-white/40 group-hover:text-white/60"
                }`}
              />
              {item.name}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-white/[0.08] p-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-all duration-200 hover:bg-white/[0.03] hover:text-white">
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
} 