"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
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
  TrendingUp,
  Monitor,
  CheckSquare,
  HelpCircle,
  ToggleLeft,
  Megaphone,
  Briefcase,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Users", href: "/users", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Monitoring", href: "/monitoring", icon: Monitor },
  { name: "AI Coach", href: "/ai-coach", icon: MessageSquare },
  { name: "Moderation", href: "/moderation", icon: Shield },
  { name: "Mobile App", href: "/mobile-app", icon: Smartphone },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Launch Checklist", href: "/launch-checklist", icon: CheckSquare },
];

const secondaryNavigation = [
  { name: "Onboarding Analytics", href: "/onboarding-analytics", icon: TrendingUp },
  { name: "Support", href: "/support", icon: HelpCircle },
  { name: "App Control", href: "/app-control", icon: ToggleLeft },
  { name: "Marketing", href: "/marketing", icon: Megaphone },
  { name: "Business", href: "/business", icon: Briefcase },
  { name: "Website", href: "/website", icon: Globe },
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
          {/* Icon */}
          <div className="relative group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20 transition-all duration-300 group-hover:shadow-primary/40 group-hover:scale-105">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            {/* Subtle glow effect on hover */}
            <div className="absolute inset-0 rounded-xl bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          
          {/* Text */}
          <div className="flex flex-col">
            <span className="text-xl font-light tracking-wider text-white">
              NIXR
            </span>
            <span className="text-xs font-light tracking-widest text-white/40 uppercase">
              Admin Portal
            </span>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="border-b border-white/[0.08] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs text-muted">Super Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
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
        
        {/* Secondary Navigation */}
        <div className="mt-8 pt-4 border-t border-white/[0.06]">
          <p className="px-3 mb-2 text-xs font-medium text-white/40 uppercase tracking-wider">
            More Tools
          </p>
          {secondaryNavigation.map((item) => {
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
        </div>
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