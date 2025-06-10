import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { loadStoredUser } from '../store/slices/authSlice';

// Screens
import OnboardingNavigator from './OnboardingNavigator';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

// Components
import LoadingScreen from '../components/common/LoadingScreen';

const Stack = createStackNavigator();

/**
 * Root Navigator
 * 
 * Determines whether to show onboarding/auth screens or the main app.
 * 
 * Flow:
 * - Checks authentication state
 * - Routes to onboarding, auth, or main app accordingly
 */

const RootNavigator: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, isLoading: authLoading } = useSelector((state: RootState) => state.auth);
  const { isComplete: onboardingComplete } = useSelector((state: RootState) => state.onboarding);
  
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await dispatch(loadStoredUser()).unwrap();
      } catch (error) {
        // No stored user found or error loading user
      } finally {
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, [dispatch]);

  // Show loading while initializing
  if (!isInitialized || authLoading) {
    return <LoadingScreen />;
  }

  // Determine which navigator to show
  const getInitialRouteName = () => {
    // Navigation state check
    
    if (!user || !isAuthenticated) {
      return 'Auth';
    }
    
    if (!onboardingComplete) {
      return 'Onboarding';
    }
    
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
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      <Stack.Screen name="Main" component={MainNavigator} />
    </Stack.Navigator>
  );
};

export default RootNavigator; 