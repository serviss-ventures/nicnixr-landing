import AsyncStorage from '@react-native-async-storage/async-storage';
import recoveryTrackingService from '../services/recoveryTrackingService';
import { STORAGE_KEYS } from '../constants/app';
import { store } from '../store/store';
import { loadStoredProgress, updateProgress, setQuitDate } from '../store/slices/progressSlice';
import { updateUserData } from '../store/slices/authSlice';
import { achievementService } from '../services/achievementService';
import { supabase } from '../lib/supabase';

// Add nicotine type options
export const NICOTINE_TYPES = {
  cigarettes: {
    category: 'cigarettes',
    brand: 'Test Brand',
    nicotineContent: 1.2,
    packagesPerDay: 1,
    unitsPerPackage: 20,
    costPerPackage: 15,
    harmLevel: 10,
  },
  vape: {
    category: 'vape',
    brand: 'Test Vape',
    nicotineContent: 5,
    podsPerDay: 1,
    costPerPod: 20,
    harmLevel: 8,
  },
  pouches: {
    category: 'pouches',
    brand: 'Test Pouches',
    nicotineContent: 4,
    dailyAmount: 10,
    costPerPouch: 0.5,
    harmLevel: 5,
  },
  chew_dip: {
    category: 'chew_dip',
    brand: 'Test Dip',
    nicotineContent: 3,
    dailyAmount: 0.7, // tins per day
    costPerTin: 5,
    harmLevel: 9,
  },
};

// Change nicotine type
export const setNicotineType = async (type: keyof typeof NICOTINE_TYPES) => {
  try {
    const nicotineProduct = NICOTINE_TYPES[type];
    
    // Get current user data
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    let user = userData ? JSON.parse(userData) : {};
    
    // Update nicotine product
    user.nicotineProduct = nicotineProduct;
    
    // Calculate daily cost based on type
    switch (type) {
      case 'cigarettes':
        user.dailyCost = nicotineProduct.packagesPerDay * nicotineProduct.costPerPackage;
        user.packagesPerDay = nicotineProduct.packagesPerDay;
        break;
      case 'vape':
        user.dailyCost = nicotineProduct.podsPerDay * nicotineProduct.costPerPod;
        user.podsPerDay = nicotineProduct.podsPerDay;
        break;
      case 'pouches':
        user.dailyCost = nicotineProduct.dailyAmount * nicotineProduct.costPerPouch;
        user.dailyAmount = nicotineProduct.dailyAmount;
        break;
      case 'chew_dip':
        user.dailyCost = nicotineProduct.dailyAmount * nicotineProduct.costPerTin;
        user.dailyAmount = nicotineProduct.dailyAmount;
        break;
    }
    
    // Save updated user data
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    
    // Update Redux
    store.dispatch(updateUserData({ nicotineProduct, dailyCost: user.dailyCost }));
    
    // Update Supabase if user is logged in
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      await supabase
        .from('users')
        .update({
          nicotine_type: type,
          daily_cost: user.dailyCost,
          nicotine_product: nicotineProduct,
        })
        .eq('id', authUser.id);
    }
    
    console.log(`🚬 Changed nicotine type to: ${type}`);
    console.log(`💰 Daily cost: $${user.dailyCost}`);
    
    // Trigger progress update to recalculate with new product
    await store.dispatch(updateProgress());
    
    return true;
  } catch (error) {
    console.error('Failed to set nicotine type:', error);
    return false;
  }
};

