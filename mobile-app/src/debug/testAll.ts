import { setTestDaysClean, setNicotineType } from './progressTest';
import pushNotificationService from '../services/pushNotificationService';
import { achievementService } from '../services/achievementService';
import { supabase } from '../lib/supabase';

/**
 * Comprehensive test function to verify all systems are working
 */
export const testAllSystems = async () => {
  console.log('\n🧪 COMPREHENSIVE SYSTEM TEST');
  console.log('============================\n');
  
  const results = {
    supabase: false,
    progress: false,
    achievements: false,
    notifications: false,
    nicotineTypes: false,
  };
  
  try {
    // 1. Test Supabase Connection
    console.log('1️⃣ Testing Supabase Connection...');
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      console.log('   ✅ Supabase connected - User:', user.id);
      results.supabase = true;
    } else {
      console.log('   ⚠️  No user logged in');
    }
    
    // 2. Test Progress System
    console.log('\n2️⃣ Testing Progress System...');
    try {
      await setTestDaysClean(7);
      console.log('   ✅ Progress system working');
      results.progress = true;
    } catch (error) {
      console.log('   ❌ Progress system error:', error);
    }
    
    // 3. Test Achievement System
    console.log('\n3️⃣ Testing Achievement System...');
    if (user) {
      try {
        const achievements = await achievementService.getUserAchievements(user.id);
        console.log(`   ✅ Achievement system working - ${achievements.length} achievements found`);
        results.achievements = true;
      } catch (error) {
        console.log('   ❌ Achievement system error:', error);
      }
    } else {
      console.log('   ⏭️  Skipping (requires login)');
    }
    
    // 4. Test Notification System
    console.log('\n4️⃣ Testing Notification System...');
    try {
      const hasPermission = await pushNotificationService.hasNotificationPermission();
      if (hasPermission) {
        await pushNotificationService.sendImmediateNotification(
          'System Test',
          'All systems operational!'
        );
        console.log('   ✅ Notification system working');
        results.notifications = true;
      } else {
        console.log('   ⚠️  Notification permissions not granted');
      }
    } catch (error) {
      console.log('   ❌ Notification system error:', error);
    }
    
    // 5. Test Nicotine Type Switching
    console.log('\n5️⃣ Testing Nicotine Type Switching...');
    try {
      // Test each type
      const types = ['cigarettes', 'vape', 'pouches', 'chew_dip'] as const;
      for (const type of types) {
        await setNicotineType(type);
        console.log(`   ✅ Switched to ${type}`);
      }
      results.nicotineTypes = true;
    } catch (error) {
      console.log('   ❌ Nicotine type switching error:', error);
    }
    
    // Summary
    console.log('\n📊 TEST SUMMARY');
    console.log('================');
    const passed = Object.values(results).filter(r => r).length;
    const total = Object.keys(results).length;
    
    Object.entries(results).forEach(([system, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${system.charAt(0).toUpperCase() + system.slice(1)}`);
    });
    
    console.log(`\n🎯 Result: ${passed}/${total} systems operational`);
    
    if (passed === total) {
      console.log('🎉 All systems working perfectly!');
    } else if (passed >= total - 1) {
      console.log('👍 Most systems working, minor issues detected');
    } else {
      console.log('⚠️  Multiple systems need attention');
    }
    
  } catch (error) {
    console.error('❌ Test suite error:', error);
  }
};

// Quick test scenarios for tomorrow
export const testScenarios = {
  // Test Day 30 with cigarettes
  day30Cigarettes: async () => {
    console.log('\n🧪 TEST SCENARIO: Day 30 Cigarettes User');
    await setNicotineType('cigarettes');
    await setTestDaysClean(30);
    console.log('✅ Scenario set - check achievements and milestones');
  },
  
  // Test Day 7 with vape
  day7Vape: async () => {
    console.log('\n🧪 TEST SCENARIO: Day 7 Vape User');
    await setNicotineType('vape');
    await setTestDaysClean(7);
    console.log('✅ Scenario set - check achievements and milestones');
  },
  
  // Test Day 90 with pouches
  day90Pouches: async () => {
    console.log('\n🧪 TEST SCENARIO: Day 90 Pouches User');
    await setNicotineType('pouches');
    await setTestDaysClean(90);
    console.log('✅ Scenario set - check achievements and milestones');
  },
  
  // Test Day 365 with dip
  yearDip: async () => {
    console.log('\n🧪 TEST SCENARIO: 1 Year Dip User');
    await setNicotineType('chew_dip');
    await setTestDaysClean(365);
    console.log('✅ Scenario set - check achievements and milestones');
  },
};

// Add to global for easy access
if (__DEV__) {
  (global as any).testAll = testAllSystems;
  (global as any).testScenarios = testScenarios;
  
  console.log('🧪 System Test Functions Available:');
  console.log('testAll() - Run comprehensive system test');
  console.log('testScenarios.day30Cigarettes() - Test 30 days with cigarettes');
  console.log('testScenarios.day7Vape() - Test 7 days with vaping');
  console.log('testScenarios.day90Pouches() - Test 90 days with pouches');
  console.log('testScenarios.yearDip() - Test 1 year with dip');
}

export default testAllSystems; 