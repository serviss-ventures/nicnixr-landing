import inviteService from '../services/inviteService';
import { Alert } from 'react-native';

// Test functions for invite system
const inviteTest = {
  // Simulate creating an invite as User A
  async createTestInvite() {
    console.log('📤 Creating test invite...');
    const inviteData = await inviteService.createInvite(
      'userA123',
      'John D.',
      '🧙‍♂️',
      15
    );
    console.log('✅ Invite created:', inviteData.code);
    Alert.alert('Test Invite Created', `Code: ${inviteData.code}\n\nNow reset the app and use simulateReceiveInvite('${inviteData.code}')`);
    return inviteData.code;
  },

  // Simulate receiving an invite as User B
  async simulateReceiveInvite(inviteCode: string) {
    console.log('📥 Simulating invite receive:', inviteCode);
    await inviteService.storePendingInvite(inviteCode);
    console.log('✅ Invite stored. Restart app to see buddy request.');
    Alert.alert('Invite Received', 'Restart the app to see the buddy request from the inviter!');
  },

  // Show all active invites
  async showActiveInvites() {
    const activeInvites = await inviteService['getActiveInvites']();
    console.log('📋 Active invites:', activeInvites);
    const count = Object.keys(activeInvites).length;
    Alert.alert('Active Invites', `${count} active invite(s)\n\n${JSON.stringify(activeInvites, null, 2).slice(0, 200)}...`);
  },

  // Clear all invites
  async clearAllInvites() {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.removeItem('@nixr_active_invites');
    await AsyncStorage.removeItem('@nixr_pending_invite');
    console.log('🗑️ All invites cleared');
    Alert.alert('Invites Cleared', 'All invite data has been cleared.');
  },

  // Quick test flow
  async quickTest() {
    console.log('🚀 Starting quick invite test...');
    
    // Step 1: Create invite as User A
    const code = await this.createTestInvite();
    
    // Step 2: Instructions
    setTimeout(() => {
      Alert.alert(
        'Test Instructions',
        `1. Note the invite code: ${code}\n` +
        `2. Reset the app (appReset.dev())\n` +
        `3. Complete onboarding as a new user\n` +
        `4. Run: inviteTest.simulateReceiveInvite('${code}')\n` +
        `5. Go to Community > Buddies to see the request!`
      );
    }, 1000);
  }
};

// Make it globally available in development
if (__DEV__) {
  (global as any).inviteTest = inviteTest;
}

export default inviteTest; 