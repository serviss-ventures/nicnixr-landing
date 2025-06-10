# Comment Modal Post Switching Fix - June 11, 2025

## Issue
When users left a comment or deleted a comment, the comment modal would sometimes show a completely unrelated post instead of the one they were originally commenting on.

## Root Cause
The issue was caused by:
1. **selectedPost state not being cleared** when the modal was closed
2. **Stale state references** when updating selectedPost after comments were added/deleted
3. **React re-rendering** potentially using cached modal state

## Solution

### 1. Clear selectedPost on Modal Close
Added `setSelectedPost(null)` to all modal close actions:
- onRequestClose handler
- Backdrop tap handler  
- Close button handler

This ensures the modal starts fresh each time it opens.

### 2. Use Fresh Post Data
When updating selectedPost after adding a comment, now we:
- Find the updated post from communityPosts array
- Use that fresh data instead of the previous state
- This prevents referencing stale post data

### 3. Add Unique Key to Modal
Added `key={selectedPost?.id || 'comment-modal'}` to force React to:
- Destroy and recreate the modal when post changes
- Prevent any cached state from persisting

## Result
- Comment modal now always shows the correct post
- No more switching to random posts after commenting
- Clean state management prevents confusion

## Code Changes
```javascript
// Before
setSelectedPost(prev => prev ? { ...prev, comments: [...prev.comments, newComment] } : null);

// After  
const updatedPost = communityPosts.find(p => p.id === selectedPost.id);
if (updatedPost) {
  setSelectedPost({ ...updatedPost, comments: [...updatedPost.comments, newComment] });
}
``` 