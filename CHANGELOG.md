# Changelog

All notable changes to the NicNixr mobile app will be documented in this file.

## [2.2.2] - 2025-01-25

### ✨ Added
- **Personalized Dashboard Units**: Dashboard now shows product-specific terminology
  - Cigarettes: "10 packs avoided" or "200 cigarettes avoided"
  - Vape: "5 pods avoided"
  - Nicotine Pouches: "50 pouches avoided"
  - Chewing Tobacco: "3 cans avoided"
  - Other Products: "10 units avoided"

### 🔧 Fixed
- **Dashboard Progress Updates**: Improved real-time progress calculation and display
- **User Experience**: More meaningful and personalized progress metrics
- **Product-Specific Terminology**: Consistent language throughout the app

### 🛠 Technical Improvements
- Enhanced dashboard progress update mechanism
- Added personalized unit name helper function
- Improved progress calculation reliability

## [2.2.1] - 2025-01-25

### 🔧 Changed
- **Brand-Agnostic Product References**: Updated "Zyn Pouches" to "Nicotine Pouches" throughout the app
- **Inclusive Product Detection**: Removed brand-specific checks in favor of generic category detection
- **Enhanced User Experience**: All nicotine pouch brands (Zyn, On!, Rogue, Lucy, etc.) now receive the same personalized experience

### 🛠 Technical Improvements
- Updated onboarding step to use generic "Nicotine Pouches" terminology
- Modified ProgressScreen to detect pouches by category rather than brand name
- Maintained all personalized recovery benefits and health tracking accuracy
- Preserved product-specific health timelines and recovery metrics

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

## [2.3.0] - 2025-01-26

### 🧠 Major: Unified Recovery Tracking System
- **Centralized Recovery Calculations**: All recovery data now flows through a single service (`recoveryTrackingService.ts`)
- **Consistent Dopamine Recovery**: Eliminated discrepancies between different screens showing different recovery percentages
- **Personalized Recovery Messages**: Context-aware messages that update based on user's progress stage
  - Day 0: "You're at the beginning of your recovery journey..."
  - Day 1: "Amazing! You've completed your first day..."
  - Week 1: "Incredible progress! You've made it 7 days..."
  - Month 1+: "Nearly a month clean - incredible!..."
- **Product-Specific Features**: Customized unit names and recovery timelines
  - Cigarettes: "packs avoided" with lung function focus
  - Vape: "pods avoided" with lung irritation emphasis
  - Pouches: "pouches avoided" with oral health focus
  - Chewing: "cans avoided" with oral cancer risk reduction

### ✨ Added
- **Recovery Phases System**: 5 distinct phases (Detox → Acute → Restoration → Neuroplasticity → Optimization)
- **Scientific Recovery Timeline**: Research-based dopamine pathway recovery calculations
- **Comprehensive Error Handling**: Graceful fallbacks if tracking service fails
- **Development Validation**: Built-in data consistency checks and logging
- **Enhanced Neural Growth Test Functions**: Updated to use unified service for consistency

### 🔧 Fixed
- **Status Bar Overlap**: Neural recovery modal no longer appears behind clock/battery
- **Modal Layout Issues**: Proper SafeAreaView configuration with all edges
- **Recovery Data Inconsistencies**: Single source of truth eliminates conflicting data

### 🛠 Technical Improvements
- **Centralized Architecture**: All components now use `recoveryTrackingService.getRecoveryData()`
- **Type Safety**: Comprehensive TypeScript interfaces for all recovery data
- **Performance**: Efficient data access from Redux store with minimal recalculations
- **Maintainability**: Single place to update recovery logic for all features

### 📚 Documentation
- **Comprehensive Guide**: Added `UNIFIED_RECOVERY_TRACKING.md` with full system overview
- **Migration Documentation**: Clear before/after examples for developers
- **Scientific Basis**: Documented peer-reviewed research behind recovery calculations
- **Troubleshooting Guide**: Common issues and debug commands

### 🧪 Developer Experience
- **Enhanced Testing**: Neural test functions now validate consistency across all components
- **Debug Logging**: Development-only logging for tracking data flow
- **Validation Tools**: Built-in checks for data integrity and consistency

## [2.2.3] - 2025-01-26

### Added
- **Enhanced Neural Growth Test Functions**: Comprehensive development testing capabilities
  - Added quick access functions for all major recovery milestones (1 week to 2 years)
  - Implemented `neuralTest.day1()`, `neuralTest.week1()`, `neuralTest.month1()`, etc.
  - Added `neuralTest.progression()` to show all growth stages at once
  - Enhanced console logging with clear developer instructions
  - Enables rapid testing of user experience at different recovery stages

### Developer Experience
- **Improved Development Workflow**: Easy testing of long-term user journeys
  - Functions automatically calculate realistic progress metrics
  - Real-time UI updates across all screens
  - Supports QA validation and stakeholder demonstrations
  - Access via Chrome Developer Tools console when debugging

### Technical
- Enhanced `mobile-app/src/debug/neuralGrowthTest.ts` with comprehensive test functions
- Proper AsyncStorage manipulation for simulating time passage
- Includes cleanup and error handling for development stability

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