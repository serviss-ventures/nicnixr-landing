# Recovery Analytics Setup Guide

## Overview

The Recovery Analytics page is fully prepared to display real user data from your Supabase backend. Currently, it shows mock data but will automatically switch to real data once your database is populated.

## Key Features Ready for Launch

### 1. **Sobriety Retention by Cohort**
- Tracks user retention based on their initial sobriety length
- Shows retention rates at 7, 30, 60, 90, 180, and 365 days
- Cohorts: 0-7 days, 8-30 days, 31-90 days, 91+ days

### 2. **Recovery Engagement Metrics**
- Daily check-ins count
- Journal entries tracking
- AI coaching sessions
- Average craving scores (1-10 scale)

### 3. **Key Performance Indicators**
- **30-Day Retention**: Percentage of users still active after 30 days
- **Average Days Clean**: Mean sobriety duration across all users
- **Crisis Interventions**: Count of urgent support tickets
- **Recovery Score**: Calculated metric (0-10) based on retention and average days

### 4. **Recovery Journey Funnel**
- Downloaded App → Created Account → Set Quit Date → First Journal → 7 Days → 30 Days
- Shows drop-off at each stage

### 5. **Substance Distribution**
- Breakdown by nicotine product type:
  - Vape
  - Cigarettes
  - Nicotine Pouches
  - Chew/Dip

## Database Tables Required

To enable real data, apply the enhanced schema (`enhanced_schema.sql`) which includes:

1. **daily_metrics** - Aggregated daily engagement data
2. **support_tickets** - For crisis intervention tracking
3. **app_downloads** - For funnel analysis
4. **trigger_events** - For trigger pattern analysis
5. **tool_usage** - For recovery tool effectiveness

## Data Flow

```
Mobile App Actions → Supabase Database → Analytics Functions → Admin Dashboard
```

### What Happens When Backend is Connected:

1. **User Actions in Mobile App**:
   - Check-ins logged
   - Journal entries saved
   - Craving scores recorded
   - Support tickets created

2. **Database Updates**:
   - User table tracks `days_clean`, `last_active_at`, `primary_substance`
   - Daily metrics aggregated
   - Funnel progression tracked

3. **Analytics Dashboard**:
   - Real-time queries fetch current data
   - Falls back to mock data if tables are empty
   - Auto-refreshes based on selected time range

## Testing the Connection

1. Run the enhanced schema in Supabase
2. Create a test user with a quit date
3. Add some daily metrics entries
4. The analytics page will automatically display real data

## Mock Data Fallback

If database tables are empty or queries fail, the system automatically displays realistic mock data to demonstrate functionality. This ensures the dashboard always looks complete during demos or testing.

## Future Enhancements Ready

- Trigger pattern analysis by time of day
- Recovery tool effectiveness tracking
- Comparative analytics between cohorts
- Export functionality for reports 