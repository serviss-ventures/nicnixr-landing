# API Monitoring System Guide

## Overview

The NixR Admin Dashboard now includes a comprehensive API monitoring system that tracks all API endpoints with real-time metrics, performance data, and error tracking.

## Features

### 1. **Centralized API Registry** (`src/lib/apiRegistry.ts`)
- Complete catalog of all API endpoints (28 endpoints across 9 categories)
- Categorization: Auth, AI, Mobile, User, Community, Payment, Admin, Monitoring, Content
- Endpoint metadata: methods, authentication requirements, rate limits

### 2. **Real-Time Metrics Tracking** (`src/lib/apiMetrics.ts`)
- Automatic tracking of all API requests
- Metrics collected:
  - Response times (avg, p95, p99)
  - Request/response sizes
  - Status codes and error rates
  - Unique users per endpoint
  - Geographic distribution (via IP)
- Buffered writes for performance (flushes every 10 seconds)
- 1-minute cache for dashboard queries

### 3. **Enhanced Monitoring Dashboard**
- **Time Range Filters**: Last hour, 24 hours, 7 days
- **Category Filters**: View endpoints by category or all at once
- **Category Overview Cards**: Quick stats for each API category
- **Detailed Endpoint Table**:
  - Call volume with K notation for thousands
  - Unique user counts
  - Response time percentiles
  - Error counts and rates with color coding
  - Category badges with custom colors

### 4. **Automatic Metrics Collection**
- Middleware wrapper (`withMetrics`) for automatic tracking
- No code changes needed for existing endpoints
- Tracks both successful and failed requests

## Implementation

### Database Schema

```sql
CREATE TABLE api_metrics (
  id UUID PRIMARY KEY,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  response_time INTEGER NOT NULL,
  status_code INTEGER NOT NULL,
  error_message TEXT,
  user_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  request_size INTEGER,
  response_size INTEGER
);
```

### Using the Metrics Middleware

```typescript
import { withMetrics } from '@/middleware/apiMetricsMiddleware';

async function handler(request: NextRequest) {
  // Your API logic here
  return NextResponse.json({ data });
}

// Wrap with metrics tracking
export const GET = withMetrics(handler);
export const POST = withMetrics(handler);
```

### Accessing Metrics Data

```typescript
import { apiMetrics } from '@/lib/apiMetrics';

// Get all endpoint metrics
const metrics = await apiMetrics.getMetricsSummary('24h');

// Get metrics for specific endpoint
const endpointMetrics = await apiMetrics.getEndpointMetrics('/api/ai-coach', '24h');

// Get category-level metrics
const categoryMetrics = await apiMetrics.getCategoryMetrics('7d');
```

## API Categories

1. **Authentication** (Green) - Login, registration, session management
2. **AI & Coach** (Purple) - AI coach interactions and chat
3. **Mobile** (Blue) - Mobile app specific endpoints
4. **User** (Indigo) - Profile, progress, journal entries
5. **Community** (Pink) - Social features, buddy system
6. **Payment** (Red) - Subscriptions, IAP, avatar purchases
7. **Admin** (Amber) - Admin tools and analytics
8. **Monitoring** (Emerald) - Health checks, system monitoring
9. **Content** (Violet) - Website content management

## Monitoring Dashboard Usage

1. Navigate to **System Monitoring** in the admin dashboard
2. Click on the **API Performance** tab
3. Use time range buttons to adjust the reporting period
4. Filter by category to focus on specific API groups
5. Monitor key metrics:
   - **Call Volume**: Total API calls in the period
   - **Response Times**: Average and percentile metrics
   - **Error Rates**: Percentage of failed requests
   - **Unique Users**: Number of distinct users per endpoint

## Performance Considerations

- Metrics are buffered and batch-written every 10 seconds
- Dashboard queries are cached for 1 minute
- Old metrics are automatically cleaned up after 30 days
- Indexes optimize common query patterns

## Future Enhancements

1. **Alerting**: Automatic alerts for high error rates or slow endpoints
2. **SLA Monitoring**: Track uptime and performance against SLAs
3. **Cost Analysis**: Estimate API costs based on usage
4. **Rate Limiting**: Enforce limits based on tracked metrics
5. **API Documentation**: Auto-generate docs from the registry

## Troubleshooting

### No metrics showing up?
1. Ensure the `api_metrics` table exists in your database
2. Check that endpoints are wrapped with `withMetrics`
3. Verify Supabase connection and permissions

### Metrics seem outdated?
- The dashboard caches data for 1 minute
- Click "Refresh" to force an update
- Check auto-refresh is enabled

### High error rates?
- Click on the endpoint to see top error messages
- Check recent deployments for breaking changes
- Monitor the specific time when errors started

## Development Mode

When Supabase is not configured, the system automatically provides mock data for all endpoints, allowing you to develop and test the monitoring UI without a database connection. 