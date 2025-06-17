# Setting Up AI Coach Tables

## Quick Steps

1. **Go to your Supabase SQL Editor**
   - Open your Supabase project
   - Navigate to SQL Editor (left sidebar)

2. **Run the AI Coach Schema**
   - Copy the entire contents of: `admin-dashboard/supabase/02_ai_coach_schema.sql`
   - Paste it into the SQL editor
   - Click "Run" or press Cmd/Ctrl + Enter

## What This Creates

The AI Coach schema creates three tables:

1. **ai_coach_sessions** - Tracks coaching sessions
2. **ai_coach_messages** - Stores all messages between users and AI coach
3. **ai_coach_analytics** - Aggregated analytics data

## Verify Tables Were Created

After running the SQL, check that the tables exist:

```sql
-- Run this query to verify
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'ai_coach%';
```

You should see:
- ai_coach_sessions
- ai_coach_messages
- ai_coach_analytics

## If You Get Errors

If you get "relation already exists" errors, the tables might already exist. You can check with the query above.

If you need to recreate them fresh:

```sql
-- Drop existing AI Coach tables
DROP TABLE IF EXISTS public.ai_coach_analytics CASCADE;
DROP TABLE IF EXISTS public.ai_coach_messages CASCADE;
DROP TABLE IF EXISTS public.ai_coach_sessions CASCADE;

-- Then run the 02_ai_coach_schema.sql again
```

## Complete Setup Order

If you're starting fresh, run these SQL files in order:

1. `01_initial_schema.sql` (or `01_initial_schema_safe.sql`)
2. **`02_ai_coach_schema.sql`** ← You need to run this!
3. `03_journal_entries_fix.sql` 