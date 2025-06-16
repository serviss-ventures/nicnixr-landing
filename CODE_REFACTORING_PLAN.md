# Code Refactoring Plan 🧹

## Current Issues

We have several files that are WAY too large and need to be broken down:

1. **CommunityScreen.tsx** - 4,351 lines 😱
2. **ProfileScreen.tsx** - 3,738 lines 😱
3. **RecoveryJournal.tsx** - 2,660 lines 😱

## Clean Code Principles We're Following

- **Single Responsibility Principle**: Each component should do ONE thing
- **DRY (Don't Repeat Yourself)**: Extract common patterns
- **Separation of Concerns**: UI, logic, and data should be separate
- **Readability**: Files should be < 500 lines ideally

## Refactoring Strategy

### 1. CommunityScreen.tsx → Break into:

```
components/community/
├── CommunityFeed.tsx          (~300 lines)
├── CommunityPost.tsx          (~250 lines)
├── PostComments.tsx           (~200 lines)
├── CreatePostModal.tsx        (~150 lines)
├── BuddyList.tsx             (~200 lines)
├── BuddyCard.tsx             (~150 lines)
├── BuddyMatchingCard.tsx     (~100 lines)
└── MentionSelector.tsx        (~100 lines)

hooks/
├── useCommunityPosts.ts       (~100 lines)
├── useBuddyMatching.ts        (~100 lines)
└── useMentions.ts            (~80 lines)

services/
├── communityService.ts        (API calls)
└── buddyService.ts           (Already exists)
```

### 2. ProfileScreen.tsx → Break into:

```
components/profile/
├── ProfileHeader.tsx          (~200 lines)
├── ProfileStats.tsx          (~150 lines)
├── AvatarCustomizer.tsx      (~300 lines)
├── SettingsSection.tsx       (~200 lines)
├── AchievementsList.tsx      (~150 lines)
└── ProfileActions.tsx        (~100 lines)

hooks/
├── useProfile.ts             (~100 lines)
└── useAvatarCustomization.ts (~150 lines)
```

### 3. RecoveryJournal.tsx → Break into:

```
components/journal/
├── JournalList.tsx           (~200 lines)
├── JournalEntry.tsx          (~150 lines)
├── CreateJournalModal.tsx    (~200 lines)
├── JournalInsights.tsx       (~150 lines)
├── MoodTracker.tsx          (~100 lines)
└── JournalFilters.tsx       (~100 lines)

hooks/
├── useJournal.ts            (~100 lines)
└── useJournalAnalytics.ts   (~80 lines)
```

## Benefits After Refactoring

1. **Easier to maintain**: Find bugs faster
2. **Better performance**: Smaller components re-render less
3. **Reusability**: Use components in multiple places
4. **Testing**: Easier to unit test small components
5. **Team collaboration**: Multiple devs can work on different components

## Implementation Plan

### Phase 1: Extract UI Components (Today)
- Start with the most reusable pieces
- Create proper prop interfaces
- Maintain existing functionality

### Phase 2: Extract Business Logic (Tomorrow)
- Move data fetching to hooks
- Create service layers
- Implement proper error handling

### Phase 3: Optimize Performance (Day 3)
- Add React.memo where appropriate
- Implement lazy loading
- Optimize re-renders

### Phase 4: Add Tests (Day 4)
- Unit tests for components
- Integration tests for features
- Snapshot tests for UI

## Code Style Guidelines

```typescript
// ✅ Good: Small, focused component
export const PostLikeButton: React.FC<PostLikeButtonProps> = ({ 
  postId, 
  isLiked, 
  likeCount, 
  onLike 
}) => {
  return (
    <TouchableOpacity onPress={() => onLike(postId)}>
      <Icon name={isLiked ? 'heart' : 'heart-outline'} />
      <Text>{likeCount}</Text>
    </TouchableOpacity>
  );
};

// ❌ Bad: Everything in one massive component
export const CommunityScreen = () => {
  // 4000+ lines of code...
};
```

## Next Steps

1. Start with CommunityScreen (highest priority)
2. Extract one component at a time
3. Test after each extraction
4. Update imports and references
5. Remove dead code

This refactoring will make our codebase:
- More maintainable
- Easier to debug
- Better performing
- More professional

Let's build this app the RIGHT way! 🚀 