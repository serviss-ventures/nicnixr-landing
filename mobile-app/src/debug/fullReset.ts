import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store/store';
import { clearUser } from '../store/slices/authSlice';
import { resetOnboarding } from '../store/slices/onboardingSlice';
import { resetProgress } from '../store/slices/progressSlice';
import { supabase } from '../lib/supabase';

export async function performFullReset() {
  console.log('🔄 Starting full app reset...');
  
  try {
    // 1. Clear all AsyncStorage data
    console.log('📦 Clearing AsyncStorage...');
    const allKeys = await AsyncStorage.getAllKeys();
    if (allKeys.length > 0) {
      await AsyncStorage.multiRemove(allKeys);
      console.log(`✅ Cleared ${allKeys.length} stored items`);
    }
    
    // 2. Sign out from Supabase
    console.log('🔐 Signing out from Supabase...');
    try {
      await supabase.auth.signOut();
      console.log('✅ Signed out from Supabase');
    } catch (error) {
      console.log('⚠️ No active Supabase session to sign out');
    }
    
    // 3. Reset Redux store
    console.log('🏪 Resetting Redux store...');
    if (store) {
      // Clear auth state
      store.dispatch(clearUser());
      
      // Reset onboarding
      store.dispatch(resetOnboarding());
      
      // Reset progress
      store.dispatch(resetProgress());
      
      console.log('✅ Redux store reset');
    }
    
    // 4. Clear any cached data
    console.log('🗑️ Clearing cached data...');
    
    // Clear AI Coach session
    await AsyncStorage.removeItem('@ai_coach_session');
    
    // Clear any notification tokens
    await AsyncStorage.removeItem('@push_token');
    
    // Clear buddy data
    await AsyncStorage.removeItem('@buddy_data');
    
    // Clear any other app-specific caches
    const cacheKeys = [
      '@user_data',
      '@progress_data',
      '@settings',
      '@onboarding_state',
      '@quit_date',
      '@onboarding_completed',
      '@suggestion_set_index',
      '@daily_tip_last_shown',
      '@recovery_milestones',
      '@achievements',
    ];
    
    for (const key of cacheKeys) {
      try {
        await AsyncStorage.removeItem(key);
      } catch (error) {
        // Ignore errors for non-existent keys
      }
    }
    
    console.log('✅ All cached data cleared');
    
    // 5. Log success
    console.log('');
    console.log('🎉 Full reset complete!');
    console.log('📱 The app will now restart as a completely new user');
    console.log('🚀 You\'ll see the onboarding flow from the beginning');
    console.log('');
    console.log('⚠️ Please reload the app manually to see changes');
    
    return true;
  } catch (error) {
    console.error('❌ Error during reset:', error);
    return false;
  }
}

// Export for easy access
export const fullReset = performFullReset;

// Import journal debug functions
import { checkJournalEntries, addTestJournalEntry } from './checkJournalEntries';

// Add to global for console access in development
if (__DEV__) {
  // @ts-ignore
  global.fullReset = performFullReset;
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