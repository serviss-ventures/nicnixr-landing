import AsyncStorage from '@react-native-async-storage/async-storage';

export const quickReset = async () => {
  try {
    await AsyncStorage.clear();
    console.log('🔄 Quick reset completed - all data cleared');
    // Force app reload
    if (__DEV__) {
      // In development, we can use this to reload
      console.log('💡 Please reload the app manually');
    }
  } catch (error) {
    console.error('❌ Quick reset failed:', error);
  }
};

// Make it globally available in development
if (__DEV__) {
  (global as any).quickReset = quickReset;
}

export default quickReset; 