# Admin Dashboard API Documentation

## Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication
Currently using simple cookie-based auth (temporary). Production will use Supabase Auth.

### Headers
```
x-api-key: your-mobile-api-key (for mobile endpoints)
Cookie: nixr-admin-auth=true (for admin endpoints)
```

## Endpoints

### Health Check
```
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-23T10:30:00Z",
  "version": "1.0.0"
}
```

---

### System Monitoring

#### Get Monitoring Data
```
GET /api/monitoring
```

**Response:**
```json
{
  "serverMetrics": {
    "cpu": 45.2,
    "memory": 72.8,
    "activeConnections": 1234,
    "requestsPerMinute": 567,
    "errorRate": 0.02,
    "avgResponseTime": 145
  },
  "healthChecks": [
    {
      "service": "Database",
      "status": "healthy",
      "responseTime": 12,
      "lastCheck": "2024-01-23T10:29:55Z"
    }
  ],
  "recentCrashes": [],
  "performanceHistory": [],
  "apiPerformance": {},
  "infrastructureCosts": {
    "total": 850,
    "compute": 400,
    "storage": 150,
    "bandwidth": 200,
    "ai": 100,
    "trend": 5.2
  }
}
```

#### Webhook for Crash Reports
```
POST /api/monitoring
Content-Type: application/json

{
  "platform": "ios",
  "exception": {
    "values": [{
      "value": "Error message",
      "stacktrace": {
        "frames": []
      }
    }]
  },
  "release": "1.0.0",
  "user": {
    "id": "user-123"
  },
  "contexts": {
    "device": {
      "model": "iPhone 14"
    },
    "os": {
      "version": "17.2"
    }
  }
}
```

---

### Analytics

#### Get Analytics Data
```
GET /api/analytics?timeRange=7d
```

**Query Parameters:**
- `timeRange`: `7d`, `30d`, or `90d`

**Response:**
```json
{
  "engagement": [
    {
      "date": "Mon",
      "checkins": 3200,
      "journalEntries": 2100,
      "aiSessions": 1850,
      "cravingScores": 4.2
    }
  ],
  "cohorts": [
    {
      "cohort": "0-7 days",
      "day7": 100,
      "day30": 42,
      "day60": 28,
      "day90": 22,
      "day180": 15,
      "day365": 12
    }
  ],
  "funnel": [
    {
      "name": "Downloaded App",
      "value": 10000,
      "fill": "#C084FC"
    }
  ],
  "metrics": {
    "retention30Day": 68.4,
    "avgDaysClean": 127,
    "crisisInterventions": 42,
    "recoveryScore": 8.2
  },
  "substances": [
    {
      "substance": "Vape",
      "users": 3842,
      "percentage": 42
    }
  ]
}
```

---

### AI Coach

#### Send Chat Message
```
POST /api/ai-coach/chat
Content-Type: application/json

{
  "message": "I'm feeling stressed today",
  "userId": "user-123",
  "sessionId": "session-456",
  "context": {
    "daysClean": 45,
    "primarySubstance": "vape"
  }
}
```

**Response:**
```json
{
  "message": "I hear you're feeling stressed...",
  "sessionId": "session-456",
  "sentiment": "supportive",
  "suggestedActions": ["breathing_exercise", "journal_entry"]
}
```

#### Get AI Coach Stats
```
GET /api/ai-coach
```

**Response:**
```json
{
  "totalSessions": 15234,
  "activeUsers": 3421,
  "avgSessionLength": 8.5,
  "sentimentBreakdown": {
    "positive": 45,
    "neutral": 35,
    "negative": 20
  }
}
```

---

### Mobile App Integration

#### Get Mobile App Logs
```
GET /api/mobile/logs?level=error,warn&search=login&limit=100
```

**Query Parameters:**
- `level`: Comma-separated list of log levels (error, warn, info, debug)
- `search`: Search term for message content
- `limit`: Maximum number of logs to return

**Response:**
```json
{
  "logs": [
    {
      "id": "log-1",
      "timestamp": "2024-01-23T10:30:00Z",
      "level": "error",
      "message": "Failed to load user profile",
      "userId": "user-123",
      "sessionId": "session-456",
      "platform": "ios",
      "context": {
        "screen": "Profile",
        "version": "1.0.0"
      },
      "stackTrace": "Error: Failed to load..."
    }
  ],
  "stats": {
    "totalLogs": 150,
    "errorCount": 25,
    "warnCount": 40,
    "infoCount": 60,
    "debugCount": 25,
    "uniqueUsers": 75,
    "platforms": {
      "ios": 80,
      "android": 60,
      "web": 10
    }
  }
}
```

#### Submit Mobile App Log
```
POST /api/mobile/logs
Content-Type: application/json
x-api-key: your-mobile-api-key

{
  "level": "error",
  "message": "Network request failed",
  "userId": "user-123",
  "sessionId": "session-456",
  "platform": "android",
  "context": {
    "screen": "Dashboard",
    "action": "fetchUserData"
  },
  "data": {
    "errorCode": "NETWORK_ERROR",
    "url": "/api/user/profile"
  }
}
```

#### Clear Mobile App Logs
```
DELETE /api/mobile/logs
```

#### Get Mobile App Stats
```
GET /api/mobile/stats
x-api-key: your-mobile-api-key
```

**Response:**
```json
{
  "users": {
    "total": 5624,
    "active": 3421,
    "new": 234
  },
  "activity": {
    "dailyActive": 2341,
    "weeklyActive": 4123,
    "monthlyActive": 5234
  },
  "trending": {
    "topFeatures": ["ai_coach", "journal", "community"],
    "topChallenges": ["cravings", "stress", "sleep"]
  }
}
```

---

### User Management

#### Get Users Stats
```
GET /api/users/stats
```

**Response:**
```json
{
  "totalUsers": 5624,
  "activeToday": 1234,
  "newThisWeek": 345,
  "bySubstance": {
    "cigarettes": 1687,
    "vape": 2362,
    "nicotine_pouches": 956,
    "chew_dip": 619
  },
  "achievements": {
    "totalUnlocked": 12456,
    "mostCommon": ["first_day", "week_warrior", "journal_master"]
  }
}
```

---

### Website Content

#### Get Website Content
```
GET /api/website/content
```

**Response:**
```json
{
  "hero": {
    "title": "Break Free from Nicotine",
    "subtitle": "Your journey starts here"
  },
  "features": [],
  "testimonials": []
}
```

#### Update Website Content
```
POST /api/website/content
Content-Type: application/json

{
  "section": "hero",
  "content": {
    "title": "New Title",
    "subtitle": "New Subtitle"
  }
}
```

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request",
  "message": "Missing required parameter: userId"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

## Rate Limiting

- Default: 100 requests per minute per IP
- AI Coach: 20 requests per minute per user
- Mobile logs submission: 1000 requests per minute per API key

## Best Practices

1. **Always include error handling** for network failures
2. **Use appropriate HTTP methods** (GET for reading, POST for creating, etc.)
3. **Include user context** when available for better debugging
4. **Batch requests** when possible to reduce API calls
5. **Cache responses** appropriately to improve performance

## Testing

### Using cURL
```bash
# Health check
curl http://localhost:3000/api/health

# Get monitoring data
curl http://localhost:3000/api/monitoring \
  -H "Cookie: nixr-admin-auth=true"

# Submit mobile log
curl -X POST http://localhost:3000/api/mobile/logs \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{"level":"error","message":"Test error"}'
```

### Using Postman
Import the included `admin-dashboard.postman_collection.json` for a complete collection of all endpoints with examples. 