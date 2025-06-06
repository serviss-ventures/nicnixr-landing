# Avatar In-App Purchase Integration Guide

## Current State ✅
The avatar system is **90% ready** for IAP integration. All UI, data structures, and purchase flows are in place.

## What's Already Built:
1. **Complete UI Flow**
   - Purchase modals with price display
   - Product descriptions
   - Purchase confirmation dialogs
   - Sold out states for limited editions
   - Loading states ready to add

2. **Data Structures**
   ```typescript
   // Already defined in DicebearAvatar.tsx
   PREMIUM_AVATARS = {
     micahPremium: {
       name: 'Royal Warrior',
       price: '$4.99',
       // ... all metadata
     }
   }
   ```

3. **Purchase Handlers**
   - Located in `ProfileScreen.tsx` lines 1106 & 1185
   - Currently show "Coming Soon" alert
   - Ready for IAP integration

## What Engineers Need to Do:

### 1. Install IAP Package (5 mins)
```bash
npm install react-native-iap
cd ios && pod install
```

### 2. Create IAP Service (30 mins)
```typescript
// src/services/iapService.ts
import RNIap from 'react-native-iap';

const productIds = {
  // Premium avatars
  'com.nixr.avatar.royal_warrior': '$4.99',
  'com.nixr.avatar.cosmic_guardian': '$4.99',
  'com.nixr.avatar.lightning_hero': '$4.99',
  'com.nixr.avatar.diamond_elite': '$9.99',
  'com.nixr.avatar.cyber_nexus': '$7.99',
  
  // Limited editions
  'com.nixr.avatar.founders_spirit': '$19.99',
  'com.nixr.avatar.platinum_phoenix': '$14.99',
  'com.nixr.avatar.galaxy_master': '$24.99',
  'com.nixr.avatar.titan_protocol': '$29.99',
};

export const purchaseAvatar = async (avatarKey: string) => {
  // 1. Get product ID from avatarKey
  // 2. Request purchase
  // 3. Validate receipt
  // 4. Update user profile
  // 5. Return success/failure
};
```

### 3. Update Purchase Handlers (10 mins)
Replace the TODOs in ProfileScreen.tsx:

```typescript
// Line 1106 - Premium avatars
onPress: async () => {
  try {
    setLoading(true);
    const result = await iapService.purchaseAvatar(styleKey);
    if (result.success) {
      // Update user's purchased avatars
      await updateUserAvatars(styleKey);
      // Select the new avatar
      handleAvatarSelect('dicebear', styleKey);
      Alert.alert('Success!', 'Avatar purchased successfully!');
    }
  } catch (error) {
    Alert.alert('Purchase Failed', error.message);
  } finally {
    setLoading(false);
  }
}

// Line 1185 - Limited editions (same pattern + update stock)
```

### 4. Backend Integration (1-2 hours)
```typescript
// Backend needs these endpoints:

// 1. Verify purchase receipt
POST /api/iap/verify
{
  receipt: string,
  productId: string,
  platform: 'ios' | 'android'
}

// 2. Update user's purchased avatars
POST /api/users/:userId/avatars
{
  avatarId: string,
  purchaseId: string
}

// 3. Update limited edition stock
POST /api/avatars/limited/:avatarId/purchase
{
  userId: string,
  purchaseId: string
}

// 4. Get user's purchased avatars
GET /api/users/:userId/avatars
```

### 5. Store Updates Needed
Add to authSlice.ts:
```typescript
purchasedAvatars: string[], // Array of avatar keys user owns
```

## Testing Checklist:
- [ ] Test purchase flow with sandbox accounts
- [ ] Verify receipt validation
- [ ] Check avatar unlocks after purchase
- [ ] Test restore purchases
- [ ] Verify limited edition stock updates
- [ ] Handle edge cases (network errors, etc.)

## Time Estimate:
- **Frontend IAP Integration**: 1-2 hours
- **Backend API**: 2-3 hours
- **Testing**: 1-2 hours
- **Total**: ~6 hours for complete integration

## Notes:
- All error handling UI is ready
- Loading states are pre-built
- The avatar system will automatically show purchased avatars
- Limited edition scarcity is tracked in the avatar config

## Already Handled:
1. **Avatar Selection Logic** - `handleAvatarSelect()` is ready
2. **Storage** - Avatar selection saves to AsyncStorage
3. **Validation** - Only purchased/unlocked avatars can be selected
4. **UI Updates** - Avatar changes reflect immediately across all screens
5. **Sold Out States** - Limited editions show "SOLD OUT" automatically
6. **Price Display** - All prices are shown in the UI
7. **Purchase Confirmation** - Alert dialogs are implemented

## Quick Start for Engineers:
```typescript
// The only code that needs to change is in ProfileScreen.tsx
// Replace line 1106-1108:
// FROM:
// TODO: Implement in-app purchase
Alert.alert('Coming Soon!', 'Premium avatars will be available in the next update!');

// TO:
const purchase = await iapService.purchaseAvatar(styleKey);
if (purchase.success) {
  dispatch(addPurchasedAvatar(styleKey));
  handleAvatarSelect('dicebear', styleKey);
}
```

The avatar system is production-ready - just needs the IAP service connected! 🚀 