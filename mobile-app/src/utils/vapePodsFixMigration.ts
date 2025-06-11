import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store/store';
import { updateUserData } from '../store/slices/authSlice';
import { updateUserProfile, updateProgress } from '../store/slices/progressSlice';

export const runVapePodsFixMigration = async () => {
  try {
    // Check if migration has already been run
    const migrationComplete = await AsyncStorage.getItem('@vape_pods_fix_migration_complete');
    if (migrationComplete) {
      return false;
    }

    const state = store.getState();
    const user = state.auth.user;
    
    if (!user || !user.nicotineProduct) {
      return false;
    }

    // Check if user is a vape user
    if (user.nicotineProduct.category === 'vape') {
      console.log('🔧 Running vape pods fix migration for user:', user.id);
      
      // Get the correct pods per day value
      const podsPerDay = user.podsPerDay || user.dailyAmount || 1;
      
      // Update user data
      store.dispatch(updateUserData({
        podsPerDay: podsPerDay,
        dailyAmount: podsPerDay,
      }));
      
      // Update progress profile with correct daily amount
      store.dispatch(updateUserProfile({
        dailyAmount: podsPerDay,
        category: 'vape',
      }));
      
      // Force progress recalculation
      await store.dispatch(updateProgress());
      
      // Mark migration as complete
      await AsyncStorage.setItem('@vape_pods_fix_migration_complete', 'true');
      
      console.log('✅ Vape pods fix migration complete. Pods per day:', podsPerDay);
      return true;
    }
    
    // Mark as complete even if not a vape user
    await AsyncStorage.setItem('@vape_pods_fix_migration_complete', 'true');
    return false;
  } catch (error) {
    console.error('❌ Error running vape pods fix migration:', error);
    return false;
  }
}; 