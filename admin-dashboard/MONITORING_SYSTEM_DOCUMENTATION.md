# Monitoring System Documentation

## Overview
The NixR admin dashboard includes a comprehensive monitoring system that tracks real-time metrics, system health, API performance, infrastructure costs, and mobile app logs. The system is designed to work both with real Supabase data and mock data for development.

## Architecture

### Frontend Components

#### 1. System Monitoring Page
- **Location**: `admin-dashboard/src/app/monitoring/page.tsx`
- **Features**:
  - Real-time server metrics (CPU, Memory, Connections)
  - System health checks for all services
  - API performance tracking
  - Crash report monitoring
  - Infrastructure cost tracking
  - Auto-refresh capability (5-second intervals)

#### 2. Mobile App Logs
- **Location**: `admin-dashboard/src/components/mobile/MobileAppLogs.tsx`
- **Features**:
  - Real-time log streaming from mobile app
  - Log level filtering (Error, Warning, Info, Debug)
  - Search functionality
  - Expandable log details with stack traces
  - Platform-specific filtering (iOS, Android, Web)
  - Auto-refresh with 3-second intervals
  - Clear logs functionality

#### 3. Analytics Dashboard
- **Location**: `admin-dashboard/src/app/analytics/page.tsx`
- **Features**:
  - Recovery engagement metrics
  - Sobriety cohort analysis
  - Recovery journey funnel
  - Substance distribution breakdown
  - Time-based trigger patterns
  - Recovery tools effectiveness

#### 4. Onboarding Analytics
- **Location**: `admin-dashboard/src/app/onboarding-analytics/page.tsx`
- **Features**:
  - Real-time onboarding funnel visualization
  - Drop-off analysis by step
  - Average time per step
  - Live activity feed
  - Conversion rate tracking

### Backend APIs

#### 1. Monitoring API
- **Location**: `admin-dashboard/src/app/api/monitoring/route.ts`
- **Endpoints**:
  - `GET /api/monitoring` - Fetches all monitoring data
  - `POST /api/monitoring/webhook` - Receives real-time updates
- **Features**:
  - Graceful fallback to mock data when Supabase unavailable
  - Real-time metrics aggregation
  - Health check status monitoring

#### 2. Mobile Logs API
- **Location**: `admin-dashboard/src/app/api/mobile/logs/route.ts`
- **Endpoints**:
  - `GET /api/mobile/logs` - Fetches filtered logs
  - `POST /api/mobile/logs` - Receives new log entries
  - `DELETE /api/mobile/logs` - Clears all logs
- **Features**:
  - Mock data generation for development
  - Log level filtering
  - Search functionality
  - Platform statistics

#### 3. Analytics API
- **Location**: `admin-dashboard/src/app/api/analytics/route.ts`
- **Endpoint**: `GET /api/analytics`
- **Features**:
  - Parallel data fetching
  - Time range filtering
  - Automatic mock data fallback

#### 4. Mobile Stats API
- **Location**: `admin-dashboard/src/app/api/mobile/stats/route.ts`
- **Endpoint**: `GET /api/mobile/stats`
- **Features**:
  - User statistics aggregation
  - Achievement tracking
  - Progress monitoring

## Database Schema

### Required Tables

#### 1. error_logs
```sql
CREATE TABLE error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz DEFAULT now(),
  level text NOT NULL,
  message text NOT NULL,
  stack_trace text,
  user_id uuid,
  device_info jsonb,
  app_version text,
  created_at timestamptz DEFAULT now()
);
```

#### 2. mobile_app_logs
```sql
CREATE TABLE mobile_app_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz DEFAULT now(),
  level text NOT NULL,
  message text NOT NULL,
  user_id uuid,
  session_id text,
  platform text,
  context jsonb,
  data jsonb,
  stack_trace text,
  created_at timestamptz DEFAULT now()
);
```

#### 3. api_metrics
```sql
CREATE TABLE api_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL,
  method text NOT NULL,
  status_code integer,
  response_time_ms integer,
  timestamp timestamptz DEFAULT now()
);
```

#### 4. system_metrics
```sql
CREATE TABLE system_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type text NOT NULL,
  value numeric NOT NULL,
  unit text,
  timestamp timestamptz DEFAULT now()
);
```

## Mock Data System

The monitoring system includes comprehensive mock data generation for development:

### Server Metrics
- CPU usage: 45-65% with realistic fluctuations
- Memory usage: 60-80% with gradual changes
- Active connections: 1200-1500 with patterns
- Disk usage: Static at 42%

### Health Checks
- API Server: Always healthy
- Database: 95% uptime simulation
- Redis Cache: 98% uptime simulation
- Storage: Always healthy
- AI Service: 92% uptime simulation

### API Performance
- Response times: 50-500ms range
- Request patterns: Realistic daily traffic
- Error rates: 0.5-2% simulation

### Mobile App Logs
- 50 sample logs with various levels
- Realistic error messages and stack traces
- Platform distribution (iOS, Android, Web)
- User and session tracking

## Configuration

### Environment Variables
```env
# Required for full functionality
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional - for mobile app integration
NEXT_PUBLIC_MOBILE_API_KEY=your_api_key
```

### Auto-Refresh Settings
- Monitoring page: 5-second intervals
- Mobile logs: 3-second intervals
- Analytics: On-demand with time range selection
- All pages: Manual refresh button available

## Usage

### Development Mode
1. No Supabase configuration needed
2. Mock data automatically provided
3. All features functional with simulated data

### Production Mode
1. Configure Supabase credentials
2. Run database migrations
3. Mobile app sends logs to `/api/mobile/logs`
4. System metrics collected automatically

## Best Practices

### Performance
- Use pagination for large datasets
- Implement caching for frequently accessed metrics
- Batch log insertions from mobile app
- Use indexes on timestamp columns

### Security
- Validate all incoming log data
- Sanitize user inputs in search
- Rate limit API endpoints
- Use service role key only on server

### Monitoring
- Set up alerts for error spikes
- Monitor API response times
- Track infrastructure costs
- Review crash reports daily

## Troubleshooting

### Common Issues

1. **No data showing**
   - Check Supabase credentials
   - Verify tables exist
   - Check browser console for errors

2. **Slow performance**
   - Reduce auto-refresh frequency
   - Limit number of logs displayed
   - Add database indexes

3. **Mock data not loading**
   - Clear browser cache
   - Check for JavaScript errors
   - Verify API routes are accessible

## Future Enhancements

1. **Real-time Alerts**
   - Slack/Discord integration
   - Email notifications
   - Custom alert rules

2. **Advanced Analytics**
   - Machine learning anomaly detection
   - Predictive failure analysis
   - User behavior insights

3. **Mobile Integration**
   - Push notification debugging
   - Remote configuration
   - A/B test monitoring

4. **Export Capabilities**
   - CSV/Excel export
   - PDF reports
   - API for external tools 