# Username Overwrite Fix

## Issue Description
After dev reset, users were seeing:
- Home page: "NixR" (default firstName)
- Profile page: "user_1750225725423" (timestamp-based ID)
- Supabase: "WiseSun" (correct generated username)
- After refresh: Everything shows "WiseSun" correctly

## Root Cause
`BlueprintRevealStep.tsx` was creating a completely new user object instead of using the existing authenticated user from Supabase:

```javascript
// ❌ BAD - Created new user overwriting good data
const user = {
  id: `user_${Date.now()}`,  // Wrong! Created "user_1750225725423"
  username: onboardingData.firstName || 'NixR User',  // Wrong! Should keep "WiseSun"
  // ... other data
};
dispatch(setUser(user));  // This overwrote the good user from Supabase
```

## The Fix
Removed the user creation logic and now just complete onboarding with the collected data:

```javascript
// ✅ GOOD - Use existing user and merge onboarding data
await dispatch(completeOnboarding(onboardingData));
```

The `completeOnboarding` thunk in `authSlice.ts` already properly merges onboarding data with the existing user:

```javascript
const user: User = {
  ...state.auth.user, // Keep existing user data including username
  firstName: onboardingData.firstName || 'NixR',
  // ... merge other onboarding data
};
```

## User Flow (Correct)
1. User taps "Get Started" → Anonymous auth creates user with username "WiseSun"
2. User completes onboarding → Data is merged with existing user
3. Username remains "WiseSun" throughout
4. Display name defaults to username but can be customized later

## Testing
1. Do a dev reset
2. Go through onboarding
3. Should see proper username (e.g., "WiseSun") on home and profile screens
4. No need to refresh to see correct data

## Related Files
- `mobile-app/src/screens/onboarding/steps/BlueprintRevealStep.tsx`
- `mobile-app/src/store/slices/authSlice.ts`
- `mobile-app/src/screens/onboarding/steps/WelcomeStep.tsx` 