import AsyncStorage from '@react-native-async-storage/async-storage';

interface InviteData {
  code: string;
  inviterId: string;
  inviterName: string;
  inviterAvatar: string;
  inviterDaysClean: number;
  createdAt: Date;
  expiresAt: Date;
}

interface PendingInvite {
  inviteCode: string;
  inviterData: InviteData;
}

const INVITE_STORAGE_KEY = '@nixr_pending_invite';
const ACTIVE_INVITES_KEY = '@nixr_active_invites';

class InviteService {
  // Generate a unique invite code
  generateInviteCode(): string {
    return `NIXR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }

  // Create an invite (would normally hit backend)
  async createInvite(userId: string, userName: string, userAvatar: string, daysClean: number): Promise<InviteData> {
    const code = this.generateInviteCode();
    const inviteData: InviteData = {
      code,
      inviterId: userId,
      inviterName: userName,
      inviterAvatar: userAvatar,
      inviterDaysClean: daysClean,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };

    // Store active invites (in production, this would be backend)
    const activeInvites = await this.getActiveInvites();
    activeInvites[code] = inviteData;
    await AsyncStorage.setItem(ACTIVE_INVITES_KEY, JSON.stringify(activeInvites));

    return inviteData;
  }

  // Store a pending invite when user clicks invite link
  async storePendingInvite(inviteCode: string): Promise<void> {
    // In production, validate with backend
    const activeInvites = await this.getActiveInvites();
    const inviteData = activeInvites[inviteCode];
    
    if (inviteData && new Date(inviteData.expiresAt) > new Date()) {
      const pendingInvite: PendingInvite = {
        inviteCode,
        inviterData: inviteData,
      };
      await AsyncStorage.setItem(INVITE_STORAGE_KEY, JSON.stringify(pendingInvite));
    }
  }

  // Get pending invite (called after signup)
  async getPendingInvite(): Promise<PendingInvite | null> {
    try {
      const data = await AsyncStorage.getItem(INVITE_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  // Clear pending invite after processing
  async clearPendingInvite(): Promise<void> {
    await AsyncStorage.removeItem(INVITE_STORAGE_KEY);
  }

  // Get all active invites (mock backend storage)
  private async getActiveInvites(): Promise<Record<string, InviteData>> {
    try {
      const data = await AsyncStorage.getItem(ACTIVE_INVITES_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  // Process invite after user completes onboarding
  async processInviteConnection(inviteCode: string, newUserId: string): Promise<{
    success: boolean;
    inviterData?: InviteData;
    error?: string;
  }> {
    const activeInvites = await this.getActiveInvites();
    const inviteData = activeInvites[inviteCode];

    if (!inviteData) {
      return { success: false, error: 'Invalid invite code' };
    }

    if (new Date(inviteData.expiresAt) < new Date()) {
      return { success: false, error: 'Invite code expired' };
    }

    // In production, this would create a buddy request on the backend
    // For now, we'll return success and let the app handle the connection
    return { success: true, inviterData: inviteData };
  }
}

export default new InviteService(); 