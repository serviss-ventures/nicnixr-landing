export interface UserNicotineProfile {
  category: 'cigarettes' | 'vape' | 'pouches' | 'chewing' | 'other';
  dailyAmount: number;
  dailyCost: number;
  nicotineContent: number;
  harmLevel: number; // 1-10
} 