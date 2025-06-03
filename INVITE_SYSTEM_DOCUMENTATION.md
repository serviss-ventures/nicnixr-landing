# Invite System Documentation
*Date: June 3, 2024*

## 🎯 Overview
Complete invite system that allows users to invite friends and automatically appear as buddy requests when they join.

## 🔄 Invite Flow

### User A (Inviter) Flow:
1. **Create Invite**
   - Tap "Invite" button in Community > Buddies
   - System generates unique code (e.g., `NIXR-ABC123`)
   - Invite data stored with user info and expiration
   - Share sheet opens with personalized message

2. **Invite Contains**
   - Unique invite code
   - Inviter's name, avatar, and days clean
   - Deep link: `https://nixr.app/invite/NIXR-ABC123`
   - 7-day expiration

### User B (Invitee) Flow:
1. **Receive Invite**
   - Click invite link or enter code manually
   - App stores pending invite in AsyncStorage
   - Proceeds with normal signup/onboarding

2. **After Onboarding**
   - App checks for pending invites
   - Inviter automatically appears as buddy request
   - Shows welcome message with inviter's name
   - Can accept/decline like any buddy request

3. **Connection**
   - Accepting creates mutual buddy connection
   - Both users can now chat and support each other

## 🧪 Testing the Invite System

### Quick Test (Development):
```javascript
// In the app console:

// 1. As User A - Create an invite
inviteTest.createTestInvite()
// Note the code (e.g., NIXR-XYZ789)

// 2. Reset app to simulate User B
appReset.dev()

// 3. Complete onboarding as new user

// 4. Simulate receiving the invite
inviteTest.simulateReceiveInvite('NIXR-XYZ789')

// 5. Restart app - inviter appears as buddy request!
```

### Manual Test Flow:
1. **User A**: 
   - Open app → Community → Buddies
   - Tap "Invite" button
   - Share invite via text/email

2. **User B**:
   - Click invite link (or manually enter code)
   - Download app if needed
   - Complete onboarding
   - See User A as buddy request
   - Accept to become buddies

### Debug Commands:
```javascript
// Show all active invites
inviteTest.showActiveInvites()

// Clear all invite data
inviteTest.clearAllInvites()

// Quick test with instructions
inviteTest.quickTest()
```

## 📁 Implementation Files

### Core Services:
- `src/services/inviteService.ts` - Invite creation and validation
- `src/components/common/InviteLinkHandler.tsx` - Deep link handling
- `src/screens/community/CommunityScreen.tsx` - UI and invite checking

### Storage Keys:
- `@nixr_active_invites` - All created invites (mock backend)
- `@nixr_pending_invite` - Pending invite for new user

## 🔧 Technical Details

### Invite Code Format:
- Pattern: `NIXR-[6 random alphanumeric]`
- Example: `NIXR-ABC123`, `NIXR-XYZ789`
- Case-insensitive matching

### Deep Link Format:
- Production: `https://nixr.app/invite/[CODE]`
- Development: `exp://[IP]:8081/--/invite/[CODE]`

### Data Structure:
```typescript
interface InviteData {
  code: string;
  inviterId: string;
  inviterName: string;
  inviterAvatar: string;
  inviterDaysClean: number;
  createdAt: Date;
  expiresAt: Date;
}
```

## 🚀 Production Considerations

### Backend Requirements:
1. **Invite API Endpoints**:
   - `POST /api/invites` - Create invite
   - `GET /api/invites/:code` - Validate invite
   - `POST /api/invites/:code/accept` - Process connection

2. **Security**:
   - Rate limiting on invite creation
   - Unique constraint on invite codes
   - Expiration enforcement
   - Prevent self-invites

3. **Analytics**:
   - Track invite creation
   - Monitor conversion rates
   - Measure time to acceptance

### App Store Configuration:
1. **iOS**: Configure Associated Domains for universal links
2. **Android**: Configure App Links in manifest
3. **Web**: Handle invite redirects to app stores

## 🎨 UI/UX Features

### Visual Indicators:
- Invited buddies show "Invited you to be their quit buddy!" bio
- 100% match score for invited connections
- Special welcome message on first app open
- Auto-navigation to buddy requests

### Edge Cases Handled:
- Expired invites show error message
- Invalid codes handled gracefully
- Duplicate buddy requests prevented
- Offline invite storage for later sync

## 📊 Success Metrics
- Invite creation rate
- Invite acceptance rate
- Time from invite to connection
- Buddy retention for invited users
- Viral coefficient (invites per user) 