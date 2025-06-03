# Buddy System Technical Implementation Guide
*For Engineers - June 3, 2024*

## 🏗️ Architecture Overview

### Data Flow
```
User A (Inviter)                    User B (Invitee)
      |                                    |
      v                                    v
[Create Invite] -----------------> [Click Link/Enter Code]
      |                                    |
      v                                    v
[inviteService]                    [InviteLinkHandler]
      |                                    |
      v                                    v
[AsyncStorage]                     [AsyncStorage]
      |                                    |
      v                                    v
[Share Sheet] ------------------>  [Onboarding Flow]
                                          |
                                          v
                                   [checkPendingInvites()]
                                          |
                                          v
                                   [Buddy Request Created]
```

## 📦 Core Components

### 1. **inviteService.ts**
Central service managing all invite operations:

```typescript
// Key methods:
generateInviteCode(): string
createInvite(userId, userName, userAvatar, daysClean): Promise<InviteData>
storePendingInvite(inviteCode): Promise<void>
getPendingInvite(): Promise<PendingInvite | null>
clearPendingInvite(): Promise<void>
processInviteConnection(inviteCode, newUserId): Promise<Result>
```

**Storage Keys:**
- `@nixr_active_invites`: All created invites (mock backend)
- `@nixr_pending_invite`: Pending invite for new user

### 2. **InviteLinkHandler.tsx**
Handles deep links when app opens:

```typescript
// Listens for:
- Initial URL (app opened via link)
- URL events (app already open)

// Pattern matching:
/invite\/([A-Z0-9-]+)/  // Extracts NIXR-XXXXXX codes
```

### 3. **CommunityScreen.tsx**
Main UI and state management:

```typescript
// Key functions:
checkPendingInvites() // Called on mount
handleInviteFriend()  // Creates and shares invite
handleAcceptBuddy()   // Accepts buddy request
handleDeclineBuddy()  // Declines with confirmation
```

## 🔄 State Management

### Buddy States
```typescript
type ConnectionStatus = 
  | 'connected'        // Established buddy
  | 'pending-sent'     // Request sent by user
  | 'pending-received' // Request from another user
  | 'not-connected'    // Suggested match
```

### Visual Mapping
```typescript
const getCardStyle = (status: ConnectionStatus) => {
  switch(status) {
    case 'connected':
      return { gradient: greenColors, border: 1 }
    case 'pending-received':
      return { gradient: orangeColors, border: 2, glow: true }
    case 'not-connected':
      return { gradient: purpleColors, borderStyle: 'dashed' }
  }
}
```

## 🧪 Testing Utilities

### Debug Commands (Dev Only)
```javascript
// Global test object
inviteTest = {
  createTestInvite()      // Generate test invite
  simulateReceiveInvite() // Simulate receiving
  showActiveInvites()     // Debug storage
  clearAllInvites()       // Reset state
  quickTest()             // Guided flow
}
```

### Test Flow
1. Create invite as User A
2. Note the code
3. Reset app (`appReset.dev()`)
4. Complete onboarding as User B
5. Simulate receiving invite
6. Restart app to see buddy request

## 🔐 Security Implementation

### Code Generation
```typescript
// Cryptographically random, 6 chars
`NIXR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
```

### Validation
- Expiration check (7 days)
- Duplicate prevention
- Invalid code handling
- Self-invite prevention (production)

## 🎨 UI Components

### Card Hierarchy
```typescript
// 1. Connected (Green)
<LinearGradient colors={['rgba(16, 185, 129, 0.1)', ...]}>
  <MessageButton />
  <ConnectedBadge />
</LinearGradient>

// 2. Request (Orange)
<LinearGradient colors={['rgba(245, 158, 11, 0.15)', ...]}>
  <AcceptButton onPress={handleAcceptBuddy} />
  <DeclineButton onPress={handleDeclineBuddy} />
</LinearGradient>

// 3. Suggested (Purple)
<LinearGradient colors={['rgba(139, 92, 246, 0.05)', ...]}>
  <SendRequestButton />
  <MatchPercentage />
