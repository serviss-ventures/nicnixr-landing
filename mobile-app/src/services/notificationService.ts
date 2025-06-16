import { createNotification } from '../store/slices/notificationSlice';
import { User } from '../types';
import { AppDispatch } from '../store/store';

class NotificationService {
  // Create a buddy request notification
  static async createBuddyRequestNotification(
    dispatch: AppDispatch,
    fromUser: {
      id: string;
      name: string;
      daysClean: number;
      avatar: string;
      product: string;
      bio?: string;
      supportStyles?: string[];
      status?: 'online' | 'offline' | 'in-crisis';
    }
  ) {
    return dispatch(createNotification(
      'buddy-request',
      'New Buddy Request',
      `${fromUser.name} wants to connect with you`,
      {
        buddyId: fromUser.id,
        buddyName: fromUser.name,
        buddyDaysClean: fromUser.daysClean,
        buddyAvatar: fromUser.avatar,
        buddyProduct: fromUser.product,
        buddyBio: fromUser.bio || "Hey there! I'm on this journey to quit nicotine.",
        buddySupportStyles: fromUser.supportStyles || [],
        buddyStatus: fromUser.status || 'online',
      },
      'accept-decline'
    ));
  }

  // Create a buddy message notification
  static async createBuddyMessageNotification(
    dispatch: AppDispatch,
    fromUser: {
      id: string;
      name: string;
      daysClean: number;
      avatar: string;
    },
    message: string
  ) {
    return dispatch(createNotification(
      'buddy-message',
      fromUser.name,
      message,
      {
        buddyId: fromUser.id,
        buddyName: fromUser.name,
        buddyDaysClean: fromUser.daysClean,
        buddyAvatar: fromUser.avatar,
      },
      'message'
    ));
  }

  // Create milestone achievement notification
  static async createMilestoneNotification(
    dispatch: AppDispatch,
    milestone: number,
    achievementName: string,
    icon: string = 'trophy-outline',
    iconColor: string = '#F59E0B'
  ) {
    let message = '';
    // Override icon based on specific milestone
    switch (milestone) {
      case 1:
        message = "24 hours complete. Nicotine levels reduced by 50%.";
        icon = 'checkmark-circle-outline';
        iconColor = '#6B7280';
        break;
      case 3:
        message = "72 hours achieved. Carbon monoxide eliminated.";
        icon = 'pulse-outline';
        iconColor = '#3B82F6';
        break;
      case 7:
        message = "Week 1 complete. Lung cilia regenerating.";
        icon = 'calendar-outline';
        iconColor = '#8B5CF6';
        break;
      case 14:
        message = "Two weeks recorded. Circulation normalized.";
        icon = 'fitness-outline';
        iconColor = '#EC4899';
        break;
      case 30:
        message = "Month 1 achieved. Neural pathways restructured.";
        icon = 'shield-checkmark-outline';
        iconColor = '#10B981';
        break;
      case 60:
        message = "Day 60 complete. Dopamine sensitivity restored.";
        icon = 'sparkles-outline';
        iconColor = '#F59E0B';
        break;
      case 90:
        message = "Quarter complete. Addiction pathways dormant.";
        icon = 'medal-outline';
        iconColor = '#6366F1';
        break;
      case 180:
        message = "6 months logged. Disease markers significantly reduced.";
        icon = 'star-outline';
        iconColor = '#14B8A6';
        break;
      case 365:
        message = "Annual milestone reached. Full system restoration documented.";
        icon = 'trophy';
        iconColor = '#FFD700';
        break;
      default:
        message = `Day ${milestone} complete. Recovery progressing as expected.`;
        icon = 'flag-outline';
        iconColor = '#9CA3AF';
    }
    
    return dispatch(createNotification(
      'milestone',
      achievementName || `Day ${milestone} Milestone`,
      message,
      {
        milestone,
        badge: this.getBadgeForMilestone(milestone),
      },
      'view',
      icon,
      iconColor
    ));
  }

  // Create health benefit notification
  static async createHealthBenefitNotification(
    dispatch: AppDispatch,
    benefit: string,
    description: string,
    daysClean: number
  ) {
    let icon = 'heart-outline';
    let iconColor = '#10B981';
    
    // Different icons for different health benefits
    if (benefit.includes('Heart')) {
      icon = 'heart-outline';
      iconColor = '#EF4444';
    } else if (benefit.includes('Nicotine')) {
      icon = 'water-outline';
      iconColor = '#06B6D4';
    } else if (benefit.includes('Circulation')) {
      icon = 'pulse-outline';
      iconColor = '#EC4899';
    } else if (benefit.includes('Breathing')) {
      icon = 'cloud-outline';
      iconColor = '#3B82F6';
    } else if (benefit.includes('Taste')) {
      icon = 'restaurant-outline';
      iconColor = '#F59E0B';
    } else if (benefit.includes('Disease')) {
      icon = 'shield-outline';
      iconColor = '#10B981';
    }
    
    return dispatch(createNotification(
      'milestone',
      benefit,
      description,
      {
        benefit,
        daysClean,
      },
      'view',
      icon,
      iconColor
    ));
  }

