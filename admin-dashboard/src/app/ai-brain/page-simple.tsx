"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components";
import { Brain } from "lucide-react";

export default function AIBrainPageSimple() {
  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        <PageHeader
          title="AI Brain - Test"
          subtitle="Testing if the page loads"
        />
        
        <div className="mt-8 p-8 bg-white/[0.03] rounded-lg border border-white/10">
          <div className="flex items-center gap-4">
            <Brain className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-light text-white">AI Brain is loading...</h2>
          </div>
          <p className="mt-4 text-white/60">
            If you can see this, the basic page is working. The issue might be with the heavy components.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
} 