import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CommunityScreen from '../screens/community/CommunityScreen';
import BuddyMatchingScreen from '../screens/community/BuddyMatchingScreen';
import BuddyChatScreen from '../screens/community/BuddyChatScreen';

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
};

const Stack = createNativeStackNavigator<CommunityStackParamList>();

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
    </Stack.Navigator>
  );
};

export default CommunityStackNavigator; 