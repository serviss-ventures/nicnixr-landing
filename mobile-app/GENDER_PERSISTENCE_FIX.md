# Gender Persistence Fix

## Date: January 19, 2025

### Issue
When using developer tools to change gender (male/female/non-binary/prefer-not-to-say), the selection would reset on app refresh, defaulting to non-binary or prefer-not-to-say.

### Root Cause
1. The `updateUserData` action in Redux was saving to AsyncStorage locally
2. On app refresh, `fetchUserProfile` from Supabase would overwrite the local data
3. The Supabase users table has a gender field, but it wasn't being updated
4. The fetchUserProfile wasn't preserving local gender if not in database

### Solution

#### 1. Updated Developer Tools Gender Change
- Now saves to both Redux state AND Supabase when changing gender
- Only syncs to Supabase for non-anonymous users
- ProfileScreen.tsx lines 880-920

#### 2. Updated fetchUserProfile 
- Now preserves local gender if not found in database
- Falls back to 'prefer-not-to-say' only if no local value exists
- authSlice.ts fetchUserProfile function

#### 3. Enhanced UserProfileService
- Added gender and age_range to ProfileUpdateData interface
- Update method now includes these fields when saving to Supabase
- userProfileService.ts

#### 4. Database Migration
- Created migration to ensure gender and age_range columns exist
- Added index on gender for performance
- Sets default value for null genders
- 15_add_gender_agerange_to_users.sql

### Testing
1. Open app and go to Profile > Developer Tools
2. Change gender to Male/Female
3. Close and reopen app
4. Gender selection should persist

### Technical Details
- Gender values: 'male', 'female', 'non-binary', 'prefer-not-to-say'
- Stored in both AsyncStorage (for offline) and Supabase (for sync)
- Used by genderSpecificRecoveryService for personalized benefits 