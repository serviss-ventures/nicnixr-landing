import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

// Import screens directly since we don't have separate navigators for each tab
import DashboardStackNavigator from './DashboardStackNavigator';
import ProgressScreen from '../screens/progress/ProgressScreen';
import CommunityStackNavigator from './CommunityStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';

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
      <Tab.Screen 
        name="DashboardTab" 
        component={DashboardStackNavigator} 
        options={{ title: 'Home' }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            const state = navigation.getState();
            const currentRoute = state?.routes[state.index];
            
            if (currentRoute?.name === 'DashboardTab' && currentRoute?.state?.index > 0) {
              // Navigate back to the main screen
              navigation.navigate('DashboardTab', {
                screen: 'Dashboard'
              });
            }
          },
        })}
      />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen 
        name="Community" 
        component={CommunityStackNavigator}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            const state = navigation.getState();
            const currentRoute = state?.routes[state.index];
            
            if (currentRoute?.name === 'Community' && currentRoute?.state?.index > 0) {
              // Navigate back to the main screen
              navigation.navigate('Community', {
                screen: 'CommunityMain'
              });
            }
          },
        })}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackNavigator}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            const state = navigation.getState();
            const currentRoute = state?.routes[state.index];
            
            if (currentRoute?.name === 'Profile' && currentRoute?.state?.index > 0) {
              // Navigate back to the main screen
              navigation.navigate('Profile', {
                screen: 'ProfileMain'
              });
            }
          },
        })}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator; 