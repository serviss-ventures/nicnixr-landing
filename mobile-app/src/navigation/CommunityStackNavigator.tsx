import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CommunityScreen from '../screens/community/CommunityScreen';
import BuddyMatchingScreen from '../screens/community/BuddyMatchingScreen';
import BuddyChatScreen from '../screens/community/BuddyChatScreen';
import BuddyProfileScreen from '../screens/community/BuddyProfileScreen';

export type CommunityStackParamList = {
  CommunityMain: undefined;
  BuddyMatching: undefined;
  BuddyChat: {
    buddy: {
      id: string;
      name: string;
      avatar: string;
      daysClean: number;
      status: 'online' | 'offline';
    };
  };
  BuddyProfile: {
    buddy: {
      id: string;
      name: string;
      avatar: string;
      daysClean: number;
      status: 'online' | 'offline';
      bio?: string;
      supportStyles?: string[];
      quitDate?: string;
      longestStreak?: number;
      totalDaysClean?: number;
    };
  };
};

const Stack = createStackNavigator<CommunityStackParamList>();

const CommunityStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="CommunityMain" component={CommunityScreen} />
      <Stack.Screen name="BuddyMatching" component={BuddyMatchingScreen} />
      <Stack.Screen name="BuddyChat" component={BuddyChatScreen} />
      <Stack.Screen name="BuddyProfile" component={BuddyProfileScreen} />
    </Stack.Navigator>
  );
};

export default CommunityStackNavigator; 