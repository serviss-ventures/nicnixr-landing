# Database Setup Fix Guide

## The Issue
You're getting "relation already exists" errors because your database already has some objects created from a previous attempt.

## Solution Options

### Option 1: Clean Slate (Recommended if you don't have important data)

1. **Run the cleanup script first** to remove all existing objects:
```bash
# In Supabase SQL Editor, run:
admin-dashboard/supabase/00_clean_and_setup.sql
```

2. **Then run the setup scripts in order**:
```bash
# Run each file in order:
1. admin-dashboard/supabase/01_initial_schema.sql
2. admin-dashboard/supabase/02_ai_coach_schema.sql
3. admin-dashboard/supabase/03_journal_entries_fix.sql
```

### Option 2: Safe Setup (If you want to preserve existing data)

Use the safer version that checks for existing objects:

```bash
# Instead of 01_initial_schema.sql, use:
admin-dashboard/supabase/01_initial_schema_safe.sql

# Then run:
2. admin-dashboard/supabase/02_ai_coach_schema.sql
3. admin-dashboard/supabase/03_journal_entries_fix.sql
```

### Option 3: Manual Cleanup (If you only want to fix the index issue)

Just drop the problematic index and re-run:

```sql
-- Drop the specific index causing issues
DROP INDEX IF EXISTS public.idx_users_email;

-- Then try running 01_initial_schema.sql again
```

## Verifying Your Setup

After running the scripts, verify everything is created:

```sql
-- Check tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check indexes
SELECT indexname FROM pg_indexes WHERE schemaname = 'public';

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

## Common Issues

1. **"relation already exists"** - Use the cleanup script or safe version
2. **"permission denied"** - Make sure you're using the Supabase SQL Editor with admin privileges
3. **"violates foreign key constraint"** - Run the cleanup script to remove dependencies

## Quick Fix Command

If you just want to start fresh without any data:

```sql
-- Run this in Supabase SQL Editor to clean everything
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

-- Then run your setup scripts
```

**Warning**: This will delete ALL data in the public schema! 