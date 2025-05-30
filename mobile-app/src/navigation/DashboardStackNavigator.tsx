import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Types
import { DashboardStackParamList } from '../types';

// Theme
import { COLORS } from '../constants/theme';

// Screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import AICoachScreen from '../screens/dashboard/AICoachScreen';
import RecoveryPlansScreen from '../screens/dashboard/RecoveryPlansScreen';

const Stack = createStackNavigator<DashboardStackParamList>();

const DashboardStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen 
        name="DashboardMain" 
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
        }}
      />
      <Stack.Screen 
        name="AICoach" 
        component={AICoachScreen}
        options={{
          title: 'AI Coach',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#0F0F0F',
            shadowOpacity: 0,
            elevation: 0,
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
        }}
      />
      <Stack.Screen 
        name="RecoveryPlans" 
        component={RecoveryPlansScreen}
        options={{
          title: 'Recovery Plans',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default DashboardStackNavigator; 