import AsyncStorage from '@react-native-async-storage/async-storage';

export const setTestDaysClean = async (days: number) => {
  try {
    const testProgressData = {
      daysClean: days,
      healthScore: Math.min(50 + (days * 2), 100),
      moneySaved: days * 12.50, // Assuming $12.50 per day saved
      lifeRegained: days * 0.5, // Half hour per day
      cigarettesAvoided: days * 20, // 20 cigarettes per day
      lastUpdate: new Date().toISOString(),
    };

    await AsyncStorage.setItem('progress', JSON.stringify(testProgressData));
    console.log(`🧪 Test: Set days clean to ${days}`);
    console.log(`📊 Neural connections: ${Math.min(5 + Math.floor(days * 0.8), 50)}`);
    
    // Force reload the app to see changes
    // In development, the user can manually reload
    return testProgressData;
  } catch (error) {
    console.error('Failed to set test days:', error);
  }
};

export const testNeuralGrowthProgression = async () => {
  console.log('🧪 Testing Neural Growth Progression...');
  
  const testDays = [0, 1, 3, 7, 14, 30, 60, 90, 120];
  
  for (const days of testDays) {
    const connections = Math.min(5 + Math.floor(days * 0.8), 50);
    const message = getGrowthMessage(days);
    console.log(`Day ${days}: ${connections} connections - "${message}"`);
  }
};

const getGrowthMessage = (daysClean: number) => {
  if (daysClean === 0) return "Starting your neural recovery journey";
  if (daysClean === 1) return "First healthy pathways forming";
  if (daysClean < 7) return "Building stronger connections daily";
  if (daysClean < 30) return "Neural network expanding rapidly";
  if (daysClean < 90) return "Brain chemistry rebalancing";
  return "Neural pathways fully restored";
};

// Quick test functions for common scenarios
export const setDay1 = () => setTestDaysClean(1);
export const setWeek1 = () => setTestDaysClean(7);
export const setMonth1 = () => setTestDaysClean(30);
export const setMonth3 = () => setTestDaysClean(90);

// Add to global for easy console access
if (__DEV__) {
  // @ts-ignore
  global.neuralTest = {
    setDays: setTestDaysClean,
    day1: setDay1,
    week1: setWeek1,
    month1: setMonth1,
    month3: setMonth3,
    progression: testNeuralGrowthProgression,
  };
  
  console.log('🧪 Neural Growth Test Functions Available:');
  console.log('neuralTest.setDays(X) - Set specific days');
  console.log('neuralTest.day1() - Set to day 1');
  console.log('neuralTest.week1() - Set to 1 week');
  console.log('neuralTest.month1() - Set to 1 month');
  console.log('neuralTest.month3() - Set to 3 months');
  console.log('neuralTest.progression() - Show all growth stages');
} 