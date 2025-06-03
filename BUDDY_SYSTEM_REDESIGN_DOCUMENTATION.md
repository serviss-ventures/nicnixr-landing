# Buddy System Redesign Documentation

## Overview
The buddy system has been redesigned to provide a clear, intuitive flow similar to modern social apps like Tinder, while maintaining the supportive nature needed for recovery.

## Connection States

### 1. **Not Connected**
- Default state for new potential matches
- Shows "Send Request" button
- User can view profile and decide to connect

### 2. **Pending Sent**
- User has sent a buddy request
- Shows "Request Sent" badge with clock icon
- Waiting for other user to respond
- Expires after 48 hours if no response

### 3. **Pending Received**
- Another user has sent a buddy request
- Shows "Accept" and "Decline" buttons
- Appears in "Buddy Requests" section with red badge
- User gets push notification

### 4. **Connected**
- Both users have accepted the connection
- Shows "Message Buddy" button
- Shows "Connected" badge with checkmark
- Can start chatting immediately

## User Flow

### Finding Buddies
1. **Buddy Tab** → Shows organized sections:
   - "Find New Buddies" button (always visible at top)
   - "Your Buddies" (connected users)
   - "Buddy Requests" (pending received)
   - "Suggested Matches" (not connected)

2. **Buddy Matching Screen** (Tinder-style):
   - Swipe right or tap ❤️ to send request
   - Swipe left or tap ✕ to skip
   - Shows match percentage and commonalities
   - One profile at a time for focused decisions

### Connection Process
```
User A sees User B → Sends Request → User B gets notification
                                    ↓
                          User B opens app → Sees request
                                           ↓
                          Accept → Both connected → Can chat
                          Decline → Request removed
```

### Buddy List Organization

#### Your Buddies (Connected)
- Shows all accepted connections
- Direct "Message" button for each
- Shows online/offline status
- Displays days clean and last active

#### Buddy Requests (Pending Received)
- Red badge with count
- Accept/Decline buttons
- Shows match score and bio
- Priority placement for visibility

#### Suggested Matches
- AI-matched potential buddies
- "Send Request" button
- Shows compatibility factors
- Refreshes daily with new matches

## UI Components

### Buddy Card States
```typescript
// Connected Buddy
<MessageButton> + <ConnectedBadge>

// Pending Sent
<PendingBadge text="Request Sent">

// Pending Received  
<AcceptButton> + <DeclineButton>

// Not Connected
<SendRequestButton>
```

### Visual Indicators
- **Connected**: Green checkmark badge
- **Pending**: Orange clock icon
- **New Request**: Red notification badge
- **Online Status**: Green/gray dot

## Matching Algorithm

### Factors (Total 100 points)
1. **Quit Date Proximity** (40%)
   - Same week: 40 points
   - Within 2 weeks: 30 points
   - Within month: 20 points

2. **Product Match** (30%)
   - Exact match: 30 points
   - Similar category: 20 points
   - Different: 10 points

3. **Timezone** (20%)
   - Same timezone: 20 points
   - 1-2 hours difference: 15 points
   - 3+ hours: 10 points

4. **Support Style** (10%)
   - Compatible styles: 10 points
   - Neutral: 5 points

## Benefits

### For Users
- Clear understanding of connection status
- No confusion about who they're connected with
- Easy to manage requests
- Familiar UX pattern

### For Engagement
- Pending requests create urgency
- Badge notifications drive opens
- Organized sections improve discovery
- Clear CTAs increase connections

## Future Enhancements

### Phase 2
- Mutual interests/hobbies matching
- Buddy compatibility quiz
- Connection suggestions based on chat activity
- Buddy milestones and anniversaries

### Phase 3
- Group buddy circles (3-4 people)
- Mentor/mentee specific matching
- Location-based buddy meetups
- Buddy challenges and goals

## Technical Implementation

### State Management
```typescript
interface BuddyConnection {
  buddyId: string;
  status: 'connected' | 'pending-sent' | 'pending-received';
  connectionDate?: Date;
  lastInteraction?: Date;
}
```

### API Endpoints
- `POST /buddies/request` - Send buddy request
- `POST /buddies/accept` - Accept request
- `POST /buddies/decline` - Decline request
- `GET /buddies/matches` - Get potential matches
- `GET /buddies/connections` - Get all connections

### Push Notifications
- New buddy request received
- Buddy request accepted
- Daily check-in reminder
- Buddy milestone achieved 