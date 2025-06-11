import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { loadStoredUser } from '../store/slices/authSlice';

// Screens
import OnboardingNavigator from './OnboardingNavigator';
import MainNavigator from './MainNavigator';

// Components
import LoadingScreen from '../components/common/LoadingScreen';

const Stack = createStackNavigator();

/**
 * Root Navigator
 * 
 * Determines whether to show onboarding screens or the main app.
 * 
 * Flow:
 * - New users go directly to onboarding
 * - Users who completed onboarding go to main app
 */

const RootNavigator: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isComplete: onboardingComplete } = useSelector((state: RootState) => state.onboarding);
  
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load any stored user data (for users who completed onboarding)
        await dispatch(loadStoredUser()).unwrap();
      } catch (error) {
        // No stored user found - that's fine, they'll go through onboarding
      } finally {
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, [dispatch]);

  // Show loading while initializing
  if (!isInitialized) {
    return <LoadingScreen />;
  }

  // Determine which navigator to show
  const getInitialRouteName = () => {
    // If onboarding is not complete, show onboarding
    if (!onboardingComplete) {
      return 'Onboarding';
    }
    
    // Otherwise show main app
    return 'Main';
  };

  return (
    <Stack.Navigator
      initialRouteName={getInitialRouteName()}
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      <Stack.Screen name="Main" component={MainNavigator} />
    </Stack.Navigator>
  );
};

export default RootNavigator; 