import { Alert, Linking, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PERMISSION_ASKED_KEY = '@notification_permission_asked';

export const checkNotificationPermissions = async (): Promise<boolean> => {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
};

export const requestNotificationPermissions = async (): Promise<boolean> => {
  // Check if we already have permission
  const hasPermission = await checkNotificationPermissions();
  if (hasPermission) return true;

  // Check if we've already asked before
  const hasAskedBefore = await AsyncStorage.getItem(PERMISSION_ASKED_KEY);
  
  if (hasAskedBefore) {
    // User has denied before, show helpful alert
    Alert.alert(
      'Enable Notifications',
      'Turn on notifications to receive daily motivation, progress updates, and milestone celebrations. You can customize which notifications you receive in settings.',
      [
        {
          text: 'Not Now',
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: () => {
            // Open app settings
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          },
        },
      ],
    );
    return false;
  }

  // First time asking
  const { status } = await Notifications.requestPermissionsAsync();
  await AsyncStorage.setItem(PERMISSION_ASKED_KEY, 'true');
  
  if (status !== 'granted') {
    // Show encouraging message
    Alert.alert(
      'Notifications Help Your Recovery',
      'We\'ll send gentle reminders and celebrate your milestones with you. You can always change this in your phone settings.',
      [{ text: 'OK' }],
    );
  }
  
  return status === 'granted';
};

export const showNotificationSettingsPrompt = () => {
  Alert.alert(
    'Stay on Track',
    'Enable notifications to get daily motivation and milestone celebrations. You control which notifications you receive.',
    [
      {
        text: 'Maybe Later',
        style: 'cancel',
      },
      {
        text: 'Enable',
        onPress: async () => {
          const granted = await requestNotificationPermissions();
          if (!granted && Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
          } else if (!granted) {
            Linking.openSettings();
          }
        },
      },
    ],
  );
}; 