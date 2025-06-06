# Buddy System Backend Integration Guide

## Overview
This document outlines all backend endpoints needed to support the NixR buddy system. The frontend is already built and expects these exact API contracts.

## Database Schema

### Tables Required

#### 1. `buddy_connections`
```sql
CREATE TABLE buddy_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_1 UUID NOT NULL REFERENCES users(id),
    user_id_2 UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    requester_id UUID NOT NULL REFERENCES users(id),
    connected_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_connection UNIQUE (user_id_1, user_id_2),
    CONSTRAINT status_check CHECK (status IN ('pending', 'connected', 'declined', 'removed'))
);

-- Indexes for performance
CREATE INDEX idx_buddy_connections_user1 ON buddy_connections(user_id_1);
CREATE INDEX idx_buddy_connections_user2 ON buddy_connections(user_id_2);
CREATE INDEX idx_buddy_connections_status ON buddy_connections(status);
```

#### 2. `user_profiles` (extend existing)
```sql
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS support_styles TEXT[]; -- Array of styles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS buddy_preferences JSONB DEFAULT '{}';
```

## API Endpoints

### 1. Get Potential Matches
**Endpoint:** `GET /api/buddies/potential-matches`

**Description:** Returns a list of potential buddy matches for the current user based on compatibility scoring.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `limit` (optional): Number of matches to return (default: 10, max: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "buddy-123",
      "userId": "user-123",
      "name": "Sarah M.",
      "avatar": "🦸‍♀️",
      "daysClean": 12,
      "product": "vaping",
      "bio": "Mom of 2, quit vaping for my kids. Love hiking and coffee chats!",
      "supportStyles": ["motivator", "listener"],
      "lastActive": "2024-01-06T10:30:00Z",
      "status": "online",
      "connectionStatus": "not-connected",
      "matchScore": 85
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0
  }
}
```

**Matching Algorithm Logic:**
```javascript
// Pseudocode for match scoring
function calculateMatchScore(currentUser, potentialBuddy) {
  let score = 50; // Base score
  
  // Similar quit timeframe (±10 days)
  const daysDifference = Math.abs(currentUser.daysClean - potentialBuddy.daysClean);
  if (daysDifference <= 10) score += 20;
  else if (daysDifference <= 30) score += 10;
  
  // Same product type
  if (currentUser.nicotineProduct === potentialBuddy.nicotineProduct) score += 15;
  
  // Has bio
  if (potentialBuddy.bio && potentialBuddy.bio.length > 20) score += 10;
  
  // Has support styles defined
  if (potentialBuddy.supportStyles.length > 0) score += 5;
  
  return Math.min(score, 100);
}
```

### 2. Send Buddy Request
**Endpoint:** `POST /api/buddies/request`

**Description:** Sends a buddy request to another user.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "toBuddyId": "buddy-123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Buddy request sent successfully",
  "data": {
    "requestId": "req-456",
    "status": "pending"
  }
}
```

**Error Cases:**
- 400: Already connected or request already exists
- 404: User not found
- 429: Too many requests (rate limit)

### 3. Accept Buddy Request
**Endpoint:** `POST /api/buddies/accept`

**Description:** Accepts a pending buddy request.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "buddyId": "buddy-123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Buddy request accepted",
  "data": {
    "connectionId": "conn-789",
    "connectedAt": "2024-01-06T10:30:00Z"
  }
}
```

### 4. Decline Buddy Request
**Endpoint:** `POST /api/buddies/decline`

**Description:** Declines a pending buddy request.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "buddyId": "buddy-123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Buddy request declined"
}
```

### 5. Get Connected Buddies
**Endpoint:** `GET /api/buddies/connected`

**Description:** Returns all connected buddies for the current user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "buddy-123",
      "userId": "user-123",
      "name": "Sarah M.",
      "avatar": "🦸‍♀️",
      "daysClean": 12,
      "product": "vaping",
      "bio": "Mom of 2, quit vaping for my kids.",
      "supportStyles": ["motivator", "listener"],
      "lastActive": "2024-01-06T10:30:00Z",
      "status": "online",
      "connectionStatus": "connected",
      "connectionDate": "2024-01-01T08:00:00Z"
    }
  ],
  "count": 3
}
```

### 6. Get Buddy Requests
**Endpoint:** `GET /api/buddies/requests`

**Description:** Returns all pending buddy requests (both sent and received).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `type` (optional): Filter by "sent" or "received" (default: both)

**Response:**
```json
{
  "success": true,
  "data": {
    "received": [
      {
        "id": "buddy-456",
        "userId": "user-456",
        "name": "Mike R.",
        "avatar": "🧙‍♂️",
        "daysClean": 8,
        "product": "pouches",
        "bio": "Software dev, using coding to distract from cravings.",
        "supportStyles": ["analytical", "tough-love"],
        "lastActive": "2024-01-06T09:00:00Z",
        "status": "online",
        "connectionStatus": "pending-received",
        "requestDate": "2024-01-05T14:30:00Z"
      }
    ],
    "sent": [
      {
        "id": "buddy-789",
        "userId": "user-789",
        "name": "Jessica K.",
        "avatar": "👩",
        "daysClean": 30,
        "product": "vaping",
        "connectionStatus": "pending-sent",
        "requestDate": "2024-01-04T10:00:00Z"
      }
    ]
  }
}
```

### 7. Remove Buddy Connection
**Endpoint:** `POST /api/buddies/remove`

**Description:** Removes an existing buddy connection.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "buddyId": "buddy-123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Buddy connection removed"
}
```

