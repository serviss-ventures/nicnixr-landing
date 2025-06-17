# Journal Entries Table Fix Guide

## The Issue
The journal entries table in the database doesn't match what your mobile app uses. The app has many specific questions with yes/no answers and rating scales, but the database table was too simple.

## What This Fix Does
Updates the journal_entries table to match your app exactly with:
- Yes/No questions (like "Feeling positive today?")
- Rating scales 1-10 (like craving intensity, energy level)
- Number inputs (like hours of sleep, glasses of water)
- Text fields (like "What are you grateful for?")

## How to Apply the Fix

1. **Go to your Supabase dashboard**
   - Open https://supabase.com/dashboard
   - Select your NixR project

2. **Go to the SQL Editor**
   - Click on "SQL Editor" in the left sidebar

3. **Run the fix**
   - Copy ALL the content from the file: `admin-dashboard/supabase/03_journal_entries_fix.sql`
   - Paste it into the SQL editor
   - Click "Run" or press Ctrl/Cmd + Enter

4. **Verify it worked**
   - You should see "Success" message
   - The old journal_entries table will be replaced with the new correct one

## What Happens to Existing Data?
- Any existing journal entries will be deleted (the table is dropped and recreated)
- This is okay if you haven't started using journals yet
- If you have important data, let me know and we can create a migration instead

## New Table Structure Matches Your App
The new table has all these fields that your app uses:
- **Mental Health**: mood, cravings, stress, anxiety
- **Physical**: sleep quality/hours, energy, appetite, headaches
- **Behavioral**: triggers, coping strategies, social support
- **Wellness**: gratitude, challenges, goals
- **Custom notes**

All with the correct data types (boolean for yes/no, integers for scales, etc.) 