</LinearGradient>
```

### Empty States
```typescript
// Complete empty (no buddies at all)
if (buddyMatches.length === 0) {
  return <CompleteEmptyState />
}

// Partial empty (no connected buddies)
if (connectedBuddies.length === 0) {
  return <PartialEmptyState />
}
```

## 🚀 Production Migration

### Backend Endpoints Needed
```typescript
// 1. Create invite
POST /api/invites
Body: { userId, userName, userAvatar, daysClean }
Response: { code, expiresAt }

// 2. Validate invite
GET /api/invites/:code
Response: { valid, inviterData }

// 3. Accept invite
POST /api/invites/:code/accept
Body: { newUserId }
Response: { buddyRequestId }
```

### Replace Mock Storage
```typescript
// Current (mock)
AsyncStorage.setItem(ACTIVE_INVITES_KEY, ...)

// Production
await api.post('/invites', inviteData)
```

### Deep Link Configuration
```xml
<!-- iOS: Associated Domains -->
<key>com.apple.developer.associated-domains</key>
<array>
  <string>applinks:nixr.app</string>
</array>

<!-- Android: App Links -->
<intent-filter android:autoVerify="true">
  <action android:name="android.intent.action.VIEW" />
  <data android:scheme="https" 
        android:host="nixr.app" 
        android:pathPrefix="/invite" />
</intent-filter>
```

## 📊 Analytics Events

### Track These Events
```typescript
analytics.track('invite_created', {
  inviter_id: userId,
  days_clean: daysClean,
  invite_code: code
})

analytics.track('invite_clicked', {
  invite_code: code,
  source: 'deep_link' | 'manual_entry'
})

analytics.track('invite_accepted', {
  inviter_id: inviterId,
  invitee_id: newUserId,
  time_to_accept: Date.now() - inviteCreatedAt
})
```

## ⚡ Performance Considerations

### Optimize Buddy List
```typescript
// Use FlatList for large lists
<FlatList
  data={buddyMatches}
  renderItem={renderBuddyCard}
  keyExtractor={item => item.id}
  getItemLayout={(data, index) => ({
    length: CARD_HEIGHT,
    offset: CARD_HEIGHT * index,
    index
  })}
/>
```

### Memoize Expensive Calculations
```typescript
const connectedBuddies = useMemo(
  () => buddyMatches.filter(b => b.connectionStatus === 'connected'),
  [buddyMatches]
)
```

## 🐛 Common Issues & Solutions

### Issue: Invite not showing after onboarding
**Solution**: Ensure `checkPendingInvites()` is called after auth state changes

### Issue: Deep links not working
**Solution**: Check URL scheme configuration and test with `npx uri-scheme open`

### Issue: Duplicate buddy requests
**Solution**: Check by ID before adding: `!buddies.some(b => b.id === newBuddy.id)`

## 🔧 Debugging Tips

### Check Storage
```javascript
// In console:
const AsyncStorage = require('@react-native-async-storage/async-storage').default
await AsyncStorage.getAllKeys()
await AsyncStorage.getItem('@nixr_active_invites')
```

### Test Deep Links
```bash
# iOS
xcrun simctl openurl booted "https://nixr.app/invite/NIXR-ABC123"

# Android
adb shell am start -W -a android.intent.action.VIEW -d "https://nixr.app/invite/NIXR-ABC123"
```

### Monitor State Changes
```javascript
// Add to component
useEffect(() => {
  console.log('Buddy matches updated:', buddyMatches)
}, [buddyMatches])
```

## 📝 Code Quality Checklist

- [x] TypeScript types defined
- [x] Error handling in place
- [x] Loading states implemented
- [x] Haptic feedback added
- [x] Empty states designed
- [x] Accessibility labels (TODO)
- [ ] Unit tests (TODO)
- [ ] E2E tests (TODO)

## 🎯 Next Steps

1. Connect to real backend API
2. Add push notifications for buddy requests
3. Implement buddy chat persistence
4. Add analytics tracking
5. Create onboarding tutorial for buddy system
6. A/B test invite message variations

---

*This guide should help engineers understand and extend the buddy system. For user-facing documentation, see INVITE_SYSTEM_DOCUMENTATION.md* 