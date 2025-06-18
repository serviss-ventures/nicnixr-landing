/**
 * Remote Logger Service
 * Sends logs to the admin dashboard for debugging
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RemoteLogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: any;
  userId?: string;
  sessionId?: string;
  platform?: 'ios' | 'android' | 'web';
  appVersion?: string;
  stackTrace?: string;
  context?: {
    screen?: string;
    action?: string;
    [key: string]: any;
  };
}

class RemoteLogger {
  private adminUrl: string;
  private logBuffer: RemoteLogEntry[] = [];
  private batchSize = 50;
  private flushInterval = 5000; // 5 seconds
  private sessionId: string;
  private userId?: string;
  private isEnabled = false; // Disabled for now - causing network errors
  private context: Record<string, any> = {};

  constructor() {
    // Use the local network IP when running on device/simulator
    // Update this IP to match your local network
    const localIP = '192.168.1.171'; // Update this to your machine's IP
    this.adminUrl = Platform.OS === 'web' 
      ? 'http://localhost:3001'
      : `http://${localIP}:3001`;
      
    this.sessionId = this.generateSessionId();
    this.startBatchTimer();
    this.loadUserId();
    
    // Log initialization
    console.log(`RemoteLogger initialized - URL: ${this.adminUrl}`);
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async loadUserId() {
    try {
      const userData = await AsyncStorage.getItem('@user_data');
      if (userData) {
        const user = JSON.parse(userData);
        this.userId = user.id;
      }
    } catch (error) {
      // Ignore errors
    }
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  setContext(key: string, value: any) {
    this.context[key] = value;
  }

  clearContext() {
    this.context = {};
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  private startBatchTimer() {
    setInterval(() => {
      if (this.logBuffer.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  log(level: RemoteLogEntry['level'], message: string, data?: any, stackTrace?: string) {
    if (!this.isEnabled) return;

    const entry: RemoteLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      userId: this.userId,
      sessionId: this.sessionId,
      platform: Platform.OS as any,
      appVersion: Constants.expoConfig?.version,
      stackTrace,
      context: { ...this.context },
    };

    this.logBuffer.push(entry);

    if (this.logBuffer.length >= this.batchSize) {
      this.flush();
    }
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, error?: any) {
    const data = error instanceof Error ? {
      message: error.message,
      name: error.name,
      stack: error.stack,
    } : error;

    this.log('error', message, data, error?.stack);
  }

  async flush() {
    if (this.logBuffer.length === 0) return;

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    try {
      const response = await fetch(`${this.adminUrl}/api/mobile/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: logsToSend }),
      });

      if (!response.ok) {
        // If sending fails, log locally
        console.error('Failed to send logs to admin dashboard', {
          status: response.status,
          logs: logsToSend.length,
        });
      }
    } catch (error) {
      // Network error - just log locally
      console.log('Could not send logs to admin dashboard (network error)');
    }
  }
}

// Export singleton instance
export const remoteLogger = new RemoteLogger(); 