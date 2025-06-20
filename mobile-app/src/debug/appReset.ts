import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { store } from '../store/store';
import { logoutUser } from '../store/slices/authSlice';
import { resetOnboarding } from '../store/slices/onboardingSlice';
import { persistor } from '../store/store';
import { supabase } from '../lib/supabase';

/**
 * Comprehensive app reset utility
 * Clears all stored data and returns app to initial onboarding state
 */

export const clearAllAppData = async () => {
  try {
    console.log('🧹 CLEARING ALL APP STATE...');
    console.log('⚠️  This will reset everything to initial state');

    // 1. Sign out from Supabase first
    console.log('🔐 Signing out from Supabase...');
    try {
      await supabase.auth.signOut();
      console.log('✅ Signed out from Supabase');
    } catch (error) {
      console.log('⚠️  Supabase signout error (may already be signed out):', error);
    }

    // 2. Reset Redux state (in-memory)
    console.log('🔄 Resetting Redux state...');
    store.dispatch(logoutUser());
    store.dispatch(resetOnboarding()); // Reset onboarding to step 1
    console.log('✅ Redux state reset to initial values');

    // 3. Clear all AsyncStorage data
    const keys = await AsyncStorage.getAllKeys();
    console.log(`📋 Found ${keys.length} stored keys to clear`);
    
    // Log what we're clearing for debugging
    if (keys.length > 0) {
      console.log('   Keys being cleared:', keys.slice(0, 5).join(', '), keys.length > 5 ? '...' : '');
    }
    
    await AsyncStorage.multiRemove(keys);
    console.log('✅ AsyncStorage cleared');

    // 4. Clear Redux Persist data specifically (double-check)
    const persistKeys = [
      'persist:root',
      'persist:auth',
      'persist:progress', 
      'persist:onboarding',
      'persist:settings',
      'persist:community',
      'persist:achievements',
      'persist:userProfile',
    ];

    for (const key of persistKeys) {
      await AsyncStorage.removeItem(key);
    }
    console.log('✅ Redux Persist state cleared!');

    // 5. Clear any other app-specific storage
    const appKeys = [
      'user',
      'user_data',
      'onboarding',
      'progress',
      'progress_data',
      'settings',
      'blueprint',
      'auth_token',
      'user_preferences',
      'neural_data',
      'community_data',
      'challenges',
      'celebrations',
      'quit_date',
      'notification_settings',
      '@push_token',
    ];

    for (const key of appKeys) {
      await AsyncStorage.removeItem(key);
    }
    console.log('✅ App-specific data cleared');

    // 6. Force persistor to purge and restart
    await persistor.purge();
    await persistor.flush();
    console.log('✅ Persistor purged and flushed');

    console.log('\n🎯 RESET COMPLETE!');
    console.log('📱 Please restart the app to begin fresh onboarding');
    console.log('✅ All data cleared:');
    console.log('    - User authentication');
    console.log('    - Onboarding progress (back to step 1)');
    console.log('    - Settings & preferences');
    console.log('    - Progress & achievements');
    console.log('    - Community data');
    console.log('    - All cached data');

    return true;
  } catch (error) {
    console.error('❌ Failed to clear app data:', error);
    return false;
  }
};

export const resetWithConfirmation = () => {
  Alert.alert(
    "Reset App Completely?",
    "This will erase ALL your data and return you to the onboarding screen. This cannot be undone.",
    [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "RESET APP",
        style: "destructive",
        onPress: async () => {
          const success = await clearAllAppData();
          if (success) {
            Alert.alert(
              "App Reset Complete",
              "Please restart the app to begin fresh onboarding.",
              [{ text: "OK" }]
            );
          } else {
            Alert.alert(
              "Reset Failed",
              "There was an error resetting the app. Please try again.",
              [{ text: "OK" }]
            );
          }
        }
      }
    ]
  );
};

export const quickReset = async () => {
  console.log('🚀 QUICK RESET: Clearing app state...');
  const success = await clearAllAppData();
  if (success) {
    console.log('✅ Quick reset complete - restart app for fresh onboarding');
  }
  return success;
};

// Development-only instant reset - clears everything and forces app reload
export const devReset = async () => {
  try {
    console.log('🔥 DEV RESET: Complete app reset for testing...');
    
    // Sign out from Supabase
    try {
      await supabase.auth.signOut();
    } catch (error) {
      // Ignore errors, user might not be signed in
    }
    
    // Clear Redux state immediately - RESET TO BEGINNING OF ONBOARDING
    store.dispatch(logoutUser());
    store.dispatch(resetOnboarding()); // This sets currentStep back to 1
    
    // Clear all storage
    await AsyncStorage.clear();
    
    // Force persistor to purge completely
    await persistor.purge();
    await persistor.flush();
    
    console.log('✅ Dev reset complete - app should restart to onboarding STEP 1');
    console.log('🎯 Onboarding will start from the beginning');
    console.log('🔄 Please manually restart the app now');
    
    return true;
  } catch (error) {
    console.error('❌ Dev reset failed:', error);
    return false;
  }
};

// Update the global object
(global as any).appReset = {
  full: clearAllAppData,
  confirm: resetWithConfirmation,
  quick: quickReset,
  dev: devReset,
};

console.log('🔄 App Reset Functions Available:');
console.log('appReset.full() - Complete reset (no confirmation)');
console.log('appReset.confirm() - Reset with confirmation dialog');
console.log('appReset.quick() - Quick reset for development');
console.log('appReset.dev() - Instant dev reset (clears everything + forces refresh)'); 