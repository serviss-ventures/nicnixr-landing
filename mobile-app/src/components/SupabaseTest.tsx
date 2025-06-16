import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';

export function SupabaseTest() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [userCount, setUserCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setStatus('loading');
    setError(null);
    
    try {
      // Test 1: Check if we can connect
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw new Error(countError.message);
      }

      setUserCount(count || 0);
      setStatus('connected');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <View style={{ padding: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, margin: 20 }}>
      <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 10 }}>
        Supabase Connection Test
      </Text>
      
      {status === 'loading' && (
        <ActivityIndicator color="white" />
      )}
      
      {status === 'connected' && (
        <View>
          <Text style={{ color: '#4ade80', fontSize: 16 }}>
            ✅ Connected to Supabase!
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 5 }}>
            Users in database: {userCount}
          </Text>
        </View>
      )}
      
      {status === 'error' && (
        <View>
          <Text style={{ color: '#f87171', fontSize: 16 }}>
            ❌ Connection Error
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 5 }}>
            {error}
          </Text>
        </View>
      )}
      
      <TouchableOpacity 
        onPress={testConnection}
        style={{ 
          marginTop: 15, 
          backgroundColor: 'rgba(192, 132, 252, 0.2)', 
          padding: 10, 
          borderRadius: 8,
          alignItems: 'center'
        }}
      >
        <Text style={{ color: 'white' }}>Test Again</Text>
      </TouchableOpacity>
    </View>
  );
} 