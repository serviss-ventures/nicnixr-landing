# Setting Up a Test User for AI Coach

## Quick Test User Setup

Since you haven't set up authentication yet, here's how to create a test user:

### 1. Go to Supabase Dashboard
- Open your Supabase project
- Go to **Authentication** → **Users**

### 2. Create a Test User
Click "Add user" → "Create new user" and use:
- Email: `test@nixr.app`
- Password: `testpass123`
- Click "Create user"

### 3. Copy the User ID
After creating, you'll see a UUID like:
```
123e4567-e89b-12d3-a456-426614174000
```
Copy this ID.

### 4. Add User to Database
Go to **SQL Editor** and run:

```sql
-- Replace 'YOUR-USER-UUID-HERE' with the actual UUID from step 3
INSERT INTO public.users (id, days_clean, substance_type, created_at)
VALUES (
  'YOUR-USER-UUID-HERE',
  7, -- 7 days clean for testing
  'cigarettes',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  days_clean = 7,
  substance_type = 'cigarettes';
```

### 5. Update Mobile App (Temporary)
For now, let's hardcode this test user ID:

In `mobile-app/src/screens/dashboard/AICoachScreen.tsx`, temporarily add at the top of the component:

```typescript
// TEMPORARY: Test user ID - replace with real auth later
const TEST_USER_ID = 'YOUR-USER-UUID-HERE'; // Replace with your UUID
```

And update the `sendMessage` function to use this ID:

```typescript
const response = await sendAIMessage(
  text,
  sessionId,
  TEST_USER_ID, // Instead of userId || 'anonymous'
  conversationHistory
);
```

## Alternative: Skip User Verification (Development Only)

If you want to test without creating a user, modify the API endpoint:

In `admin-dashboard/src/app/api/ai-coach/chat/route.ts`, comment out the user verification:

```typescript
// TEMPORARY: Skip user verification for testing
// const { data: user, error: userError } = await supabase
//   .from('users')
//   .select('id, days_clean, substance_type')
//   .eq('id', userId)
//   .single();

// if (userError || !user) {
//   return NextResponse.json(
//     { error: 'User not found' },
//     { status: 404 }
//   );
// }

// Use mock user data for testing
const user = {
  days_clean: 7,
  substance_type: 'cigarettes'
};
```

**Remember to uncomment this before going to production!**

## Testing the AI Coach

After setting up the test user:

1. Restart your admin dashboard
2. Open the mobile app
3. Go to AI Coach
4. Send a message like "I'm having cravings"
5. You should get a personalized AI response! 