export const setTestDaysClean = async (days: number) => {
  try {
    console.log(`\n🧪 PROGRESS TEST: Setting to ${days} days clean...`);
    
    // Get user data to calculate with their actual daily cost
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    let dailyCost = 15; // Default fallback
    let dailyAmount = 20; // Default fallback
    let nicotineType = 'cigarettes';
    
    if (userData) {
      const user = JSON.parse(userData);
      dailyCost = user.dailyCost || 15;
      nicotineType = user.nicotineProduct?.category || 'cigarettes';
      
      // Calculate daily amount based on product type
      const nicotineProduct = user.nicotineProduct;
      if (nicotineProduct) {
        switch (nicotineProduct.category) {
          case 'cigarettes':
            dailyAmount = (user.packagesPerDay || 1) * 20;
            break;
          case 'vape':
            dailyAmount = user.podsPerDay || 1;
            break;
          case 'pouches':
            dailyAmount = user.dailyAmount || 15;
            break;
          case 'chewing':
          case 'chew':
          case 'dip':
          case 'chew_dip':
            // dailyAmount is now tins per day, convert to portions (5 portions per tin)
            const tinsPerDay = user.dailyAmount || 0.7;
            dailyAmount = tinsPerDay * 5;
            break;
          default:
            dailyAmount = user.dailyAmount || 10;
        }
      }
    }
    
    console.log(`📦 Product type: ${nicotineType}`);
    
    // Calculate realistic progress metrics based on days clean using unified service
    const recoveryPercentage = recoveryTrackingService.calculateDopamineRecovery(days);
    const healthScore = Math.min(10 + (days * 1.2), 100);
    const moneySaved = days * dailyCost; // Use actual daily cost
    const unitsAvoided = days * dailyAmount; // Use actual daily amount
    const lifeRegained = (unitsAvoided * 7) / 60; // Average 7 minutes per unit, converted to hours
    const cravingsResisted = Math.floor(days * 3.5); // Average 3.5 cravings per day
    
    const testProgressData = {
      daysClean: days,
      hoursClean: days * 24,
      minutesClean: days * 24 * 60,
      secondsClean: days * 24 * 60 * 60,
      healthScore: Math.round(healthScore),
      moneySaved: Math.round(moneySaved * 100) / 100, // Round to 2 decimals
      lifeRegained: Math.round(lifeRegained * 10) / 10, // Round to 1 decimal
      unitsAvoided: Math.round(unitsAvoided),
      cravingsResisted: cravingsResisted,
      streakDays: days,
      longestStreak: days,
      totalRelapses: 0,
      minorSlips: 0,
      recoveryStrength: 100,
      averageStreakLength: days,
      improvementTrend: 'stable',
      lastUpdate: new Date().toISOString(),
    };

    // Save to the correct storage key that the app uses
    await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS_DATA, JSON.stringify(testProgressData));
    
    // Also update the quit date to match the test days
    const testQuitDate = new Date();
    testQuitDate.setDate(testQuitDate.getDate() - days);
    
    const userDataObj = userData ? JSON.parse(userData) : {};
    userDataObj.quitDate = testQuitDate.toISOString();
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userDataObj));
    await AsyncStorage.setItem(STORAGE_KEYS.QUIT_DATE, testQuitDate.toISOString());
    
    console.log(`📊 Progress Stats:`);
    console.log(`   🧠 Recovery: ${Math.round(recoveryPercentage)}% dopamine pathway recovery`);
    console.log(`   💰 Money Saved: $${testProgressData.moneySaved} (at $${dailyCost}/day)`);
    console.log(`   ⏰ Life Regained: ${testProgressData.lifeRegained} hours`);
    console.log(`   🚫 Units Avoided: ${testProgressData.unitsAvoided}`);
    console.log(`   💪 Cravings Resisted: ${testProgressData.cravingsResisted}`);
    
    // Update Supabase if user is logged in
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      console.log(`☁️  Syncing to Supabase...`);
      
      // Update user quit date
      await supabase
        .from('users')
        .update({ quit_date: testQuitDate.toISOString() })
        .eq('id', authUser.id);
      
      // Update user stats
      await supabase
        .from('user_stats')
        .upsert({
          user_id: authUser.id,
          days_clean: days,
          cravings_resisted: cravingsResisted,
          money_saved: testProgressData.moneySaved,
          health_score: testProgressData.healthScore,
          updated_at: new Date().toISOString(),
        });
      
      // Check and unlock achievements
      console.log(`🏆 Checking achievements...`);
      const unlockedAchievements = await achievementService.checkAndUnlockAchievements(authUser.id);
      if (unlockedAchievements.length > 0) {
        console.log(`   ✅ Unlocked ${unlockedAchievements.length} achievements!`);
        unlockedAchievements.forEach((a: any) => {
          console.log(`      - ${a.achievement_name}`);
        });
      } else {
        console.log(`   ℹ️  No new achievements unlocked`);
      }
      
      // Update milestones
      console.log(`🎯 Updating milestones...`);
      await achievementService.updateProgressMilestones(authUser.id);
    }
    
    // Trigger Redux to reload the data
    if (store) {
      console.log(`🔄 Updating Redux store...`);
      
      // First update the quit date in Redux
      store.dispatch(setQuitDate(testQuitDate.toISOString()));
      
      // Update user data in auth slice
      store.dispatch(updateUserData({ quitDate: testQuitDate.toISOString() }));
      
      // Give Redux a moment to process the updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Then load the stored progress
      await store.dispatch(loadStoredProgress());
      
      // Finally trigger a full update calculation
      await store.dispatch(updateProgress());
      
      // Give another moment for all updates to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log(`✅ Redux store updated - UI should reflect changes immediately`);
    }
    
    console.log(`\n✅ Progress test complete! Days set to: ${days}`);
    console.log(`🔄 The app UI should now show all updated values`);
    
    return testProgressData;
  } catch (error) {
    console.error('❌ Failed to set test days:', error);
  }
};

