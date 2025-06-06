import { Platform } from 'react-native';
// TODO: Uncomment when react-native-iap is installed
// import RNIap, { 
//   Product, 
//   Purchase, 
//   PurchaseError,
//   finishTransaction,
//   getProducts,
//   requestPurchase,
//   initConnection,
//   endConnection,
//   getAvailablePurchases
// } from 'react-native-iap';

// Product IDs for App Store and Google Play
const PRODUCT_IDS = {
  ios: {
    // Premium avatars
    micahPremium: 'com.nixr.avatar.royal_warrior',
    loreleiPremium: 'com.nixr.avatar.cosmic_guardian',
    adventurerPremium: 'com.nixr.avatar.lightning_hero',
    avataaarsPrestige: 'com.nixr.avatar.diamond_elite',
    botttsUltra: 'com.nixr.avatar.cyber_nexus',
    
    // Limited editions
    founderMicah: 'com.nixr.avatar.founders_spirit',
    platinumPersonas: 'com.nixr.avatar.platinum_phoenix',
    galaxyLorelei: 'com.nixr.avatar.galaxy_master',
    titanBottts: 'com.nixr.avatar.titan_protocol',
  },
  android: {
    // Same structure for Android
    micahPremium: 'com.nixr.avatar.royal_warrior',
    loreleiPremium: 'com.nixr.avatar.cosmic_guardian',
    adventurerPremium: 'com.nixr.avatar.lightning_hero',
    avataaarsPrestige: 'com.nixr.avatar.diamond_elite',
    botttsUltra: 'com.nixr.avatar.cyber_nexus',
    
    founderMicah: 'com.nixr.avatar.founders_spirit',
    platinumPersonas: 'com.nixr.avatar.platinum_phoenix',
    galaxyLorelei: 'com.nixr.avatar.galaxy_master',
    titanBottts: 'com.nixr.avatar.titan_protocol',
  }
};

interface PurchaseResult {
  success: boolean;
  error?: string;
  purchase?: any;
}

class IAPService {
  private products: any[] = [];
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // TODO: Uncomment when react-native-iap is installed
      // await initConnection();
      this.isInitialized = true;
      await this.loadProducts();
    } catch (error) {
      console.error('Failed to initialize IAP:', error);
    }
  }

  async loadProducts(): Promise<void> {
    try {
      const platformProducts = Platform.OS === 'ios' ? PRODUCT_IDS.ios : PRODUCT_IDS.android;
      const productIds = Object.values(platformProducts);
      
      // TODO: Uncomment when react-native-iap is installed
      // this.products = await getProducts({ skus: productIds });
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  }

  async purchaseAvatar(avatarKey: string): Promise<PurchaseResult> {
    try {
      // Get the product ID for this avatar
      const platformProducts = Platform.OS === 'ios' ? PRODUCT_IDS.ios : PRODUCT_IDS.android;
      const productId = platformProducts[avatarKey as keyof typeof platformProducts];
      
      if (!productId) {
        throw new Error('Invalid avatar key');
      }

      // TODO: Uncomment when react-native-iap is installed
      // const purchase = await requestPurchase({ 
      //   sku: productId,
      //   andDangerouslyFinishTransactionAutomaticallyIOS: false 
      // });

      // TODO: Verify receipt with backend
      // const verified = await this.verifyPurchase(purchase);
      
      // TODO: Update user's purchased avatars
      // await this.updateUserAvatars(avatarKey, purchase);

      // TODO: Finish transaction
      // await finishTransaction({ purchase, isConsumable: false });

      return {
        success: true,
        // purchase
      };
    } catch (error: any) {
      console.error('Purchase failed:', error);
      return {
        success: false,
        error: error.message || 'Purchase failed'
      };
    }
  }

  async verifyPurchase(purchase: any): Promise<boolean> {
    try {
      // TODO: Send receipt to backend for verification
      const response = await fetch(`${API_BASE_URL}/api/iap/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers
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
      console.error('Receipt verification failed:', error);
      return false;
    }
  }

  async updateUserAvatars(avatarKey: string, purchase: any): Promise<void> {
    try {
      // TODO: Update user's purchased avatars in backend
      await fetch(`${API_BASE_URL}/api/users/avatars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers
        },
        body: JSON.stringify({
          avatarId: avatarKey,
          purchaseId: purchase.transactionId
        })
      });

      // For limited editions, also update stock
      if (avatarKey.includes('founder') || avatarKey.includes('platinum') || 
          avatarKey.includes('galaxy') || avatarKey.includes('titan')) {
        await this.updateLimitedEditionStock(avatarKey, purchase);
      }
    } catch (error) {
      console.error('Failed to update user avatars:', error);
      throw error;
    }
  }

  async updateLimitedEditionStock(avatarKey: string, purchase: any): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/avatars/limited/${avatarKey}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers
        },
        body: JSON.stringify({
          purchaseId: purchase.transactionId
        })
      });
    } catch (error) {
      console.error('Failed to update limited edition stock:', error);
    }
  }

  async restorePurchases(): Promise<string[]> {
    try {
      // TODO: Uncomment when react-native-iap is installed
      // const purchases = await getAvailablePurchases();
      
      // Extract avatar keys from restored purchases
      const restoredAvatars: string[] = [];
      // purchases.forEach(purchase => {
      //   const avatarKey = this.getAvatarKeyFromProductId(purchase.productId);
      //   if (avatarKey) restoredAvatars.push(avatarKey);
      // });

      return restoredAvatars;
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      return [];
    }
  }

  private getAvatarKeyFromProductId(productId: string): string | null {
    const platformProducts = Platform.OS === 'ios' ? PRODUCT_IDS.ios : PRODUCT_IDS.android;
    const entry = Object.entries(platformProducts).find(([_, id]) => id === productId);
    return entry ? entry[0] : null;
  }

  async cleanup(): Promise<void> {
    try {
      // TODO: Uncomment when react-native-iap is installed
      // await endConnection();
      this.isInitialized = false;
    } catch (error) {
      console.error('Failed to cleanup IAP:', error);
    }
  }
}

// TODO: Replace with actual API URL
const API_BASE_URL = 'https://api.nixr.app';

export default new IAPService(); 