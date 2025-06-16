import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { AppDispatch } from '../store/store';
import { createNotification } from '../store/slices/notificationSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Sentry from '@sentry/react-native';

// Configure how notifications should be presented when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class PushNotificationService {
  private static instance: PushNotificationService;
  private notificationListener: any;
  private responseListener: any;
  private dispatch: AppDispatch | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  // Initialize the notification service
  async initialize(dispatch: AppDispatch) {
    // Prevent multiple initializations
    if (this.isInitialized) {
      return true;
    }

    try {
      this.dispatch = dispatch;
      
      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        // Log to Sentry in production
        if (!__DEV__) {
          Sentry.captureMessage('Notification permissions not granted', 'info');
        }
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

      this.isInitialized = true;
      return true;
    } catch (error) {
      if (!__DEV__) {
        Sentry.captureException(error);
      }
      return false;
    }
  }

  // Request notification permissions
  private async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      return finalStatus === 'granted';
    } catch (error) {
      if (!__DEV__) {
        Sentry.captureException(error);
      }
      return false;
    }
  }

  // Register for push notifications and get token
  private async registerForPushNotifications(): Promise<string | null> {
    try {
      // Skip token generation in development if no project ID
      if (__DEV__ && !Constants.expoConfig?.extra?.eas?.projectId) {
        return null;
      }

      // Get the project ID from Expo config
      const projectId = Constants.expoConfig?.extra?.eas?.projectId || 
                       Constants.easConfig?.projectId ||
                       Constants.expoConfig?.projectId;
      
      if (!projectId && !__DEV__) {
        // Only error in production
        throw new Error('No project ID found for push notifications');
      }
      
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: projectId || 'development'
      });
      return token.data;
    } catch (error) {
      if (!__DEV__) {
        Sentry.captureException(error);
      }
      return null;
    }
  }

  // Save push token to AsyncStorage (and potentially to backend)
  private async savePushToken(token: string) {
    try {
      await AsyncStorage.setItem('@push_token', token);
      
      // In production, send token to backend
      if (!__DEV__) {
        // TODO: Implement backend API call when server is ready
        // await api.updatePushToken(token);
      }
    } catch (error) {
      if (!__DEV__) {
        Sentry.captureException(error);
      }
    }
  }

  // Set up notification listeners
  private setupNotificationListeners() {
    // Handle notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      // Create an in-app notification entry
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
      // Handle navigation based on notification data
      const data = response.notification.request.content.data;
      this.handleNotificationNavigation(data);
    });
  }

  // Handle navigation when notification is clicked
  private handleNotificationNavigation(data: any) {
    if (!data || !this.dispatch) return;

    // Handle different notification types
    switch (data.type) {
      case 'buddy-message':
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
        break;
      
      case 'milestone':
        // Create milestone notification entry
        this.dispatch(createNotification(
          'milestone',
          `Day ${data.days} Milestone`,
          'View detailed progress report',
          { milestone: data.days },
          'view'
        ));
        break;
      
      // Add more cases as needed
    }
  }

  // Schedule default notifications
  async scheduleDefaultNotifications() {
    try {
      const settings = await this.getNotificationSettings();
      
      if (settings.dailyMotivation) {
        await this.scheduleDailyMotivation();
      }
      
      if (settings.progressUpdates) {
        await this.scheduleProgressReminders();
      }
    } catch (error) {
      if (!__DEV__) {
        Sentry.captureException(error);
      }
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
      if (!__DEV__) {
        Sentry.captureException(error);
      }
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
    // Tesla/Apple-inspired clean messaging - no emojis, data-focused
    const motivationalMessages = [
      "Progress update: Neural pathways continue to strengthen.",
      "Respiratory function improving. Oxygen saturation optimal.",
      "Dopamine receptors regenerating. Natural reward system activating.",
      "Cardiovascular health markers show significant improvement.",
      "Withdrawal phase complete. System stabilization achieved.",
      "Sleep architecture normalized. Recovery accelerating.",
      "Craving intensity decreased by measurable margins.",
      "Metabolic rate optimizing. Energy production increased.",
      "Immune response strengthening. Cellular repair ongoing.",
      "Neuroplasticity engaged. New patterns establishing."
    ];

    try {
      // Cancel existing daily motivation notifications
      await Notifications.cancelScheduledNotificationAsync('daily-motivation').catch(() => {});

      // Schedule a daily notification at 9 AM
      await Notifications.scheduleNotificationAsync({
        identifier: 'daily-motivation',
        content: {
          title: 'Daily Health Update',
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
    } catch (error) {
      if (!__DEV__) {
        Sentry.captureException(error);
      }
    }
  }

  // Schedule progress reminder notifications
  async scheduleProgressReminders() {
    try {
      // Cancel existing progress reminders
      await Notifications.cancelScheduledNotificationAsync('progress-reminder').catch(() => {});

      // Schedule evening check-in at 8 PM
      await Notifications.scheduleNotificationAsync({
        identifier: 'progress-reminder',
        content: {
          title: 'Progress Report Available',
          body: 'Review today\'s health metrics and recovery data.',
          data: { type: 'progress' },
          sound: 'default',
        },
        trigger: {
          hour: 20,
          minute: 0,
          repeats: true,
        },
      });
    } catch (error) {
      if (!__DEV__) {
        Sentry.captureException(error);
      }
    }
  }

  // Schedule milestone notifications based on quit date
  async scheduleMilestoneNotifications(quitDate: Date) {
    // Clean, data-driven milestone messages
    const milestones = [
      { days: 1, message: '24 hours complete. Nicotine elimination: 50%. Carbon monoxide levels normalized.' },
      { days: 3, message: '72-hour mark reached. Physical withdrawal symptoms decreasing. Lung function improving.' },
      { days: 7, message: 'Week 1 complete. Dopamine receptors beginning regeneration. Sleep patterns stabilizing.' },
      { days: 14, message: 'Two weeks achieved. Circulation restored. Lung capacity increased by 10%.' },
      { days: 30, message: 'Month 1 complete. Neural pathways rewired. Craving frequency reduced by 70%.' },
      { days: 60, message: 'Day 60 reached. Cardiovascular risk decreased. Energy levels significantly elevated.' },
      { days: 90, message: 'Quarter year milestone. Lung function approaching baseline. Addiction pathways dormant.' },
      { days: 180, message: '6 months recorded. Disease risk markers substantially reduced. Full system recovery progressing.' },
      { days: 365, message: 'Annual milestone achieved. Comprehensive health restoration documented. Transformation complete.' },
    ];

    try {
      for (const milestone of milestones) {
        const triggerDate = new Date(quitDate);
        triggerDate.setDate(triggerDate.getDate() + milestone.days);
        
        // Only schedule if the date is in the future
        if (triggerDate > new Date()) {
          await Notifications.scheduleNotificationAsync({
            identifier: `milestone-${milestone.days}`,
            content: {
              title: `Day ${milestone.days} Milestone`,
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
    } catch (error) {
      if (!__DEV__) {
        Sentry.captureException(error);
      }
    }
  }

  // Send immediate notification (for testing or urgent notifications)
  async sendImmediateNotification(title: string, body: string, data?: any) {
    try {
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
    } catch (error) {
      if (!__DEV__) {
        Sentry.captureException(error);
      }
      throw error; // Re-throw for testing purposes
    }
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      if (!__DEV__) {
        Sentry.captureException(error);
      }
    }
  }

  // Update notification settings
  async updateNotificationSettings(settings: any) {
    try {
      await AsyncStorage.setItem('@notification_settings', JSON.stringify(settings));
      
      // Reschedule notifications based on new settings
      await this.cancelAllNotifications();
      await this.scheduleDefaultNotifications();
    } catch (error) {
      if (!__DEV__) {
        Sentry.captureException(error);
      }
    }
  }

  // Get scheduled notifications (for debugging)
  async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      if (!__DEV__) {
        Sentry.captureException(error);
      }
      return [];
    }
  }

  // Clean up listeners
  cleanup() {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
    this.isInitialized = false;
  }
}

export default PushNotificationService.getInstance(); 