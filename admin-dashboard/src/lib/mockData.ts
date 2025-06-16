// Mock data generators for NixR Admin Dashboard

import {
  User,
  SubstanceType,
  UserTier,
  SubscriptionStatus,
  Platform,
  UserStatus,
  RiskLevel,
  JournalEntry,
  MoodType,
  CommunityPost,
  PostCategory,
  ModerationStatus,
  AICoachSession,
  SentimentType,
  SupportTicket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/types";

// Helper functions
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const randomEnum = <T>(enumObj: T): T[keyof T] => {
  const values = Object.values(enumObj as any);
  return values[Math.floor(Math.random() * values.length)];
};

// Generate mock users
export const generateMockUsers = (count: number): User[] => {
  const users: User[] = [];
  const firstNames = ["Sarah", "Mike", "Emma", "David", "Lisa", "John", "Amy", "Chris", "Jessica", "Robert"];
  const lastNames = ["Johnson", "Chen", "Wilson", "Park", "Miller", "Davis", "Garcia", "Thompson", "Anderson", "Taylor"];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const sobrietyDate = randomDate(new Date(2020, 0, 1), new Date());
    const daysClean = Math.floor((new Date().getTime() - sobrietyDate.getTime()) / (1000 * 60 * 60 * 24));
    
    users.push({
      id: `user_${i + 1}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      name: `${firstName} ${lastName}`,
      avatar: `${firstName[0]}${lastName[0]}`,
      phone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      createdAt: randomDate(new Date(2023, 0, 1), new Date()).toISOString(),
      lastActiveAt: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()).toISOString(),
      
      // Recovery-specific
      sobrietyDate: sobrietyDate.toISOString(),
      daysClean,
      primarySubstance: randomEnum(SubstanceType),
      secondarySubstances: Math.random() > 0.6 ? [randomEnum(SubstanceType)] : undefined,
      
      // App engagement
      journalStreak: Math.floor(Math.random() * 100),
      lastJournalEntry: randomDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), new Date()).toISOString(),
      totalJournalEntries: Math.floor(Math.random() * 500),
      communityPosts: Math.floor(Math.random() * 50),
      buddyConnections: Math.floor(Math.random() * 10),
      
      // Subscription
      tier: randomEnum(UserTier),
      subscriptionStatus: randomEnum(SubscriptionStatus),
      subscriptionStartDate: randomDate(new Date(2023, 0, 1), new Date()).toISOString(),
      
      // Platform & Status
      platform: randomEnum(Platform),
      appVersion: `2.${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}`,
      status: Math.random() > 0.2 ? UserStatus.ACTIVE : randomEnum(UserStatus),
      riskLevel: daysClean < 7 ? RiskLevel.HIGH : 
                 daysClean < 30 ? RiskLevel.MEDIUM : 
                 Math.random() > 0.8 ? RiskLevel.LOW : RiskLevel.LOW,
      
      // Support
      supportTickets: Math.floor(Math.random() * 5),
      flaggedContent: Math.floor(Math.random() * 2),
      reports: Math.floor(Math.random() * 3),
    });
  }
  
  return users;
};

// Generate mock journal entries
export const generateMockJournalEntries = (userId: string, count: number): JournalEntry[] => {
  const entries: JournalEntry[] = [];
  const triggers = ["Work stress", "Family issues", "Social situations", "Boredom", "Anxiety", "Depression", "Loneliness"];
  
  for (let i = 0; i < count; i++) {
    entries.push({
      id: `journal_${userId}_${i + 1}`,
      userId,
      content: "Today was challenging but I managed to stay strong. I used the breathing exercises when I felt triggered...",
      mood: randomEnum(MoodType),
      triggers: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
        triggers[Math.floor(Math.random() * triggers.length)]
      ),
      cravingLevel: Math.floor(Math.random() * 10) + 1,
      createdAt: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()).toISOString(),
      isPrivate: Math.random() > 0.7,
      aiInsights: Math.random() > 0.5 ? "Great job recognizing your triggers. Consider reaching out to your support network." : undefined,
    });
  }
  
  return entries;
};

// Generate mock community posts
export const generateMockCommunityPosts = (count: number): CommunityPost[] => {
  const posts: CommunityPost[] = [];
  const titles = [
    "30 days clean today!",
    "Need some support",
    "Tips for handling cravings",
    "My recovery story",
    "Question about withdrawal",
    "Celebrating small wins",
    "Struggling today",
    "Resources that helped me",
  ];
  
  for (let i = 0; i < count; i++) {
    posts.push({
      id: `post_${i + 1}`,
      userId: `user_${Math.floor(Math.random() * 100) + 1}`,
      title: titles[Math.floor(Math.random() * titles.length)],
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
      category: randomEnum(PostCategory),
      likes: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 20),
      isAnonymous: Math.random() > 0.8,
      createdAt: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()).toISOString(),
      moderationStatus: Math.random() > 0.1 ? ModerationStatus.APPROVED : randomEnum(ModerationStatus),
    });
  }
  
  return posts;
};

// Generate mock AI coach sessions
export const generateMockAICoachSessions = (userId: string, count: number): AICoachSession[] => {
  const sessions: AICoachSession[] = [];
  const topics = ["Cravings", "Triggers", "Relapse Prevention", "Daily Check-in", "Goal Setting", "Support System"];
  
  for (let i = 0; i < count; i++) {
    const startedAt = randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date());
    const duration = Math.floor(Math.random() * 30 + 5) * 60 * 1000; // 5-35 minutes
    
    sessions.push({
      id: `session_${userId}_${i + 1}`,
      userId,
      startedAt: startedAt.toISOString(),
      endedAt: new Date(startedAt.getTime() + duration).toISOString(),
      messages: [],
      sentiment: randomEnum(SentimentType),
      helpfulnessRating: Math.random() > 0.3 ? Math.floor(Math.random() * 3) + 3 : undefined,
      topicsDiscussed: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
        topics[Math.floor(Math.random() * topics.length)]
      ),
      interventionTriggered: Math.random() > 0.95,
    });
  }
  
  return sessions;
};

// Generate mock support tickets
export const generateMockSupportTickets = (count: number): SupportTicket[] => {
  const tickets: SupportTicket[] = [];
  const subjects = [
    "Can't access journal",
    "Billing question",
    "App crashes on startup",
    "Need help with recovery",
    "Feature request: Dark mode",
    "Account sync issues",
    "Buddy match not working",
    "AI coach not responding",
  ];
  
  const assignees = ["Mike Chen", "Emily Rodriguez", "Sarah Johnson", "AI Coach", "Unassigned"];
  
  for (let i = 0; i < count; i++) {
    const createdAt = randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date());
    
    tickets.push({
      id: `TKT-${1000 + i}`,
      userId: `user_${Math.floor(Math.random() * 100) + 1}`,
      subject: subjects[Math.floor(Math.random() * subjects.length)],
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
      category: randomEnum(TicketCategory),
      priority: randomEnum(TicketPriority),
      status: randomEnum(TicketStatus),
      assignedTo: Math.random() > 0.3 ? assignees[Math.floor(Math.random() * assignees.length)] : undefined,
      createdAt: createdAt.toISOString(),
      updatedAt: randomDate(createdAt, new Date()).toISOString(),
      messages: [],
    });
  }
  
  return tickets;
};

// Generate sample data for charts
export const generateChartData = () => {
  return {
    dailyActiveUsers: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      users: Math.floor(Math.random() * 1000) + 3000,
    })),
    
    recoveryMilestones: [
      { milestone: "1 Day", achieved: 4820, percentage: 100 },
      { milestone: "7 Days", achieved: 3215, percentage: 67 },
      { milestone: "30 Days", achieved: 2156, percentage: 45 },
      { milestone: "90 Days", achieved: 1428, percentage: 30 },
      { milestone: "180 Days", achieved: 892, percentage: 19 },
      { milestone: "1 Year", achieved: 524, percentage: 11 },
    ],
    
    substanceDistribution: [
      { substance: "Alcohol", count: 2145, percentage: 38 },
      { substance: "Opioids", count: 842, percentage: 15 },
      { substance: "Stimulants", count: 673, percentage: 12 },
      { substance: "Cannabis", count: 1011, percentage: 18 },
      { substance: "Nicotine", count: 562, percentage: 10 },
      { substance: "Multiple", count: 391, percentage: 7 },
    ],
    
    monthlyRevenue: Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, i, 1).toLocaleDateString('en', { month: 'short' }),
      revenue: Math.floor(Math.random() * 50000) + 100000,
      users: Math.floor(Math.random() * 2000) + 8000,
    })),
  };
}; 