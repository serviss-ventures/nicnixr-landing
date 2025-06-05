import React from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Types
import { DashboardStackParamList } from '../types';

// Theme
import { COLORS } from '../constants/theme';

// Screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import RecoveryGuideScreen from '../screens/dashboard/AICoachScreen';
import RecoveryPlansScreen from '../screens/dashboard/RecoveryPlansScreen';
import PlanDetailScreen from '../screens/dashboard/PlanDetailScreen';

const Stack = createStackNavigator<DashboardStackParamList>();

const DashboardStackNavigator: React.FC = () => {
  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          cardStyle: { backgroundColor: '#000000' },
          animationEnabled: false, // Disable all animations
          presentation: 'card',
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
          component={RecoveryGuideScreen}
          options={{
            title: 'Recovery Guide',
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
            cardStyle: { backgroundColor: '#000000' },
          }}
        />
      </Stack.Navigator>
    </View>
  );
};

export default DashboardStackNavigator; 