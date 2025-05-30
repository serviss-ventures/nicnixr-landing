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
        }}
      />
    </Stack.Navigator>
  );
};

export default DashboardStackNavigator; 