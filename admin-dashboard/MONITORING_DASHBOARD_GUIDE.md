# NixR Monitoring Dashboard Guide

## Overview

The NixR monitoring dashboard provides real-time insights into your application's health, performance, and user activity. It's now fully integrated with your Supabase database to show actual metrics rather than mock data.

## Features

### 1. **Real-Time Metrics**
- **Active Users**: Users who have been active in the last 5 minutes (based on `updated_at` field)
- **Requests Per Minute**: Sum of AI coach messages, community posts, and journal entries
- **Average Response Time**: Calculated from AI coach message response times
- **Error Rate**: Percentage of high/critical errors from the audit log
- **System Load**: Percentage of active users vs total users (used as CPU proxy)
- **Memory Usage**: Estimated based on system load

### 2. **Health Checks**
Real-time health monitoring for:
- **Supabase Database**: Checks database connectivity
- **Authentication**: Verifies auth service is working
- **Storage (CDN)**: Tests file storage access
- **AI Coach API**: Ensures AI coach tables are accessible
- **Push Notifications**: Currently mocked (integrate with your push service)
- **RevenueCat**: Currently mocked (integrate with RevenueCat API)

### 3. **Crash Reports**
- Displays recent errors from the `ai_coach_audit_log` table
- Shows platform, version, error message, and stack trace
- Includes device information when available

### 4. **Auto-Refresh**
- Toggle auto-refresh to update metrics every 5 seconds
- Manual refresh button available

## Data Sources

The monitoring dashboard pulls data from these Supabase tables:

1. **users**: Active user counts and system load
2. **ai_coach_sessions**: AI coach activity monitoring
3. **ai_coach_messages**: Response time metrics
4. **community_posts**: Community engagement metrics
5. **journal_entries**: User engagement tracking
6. **ai_coach_audit_log**: Error tracking and crash reports

## API Endpoints

### GET /api/monitoring
Returns all monitoring data including:
```json
{
  "serverMetrics": {
    "cpu": 15.2,
    "memory": 18.24,
    "activeConnections": 23,
    "requestsPerMinute": 145,
    "errorRate": 0.5,
    "responseTime": 245
  },
  "healthChecks": [...],
  "recentCrashes": [...],
  "lastRefresh": "2025-01-18T..."
}
```

## Testing the Dashboard

### Generate Test Activity

Run the test script to generate sample data:

```bash
cd admin-dashboard
npx tsx scripts/generate-test-activity.ts
```

This will create:
- Test user with activity
- AI coach sessions and messages
- Community posts
- Journal entries
- Sample error logs

### Manual Testing

1. Open the monitoring dashboard: http://localhost:3000/monitoring
2. Enable auto-refresh to see real-time updates
3. Use your mobile app to generate real activity
4. Monitor the metrics updating in real-time

## Customization

### Adding New Metrics

1. Update the `fetchMetrics` function in `/app/monitoring/page.tsx`
2. Add corresponding queries in `/api/monitoring/route.ts`
3. Update the UI to display new metrics

### Adding New Health Checks

1. Add new service check in `performHealthChecks` function
2. Include proper error handling and response time measurement
3. Update the health check display grid if needed

### Integrating External Services

For production, integrate real endpoints for:
- Push notification service status
- RevenueCat subscription metrics
- CDN performance metrics
- Third-party API health

## Performance Considerations

1. **Query Optimization**: All queries use time-based filters to limit data
2. **Indexes**: Ensure proper indexes on frequently queried fields:
   - `users.updated_at`
   - `ai_coach_messages.created_at`
   - `community_posts.created_at`
   - `ai_coach_audit_log.created_at`

3. **Caching**: Consider implementing Redis for frequently accessed metrics

## Security

- Uses service role key for admin operations
- All data access is server-side only
- No sensitive user data exposed in metrics

## Troubleshooting

### No Data Showing
1. Check Supabase connection in `.env.local`
2. Verify tables exist in your database
3. Run test activity generator script
4. Check browser console for errors

### Slow Performance
1. Add database indexes (see Performance Considerations)
2. Reduce auto-refresh frequency
3. Limit time range for queries

### Health Checks Failing
1. Verify Supabase URL and keys are correct
2. Check RLS policies aren't blocking admin access
3. Ensure all required tables exist

## Future Enhancements

1. **Historical Data**: Add time-series graphs for trends
2. **Alerting**: Set up thresholds and notifications
3. **Custom Dashboards**: Allow admins to create custom metric views
4. **Export**: Add CSV/PDF export for reports
5. **Mobile App Integration**: Direct links to user profiles from crash reports 