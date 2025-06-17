import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { onboardingAnalytics } from '../services/onboardingAnalytics';

/**
 * Hook to handle onboarding analytics tracking
 * Automatically tracks step completion with data
 */
export const useOnboardingTracking = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { currentStep } = useSelector((state: RootState) => state.onboarding);

  const trackStepCompleted = async (stepData: any) => {
    if (!user?.id) return;

    const stepNames = [
      'Welcome',
      'Demographics', 
      'Nicotine Profile',
      'Reasons & Fears',
      'Trigger Analysis',
      'Past Attempts', 
      'Quit Date',
      'Data Analysis',
      'Blueprint Reveal',
      'Authentication'
    ];

    const stepName = stepNames[currentStep - 1] || 'Unknown';

    // Track completion with the collected data
    await onboardingAnalytics.trackStepCompleted(
      currentStep,
      stepName,
      user.id,
      stepData
    );
  };

  return { trackStepCompleted };
}; 