export const testProgressProgression = async () => {
  console.log('🧪 Testing Recovery Progress Stages...');
  console.log('=====================================');
  
  const testPeriods = [
    { days: 0, label: 'Day 0 (Start)' },
    { days: 1, label: 'Day 1' },
    { days: 3, label: 'Day 3' },
    { days: 7, label: '1 Week' },
    { days: 14, label: '2 Weeks' },
    { days: 21, label: '3 Weeks' },
    { days: 30, label: '1 Month' },
    { days: 60, label: '2 Months' },
    { days: 90, label: '3 Months' },
    { days: 180, label: '6 Months' },
    { days: 270, label: '9 Months' },
    { days: 365, label: '1 Year' },
    { days: 730, label: '2 Years' },
    { days: 1825, label: '5 Years' },
    { days: 3650, label: '10 Years' },
  ];
  
  for (const period of testPeriods) {
    const recoveryPercentage = Math.round(recoveryTrackingService.calculateDopamineRecovery(period.days));
    const message = getGrowthMessage(period.days);
    console.log(`${period.label}: ${recoveryPercentage}% recovery - "${message}"`);
  }
  
  console.log('=====================================');
  console.log('Use progressTest.setDays(X) to test any specific day');
};

const getGrowthMessage = (daysClean: number) => {
  if (daysClean === 0) return "Your brain is ready to begin healing";
  if (daysClean === 1) return "Dopamine pathways starting to rebalance";
  if (daysClean < 7) return "Reward circuits strengthening daily";
  if (daysClean < 30) return "Neural pathways rapidly recovering";
  if (daysClean < 90) return "Brain chemistry rebalancing significantly";
  return "Dopamine system largely restored";
};

// Quick test functions for common scenarios
export const setDay0 = () => setTestDaysClean(0);
export const setDay1 = () => setTestDaysClean(1);
export const setDay3 = () => setTestDaysClean(3);
export const setWeek1 = () => setTestDaysClean(7);
export const setWeek2 = () => setTestDaysClean(14);
export const setWeek3 = () => setTestDaysClean(21);
export const setMonth1 = () => setTestDaysClean(30);
export const setMonth2 = () => setTestDaysClean(60);
export const setMonth3 = () => setTestDaysClean(90);
export const setMonth6 = () => setTestDaysClean(180);
export const setMonth9 = () => setTestDaysClean(270);
export const setYear1 = () => setTestDaysClean(365);
export const setYear2 = () => setTestDaysClean(730);
export const setYear5 = () => setTestDaysClean(1825);
export const setYear10 = () => setTestDaysClean(3650);

