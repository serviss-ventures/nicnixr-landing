# NicNixr Mobile App 📱

A beautifully crafted React Native app built with Expo to help users quit nicotine through personalized strategies and supportive features.

## 🏗️ **Architecture Overview**

### **Tech Stack**
- **Framework**: React Native with Expo SDK 52
- **Language**: TypeScript
- **State Management**: Redux Toolkit + Redux Persist
- **Navigation**: React Navigation v6
- **Styling**: StyleSheet API with custom design system
- **Icons**: Expo Vector Icons (Ionicons)
- **Gradients**: Expo Linear Gradient
- **Storage**: AsyncStorage for persistence

### **Project Structure**
```
src/
├── app/                    # Expo Router app directory
├── components/             # Reusable UI components
│   ├── common/            # Shared components (ThemeProvider, LoadingScreen, etc.)
│   └── ui/                # Basic UI elements
├── constants/             # App constants and configuration
│   ├── app.ts            # Storage keys and app config
│   └── theme.ts          # Design system (colors, spacing, typography)
├── hooks/                 # Custom React hooks
├── navigation/            # Navigation configuration
│   └── RootNavigator.tsx # Main navigation controller
├── screens/               # Screen components organized by feature
│   ├── auth/             # Authentication screens
│   ├── onboarding/       # Multi-step onboarding flow
│   ├── dashboard/        # Main dashboard
│   ├── progress/         # Progress tracking
│   ├── profile/          # User profile
│   ├── settings/         # App settings
│   ├── shield/           # Shield Mode (craving blocker)
│   └── community/        # Community features
├── services/             # API and external service integrations
├── store/                # Redux store configuration
│   └── slices/           # Redux slices for state management
├── types/                # TypeScript type definitions
└── utils/                # Utility functions and helpers
```

## 🎨 **Design System**

### **Colors**
- **Background**: Dark gradient (`#000000` → `#0A0F1C` → `#0F172A`)
- **Primary**: Emerald (`#10B981`) - represents growth and healing
- **Secondary**: Sky blue (`#06B6D4`) - represents clarity and freedom
- **Text**: High contrast whites and grays for accessibility
- **Accents**: Purple and pink gradients for motivation elements

### **Typography**
- Responsive font sizes that scale with device width
- Mathematical line height ratios for perfect readability
- Font weights from 500-900 for clear hierarchy
- Letter spacing optimized for mobile screens

### **Spacing System**
Consistent spacing scale using mathematical ratios:
- `xs`: 4px, `sm`: 8px, `md`: 16px, `lg`: 24px, `xl`: 32px, `2xl`: 48px

## 🚀 **Key Features**

### **1. Personalized Onboarding Flow**
- **8-step guided setup** to create a personalized quit blueprint
- **Smooth animations** with 60fps performance using native drivers
- **Responsive design** that adapts to all screen sizes
- **Progress indicators** and motivational messaging

### **2. Smart Navigation System**
- **Automatic routing** between onboarding and main app
- **Authentication state management** with Redux
- **Graceful loading states** during transitions
- **Modal overlays** for Shield Mode

### **3. State Management**
- **Redux Toolkit** for predictable state updates
- **Redux Persist** for automatic data persistence
- **Type-safe** selectors and actions
- **Modular slices** for each feature domain

### **4. Performance Optimizations**
- **Native driver animations** for 60fps performance
- **Optimized bundle splitting** with Expo Router
- **Efficient re-renders** with proper memoization
- **Responsive calculations** cached for performance

## 🛠️ **Development Setup**

### **Prerequisites**
- Node.js 18+ 
- Expo CLI
- iOS Simulator (Mac) or Android Studio
- Expo Go app on your phone (optional)

### **Installation**
```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Start with cache clearing
npx expo start --clear
```

### **Available Scripts**
- `npx expo start` - Start development server
- `npx expo start --clear` - Start with cache cleared
- `npx expo run:ios` - Run on iOS simulator
- `npx expo run:android` - Run on Android emulator

## 🧪 **Development Tools**

### **Reset Utility**
For development and testing, use the reset utility to clear all app state:

```typescript
import { resetAppState } from '../utils/resetApp';

// Clears all stored data and resets app to fresh state
await resetAppState();
```

### **Debug Navigation**
The app includes comprehensive logging for navigation decisions during development.

## 📱 **App Flow**

### **First Launch**
1. App checks for existing user data
2. If none found, shows onboarding flow
3. User completes 8-step personalized setup
4. Creates quit blueprint and user profile
5. Navigates to main app dashboard

### **Returning User**
1. App loads stored user data
2. Validates authentication state
3. Directly shows main app dashboard
4. Loads progress data and continues journey

### **Main App Features**
- **Dashboard**: Progress overview and daily motivation
- **Shield Mode**: Craving blocker with distractions
- **Progress**: Detailed tracking and milestones
- **Profile**: User settings and quit information
- **Community**: Support and shared experiences

## 🔒 **Security & Privacy**

- **Local-first approach**: All data stored locally on device
- **No tracking**: Zero user behavior tracking
- **Privacy mode**: Optional enhanced privacy settings
- **Secure storage**: AsyncStorage with proper error handling

## 🎯 **Performance Metrics**

- **Bundle size**: Optimized for mobile networks
- **Startup time**: < 2 seconds on modern devices  
- **Animation performance**: 60fps on all supported devices
- **Memory usage**: Efficient Redux state management

## 🤝 **Contributing**

Please see the main project [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## 📄 **License**

This project is part of the NicNixr app suite. See [LICENSE](../LICENSE) for details.

---

**Built with ❤️ to help people break free from nicotine addiction** 