import { Platform } from 'react-native';
import * as Device from 'expo-device';

export async function testAICoachConnection() {
  console.log('Testing AI Coach API connection...');
  console.log('Platform:', Platform.OS);
  console.log('Is Device:', Device.isDevice);
  
  // Determine the correct API URL
  let API_URL = process.env.EXPO_PUBLIC_ADMIN_API_URL;
  
  if (!API_URL && __DEV__) {
    if (Platform.OS === 'ios' && !Device.isDevice) {
      API_URL = 'http://localhost:3000';
    } else if (Platform.OS === 'android' && !Device.isDevice) {
      API_URL = 'http://10.0.2.2:3000';
    } else {
      API_URL = 'http://192.168.1.171:3000';
    }
  }
  
  console.log('Using API URL:', API_URL);
  
  try {
    // Test health endpoint first
    const healthResponse = await fetch(`${API_URL}/api/health`);
    console.log('Health check status:', healthResponse.status);
    
    // Test AI coach endpoint
    const testMessage = {
      message: "Hello, just testing the connection",
      userId: "test-user-id",
      sessionId: "test-session-id",
      conversationHistory: []
    };
    
    const response = await fetch(`${API_URL}/api/ai-coach/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage),
    });
    
    console.log('AI Coach API status:', response.status);
    const data = await response.text();
    console.log('AI Coach API response:', data);
    
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    console.error('Connection test failed:', error);
    return { success: false, error: error.message };
  }
} 