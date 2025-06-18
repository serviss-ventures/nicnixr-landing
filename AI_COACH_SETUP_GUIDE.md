# AI Coach Setup Guide

## Current Status
The AI Coach screen is now accessible, but showing fallback responses because the OpenAI integration isn't configured.

## To Get AI Responses Working

### 1. Set Up Admin Dashboard Environment
Create a file `admin-dashboard/.env.local` with:

```
# Supabase (copy from mobile-app/.env)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI API Key (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 2. Start Admin Dashboard
The admin dashboard should already be running from our command. If not:
```bash
cd admin-dashboard
npm run dev
```

It will run on http://localhost:3001

### 3. Test the Connection
When you send a message in the AI Coach, check:
- Mobile app console for "Calling AI coach API at: http://localhost:3001/api/ai-coach/chat"
- Admin dashboard terminal for incoming requests

### 4. Troubleshooting

#### If using Android Emulator:
Update `mobile-app/src/services/aiCoachService.ts`:
```javascript
const API_URL = process.env.EXPO_PUBLIC_ADMIN_API_URL || 
  (__DEV__ ? 'http://10.0.2.2:3001' : 'https://your-production-api.com');
```

#### If using Physical Device:
1. Find your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Update the URL to use your IP:
```javascript
const API_URL = process.env.EXPO_PUBLIC_ADMIN_API_URL || 
  (__DEV__ ? 'http://YOUR_COMPUTER_IP:3001' : 'https://your-production-api.com');
```

#### If OpenAI Errors:
- Check your API key is valid
- Ensure you have credits on your OpenAI account
- The code uses 'gpt-4-turbo-preview' - you can change to 'gpt-3.5-turbo' for cheaper responses

## Quick Test
1. Open AI Coach in the app
2. Type: "I'm having strong cravings right now"
3. You should get a personalized AI response, not the generic fallback

## Notes
- Responses are limited to 300 tokens for conversational feel
- The AI acts like a supportive friend, not a therapist
- All messages are saved to Supabase for history 