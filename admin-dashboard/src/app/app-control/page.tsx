"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ToggleLeft,
  Settings,
  Beaker,
  Rocket,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Activity,
  RefreshCw,
  Play,
  Pause,
} from "lucide-react";
import { useState } from "react";

// Mock data for feature flags
const featureFlags = [
  {
    id: "ai_coach_v2",
    name: "AI Coach V2",
    description: "Enhanced AI coaching with GPT-4 integration",
    enabled: true,
    rolloutPercentage: 100,
    environment: ["production", "staging"],
    lastModified: "2 hours ago",
    modifiedBy: "Sarah Chen",
  },
  {
    id: "community_badges",
    name: "Community Badges",
    description: "Achievement badges for community participation",
    enabled: true,
    rolloutPercentage: 75,
    environment: ["production"],
    lastModified: "1 day ago",
    modifiedBy: "Mike Johnson",
  },
  {
    id: "premium_features",
    name: "Premium Features",
    description: "Access to premium subscription features",
    enabled: false,
    rolloutPercentage: 0,
    environment: ["staging"],
    lastModified: "3 days ago",
    modifiedBy: "Emily Rodriguez",
  },
  {
    id: "buddy_matching_v2",
    name: "Buddy Matching V2",
    description: "Improved algorithm for buddy system matching",
    enabled: true,
    rolloutPercentage: 50,
    environment: ["production"],
    lastModified: "5 days ago",
    modifiedBy: "David Kim",
  },
  {
    id: "dark_mode",
    name: "Dark Mode",
    description: "Dark theme support across the app",
    enabled: true,
    rolloutPercentage: 100,
    environment: ["production", "staging"],
    lastModified: "1 week ago",
    modifiedBy: "Alex Turner",
  },
];

const activeExperiments = [
  {
    id: "onboarding_flow_v3",
    name: "Onboarding Flow V3",
    status: "running",
    variants: [
      { name: "Control", allocation: 50, conversions: 62, confidence: null },
      { name: "Variant A", allocation: 50, conversions: 71, confidence: 94.5 },
    ],
    startDate: "Jan 15, 2024",
    participants: 4800,
    primaryMetric: "Onboarding Completion",
    impact: "+14.5%",
  },
  {
    id: "journal_prompts",
    name: "AI Journal Prompts",
    status: "running",
    variants: [
      { name: "Control", allocation: 33, conversions: 45, confidence: null },
      { name: "Personalized", allocation: 33, conversions: 52, confidence: 87.2 },
      { name: "Rotating", allocation: 34, conversions: 48, confidence: 72.1 },
    ],
    startDate: "Jan 20, 2024",
    participants: 3200,
    primaryMetric: "Journal Entries/Week",
    impact: "+15.6%",
  },
  {
    id: "notification_timing",
    name: "Notification Timing",
    status: "completed",
    variants: [
      { name: "Control", allocation: 50, conversions: 38, confidence: null },
      { name: "Smart Timing", allocation: 50, conversions: 47, confidence: 98.2 },
    ],
    startDate: "Jan 5, 2024",
    endDate: "Jan 19, 2024",
    participants: 8500,
    primaryMetric: "App Opens",
    impact: "+23.7%",
  },
];

const remoteConfigs = [
  {
    key: "ai_response_timeout",
    value: "3000",
    type: "number",
    description: "AI coach response timeout in milliseconds",
    lastModified: "1 hour ago",
  },
  {
    key: "max_journal_length",
    value: "5000",
    type: "number",
    description: "Maximum characters for journal entries",
    lastModified: "2 days ago",
  },
  {
    key: "community_post_cooldown",
    value: "300",
    type: "number",
    description: "Seconds between community posts",
    lastModified: "1 week ago",
  },
  {
    key: "maintenance_message",
    value: "",
    type: "string",
    description: "Message shown during maintenance",
    lastModified: "2 weeks ago",
  },
  {
    key: "premium_trial_days",
    value: "7",
    type: "number",
    description: "Free trial period for premium features",
    lastModified: "3 days ago",
  },
];

const deploymentStatus = {
  ios: {
    version: "2.3.1",
    buildNumber: "145",
    status: "live",
    lastDeployed: "Jan 22, 2024",
    crashFreeRate: 99.2,
    adoptionRate: 78,
  },
  android: {
    version: "2.3.1",
    buildNumber: "145",
    status: "staged",
    lastDeployed: "Jan 23, 2024",
    crashFreeRate: 98.8,
    adoptionRate: 65,
  },
};

