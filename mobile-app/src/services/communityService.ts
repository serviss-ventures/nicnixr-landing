/**
 * Community Service
 * Handles all community-related data operations, API calls, and business logic
 */

export interface CelebrationPost {
  id: string;
  username: string;
  milestone: string;
  message: string;
  timestamp: string;
  cheers: number;
  highFives: number;
  userReacted: boolean;
  daysClean: number;
  reactions?: UserReaction[];
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'mindfulness' | 'physical' | 'replacement' | 'support';
  duration: number; // days
  participants: number;
  joined: boolean;
  progress: number; // percentage
  icon: string;
  color: string;
  startDate: string;
  endDate: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

export interface UserReaction {
  userId: string;
  type: 'cheer' | 'highFive';
  timestamp: string;
}

export interface MilestoneDefinition {
  days: number;
  text: string;
  description: string;
  badge: string;
  color: string;
}

export class CommunityService {
  private static instance: CommunityService;
  
  // Mock data - in production this would come from API
  private celebrations: CelebrationPost[] = [
    {
      id: '1',
      username: 'WarriorSarah',
      milestone: '30 Days Free',
      message: 'I can\'t believe I made it to 30 days! The cravings are getting easier and I feel so much more energetic. Thank you all for the support! 💪',
      timestamp: '2 hours ago',
      cheers: 24,
      highFives: 18,
      userReacted: false,
      daysClean: 30
    },
    {
      id: '2',
      username: 'MindfulMike',
      milestone: '7 Days Strong',
      message: 'Week one down! The mindfulness challenge really helped me get through the tough moments. Onto week two!',
      timestamp: '5 hours ago',
      cheers: 15,
      highFives: 12,
      userReacted: true,
      daysClean: 7
    },
    {
      id: '3',
      username: 'FreedomFinn',
      milestone: '100 Days Free',
      message: 'Triple digits! 🎉 To anyone just starting - it gets so much better. Take it one day at a time.',
      timestamp: '1 day ago',
      cheers: 89,
      highFives: 67,
      userReacted: false,
      daysClean: 100
    },
    {
      id: '4',
      username: 'StrongSarah',
      milestone: '24 Hours Free',
      message: 'Made it through my first day! It was tough but I kept thinking about my kids. One day at a time! 🌟',
      timestamp: '3 hours ago',
      cheers: 45,
      highFives: 38,
      userReacted: false,
      daysClean: 1
    },
    {
      id: '5',
      username: 'BreatheEasy',
      milestone: '6 Months Free',
      message: 'Half a year without cigarettes! My lung capacity is amazing now. I can run up stairs without getting winded. Keep going everyone! 🫁',
      timestamp: '8 hours ago',
      cheers: 127,
      highFives: 89,
      userReacted: true,
      daysClean: 180
    }
  ];

