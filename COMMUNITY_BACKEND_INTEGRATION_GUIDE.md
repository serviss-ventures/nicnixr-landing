# Community Feature Backend Integration Guide

## Overview
This document provides a comprehensive guide for integrating backend services with the NixR Community features. All frontend components are complete and ready for API integration.

## Table of Contents
1. [Authentication & User Context](#authentication--user-context)
2. [Community Feed](#community-feed)
3. [Buddy System](#buddy-system)
4. [Reporting System](#reporting-system)
5. [API Endpoints Required](#api-endpoints-required)
6. [Data Models](#data-models)
7. [Mock Data Replacement Guide](#mock-data-replacement-guide)

---

## Authentication & User Context

### Current Implementation
- User data from Redux store: `state.auth.user`
- Stats from Redux store: `state.progress.stats`

### Required User Data
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatarStyle: string; // Dicebear avatar style
  daysClean: number;
  product: 'cigarettes' | 'vaping' | 'dip/chew' | 'pouches';
}
```

---

## Community Feed

### Features Implemented
1. **Post Creation** - Ready for API
2. **Post Types**: story, question, milestone, crisis
3. **Like/Unlike Posts** - Optimistic UI updates
4. **Comments with @mentions** - Full mention system ready
5. **Like/Unlike Comments** - Nested interactions

### API Endpoints Needed

#### 1. Get Community Feed
```
GET /api/community/posts
Query params: 
  - page: number
  - limit: number (default 20)
  - type?: 'story' | 'question' | 'milestone' | 'crisis'

Response:
{
  posts: Post[],
  hasMore: boolean,
  totalCount: number
}
```

#### 2. Create Post
```
POST /api/community/posts
Body: {
  content: string,
  type: 'story' | 'question' | 'milestone' | 'crisis'
}
```

#### 3. Like/Unlike Post
```
POST /api/community/posts/:postId/like
DELETE /api/community/posts/:postId/like
```

#### 4. Add Comment
```
POST /api/community/posts/:postId/comments
Body: {
  content: string,
  mentions?: string[] // Array of user IDs mentioned
}
```

#### 5. Like/Unlike Comment
```
POST /api/community/comments/:commentId/like
DELETE /api/community/comments/:commentId/like
```

---

## Buddy System

### Features Implemented
1. **Buddy Discovery** - Matching algorithm ready
2. **Send/Accept/Decline Requests** - Full flow implemented
3. **Chat System** - Real-time messaging UI ready
4. **End Connection** - Graceful disconnection
5. **Buddy Search** - Text-based search ready
6. **Invite System** - Deep linking support

### API Endpoints Needed

#### 1. Get Buddy Matches
```
GET /api/buddies/matches
Query params:
  - excludeConnected: boolean

Response: {
  matches: Buddy[],
  algorithm: 'product' | 'location' | 'stage'
}
```

#### 2. Get My Buddies
```
GET /api/buddies
Response: {
  connected: Buddy[],
  pendingSent: Buddy[],
  pendingReceived: Buddy[]
}
```

#### 3. Send Buddy Request
```
POST /api/buddies/request
Body: {
  buddyId: string
}
```

#### 4. Accept/Decline Request
```
POST /api/buddies/request/:requestId/accept
POST /api/buddies/request/:requestId/decline
```

#### 5. End Connection
```
DELETE /api/buddies/:buddyId/connection
```

#### 6. Get Chat Messages
```
GET /api/buddies/:buddyId/messages
Query params:
  - before?: timestamp
  - limit: number (default 50)
```

#### 7. Send Message
```
POST /api/buddies/:buddyId/messages
Body: {
  text: string
}
```

#### 8. Search Buddies
```
GET /api/buddies/search
Query params:
  - query: string
  - limit: number (default 20)
```

---

## Reporting System

### Features Implemented
1. **Report Modal** - Full UI with reasons
2. **Report Types**: inappropriate, harassment, spam, fake, other
3. **Optional Description** - 500 char limit

### API Endpoint Needed

```
POST /api/reports
Body: {
  reportedUserId: string,
  reportType: 'inappropriate' | 'harassment' | 'spam' | 'fake' | 'other',
  description?: string,
  context: {
    screen: string, // e.g., 'BuddyChat', 'BuddyProfile'
    buddyId?: string,
    postId?: string
  }
}
```

**Note**: Reports should trigger email to help@nixrapp.com

---

## Data Models

### Post Model
```typescript
interface Post {
  id: string;
  authorId: string;
  author: string; // Display name
  authorDaysClean: number;
  content: string;
  timestamp: Date;
  likes: number;
  comments: Comment[];
  isLiked: boolean; // For current user
  type: 'story' | 'question' | 'milestone' | 'crisis';
}
```

### Comment Model
```typescript
interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: string;
  authorDaysClean: number;
  content: string;
  timestamp: Date;
  likes: number;
  isLiked: boolean; // For current user
  mentions?: string[]; // User IDs mentioned
}
```

### Buddy Model
```typescript
interface Buddy {
  id: string;
  name: string;
  daysClean: number;
  product: string;
  timezone: string;
  lastActive: Date;
  matchScore: number; // 0-100
  status: 'online' | 'offline' | 'in-crisis';
  bio: string;
  supportStyle: 'motivator' | 'listener' | 'tough-love' | 'analytical';
  connectionStatus: 'connected' | 'pending-sent' | 'pending-received' | 'not-connected';
  connectionDate?: Date;
}
```

### Message Model
```typescript
interface Message {
  id: string;
  text: string;
  sender: 'me' | 'buddy';
  timestamp: Date;
  type?: 'system'; // For system messages
}
```

---

## Mock Data Replacement Guide

### Files with Mock Data to Replace

1. **CommunityScreen.tsx** (lines 108-267)
   - Replace `buddyMatches` state with API call
   - Replace `communityPosts` state with API call

2. **BuddyChatScreen.tsx** (lines 63-91)
   - Replace `messages` state with API call
   - Implement real-time messaging (WebSocket/Polling)

3. **BuddyProfileScreen.tsx** (lines 50-61)
   - Fetch full profile data from API

4. **BuddyMatchingScreen.tsx** (lines 60-130)
   - Replace `potentialMatches` with API call

### Integration Points

1. **Redux Integration**
   ```typescript
   // Add to store/slices/communitySlice.ts
   - posts: Post[]
   - buddies: Buddy[]
   - activeChats: Map<string, Message[]>
   ```

2. **API Service Files to Create**
   - `services/communityApi.ts`
   - `services/buddyApi.ts`
   - `services/chatApi.ts`
   - `services/reportApi.ts`

3. **WebSocket Integration** (for real-time chat)
   ```typescript
   // services/websocket.ts
   - Connect on app launch
   - Subscribe to buddy messages
   - Handle connection status updates
   ```

---

## Implementation Priority

1. **Phase 1 - Core Community** (Week 1)
   - User authentication context
   - Community feed (posts, likes, comments)
   - Basic buddy list

2. **Phase 2 - Buddy System** (Week 2)
   - Buddy matching algorithm
   - Request/accept/decline flow
   - Basic messaging

3. **Phase 3 - Real-time & Polish** (Week 3)
   - WebSocket for real-time chat
   - Push notifications
   - Report system integration
   - Performance optimization

---

## Error Handling

All API errors should follow this format:
```typescript
interface APIError {
  error: {
    code: string;
    message: string;
    details?: any;
  }
}
```

Frontend handles these error codes:
- `UNAUTHORIZED` - Redirect to login
- `FORBIDDEN` - Show permission error
- `NOT_FOUND` - Show 404 message
- `RATE_LIMITED` - Show retry message
- `SERVER_ERROR` - Show generic error

---

## Security Considerations

1. **Input Validation**
   - Post content: Max 1000 chars
   - Comment content: Max 500 chars
   - Message content: Max 500 chars
   - Bio: Max 200 chars

2. **Rate Limiting**
   - Posts: 10 per hour
   - Comments: 30 per hour
   - Messages: 100 per hour
   - Buddy requests: 20 per day

3. **Content Moderation**
   - Profanity filter on all text inputs
   - Auto-flag crisis posts for review
   - Report threshold for auto-suspension

---

## Testing Checklist

- [ ] User can view community feed
- [ ] User can create all post types
- [ ] User can like/unlike posts and comments
- [ ] User can mention others in comments
- [ ] User can view buddy recommendations
- [ ] User can send/accept/decline buddy requests
- [ ] User can chat with connected buddies
- [ ] User can end buddy connections
- [ ] User can report inappropriate content
- [ ] User can search for buddies
- [ ] User can invite friends via deep link

---

## Questions for Backend Team

1. **Real-time Strategy**: WebSockets vs Server-Sent Events vs Polling?
2. **Image/Media Support**: Future consideration for post attachments?
3. **Push Notifications**: Priority and implementation approach?
4. **Analytics Events**: What user actions should we track?
5. **Caching Strategy**: Redis for feed/chat performance?

---

## Contact

For frontend questions or clarifications:
- Review code comments in mentioned files
- Check TypeScript interfaces for exact data shapes
- All UI/UX flows are fully implemented and tested

The frontend is production-ready and waiting for API integration. All mock data is clearly marked and easy to replace with API calls. 