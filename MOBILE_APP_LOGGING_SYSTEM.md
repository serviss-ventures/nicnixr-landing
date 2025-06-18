# Mobile App Logging System

A powerful real-time logging system to debug mobile app issues through the NixR Admin Dashboard.

## Overview

The logging system consists of:
1. **Remote Logger** - Sends logs from mobile app to admin dashboard
2. **Admin Dashboard Logs UI** - View, filter, and analyze logs in real-time
3. **Clean Code Architecture** - Centralized logging with proper error handling

## Features

### Mobile App Side
- **Automatic Error Tracking** - All errors are automatically logged
- **Context Tracking** - Logs include screen, user ID, session, and platform info
- **Batch Processing** - Logs are batched and sent every 5 seconds
- **Offline Support** - Logs are buffered locally if network is unavailable
- **Clean Integration** - Works with existing logger service

### Admin Dashboard Side
- **Real-time Updates** - Auto-refresh every 3 seconds
- **Powerful Filtering**:
  - Filter by log level (Error, Warning, Info, Debug)
  - Search across all log content
  - Filter by user ID or session
  - Filter by platform (iOS, Android, Web)
- **Stats Overview** - See error counts, unique users, platform distribution
- **Expandable Details** - Click any log to see full details, stack traces, and context
- **Clean UI** - Dark theme with color-coded log levels

## Setup

### 1. Update Network Configuration

In `mobile-app/src/services/remoteLogger.ts`, update the IP address to match your local network:

```typescript
const localIP = '192.168.1.171'; // Update this to your machine's IP
```

To find your IP:
- Mac: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Windows: `ipconfig`

### 2. Start Admin Dashboard

```bash
cd admin-dashboard && npm run dev
```

The dashboard will run on port 3001 (or next available port).

### 3. View Logs

1. Navigate to http://localhost:3001/mobile-app
2. Click on the "Logs" tab
3. Start your mobile app - logs will appear automatically

## Usage Examples

### Basic Logging

```typescript
import { logger } from './services/logger';
import { remoteLogger } from './services/remoteLogger';

// Set context for current screen
remoteLogger.setContext('screen', 'ProfileScreen');

// Log different levels
logger.debug('User navigated to profile');
logger.info('Profile loaded successfully', { userId: user.id });
logger.warn('Slow network detected', { latency: 2000 });
logger.error('Failed to load avatar', error);
```

### Error Handling with Remote Logging

```typescript
try {
  const result = await someAsyncOperation();
  logger.info('Operation successful', result);
} catch (error) {
  logger.error('Operation failed', error);
  remoteLogger.error('Critical operation failure', {
    operation: 'someAsyncOperation',
    error: error.message,
    stack: error.stack,
    context: { userId, sessionId }
  });
}
```

### Tracking User Flow

```typescript
// Track onboarding flow
remoteLogger.setContext('flow', 'onboarding');
remoteLogger.info('Onboarding started', { step: 1 });

// Track errors with context
if (!userId || !isValidUUID(userId)) {
  remoteLogger.warn('Invalid user ID in onboarding', {
    userId,
    isValid: false,
    step: currentStep
  });
}
```

## Debugging Network Errors

When you see "Network request failed" errors:

1. **Check Logs Tab** - All network errors are logged with details
2. **Look for Patterns** - Filter by error level to see all failures
3. **Check Stack Traces** - Expand error logs to see full stack traces
4. **Monitor Context** - See which screens/actions trigger errors

## Clean Code Practices

The logging system follows clean code principles:

- **Single Responsibility** - Each service has one clear purpose
- **Dependency Injection** - Logger can be mocked for testing
- **Error Boundaries** - Remote logging errors don't crash the app
- **Type Safety** - Full TypeScript types for all log entries
- **Performance** - Batched sending, minimal overhead

## Troubleshooting

### Logs Not Appearing
1. Check admin dashboard is running on correct port
2. Verify IP address in remoteLogger matches your network
3. Check browser console for CORS errors
4. Ensure mobile app is in development mode (`__DEV__`)

### Network Errors
1. Disable firewall temporarily
2. Ensure devices are on same network
3. Try using ngrok for public URL
4. Check if offline mode is enabled

### Performance Issues
1. Adjust batch size in remoteLogger (default: 50)
2. Increase flush interval (default: 5 seconds)
3. Clear logs regularly in admin dashboard
4. Disable debug logs in production

## Future Enhancements

- Persist logs to Supabase database
- Export logs to CSV/JSON
- Log analytics and trends
- Alert system for critical errors
- Integration with error tracking services 