  private challenges: Challenge[] = [
    {
      id: '1',
      title: '7-Day Mindfulness Challenge',
      description: 'Practice 5 minutes of meditation daily to build mental resilience and reduce stress triggers',
      type: 'mindfulness',
      duration: 7,
      participants: 234,
      joined: true,
      progress: 71,
      icon: 'leaf-outline',
      color: '#10B981',
      startDate: '2025-01-18',
      endDate: '2025-01-25',
      difficulty: 'beginner',
      tags: ['meditation', 'stress-relief', 'mental-health']
    },
    {
      id: '2',
      title: 'Replace Cravings with Walks',
      description: 'Take a 10-minute walk every time you feel a craving. Fresh air and movement help reset your mind',
      type: 'replacement',
      duration: 14,
      participants: 156,
      joined: false,
      progress: 0,
      icon: 'walk-outline',
      color: '#3B82F6',
      startDate: '2025-01-20',
      endDate: '2025-02-03',
      difficulty: 'beginner',
      tags: ['exercise', 'craving-management', 'outdoor']
    },
    {
      id: '3',
      title: 'Gratitude Warriors',
      description: 'Share one thing you\'re grateful for in recovery each day. Positive thinking rewires your brain',
      type: 'support',
      duration: 21,
      participants: 89,
      joined: true,
      progress: 38,
      icon: 'heart-outline',
      color: '#EF4444',
      startDate: '2025-01-15',
      endDate: '2025-02-05',
      difficulty: 'beginner',
      tags: ['gratitude', 'positivity', 'mental-health']
    },
    {
      id: '4',
      title: 'Strength Builder',
      description: '15 minutes of physical activity to boost natural endorphins and replace nicotine\'s mood boost',
      type: 'physical',
      duration: 10,
      participants: 78,
      joined: false,
      progress: 0,
      icon: 'fitness-outline',
      color: '#F59E0B',
      startDate: '2025-01-22',
      endDate: '2025-02-01',
      difficulty: 'intermediate',
      tags: ['fitness', 'endorphins', 'strength']
    },
    {
      id: '5',
      title: 'Digital Detox Evening',
      description: 'Replace evening smoking ritual with phone-free time. Read, stretch, or journal instead',
      type: 'replacement',
      duration: 14,
      participants: 67,
      joined: false,
      progress: 0,
      icon: 'phone-off-outline',
      color: '#8B5CF6',
      startDate: '2025-01-25',
      endDate: '2025-02-08',
      difficulty: 'intermediate',
      tags: ['digital-wellness', 'evening-routine', 'mindfulness']
    },
    {
      id: '6',
      title: 'Morning Victory Routine',
      description: 'Start each day with a 10-minute routine that makes you feel accomplished before noon',
      type: 'replacement',
      duration: 21,
      participants: 145,
      joined: true,
      progress: 14,
      icon: 'sunny-outline',
      color: '#F97316',
      startDate: '2025-01-12',
      endDate: '2025-02-02',
      difficulty: 'beginner',
      tags: ['morning-routine', 'productivity', 'self-care']
    }
  ];

  public static getInstance(): CommunityService {
    if (!CommunityService.instance) {
      CommunityService.instance = new CommunityService();
    }
    return CommunityService.instance;
  }

  // Milestone definitions
  public getMilestoneDefinitions(): MilestoneDefinition[] {
    return [
      { days: 1, text: '24 Hours Free', description: 'Your first victory!', badge: '🌟', color: '#10B981' },
      { days: 3, text: '3 Days Strong', description: 'Building momentum', badge: '💪', color: '#3B82F6' },
      { days: 7, text: '1 Week Warrior', description: 'One week of freedom!', badge: '🏆', color: '#8B5CF6' },
      { days: 14, text: '2 Weeks Free', description: 'Two weeks of progress', badge: '🚀', color: '#EF4444' },
      { days: 30, text: '1 Month Champion', description: 'A full month of recovery', badge: '👑', color: '#F59E0B' },
      { days: 60, text: '2 Months Free', description: 'Sixty days of strength', badge: '🎯', color: '#06B6D4' },
      { days: 90, text: '3 Months Free', description: 'Quarter year achievement', badge: '🏅', color: '#84CC16' },
      { days: 180, text: '6 Months Free', description: 'Half year milestone', badge: '💎', color: '#A855F7' },
      { days: 365, text: '1 Year Smoke-Free', description: 'A full year of freedom!', badge: '🏆', color: '#F43F5E' }
    ];
  }

  // Get current milestone for user
  public getCurrentMilestone(daysClean: number): MilestoneDefinition {
    const milestones = this.getMilestoneDefinitions();
    const currentMilestone = milestones
      .filter(m => daysClean >= m.days)
      .pop();
    
    return currentMilestone || { 
      days: daysClean, 
      text: `${daysClean} Days Free`, 
      description: 'Every day is a victory',
      badge: '⭐',
      color: '#10B981'
    };
  }

  // Get next milestone for user
  public getNextMilestone(daysClean: number): MilestoneDefinition | null {
    const milestones = this.getMilestoneDefinitions();
    return milestones.find(m => daysClean < m.days) || null;
  }

  // Celebration post methods
  public async getCelebrationPosts(): Promise<CelebrationPost[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.celebrations].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public async addCelebrationPost(post: Omit<CelebrationPost, 'id' | 'timestamp' | 'cheers' | 'highFives' | 'userReacted'>): Promise<CelebrationPost> {
    const newPost: CelebrationPost = {
      ...post,
      id: Date.now().toString(),
      timestamp: 'Just now',
      cheers: 0,
      highFives: 0,
      userReacted: false
    };

    this.celebrations.unshift(newPost);
    return newPost;
  }

