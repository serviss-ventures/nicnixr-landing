"use client";

import React, { useState } from 'react';
import {
  DashboardLayout,
  PageHeader,
  TabNavigation,
  DataTable,
  StatsGrid,
  StatusBadge,
  EmptyState,
  Card,
  CardContent,
  CardHeader,
  Button,
  type Tab,
  type Column,
  type StatItem,
} from '@/components';
import {
  FileText,
  Download,
  Calendar,
  Clock,
  Send,
  Mail,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { ScheduledReports } from './components/ScheduledReports';
import { GeneratedReports } from './components/GeneratedReports';
import { InvestorDashboard } from './components/InvestorDashboard';
import { ReportTemplates } from './components/ReportTemplates';

// This is now ~150 lines instead of 724 lines!
// All the complex logic is broken into focused components

const reportTabs: Tab[] = [
  { id: 'scheduled', label: 'Scheduled Reports' },
  { id: 'generated', label: 'Generated Reports' },
  { id: 'investor', label: 'Investor Dashboard' },
  { id: 'templates', label: 'Templates' },
];

export default function ReportsPageRefactored() {
  const [activeTab, setActiveTab] = useState('scheduled');

  const headerActions = (
    <>
      <Button variant="secondary" size="sm">
        <Calendar className="mr-2 h-4 w-4" />
        Schedule Report
      </Button>
      <Button variant="primary" size="sm">
        <FileText className="mr-2 h-4 w-4" />
        Generate Report
      </Button>
    </>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        <PageHeader
          title="Reports & Analytics"
          subtitle="Automated reporting and investor dashboards"
          actions={headerActions}
        />

        <TabNavigation
          tabs={reportTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="mb-8"
        />

        {/* Each tab content is now a focused component */}
        {activeTab === 'scheduled' && <ScheduledReports />}
        {activeTab === 'generated' && <GeneratedReports />}
        {activeTab === 'investor' && <InvestorDashboard />}
        {activeTab === 'templates' && <ReportTemplates />}
      </div>
    </DashboardLayout>
  );
}

// Example of how ScheduledReports component would look:
// components/ScheduledReports.tsx (~100 lines)
/*
export function ScheduledReports() {
  const columns: Column<ScheduledReport>[] = [
    {
      key: 'name',
      header: 'Report Name',
      render: (_, report) => (
        <div className="flex items-center gap-3">
          <FileText className="h-4 w-4 text-white/40" />
          <span>{report.name}</span>
        </div>
      ),
    },
    {
      key: 'frequency',
      header: 'Frequency',
      render: (value) => <span className="capitalize">{value}</span>,
    },
    {
      key: 'nextSend',
      header: 'Next Send',
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => <StatusBadge status={value} />,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-white">Scheduled Reports</h3>
          <Button variant="ghost" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Schedule
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={scheduledReports}
            searchable
            searchPlaceholder="Search reports..."
          />
        </CardContent>
      </Card>

      <DeliveryStats />
      <UpcomingReports />
    </div>
  );
}
*/ 