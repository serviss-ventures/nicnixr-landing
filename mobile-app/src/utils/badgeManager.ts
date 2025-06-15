import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

class BadgeManager {
  private static instance: BadgeManager;
  
  private constructor() {}
  
  static getInstance(): BadgeManager {
    if (!BadgeManager.instance) {
      BadgeManager.instance = new BadgeManager();
    }
    return BadgeManager.instance;
  }
  
  /**
   * Updates the app icon badge count
   * @param count The number to display on the badge (0 clears the badge)
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      // Ensure count is non-negative
      const safeCount = Math.max(0, Math.floor(count));
      
      if (Platform.OS === 'ios') {
        // iOS supports badge counts directly
        await Notifications.setBadgeCountAsync(safeCount);
      } else if (Platform.OS === 'android') {
        // Android badge support varies by launcher
        // Expo handles this automatically when notifications arrive
        await Notifications.setBadgeCountAsync(safeCount);
      }
    } catch (error) {
      // Fail silently - badge is not critical functionality
      if (__DEV__) {
        console.warn('Failed to set badge count:', error);
      }
    }
  }
  
  /**
   * Clears the app icon badge
   */
  async clearBadge(): Promise<void> {
    await this.setBadgeCount(0);
  }
  
  /**
   * Gets the current badge count
   */
  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      return 0;
    }
  }
  
  /**
   * Syncs badge count with unread notification count
   * @param unreadCount The number of unread notifications
   */
  async syncWithUnreadCount(unreadCount: number): Promise<void> {
    await this.setBadgeCount(unreadCount);
  }
}

export default BadgeManager.getInstance(); 