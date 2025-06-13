import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { Platform } from 'react-native';

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

          return <Ionicons name={iconName} size={22} color={color} />;
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          borderTopColor: 'rgba(255, 255, 255, 0.06)',
          borderTopWidth: 1,
          paddingTop: 6,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          height: Platform.OS === 'ios' ? 84 : 64,
          elevation: 0, // Remove Android shadow
          shadowOpacity: 0, // Remove iOS shadow
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '400',
          marginTop: 2,
          letterSpacing: -0.1,
        },
        tabBarIconStyle: {
          marginTop: 2,
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