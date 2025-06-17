/**
 * Mobile App Manager
 * Manages the mobile app development server for preview in admin dashboard
 */

export interface MobileAppStatus {
  isRunning: boolean;
  url: string | null;
  platform: 'ios' | 'android' | 'web';
  error?: string;
}

class MobileAppManager {
  private webUrl = 'http://localhost:19006'; // Expo web URL
  
  async checkStatus(): Promise<MobileAppStatus> {
    try {
      // Try to check if Expo web is running directly
      const response = await fetch(this.webUrl, {
        method: 'HEAD',
        mode: 'no-cors',
      });
      
      // If we get here without error, assume it's running
      return {
        isRunning: true,
        url: this.webUrl,
        platform: 'web'
      };
    } catch (error) {
      // If direct check fails, try the API endpoint
      try {
        const apiResponse = await fetch('/api/mobile-app');
        
        if (!apiResponse.ok) {
          throw new Error('API not available');
        }
        
        const data = await apiResponse.json();
        return data;
      } catch (apiError) {
        // Both checks failed, app is not running
        return {
          isRunning: false,
          url: null,
          platform: 'web',
          error: 'Mobile app server is not running'
        };
      }
    }
  }

  async start(): Promise<MobileAppStatus> {
    try {
      // Call the API to start the mobile app
      const response = await fetch('/api/mobile-app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'start' }),
      });

      if (!response.ok) {
        throw new Error('Failed to start mobile app server. Make sure the admin dashboard is running.');
      }

      const data = await response.json();
      
      // Wait for the server to start
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Check status
      return await this.checkStatus();
    } catch (error) {
      console.error('Error starting mobile app:', error);
      throw new Error('Failed to start mobile app. You can start it manually by running: cd mobile-app && EXPO_NO_PROMPT=true npx expo start --web --port 19006');
    }
  }

  async stop(): Promise<void> {
    try {
      const response = await fetch('/api/mobile-app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'stop' }),
      });

      if (!response.ok) {
        throw new Error('Failed to stop mobile app');
      }
    } catch (error) {
      console.error('Error stopping mobile app:', error);
      throw error;
    }
  }
}

export const mobileAppManager = new MobileAppManager(); 