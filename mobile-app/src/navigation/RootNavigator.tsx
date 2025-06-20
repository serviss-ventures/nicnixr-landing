import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { loadStoredUser, selectUser, selectIsAuthenticated, fetchUserProfile } from '../store/slices/authSlice';
import { selectOnboarding } from '../store/slices/onboardingSlice';
import { supabase } from '../lib/supabase';

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
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const onboarding = useSelector(selectOnboarding);
  const onboardingComplete = onboarding?.isComplete || false;
  const currentStep = onboarding?.currentStep || 1;
  
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

  // Fetch fresh user profile from Supabase on app start
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        // Only fetch profile if onboarding is complete
        if (!onboardingComplete) {
          return;
        }
        
        // Check if we have a Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Fetch the full user profile from our users table
          await dispatch(fetchUserProfile(session.user.id));
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    };

    loadUserProfile();
  }, [dispatch, onboardingComplete]);

  // Show loading while initializing
  if (!isInitialized) {
    return <LoadingScreen />;
  }

  // Dynamically show the appropriate screen based on onboarding state
  // This ensures that when onboarding is reset, we immediately show the onboarding screen
  if (!onboardingComplete || currentStep < 9) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      </Stack.Navigator>
    );
  }

  // Show main app if onboarding is complete
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="Main" component={MainNavigator} />
    </Stack.Navigator>
  );
};

export default RootNavigator; 