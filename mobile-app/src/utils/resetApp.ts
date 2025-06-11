import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/app';

/**
 * App State Reset Utilities
 * 
 * Provides functions to completely reset the app state for development
 * and testing purposes. These utilities clear all stored data including
 * user data, onboarding progress, settings, and Redux Persist cache.
 * 
 * ⚠️ WARNING: These functions are destructive and will permanently
 * delete all user data. Use only for development/debugging.
 */

/**
 * Resets all app state by clearing AsyncStorage and Redux Persist cache
 * 
 * What gets cleared:
 * - User authentication data
 * - Onboarding progress and settings
 * - Progress tracking data
 * - Quit blueprint usage
 * - Redux Persist storage keys
 * - Complete AsyncStorage cache
 * 
 * @returns Promise<void>
 */
export const resetAppState = async (): Promise<void> => {
  try {
    // Clear all stored data
    const keysToRemove = [
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.QUIT_DATE,
      STORAGE_KEYS.PROGRESS_DATA,
      STORAGE_KEYS.SETTINGS,
      STORAGE_KEYS.ONBOARDING_COMPLETED,
      STORAGE_KEYS.ONBOARDING_PROGRESS,
      STORAGE_KEYS.QUIT_BLUEPRINT,
      STORAGE_KEYS.DAILY_CHECK_INS,
      // Additional keys not in STORAGE_KEYS
      '@recovery_journal_factors',
      '@recovery_journal_entries',
      '@demo_notifications_created',
      '@vape_pods_migration_complete',
      '@user',
      '@selected_avatar',
      '@buddy_matches',
      '@community_posts',
    ];

    await AsyncStorage.multiRemove(keysToRemove);
    
    // Also clear Redux Persist storage keys
    const persistKeys = [
      'persist:root',
      'persist:auth',
      'persist:onboarding',
      'persist:progress',
      'persist:settings',
      'persist:achievements',
      'persist:plan',
      'persist:notifications',
      'persist:community',
    ];
    
    await AsyncStorage.multiRemove(persistKeys);
    
    // Clear everything just to be sure
    await AsyncStorage.clear();
    
    console.log('✅ App state cleared successfully!');
    console.log('✅ Redux Persist state cleared!');
    console.log('🔄 Restart the app to begin fresh onboarding');
  } catch (error) {
    console.error('❌ Error clearing app state:', error);
  }
};

export const clearStorageAndReload = async (): Promise<void> => {
  await resetAppState();
  // In a real app, you might trigger a reload here
  // For now, the user needs to manually restart
}; 