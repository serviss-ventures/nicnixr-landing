import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

// Import screens directly since we don't have separate navigators for each tab
import DashboardStackNavigator from './DashboardStackNavigator';
import ProgressScreen from '../screens/progress/ProgressScreen';
import CommunityStackNavigator from './CommunityStackNavigator';

// Temporary workaround for ProfileScreen import issue
let ProfileScreen: any;
try {
  ProfileScreen = require('../screens/profile/ProfileScreen').default;
} catch (e) {
  console.error('Failed to load ProfileScreen:', e);
  // Fallback to a simple component
  ProfileScreen = () => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Profile Screen (Loading...)</Text>
      </View>
    );
  };
}

const Tab = createBottomTabNavigator();

export type MainTabParamList = {
  DashboardTab: undefined;
  Progress: undefined;
  Community: undefined;
  Profile: undefined;
};

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'DashboardTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Progress':
              iconName = focused ? 'trending-up' : 'trending-up-outline';
              break;
            case 'Community':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: '#1A1A2E',
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          borderTopWidth: 1,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="DashboardTab" component={DashboardStackNavigator} options={{ title: 'Home' }} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Community" component={CommunityStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator; 