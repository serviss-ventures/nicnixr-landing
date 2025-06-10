import AsyncStorage from '@react-native-async-storage/async-storage';
import recoveryTrackingService from '../services/recoveryTrackingService';
import { STORAGE_KEYS } from '../constants/app';
import { store } from '../store/store';
import { loadStoredProgress, updateProgress, setQuitDate } from '../store/slices/progressSlice';
import { updateUserData } from '../store/slices/authSlice';

export const setTestDaysClean = async (days: number) => {
  try {
    // Get user data to calculate with their actual daily cost
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    let dailyCost = 15; // Default fallback
    let dailyAmount = 20; // Default fallback
    
    if (userData) {
      const user = JSON.parse(userData);
      dailyCost = user.dailyCost || 15;
      
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
            // dailyAmount is now tins per day, convert to portions (5 portions per tin)
            const tinsPerDay = user.dailyAmount || 0.7;
            dailyAmount = tinsPerDay * 5;
            break;
          default:
            dailyAmount = user.dailyAmount || 10;
        }
      }
    }
    
    // Calculate realistic progress metrics based on days clean using unified service
    const recoveryPercentage = recoveryTrackingService.calculateDopamineRecovery(days);
    const healthScore = Math.min(10 + (days * 1.2), 100);
    const moneySaved = days * dailyCost; // Use actual daily cost
    const unitsAvoided = days * dailyAmount; // Use actual daily amount
    const lifeRegained = (unitsAvoided * 7) / 60; // Average 7 minutes per unit, converted to hours
    
    const testProgressData = {
      daysClean: days,
      hoursClean: days * 24,
      minutesClean: days * 24 * 60,
      secondsClean: days * 24 * 60 * 60,
      healthScore: Math.round(healthScore),
      moneySaved: Math.round(moneySaved * 100) / 100, // Round to 2 decimals
      lifeRegained: Math.round(lifeRegained * 10) / 10, // Round to 1 decimal
      unitsAvoided: Math.round(unitsAvoided),
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
    
    console.log(`🧪 Test: Set to ${days} days clean`);
    console.log(`🧠 Neural Recovery: ${Math.round(recoveryPercentage)}% dopamine pathway recovery`);
    console.log(`💰 Money Saved: $${testProgressData.moneySaved} (at $${dailyCost}/day)`);
    console.log(`⏰ Life Regained: ${testProgressData.lifeRegained} hours`);
    console.log(`🚫 Units Avoided: ${testProgressData.unitsAvoided}`);
    
    // Log unified recovery data for validation
    setTimeout(() => {
      try {
        recoveryTrackingService.logRecoveryData('Neural Test');
        recoveryTrackingService.validateRecoveryData();
      } catch (error) {
        console.warn('⚠️ Recovery service validation failed:', error);
      }
    }, 100);
    
    // Trigger Redux to reload the data - THIS IS THE KEY FIX
    if (store) {
      console.log('🔄 Updating Redux store...');
      
      // Log current state before update
      const currentState = store.getState();
      console.log('📊 Current progress state:', {
        daysClean: currentState.progress.stats?.daysClean,
        moneySaved: currentState.progress.stats?.moneySaved,
        lastUpdated: currentState.progress.lastUpdated
      });
      
      // First update the quit date in Redux
      store.dispatch(setQuitDate(testQuitDate.toISOString()));
      
      // Update user data in auth slice
      store.dispatch(updateUserData({ quitDate: testQuitDate.toISOString() }));
      
      // Give Redux a moment to process the updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Then load the stored progress
      const loadResult = await store.dispatch(loadStoredProgress());
      console.log('📥 Load stored progress result:', loadResult.type);
      
      // Finally trigger a full update calculation
      const updateResult = await store.dispatch(updateProgress());
      console.log('🔄 Update progress result:', updateResult.type);
      
      // Give another moment for all updates to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Log state after update
      const newState = store.getState();
      console.log('📊 New progress state:', {
        daysClean: newState.progress.stats?.daysClean,
        moneySaved: newState.progress.stats?.moneySaved,
        lastUpdated: newState.progress.lastUpdated
      });
      
      console.log('✅ Redux store updated - UI should reflect changes immediately');
    } else {
      console.log('⚠️ Redux store not available - you may need to refresh the app');
    }
    
    return testProgressData;
  } catch (error) {
    console.error('Failed to set test days:', error);
  }
};

export const testNeuralGrowthProgression = async () => {
  console.log('🧪 Testing Neural Growth Progression...');
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
  console.log('Use neuralTest.setDays(X) to test any specific day');
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

// Add to global for easy console access
if (__DEV__) {
  // @ts-ignore
  global.neuralTest = {
    // Core functions
    setDays: setTestDaysClean,
    progression: testNeuralGrowthProgression,
    reset: resetToNow,
    
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
  
  console.log('🧪 Neural Growth Test Functions Available:');
  console.log('neuralTest.setDays(X) - Set specific days');
  console.log('neuralTest.progression() - Show all growth stages');
  console.log('neuralTest.reset() - Reset to current time (Day 0)');
  console.log('');
  console.log('Quick Functions:');
  console.log('neuralTest.day0() - Day 0 (start)');
  console.log('neuralTest.day1() - Day 1');
  console.log('neuralTest.day3() - Day 3');
  console.log('neuralTest.week1() - 1 week');
  console.log('neuralTest.week2() - 2 weeks');
  console.log('neuralTest.week3() - 3 weeks');
  console.log('neuralTest.month1() - 1 month');
  console.log('neuralTest.month2() - 2 months');
  console.log('neuralTest.month3() - 3 months');
  console.log('neuralTest.month6() - 6 months');
  console.log('neuralTest.month9() - 9 months');
  console.log('neuralTest.year1() - 1 year');
  console.log('neuralTest.year2() - 2 years');
  console.log('neuralTest.year5() - 5 years');
  console.log('neuralTest.year10() - 10 years');
} 