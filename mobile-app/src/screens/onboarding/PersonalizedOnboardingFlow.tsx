import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { selectOnboarding, loadOnboardingProgress } from '../../store/slices/onboardingSlice';
import { LinearGradient } from 'expo-linear-gradient';

// Import onboarding step components
import WelcomeStep from './steps/WelcomeStep';
import NicotineProfileStep from './steps/NicotineProfileStep';
import ReasonsAndFearsStep from './steps/ReasonsAndFearsStep';
import TriggerAnalysisStep from './steps/TriggerAnalysisStep';
import PastAttemptsStep from './steps/PastAttemptsStep';
import QuitDateStep from './steps/QuitDateStep';
import DataAnalysisStep from './steps/DataAnalysisStep';
import BlueprintRevealStep from './steps/BlueprintRevealStep';

const PersonalizedOnboardingFlow: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentStep } = useSelector((state: RootState) => selectOnboarding(state));

  console.log('🔍 PersonalizedOnboardingFlow - Current Step:', currentStep);

  useEffect(() => {
    // Load any saved onboarding progress when component mounts
    dispatch(loadOnboardingProgress());
  }, [dispatch]);

  const renderCurrentStep = () => {
    console.log('🎯 Rendering step:', currentStep);
    
    switch (currentStep) {
      case 1:
        console.log('📍 Rendering WelcomeStep');
        return <WelcomeStep />;
      case 2:
        console.log('📍 Rendering NicotineProfileStep');
        return <NicotineProfileStep />;
      case 3:
        console.log('📍 Rendering ReasonsAndFearsStep');
        return <ReasonsAndFearsStep />;
      case 4:
        console.log('📍 Rendering TriggerAnalysisStep');
        return <TriggerAnalysisStep />;
      case 5:
        console.log('📍 Rendering PastAttemptsStep');
        return <PastAttemptsStep />;
      case 6:
        console.log('📍 Rendering QuitDateStep');
        return <QuitDateStep />;
      case 7:
        console.log('📍 Rendering DataAnalysisStep (EPIC ANALYSIS!)');
        return <DataAnalysisStep />;
      case 8:
        console.log('📍 Rendering BlueprintRevealStep');
        return <BlueprintRevealStep />;
      default:
        console.log('📍 Rendering default WelcomeStep');
        return <WelcomeStep />;
    }
  };

  // REMOVED: No intermediate completion screen - let RootNavigator handle all navigation
  // This prevents competing screens and state conflicts

  console.log('🎨 PersonalizedOnboardingFlow rendering with step:', currentStep);

  return (
    <LinearGradient
      colors={['#000000', '#0A0F1C', '#0F172A']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {renderCurrentStep()}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});

export default PersonalizedOnboardingFlow; 