export default function AppControlPage() {
  const [selectedTab, setSelectedTab] = useState("flags");

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-white">App Control Center</h1>
          <p className="mt-2 text-white/60">
            Manage feature flags, experiments, and deployments
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-1 rounded-lg bg-white/[0.03] p-1">
          {[
            { id: "flags", label: "Feature Flags", icon: ToggleLeft },
            { id: "experiments", label: "A/B Tests", icon: Beaker },
            { id: "config", label: "Remote Config", icon: Settings },
            { id: "deployment", label: "Deployment", icon: Rocket },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm transition-all ${
                selectedTab === tab.id
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Feature Flags Tab */}
        {selectedTab === "flags" && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex gap-3">
                <Button variant="primary" size="sm">
                  Create Flag
                </Button>
                <Button variant="secondary" size="sm">
                  Import Config
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Activity className="h-4 w-4" />
                Last sync: 2 minutes ago
              </div>
            </div>

            <div className="space-y-4">
              {featureFlags.map((flag) => (
                <Card key={flag.id} className="border-white/10 bg-white/[0.02]">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-medium text-white">{flag.name}</h3>
                          <div className="flex gap-2">
                            {flag.environment.map((env) => (
                              <span
                                key={env}
                                className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/60"
                              >
                                {env}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-white/60">{flag.description}</p>
                        <div className="mt-4 flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-white/60">Rollout:</span>
                            <span className="text-white">{flag.rolloutPercentage}%</span>
                            <div className="h-2 w-24 rounded-full bg-white/10">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${flag.rolloutPercentage}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-white/40">
                            Modified {flag.lastModified} by {flag.modifiedBy}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                        <button
                          className={`relative h-6 w-11 rounded-full transition-colors ${
                            flag.enabled ? "bg-primary" : "bg-white/20"
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                              flag.enabled ? "translate-x-5" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* A/B Tests Tab */}
        {selectedTab === "experiments" && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex gap-3">
                <Button variant="primary" size="sm">
                  New Experiment
                </Button>
                <Button variant="secondary" size="sm">
                  View Archive
                </Button>
              </div>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 rounded-full bg-success/20 px-3 py-1 text-xs text-success">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  2 Active
                </span>
                <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
                  1 Completed
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {activeExperiments.map((experiment) => (
                <Card key={experiment.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-white">{experiment.name}</h3>
                        <p className="mt-1 text-sm text-white/60">
                          {experiment.participants.toLocaleString()} participants • Started {experiment.startDate}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {experiment.status === "running" ? (
                          <span className="flex items-center gap-2 text-sm text-success">
                            <Play className="h-4 w-4" />
                            Running
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-sm text-white/60">
                            <CheckCircle className="h-4 w-4" />
                            Completed
                          </span>
                        )}
                        <Button variant="ghost" size="sm">
                          {experiment.status === "running" ? "Pause" : "View Results"}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 rounded-lg bg-white/[0.03] p-4">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-white/60">Primary Metric: {experiment.primaryMetric}</span>
                        <span className={`font-medium ${experiment.impact.startsWith('+') ? 'text-success' : 'text-destructive'}`}>
                          {experiment.impact}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {experiment.variants.map((variant) => (
                          <div key={variant.name}>
                            <div className="mb-1 flex items-center justify-between text-sm">
                              <span className="text-white">{variant.name}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-white/60">{variant.allocation}%</span>
                                <span className="text-white">{variant.conversions}% conversion</span>
                                {variant.confidence && (
                                  <span className={`text-xs ${variant.confidence > 95 ? 'text-success' : 'text-warning'}`}>
                                    {variant.confidence}% confidence
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="h-6 rounded bg-white/10">
                              <div
                                className={`h-full rounded ${variant.name === 'Control' ? 'bg-white/40' : 'bg-primary'}`}
                                style={{ width: `${variant.conversions}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {experiment.status === "running" && (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-white/60">
                          Estimated days to significance: <span className="text-white">3-5 days</span>
                        </p>
                        <Button variant="secondary" size="sm">
                          View Details
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Remote Config Tab */}
        {selectedTab === "config" && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex gap-3">
                <Button variant="primary" size="sm">
                  Add Config
                </Button>
                <Button variant="secondary" size="sm">
                  Push Changes
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-success" />
                <span className="text-white/60">All configs synced</span>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="p-4 text-left text-sm font-medium text-white/60">Key</th>
                      <th className="p-4 text-left text-sm font-medium text-white/60">Value</th>
                      <th className="p-4 text-left text-sm font-medium text-white/60">Type</th>
                      <th className="p-4 text-left text-sm font-medium text-white/60">Description</th>
                      <th className="p-4 text-left text-sm font-medium text-white/60">Last Modified</th>
                      <th className="p-4 text-center text-sm font-medium text-white/60">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {remoteConfigs.map((config) => (
                      <tr key={config.key} className="border-b border-white/5">
                        <td className="p-4 font-mono text-sm text-white">{config.key}</td>
                        <td className="p-4">
                          <input
                            type="text"
                            value={config.value}
                            className="rounded bg-white/10 px-2 py-1 text-sm text-white outline-none focus:bg-white/20"
                          />
                        </td>
                        <td className="p-4">
                          <span className="rounded bg-white/10 px-2 py-1 text-xs text-white/60">
                            {config.type}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-white/60">{config.description}</td>
                        <td className="p-4 text-sm text-white/40">{config.lastModified}</td>
                        <td className="p-4 text-center">
                          <Button variant="ghost" size="sm">
                            Reset
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </>
        )}

        {/* Deployment Tab */}
        {selectedTab === "deployment" && (
          <>
            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* iOS Deployment */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-lg font-medium text-white">
                      <div className="rounded-lg bg-white/10 p-2">📱</div>
                      iOS App
                    </h3>
                    <span className="flex items-center gap-2 text-sm text-success">
                      <div className="h-2 w-2 rounded-full bg-success" />
                      Live
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-white/60">Version</p>
                      <p className="text-lg font-light text-white">{deploymentStatus.ios.version}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Build</p>
                      <p className="text-lg font-light text-white">#{deploymentStatus.ios.buildNumber}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Crash-free rate</span>
                        <span className="text-white">{deploymentStatus.ios.crashFreeRate}%</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-success"
                          style={{ width: `${deploymentStatus.ios.crashFreeRate}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Adoption rate</span>
                        <span className="text-white">{deploymentStatus.ios.adoptionRate}%</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${deploymentStatus.ios.adoptionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button variant="primary" size="sm" className="flex-1">
                      Deploy Update
                    </Button>
                    <Button variant="secondary" size="sm">
                      Rollback
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Android Deployment */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-lg font-medium text-white">
                      <div className="rounded-lg bg-white/10 p-2">🤖</div>
                      Android App
                    </h3>
                    <span className="flex items-center gap-2 text-sm text-warning">
                      <div className="h-2 w-2 rounded-full bg-warning" />
                      Staged
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-white/60">Version</p>
                      <p className="text-lg font-light text-white">{deploymentStatus.android.version}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Build</p>
                      <p className="text-lg font-light text-white">#{deploymentStatus.android.buildNumber}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Crash-free rate</span>
                        <span className="text-white">{deploymentStatus.android.crashFreeRate}%</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-success"
                          style={{ width: `${deploymentStatus.android.crashFreeRate}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Staged rollout</span>
                        <span className="text-white">{deploymentStatus.android.adoptionRate}%</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-warning"
                          style={{ width: `${deploymentStatus.android.adoptionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button variant="primary" size="sm" className="flex-1">
                      Increase Rollout
                    </Button>
                    <Button variant="secondary" size="sm">
                      Halt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Deployments */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-white">Deployment History</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { platform: "iOS", version: "2.3.1", date: "Jan 22, 2024", status: "success", notes: "Bug fixes and performance improvements" },
                    { platform: "Android", version: "2.3.1", date: "Jan 23, 2024", status: "staged", notes: "Staged rollout at 65%" },
                    { platform: "iOS", version: "2.3.0", date: "Jan 15, 2024", status: "success", notes: "New buddy system features" },
                    { platform: "Android", version: "2.3.0", date: "Jan 16, 2024", status: "success", notes: "New buddy system features" },
                  ].map((deployment, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg bg-white/[0.03] p-4">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{deployment.platform === "iOS" ? "📱" : "🤖"}</div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {deployment.platform} v{deployment.version}
                          </p>
                          <p className="text-xs text-white/60">{deployment.notes}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-white/40">{deployment.date}</span>
                        <span className={`rounded-full px-2 py-1 text-xs ${
                          deployment.status === 'success' ? 'bg-success/20 text-success' :
                          deployment.status === 'staged' ? 'bg-warning/20 text-warning' :
                          'bg-destructive/20 text-destructive'
                        }`}>
                          {deployment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 