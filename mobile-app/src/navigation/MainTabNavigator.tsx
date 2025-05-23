import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Types
import { TabParamList } from '../types';

// Theme
import { COLORS } from '../constants/theme';

// Icons
import { Ionicons } from '@expo/vector-icons';

// Screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import ProgressScreen from '../screens/progress/ProgressScreen';
import CommunityScreen from '../screens/community/CommunityScreen';
import ShieldScreen from '../screens/shield/ShieldScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<TabParamList>();

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: COLORS.cardBorder,
          height: 85,
          paddingBottom: 25,
          paddingTop: 8,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Progress':
              iconName = focused ? 'analytics' : 'analytics-outline';
              break;
            case 'Shield':
              iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
              break;
            case 'Community':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={20} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Shield" component={ShieldScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator; 