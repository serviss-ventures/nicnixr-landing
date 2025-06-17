# OpenAI Integration Setup Guide

This guide will help you integrate OpenAI's GPT-4 to power your AI Recovery Coach with real artificial intelligence.

## 🚀 Quick Setup

### Step 1: Get an OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in to your account
3. Navigate to **API Keys** in the sidebar
4. Click **Create new secret key**
5. Copy the key (you won't be able to see it again!)

### Step 2: Add the API Key to Your Environment

Add this to your **admin-dashboard/.env.local** file:
```
# Existing Supabase keys...

# OpenAI Configuration
OPENAI_API_KEY=sk-your-api-key-here
```

### Step 3: (Optional) Configure Mobile App API URL

If your admin dashboard is deployed, add this to **mobile-app/.env**:
```
# Existing Supabase keys...

# Admin Dashboard API URL (for AI chat)
EXPO_PUBLIC_ADMIN_API_URL=https://your-admin-dashboard.vercel.app
```

For local development, it will automatically use `http://localhost:3000`.

## 🧠 How It Works

1. **User sends message** in the mobile app
2. **Mobile app calls** your admin dashboard API endpoint
3. **Admin dashboard** sends the message to OpenAI with:
   - Custom recovery coach personality
   - User's recovery context (days clean, substance type)
   - Recent conversation history
4. **OpenAI responds** with personalized recovery support
5. **Response is saved** to Supabase with sentiment analysis
6. **User sees** the AI response in real-time

## 💰 Cost Management

### Model Options

**GPT-4 Turbo** (Currently configured):
- Best quality responses
- ~$0.01 per 1K tokens input
- ~$0.03 per 1K tokens output
- Average conversation: $0.02-0.05

**GPT-3.5 Turbo** (Budget option):
- Good quality, much cheaper
- ~$0.0005 per 1K tokens input
- ~$0.0015 per 1K tokens output
- Average conversation: $0.001-0.003

To switch to GPT-3.5, change this line in `admin-dashboard/src/app/api/ai-coach/chat/route.ts`:
```typescript
model: 'gpt-3.5-turbo', // Instead of 'gpt-4-turbo-preview'
```

### Setting Usage Limits

OpenAI lets you set monthly spending limits:
1. Go to **Usage limits** in OpenAI dashboard
2. Set a hard limit (e.g., $50/month)
3. Set a soft limit for alerts (e.g., $40/month)

## 🔒 Security Best Practices

1. **Never expose OpenAI API key to frontend**
   - ✅ Key is only in admin dashboard
   - ✅ Mobile app calls your API, not OpenAI directly

2. **Add rate limiting** (recommended for production):
   ```typescript
   // In your API route, add rate limiting
   import { Ratelimit } from '@upstash/ratelimit';
   ```

3. **Monitor usage**:
   - Check OpenAI dashboard regularly
   - Log token usage from API responses
   - Set up alerts for unusual activity

## 🎯 Customizing the AI Coach

### Edit the System Prompt

In `admin-dashboard/src/app/api/ai-coach/chat/route.ts`, customize the `SYSTEM_PROMPT`:

```typescript
const SYSTEM_PROMPT = `You are a compassionate recovery coach...`;
```

### Add More Context

Include user-specific information:
```typescript
const userContext = `User is ${user.days_clean} days clean from ${user.substance_type}. 
They've saved $${user.money_saved} so far.`;
```

### Adjust Response Style

Modify these parameters:
```typescript
temperature: 0.7,        // 0-1: Higher = more creative
max_tokens: 500,         // Max response length
presence_penalty: 0.1,   // Reduces repetition
frequency_penalty: 0.1,  // Encourages variety
```

## 🚨 Troubleshooting

### "Failed to generate response"
- Check your API key is correct
- Verify you have credits in OpenAI account
- Check console logs for specific errors

### "Rate limit exceeded"
- You've hit OpenAI's rate limits
- Wait a minute and try again
- Consider upgrading your OpenAI plan

### "AI service temporarily unavailable"
- You've run out of OpenAI credits
- Add payment method to OpenAI account
- Check usage limits haven't been reached

## 📊 Monitoring & Analytics

The API returns usage data with each response:
```json
{
  "response": "AI message...",
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 80,
    "total_tokens": 230
  }
}
```

Consider logging this to track:
- Average tokens per conversation
- Cost per user
- Most expensive conversations
- Peak usage times

## 🎉 You're Live!

Your AI Recovery Coach now has the full power of GPT-4:
- ✅ Personalized recovery support
- ✅ Context-aware responses
- ✅ Crisis detection
- ✅ Empathetic, professional coaching
- ✅ 24/7 availability

Test it out by starting a conversation in the mobile app! 