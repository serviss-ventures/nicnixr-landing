/**
 * Centralized Logging Service
 * 
 * Provides consistent logging with proper levels and
 * ability to disable logs in production
 */

// Lazy load remoteLogger to avoid circular dependency
let remoteLogger: any = null;
const getRemoteLogger = () => {
  if (!remoteLogger) {
    try {
      remoteLogger = require('./remoteLogger').remoteLogger;
    } catch (error) {
      // Remote logger not available
    }
  }
  return remoteLogger;
};

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: Date;
}

class Logger {
  private isDevelopment = __DEV__;
  private logHistory: LogEntry[] = [];
  private maxHistorySize = 100;

  /**
   * Log levels:
   * - debug: Detailed information for debugging
   * - info: General information
   * - warn: Warning messages
   * - error: Error messages
   */
  
  private log(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date()
    };

    // Store in history
    this.logHistory.push(entry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }

    // Send to remote logger (if enabled)
    try {
      const remote = getRemoteLogger();
      if (remote) {
        remote.log(level, message, data);
      }
    } catch (error) {
      // Ignore remote logging errors
    }

    // Only log to console in development
    if (!this.isDevelopment && level !== 'error') {
      return;
    }

    const prefix = `[${level.toUpperCase()}]`;
    
    switch (level) {
      case 'debug':
        if (this.isDevelopment) {
          console.log(prefix, message, data || '');
        }
        break;
      case 'info':
        console.log(prefix, message, data || '');
        break;
      case 'warn':
        console.warn(prefix, message, data || '');
        break;
      case 'error':
        console.error(prefix, message, data || '');
        // In production, you might want to send errors to a service like Sentry
        break;
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

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  /**
   * Get recent log history (useful for debugging)
   */
  getHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  /**
   * Clear log history
   */
  clearHistory() {
    this.logHistory = [];
  }
}

// Export singleton instance
export const logger = new Logger(); 