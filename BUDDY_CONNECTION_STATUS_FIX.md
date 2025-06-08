# Buddy Connection Status Fix - June 8, 2025

## Issue
When visiting a buddy's profile (e.g., Sarah M.), it incorrectly showed "Send Buddy Request" even though they were already connected buddies.

## Root Cause
ID mismatch between different parts of the app:
- In buddy list: Sarah M. had ID `"1"`
- In posts/comments: Sarah M. had ID `"user-sarah-m"`

When clicking on Sarah M. from a post/comment, the `handleProfileNavigation` function would look for a buddy with ID `"user-sarah-m"` but couldn't find it in the `buddyMatches` array (where she was listed as ID `"1"`), so it defaulted to `connectionStatus: 'not-connected'`.

## Solution
Updated all buddy IDs in the mock data to use consistent naming pattern:
- `"1"` → `"user-sarah-m"`
- `"2"` → `"user-mike-r"`
- `"3"` → `"user-emma-l"`
- `"4"` → `"user-james-k"`

## Code Changes
**File:** `mobile-app/src/screens/community/CommunityScreen.tsx`

Changed buddy mock data IDs to match the IDs used in posts/comments throughout the app.

## Additional Cleanup
- Fixed `commentInputRef` type from `any` to `TextInput`
- Left navigation with `any` type as it's a common pattern in React Navigation

## Result
Now when clicking on any buddy's profile from anywhere in the app (buddy list, posts, comments, mentions), the correct connection status is displayed:
- Connected buddies show "Message Buddy" button
- Pending requests show appropriate pending UI
- Non-connected users show "Send Buddy Request"

## Testing
1. Click on Sarah M. from the buddy list → Shows "Message Buddy" ✓
2. Click on Sarah M. from a post → Shows "Message Buddy" ✓
3. Click on Sarah M. from a comment → Shows "Message Buddy" ✓
4. Click on @Sarah M. mention → Shows "Message Buddy" ✓ 