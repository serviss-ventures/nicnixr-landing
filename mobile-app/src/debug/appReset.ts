import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { store } from '../store/store';
import { logoutUser } from '../store/slices/authSlice';
import { resetOnboarding } from '../store/slices/onboardingSlice';
import { resetProgress } from '../store/slices/progressSlice';
import { setUser } from '../store/slices/authSlice';
import { completeOnboarding } from '../store/slices/onboardingSlice';
import { persistor } from '../store/store';

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

// Add a new function to force navigation to dashboard
const forceToDashboard = async () => {
  console.log('🎯 FORCING NAVIGATION TO DASHBOARD...');
  console.log('⚠️  This will complete onboarding and show the main app');
  
  try {
    // Clear all storage
    await AsyncStorage.clear();
    
    // Reset Redux state
    store.dispatch({ type: 'RESET_ALL' });
    
    // Clear Redux Persist
    await persistor.purge();
    
    // Create a mock completed user
    const mockUser: User = {
      id: `user_${Date.now()}`,
      firstName: 'NixR',
      lastName: 'Warrior',
      email: 'warrior@nixr.com',
      username: 'NixR Warrior',
      dateJoined: new Date().toISOString(),
      quitDate: new Date().toISOString(),
      dailyCost: 10,
      packagesPerDay: 15,
      nicotineProduct: {
        id: 'other',
        name: 'Nicotine Product',
        category: 'other',
        avgCostPerDay: 10,
        nicotineContent: 0,
        harmLevel: 5
      },
      motivationalGoals: ['health', 'money', 'freedom'],
      isAnonymous: false,
    };
    
    // Set the user as authenticated and complete onboarding
    store.dispatch(setUser(mockUser));
    store.dispatch(completeOnboarding());
    
    console.log('✅ Forced to dashboard! You should now see the main app with Freedom Date button.');
    console.log('🎯 Look for the "Your Freedom Date" button in the Quick Actions section');
    
  } catch (error) {
    console.error('❌ Error forcing to dashboard:', error);
  }
};

// Add a new function to test different nicotine products
const testNicotineProduct = async (productType: 'cigarettes' | 'vape' | 'pouches' | 'chewing' | 'other') => {
  console.log(`🧪 TESTING ${productType.toUpperCase()} EXPERIENCE...`);
  
  const productConfigs = {
    cigarettes: {
      id: 'cigarettes',
      name: 'Cigarettes',
      category: 'cigarettes',
      avgCostPerDay: 15,
      nicotineContent: 12,
      harmLevel: 9
    },
    vape: {
      id: 'vape',
      name: 'Vape',
      category: 'vape',
      avgCostPerDay: 8,
      nicotineContent: 18,
      harmLevel: 6
    },
    pouches: {
      id: 'zyn',
      name: 'Zyn Pouches',
      category: 'pouches',
      avgCostPerDay: 6,
      nicotineContent: 6,
      harmLevel: 4
    },
    chewing: {
      id: 'chewing',
      name: 'Chew/Dip',
      category: 'chewing',
      avgCostPerDay: 6,
      nicotineContent: 8,
      harmLevel: 7
    },
    other: {
      id: 'other',
      name: 'Other Nicotine Product',
      category: 'other',
      avgCostPerDay: 10,
      nicotineContent: 0,
      harmLevel: 5
    }
  };
  
  const product = productConfigs[productType];
  
  try {
    // Clear all storage
    await AsyncStorage.clear();
    
    // Reset Redux state
    store.dispatch({ type: 'RESET_ALL' });
    
    // Clear Redux Persist
    await persistor.purge();
    
    // Create a mock user with the specific product
    const mockUser = {
      id: `user_${Date.now()}`,
      firstName: 'NixR',
      lastName: 'Warrior',
      email: 'warrior@nixr.com',
      username: 'NixR Warrior',
      dateJoined: new Date().toISOString(),
      quitDate: new Date().toISOString(),
      dailyCost: product.avgCostPerDay,
      packagesPerDay: 15,
      nicotineProduct: product,
      motivationalGoals: ['health', 'money', 'freedom'],
      isAnonymous: false,
    };
    
    // Set the user as authenticated and complete onboarding
    store.dispatch(setUser(mockUser));
    store.dispatch(completeOnboarding());
    
    console.log(`✅ Testing ${productType} experience!`);
    console.log(`🎯 Product details:`, product);
    console.log(`💰 Daily cost: $${product.avgCostPerDay}`);
    console.log(`⚠️  Harm level: ${product.harmLevel}/10`);
    console.log(`🔬 You should see ${productType}-specific health metrics in the Progress screen`);
    
  } catch (error) {
    console.error(`❌ Error testing ${productType}:`, error);
  }
};

// Update the global object
(global as any).appReset = {
  full: clearAllAppData,
  confirm: resetWithConfirmation,
  quick: quickReset,
  dev: devReset,
  dashboard: forceToDashboard,
  testNicotineProduct: testNicotineProduct,
};

console.log('🔄 App Reset Functions Available:');
console.log('appReset.full() - Complete reset (no confirmation)');
console.log('appReset.confirm() - Reset with confirmation dialog');
console.log('appReset.quick() - Quick reset for development');
console.log('appReset.dev() - Instant dev reset (clears everything + forces refresh)');
console.log('appReset.dashboard() - Force navigation to dashboard to see Freedom Date');
console.log('');
console.log('🧪 Nicotine Product Testing:');
console.log('appReset.testNicotineProduct("cigarettes") - Test cigarette experience');
console.log('appReset.testNicotineProduct("vape") - Test vaping experience');
console.log('appReset.testNicotineProduct("pouches") - Test pouch experience');
console.log('appReset.testNicotineProduct("chewing") - Test chewing tobacco experience');
console.log('appReset.testNicotineProduct("other") - Test generic experience'); 