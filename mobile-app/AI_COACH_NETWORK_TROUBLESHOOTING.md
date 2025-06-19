# AI Coach Network Troubleshooting Guide

## Problem: Network request failed errors when running on computer

### Solution Steps:

1. **Ensure Admin Dashboard is Running**
   ```bash
   cd admin-dashboard
   npm run dev
   ```
   The server should start on http://localhost:3000

2. **Verify Your IP Address**
   ```bash
   # On Mac:
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # On Windows:
   ipconfig
   ```
   Look for your local network IP (usually starts with 192.168.x.x)

3. **Update the API URL in aiCoachService.ts**
   The service now automatically detects the correct URL based on your environment:
   - iOS Simulator: `http://localhost:3000`
   - Android Emulator: `http://10.0.2.2:3000`
   - Physical Device: `http://YOUR_IP:3000` (currently set to 192.168.1.171)

4. **Test the Connection**
   You can import and run the test function:
   ```javascript
   import { testAICoachConnection } from './src/debug/testAICoach';
   
   // In your component or App.tsx
   testAICoachConnection().then(result => console.log('Test result:', result));
   ```

5. **Common Issues:**
   - **Firewall blocking port 3000**: Allow Node.js through your firewall
   - **Wrong IP address**: Update line 398 in aiCoachService.ts with your current IP
   - **Admin dashboard not running**: Make sure you see "Ready on http://localhost:3000"
   - **OpenAI API key not set**: Check admin-dashboard/.env.local for OPENAI_API_KEY

6. **Environment Variables (Optional)**
   Create `mobile-app/.env`:
   ```
   EXPO_PUBLIC_ADMIN_API_URL=http://YOUR_IP:3000
   ```
   Then restart Expo with `npx expo start -c`

### Quick Fix for Your Current Setup:

Since your IP is 192.168.1.171 and the admin dashboard is running, the app should now work on both:
- Your computer (using localhost)
- Your phone (using the IP address)

The updated code automatically selects the right URL based on where it's running! 