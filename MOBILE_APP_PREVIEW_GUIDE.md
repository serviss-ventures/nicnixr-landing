# Mobile App Preview Guide

## Quick Start

The mobile app preview feature allows you to test your React Native app in a web browser directly from the admin dashboard.

### Option 1: Use the Startup Script (Recommended)

```bash
./start-dev.sh
```

This will start all services:
- Admin Dashboard: http://localhost:3000
- Mobile App Preview: http://localhost:19006  
- Marketing Website: http://localhost:3001

### Option 2: Manual Setup

1. Start the admin dashboard:
```bash
cd admin-dashboard && npm run dev
```

2. In another terminal, start the mobile app:
```bash
cd mobile-app && npm run web
```

3. Access the preview at http://localhost:3000/mobile-app

## Troubleshooting

### "Failed to fetch" Error

If you see this error, it's likely due to:

1. **Browser Extensions**: Some ad blockers or privacy extensions interfere with the preview. Try:
   - Disabling extensions temporarily
   - Using an incognito/private window
   - Using a different browser

2. **Services Not Running**: Make sure both the admin dashboard and mobile app are running.

3. **Port Conflicts**: Check if ports 3000, 3001, or 19006 are already in use:
```bash
lsof -ti:3000
lsof -ti:19006
```

### Direct Access

If the preview doesn't work in the admin dashboard, you can always access the mobile app directly:
- http://localhost:19006

### Manual Commands

Start mobile app with Expo:
```bash
cd mobile-app
EXPO_NO_PROMPT=true npx expo start --web --port 19006
```

## Features

- **Device Preview**: Switch between iPhone, Android, and Desktop views
- **Live Reload**: Changes to your app code will automatically refresh
- **Direct Access**: Open the app in a new tab for full-screen testing

## Architecture

The mobile app preview works by:
1. Starting an Expo development server on port 19006
2. Embedding the app in an iframe within the admin dashboard
3. Providing device frame simulations for realistic previews

## Technical Details

### Ports Used
- **Metro Bundler**: Port 8081
- **Expo Web**: Port 19006

### Manual Commands
If automatic start fails, you can run manually:
```bash
cd mobile-app
npm run web
```

## Benefits

1. **Quick Testing** - Test your app without switching between windows
2. **Device Preview** - See how your app looks on different devices
3. **Integrated Workflow** - Everything in one dashboard
4. **Tesla/Apple Design** - Matches the premium aesthetic of your admin dashboard

## Future Enhancements
- Real-time console logs
- Network request monitoring
- Performance metrics
- Hot reload controls
- Device orientation switching

Enjoy the seamless mobile app development experience! 🚀 