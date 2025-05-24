import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { store } from '../store/store';
import { logoutUser } from '../store/slices/authSlice';
import { resetOnboarding } from '../store/slices/onboardingSlice';
import { resetProgress } from '../store/slices/progressSlice';

/**
 * Comprehensive app reset utility
 * Clears all stored data and returns app to initial onboarding state
 */

export const clearAllAppData = async () => {
  try {
    console.log('🧹 CLEARING ALL APP STATE...');
    console.log('⚠️  This will reset everything to initial state');

    // 1. Reset Redux state first (in-memory)
    console.log('🔄 Resetting Redux state...');
    store.dispatch(logoutUser());
    store.dispatch(resetOnboarding());
    store.dispatch(resetProgress());
    console.log('✅ Redux state reset to initial values');

    // 2. Clear all AsyncStorage data
    const keys = await AsyncStorage.getAllKeys();
    console.log('📋 Found stored keys:', keys);
    await AsyncStorage.multiRemove(keys);
    console.log('✅ AsyncStorage cleared');

    // 3. Clear Redux Persist data specifically (double-check)
    const persistKeys = [
      'persist:root',
      'persist:auth',
      'persist:progress', 
      'persist:onboarding',
      'persist:settings',
      'persist:community',
      'persist:shield',
      'persist:achievements',
    ];

    for (const key of persistKeys) {
      await AsyncStorage.removeItem(key);
    }
    console.log('✅ Redux Persist state cleared!');

    // 4. Clear any other app-specific storage
    const appKeys = [
      'user',
      'onboarding',
      'progress',
      'settings',
      'blueprint',
      'auth_token',
      'user_preferences',
      'neural_data',
      'shield_sessions',
      'community_data',
      'challenges',
      'celebrations',
    ];

    for (const key of appKeys) {
      await AsyncStorage.removeItem(key);
    }
    console.log('✅ App-specific data cleared');

    console.log('🔄 Restart the app to begin fresh onboarding');
    console.log('✅ Reset complete! Restart the app to begin fresh.');
    console.log('🗑️ All stored data cleared:');
    console.log('    - User data');
    console.log('    - Onboarding progress');
    console.log('    - Settings');
    console.log('    - Progress data');
    console.log('    - Blueprint');
    console.log('    - Everything else');

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
    console.log('✅ Quick reset complete - back to onboarding');
  }
  return success;
};

// Development-only instant reset - clears everything and forces app reload
export const devReset = async () => {
  try {
    console.log('🔥 DEV RESET: Complete app reset for testing...');
    
    // Clear Redux state immediately
    store.dispatch(logoutUser());
    store.dispatch(resetOnboarding());
    store.dispatch(resetProgress());
    
    // Clear all storage
    await AsyncStorage.clear();
    
    console.log('✅ Dev reset complete - app should restart to onboarding');
    
    // In development, we can trigger a reload
    if (__DEV__) {
      setTimeout(() => {
        // @ts-ignore - Development only reload
        if (global.location) {
          global.location.reload();
        }
      }, 100);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Dev reset failed:', error);
    return false;
  }
};

// Add to global for easy console access
if (__DEV__) {
  // @ts-ignore
  global.appReset = {
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
} 