"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { DataStatusIndicator, DataStatusBadge, DataStatus } from "@/components/ui/DataStatusIndicator";
import { 
  Home, Users, Brain, BarChart3, Package, Shield, Settings, Bell, 
  FileText, Globe, Smartphone, Bug, DollarSign, MessageSquare,
  Activity, Zap, Calendar, CheckCircle2
} from "lucide-react";

interface Feature {
  name: string;
  path: string;
  icon: React.ElementType;
  status: DataStatus;
  description: string;
  requirements?: string[];
}

const features: Feature[] = [
  {
    name: "Dashboard",
    path: "/",
    icon: Home,
    status: "mock",
    description: "Main dashboard with real-time metrics",
    requirements: ["Connect to real-time analytics", "User activity tracking", "Revenue data integration"]
  },
  {
    name: "User Management",
    path: "/users",
    icon: Users,
    status: "partial",
    description: "User directory and management",
    requirements: ["Real-time user sync", "Bulk operations", "Advanced filtering"]
  },
  {
    name: "AI Coach",
    path: "/ai-coach",
    icon: Brain,
    status: "ready",
    description: "AI-powered recovery support monitoring",
    requirements: []
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: BarChart3,
    status: "mock",
    description: "Comprehensive analytics and insights",
    requirements: ["Connect to analytics service", "Historical data import", "Custom reports"]
  },
  {
    name: "Mobile App Control",
    path: "/app-control",
    icon: Smartphone,
    status: "config",
    description: "Mobile app configuration and control",
    requirements: ["App version management API", "Feature flags service", "Push notification service"]
  },
  {
    name: "Monitoring",
    path: "/monitoring",
    icon: Activity,
    status: "partial",
    description: "System health and performance monitoring",
    requirements: ["Connect to monitoring service", "Alert configuration", "Log aggregation"]
  },
  {
    name: "Onboarding Analytics",
    path: "/onboarding-analytics",
    icon: Zap,
    status: "ready",
    description: "Onboarding funnel and conversion tracking",
    requirements: []
  },
  {
    name: "Launch Checklist",
    path: "/launch-checklist",
    icon: CheckCircle2,
    status: "ready",
    description: "Pre-launch task tracking",
    requirements: []
  },
  {
    name: "Business",
    path: "/business",
    icon: DollarSign,
    status: "mock",
    description: "Revenue and subscription management",
    requirements: ["Stripe integration", "Subscription webhooks", "Revenue analytics"]
  },
  {
    name: "Support",
    path: "/support",
    icon: MessageSquare,
    status: "mock",
    description: "Customer support ticket system",
    requirements: ["Support ticket API", "Email integration", "Chat widget"]
  },
  {
    name: "Reports",
    path: "/reports",
    icon: FileText,
    status: "mock",
    description: "Generate and view reports",
    requirements: ["Report generation service", "PDF export", "Scheduled reports"]
  },
  {
    name: "Bug Tracking",
    path: "/bug-tracking",
    icon: Bug,
    status: "config",
    description: "Track and manage bugs",
    requirements: ["GitHub Issues integration", "Sentry integration", "User feedback pipeline"]
  },
  {
    name: "Admin Permissions",
    path: "/admin-permissions",
    icon: Shield,
    status: "ready",
    description: "Admin user management and permissions",
    requirements: []
  },
  {
    name: "Account Settings",
    path: "/account-settings",
    icon: Settings,
    status: "ready",
    description: "Personal account configuration",
    requirements: []
  }
];

const statusSummary = {
  mock: features.filter(f => f.status === 'mock').length,
  partial: features.filter(f => f.status === 'partial').length,
  config: features.filter(f => f.status === 'config').length,
  ready: features.filter(f => f.status === 'ready').length,
};

const totalFeatures = features.length;
const readyPercentage = Math.round((statusSummary.ready / totalFeatures) * 100);

export default function DataStatusPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-white">Data Integration Status</h1>
          <p className="mt-2 text-white/60">
            Track the status of all admin dashboard features
          </p>
        </div>

        {/* Overall Progress */}
        <Card className="mb-8">
          <CardHeader>
            <h3 className="text-lg font-medium text-white">Overall Progress</h3>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/60">Production Ready</span>
                <span className="text-sm font-medium text-white">{readyPercentage}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${readyPercentage}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <DataStatusIndicator status="ready" className="mb-2" />
                <p className="text-2xl font-light text-white">{statusSummary.ready}</p>
                <p className="text-xs text-white/60">Ready</p>
              </div>
              <div className="text-center">
                <DataStatusIndicator status="partial" className="mb-2" />
                <p className="text-2xl font-light text-white">{statusSummary.partial}</p>
                <p className="text-xs text-white/60">Partial</p>
              </div>
              <div className="text-center">
                <DataStatusIndicator status="config" className="mb-2" />
                <p className="text-2xl font-light text-white">{statusSummary.config}</p>
                <p className="text-xs text-white/60">Config Needed</p>
              </div>
              <div className="text-center">
                <DataStatusIndicator status="mock" className="mb-2" />
                <p className="text-2xl font-light text-white">{statusSummary.mock}</p>
                <p className="text-xs text-white/60">Mock Data</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.path} className="hover:border-white/20 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-white/[0.06] p-2">
                        <Icon className="h-5 w-5 text-white/60" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{feature.name}</h3>
                        <p className="text-xs text-white/60">{feature.path}</p>
                      </div>
                    </div>
                    <DataStatusBadge status={feature.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/60 mb-3">{feature.description}</p>
                  {feature.requirements && feature.requirements.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-white/40 mb-2">Requirements:</p>
                      <ul className="space-y-1">
                        {feature.requirements.map((req, idx) => (
                          <li key={idx} className="text-xs text-white/60 flex items-start gap-1">
                            <span className="text-white/40 mt-0.5">•</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Legend */}
        <Card className="mt-8">
          <CardHeader>
            <h3 className="text-lg font-medium text-white">Status Legend</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <DataStatusIndicator status="ready" className="mb-2" />
                <p className="text-sm text-white/80 font-medium">Production Ready</p>
                <p className="text-xs text-white/60 mt-1">
                  Fully integrated with real data and all features working
                </p>
              </div>
              <div>
                <DataStatusIndicator status="partial" className="mb-2" />
                <p className="text-sm text-white/80 font-medium">Partially Integrated</p>
                <p className="text-xs text-white/60 mt-1">
                  Some features working with real data, others using mock data
                </p>
              </div>
              <div>
                <DataStatusIndicator status="config" className="mb-2" />
                <p className="text-sm text-white/80 font-medium">Configuration Needed</p>
                <p className="text-xs text-white/60 mt-1">
                  Code is ready but requires API keys or service configuration
                </p>
              </div>
              <div>
                <DataStatusIndicator status="mock" className="mb-2" />
                <p className="text-sm text-white/80 font-medium">Mock Data</p>
                <p className="text-xs text-white/60 mt-1">
                  Using hardcoded demo data, no real integration yet
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 