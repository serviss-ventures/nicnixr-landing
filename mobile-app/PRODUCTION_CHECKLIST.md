# NixR App Production Checklist

## ✅ Fixed Issues
- [x] Fixed deprecated `shouldShowAlert` → now uses `shouldShowBanner` and `shouldShowList`
- [x] Fixed deprecated `removeNotificationSubscription` → now uses `subscription.remove()`
- [x] Updated Sentry configuration to only initialize in production with proper DSN
- [x] Updated packages to recommended versions (expo, expo-linear-gradient, expo-notifications, react-native)

## 🚨 Critical Production Tasks

### 1. Environment & Configuration
- [ ] Set up proper environment variables:
  - [ ] `SENTRY_DSN` for error tracking (or remove Sentry completely if not using)
  - [ ] API endpoints for production backend
  - [ ] Analytics keys (if using)
- [ ] Configure app.json for production:
  - [ ] Update version number
  - [ ] Set proper bundle identifiers
  - [ ] Configure push notification certificates

### 2. Apple Subscription Integration
- [ ] Configure App Store Connect:
  - [ ] Create subscription product: `com.nixr.premium.monthly` ($4.99/month)
  - [ ] Set up auto-renewable subscription
  - [ ] Configure subscription groups
- [ ] Implement receipt validation on backend
- [ ] Test subscription flow end-to-end
- [ ] Handle subscription restoration
- [ ] Add subscription status checking

### 3. Push Notifications
- [ ] Generate and upload APNs certificates (iOS)
- [ ] Configure FCM for Android
- [ ] Set up backend notification service
- [ ] Test notification delivery on real devices
- [ ] Implement notification analytics

### 4. Data & Security
- [ ] Implement proper API authentication
- [ ] Set up secure data storage for sensitive information
- [ ] Enable certificate pinning for API calls
- [ ] Implement data encryption for local storage
- [ ] Add privacy policy and terms of service

### 5. Testing
- [ ] Test on real devices (not just Expo Go):
  - [ ] iPhone (various models)
  - [ ] iPad compatibility
  - [ ] Android phones (various manufacturers)
- [ ] Test offline functionality
- [ ] Test deep linking (invite links)
- [ ] Load testing for backend APIs
- [ ] Subscription testing with sandbox accounts

### 6. Performance
- [ ] Optimize image assets
- [ ] Enable ProGuard/R8 for Android
- [ ] Configure code splitting
- [ ] Implement lazy loading where appropriate
- [ ] Profile and optimize memory usage

### 7. Analytics & Monitoring
- [ ] Set up analytics (Firebase, Amplitude, etc.)
- [ ] Configure crash reporting
- [ ] Set up performance monitoring
- [ ] Implement user behavior tracking
- [ ] Set up backend monitoring

### 8. App Store Preparation
- [ ] Create app store listings:
  - [ ] App name and subtitle
  - [ ] Description (long and short)
  - [ ] Keywords
  - [ ] Screenshots for all device sizes
  - [ ] App preview videos
- [ ] Prepare marketing materials
- [ ] Set up App Store Optimization (ASO)

### 9. Legal & Compliance
- [ ] Privacy policy URL
- [ ] Terms of service URL
- [ ] GDPR compliance (if applicable)
- [ ] Age rating questionnaire
- [ ] Export compliance

### 10. Build & Deployment
- [ ] Set up CI/CD pipeline
- [ ] Configure EAS Build for production
- [ ] Create signing certificates and provisioning profiles
- [ ] Test production builds thoroughly
- [ ] Set up staged rollout plan

## 📱 Device-Specific Testing Checklist

### iOS
- [ ] Test on iOS 15+ devices
- [ ] Verify notification permissions flow
- [ ] Test subscription purchase flow
- [ ] Verify deep linking works
- [ ] Check for memory leaks

### Android
- [ ] Test on Android 7+ devices
- [ ] Verify notification channels work
- [ ] Test subscription purchase flow
- [ ] Check battery optimization exemption
- [ ] Test on different screen densities

## 🔧 Known Issues to Address
1. Expo notifications not fully supported in Expo Go - need development build
2. Some users may see all support styles selected (vibes) - validation added but needs testing
3. Badge count sync needs backend integration

## 📊 Performance Benchmarks
- App launch time: < 2 seconds
- Screen transitions: < 300ms
- Memory usage: < 150MB
- Battery drain: < 2% per hour active use

## 🚀 Launch Checklist
- [ ] Final QA testing complete
- [ ] App store listings approved
- [ ] Backend services deployed and tested
- [ ] Support documentation ready
- [ ] Customer support channels set up
- [ ] Marketing campaign ready
- [ ] App store review passed
- [ ] Gradual rollout plan in place 