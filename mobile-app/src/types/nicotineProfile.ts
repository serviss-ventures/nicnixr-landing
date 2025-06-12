export interface UserNicotineProfile {
  category: 'cigarettes' | 'vape' | 'pouches' | 'chewing';
  dailyAmount: number;
  dailyCost: number;
  nicotineContent: number;
  harmLevel: number; // 1-10
} 