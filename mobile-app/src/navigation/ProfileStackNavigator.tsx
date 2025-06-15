import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../screens/profile/ProfileScreen';
import NotificationsScreen from '../screens/settings/NotificationsScreen';
import NotificationTestScreen from '../screens/settings/NotificationTestScreen';

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Notifications: undefined;
  NotificationTest: undefined;
};

const Stack = createStackNavigator<ProfileStackParamList>();

const ProfileStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#000000' },
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="NotificationTest" component={NotificationTestScreen} />
    </Stack.Navigator>
  );
};

export default ProfileStackNavigator; 