# Buddy System Flow Documentation

## Overview
The NicNixr Buddy System connects users with similar quit journeys for mutual support and accountability. This document explains the complete flow from discovery to active buddy relationships.

## User Journey Flow

### 1. Discovery Phase
**Entry Points:**
- Community tab → Buddies section
- "Find Your Perfect Buddy" button
- Get Support button → Buddy suggestion

**What Users See:**
- List of 2-3 top matches with preview cards
- Match percentage badges (82-95%)
- Quick stats: Days clean, product quit, timezone
- Support style icons (Motivator, Listener, etc.)

### 2. Matching Process
**Screen:** BuddyMatchingScreen
- **Swipe Interface**: Tinder-style cards
- **Match Algorithm Factors**:
  - Quit date proximity (±7 days) - 40% weight
  - Same product type - 30% weight
  - Timezone compatibility - 20% weight
  - Support style compatibility - 10% weight

**User Actions:**
- ❤️ Swipe right/tap heart = Send buddy request
- ❌ Swipe left/tap X = Skip to next match
- View detailed profile with bio and commonalities

### 3. Connection Flow
**After Matching:**
1. Match request sent notification
2. Other user receives push notification
3. If accepted → Direct to chat
4. If declined → No notification, just removed from matches

**Match States:**
- Pending: Waiting for response
- Connected: Both accepted, can chat
- Active: Regular communication (daily check-ins)

### 4. Buddy Chat Experience
**Screen:** BuddyChatScreen
- **Real-time messaging** with delivery status
- **Quick responses** for common situations:
  - "How are you today?"
  - "Having a craving right now"
  - "Just wanted to check in"
  - "Thanks for the support!"
- **System messages** for milestones and check-ins
- **Online/offline status** indicators

### 5. Buddy Features

#### Daily Check-ins
- Optional scheduled messages
- Reminder notifications
- Track streak of check-ins
- Celebrate milestones together

#### Crisis Support
- Buddy gets priority notification during SOS
- Special "urgent" message styling
- Quick access from chat to support resources

#### Progress Sharing
- See each other's day count
- Celebrate milestones together
- Share achievements automatically

## Technical Implementation

### Navigation Flow
```
CommunityScreen 
  → BuddyMatchingScreen (Find buddies)
    → Alert (Match sent)
      → Next match or back
  → BuddyChatScreen (From buddy card)
    → Active conversation
```

### Data Structure
```typescript
Buddy {
  id: string
  name: string
  avatar: string
  daysClean: number
  product: string
  timezone: string
  matchScore: number
  status: 'online' | 'offline' | 'in-crisis'
  supportStyle: 'motivator' | 'listener' | 'tough-love' | 'analytical'
  connectionStatus: 'pending' | 'connected' | 'active'
}
```

### Key Screens
1. **CommunityScreen**: Shows buddy matches in dedicated tab
2. **BuddyMatchingScreen**: Swipe through potential matches
3. **BuddyChatScreen**: 1-on-1 messaging with buddy

## User Benefits

### For New Users (Days 1-14)
- Find someone just ahead in journey
- Learn from recent experiences
- Not feel alone in early struggles

### For Established Users (Days 15+)
- Mentor newer users
- Reinforce own commitment
- Build lasting support network

### For All Users
- 24/7 human connection
- Accountability partner
- Celebration companion
- Crisis support system

## Success Metrics
- **Match Rate**: 80% find compatible buddy in first session
- **Connection Rate**: 60% of matches lead to active chats
- **Retention Impact**: 2x higher 30-day retention with active buddy
- **Daily Check-in Rate**: 75% of buddy pairs do daily check-ins

## Future Enhancements
1. **Group Buddies**: 3-4 person support groups
2. **Mentor Matching**: 30+ days with newcomers
3. **Video Check-ins**: Face-to-face support
4. **Buddy Challenges**: Shared goals and rewards
5. **Smart Notifications**: AI-powered check-in timing

## Privacy & Safety
- Optional anonymous mode
- Report/block functionality
- No personal info shared by default
- Moderated initial messages
- Crisis escalation to professionals

This buddy system creates the human connection that makes NicNixr more than an app - it's a community where no one quits alone. 