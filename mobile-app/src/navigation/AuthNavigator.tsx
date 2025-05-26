import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AuthScreen from '../screens/auth/AuthScreen';

const Stack = createStackNavigator();

/**
 * Auth Navigator
 * 
 * Handles authentication screens for login/signup
 */
const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen 
        name="Auth" 
        component={AuthScreen} 
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator; 