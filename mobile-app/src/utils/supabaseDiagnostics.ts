import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const runSupabaseDiagnostics = async () => {
  console.log('🔍 Running Supabase Diagnostics...\n');
  
  const diagnostics = {
    envVars: {
      url: !!process.env.EXPO_PUBLIC_SUPABASE_URL,
      key: !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      urlValue: process.env.EXPO_PUBLIC_SUPABASE_URL?.substring(0, 40) + '...',
    },
    auth: {
      status: 'unknown',
      user: null as any,
      error: null as any,
    },
    database: {
      status: 'unknown',
      error: null as any,
    },
    network: {
      status: 'unknown',
      error: null as any,
    },
    storage: {
      hasSession: false,
      sessionData: null as any,
    }
  };
  
  // 1. Check environment variables
  console.log('1️⃣ Environment Variables:');
  console.log('   URL configured:', diagnostics.envVars.url);
  console.log('   Key configured:', diagnostics.envVars.key);
  console.log('   URL value:', diagnostics.envVars.urlValue);
  
  // 2. Check stored session
  try {
    const session = await AsyncStorage.getItem('supabase.auth.token');
    diagnostics.storage.hasSession = !!session;
    console.log('\n2️⃣ Stored Session:', diagnostics.storage.hasSession ? '✅ Found' : '❌ Not found');
  } catch (error) {
    console.log('\n2️⃣ Stored Session: ❌ Error reading storage');
  }
  
  // 3. Test auth connection
  console.log('\n3️⃣ Auth Connection:');
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      diagnostics.auth.status = 'error';
      diagnostics.auth.error = error.message;
      console.log('   Status: ❌ Error');
      console.log('   Error:', error.message);
    } else {
      diagnostics.auth.status = 'connected';
      diagnostics.auth.user = user?.id || 'anonymous';
      console.log('   Status: ✅ Connected');
      console.log('   User:', user?.id || 'Not authenticated');
    }
  } catch (error: any) {
    diagnostics.auth.status = 'network_error';
    diagnostics.auth.error = error.message;
    console.log('   Status: ❌ Network Error');
    console.log('   Error:', error.message);
  }
  
  // 4. Test database connection
  console.log('\n4️⃣ Database Connection:');
  try {
    const { error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      diagnostics.database.status = 'error';
      diagnostics.database.error = error.message;
      console.log('   Status: ❌ Error');
      console.log('   Error:', error.message);
    } else {
      diagnostics.database.status = 'connected';
      console.log('   Status: ✅ Connected');
    }
  } catch (error: any) {
    diagnostics.database.status = 'network_error';
    diagnostics.database.error = error.message;
    console.log('   Status: ❌ Network Error');
    console.log('   Error:', error.message);
  }
  
  // 5. Test network connectivity to Supabase URL
  console.log('\n5️⃣ Network Test:');
  if (process.env.EXPO_PUBLIC_SUPABASE_URL) {
    try {
      const response = await fetch(process.env.EXPO_PUBLIC_SUPABASE_URL + '/rest/v1/', {
        method: 'GET',
        headers: {
          'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
        },
      });
      
      diagnostics.network.status = response.ok ? 'connected' : 'error';
      console.log('   Status:', response.ok ? '✅ Connected' : '❌ Failed');
      console.log('   Response status:', response.status);
    } catch (error: any) {
      diagnostics.network.status = 'network_error';
      diagnostics.network.error = error.message;
      console.log('   Status: ❌ Network Error');
      console.log('   Error:', error.message);
    }
  } else {
    console.log('   Status: ❌ No URL configured');
  }
  
  // Summary
  console.log('\n📊 Summary:');
  const issues = [];
  
  if (!diagnostics.envVars.url || !diagnostics.envVars.key) {
    issues.push('Environment variables not loaded - restart Expo with --clear flag');
  }
  
  if (diagnostics.auth.status === 'network_error' || diagnostics.database.status === 'network_error') {
    issues.push('Network connection failed - check internet/firewall/VPN');
  }
  
  if (diagnostics.auth.error?.includes('JWT')) {
    issues.push('Authentication token issue - may need to sign in again');
  }
  
  if (issues.length === 0) {
    console.log('   ✅ All systems operational!');
  } else {
    console.log('   ⚠️  Issues found:');
    issues.forEach(issue => console.log('      -', issue));
  }
  
  console.log('\n💡 Troubleshooting tips:');
  console.log('   1. Run: cd mobile-app && npx expo start --clear');
  console.log('   2. Check if Supabase project is active (not paused)');
  console.log('   3. If on device, ensure it can reach your Supabase URL');
  console.log('   4. Try signing out and back in if auth issues persist');
  
  return diagnostics;
}; 