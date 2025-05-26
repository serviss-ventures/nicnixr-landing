import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MainTabNavigator from './MainTabNavigator';

const Stack = createStackNavigator();

/**
 * Main Navigator
 * 
 * Main app navigation after authentication and onboarding
 */
const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabNavigator} 
      />
    </Stack.Navigator>
  );
};

export default MainNavigator; 