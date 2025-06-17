import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/app';
import { store } from '../store/store';
import { resetOnboarding } from '../store/slices/onboardingSlice';
import { logout } from '../store/slices/authSlice';
import { supabase } from '../lib/supabase';

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
    // 1. Sign out from Supabase (if signed in)
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.log('No active Supabase session to sign out');
    }
    
    // 2. Reset Redux state
    store.dispatch(logout());
    store.dispatch(resetOnboarding());
    
    // 3. Clear all stored data
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
      // More keys found in the app
      'selected_avatar',
      'user',
      'activePlan',
      'relapse_history',
      '@notifications',
      'lastViewedTipDate',
      'lastViewedTipId',
      '@custom_daily_amount',
      '@custom_daily_cost',
      '@savings_goal',
      '@savings_goal_amount',
      '@chew_dip_fix_applied',
      '@chew_dip_migration_complete',
      '@nixr_pending_invite',
      '@nixr_active_invites',
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
    console.log('✅ Redux state reset!');
    console.log('✅ Supabase session cleared!');
    console.log('🔄 The app will now restart to onboarding...');
    
    // Force a refresh - the RootNavigator will now show onboarding
    // since onboardingComplete is false in Redux
  } catch (error) {
    console.error('❌ Error clearing app state:', error);
  }
};

export const clearStorageAndReload = async (): Promise<void> => {
  await resetAppState();
  // In a real app, you might trigger a reload here
  // For now, the user needs to manually restart
}; 