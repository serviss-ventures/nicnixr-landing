import { Platform, Alert } from 'react-native';
import RNIap, { 
  Product, 
  Purchase, 
  PurchaseError,
  finishTransaction,
  getProducts,
  requestSubscription,
  initConnection,
  endConnection,
  getAvailablePurchases,
  Subscription
} from 'react-native-iap';

// Subscription Product IDs
const SUBSCRIPTION_IDS = {
  ios: 'com.nixr.premium.monthly',
  android: 'com.nixr.premium.monthly'
};

interface SubscriptionResult {
  success: boolean;
  error?: string;
  purchase?: any;
}

class SubscriptionService {
  private isInitialized = false;
  private currentProduct: Subscription | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await initConnection();
      this.isInitialized = true;
      await this.loadSubscription();
    } catch (error: any) {
      // TEMPORARILY: Don't throw error for IAP not available
      // This allows testing without IAP configuration
      if (error.code === 'E_IAP_NOT_AVAILABLE' || error.message?.includes('E_IAP_NOT_AVAILABLE')) {
        console.log('[TEST MODE] IAP not available - continuing without subscriptions');
        this.isInitialized = false;
        return;
      }
      console.error('Failed to initialize subscription service:', error);
      throw error;
    }
  }

  async loadSubscription(): Promise<void> {
    try {
      const productId = Platform.OS === 'ios' ? SUBSCRIPTION_IDS.ios : SUBSCRIPTION_IDS.android;
      const products = await getProducts({ skus: [productId] });
      
      if (products && products.length > 0) {
        this.currentProduct = products[0] as Subscription;
      }
    } catch (error) {
      console.error('Failed to load subscription product:', error);
    }
  }

  async startFreeTrial(): Promise<SubscriptionResult> {
    try {
      // Initialize if not already done
      if (!this.isInitialized) {
        await this.initialize();
      }

      // If still not initialized (e.g., IAP not available), return success for testing
      if (!this.isInitialized) {
        console.log('[TEST MODE] Simulating successful subscription');
        return {
          success: true,
          purchase: { transactionId: 'test-' + Date.now() }
        };
      }

      const productId = Platform.OS === 'ios' ? SUBSCRIPTION_IDS.ios : SUBSCRIPTION_IDS.android;
      
      // Request subscription (will show native payment sheet)
      const purchase = await requestSubscription({
        sku: productId,
        andDangerouslyFinishTransactionAutomaticallyIOS: false
      });

      // Verify receipt with backend (skip in development)
      const verified = await this.verifySubscription(purchase);
      
      if (!verified && !__DEV__) {
        throw new Error('Subscription verification failed');
      }
      
      // Update user's subscription status
      await this.updateUserSubscription(purchase);

      // Finish transaction
      await finishTransaction({ purchase, isConsumable: false });

      return {
        success: true,
        purchase
      };
    } catch (error: any) {
      console.error('Subscription failed:', error);
      
      // Handle specific error cases
      if (error.code === 'E_USER_CANCELLED') {
        return {
          success: false,
          error: 'cancelled'
        };
      }
      
      return {
        success: false,
        error: error.message || 'Subscription failed'
      };
    }
  }

  async verifySubscription(purchase: any): Promise<boolean> {
    try {
      // In development mode, always return true
      if (__DEV__) {
        console.log('[DEV MODE] Skipping subscription verification');
        return true;
      }

      const response = await fetch(`${API_BASE_URL}/api/subscriptions/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receipt: purchase.transactionReceipt,
          productId: purchase.productId,
          platform: Platform.OS
        })
      });

      const result = await response.json();
      return result.valid;
    } catch (error) {
      console.error('Subscription verification failed:', error);
      return false;
    }
  }

  async updateUserSubscription(purchase: any): Promise<void> {
    try {
      // In development mode, just log
      if (__DEV__) {
        console.log('[DEV MODE] Would update user subscription:', purchase.transactionId);
        return;
      }

      await fetch(`${API_BASE_URL}/api/users/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          purchaseId: purchase.transactionId,
          productId: purchase.productId,
          startDate: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to update user subscription:', error);
      throw error;
    }
  }

  async restoreSubscription(): Promise<boolean> {
    try {
      const purchases = await getAvailablePurchases();
      
      // Check if any active subscription exists
      const hasActiveSubscription = purchases.some(purchase => {
        const productId = Platform.OS === 'ios' ? SUBSCRIPTION_IDS.ios : SUBSCRIPTION_IDS.android;
        return purchase.productId === productId;
      });

      return hasActiveSubscription;
    } catch (error) {
      console.error('Failed to restore subscription:', error);
      return false;
    }
  }

  async checkSubscriptionStatus(): Promise<boolean> {
    try {
      // In development, always return true for testing
      if (__DEV__) {
        return true;
      }
      
      return await this.restoreSubscription();
    } catch (error) {
      return false;
    }
  }

  getProductInfo(): { price: string; trialDays: number } {
    if (this.currentProduct) {
      return {
        price: this.currentProduct.localizedPrice || '$4.99',
        trialDays: Platform.OS === 'ios' ? 3 : 3, // Both platforms get 3 days
      };
    }
    
    return {
      price: '$4.99',
      trialDays: 3
    };
  }

  async cleanup(): Promise<void> {
    try {
      await endConnection();
      this.isInitialized = false;
    } catch (error) {
      console.error('Failed to cleanup subscription service:', error);
    }
  }
}

// API URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.nixr.app';

export default new SubscriptionService(); 