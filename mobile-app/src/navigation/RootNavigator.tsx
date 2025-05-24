import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';

// Navigation Types
import { RootStackParamList } from '../types';

// Redux
import { RootState, AppDispatch } from '../store/store';
import { loadStoredUser } from '../store/slices/authSlice';
import { loadStoredProgress } from '../store/slices/progressSlice';

// Screens
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import AuthScreen from '../screens/auth/AuthScreen';
import MainTabNavigator from './MainTabNavigator';
import ShieldModeScreen from '../screens/shield/ShieldModeScreen';

// Components
import LoadingScreen from '../components/common/LoadingScreen';

const Stack = createStackNavigator<RootStackParamList>();

/**
 * RootNavigator Component
 * 
 * Main navigation controller that handles the top-level app routing.
 * Determines whether to show onboarding/auth screens or the main app.
 * 
 * Navigation Logic:
 * - Shows onboarding if user is not authenticated OR no user data exists
 * - Shows main app with tab navigator once authenticated
 * - Includes Shield Mode as a modal overlay
 * 
 * State Management:
 * - Automatically loads stored user data on app start
 * - Loads progress data when user becomes authenticated
 * - Handles loading states during authentication checks
 * 
 * Security:
 * - Safety checks ensure onboarding is shown when no user exists
 * - Proper authentication state management
 * - Graceful error handling for storage operations
 */
const RootNavigator: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Try to load stored user data on app start
    dispatch(loadStoredUser());
  }, [dispatch]);

  useEffect(() => {
    // If user is authenticated, load their progress data
    if (isAuthenticated && user) {
      dispatch(loadStoredProgress());
    }
  }, [isAuthenticated, user, dispatch]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  // Safety check: if no user data exists, definitely show onboarding
  const shouldShowOnboarding = !isAuthenticated || !user;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animationEnabled: true,
      }}
    >
      {shouldShowOnboarding ? (
        // Authentication Stack
        <>
          <Stack.Screen 
            name="Onboarding" 
            component={OnboardingScreen}
            options={{
              animationTypeForReplace: 'push',
            }}
          />
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen}
            options={{
              animationTypeForReplace: 'push',
            }}
          />
        </>
      ) : (
        // Main App Stack
        <>
          <Stack.Screen 
            name="Main" 
            component={MainTabNavigator}
            options={{
              animationTypeForReplace: 'push',
            }}
          />
          <Stack.Screen 
            name="ShieldMode" 
            component={ShieldModeScreen}
            options={{
              presentation: 'modal',
              gestureEnabled: false,
              animationEnabled: true,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator; 