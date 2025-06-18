/**
 * Offline Mode Service
 * 
 * This service allows temporarily disabling Supabase syncing
 * for development or when network issues occur.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';

const OFFLINE_MODE_KEY = '@nixr_offline_mode';

export class OfflineModeService {
  private static isOffline: boolean = false;

  /**
   * Initialize offline mode from storage
   */
  static async initialize() {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_MODE_KEY);
      this.isOffline = stored === 'true';
      
      if (this.isOffline) {
        logger.info('Offline mode is ENABLED - Supabase sync disabled');
      }
    } catch (error) {
      logger.error('Error loading offline mode preference', error);
    }
  }

  /**
   * Enable offline mode
   */
  static async enableOfflineMode() {
    try {
      this.isOffline = true;
      await AsyncStorage.setItem(OFFLINE_MODE_KEY, 'true');
      logger.info('Offline mode ENABLED - Supabase sync disabled');
    } catch (error) {
      logger.error('Error enabling offline mode', error);
    }
  }

  /**
   * Disable offline mode
   */
  static async disableOfflineMode() {
    try {
      this.isOffline = false;
      await AsyncStorage.setItem(OFFLINE_MODE_KEY, 'false');
      logger.info('Offline mode DISABLED - Supabase sync enabled');
    } catch (error) {
      logger.error('Error disabling offline mode', error);
    }
  }

  /**
   * Check if offline mode is enabled
   */
  static isOfflineMode(): boolean {
    return this.isOffline;
  }

  /**
   * Toggle offline mode
   */
  static async toggleOfflineMode(): Promise<boolean> {
    if (this.isOffline) {
      await this.disableOfflineMode();
    } else {
      await this.enableOfflineMode();
    }
    return this.isOffline;
  }
} 