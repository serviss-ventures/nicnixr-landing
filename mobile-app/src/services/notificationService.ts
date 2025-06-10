import { store } from '../store/store';
import { createNotification } from '../store/slices/notificationSlice';
import { User } from '../types';

class NotificationService {
  // Create a buddy request notification
  static async createBuddyRequestNotification(
    fromUser: {
      id: string;
      name: string;
      daysClean: number;
      avatar: string;
      product: string;
    }
  ) {
    const dispatch = store.dispatch;
    
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
      },
      'accept-decline'
    ));
  }

  // Create a buddy message notification
  static async createBuddyMessageNotification(
    fromUser: {
      id: string;
      name: string;
      daysClean: number;
      avatar: string;
    },
    message: string
  ) {
    const dispatch = store.dispatch;
    
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
    milestone: number,
    achievementName: string,
    icon: string = 'trophy',
    iconColor: string = '#FFD700'
  ) {
    const dispatch = store.dispatch;
    
    let message = '';
    switch (milestone) {
      case 1:
        message = "You've made it through your first day!";
        break;
      case 3:
        message = "3 days strong! Your body is thanking you.";
        break;
      case 7:
        message = "One week milestone achieved! 🎉";
        break;
      case 14:
        message = "Two weeks of freedom! You're unstoppable!";
        break;
      case 30:
        message = "30 days clean! You've built a new habit!";
        break;
      case 60:
        message = "60 days! Your brain chemistry is transforming!";
        break;
      case 90:
        message = "90 days! You've reached a major milestone!";
        break;
      case 180:
        message = "6 months free! You're an inspiration!";
        break;
      case 365:
        message = "One year! You've completely transformed your life!";
        break;
      default:
        message = `${milestone} days of freedom achieved!`;
    }
    
    return dispatch(createNotification(
      'milestone',
      achievementName || `${milestone} Day Milestone! 🎉`,
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
    benefit: string,
    description: string,
    daysClean: number
  ) {
    const dispatch = store.dispatch;
    
    return dispatch(createNotification(
      'milestone',
      `Health Benefit Unlocked! 💚`,
      description,
      {
        benefit,
        daysClean,
      },
      'view',
      'heart',
      '#10B981'
    ));
  }

  // Create system notification (app updates, tips, etc.)
  static async createSystemNotification(
    title: string,
    message: string,
    data?: any
  ) {
    const dispatch = store.dispatch;
    
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
  static async checkMilestones(daysClean: number, lastCheckedDays: number) {
    const milestones = [1, 3, 7, 14, 30, 60, 90, 180, 365];
    
    for (const milestone of milestones) {
      if (daysClean >= milestone && lastCheckedDays < milestone) {
        await this.createMilestoneNotification(milestone, `${milestone} Day Milestone! 🎉`);
      }
    }
  }

  // Check and create health benefit notifications
  static async checkHealthBenefits(daysClean: number, lastCheckedDays: number) {
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
          benefit.benefit,
          benefit.description,
          benefit.days
        );
      }
    }
  }

  // Create demo notifications for testing
  static async createDemoNotifications() {
    const dispatch = store.dispatch;
    
    // Clear existing notifications first
    dispatch({ type: 'notifications/clearNotifications' });
    
    // Create sample notifications
    await this.createBuddyRequestNotification({
      id: 'sarah_123',
      name: 'Sarah M.',
      daysClean: 45,
      avatar: 'warrior',
      product: 'cigarettes',
    });
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    await this.createBuddyMessageNotification(
      {
        id: 'mike_456',
        name: 'Mike S.',
        daysClean: 120,
        avatar: 'hero',
      },
      'Hey! How are you holding up today? Remember, we got this! 💪'
    );
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    await this.createMilestoneNotification(7, '7 Day Milestone! 🎉');
  }
}

export default NotificationService; 