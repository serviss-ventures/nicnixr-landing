# AI Coach Testing Guide

## ✅ What's Ready
1. **Admin Dashboard API** - Running on port 3004 with OpenAI key
2. **AI Coach Endpoint** - `/api/ai-coach/chat` is ready
3. **Mobile App Service** - Already configured to use port 3004
4. **User Verification** - Temporarily disabled for testing

## 📱 Test in Mobile App

1. **Reload the app** (shake device → "Reload")

2. **Go to AI Coach**:
   - From Dashboard → AI Coach card
   - Or Progress tab → AI Coach

3. **Send test messages**:
   - "I'm having strong cravings right now"
   - "What are some breathing exercises?"
   - "I'm 7 days clean and feeling proud"

## 🎯 What to Expect

**✅ Working Correctly:**
- Personalized responses from GPT-4
- Mentions "7 days clean from cigarettes"
- Specific coping strategies
- Natural, conversational tone
- 5-10 second response time

**❌ Not Working:**
- Generic fallback responses
- No mention of days clean
- Instant responses (means using fallback)
- Network errors

## 🐛 Troubleshooting

**If you get network errors:**
1. Check admin dashboard is running on port 3004
2. Reload the mobile app
3. Check console for error messages

**If you get generic responses:**
1. Check your OpenAI key is set in `.env.local`
2. Restart admin dashboard
3. Check API endpoint: `curl http://localhost:3004/api/ai-coach/chat`

## 🚀 Next Steps

Once working, you'll want to:
1. Set up real authentication
2. Remove the temporary user verification bypass
3. Add your actual Supabase user IDs
4. Test with real user accounts

Enjoy your AI-powered recovery coach! 🎉 