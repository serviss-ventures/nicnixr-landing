# AI Coach Chat Fix

## Issue
User was getting "TypeError: network request failed" when trying to send messages in the AI Coach chat after sign up.

## Root Causes
1. **Wrong Port**: The mobile app was trying to connect to `http://localhost:3004` but the admin dashboard was running on port `3003`
2. **Localhost Issue**: Mobile devices/simulators can't access `localhost` - they need the host machine's network IP address
3. **CORS Headers**: The API endpoint didn't have CORS headers to allow cross-origin requests from the mobile app

## Solutions Implemented

### 1. Fixed Network URL in `aiCoachService.ts`
```javascript
// Before:
const API_URL = process.env.EXPO_PUBLIC_ADMIN_API_URL || 'http://localhost:3004';

// After:
const API_URL = process.env.EXPO_PUBLIC_ADMIN_API_URL || 'http://192.168.1.171:3003';
```

### 2. Added CORS Headers to AI Coach API
Added OPTIONS handler and CORS headers to all responses in `admin-dashboard/src/app/api/ai-coach/chat/route.ts`:

```javascript
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Also added same headers to all POST responses
```

## Setup Requirements

### 1. Admin Dashboard Must Be Running
```bash
cd admin-dashboard && npm run dev
# Runs on http://localhost:3003
```

### 2. OpenAI API Key Required
The admin dashboard needs `OPENAI_API_KEY` in `.env.local`:
```
OPENAI_API_KEY=sk-proj-xxxxx
```

### 3. Network IP Address
For mobile development, you need to use your computer's network IP address:
- **Mac**: System Preferences > Network > WiFi > IP Address
- **Windows**: Run `ipconfig` in Command Prompt
- Update the IP in `aiCoachService.ts` if different from `192.168.1.171`

## Testing
1. Start the admin dashboard
2. Start the mobile app
3. Go through onboarding
4. Navigate to AI Coach chat
5. Send a message - should get AI response

## Future Improvements
1. Set `EXPO_PUBLIC_ADMIN_API_URL` in environment variables for different environments
2. Implement proper authentication (currently using mock user data)
3. Add rate limiting to prevent API abuse
4. Monitor OpenAI usage costs 