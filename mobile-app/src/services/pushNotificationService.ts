import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { AppDispatch } from '../store/store';
import { createNotification } from '../store/slices/notificationSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Configure how notifications should be presented when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class PushNotificationService {
  private static instance: PushNotificationService;
  private notificationListener: any;
  private responseListener: any;
  private dispatch: AppDispatch | null = null;

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  // Initialize the notification service
  async initialize(dispatch: AppDispatch) {
    this.dispatch = dispatch;
    
    // Request permissions
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.log('Notification permissions not granted');
      return false;
    }

    // Get the push token
    const token = await this.registerForPushNotifications();
    if (token) {
      await this.savePushToken(token);
    }

    // Set up notification listeners
    this.setupNotificationListeners();

    // Schedule default notifications
    await this.scheduleDefaultNotifications();

    return true;
  }

  // Request notification permissions
  private async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  }

  // Register for push notifications and get token
  private async registerForPushNotifications(): Promise<string | null> {
    try {
      // Get the project ID from Expo config
      const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
      
      if (!projectId) {
        console.log('No project ID found - notifications will work locally but not remotely');
        return null;
      }
      
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: projectId
      });
      return token.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  // Save push token to AsyncStorage (and potentially to backend)
  private async savePushToken(token: string) {
    await AsyncStorage.setItem('@push_token', token);
    // TODO: Send token to your backend server for remote push notifications
  }

  // Set up notification listeners
  private setupNotificationListeners() {
    // Handle notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      // Optionally create an in-app notification entry
      if (this.dispatch) {
        const { title, body, data } = notification.request.content;
        this.dispatch(createNotification(
          data?.type || 'system',
          title || 'New Notification',
          body || '',
          data,
          'view'
        ));
      }
    });

    // Handle notification clicks
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification clicked:', response);
      // Handle navigation based on notification data
      const data = response.notification.request.content.data;
      this.handleNotificationNavigation(data);
    });
  }

  // Handle navigation when notification is clicked
  private handleNotificationNavigation(data: any) {
    // The navigation will be handled by NotificationCenter when user opens it
    // For now, we just need to ensure the notification is added to the store
    if (this.dispatch && data?.type === 'buddy-message') {
      // Create a notification entry that will be visible in NotificationCenter
      this.dispatch(createNotification(
        'buddy-message',
        data.buddyName || 'New Message',
        data.message || 'You have a new message',
        {
          buddyId: data.buddyId,
          buddyName: data.buddyName,
          buddyDaysClean: data.buddyDaysClean,
          buddyAvatar: data.buddyAvatar,
        },
        'message'
      ));
    }
  }

  // Schedule default notifications
  async scheduleDefaultNotifications() {
    const settings = await this.getNotificationSettings();
    
    if (settings.dailyMotivation) {
      await this.scheduleDailyMotivation();
    }
    
    if (settings.progressUpdates) {
      await this.scheduleProgressReminders();
    }
  }

  // Get notification settings from storage
  private async getNotificationSettings() {
    try {
      const stored = await AsyncStorage.getItem('@notification_settings');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
    
    // Default settings
    return {
      dailyMotivation: true,
      progressUpdates: true,
      healthMilestones: true,
      communityActivity: true,
    };
  }

  // Schedule daily motivation notifications
  async scheduleDailyMotivation() {
    const motivationalMessages = [
      "Every day nicotine-free is a victory! Keep going! 💪",
      "Your body is healing more each day. You're doing amazing!",
      "Remember why you started. You've got this! 🌟",
      "Breaking free from nicotine takes courage. You're brave!",
      "Today is another opportunity to choose freedom. Stay strong!",
      "Your future self will thank you for not giving up today.",
      "Small steps lead to big changes. Keep moving forward!",
      "You're stronger than any craving. Believe in yourself!",
      "Every moment without nicotine is a moment of healing.",
      "You're not just quitting, you're winning at life!"
    ];

    // Cancel existing daily motivation notifications
    try {
      await Notifications.cancelScheduledNotificationAsync('daily-motivation');
    } catch (error) {
      console.log('No existing daily motivation notification to cancel');
    }

    // Schedule a daily notification at 9 AM
    await Notifications.scheduleNotificationAsync({
      identifier: 'daily-motivation',
      content: {
        title: 'Daily Motivation 🌟',
        body: motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)],
        data: { type: 'motivation' },
        sound: 'default',
        badge: 1,
      },
      trigger: {
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });
  }

  // Schedule progress reminder notifications
  async scheduleProgressReminders() {
    // Cancel existing progress reminders
    try {
      await Notifications.cancelScheduledNotificationAsync('progress-reminder');
    } catch (error) {
      console.log('No existing progress reminder to cancel');
    }

    // Schedule evening check-in at 8 PM
    await Notifications.scheduleNotificationAsync({
      identifier: 'progress-reminder',
      content: {
        title: 'Check Your Progress 📊',
        body: 'See how far you\'ve come today! Your recovery journey is inspiring.',
        data: { type: 'progress' },
        sound: 'default',
      },
      trigger: {
        hour: 20,
        minute: 0,
        repeats: true,
      },
    });
  }

  // Schedule milestone notifications based on quit date
  async scheduleMilestoneNotifications(quitDate: Date) {
    const milestones = [
      { days: 1, message: 'Congratulations! You\'ve completed your first day nicotine-free! 🎉' },
      { days: 3, message: 'Amazing! 3 days clean - the hardest part is behind you! 💪' },
      { days: 7, message: 'One week milestone achieved! Your body is thanking you! 🌟' },
      { days: 14, message: 'Two weeks of freedom! You\'re building a healthier life! 🚀' },
      { days: 30, message: '30 days clean! You\'ve officially built a new habit! 🏆' },
      { days: 60, message: '60 days! Your transformation is incredible! ✨' },
      { days: 90, message: '90 days of freedom! You\'re an inspiration! 🌈' },
      { days: 180, message: '6 months nicotine-free! Half a year of victory! 🎊' },
      { days: 365, message: 'ONE YEAR! You\'ve completely transformed your life! 🏅' },
    ];

    for (const milestone of milestones) {
      const triggerDate = new Date(quitDate);
      triggerDate.setDate(triggerDate.getDate() + milestone.days);
      
      // Only schedule if the date is in the future
      if (triggerDate > new Date()) {
        await Notifications.scheduleNotificationAsync({
          identifier: `milestone-${milestone.days}`,
          content: {
            title: `${milestone.days} Day Milestone! 🎉`,
            body: milestone.message,
            data: { type: 'milestone', days: milestone.days },
            sound: 'default',
            badge: 1,
          },
          trigger: {
            date: triggerDate,
          },
        });
      }
    }
  }

  // Send immediate notification (for testing or urgent notifications)
  async sendImmediateNotification(title: string, body: string, data?: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
        badge: 1,
      },
      trigger: null, // null means send immediately
    });
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Update notification settings
  async updateNotificationSettings(settings: any) {
    await AsyncStorage.setItem('@notification_settings', JSON.stringify(settings));
    
    // Reschedule notifications based on new settings
    await this.cancelAllNotifications();
    await this.scheduleDefaultNotifications();
  }

  // Get scheduled notifications (for debugging)
  async getScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Clean up listeners
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

export default PushNotificationService.getInstance(); 