# Supabase Launch Checklist

## Database Migration Required

You're getting these errors because the `progress_milestones` table is missing required columns and functions. Here's what you need to do:

### 1. Run the Migration

Execute the SQL file `admin-dashboard/supabase/20_fix_progress_milestones_launch.sql` in your Supabase SQL editor.

This migration will:
- Create the `progress_milestones` table if it doesn't exist
- Add missing columns (`gender_specific_content`, `milestone_day`, `nicotine_type_content`)
- Create the `update_progress_milestones` function
- Set up proper RLS policies
- Initialize milestones for existing users

### 2. What the Errors Mean

The errors you're seeing indicate:
- `Failed to initialize milestones`: The table is missing the `gender_specific_content` column
- `Failed to fetch milestones`: The `milestone_day` column doesn't exist
- `Failed to update milestones`: The `update_progress_milestones` function is missing

### 3. How to Apply the Migration

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `admin-dashboard/supabase/20_fix_progress_milestones_launch.sql`
4. Paste and run the SQL
5. The migration is safe to run multiple times - it checks for existing objects before creating them

### 4. Verify the Fix

After running the migration, new users going through onboarding should no longer see these errors. The app will:
- Successfully initialize progress milestones
- Track gender-specific recovery benefits
- Update milestones as users progress

### 5. Additional Considerations

The migration is designed to be safe for production:
- Uses `IF NOT EXISTS` checks to avoid errors
- Preserves existing data
- Initializes milestones for existing users
- Sets up proper security with RLS

## Other Pre-Launch Checks

1. **Environment Variables**: Ensure your production Supabase URL and anon key are set
2. **Database Indexes**: The migration creates necessary indexes for performance
3. **RLS Policies**: The migration sets up row-level security for data protection
4. **User Data**: Existing users will get milestones initialized automatically

## Testing After Migration

1. Create a new test user
2. Go through onboarding
3. Verify no errors appear in the console
4. Check that progress milestones are being tracked
5. Confirm gender-specific benefits show correctly

The app is designed to handle these database operations gracefully, but having the proper schema in place ensures the best user experience. 