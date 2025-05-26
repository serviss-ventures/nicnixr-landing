import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PersonalizedOnboardingFlow from '../screens/onboarding/PersonalizedOnboardingFlow';

const Stack = createStackNavigator();

/**
 * Onboarding Navigator
 * 
 * Handles the onboarding flow for new users
 */
const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen 
        name="OnboardingFlow" 
        component={PersonalizedOnboardingFlow} 
      />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator; 