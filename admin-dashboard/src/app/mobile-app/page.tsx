"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Play, Pause, RefreshCw, Smartphone, Monitor, Tablet, AlertCircle, Terminal, ExternalLink } from 'lucide-react';
import { mobileAppManager, MobileAppStatus } from '@/lib/mobileAppManager';

export default function MobileAppPage() {
  const [status, setStatus] = useState<MobileAppStatus>({
    isRunning: false,
    url: null,
    platform: 'web'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState<'iphone' | 'android' | 'desktop'>('iphone');

  const checkStatus = async () => {
    try {
      const currentStatus = await mobileAppManager.checkStatus();
      setStatus(currentStatus);
      setError(null);
    } catch (err) {
      console.error('Error checking status:', err);
      setError('Failed to check mobile app status');
    }
  };

  useEffect(() => {
    checkStatus();
    
    // Check status every 5 seconds
    const interval = setInterval(checkStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleStartApp = async () => {
    setLoading(true);
    setError(null);
    try {
      await mobileAppManager.start();
      await checkStatus();
    } catch (err: any) {
      setError(err.message || 'Failed to start mobile app');
    } finally {
      setLoading(false);
    }
  };

  const handleStopApp = async () => {
    setLoading(true);
    setError(null);
    try {
      await mobileAppManager.stop();
      await checkStatus();
    } catch (err: any) {
      setError(err.message || 'Failed to stop mobile app');
    } finally {
      setLoading(false);
    }
  };

  const deviceFrames = {
    iphone: 'w-[375px] h-[812px]',
    android: 'w-[360px] h-[800px]',
    desktop: 'w-full h-[800px]'
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Mobile App Preview</h1>
          <p className="text-gray-400">Test your mobile app in a live preview</p>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 bg-red-500/10 border-red-500/20">
            <div className="p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <p className="text-red-400 font-medium">Error</p>
                  <p className="text-gray-300 text-sm mt-1">{error}</p>
                  {error.includes('manually') && (
                    <Card className="mt-3 bg-gray-800/50 border-gray-700">
                      <div className="p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Terminal className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-400 text-sm">Start the app manually:</p>
                        </div>
                        <code className="text-xs text-gray-300 bg-gray-900 px-2 py-1 rounded block">
                          cd mobile-app && npm run web
                        </code>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Controls */}
        <Card className="mb-6">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${status.isRunning ? 'bg-green-400' : 'bg-gray-400'}`} />
                  <span className="text-sm text-gray-300">
                    {status.isRunning ? 'Running' : 'Stopped'}
                  </span>
                </div>
                
                {status.isRunning && status.url && (
                  <a
                    href={status.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-400 hover:text-purple-300"
                  >
                    Open in new tab →
                  </a>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={checkStatus}
                  disabled={loading}
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>

                {!status.isRunning ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleStartApp}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Start App
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleStopApp}
                    disabled={loading}
                  >
                    <Pause className="w-4 h-4" />
                    Stop App
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Device Selector */}
        {status.isRunning && status.url && (
          <Card className="mb-6">
            <div className="p-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">Device:</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={device === 'iphone' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setDevice('iphone')}
                  >
                    <Smartphone className="w-4 h-4" />
                    iPhone
                  </Button>
                  <Button
                    variant={device === 'android' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setDevice('android')}
                  >
                    <Tablet className="w-4 h-4" />
                    Android
                  </Button>
                  <Button
                    variant={device === 'desktop' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setDevice('desktop')}
                  >
                    <Monitor className="w-4 h-4" />
                    Desktop
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Preview with iframe notice */}
        {status.isRunning && status.url ? (
          <>
            <Card className="mb-4 bg-blue-500/10 border-blue-500/20">
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-blue-400 font-medium">Iframe Preview Notice</p>
                    <p className="text-gray-300 text-sm mt-1">
                      If you see a white screen below, it may be due to browser security restrictions. 
                    </p>
                    <a
                      href={status.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 mt-2 text-blue-400 hover:text-blue-300 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open app directly in a new tab</span>
                    </a>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="bg-gray-900 p-4 flex justify-center">
                <div className={`${deviceFrames[device]} bg-white rounded-lg overflow-hidden`}>
                  <iframe
                    src={status.url}
                    className="w-full h-full"
                    title="Mobile App Preview"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                    allow="camera; microphone; geolocation"
                  />
                </div>
              </div>
            </Card>
          </>
        ) : (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <Smartphone className="w-12 h-12 text-gray-600" />
              <p className="text-gray-400">
                {loading ? 'Starting mobile app...' : 'Start the mobile app to see a preview'}
              </p>
              {!loading && !status.isRunning && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">
                    Or start it manually from the terminal:
                  </p>
                  <code className="text-xs text-gray-400 bg-gray-800 px-3 py-2 rounded block">
                    cd mobile-app && npm run web
                  </code>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
} 