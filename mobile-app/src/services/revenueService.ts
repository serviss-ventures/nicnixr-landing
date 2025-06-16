import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import analyticsService from './analyticsService';
import { supabase } from '../lib/supabase';

/**
 * Revenue Service - The Wallet of Our AI Marketing Brain
 * 
 * This service tracks all revenue events and subscription states
 * Critical for calculating LTV, optimizing pricing, and measuring ROI
 * Will integrate with RevenueCat once set up
 */

interface Product {
  id: string;
  price: number;
  currency: string;
  duration?: 'weekly' | 'monthly' | 'yearly' | 'lifetime';
  trialDays?: number;
}

interface Subscription {
  productId: string;
  purchaseDate: Date;
  expiryDate?: Date;
  status: 'active' | 'expired' | 'cancelled' | 'trial';
  price: number;
  currency: string;
}

class RevenueService {
  private userId: string | null = null;
  private currentSubscription: Subscription | null = null;
  
  // Product definitions - will come from RevenueCat
  private products: Product[] = [
    {
      id: 'nixr_monthly',
      price: 14.99,
      currency: 'USD',
      duration: 'monthly',
      trialDays: 7,
    },
    {
      id: 'nixr_yearly',
      price: 89.99,
      currency: 'USD',
      duration: 'yearly',
      trialDays: 7,
    },
    {
      id: 'nixr_lifetime',
      price: 299.99,
      currency: 'USD',
      duration: 'lifetime',
    },
  ];

  constructor() {
    this.initialize();
  }

