"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader, Card, CardContent, CardHeader, Button, TabNavigation, StatusBadge } from "@/components";
import ContentEditor from "@/components/website/ContentEditor";
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
  AlertCircle,
  Square,
  Play
} from "lucide-react";
import { websiteManager, type WebsiteStatus } from "@/lib/websiteManager";

const deviceSizes = {
  desktop: { width: '100%', height: '100%', label: 'Desktop' },
  tablet: { width: '768px', height: '1024px', label: 'Tablet' },
  mobile: { width: '375px', height: '812px', label: 'Mobile' },
};

export default function WebsitePage() {
  const [activeView, setActiveView] = useState<'preview' | 'editor' | 'content'>('preview');
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [websiteStatus, setWebsiteStatus] = useState<WebsiteStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check website status on mount
  useEffect(() => {
    checkStatus();
    // Check status every 5 seconds
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      setError(null);
      const status = await websiteManager.checkStatus();
      setWebsiteStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check status');
    }
  };

  const handleStartWebsite = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const status = await websiteManager.start();
      setWebsiteStatus(status);
    } catch (error) {
      console.error('Failed to start website:', error);
      setError(error instanceof Error ? error.message : 'Failed to start website');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopWebsite = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await websiteManager.stop();
      await checkStatus();
    } catch (error) {
      console.error('Failed to stop website:', error);
      setError(error instanceof Error ? error.message : 'Failed to stop website');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'editor', label: 'Page Editor', icon: Edit3 },
    { id: 'content', label: 'Content Manager', icon: FileText },
  ];

  const headerActions = (
    <>
      <Button variant="secondary" size="sm" onClick={() => window.open('http://localhost:3002', '_blank')}>
        <ExternalLink className="mr-2 h-4 w-4" />
        Open in New Tab
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
                status={websiteStatus?.isRunning ? 'Online' : 'Offline'} 
                variant={websiteStatus?.isRunning ? 'success' : 'error'} 
              />
            </div>
            {!websiteStatus?.isRunning && (
              <div className="flex items-center gap-2 text-warning">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Website needs to be started</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                websiteStatus?.isRunning ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-sm">
                {websiteStatus?.isRunning ? 'Online' : 'Offline'}
              </span>
            </div>
            {websiteStatus?.isRunning ? (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleStopWebsite}
                disabled={isLoading}
              >
                <Square className="h-4 w-4 mr-1" />
                Stop
              </Button>
            ) : (
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleStartWebsite}
                disabled={isLoading}
              >
                <Play className="h-4 w-4 mr-1" />
                {isLoading ? 'Starting...' : 'Start'}
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={checkStatus}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
                <p className="text-sm mt-2 text-white/60">
                  You can also start the website manually by running: <code className="bg-white/10 px-2 py-1 rounded">npm run dev:website</code>
                </p>
              </div>
            </div>
          </div>
        )}

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
                  variant={deviceView === device ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setDeviceView(device as any)}
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
                    width: deviceSizes[deviceView].width,
                    height: deviceView === 'desktop' ? '800px' : deviceSizes[deviceView].height,
                  }}
                >
                  {websiteStatus?.isRunning ? (
                    <>
                      <iframe 
                        src={websiteStatus.url || ''}
                        className="w-full h-full border border-white/10 rounded-lg"
                        title="Website Preview"
                      />
                      <div className="absolute top-4 right-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(websiteStatus.url || '', '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <Monitor className="h-12 w-12 text-white/20 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Website Offline</h3>
                      <p className="text-white/60 mb-6 max-w-md">
                        Your marketing website needs to be started to preview it here.
                      </p>
                      <Button 
                        variant="primary" 
                        onClick={handleStartWebsite}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Starting...' : 'Start Website'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeView === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor Column */}
            <div>
              <ContentEditor />
            </div>
            
            {/* Preview Column */}
            <div>
              <Card className="sticky top-0">
                <CardHeader>
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Live Preview
                  </h3>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative h-[600px] overflow-hidden rounded-lg">
                    {websiteStatus?.isRunning ? (
                      <iframe 
                        src={websiteStatus.url || ''}
                        className="w-full h-full border-0"
                        title="Website Preview"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <Monitor className="h-12 w-12 text-white/20 mb-4" />
                        <h3 className="text-lg font-medium mb-2">Website Offline</h3>
                        <p className="text-white/60 mb-6">
                          Start the website to see live preview
                        </p>
                        <Button 
                          variant="primary" 
                          onClick={handleStartWebsite}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Starting...' : 'Start Website'}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
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