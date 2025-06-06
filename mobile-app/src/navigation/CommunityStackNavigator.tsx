import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CommunityScreen from '../screens/community/CommunityScreen';
import BuddyMatchingScreen from '../screens/community/BuddyMatchingScreen';
import BuddyProfileScreen from '../screens/community/BuddyProfileScreen';
import BuddyChatScreen from '../screens/community/BuddyChatScreen';
import BuddySearchScreen from '../screens/community/BuddySearchScreen';

export type CommunityStackParamList = {
  CommunityMain: undefined;
  BuddyMatching: undefined;
  BuddyProfile: {
    buddy: {
      id: string;
      name: string;
      avatar: string;
      daysClean: number;
      status: 'online' | 'offline' | 'in-crisis';
      bio?: string;
      supportStyles?: string[];
    };
  };
  BuddyChat: {
    buddy: {
      id: string;
      name: string;
      avatar: string;
      daysClean: number;
      status: 'online' | 'offline' | 'in-crisis';
    };
  };
  BuddySearch: undefined;
};

const Stack = createStackNavigator<CommunityStackParamList>();

const CommunityStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#000000' },
      }}
    >
      <Stack.Screen name="CommunityMain" component={CommunityScreen} />
      <Stack.Screen name="BuddyMatching" component={BuddyMatchingScreen} />
      <Stack.Screen name="BuddyProfile" component={BuddyProfileScreen} />
      <Stack.Screen name="BuddyChat" component={BuddyChatScreen} />
      <Stack.Screen name="BuddySearch" component={BuddySearchScreen} />
    </Stack.Navigator>
  );
};

export default CommunityStackNavigator; 