  public async reactToPost(postId: string, reactionType: 'cheer' | 'highFive'): Promise<CelebrationPost | null> {
    const postIndex = this.celebrations.findIndex(p => p.id === postId);
    if (postIndex === -1) return null;

    const post = this.celebrations[postIndex];
    
    if (post.userReacted) {
      // Remove reaction
      if (reactionType === 'cheer') {
        post.cheers = Math.max(0, post.cheers - 1);
      } else {
        post.highFives = Math.max(0, post.highFives - 1);
      }
      post.userReacted = false;
    } else {
      // Add reaction
      if (reactionType === 'cheer') {
        post.cheers += 1;
      } else {
        post.highFives += 1;
      }
      post.userReacted = true;
    }

    return post;
  }

  // Challenge methods
  public async getChallenges(): Promise<Challenge[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...this.challenges];
  }

  public async joinChallenge(challengeId: string): Promise<Challenge | null> {
    const challengeIndex = this.challenges.findIndex(c => c.id === challengeId);
    if (challengeIndex === -1) return null;

    const challenge = this.challenges[challengeIndex];
    challenge.joined = !challenge.joined;
    challenge.participants += challenge.joined ? 1 : -1;
    
    return challenge;
  }

  public async updateChallengeProgress(challengeId: string, progress: number): Promise<Challenge | null> {
    const challengeIndex = this.challenges.findIndex(c => c.id === challengeId);
    if (challengeIndex === -1) return null;

    this.challenges[challengeIndex].progress = Math.min(100, Math.max(0, progress));
    return this.challenges[challengeIndex];
  }

  // Get challenges by type
  public async getChallengesByType(type: Challenge['type']): Promise<Challenge[]> {
    const challenges = await this.getChallenges();
    return challenges.filter(c => c.type === type);
  }

  // Get joined challenges
  public async getJoinedChallenges(): Promise<Challenge[]> {
    const challenges = await this.getChallenges();
    return challenges.filter(c => c.joined);
  }

  // Get recommended challenges based on user progress
  public async getRecommendedChallenges(daysClean: number): Promise<Challenge[]> {
    const challenges = await this.getChallenges();
    
    // Recommend easier challenges for beginners
    if (daysClean < 7) {
      return challenges.filter(c => c.difficulty === 'beginner' && !c.joined);
    }
    
    // Mix of beginner and intermediate for early users
    if (daysClean < 30) {
      return challenges.filter(c => 
        (c.difficulty === 'beginner' || c.difficulty === 'intermediate') && !c.joined
      );
    }
    
    // All difficulties for experienced users
    return challenges.filter(c => !c.joined);
  }

  // Generate encouragement messages
  public generateEncouragementMessage(daysClean: number): string {
    const messages = [
      "You're building incredible strength every single day! 💪",
      "Each moment you choose recovery, you choose yourself. ✨",
      "Your future self is thanking you right now! 🙏",
      "Look how far you've come - that's pure determination! 🚀",
      "You're not just quitting something, you're choosing everything! 🌟",
      "Every day clean is a victory worth celebrating! 🎉",
      "Your courage inspires others in their journey too! 💖",
      "Recovery isn't just healing - it's discovering who you really are! ✨"
    ];

    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  }

  // Get community stats
  public async getCommunityStats(): Promise<{
    totalMembers: number;
    activeChallenges: number;
    milestonesThisWeek: number;
    totalDaysClean: number;
  }> {
    const challenges = await this.getChallenges();
    const posts = await this.getCelebrationPosts();
    
    // Calculate stats from mock data
    const totalMembers = 1847; // Mock total
    const activeChallenges = challenges.filter(c => c.participants > 0).length;
    const milestonesThisWeek = posts.filter(p => 
      p.timestamp.includes('hour') || p.timestamp.includes('day')
    ).length;
    const totalDaysClean = posts.reduce((sum, post) => sum + post.daysClean, 0);

    return {
      totalMembers,
      activeChallenges,
      milestonesThisWeek,
      totalDaysClean
    };
  }

  // Clean up resources
  public cleanup(): void {
    // In real app, this would cancel any ongoing requests
    console.log('CommunityService cleaned up');
  }
}

// Export singleton instance
export const communityService = CommunityService.getInstance(); 