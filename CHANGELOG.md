# Changelog

All notable changes to the NicNixr mobile app will be documented in this file.

## [2.2.0] - 2025-01-25

### 🎯 CRITICAL FIXES - Personalization System
- **FIXED**: Users selecting pouches/vape/other products were seeing cigarette-specific content
- **FIXED**: Hardcoded "cigarettes" fallbacks in onboarding completion flow
- **FIXED**: Progress screen now shows product-specific health metrics
- **FIXED**: Icon compatibility issues (`chatbubble-outline` → `chatbubbles-outline`)

### ✨ Added
- Product-specific health metrics in ProgressScreen:
  - Cigarettes: Lung capacity, circulation, taste/smell recovery
  - Vape: Lung function, oral health improvements
  - Pouches: Oral health, gum healing metrics
  - Chewing: Oral tissue recovery, reduced inflammation
  - Other: Generic addiction recovery metrics
- Enhanced debug tools for testing different product experiences
- Comprehensive logging for onboarding data flow tracking
- Product-specific terminology throughout the app

### 🔧 Technical Improvements
- Enhanced data validation in NicotineProfileStep with debugging logs
- Improved error handling and user feedback in onboarding
- Fixed data persistence issues in BlueprintRevealStep
- Added comprehensive testing functions for different nicotine products

### 🧪 Developer Tools
- `appReset.testNicotineProduct("pouches")` - Test pouch experience
- `appReset.testNicotineProduct("vape")` - Test vaping experience
- `appReset.testNicotineProduct("cigarettes")` - Test cigarette experience
- `appReset.testNicotineProduct("chewing")` - Test chewing tobacco experience
- `appReset.testNicotineProduct("other")` - Test generic experience

## [2.1.0] - 2024-12-20

### ✨ Added
- **Epic Freedom Date Screen**: Real-time liberation counter with milestone gallery
- **Enhanced Community Features**: Vibrant mock data, challenges, support sections
- **Advanced Progress Tracking**: Premium glassmorphism design with product-specific metrics
- **Comprehensive Onboarding**: Trigger analysis and past attempts analysis systems
- **Navigation Architecture**: Proper stack navigation with TypeScript interfaces

### 🛠 Technical Improvements
- Enhanced app reset system with 4 reset options
- Fixed invalid Ionicons references
- Animation optimization and performance improvements
- Improved Redux architecture with proper persistence

### 📚 Documentation
- Comprehensive README updates
- Scientific documentation for neural recovery claims
- Detailed changelog and version control

## [2.0.0] - 2024-11-15

### ✨ Added
- Initial app foundation with React Native + Expo
- Core onboarding flow
- Basic dashboard with neural recovery visualization
- Progress tracking system
- Community features
- Shield Mode for craving management

### 🏗 Technical Foundation
- TypeScript implementation
- Redux state management with persistence
- Custom theme system
- Tab and stack navigation
- Professional design system

---

## Version Format
- **Major.Minor.Patch** (e.g., 2.1.0)
- **Major**: Breaking changes or significant new features
- **Minor**: New features, backwards compatible
- **Patch**: Bug fixes, small improvements

## Categories
- **✨ Added**: New features
- **🔧 Changed**: Changes in existing functionality  
- **🐛 Fixed**: Bug fixes
- **🗑️ Removed**: Removed features
- **🛠 Technical**: Technical improvements
- **📚 Documentation**: Documentation changes

*Built with ❤️ for those ready to break free from nicotine addiction.* 