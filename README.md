# 🚭 NixR - Premium Nicotine Recovery App

**Your personalized journey to nicotine freedom, powered by science and community**

![NicNixr Banner](https://via.placeholder.com/800x200/1E40AF/FFFFFF?text=NicNixr%20-%20Break%20Free%20From%20Nicotine)

## 🌟 Overview

Nixr is a cutting-edge mobile application designed to help users overcome nicotine addiction through science-based recovery tracking, personalized intervention strategies, and community support. Built with React Native and Expo, it provides a premium health app experience with beautiful UI and evidence-based features.

## ✨ Key Features

### 🧠 Neural Recovery Visualization
- **Interactive Brain Map**: Real-time visualization of neural pathway restoration
- **Science-Based Tracking**: Growth based on peer-reviewed neurological research
- **Animated Connections**: Beautiful signals showing brain healing progress
- **Dynamic Messaging**: Personalized encouragement for each recovery stage

### 🛡️ Shield Mode - Emergency Defense System
- **Crisis Intervention**: Multi-phase approach to handle cravings
- **Breathing Exercises**: Guided 6-breath technique with animations
- **Instant Access**: One-tap activation from dashboard
- **Flexible Completion**: Skip options for user autonomy

### 📊 Premium Progress Dashboard
- **Professional Design**: Health app quality UI with glassmorphism effects
- **Product-Specific Metrics**: Tailored recovery tracking for cigarettes, vape, pouches, chewing tobacco
- **Interactive Cards**: Expandable metric details with scientific explanations
- **Milestone System**: Visual celebrations of recovery achievements

### 🤝 Community Platform
- **Celebration Circle**: Share milestones and receive community support
- **Group Challenges**: 4 types of challenges (Mindfulness, Physical, Replacement, Support)
- **Gamified Interactions**: "Cheers" and "High-Fives" reaction system
- **Progress Tracking**: Visual completion indicators and participant counts

### 🔍 Comprehensive Analysis Systems
- **Trigger Analysis**: Identify timing, emotional, and situational cravings
- **Past Attempts Insights**: AI-powered analysis of previous quit attempts
- **Personalized Recommendations**: Tailored strategies based on user history
- **Method Effectiveness**: Scientific scoring of different quit approaches

## 🏗️ Technical Architecture

### Frontend
- **React Native** with **Expo** for cross-platform mobile development
- **TypeScript** for type safety and better developer experience
- **Redux Toolkit** for state management with persistence
- **React Navigation** for smooth navigation experience

### Key Libraries
- `expo-linear-gradient` - Premium gradient effects
- `react-native-svg` - Interactive visualizations
- `@expo/vector-icons` - Consistent iconography
- `react-native-reanimated` - Smooth animations

### Design System
- **Glassmorphism Effects**: Modern visual styling
- **Consistent Typography**: Professional font hierarchy
- **Color Palette**: Branded gradients and accessible colors
- **Component Library**: Reusable, modular components

## 📱 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator or Android Emulator
- Physical device with Expo Go app (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nicnixr-app.git
   cd nicnixr-app
   ```

2. **Install dependencies**
   ```bash
   cd mobile-app
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/simulator**
   - **iOS**: Press `i` or scan QR code with Camera app
   - **Android**: Press `a` or scan QR code with Expo Go
   - **Web**: Press `w` for web preview

### Development Tools

#### App Reset Functions
```javascript
// Available in development console
appReset.full()     // Complete reset (no confirmation)
appReset.confirm()  // Reset with confirmation dialog
appReset.quick()    // Quick reset for development
appReset.dev()      // Instant dev reset with refresh
```

#### Neural Growth Testing
```javascript
// Test different recovery stages
neuralTest.setDays(X)    // Set specific days
neuralTest.day1()        // Set to day 1
neuralTest.week1()       // Set to 1 week
neuralTest.month1()      // Set to 1 month
neuralTest.month3()      // Set to 3 months
neuralTest.progression() // Show all growth stages
```

## 🧪 Testing & Quality Assurance

### Manual Testing
- **Reset Testing**: Comprehensive app state reset functionality
- **Cross-Platform**: iOS and Android compatibility
- **Performance**: Smooth animations and responsive UI
- **Accessibility**: Screen reader support and touch targets

### Code Quality
- **TypeScript**: 100% type coverage for new features
- **ESLint**: Code style consistency
- **Component Architecture**: Modular, reusable components
- **Error Handling**: Comprehensive error boundaries

## 📚 Scientific Foundation

### Research-Backed Features
- **Neural Recovery Timeline**: Based on peer-reviewed studies
- **Product-Specific Metrics**: Tailored to different nicotine products
- **Psychology Integration**: Community features based on behavioral science
- **Conservative Estimates**: Realistic timelines from population studies

### Documentation
- `mobile-app/docs/NEURAL_RECOVERY_SCIENCE.md` - Brain recovery research
- `mobile-app/docs/NICOTINE_RECOVERY_SCIENCE.md` - Product-specific recovery
- `mobile-app/docs/COMMUNITY_PSYCHOLOGY.md` - Social support psychology
- `mobile-app/docs/RESET_TESTING.md` - Development testing procedures

## 🔧 Development

### Project Structure
```
mobile-app/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # Main application screens
│   │   ├── onboarding/     # Multi-step onboarding flow
│   │   ├── dashboard/      # Main dashboard with neural viz
│   │   ├── progress/       # Recovery progress tracking
│   │   ├── community/      # Community features
│   │   └── insights/       # Analytics and insights
│   ├── services/           # Business logic and API calls
│   ├── store/              # Redux state management
│   ├── navigation/         # App navigation configuration
│   ├── constants/          # Theme, colors, spacing
│   └── types/              # TypeScript type definitions
├── docs/                   # Scientific and technical documentation
└── assets/                 # Images, fonts, and static assets
```

### Key Components
- **PersonalizedOnboardingFlow**: 8-step onboarding with trigger analysis
- **DashboardScreen**: Neural visualization and quick actions
- **ProgressScreen**: Comprehensive recovery metrics
- **CommunityScreen**: Social features and challenges
- **ShieldModeScreen**: Emergency craving intervention
- **PastAttemptsInsightsScreen**: AI-powered quit analysis

## 🚀 Deployment

### Expo EAS Build
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure builds
eas build:configure

# Build for production
eas build --platform all
```

### Distribution
- **iOS**: App Store deployment via EAS Submit
- **Android**: Google Play Store via EAS Submit
- **Web**: Hosted deployment via Expo hosting

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow existing component patterns
- Add proper documentation for new features
- Test on both iOS and Android

## 📊 Roadmap

### v2.1 (Q2 2025)
- [ ] Push notifications for milestone celebrations
- [ ] A/B testing for onboarding flows
- [ ] Advanced analytics dashboard
- [ ] Offline mode support

### v2.2 (Q3 2025)
- [ ] AI-powered daily recommendations
- [ ] Wearable device integration
- [ ] Social challenges with friends
- [ ] Professional therapist connections

### v3.0 (Q4 2025)
- [ ] Machine learning personalization
- [ ] Voice-guided meditations
- [ ] AR visualization features
- [ ] Global community challenges

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Scientific Research**: Based on peer-reviewed studies from leading institutions
- **Design Inspiration**: Modern health app best practices
- **Community Feedback**: User insights driving feature development
- **Open Source**: Built with amazing open-source libraries

## 📞 Support

- **Email**: support@nicnixr.com
- **Website**: [nicnixr.com](https://nicnixr.com)
- **Documentation**: [docs.nicnixr.com](https://docs.nicnixr.com)
- **Community**: [community.nicnixr.com](https://community.nicnixr.com)

---

**NicNixr** - Empowering your journey to nicotine freedom through science, community, and cutting-edge technology. 🌟
