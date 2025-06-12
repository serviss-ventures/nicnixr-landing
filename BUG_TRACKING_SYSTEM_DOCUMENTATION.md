# Bug Tracking System Documentation

## Overview

This project now has comprehensive bug tracking and error monitoring implemented using **Sentry**. The system automatically captures, reports, and alerts you about any bugs, errors, or issues that occur in both the Next.js landing page and the React Native mobile app.

## Features

### Automatic Error Capture
- **JavaScript Errors**: All uncaught exceptions and promise rejections
- **React Errors**: Component errors caught by Error Boundaries
- **Network Errors**: Failed API calls and network timeouts
- **Performance Issues**: Slow page loads and API response times

### Real-time Notifications
- Email alerts for new errors
- Slack/Discord integration available
- Customizable alert rules and thresholds

### Error Details
- Full stack traces with source maps
- User context (browser, OS, device info)
- Breadcrumbs showing user actions before the error
- Session replay for web errors (when enabled)

## Setup Instructions

### 1. Create a Sentry Account
1. Go to [https://sentry.io/](https://sentry.io/)
2. Sign up for a free account
3. Create two projects:
   - One for the Next.js web app
   - One for the React Native mobile app

### 2. Configure Environment Variables

#### For Next.js App
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SENTRY_DSN=your_nextjs_project_dsn
SENTRY_ORG=your_organization_slug
SENTRY_PROJECT=your_nextjs_project_slug
SENTRY_AUTH_TOKEN=your_auth_token
```

#### For React Native App
Create a `.env` file in the `mobile-app` directory:
```env
EXPO_PUBLIC_SENTRY_DSN=your_react_native_project_dsn
```

### 3. Getting Your Sentry DSN
1. In Sentry dashboard, go to Settings → Projects → Your Project
2. Click on "Client Keys (DSN)"
3. Copy the DSN value

### 4. Getting Auth Token (for source maps)
1. Go to Settings → Account → API → Auth Tokens
2. Create a new token with `project:write` scope
3. Copy the token

## What Gets Tracked

### Automatic Tracking
- **Errors**: All JavaScript errors, unhandled promise rejections
- **Performance**: Page load times, API response times
- **User Sessions**: Track error-free sessions vs sessions with errors
- **Release Health**: Monitor adoption and crash rates for new releases

### Custom Error Tracking
You can manually track errors in your code:

```javascript
import * as Sentry from '@sentry/nextjs';
// or
import * as Sentry from '@sentry/react-native';

// Capture an error
try {
  someRiskyOperation();
} catch (error) {
  Sentry.captureException(error);
}

// Capture a message
Sentry.captureMessage('Something important happened', 'info');

// Add custom context
Sentry.setContext('character', {
  name: 'user-action',
  action: 'clicked-button',
});
```

## Viewing Bug Reports

### Dashboard Overview
1. Log into Sentry
2. Select your project
3. View the Issues page for all errors
4. Click on any issue to see:
   - Error message and stack trace
   - Number of occurrences and affected users
   - Browser/device information
   - User actions leading to the error

### Issue Management
- **Resolve**: Mark issues as resolved when fixed
- **Ignore**: Ignore known issues or false positives
- **Assign**: Assign issues to team members
- **Link**: Link to GitHub issues or JIRA tickets

## Alert Configuration

### Email Alerts
By default, you'll receive emails for:
- First occurrence of new errors
- Regression alerts (resolved errors that reoccur)
- High volume alerts

### Custom Alert Rules
1. Go to Alerts → Create Alert Rule
2. Choose conditions like:
   - Error frequency thresholds
   - Specific error types
   - Performance degradation
   - User impact levels

## Performance Monitoring

### Web Vitals (Next.js)
- **LCP** (Largest Contentful Paint)
- **FID** (First Input Delay)
- **CLS** (Cumulative Layout Shift)
- **TTFB** (Time to First Byte)

### Mobile Performance
- App startup time
- Screen load times
- API response times
- JS bundle execution time

## Best Practices

### 1. Use Error Boundaries
Both apps have error boundaries configured to catch React component errors gracefully.

### 2. Add Context
When catching errors, add relevant context:
```javascript
Sentry.withScope((scope) => {
  scope.setTag('section', 'checkout');
  scope.setContext('order', { id: orderId });
  Sentry.captureException(error);
});
```

### 3. Filter Sensitive Data
The configuration filters out sensitive data by default, but always review what's being sent.

### 4. Monitor Release Health
Tag your releases to track:
- Crash-free sessions
- Adoption rate
- Error trends per release

## Debugging Tips

### Local Development
- Errors are logged to console in development
- Sentry is configured to be more verbose in dev mode
- Check browser/React Native console for Sentry logs

### Production
- Use Sentry's search and filters to find specific errors
- Use breadcrumbs to understand user journey
- Check for patterns in user agent, time of day, etc.

## Maintenance

### Regular Tasks
1. **Review new errors weekly**
2. **Clean up resolved issues monthly**
3. **Update Sentry SDK quarterly**
4. **Review and adjust alert rules**

### SDK Updates
```bash
# Next.js
npm update @sentry/nextjs

# React Native
cd mobile-app && npm update @sentry/react-native
```

## Troubleshooting

### Common Issues

1. **No errors showing in Sentry**
   - Check DSN is correctly set
   - Verify environment variables are loaded
   - Check browser console for Sentry initialization

2. **Source maps not working**
   - Ensure SENTRY_AUTH_TOKEN is set
   - Check build logs for upload confirmation
   - Verify release name matches

3. **Too many alerts**
   - Adjust alert thresholds
   - Filter out known issues
   - Group similar errors

## Support

- [Sentry Documentation](https://docs.sentry.io/)
- [Sentry Status Page](https://status.sentry.io/)
- [Community Forum](https://forum.sentry.io/)

## Summary

Your bug tracking system is now fully configured and will automatically:
- ✅ Capture all errors and exceptions
- ✅ Send real-time notifications
- ✅ Provide detailed error reports
- ✅ Track performance metrics
- ✅ Monitor release health

Remember to check your Sentry dashboard regularly and act on the insights it provides to maintain a high-quality, bug-free application!