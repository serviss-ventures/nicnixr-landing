"use client";

import { useState } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader, Card, CardContent, CardHeader, Button, TabNavigation, StatusBadge } from "@/components";
import { 
  Globe, 
  Edit3, 
  Eye, 
  Code, 
  Smartphone, 
  Monitor, 
  Tablet,
  ExternalLink,
  RefreshCw,
  Settings,
  FileText,
  Image,
  Save,
  AlertCircle
} from "lucide-react";

const deviceSizes = {
  desktop: { width: '100%', height: '100%', label: 'Desktop' },
  tablet: { width: '768px', height: '1024px', label: 'Tablet' },
  mobile: { width: '375px', height: '812px', label: 'Mobile' },
};

export default function WebsitePage() {
  const [activeView, setActiveView] = useState<'preview' | 'editor' | 'content'>('preview');
  const [activeDevice, setActiveDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(false);
  const [websiteStatus, setWebsiteStatus] = useState<'online' | 'offline' | 'building'>('offline');

  const tabs = [
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'editor', label: 'Page Editor', icon: Edit3 },
    { id: 'content', label: 'Content Manager', icon: FileText },
  ];

  const headerActions = (
    <>
      <Button variant="secondary" size="sm" onClick={() => window.open('http://localhost:3001', '_blank')}>
        <ExternalLink className="mr-2 h-4 w-4" />
        Open in New Tab
      </Button>
      <Button variant="primary" size="sm">
        <Save className="mr-2 h-4 w-4" />
        Publish Changes
      </Button>
    </>
  );

  const refreshWebsite = () => {
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        <PageHeader
          title="Marketing Website"
          subtitle="Preview and manage your marketing website"
          actions={headerActions}
        />

        {/* Website Status Bar */}
        <div className="mb-6 flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/10 p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-white/60" />
              <span className="text-sm text-white/60">Website Status:</span>
              <StatusBadge 
                status={websiteStatus} 
                variant={websiteStatus === 'online' ? 'success' : websiteStatus === 'building' ? 'warning' : 'error'} 
              />
            </div>
            {websiteStatus === 'offline' && (
              <div className="flex items-center gap-2 text-warning">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Website needs to be started</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={refreshWebsite}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabNavigation
          tabs={tabs}
          activeTab={activeView}
          onTabChange={(tab) => setActiveView(tab as any)}
          className="mb-6"
        />

        {activeView === 'preview' && (
          <div className="space-y-6">
            {/* Device Preview Selector */}
            <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-white/[0.03]">
              {Object.entries(deviceSizes).map(([device, config]) => (
                <Button
                  key={device}
                  variant={activeDevice === device ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveDevice(device as any)}
                >
                  {device === 'desktop' && <Monitor className="mr-2 h-4 w-4" />}
                  {device === 'tablet' && <Tablet className="mr-2 h-4 w-4" />}
                  {device === 'mobile' && <Smartphone className="mr-2 h-4 w-4" />}
                  {config.label}
                </Button>
              ))}
            </div>

            {/* Website Preview */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div 
                  className="mx-auto transition-all duration-300 bg-white/[0.02] relative"
                  style={{
                    width: deviceSizes[activeDevice].width,
                    height: activeDevice === 'desktop' ? '800px' : deviceSizes[activeDevice].height,
                  }}
                >
                  {websiteStatus === 'offline' ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                      <Globe className="h-16 w-16 text-white/20 mb-4" />
                      <h3 className="text-xl font-light text-white mb-2">Website Not Running</h3>
                      <p className="text-white/60 mb-6">
                        Your marketing website needs to be started to preview it here.
                      </p>
                      <Button variant="primary" onClick={() => {
                        // In real implementation, this would start the Next.js dev server
                        setWebsiteStatus('building');
                        setTimeout(() => setWebsiteStatus('online'), 3000);
                      }}>
                        Start Website
                      </Button>
                    </div>
                  ) : websiteStatus === 'building' ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-4" />
                      <p className="text-white/60">Starting website server...</p>
                    </div>
                  ) : (
                    <iframe
                      src="http://localhost:3001"
                      className="w-full h-full border-0"
                      title="Website Preview"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeView === 'editor' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-white">Visual Page Editor</h3>
                <p className="text-sm text-white/60 mt-1">
                  Edit your website pages with a visual drag-and-drop editor
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-96 rounded-lg bg-white/[0.02] border border-white/10 flex items-center justify-center">
                  <div className="text-center">
                    <Code className="h-12 w-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">Visual editor coming soon</p>
                    <p className="text-sm text-white/40 mt-2">
                      For now, edit files directly in your code editor
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeView === 'content' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-white">Page Content</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Homepage', 'Features', 'Pricing', 'About', 'Blog'].map((page) => (
                    <div key={page} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.05] transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-white/40" />
                        <span className="text-sm text-white">{page}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-white">Media Library</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-square rounded-lg bg-white/[0.03] flex items-center justify-center hover:bg-white/[0.05] transition-colors cursor-pointer">
                      <Image className="h-8 w-8 text-white/20" />
                    </div>
                  ))}
                </div>
                <Button variant="secondary" className="w-full mt-4">
                  Upload Images
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 