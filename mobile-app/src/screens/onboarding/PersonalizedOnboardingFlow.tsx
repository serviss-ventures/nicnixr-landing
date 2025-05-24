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
import PersonalizationStep from './steps/PersonalizationStep';
import BlueprintRevealStep from './steps/BlueprintRevealStep';

const PersonalizedOnboardingFlow: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentStep } = useSelector((state: RootState) => selectOnboarding(state));

  useEffect(() => {
    // Load any saved onboarding progress when component mounts
    dispatch(loadOnboardingProgress());
  }, [dispatch]);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep />;
      case 2:
        return <NicotineProfileStep />;
      case 3:
        return <ReasonsAndFearsStep />;
      case 4:
        return <TriggerAnalysisStep />;
      case 5:
        return <PastAttemptsStep />;
      case 6:
        return <QuitDateStep />;
      case 7:
        return <PersonalizationStep />;
      case 8:
        return <BlueprintRevealStep />;
      default:
        return <WelcomeStep />;
    }
  };

  // REMOVED: No intermediate completion screen - let RootNavigator handle all navigation
  // This prevents competing screens and state conflicts

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