// Reset to current time (Day 0)
export const resetToNow = async () => {
  try {
    // Set quit date to now
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      user.quitDate = new Date().toISOString();
      await AsyncStorage.setItem('user', JSON.stringify(user));
    }
    
    // Clear progress to force recalculation
    await AsyncStorage.removeItem('progress');
    console.log('🔄 Reset to current time (Day 0)');
    console.log('📱 Reload the app to see changes');
  } catch (error) {
    console.error('Failed to reset:', error);
  }
};

// Full app reset - clears EVERYTHING and returns to onboarding
export const fullReset = async () => {
  try {
    console.log('🔥 FULL RESET: Complete app reset for testing...');
    
    // Import the comprehensive reset function
    const { devReset } = await import('./appReset');
    
    // Run the full reset
    const success = await devReset();
    
    if (success) {
      console.log('✅ Full reset complete - app will restart to onboarding');
      console.log('🎯 Please restart the app manually to begin fresh');
      return true;
    } else {
      console.log('❌ Full reset failed');
      return false;
    }
  } catch (error) {
    console.error('Failed to perform full reset:', error);
    return false;
  }
};

// Add to global for easy console access
if (__DEV__) {
  // @ts-ignore
  global.progressTest = {
    // Core functions
    setDays: setTestDaysClean,
    setType: setNicotineType,
    progression: testProgressProgression,
    reset: resetToNow,
    
    // Nicotine type shortcuts
    cigarettes: () => setNicotineType('cigarettes'),
    vape: () => setNicotineType('vape'),
    pouches: () => setNicotineType('pouches'),
    dip: () => setNicotineType('chew_dip'),
    
    // Quick day functions
    day0: setDay0,
    day1: setDay1,
    day3: setDay3,
    
    // Week functions
    week1: setWeek1,
    week2: setWeek2,
    week3: setWeek3,
    
    // Month functions
    month1: setMonth1,
    month2: setMonth2,
    month3: setMonth3,
    month6: setMonth6,
    month9: setMonth9,
    
    // Year functions
    year1: setYear1,
    year2: setYear2,
    year5: setYear5,
    year10: setYear10,
  };
  
  console.log('🧪 Progress Test Functions Available:');
  console.log('progressTest.setDays(X) - Set specific days');
  console.log('progressTest.setType("cigarettes"|"vape"|"pouches"|"chew_dip") - Change nicotine type');
  console.log('progressTest.progression() - Show all recovery stages');
  console.log('progressTest.reset() - Reset to current time (Day 0)');
  console.log('');
  console.log('Nicotine Type Shortcuts:');
  console.log('progressTest.cigarettes() - Switch to cigarettes');
  console.log('progressTest.vape() - Switch to vaping');
  console.log('progressTest.pouches() - Switch to pouches');
  console.log('progressTest.dip() - Switch to dip/chew');
  console.log('');
  console.log('Quick Day Functions:');
  console.log('progressTest.day0() - Day 0 (start)');
  console.log('progressTest.day1() - Day 1');
  console.log('progressTest.day3() - Day 3');
  console.log('progressTest.week1() - 1 week');
  console.log('progressTest.week2() - 2 weeks');
  console.log('progressTest.week3() - 3 weeks');
  console.log('progressTest.month1() - 1 month');
  console.log('progressTest.month2() - 2 months');
  console.log('progressTest.month3() - 3 months');
  console.log('progressTest.month6() - 6 months');
  console.log('progressTest.month9() - 9 months');
  console.log('progressTest.year1() - 1 year');
  console.log('progressTest.year2() - 2 years');
  console.log('progressTest.year5() - 5 years');
  console.log('progressTest.year10() - 10 years');
} 