  // Create system notification (app updates, tips, etc.)
  static async createSystemNotification(
    dispatch: AppDispatch,
    title: string,
    message: string,
    data?: any
  ) {
    return dispatch(createNotification(
      'system',
      title,
      message,
      data,
      'view',
      'information-circle',
      '#3B82F6'
    ));
  }

  // Create mention notification
  static async createMentionNotification(
    dispatch: AppDispatch,
    mentionedByUser: {
      id: string;
      name: string;
      daysClean: number;
    },
    context: {
      type: 'post' | 'comment';
      postId: string;
      postAuthor?: string;
      content: string;
    }
  ) {
    let title = `${mentionedByUser.name} mentioned you`;
    let message = '';
    
    if (context.type === 'post') {
      message = `In their post: "${context.content.substring(0, 60)}${context.content.length > 60 ? '...' : ''}"`;
    } else {
      message = `In a comment on ${context.postAuthor ? context.postAuthor + "'s" : "a"} post`;
    }
    
    return dispatch(createNotification(
      'mention',
      title,
      message,
      {
        mentionedById: mentionedByUser.id,
        mentionedByName: mentionedByUser.name,
        mentionedByDaysClean: mentionedByUser.daysClean,
        postId: context.postId,
        contextType: context.type,
        fullContent: context.content,
      },
      'view',
      'at',
      '#8B5CF6'
    ));
  }

  // Helper to get badge name for milestone
  private static getBadgeForMilestone(days: number): string {
    if (days === 1) return 'first-day';
    if (days === 3) return 'three-days';
    if (days === 7) return 'week-warrior';
    if (days === 14) return 'two-weeks';
    if (days === 30) return 'month-master';
    if (days === 60) return 'two-months';
    if (days === 90) return 'quarter-champion';
    if (days === 180) return 'half-year-hero';
    if (days === 365) return 'year-legend';
    return 'milestone';
  }

  // Check and create milestone notifications
  static async checkMilestones(dispatch: AppDispatch, daysClean: number, lastCheckedDays: number) {
    const milestones = [1, 3, 7, 14, 30, 60, 90, 180, 365];
    
    for (const milestone of milestones) {
      if (daysClean >= milestone && lastCheckedDays < milestone) {
        await this.createMilestoneNotification(dispatch, milestone, `Day ${milestone} Milestone`);
      }
    }
  }

  // Check and create health benefit notifications
  static async checkHealthBenefits(dispatch: AppDispatch, daysClean: number, lastCheckedDays: number) {
    const healthBenefits = [
      { days: 1, benefit: 'Heart Rate Normalized', description: 'Your heart rate and blood pressure have started to normalize.' },
      { days: 3, benefit: 'Nicotine Cleared', description: 'Nicotine has been eliminated from your body!' },
      { days: 7, benefit: 'Improved Circulation', description: 'Your blood circulation has significantly improved.' },
      { days: 14, benefit: 'Better Breathing', description: 'Your lung function is improving and breathing is easier.' },
      { days: 30, benefit: 'Enhanced Taste & Smell', description: 'Your senses of taste and smell have greatly improved!' },
      { days: 90, benefit: 'Reduced Disease Risk', description: 'Your risk of heart disease has dropped significantly.' },
    ];
    
    for (const benefit of healthBenefits) {
      if (daysClean >= benefit.days && lastCheckedDays < benefit.days) {
        await this.createHealthBenefitNotification(
          dispatch,
          benefit.benefit,
          benefit.description,
          benefit.days
        );
      }
    }
  }

  // Create demo notifications for testing
  static async createDemoNotifications(dispatch: AppDispatch) {
    // Clear existing notifications first
    dispatch({ type: 'notifications/clearNotifications' });
    
    // Create sample notifications using realistic buddy profiles
    await this.createBuddyRequestNotification(dispatch, {
      id: 'user-sarah-m', // Changed to match community screen
      name: 'Sarah M.',
      daysClean: 12, // Changed to match community screen
      avatar: 'warrior',
      product: 'vaping',
      bio: 'Mom of 2, quit vaping for my kids. Love hiking and coffee chats! Looking for someone to check in with daily.',
      supportStyles: ['Motivator', 'Good Listener'],
      status: 'online',
    });
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    await this.createBuddyMessageNotification(
      dispatch,
      {
        id: 'buddy-mike-456',
        name: 'Mike S.',
        daysClean: 120,
        avatar: 'warrior', // Changed to match default avatar style
      },
      'Hey! How are you holding up today? Remember, we got this together.'
    );
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    await this.createMilestoneNotification(dispatch, 7, 'Day 7 Milestone');
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    await this.createMentionNotification(
      dispatch,
      {
        id: 'user-jessica-k',
        name: 'Jessica K.',
        daysClean: 30,
      },
      {
        type: 'comment',
        postId: '1',
        postAuthor: 'Anonymous',
        content: '@You Great job on hitting day 7! Keep pushing through, the first weeks are the toughest but you\'ve got this!',
      }
    );
  }
}

export default NotificationService; 