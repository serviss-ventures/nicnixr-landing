import AsyncStorage from '@react-native-async-storage/async-storage';
import { store, persistor } from '../store/store';
import { resetProgress } from '../store/slices/progressSlice';
import { resetOnboarding } from '../store/slices/onboardingSlice';
import { logoutUser } from '../store/slices/authSlice';
import { supabase } from '../lib/supabase';
import { DevSettings, Alert } from 'react-native';

/**
 * Full app reset for debugging
 * Clears ALL data and restarts the app
 */
export const fullReset = async () => {
  try {
    console.log('🔄 Starting full app reset...');
    
    // 1. Sign out from Supabase
    try {
      await supabase.auth.signOut();
      console.log('✅ Signed out from Supabase');
    } catch (err) {
      console.log('No active Supabase session');
    }
    
    // 2. Clear all AsyncStorage
    await AsyncStorage.clear();
    console.log('✅ AsyncStorage cleared');
    
    // 3. Reset Redux state
    store.dispatch(resetProgress());
    store.dispatch(resetOnboarding());
    store.dispatch(logoutUser());
    console.log('✅ Redux state reset');
    
    // 4. Purge Redux persist
    await persistor.purge();
    await persistor.flush();
    console.log('✅ Redux persist purged');
    
    // 5. Wait a moment for everything to settle
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ Full reset complete!');
    console.log('🔄 Reloading app...');
    
    // 6. Reload the app
    if (__DEV__ && DevSettings && DevSettings.reload) {
      // In development, reload immediately
      DevSettings.reload();
    } else {
      // In production builds or if DevSettings not available
      Alert.alert(
        'Reset Complete',
        'Please close and reopen the app to complete the reset.',
        [{ text: 'OK' }]
      );
    }
  } catch (error) {
    console.error('❌ Full reset failed:', error);
    Alert.alert('Reset Failed', 'Unable to reset app. Please try again.');
  }
};

// Make it globally available in development
if (__DEV__) {
  (global as any).fullReset = fullReset;
}

console.log('🔧 Debug function available: fullReset()');

export default fullReset;

// Import journal debug functions
import { checkJournalEntries, addTestJournalEntry } from './checkJournalEntries';

// Add to global for console access in development
if (__DEV__) {
  // @ts-ignore
  global.checkJournalEntries = checkJournalEntries;
  // @ts-ignore
  global.addTestJournalEntry = addTestJournalEntry;
  
  console.log('');
  console.log('🔧 Debug Functions Available:');
  console.log('- fullReset() - Clear ALL app data and start fresh');
  console.log('- checkJournalEntries() - View all saved journal entries');
  console.log('- addTestJournalEntry() - Add a test entry for June 16');
} 