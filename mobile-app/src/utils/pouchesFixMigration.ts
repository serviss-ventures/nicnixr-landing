import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store/store';
import { updateUserData } from '../store/slices/authSlice';
import { updateUserProfile, updateProgress } from '../store/slices/progressSlice';
import { normalizeProductCategory } from './productCalculations';

export const runPouchesFixMigration = async () => {
  try {
    // Check if migration has already been run
    const migrationComplete = await AsyncStorage.getItem('@pouches_fix_migration_complete');
    if (migrationComplete) {
      return false;
    }

    const state = store.getState();
    const user = state.auth.user;
    
    if (!user || !user.nicotineProduct) {
      return false;
    }

    // Check if user is a pouches user
    const category = normalizeProductCategory(user);
    if (category === 'pouches') {
      console.log('🔧 Running pouches fix migration for user:', user.id);
      
      // Get the current daily amount
      const currentDailyAmount = user.dailyAmount || 10;
      const tinsPerDay = user.tinsPerDay;
      
      // If dailyAmount is less than 5, it's probably stored as tins
      // Convert to individual pouches (15 per tin)
      let correctDailyAmount = currentDailyAmount;
      if (currentDailyAmount < 5 && tinsPerDay) {
        correctDailyAmount = tinsPerDay * 15;
      } else if (currentDailyAmount < 5) {
        correctDailyAmount = currentDailyAmount * 15;
      }
      
      // Update user data
      store.dispatch(updateUserData({
        dailyAmount: correctDailyAmount,
        tinsPerDay: correctDailyAmount / 15,
      }));
      
      // Update progress profile with correct daily amount
      store.dispatch(updateUserProfile({
        dailyAmount: correctDailyAmount,
        category: 'pouches',
      }));
      
      // Force progress recalculation
      await store.dispatch(updateProgress());
      
      // Mark migration as complete
      await AsyncStorage.setItem('@pouches_fix_migration_complete', 'true');
      
      console.log('✅ Pouches fix migration complete. Daily pouches:', correctDailyAmount);
      return true;
    }
    
    // Mark as complete even if not a pouches user
    await AsyncStorage.setItem('@pouches_fix_migration_complete', 'true');
    return false;
  } catch (error) {
    console.error('❌ Error running pouches fix migration:', error);
    return false;
  }
}; 