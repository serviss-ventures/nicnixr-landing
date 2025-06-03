import { User } from '../types';

// Buddy-specific interface that extends user data
export interface BuddyProfile {
  id: string;
  userId: string; // Links to User.id
  name: string;
  avatar: string;
  daysClean: number;
  product: string;
  bio: string;
  supportStyles: string[]; // Array to support multiple styles
  lastActive: Date;
  status: 'online' | 'offline' | 'in-crisis';
  connectionStatus: 'connected' | 'pending-sent' | 'pending-received' | 'not-connected';
  connectionDate?: Date;
  matchScore?: number;
}

// Service to manage buddy data
class BuddyService {
  // Convert User to BuddyProfile
  static userToBuddyProfile(user: User, connectionStatus: BuddyProfile['connectionStatus'] = 'not-connected'): BuddyProfile {
    return {
      id: `buddy-${user.id}`,
      userId: user.id,
      name: user.isAnonymous ? user.displayName || 'Anonymous' : user.username,
      avatar: user.avatar || '👤',
      daysClean: this.calculateDaysClean(user.quitDate),
      product: user.nicotineProduct.name,
      bio: user.bio || '',
      supportStyles: user.supportStyles || [],
      lastActive: new Date(), // Would come from backend
      status: 'online', // Would come from backend
      connectionStatus,
      matchScore: this.calculateMatchScore(user),
    };
  }

  // Calculate days clean from quit date
  static calculateDaysClean(quitDate: string): number {
    const quit = new Date(quitDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - quit.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Calculate match score based on various factors
  static calculateMatchScore(user: User): number {
    // This is a simplified version - in production, this would be more sophisticated
    let score = 50; // Base score

    // Similar quit timeframe bonus
    const daysClean = this.calculateDaysClean(user.quitDate);
    if (daysClean >= 5 && daysClean <= 15) score += 20;

    // Has support styles defined
    if (user.supportStyles && user.supportStyles.length > 0) score += 15;

    // Has bio
    if (user.bio && user.bio.length > 20) score += 15;

    return Math.min(score, 100);
  }

  // Get potential buddy matches (would be API call in production)
  static async getPotentialMatches(currentUser: User): Promise<BuddyProfile[]> {
    // In production, this would be an API call that returns matched users
    // For now, we'll simulate with mock data that follows the proper structure
    
    // Mock users that would come from backend
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'sarah@example.com',
        username: 'SarahM',
        displayName: 'Sarah M.',
        bio: 'Mom of 2, quit vaping for my kids. Love hiking and coffee chats! Looking for someone to check in with daily.',
        supportStyles: ['motivator', 'listener'],
        firstName: 'Sarah',
        lastName: 'Mitchell',
        dateJoined: '2024-01-15',
        quitDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        nicotineProduct: { id: 'vape', name: 'vaping', avgCostPerDay: 10, nicotineContent: 20, category: 'vape', harmLevel: 7 },
        dailyCost: 10,
        packagesPerDay: 1,
        motivationalGoals: ['health', 'family'],
        avatar: '🦸‍♀️',
        isAnonymous: false,
      },
      {
        id: '2',
        email: 'mike@example.com',
        username: 'MikeR',
        displayName: 'Mike R.',
        bio: 'Software dev, using coding to distract from cravings. Need accountability partner for late night struggles.',
        supportStyles: ['analytical', 'tough-love'],
        firstName: 'Mike',
        lastName: 'Rodriguez',
        dateJoined: '2024-01-20',
        quitDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        nicotineProduct: { id: 'pouches', name: 'pouches', avgCostPerDay: 8, nicotineContent: 15, category: 'other', harmLevel: 5 },
        dailyCost: 8,
        packagesPerDay: 2,
        motivationalGoals: ['health', 'productivity'],
        avatar: '🧙‍♂️',
        isAnonymous: false,
      },
      {
        id: '3',
        email: 'jessica@example.com',
        username: 'JessicaK',
        displayName: 'Jessica K.',
        bio: 'Just hit 30 days! Want to help others through their first month. Daily check-ins are my secret weapon.',
        supportStyles: ['listener', 'motivator', 'mentor'],
        firstName: 'Jessica',
        lastName: 'Kim',
        dateJoined: '2024-01-01',
        quitDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        nicotineProduct: { id: 'vape', name: 'vaping', avgCostPerDay: 12, nicotineContent: 25, category: 'vape', harmLevel: 7 },
        dailyCost: 12,
        packagesPerDay: 1,
        motivationalGoals: ['health', 'money', 'freedom'],
        avatar: '👩',
        isAnonymous: false,
      }
    ];

    // Convert to BuddyProfiles with proper connection status
    return mockUsers.map(user => this.userToBuddyProfile(user, 'not-connected'));
  }

  // Get connected buddies
  static async getConnectedBuddies(userId: string): Promise<BuddyProfile[]> {
    // In production, this would fetch from backend
    // For now, return empty array
    return [];
  }

  // Send buddy request
  static async sendBuddyRequest(fromUserId: string, toBuddyId: string): Promise<boolean> {
    // In production, this would be an API call
    console.log(`Sending buddy request from ${fromUserId} to ${toBuddyId}`);
    return true;
  }

  // Accept buddy request
  static async acceptBuddyRequest(userId: string, buddyId: string): Promise<boolean> {
    // In production, this would be an API call
    console.log(`Accepting buddy request for ${userId} from ${buddyId}`);
    return true;
  }

  // Decline buddy request
  static async declineBuddyRequest(userId: string, buddyId: string): Promise<boolean> {
    // In production, this would be an API call
    console.log(`Declining buddy request for ${userId} from ${buddyId}`);
    return true;
  }
}

export default BuddyService; 