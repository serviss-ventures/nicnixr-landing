import AsyncStorage from '@react-native-async-storage/async-storage';
import recoveryTrackingService from '../services/recoveryTrackingService';

export const setTestDaysClean = async (days: number) => {
  try {
    // Calculate realistic progress metrics based on days clean using unified service
    const recoveryPercentage = recoveryTrackingService.calculateDopamineRecovery(days);
    const healthScore = Math.min(10 + (days * 1.2), 100);
    const moneySaved = days * 6; // Assuming $6 per day saved (nicotine pouches)
    const lifeRegained = days * 0.3; // Hours of life regained
    const unitsAvoided = days * 50; // 50 pouches per day
    
    const testProgressData = {
      daysClean: days,
      hoursClean: days * 24,
      healthScore: Math.round(healthScore),
      moneySaved: Math.round(moneySaved),
      lifeRegained: Math.round(lifeRegained * 10) / 10, // Round to 1 decimal
      unitsAvoided: unitsAvoided,
      lastUpdate: new Date().toISOString(),
    };

    await AsyncStorage.setItem('progress', JSON.stringify(testProgressData));
    
    console.log(`🧪 Test: Set to ${days} days clean`);
    console.log(`🧠 Neural Recovery: ${Math.round(recoveryPercentage)}% dopamine pathway recovery`);
    console.log(`💰 Money Saved: $${testProgressData.moneySaved}`);
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
} 