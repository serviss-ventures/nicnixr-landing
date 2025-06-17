/**
 * Website Manager
 * Utilities to control the marketing website from the admin dashboard
 */

export interface WebsiteStatus {
  isRunning: boolean
  url: string | null
  port: number
  startTime: Date | null
}

class WebsiteManager {
  private status: WebsiteStatus = {
    isRunning: false,
    url: null,
    port: 3001,
    startTime: null
  }

  async checkStatus(): Promise<WebsiteStatus> {
    try {
      const response = await fetch('/api/website');
      const data = await response.json();
      
      this.status = {
        isRunning: data.status === 'online',
        url: data.url,
        port: data.port || 3001,
        startTime: data.status === 'online' ? new Date() : null
      };
      
      return this.status;
    } catch (error) {
      console.error('Failed to check website status:', error);
      return this.status;
    }
  }

  async start(): Promise<WebsiteStatus> {
    try {
      const response = await fetch('/api/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' })
      });
      
      const data = await response.json();
      
      if (data.status === 'started' || data.status === 'already_running') {
        this.status = {
          isRunning: true,
          url: data.url || 'http://localhost:3001',
          port: 3001,
          startTime: new Date()
        };
        
        // Wait a bit for the server to fully start, then open in new tab
        if (data.status === 'started') {
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              window.open('http://localhost:3001', '_blank');
            }
          }, 2000);
        } else {
          // Already running, open immediately
          if (typeof window !== 'undefined') {
            window.open('http://localhost:3001', '_blank');
          }
        }
      }
      
      return this.status;
    } catch (error) {
      console.error('Failed to start website:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      await fetch('/api/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' })
      });
      
      this.status = {
        isRunning: false,
        url: null,
        port: 3001,
        startTime: null
      };
    } catch (error) {
      console.error('Failed to stop website:', error);
      throw error;
    }
  }

  getStatus(): WebsiteStatus {
    return this.status;
  }
}

export const websiteManager = new WebsiteManager() 