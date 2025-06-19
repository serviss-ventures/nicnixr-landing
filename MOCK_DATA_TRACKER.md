# 🔌 Mock Data & Integration Tracker

## Legend
- 🟥 **[MOCK]** - Using mock/fake data
- 🟧 **[PARTIAL]** - Partially integrated, needs completion
- 🟨 **[CONFIG]** - Needs production configuration
- 🟩 **[READY]** - Fully integrated and production-ready

---

## Mobile App (`mobile-app/`)

### Core Features
| Feature | Status | Location | What Needs Integration |
|---------|--------|----------|----------------------|
| User Authentication | 🟩 [READY] | `src/services/authService.ts` | Fully integrated with Supabase |
| Profile Data | 🟩 [READY] | `src/services/userProfileService.ts` | Syncs with Supabase |
| Progress Tracking | 🟩 [READY] | `src/services/progressSyncService.ts` | Saves to user_stats table |
| Journal Entries | 🟩 [READY] | `src/services/journalService.ts` | Saves to journal_entries table |
| Achievements | 🟩 [READY] | `src/services/achievementService.ts` | Syncs with achievements table |
| Daily Tips | 🟩 [READY] | `src/services/dailyTipsByProductService.ts` | Uses daily_tips table |
| Community Posts | 🟥 [MOCK] | `src/screens/community/CommunityScreen.tsx` | Posts only in Redux, not saved to DB |
| Buddy System | 🟥 [MOCK] | `src/services/buddyService.ts` | Returns mock buddies |
| AI Coach | 🟨 [CONFIG] | `src/services/aiCoachService.ts` | Needs production API URL |
| Push Notifications | 🟧 [PARTIAL] | `src/services/notificationService.ts` | Needs push tokens & server |
| RevenueCat IAP | 🟨 [CONFIG] | `src/services/purchaseService.ts` | Needs production API keys |
| Remote Logger | 🟥 [MOCK] | `src/services/remoteLogger.ts` | Logs locally, no server endpoint |

### Specific Mock Data Files
| File | Mock Data | Integration Needed |
|------|-----------|-------------------|
| `CommunityScreen.tsx` | 🟥 [MOCK] Sample posts hardcoded | Create communityService.ts, save to community_posts table |
| `BuddyMatchingScreen.tsx` | 🟥 [MOCK] Fake buddy profiles | Connect to buddy_profiles table |
| `BuddyChatScreen.tsx` | 🟥 [MOCK] Fake messages | Create buddy_messages table & service |
| `HealthInfoModal.tsx` | 🟥 [MOCK] Health milestones | Move to database or constants file |

---

## Admin Dashboard (`admin-dashboard/`)

### Authentication
| Feature | Status | Location | What Needs Integration |
|---------|--------|----------|----------------------|
| Admin Login | 🟥 [MOCK] | `src/app/login/simple-auth.tsx` | Replace with Supabase Auth |
| Session Management | 🟥 [MOCK] | Uses cookies only | Implement proper sessions |
| Role Checking | 🟥 [MOCK] | Hardcoded in middleware | Check admin_users table |

### Data Sources
| Page | Status | Location | What Needs Integration |
|------|--------|----------|----------------------|
| Dashboard Metrics | 🟥 [MOCK] | `src/app/page.tsx` | Connect to real user_stats |
| User Management | 🟧 [PARTIAL] | `src/app/users/page.tsx` | Falls back to mock when DB fails |
| Analytics | 🟥 [MOCK] | `src/lib/analytics.ts` | All data is generated |
| AI Coach Stats | 🟥 [MOCK] | `src/app/ai-coach/page.tsx` | Connect to ai_sessions table |
| Monitoring | 🟥 [MOCK] | `src/app/api/monitoring/route.ts` | Returns mock metrics |
| Mobile Logs | 🟥 [MOCK] | `src/app/api/mobile/logs/route.ts` | No real log collection |
| Reports | 🟥 [MOCK] | `src/app/reports/page.tsx` | All reports are fake data |
| AI Brain | 🟥 [MOCK] | `src/app/ai-brain/page.tsx` | Simulated predictions |
| Onboarding Analytics | 🟧 [PARTIAL] | `src/app/onboarding-analytics/page.tsx` | Has DB function but needs data |

### API Endpoints
| Endpoint | Status | What It Returns | Integration Needed |
|----------|--------|-----------------|-------------------|
| `/api/monitoring` | 🟥 [MOCK] | Fake server metrics | Connect to real infrastructure |
| `/api/mobile/logs` | 🟥 [MOCK] | Generated log entries | Implement log collection |
| `/api/analytics` | 🟥 [MOCK] | Random analytics data | Query real user data |
| `/api/users/stats` | 🟧 [PARTIAL] | Falls back to mock | Ensure DB connection |
| `/api/ai-coach/chat` | 🟩 [READY] | Real OpenAI responses | Working correctly |

---

## Production Configuration Needed

### Environment Variables
| Service | Variable | Status | Action Required |
|---------|----------|--------|----------------|
| Supabase | `SUPABASE_URL` | 🟨 [CONFIG] | Update to production URL |
| Supabase | `SUPABASE_ANON_KEY` | 🟨 [CONFIG] | Update to production key |
| Supabase | `SUPABASE_SERVICE_KEY` | 🟨 [CONFIG] | Add production service key |
| OpenAI | `OPENAI_API_KEY` | 🟨 [CONFIG] | Add production key |
| RevenueCat | `REVENUECAT_API_KEY` | 🟨 [CONFIG] | Add production keys |
| Sentry | `SENTRY_DSN` | 🟨 [CONFIG] | Configure error tracking |
| Admin URL | `ADMIN_API_URL` | 🟨 [CONFIG] | Set production domain |

---

## Critical Items for Launch

### Must Fix Before Launch (🟥 Priority)
1. **Admin Dashboard Auth** - Can't use simple auth in production
2. **Community Posts** - Users expect posts to persist
3. **Buddy System** - Core feature showing mock data
4. **RevenueCat Setup** - Required for monetization

### Nice to Have (Can Ship Without)
1. **Mobile Logs Collection** - Can add post-launch
2. **Advanced Monitoring** - Basic monitoring sufficient initially
3. **AI Brain Predictions** - Cool feature but not critical
4. **Detailed Analytics** - Can use basic metrics initially

---

## Quick Integration Guide

### To Connect Community Posts:
```typescript
// 1. Create src/services/communityService.ts
// 2. Add methods: createPost, getPosts, likePost, commentOnPost
// 3. Update CommunityScreen to use service instead of Redux
// 4. Posts will save to community_posts table
```

### To Connect Buddy System:
```typescript
// 1. Update buddyService.ts to query buddy_profiles table
// 2. Implement real matching algorithm
// 3. Create chat message storage
// 4. Update screens to use real data
```

### To Fix Admin Auth:
```typescript
// 1. Replace simple-auth.tsx with Supabase auth
// 2. Update middleware to check admin_users table
// 3. Implement proper session management
// 4. Add role-based access control
```

---

## Testing Checklist

Before launch, test these integrations:
- [ ] Create real user account
- [ ] Make a community post - verify it persists
- [ ] Match with a buddy - verify real profiles
- [ ] Complete a purchase - verify RevenueCat works
- [ ] Check admin dashboard shows real data
- [ ] Verify push notifications work
- [ ] Test error logging to Sentry

---

## Notes
- Mock data is intentionally realistic to make testing easier
- All mock endpoints return data in the same format as production will
- Frontend is built to handle both mock and real data seamlessly
- Most integrations just need service layer updates 