import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { COLORS } from '../constants/theme';

export const testSupabaseConnection = async () => {
  console.log('Testing Supabase connection...');
  
  try {
    // Check if environment variables are loaded
    console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...');
    console.log('Supabase Key exists:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
    
    // Test auth connection
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('Auth check failed:', authError.message);
    } else {
      console.log('Auth check passed. User:', user?.id || 'Not authenticated');
    }
    
    // Test database connection
    const { data, error: dbError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (dbError) {
      console.log('Database test failed:', dbError.message);
      return { success: false, error: dbError.message };
    }
    
    console.log('Supabase connection successful!');
    return { success: true, message: 'Connection successful' };
    
  } catch (error: any) {
    console.error('Supabase connection error:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
};

const SupabaseTest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleTest = async () => {
    setTesting(true);
    setResult('Testing...');
    
    const testResult = await testSupabaseConnection();
    
    if (testResult.success) {
      setResult('✅ Connection successful!');
      Alert.alert('Success', 'Supabase is connected and working!');
    } else {
      setResult(`❌ Connection failed: ${testResult.error}`);
      Alert.alert('Connection Failed', testResult.error || 'Unknown error');
    }
    
    setTesting(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supabase Connection Test</Text>
      <Button 
        title="Test Connection" 
        onPress={handleTest}
        disabled={testing}
      />
      {result !== '' && (
        <Text style={styles.result}>{result}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    margin: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  result: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default SupabaseTest; 