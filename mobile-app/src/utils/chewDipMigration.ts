import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/app';

/**
 * Migration utility to convert chew/dip users from weekly tins to daily tins
 * This should be run once for existing users who entered tins per week
 */
export const migrateChewDipToDaily = async () => {
  try {
    // Get user data
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!userData) return;
    
    const user = JSON.parse(userData);
    const nicotineProduct = user.nicotineProduct;
    
    // Check if this is a chew/dip user
    if (!nicotineProduct || !['chewing', 'chew', 'dip', 'chew_dip'].includes(nicotineProduct.category)) {
      return;
    }
    
    // Skip migration if already marked complete
    const migrationComplete = await AsyncStorage.getItem('@chew_dip_migration_complete');
    if (migrationComplete === 'true') {
      return false;
    }
    
    // Only migrate if the value seems unreasonably high for daily use (>7)
    // Most heavy users consume 1-4 tins per day
    if (user.dailyAmount && user.dailyAmount > 7) {
      // Migrating chew/dip from weekly to daily tins
      
      // Convert weekly to daily
      const tinsPerDay = user.dailyAmount / 7;
      
      // Update user data
      user.dailyAmount = tinsPerDay;
      if (nicotineProduct) {
        nicotineProduct.dailyAmount = tinsPerDay;
      }
      
      // Also update tinsPerDay if it exists
      if (user.tinsPerDay) {
        user.tinsPerDay = tinsPerDay;
      }
      
      // Save updated data
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      // Mark migration as complete
      await AsyncStorage.setItem('@chew_dip_migration_complete', 'true');
      return true;
    }
    
    return false;
  } catch (error) {
    // Migration error - will retry on next app start
    return false;
  }
};

/**
 * Check if migration has already been completed
 */
export const isChewDipMigrationComplete = async () => {
  try {
    const migrationComplete = await AsyncStorage.getItem('@chew_dip_migration_complete');
    return migrationComplete === 'true';
  } catch {
    return false;
  }
};

/**
 * Reset chew/dip daily amount for users who were incorrectly migrated
 */
export const resetChewDipDailyAmount = async (tinsPerDay: number) => {
  try {
    // Get user data
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!userData) return;
    
    const user = JSON.parse(userData);
    const nicotineProduct = user.nicotineProduct;
    
    // Check if this is a chew/dip user
    if (!nicotineProduct || !['chewing', 'chew', 'dip', 'chew_dip'].includes(nicotineProduct.category)) {
      return;
    }
    
          // Resetting chew/dip to correct daily amount
    
    // Update user data
    user.dailyAmount = tinsPerDay;
    if (nicotineProduct) {
      nicotineProduct.dailyAmount = tinsPerDay;
    }
    
    // Also update tinsPerDay if it exists
    if (user.tinsPerDay !== undefined) {
      user.tinsPerDay = tinsPerDay;
    }
    
    // Update daily cost based on current cost per tin
    if (user.dailyCost && user.dailyAmount) {
      const currentCostPerTin = user.dailyCost / user.dailyAmount;
      user.dailyCost = tinsPerDay * currentCostPerTin;
    }
    
    // Save updated data
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    
    return true;
  } catch (error) {
    // Reset error - will be handled by caller
    return false;
  }
}; 