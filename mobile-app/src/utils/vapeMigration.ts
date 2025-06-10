import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store';
import { updateUserData } from '../store/slices/authSlice';

/**
 * Migration for vape users who don't have podsPerDay set
 * This fixes the issue where vape users show 0 units avoided
 */
export const migrateVapeUsers = async () => {
  try {
    // Check if migration has already been run
    const migrationComplete = await AsyncStorage.getItem('@vape_pods_migration_complete');
    if (migrationComplete === 'true') {
      return;
    }

    // Get current user data
    const userDataStr = await AsyncStorage.getItem('@user');
    if (!userDataStr) return;

    const user = JSON.parse(userDataStr);
    
    // Check if this is a vape user without podsPerDay
    const isVapeUser = user.nicotineProduct?.category === 'vape' || 
                      user.nicotineProduct?.category === 'vaping' ||
                      user.nicotineProduct?.category === 'e-cigarette';
    
    if (isVapeUser && !user.podsPerDay) {
      console.log('🔧 Migrating vape user to add podsPerDay...');
      
      // Set podsPerDay from dailyAmount (which was saved during onboarding)
      const podsPerDay = user.dailyAmount || 1;
      
      const updatedUserData = {
        ...user,
        podsPerDay: podsPerDay
      };
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('@user', JSON.stringify(updatedUserData));
      
      // Update Redux store
      store.dispatch(updateUserData({ podsPerDay }));
      
      console.log(`✅ Vape migration complete! Set podsPerDay to ${podsPerDay}`);
    }
    
    // Mark migration as complete
    await AsyncStorage.setItem('@vape_pods_migration_complete', 'true');
    
  } catch (error) {
    console.error('❌ Vape migration failed:', error);
  }
};

/**
 * Run this on app startup to fix existing vape users
 */
export const runVapeMigration = async () => {
  await migrateVapeUsers();
}; 