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

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animationEnabled: true,
      }}
    >
      {!isAuthenticated ? (
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