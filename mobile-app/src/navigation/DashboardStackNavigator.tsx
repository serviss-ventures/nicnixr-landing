import React from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
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
import PlanDetailScreen from '../screens/dashboard/PlanDetailScreen';

const Stack = createStackNavigator<DashboardStackParamList>();

const DashboardStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyle: { backgroundColor: '#000000' }, // Prevent white flash
        cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid, // Fade transition to prevent flash
        transitionSpec: {
          open: {
            animation: 'timing',
            config: {
              duration: 150,
            },
          },
          close: {
            animation: 'timing',
            config: {
              duration: 150,
            },
          },
        },
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
          headerShown: false,
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
      <Stack.Screen 
        name="PlanDetail" 
        component={PlanDetailScreen}
        options={{
          title: 'Plan Details',
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
          cardStyle: { backgroundColor: '#000000' },
        }}
      />
    </Stack.Navigator>
  );
};

export default DashboardStackNavigator; 