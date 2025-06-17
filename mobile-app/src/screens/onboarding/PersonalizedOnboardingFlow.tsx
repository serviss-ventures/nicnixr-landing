import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { selectOnboarding, loadOnboardingProgress } from '../../store/slices/onboardingSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { onboardingAnalytics } from '../../services/onboardingAnalytics';

// Import onboarding step components
import WelcomeStep from './steps/WelcomeStep';
import AuthenticationStep from './steps/AuthenticationStep';
import DemographicsStep from './steps/DemographicsStep';
import NicotineProfileStep from './steps/NicotineProfileStep';
import ReasonsAndFearsStep from './steps/ReasonsAndFearsStep';
import TriggerAnalysisStep from './steps/TriggerAnalysisStep';
import PastAttemptsStep from './steps/PastAttemptsStep';
import QuitDateStep from './steps/QuitDateStep';
import DataAnalysisStep from './steps/DataAnalysisStep';
import BlueprintRevealStep from './steps/BlueprintRevealStep';

const PersonalizedOnboardingFlow: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const onboardingState = useSelector((state: RootState) => selectOnboarding(state));
  const { currentStep } = onboardingState;
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    // Load any saved onboarding progress when component mounts
    dispatch(loadOnboardingProgress());
  }, [dispatch]);
  
  // Track step changes
  useEffect(() => {
    const stepNames = [
      'Welcome',
      'Authentication', 
      'Demographics',
      'Nicotine Profile',
      'Reasons & Fears',
      'Trigger Analysis', 
      'Past Attempts',
      'Quit Date',
      'Data Analysis',
      'Blueprint Reveal'
    ];
    
    if (currentStep > 0 && currentStep <= stepNames.length) {
      const stepName = stepNames[currentStep - 1];
      onboardingAnalytics.trackStepStarted(currentStep, stepName, user?.id);
    }
  }, [currentStep, user?.id]);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep />;
      case 2:
        return <AuthenticationStep />;
      case 3:
        return <DemographicsStep />;
      case 4:
        return <NicotineProfileStep />;
      case 5:
        return <ReasonsAndFearsStep />;
      case 6:
        return <TriggerAnalysisStep />;
      case 7:
        return <PastAttemptsStep />;
      case 8:
        return <QuitDateStep />;
      case 9:
        return <DataAnalysisStep />;
      case 10:
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