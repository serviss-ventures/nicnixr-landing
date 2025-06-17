# Where to Put Your OpenAI API Key

**Put it in: `/admin-dashboard/.env.local`**

## Why the Admin Dashboard?
- The AI Coach integration happens server-side in the admin dashboard
- This keeps your API key secure (never exposed to users)
- The mobile app calls the admin dashboard's API endpoint

## Steps:

1. **Open or create** `/admin-dashboard/.env.local`

2. **Add this line:**
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. **Full example** of what your `.env.local` should look like:
   ```
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # OpenAI Configuration
   OPENAI_API_KEY=sk-your-actual-api-key-here

   # Environment
   NODE_ENV=development
   ```

4. **Restart the admin dashboard** after adding the key:
   ```bash
   cd admin-dashboard
   npm run dev
   ```

## Important Security Notes:
- ✅ Admin dashboard `.env.local` = CORRECT (server-side, secure)
- ❌ Mobile app `.env` = WRONG (would expose key to users)
- Never commit `.env.local` to git (it's already in .gitignore)

## Verify It's Working:
After adding the key and restarting, the AI Coach in your mobile app should start giving personalized responses instead of generic ones! 