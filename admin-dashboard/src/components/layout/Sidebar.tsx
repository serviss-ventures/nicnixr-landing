"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { useState, useRef, useEffect } from "react";
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
  ChevronDown,
  Settings,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

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
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      // Clear the auth cookie
      document.cookie = 'nixr-admin-auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-black/40 backdrop-blur-2xl border-r border-white/[0.06]">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center">
          {/* Ultra minimal logo - just clean typography */}
          <span className="text-2xl font-extralight tracking-[0.2em] text-white">
            NIXR
          </span>
          <div className="ml-3 h-4 w-[1px] bg-white/20"></div>
          <span className="ml-3 text-sm font-extralight text-white/40">
            Admin
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                isActive
                  ? "bg-white/[0.06] text-white"
                  : "text-white/50 hover:bg-white/[0.02] hover:text-white/80"
              }`}
            >
              <item.icon
                className={`h-4 w-4 ${
                  isActive ? "text-white" : "text-white/30 group-hover:text-white/50"
                }`}
              />
              <span className="font-light">{item.name}</span>
            </Link>
          );
        })}
        
        {/* Secondary Navigation */}
        <div className="mt-8 pt-4">
          <p className="px-3 mb-2 text-xs font-extralight text-white/30 uppercase tracking-wider">
            Tools
          </p>
          {secondaryNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-white/[0.06] text-white"
                    : "text-white/50 hover:bg-white/[0.02] hover:text-white/80"
                }`}
              >
                <item.icon
                  className={`h-4 w-4 ${
                    isActive ? "text-white" : "text-white/30 group-hover:text-white/50"
                  }`}
                />
                <span className="font-light">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Admin dropdown at bottom */}
      <div className="relative p-3" ref={dropdownRef}>
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center gap-3 rounded-lg p-2 transition-all hover:bg-white/[0.03] group"
        >
          <div className="h-8 w-8 rounded-full bg-white/[0.06] flex items-center justify-center">
            <span className="text-xs font-light text-white/60">A</span>
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-light text-white/90">Admin</p>
            <p className="text-xs text-white/40">admin@nixr.app</p>
          </div>
          <ChevronDown className={`h-4 w-4 text-white/20 transition-all group-hover:text-white/40 ${
            isDropdownOpen ? 'rotate-180' : ''
          }`} />
        </button>
        
        {/* Dropdown menu */}
        {isDropdownOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="mx-3 rounded-lg bg-black/90 backdrop-blur-xl border border-white/[0.08] py-1 shadow-xl">
              <Link 
                href="/account-settings"
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-light text-white/60 hover:bg-white/[0.05] hover:text-white/80 transition-all"
              >
                <Settings className="h-4 w-4" />
                <span>Account Settings</span>
              </Link>
              <Link 
                href="/admin-permissions"
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-light text-white/60 hover:bg-white/[0.05] hover:text-white/80 transition-all"
              >
                <Shield className="h-4 w-4" />
                <span>Admin Permissions</span>
              </Link>
              <div className="my-1 h-[1px] bg-white/[0.06]"></div>
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-light text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 