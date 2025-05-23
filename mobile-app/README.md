# NicNixr Mobile App

A React Native mobile application built with Expo for helping users quit nicotine addiction through gamification, community support, and progress tracking.

## 🚀 Features

- **Dashboard**: Real-time tracking of days clean, money saved, and health improvements
- **Progress Tracking**: Visual charts and statistics showing recovery journey
- **Shield Mode**: Emergency support system for handling cravings
- **Community**: Connect with others on the same journey
- **Profile Management**: Personalized goals and achievements

## 📱 Tech Stack

- **React Native** with **Expo SDK 53**
- **TypeScript** for type safety
- **Redux Toolkit** for state management
- **React Navigation** for routing
- **Expo Linear Gradient** for beautiful UI
- **React Native Reanimated** for smooth animations

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ (Note: Legacy expo-cli doesn't support Node 17+)
- npm or yarn
- Expo Go app on your phone for testing

### Installation

1. Navigate to the mobile app directory:
```bash
cd mobile-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start --clear
```

4. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

## 📁 Project Structure

```
mobile-app/
├── App.tsx                 # Main app entry point
├── index.ts               # Expo entry point
├── app.json              # Expo configuration
├── src/
│   ├── app/              # App router (if using Expo Router)
│   ├── components/       # Reusable components
│   │   ├── common/       # Common UI components
│   │   └── ui/           # Specific UI elements
│   ├── constants/        # Theme, colors, spacing
│   ├── navigation/       # Navigation setup
│   ├── screens/          # Screen components
│   │   ├── auth/         # Authentication screens
│   │   ├── dashboard/    # Main dashboard
│   │   ├── progress/     # Progress tracking
│   │   ├── shield/       # Shield mode
│   │   ├── community/    # Community features
│   │   └── profile/      # User profile
│   ├── services/         # API and external services
│   ├── store/            # Redux store setup
│   │   └── slices/       # Redux slices
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
```

## 🎨 Theme Configuration

The app uses a dark theme with customizable colors defined in `src/constants/theme.ts`:

- **Primary**: #10B981 (Emerald)
- **Secondary**: #06B6D4 (Cyan)
- **Accent**: #8B5CF6 (Purple)
- **Background**: #000000 (Black)

## 🔧 Key Components

### ThemeProvider
Wraps the app to provide consistent theming across all components and ensures React Navigation has proper font definitions.

### ErrorBoundary
Catches JavaScript errors anywhere in the component tree and displays a fallback UI.

### RootNavigator
Handles authentication flow and navigation between auth screens and main app.

### MainTabNavigator
Bottom tab navigation for the main app sections.

## 🐛 Common Issues & Solutions

### "Cannot read property 'medium' of undefined"
This error occurs when React Navigation can't find font definitions. Solution:
- Ensure ThemeProvider is wrapping NavigationContainer
- Check that FONTS object in theme.ts has all required properties

### Expo Go crashes on startup
- Clear Expo Go cache
- Run `npx expo start --clear`
- Ensure all dependencies are installed

### Port 8081 already in use
- Use a different port: `npx expo start --port 8082`
- Or kill the process using port 8081

## 🚀 Building for Production

### iOS
```bash
npx expo run:ios
```

### Android
```bash
npx expo run:android
```

### Web (if configured)
```bash
npx expo start --web
```

## 📝 State Management

The app uses Redux Toolkit with the following slices:

- **authSlice**: User authentication and profile
- **progressSlice**: User progress and statistics
- **communitySlice**: Community interactions
- **settingsSlice**: App settings and preferences

## 🔐 Authentication Flow

1. User opens app → Onboarding screen
2. Sign up/Login → Auth screen
3. Successful auth → Main app (Dashboard)
4. User data persisted with Redux Persist

## 📱 Screens Overview

- **Onboarding**: Welcome screens with app benefits
- **Auth**: Login/Sign up functionality
- **Dashboard**: Main screen with progress overview
- **Progress**: Detailed statistics and charts
- **Shield Mode**: Emergency craving support
- **Community**: Social features and support
- **Profile**: User settings and achievements

## 🎯 Future Enhancements

- [ ] Push notifications for daily reminders
- [ ] Backend API integration
- [ ] Social sharing features
- [ ] Achievement badges
- [ ] Meditation/breathing exercises
- [ ] Integration with health apps

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

Please refer to the main project's CONTRIBUTING.md for guidelines.

## 📞 Support

For issues or questions, please contact the development team. 