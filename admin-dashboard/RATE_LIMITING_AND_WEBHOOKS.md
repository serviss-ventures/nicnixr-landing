# Rate Limiting and Webhooks Implementation

## Overview
This document describes the rate limiting and monitoring webhook implementation for the NixR admin dashboard.

## Rate Limiting

### Configuration
Rate limits are configured per endpoint in `src/middleware/rateLimit.ts`:

| Endpoint | Rate Limit | Window |
|----------|------------|--------|
| `/api/ai-coach/chat` | 10 requests | 1 minute |
| `/api/monitoring` | 60 requests | 1 minute |
| `/api/mobile/logs` | 100 requests | 1 minute |
| `/api/users` | 30 requests | 1 minute |
| Default | 60 requests | 1 minute |

### Headers
When rate limited, the API returns these headers:
- `Retry-After`: Seconds until the limit resets
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: ISO timestamp when limit resets

### Testing Rate Limits
```bash
# Test rate limiting (run this 11 times quickly)
curl -X GET http://localhost:3000/api/test-middleware \
  -H "x-api-key: dev-mobile-app-key"

# You'll get a 429 response after exceeding the limit:
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again in 45 seconds.",
  "retryAfter": 45
}
```

## API Key Validation

### Development API Keys
In development, use: `dev-mobile-app-key`

### Production API Keys
Set these environment variables:
- `MOBILE_APP_API_KEY`: For mobile app access
- `MONITORING_API_KEY`: For monitoring services

### Permissions System
Each API key has specific permissions:
- `mobile:logs:write`: Write mobile app logs
- `mobile:stats:read`: Read mobile app statistics
- `ai:chat`: Access AI coach chat
- `monitoring:read`: Read monitoring data
- `monitoring:write`: Write monitoring data
- `webhooks:monitoring`: Access monitoring webhooks

### Using API Keys
Include the API key in requests:
```bash
curl -X GET http://localhost:3000/api/mobile/logs \
  -H "x-api-key: dev-mobile-app-key"
```

## Monitoring Webhooks

### Endpoint
`POST /api/webhooks/monitoring`

### Configuration
1. Set `MONITORING_WEBHOOK_SECRET` in environment variables
2. Configure your monitoring service (e.g., Sentry) to send webhooks to:
   - Development: `http://localhost:3000/api/webhooks/monitoring`
   - Production: `https://admin.nixr.app/api/webhooks/monitoring`

### Webhook Payload (Sentry Example)
```json
{
  "id": "error-id",
  "project": "nixr-mobile",
  "level": "error",
  "error": {
    "type": "TypeError",
    "value": "Cannot read property 'foo' of undefined"
  },
  "user": {
    "id": "user-123",
    "email": "user@example.com"
  },
  "datetime": "2025-01-13T10:30:00Z"
}
```

### Features
- Stores errors in `error_logs` table
- Triggers alerts for critical/fatal errors
- Updates monitoring metrics
- Supports Sentry webhook format

### Testing Webhooks
```bash
# Test webhook endpoint
curl -X POST http://localhost:3000/api/webhooks/monitoring \
  -H "Content-Type: application/json" \
  -H "x-webhook-signature: your-webhook-secret" \
  -d '{
    "id": "test-error-123",
    "level": "error",
    "message": "Test error from webhook",
    "datetime": "2025-01-13T10:30:00Z"
  }'
```

## Security Considerations

### Rate Limiting
- Uses in-memory storage (upgrade to Redis for production)
- Automatically cleans up old entries
- Disabled in development for easier testing

### API Keys
- Keys are partially hidden when listed
- Permission-based access control
- Separate keys for different services

### Webhooks
- Signature validation (optional in development)
- Stores full payload for debugging
- Automatic alert triggering for critical errors

## Production Setup

1. **Environment Variables**
```env
# API Keys
MOBILE_APP_API_KEY=nixr_prod_[generate-secure-key]
MONITORING_API_KEY=nixr_mon_[generate-secure-key]

# Webhook Secret
MONITORING_WEBHOOK_SECRET=[generate-secure-secret]

# Enable rate limiting
NODE_ENV=production
```

2. **Generate API Keys**
```javascript
// Use the built-in generator
import { generateApiKey } from './middleware/apiKeyValidation';

const mobileKey = generateApiKey('nixr_mobile');
const monitoringKey = generateApiKey('nixr_monitor');
```

3. **Configure Monitoring Service**
- Add webhook URL: `https://admin.nixr.app/api/webhooks/monitoring`
- Add webhook secret from environment variable
- Select error/crash events to send

## Monitoring Dashboard Integration

The monitoring page (`/monitoring`) now shows:
- Real-time error counts from webhooks
- API rate limit statistics
- System health based on error rates
- Critical alerts from webhook data

## Troubleshooting

### Rate Limiting Not Working
- Check `NODE_ENV` is not set to 'development'
- Verify middleware is running (check console logs)
- Clear rate limit cache if needed

### API Key Rejected
- Verify key is in headers: `x-api-key` or `Authorization: Bearer [key]`
- Check permissions match endpoint requirements
- Ensure key is added to environment variables

### Webhooks Not Received
- Verify webhook secret matches
- Check monitoring service configuration
- Look for errors in console logs
- Test with GET request first: `GET /api/webhooks/monitoring` 