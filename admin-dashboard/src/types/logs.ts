/**
 * Mobile App Log Types
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
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

export interface LogFilter {
  level?: LogLevel[];
  userId?: string;
  sessionId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  platform?: string;
}

export interface LogStats {
  totalLogs: number;
  errorCount: number;
  warnCount: number;
  uniqueUsers: number;
  platforms: {
    ios: number;
    android: number;
    web: number;
  };
} 