  async initialize() {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      this.userId = user.id;
      await this.loadSubscriptionStatus();
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      this.userId = session?.user?.id || null;
      if (this.userId) {
        await this.loadSubscriptionStatus();
      }
    });
  }

  /**
   * Load subscription status from storage/backend
   */
  private async loadSubscriptionStatus() {
    if (!this.userId) return;

    try {
      // Check local storage first
      const cached = await AsyncStorage.getItem(`subscription_${this.userId}`);
      if (cached) {
        this.currentSubscription = JSON.parse(cached);
      }

      // Verify with backend
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', this.userId)
        .eq('status', 'active')
        .single();

      if (data && !error) {
        this.currentSubscription = {
          productId: data.product_id,
          purchaseDate: new Date(data.purchase_date),
          expiryDate: data.expiry_date ? new Date(data.expiry_date) : undefined,
          status: data.status,
          price: data.price,
          currency: data.currency,
        };

        // Cache locally
        await AsyncStorage.setItem(
          `subscription_${this.userId}`,
          JSON.stringify(this.currentSubscription)
        );
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  }

  /**
   * Start a free trial
   */
  async startTrial(productId: string) {
    const product = this.products.find(p => p.id === productId);
    if (!product || !product.trialDays) {
      throw new Error('Product not found or no trial available');
    }

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + product.trialDays);

    const subscription: Subscription = {
      productId,
      purchaseDate: new Date(),
      expiryDate: trialEndDate,
      status: 'trial',
      price: 0,
      currency: product.currency,
    };

    await this.saveSubscription(subscription);

    // Track trial start
    analyticsService.track('trial_started', {
      product_id: productId,
      trial_days: product.trialDays,
      potential_value: product.price,
    });

    analyticsService.trackConversion('trial_start', product.price);

    return subscription;
  }

  /**
   * Purchase a subscription
   */
  async purchaseSubscription(productId: string, receipt?: any) {
    const product = this.products.find(p => p.id === productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Calculate expiry date
    let expiryDate: Date | undefined;
    if (product.duration !== 'lifetime') {
      expiryDate = new Date();
      switch (product.duration) {
        case 'weekly':
          expiryDate.setDate(expiryDate.getDate() + 7);
          break;
        case 'monthly':
          expiryDate.setMonth(expiryDate.getMonth() + 1);
          break;
        case 'yearly':
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);
          break;
      }
    }

    const subscription: Subscription = {
      productId,
      purchaseDate: new Date(),
      expiryDate,
      status: 'active',
      price: product.price,
      currency: product.currency,
    };

    await this.saveSubscription(subscription);

    // Track revenue
    analyticsService.trackRevenue(product.price, product.currency, {
      product_id: productId,
      subscription_type: product.duration,
      platform: Platform.OS,
      receipt,
    });

    // Track conversion
    analyticsService.trackConversion('subscription_purchase', product.price, {
      product_id: productId,
      from_trial: this.currentSubscription?.status === 'trial',
    });

    // Calculate and track LTV prediction
    const ltv = this.calculateLTV(product);
    analyticsService.setUserProperties({
      subscription_type: product.duration,
      predicted_ltv: ltv,
      is_paying: true,
      last_purchase_date: new Date().toISOString(),
    });

    return subscription;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(reason?: string) {
    if (!this.currentSubscription) return;

    this.currentSubscription.status = 'cancelled';
    await this.saveSubscription(this.currentSubscription);

    // Track cancellation
    analyticsService.track('subscription_cancelled', {
      product_id: this.currentSubscription.productId,
      reason,
      days_active: this.getDaysActive(),
      total_paid: await this.getTotalRevenue(),
    });

    // Update user properties
    analyticsService.setUserProperties({
      is_paying: false,
      churn_date: new Date().toISOString(),
      churn_reason: reason,
    });
  }

  /**
   * Check if user has active subscription
   */
  hasActiveSubscription(): boolean {
    if (!this.currentSubscription) return false;
    
    if (this.currentSubscription.status !== 'active' && 
        this.currentSubscription.status !== 'trial') {
      return false;
    }

    if (this.currentSubscription.expiryDate) {
      return new Date() < this.currentSubscription.expiryDate;
    }

    return true;
  }

  /**
   * Get subscription status
   */
  getSubscriptionStatus() {
    return {
      isActive: this.hasActiveSubscription(),
      subscription: this.currentSubscription,
      daysRemaining: this.getDaysRemaining(),
      isInTrial: this.currentSubscription?.status === 'trial',
    };
  }

  /**
   * Private helper methods
   */
  private async saveSubscription(subscription: Subscription) {
    if (!this.userId) return;

    this.currentSubscription = subscription;

    // Save to backend
    try {
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: this.userId,
          product_id: subscription.productId,
          purchase_date: subscription.purchaseDate.toISOString(),
          expiry_date: subscription.expiryDate?.toISOString(),
          status: subscription.status,
          price: subscription.price,
          currency: subscription.currency,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Cache locally
      await AsyncStorage.setItem(
        `subscription_${this.userId}`,
        JSON.stringify(subscription)
      );
    } catch (error) {
      console.error('Error saving subscription:', error);
    }
  }

  private calculateLTV(product: Product): number {
    // Simple LTV calculation - will be enhanced with ML
    switch (product.duration) {
      case 'lifetime':
        return product.price;
      case 'yearly':
        return product.price * 2.5; // Assume 2.5 year average retention
      case 'monthly':
        return product.price * 18; // Assume 18 month average retention
      case 'weekly':
        return product.price * 52; // Assume 1 year average retention
      default:
        return product.price;
    }
  }

  private getDaysActive(): number {
    if (!this.currentSubscription) return 0;
    
    const now = new Date();
    const start = this.currentSubscription.purchaseDate;
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  private getDaysRemaining(): number {
    if (!this.currentSubscription?.expiryDate) return -1;
    
    const now = new Date();
    const expiry = this.currentSubscription.expiryDate;
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  private async getTotalRevenue(): Promise<number> {
    if (!this.userId) return 0;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('price')
        .eq('user_id', this.userId)
        .eq('status', 'active');

      if (error || !data) return 0;

      return data.reduce((total, sub) => total + (sub.price || 0), 0);
    } catch (error) {
      console.error('Error calculating total revenue:', error);
      return 0;
    }
  }

  /**
   * A/B Testing for pricing
   */
  async getPricingVariant(): Promise<'control' | 'variant_a' | 'variant_b'> {
    const cached = await AsyncStorage.getItem('pricing_variant');
    if (cached) return cached as any;

    // Simple A/B split
    const random = Math.random();
    let variant: 'control' | 'variant_a' | 'variant_b';
    
    if (random < 0.33) {
      variant = 'control';
    } else if (random < 0.66) {
      variant = 'variant_a';
    } else {
      variant = 'variant_b';
    }

    await AsyncStorage.setItem('pricing_variant', variant);
    
    // Track experiment exposure
    analyticsService.trackExperiment('pricing_test', variant);
    
    return variant;
  }

  /**
   * Get dynamic pricing based on variant
   */
  async getDynamicPricing() {
    const variant = await this.getPricingVariant();
    const baseProducts = [...this.products];

    switch (variant) {
      case 'variant_a':
        // 20% discount
        return baseProducts.map(p => ({
          ...p,
          price: p.price * 0.8,
          originalPrice: p.price,
          discount: 20,
        }));
      case 'variant_b':
        // Extended trial
        return baseProducts.map(p => ({
          ...p,
          trialDays: p.trialDays ? p.trialDays * 2 : 14,
        }));
      default:
        return baseProducts;
    }
  }
}

// Export singleton instance
export default new RevenueService(); 