### 8. Get Buddy Profile
**Endpoint:** `GET /api/buddies/profile/:buddyId`

**Description:** Gets detailed profile information for a specific buddy.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "buddy-123",
    "userId": "user-123",
    "name": "Sarah M.",
    "avatar": "🦸‍♀️",
    "daysClean": 12,
    "product": "vaping",
    "bio": "Mom of 2, quit vaping for my kids. Love hiking and coffee chats!",
    "supportStyles": ["motivator", "listener"],
    "lastActive": "2024-01-06T10:30:00Z",
    "status": "online",
    "connectionStatus": "connected",
    "connectionDate": "2024-01-01T08:00:00Z",
    "stats": {
      "totalDaysClean": 12,
      "currentStreak": 12,
      "longestStreak": 12,
      "moneySaved": 120.00
    }
  }
}
```

## WebSocket Events (Optional but Recommended)

For real-time updates, implement these WebSocket events:

### Events to Emit:
- `buddy:request:new` - When receiving a new buddy request
- `buddy:request:accepted` - When your request is accepted
- `buddy:request:declined` - When your request is declined
- `buddy:status:update` - When a buddy's online status changes
- `buddy:removed` - When a buddy removes the connection

### Example WebSocket Implementation:
```javascript
// Server-side
io.on('connection', (socket) => {
  socket.on('authenticate', async (token) => {
    const userId = await verifyToken(token);
    socket.join(`user:${userId}`);
  });
});

// When buddy request is sent
io.to(`user:${toBuddyUserId}`).emit('buddy:request:new', {
  from: senderBuddyProfile
});
```

## Implementation Notes

### 1. Status Definitions
- `online`: Active in last 5 minutes
- `offline`: Not active in last 5 minutes
- `in-crisis`: User has indicated they need immediate support

### 2. Connection Status Logic
- `not-connected`: No relationship exists
- `pending-sent`: Current user sent request, awaiting response
- `pending-received`: Current user received request, can accept/decline
- `connected`: Both users are connected as buddies

### 3. Privacy Considerations
- Don't expose email addresses in buddy profiles
- Use display names or usernames only
- Allow users to control what information is visible to buddies

### 4. Rate Limiting
- Buddy requests: Max 10 per hour
- Profile views: Max 100 per hour
- Match refreshes: Max 20 per hour

### 5. Notification Triggers
Send push notifications for:
- New buddy request received
- Buddy request accepted
- Buddy reaches a milestone
- Buddy needs crisis support

## Testing Checklist

- [ ] User can see potential matches
- [ ] Match scoring algorithm works correctly
- [ ] User can send buddy requests
- [ ] User can accept/decline requests
- [ ] Connected buddies appear in buddy list
- [ ] Buddy removal works properly
- [ ] Real-time updates work (if implemented)
- [ ] Rate limiting prevents spam
- [ ] Privacy settings are respected
- [ ] Notifications are sent appropriately

## Frontend Integration Points

The frontend expects these exact response formats. Key files that consume these endpoints:

1. `mobile-app/src/services/BuddyService.ts` - Contains all API calls
2. `mobile-app/src/screens/community/CommunityScreen.tsx` - Buddy tab
3. `mobile-app/src/screens/community/BuddyMatchingScreen.tsx` - Matching interface
4. `mobile-app/src/screens/community/BuddyProfile.tsx` - Profile views
5. `mobile-app/src/screens/community/BuddyChat.tsx` - Chat interface

## Error Response Format

All errors should follow this format:
```json
{
  "success": false,
  "error": {
    "code": "BUDDY_REQUEST_EXISTS",
    "message": "A buddy request already exists with this user"
  }
}
```

Common error codes:
- `BUDDY_REQUEST_EXISTS`
- `ALREADY_CONNECTED`
- `USER_NOT_FOUND`
- `RATE_LIMIT_EXCEEDED`
- `INVALID_REQUEST`
- `UNAUTHORIZED` 