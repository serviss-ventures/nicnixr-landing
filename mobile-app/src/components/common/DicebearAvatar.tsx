import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { createAvatar } from '@dicebear/core';
import { micah } from '@dicebear/collection';
import { SvgXml } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Avatar customization type
interface AvatarCustomization {
  earringsProbability?: number;
  glassesProbability?: number;
  shirtColor?: string[];
  baseColor?: string[];
  hairColor?: string[];
  specialAccessory?: string;
  specialBadge?: string;
  mouth?: string[];
  eyebrows?: string[];
}

// Avatar config type
interface AvatarConfig {
  name: string;
  collection: any; // DiceBear collection type
  unlockDays: number;
  description: string;
  rarity: AvatarRarity;
  seedModifier?: string;
  customization?: AvatarCustomization;
  icon?: string;
  price?: string;
}

// Avatar style configurations - ALL USING MICAH STYLE
export const STARTER_AVATARS = {
  warrior: {
    name: 'Classic Hero',
    collection: micah,
    unlockDays: 0,
    description: 'Timeless confidence',
    rarity: 'starter',
    seedModifier: 'classic-hero-v5',
    customization: {
      earringsProbability: 0,
      glassesProbability: 0,
      shirtColor: ['2563eb', '3b82f6', '60a5fa'], // Classic blue
      mouth: ['smile'],
      eyebrows: ['up'],
      baseColor: ['fed7aa', 'ffedd5'], // Athletic tan
      hairColor: ['92400e', '78350f', '713f12'], // Brown hair
    }
  },
  fighter: {
    name: 'Golden Hour',
    collection: micah,
    unlockDays: 0,
    description: 'Effortlessly radiant',
    rarity: 'starter',
    seedModifier: 'golden-hour-v5',
    customization: {
      earringsProbability: 80,
      glassesProbability: 0,
      shirtColor: ['fef3c7', 'fde68a', 'fcd34d'], // Soft gold
      mouth: ['laughing'],
      eyebrows: ['eyelashesUp'],
      baseColor: ['fbbcb8', 'fecaca'], // Fair with natural blush
      hairColor: ['d97706', 'b45309', '92400e'], // Caramel blonde
    }
  },
  hero: {
    name: 'Night Rider',
    collection: micah,
    unlockDays: 0,
    description: 'Smooth and sophisticated',
    rarity: 'starter',
    seedModifier: 'night-rider-v5',
    customization: {
      earringsProbability: 0,
      glassesProbability: 30,
      shirtColor: ['1f2937', '334155', '475569'], // Sleek black
      mouth: ['smile'],
      eyebrows: ['up'],
      baseColor: ['3c2415', '2f1c0f'], // Deep skin
      hairColor: ['18181b', '27272a', '3f3f46'], // Black hair
    }
  },
  champion: {
    name: 'Rose Gold',
    collection: micah,
    unlockDays: 0,
    description: 'Sweet but fierce',
    rarity: 'starter',
    seedModifier: 'rose-gold-v5',
    customization: {
      earringsProbability: 100,
      glassesProbability: 0,
      shirtColor: ['ec4899', 'f472b6', 'f9a8d4'], // Millennial pink
      mouth: ['smile'],
      eyebrows: ['eyelashesUp'],
      baseColor: ['fecaca', 'fee2e2'], // Peachy fair
      hairColor: ['713f12', '78350f', '92400e'], // Brunette
    }
  },
  phoenix: {
    name: 'Urban Legend',
    collection: micah,
    unlockDays: 0,
    description: 'Street smart style',
    rarity: 'starter',
    seedModifier: 'urban-legend-v5',
    customization: {
      earringsProbability: 0,
      glassesProbability: 50,
      shirtColor: ['059669', '10b981', '34d399'], // Fresh mint
      mouth: ['smile'],
      eyebrows: ['up'],
      baseColor: ['a78876', '8b6f5f'], // Medium olive
      hairColor: ['1f2937', '334155', '475569'], // Dark brown
    }
  }
};

export const PROGRESS_AVATARS = {
  weekWarrior: {
    name: 'Week Warrior',
    collection: micah,
    unlockDays: 7,
    description: 'Unlock at 7 days clean',
    rarity: 'rare',
    seedModifier: 'week-warrior',
    customization: {
      earringsProbability: 50,
      glassesProbability: 0,
      shirtColor: ['10b981', '34d399', '6ee7b7'], // Gradient greens
      baseColor: ['fed7aa', 'ffedd5'], // Warm skin tone
      hairColor: ['92400e', '78350f', '451a03'], // Brown hair
      mouth: ['smile'], // Happy expression for 1 week milestone!
      eyebrows: ['up'] // Positive eyebrows
    }
  },
  monthMaster: {
    name: 'Month Master',
    collection: micah,
    unlockDays: 30,
    description: 'Unlock at 30 days clean',
    rarity: 'rare',
    seedModifier: 'month-master',
    customization: {
      earringsProbability: 75,
      glassesProbability: 50,
      shirtColor: ['3b82f6', '60a5fa', '93c5fd'], // Gradient blues
      baseColor: ['8b6f5f', 'a78876'], // Medium brown skin
      hairColor: ['1f2937', '111827', '374151'], // Dark hair
      mouth: ['laughing'], // Big smile for 30 days!
      eyebrows: ['eyelashesUp'] // Friendly expression
    }
  },
  seasonSurvivor: {
    name: 'Season Survivor',
    collection: micah,
    unlockDays: 90,
    description: 'Unlock at 90 days clean',
    rarity: 'epic',
    seedModifier: 'season-survivor',
    customization: {
      earringsProbability: 100,
      glassesProbability: 75,
      shirtColor: ['8b5cf6', 'a78bfa', 'c4b5fd'], // Gradient purples
      baseColor: ['fbbcb8', 'fdedec'], // Fair skin
      hairColor: ['18181b', '27272a', '3f3f46'], // Changed to black hair
      specialAccessory: 'sunglasses',
      mouth: ['smile'], // Confident smile at 90 days
      eyebrows: ['up'] // Accomplished look
    }
  },
  yearLegend: {
    name: 'Year Legend',
    collection: micah,
    unlockDays: 365,
    description: 'Unlock at 1 year clean',
    rarity: 'legendary',
    seedModifier: 'year-legend',
    customization: {
      earringsProbability: 100,
      glassesProbability: 100,
      shirtColor: ['f59e0b', 'fbbf24', 'fde047'], // Gold gradient
      baseColor: ['5b3e31', '4a2f25'], // Dark skin
      hairColor: ['fbbf24', 'f59e0b', 'd97706'], // Golden hair
      specialAccessory: 'crown',
      mouth: ['laughing'], // Biggest smile for 1 year!
      eyebrows: ['eyelashesUp'] // Radiant expression
    }
  }
};

// Premium rotation helper - rotates every 30 days starting from today
const getPremiumRotation = (): number => {
  const startDate = new Date('2025-06-09'); // Today's date
  const now = new Date();
  const diffTime = now.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const rotation = Math.floor(diffDays / 30) % 3; // Cycle through 3 sets
  return rotation;
};

// Get days until next rotation
export const getDaysUntilRotation = (): number => {
  const startDate = new Date('2025-06-09'); // Today's date
  const now = new Date();
  const diffTime = now.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const daysInCurrentRotation = diffDays % 30;
  const daysUntilNext = 30 - daysInCurrentRotation;
  return daysUntilNext;
};

// Get the date of next rotation
export const getNextRotationDate = (): Date => {
  const daysUntil = getDaysUntilRotation();
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + daysUntil);
  nextDate.setHours(0, 0, 0, 0); // Set to midnight
  return nextDate;
};

// ALL PREMIUM AVATARS - For rotation system
const ALL_PREMIUM_AVATARS = {
  // ROTATION 1 (June 1-30, Sept 1-30, etc)
  goldWarrior: {
    name: 'The Alchemist',
    icon: 'trophy',
    collection: micah,
    unlockDays: -1, // Premium only
    description: 'Transform everything you touch',
    rarity: 'mythic',
    price: '$4.99',
    rotation: 0,
    seedModifier: 'gold-warrior-v3',
    customization: {
      earringsProbability: 0,
      glassesProbability: 0,
      shirtColor: ['1f2937', '334155', '475569'], // Sleek charcoal gradient
      baseColor: ['fbbcb8', 'fecaca'], // Healthy rosy glow
      hairColor: ['92400e', '78350f', '713f12'], // Rich chocolate brown
      mouth: ['laughing'], // Confident smile
      eyebrows: ['eyelashesUp'] // Attractive raised brows
    }
  },
  diamondChampion: {
    name: 'Prismatic Soul',
    icon: 'diamond',
    collection: micah,
    unlockDays: -1,
    description: 'A thousand facets, one purpose',
    rarity: 'mythic',
    price: '$9.99',
    rotation: 0,
    seedModifier: 'diamond-champion-v4',
    customization: {
      earringsProbability: 50,
      glassesProbability: 0,
      shirtColor: ['0f172a', '1e293b', '334155'], // Sophisticated black
      baseColor: ['5b3e31', '4a2f25'], // Rich mahogany skin
      hairColor: ['fbbf24', 'f59e0b', 'd97706'], // Honey blonde
      mouth: ['smile'], // Confident smile
      eyebrows: ['up'] // Strong gaze
    }
  },
  platinumPhoenix: {
    name: 'Ember Rising',
    icon: 'flame',
    collection: micah,
    unlockDays: -1,
    description: 'From ashes, something beautiful',
    rarity: 'mythic',
    price: '$7.99',
    rotation: 0,
    seedModifier: 'platinum-phoenix-v3',
    customization: {
      earringsProbability: 50,
      glassesProbability: 0,
      shirtColor: ['dc2626', 'ef4444', 'f87171'], // Passionate red
      baseColor: ['8b5a3c', '704a2b'], // Rich caramel skin
      hairColor: ['fbbf24', 'f59e0b', 'd97706'], // Golden blonde waves
      mouth: ['laughing'], // Radiant joy
      eyebrows: ['up'] // Playful confidence
    }
  },
  cosmicHero: {
    name: 'Void Walker',
    icon: 'planet',
    collection: micah,
    unlockDays: -1,
    description: 'Between worlds, beyond limits',
    rarity: 'mythic',
    price: '$6.99',
    rotation: 0,
    seedModifier: 'cosmic-hero-v3',
    customization: {
      earringsProbability: 0,
      glassesProbability: 30,
      shirtColor: ['0f172a', '1e293b', '334155'], // Midnight sophistication
      baseColor: ['5b3e31', '4a2f25'], // Deep mahogany
      hairColor: ['f5f5f4', 'e7e5e4', 'd6d3d1'], // Platinum silver
      mouth: ['smile'], // Mysterious allure
      eyebrows: ['up'] // Intense gaze
    }
  },
  emeraldGuardian: {
    name: 'Verdant Keeper',
    icon: 'shield',
    collection: micah,
    unlockDays: -1,
    description: 'Ancient wisdom, eternal growth',
    rarity: 'mythic',
    price: '$5.99',
    rotation: 0,
    seedModifier: 'emerald-guardian-v3',
    customization: {
      earringsProbability: 90,
      glassesProbability: 0,
      shirtColor: ['fef3c7', 'fde68a', 'fcd34d'], // Warm honey gold
      baseColor: ['a78876', '8b6f5f'], // Warm bronze
      hairColor: ['18181b', '27272a', '3f3f46'], // Deep raven black
      mouth: ['laughing'], // Warm genuine smile
      eyebrows: ['eyelashesUp'] // Friendly charm
    }
  },
  pearlDancer: {
    name: 'Pearl Dancer',
    icon: 'star',
    collection: micah,
    unlockDays: -1,
    description: 'Grace in every moment',
    rarity: 'mythic',
    price: '$6.99',
    rotation: 0,
    seedModifier: 'pearl-dancer-v1',
    customization: {
      earringsProbability: 100,
      glassesProbability: 0,
      shirtColor: ['f0abfc', 'e879f9', 'd946ef'], // Soft orchid purple
      baseColor: ['fecaca', 'fee2e2'], // Fair porcelain skin
      hairColor: ['d6d3d1', 'e7e5e4', 'f5f5f4'], // Platinum blonde
      mouth: ['smile'], // Graceful smile
      eyebrows: ['eyelashesUp'] // Elegant expression
    }
  },
  moonlightSiren: {
    name: 'Moonlight Siren',
    icon: 'moon',
    collection: micah,
    unlockDays: -1,
    description: 'Dreams made of stardust',
    rarity: 'mythic',
    price: '$7.99',
    rotation: 1,
    seedModifier: 'moonlight-siren-v1',
    customization: {
      earringsProbability: 100,
      glassesProbability: 0,
      shirtColor: ['0ea5e9', '06b6d4', '0891b2'], // Ocean teal
      baseColor: ['fecaca', 'fee2e2'], // Fair pink-toned skin
      hairColor: ['92400e', '78350f', '713f12'], // Warm brunette
      mouth: ['laughing'], // Joyful laugh
      eyebrows: ['eyelashesUp'] // Playful charm
    }
  },
  
  // ROTATION 2 (July 1-31, Oct 1-31, etc)
  rubyKnight: {
    name: 'Crimson Echo',
    icon: 'heart',
    collection: micah,
    unlockDays: -1,
    description: 'The pulse that never fades',
    rarity: 'mythic',
    price: '$5.99',
    rotation: 1,
    seedModifier: 'ruby-knight-v3',
    customization: {
      earringsProbability: 0,
      glassesProbability: 0,
      shirtColor: ['7c3aed', '8b5cf6', 'a78bfa'], // Royal purple
      baseColor: ['fbbcb8', 'fecaca'], // Porcelain with blush
      hairColor: ['dc2626', 'b91c1c', '991b1b'], // Deep cherry red
      mouth: ['smile'], // Seductive smile
      eyebrows: ['up'] // Confident arch
    }
  },
  sapphireWizard: {
    name: 'Azure Enigma',
    icon: 'sparkles',
    collection: micah,
    unlockDays: -1,
    description: 'Questions answered in silence',
    rarity: 'mythic',
    price: '$8.99',
    rotation: 1,
    seedModifier: 'sapphire-wizard-v3',
    customization: {
      earringsProbability: 0,
      glassesProbability: 60,
      shirtColor: ['1e293b', '334155', '475569'], // Storm gray elegance
      baseColor: ['fed7aa', 'ffedd5'], // Golden tan
      hairColor: ['713f12', '78350f', '92400e'], // Chestnut brown
      mouth: ['smile'], // Intellectual charm
      eyebrows: ['eyelashesUp'] // Sophisticated look
    }
  },
  amethystSage: {
    name: 'Violet Whisper',
    icon: 'infinite',
    collection: micah,
    unlockDays: -1,
    description: 'Truth spoken through dreams',
    rarity: 'mythic',
    price: '$7.99',
    rotation: 1,
    seedModifier: 'amethyst-sage-v3',
    customization: {
      earringsProbability: 100,
      glassesProbability: 0,
      shirtColor: ['ec4899', 'f472b6', 'f9a8d4'], // Rose pink gradient
      baseColor: ['5b3e31', '4a2f25'], // Rich espresso
      hairColor: ['fbbf24', 'f59e0b', 'd97706'], // Honey blonde
      mouth: ['laughing'], // Bright engaging smile
      eyebrows: ['eyelashesUp'] // Flirty expression
    }
  },
  obsidianNinja: {
    name: 'Shadow Weaver',
    icon: 'contrast',
    collection: micah,
    unlockDays: -1,
    description: 'Unseen, unheard, unstoppable',
    rarity: 'mythic',
    price: '$9.99',
    rotation: 1,
    seedModifier: 'obsidian-ninja-v3',
    customization: {
      earringsProbability: 0,
      glassesProbability: 0,
      shirtColor: ['dc2626', 'ef4444', 'f87171'], // Bold crimson
      baseColor: ['c4b5a6', 'bfae9f'], // Olive tone
      hairColor: ['18181b', '09090b', '000000'], // Ink black
      mouth: ['smile'], // Subtle smirk
      eyebrows: ['up'] // Sharp focus
    }
  },
  bronzeTitan: {
    name: 'Copper Dawn',
    icon: 'barbell',
    collection: micah,
    unlockDays: -1,
    description: 'First light, lasting strength',
    rarity: 'mythic',
    price: '$4.99',
    rotation: 1,
    seedModifier: 'bronze-titan-v3',
    customization: {
      earringsProbability: 30,
      glassesProbability: 0,
      shirtColor: ['0f172a', '1e293b', '334155'], // Navy elegance
      baseColor: ['3c2415', '2f1c0f'], // Deep ebony
      hairColor: ['52525b', '71717a', 'a1a1aa'], // Silver fox
      mouth: ['laughing'], // Powerful smile
      eyebrows: ['eyelashesUp'] // Strong presence
    }
  },
  
  // ROTATION 3 (Aug 1-31, Nov 1-30, etc)
  crystalMage: {
    name: 'Glass Oracle',
    icon: 'prism',
    collection: micah,
    unlockDays: -1,
    description: 'See through, see beyond',
    rarity: 'mythic',
    price: '$6.99',
    rotation: 2,
    seedModifier: 'crystal-mage-v3',
    customization: {
      earringsProbability: 80,
      glassesProbability: 0,
      shirtColor: ['fef3c7', 'fde68a', 'fcd34d'], // Golden hour
      baseColor: ['fbbcb8', 'fdedec'], // Pearl complexion
      hairColor: ['7c3aed', '6d28d9', '5b21b6'], // Violet dreams
      mouth: ['smile'], // Enchanting smile
      eyebrows: ['up'] // Mesmerizing look
    }
  },
  fireElemental: {
    name: 'Fever Dream',
    icon: 'flame',
    collection: micah,
    unlockDays: -1,
    description: 'Too bright to touch, too warm to forget',
    rarity: 'mythic',
    price: '$8.99',
    rotation: 2,
    seedModifier: 'fire-elemental-v3',
    customization: {
      earringsProbability: 0,
      glassesProbability: 0,
      shirtColor: ['1f2937', '334155', '475569'], // Smoke gray
      baseColor: ['7c4e3a', '6b4329'], // Warm copper
      hairColor: ['dc2626', 'ef4444', 'f87171'], // Fiery red
      mouth: ['laughing'], // Electric energy
      eyebrows: ['up'] // Fierce attraction
    }
  },
  iceEmperor: {
    name: 'Frost Sovereign',
    icon: 'snow',
    collection: micah,
    unlockDays: -1,
    description: 'Cold calculation, perfect execution',
    rarity: 'mythic',
    price: '$9.99',
    rotation: 2,
    seedModifier: 'ice-emperor-v3',
    customization: {
      earringsProbability: 0,
      glassesProbability: 40,
      shirtColor: ['2563eb', '3b82f6', '60a5fa'], // Royal blue
      baseColor: ['b08d7a', '9a7968'], // Warm beige
      hairColor: ['18181b', '27272a', '3f3f46'], // Sleek black
      mouth: ['smile'], // Cool confidence
      eyebrows: ['up'] // Regal bearing
    }
  },
  stormBringer: {
    name: 'Static Dreamer',
    icon: 'thunderstorm',
    collection: micah,
    unlockDays: -1,
    description: 'Charged thoughts, electric ambitions',
    rarity: 'mythic',
    price: '$7.99',
    rotation: 2,
    seedModifier: 'storm-bringer-v3',
    customization: {
      earringsProbability: 100,
      glassesProbability: 0,
      shirtColor: ['ec4899', 'f472b6', 'f9a8d4'], // Electric pink
      baseColor: ['ddb8a6', 'd4a995'], // Warm sand
      hairColor: ['92400e', '78350f', '713f12'], // Auburn waves
      mouth: ['laughing'], // Magnetic smile
      eyebrows: ['eyelashesUp'] // Captivating eyes
    }
  },
  earthShaman: {
    name: 'Terra Mystic',
    icon: 'earth',
    collection: micah,
    unlockDays: -1,
    description: 'Roots deep, crown high',
    rarity: 'mythic',
    price: '$5.99',
    rotation: 2,
    seedModifier: 'earth-shaman-v3',
    customization: {
      earringsProbability: 50,
      glassesProbability: 0,
      shirtColor: ['0f172a', '1e293b', '334155'], // Sophisticated black
      baseColor: ['4a2f25', '3d251b'], // Rich mocha
      hairColor: ['fbbf24', 'f59e0b', 'd97706'], // Golden highlights
      mouth: ['smile'], // Wise warmth
      eyebrows: ['eyelashesUp'] // Knowing gaze
    }
  },
  roseQuartz: {
    name: 'Rose Quartz',
    icon: 'rose',
    collection: micah,
    unlockDays: -1,
    description: 'Love in its purest form',
    rarity: 'mythic',
    price: '$5.99',
    rotation: 2,
    seedModifier: 'rose-quartz-v1',
    customization: {
      earringsProbability: 100,
      glassesProbability: 0,
      shirtColor: ['f472b6', 'ec4899', 'db2777'], // Rose pink gradient
      baseColor: ['fecaca', 'fee2e2'], // Fair blush skin
      hairColor: ['d97706', 'b45309', '92400e'], // Strawberry blonde
      mouth: ['smile'], // Sweet smile
      eyebrows: ['eyelashesUp'] // Feminine grace
    }
  }
};

// Get current premium avatars based on rotation
export const PREMIUM_AVATARS = Object.entries(ALL_PREMIUM_AVATARS)
  .filter(([, config]) => config.rotation === getPremiumRotation())
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

// Combine all avatars for easy access (includes ALL premium avatars for validation)
export const AVATAR_STYLES = {
  ...STARTER_AVATARS,
  ...PROGRESS_AVATARS,
  ...ALL_PREMIUM_AVATARS, // Include all premium avatars for style validation
};

interface DicebearAvatarProps {
  userId: string; // User ID or any unique identifier
  size?: 'small' | 'medium' | 'large' | 'xlarge' | number; // Also accept number for custom sizes
  daysClean?: number; // Days clean to determine rarity
  style?: keyof typeof AVATAR_STYLES; // Avatar style to use
  badge?: string;
  badgeIcon?: string;
  badgeColor?: string;
  showFrame?: boolean;
  backgroundColor?: string;
}

type AvatarRarity = 'starter' | 'common' | 'rare' | 'epic' | 'legendary' | 'unique' | 'mythic';

const RARITY_COLORS: Record<AvatarRarity, string[]> = {
  starter: ['#10B981', '#34D399'],
  common: ['#6B7280', '#9CA3AF'],
  rare: ['#3B82F6', '#60A5FA'],
  epic: ['#8B5CF6', '#A78BFA'],
  legendary: ['#F59E0B', '#FCD34D'],
  unique: ['#10B981', '#34D399'],
  mythic: ['#EC4899', '#F472B6', '#FB923C'], // Animated gradient effect
};

const DicebearAvatar: React.FC<DicebearAvatarProps> = ({ 
  userId,
  size = 'medium',
  daysClean = 0,
  style = 'warrior',
  badge,
  badgeIcon,
  badgeColor,
  showFrame = true,
  backgroundColor = '#1A1A2E',
}) => {
  const sizeMap = {
    small: { container: 40, avatar: 36, badge: 18, badgeIcon: 11 },
    medium: { container: 56, avatar: 52, badge: 22, badgeIcon: 13 },
    large: { container: 80, avatar: 76, badge: 28, badgeIcon: 16 },
    xlarge: { container: 120, avatar: 116, badge: 36, badgeIcon: 20 },
  };

  // Handle numeric size
  const dimensions = typeof size === 'number' 
    ? { 
        container: size, 
        avatar: size - 4, 
        badge: Math.round(size * 0.3), 
        badgeIcon: Math.round(size * 0.17) 
      }
    : sizeMap[size] || sizeMap.medium; // Fallback to medium if size not found
  
  const avatarConfig = AVATAR_STYLES[style];
  const frameColors = RARITY_COLORS[avatarConfig?.rarity || 'starter'] || RARITY_COLORS.starter;

  // Generate avatar SVG - moved before conditional return
  const avatarSvg = useMemo(() => {
    const config = avatarConfig || AVATAR_STYLES.warrior; // Fallback config
    try {
      const avatarStyle = config.collection;
      // Use seedModifier if available for variety
      const seed = config.seedModifier ? `${userId}-${config.seedModifier}` : userId;
      
      interface DicebearOptions {
        seed: string;
        size: number;
        backgroundColor: string[];
        earringsProbability?: number;
        glassesProbability?: number;
        facialHairProbability?: number;
        baseColor?: string[];
        hairColor?: string[];
        shirtColor?: string[];
        mouth?: string[];
        eyebrows?: string[];
      }
      
      const options: DicebearOptions = {
        seed,
        size: dimensions.avatar,
        backgroundColor: config.rarity === 'mythic' ? ['transparent'] : [backgroundColor.replace('#', '')],
      };

      // Apply customization from avatar config
      const customization = config.customization;
      if (customization) {
        // Basic customization
        options.earringsProbability = customization.earringsProbability || 0;
        options.glassesProbability = customization.glassesProbability || 0;
        options.facialHairProbability = 0; // Always clean-shaven for consistency
        
        // Colors
        if (customization.baseColor) {
          options.baseColor = customization.baseColor;
        } else {
          options.baseColor = ['f9c9b6', 'ac6651']; // Default skin tones
        }
        
        if (customization.hairColor) {
          options.hairColor = customization.hairColor;
        } else {
          options.hairColor = ['2c1b18', '4a312c', '724133', 'a55728']; // Default hair colors
        }
        
        if (customization.shirtColor) {
          options.shirtColor = customization.shirtColor;
        }
        
        // Add mouth and eyebrows customization for happy expressions
        if (customization.mouth) {
          options.mouth = customization.mouth;
        }
        
        if (customization.eyebrows) {
          options.eyebrows = customization.eyebrows;
        }
      }
      
      const avatar = createAvatar(avatarStyle, options);
      return avatar.toString();
    } catch (error) {
      console.error('Error generating Dicebear avatar:', error);
      // Return a simple placeholder SVG
      return '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#8B5CF6"/></svg>';
    }
  }, [userId, dimensions.avatar, backgroundColor, style, avatarConfig]);
  
  // Fallback to warrior if style doesn't exist
  if (!avatarConfig) {
    console.warn(`Avatar style '${style}' not found, falling back to 'warrior'`);
    return (
      <DicebearAvatar
        userId={userId}
        size={size}
        daysClean={daysClean}
        style="warrior"
        badge={badge}
        badgeIcon={badgeIcon}
        badgeColor={badgeColor}
        showFrame={showFrame}
        backgroundColor={backgroundColor}
      />
    );
  }

  // Achievement badge is now handled by getBadgeForDaysClean in badges.ts
  // This ensures consistency across the app

  return (
    <View style={[styles.container, { width: dimensions.container, height: dimensions.container }]}>
      {showFrame ? (
        <LinearGradient
          colors={frameColors}
          style={[styles.frame, { 
            width: dimensions.container, 
            height: dimensions.container,
            borderRadius: dimensions.container / 2 
          }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={[styles.innerCircle, { 
            width: dimensions.container - 4, 
            height: dimensions.container - 4,
            borderRadius: (dimensions.container - 4) / 2,
            overflow: 'hidden',
            backgroundColor: avatarConfig?.rarity === 'mythic' ? 'transparent' : '#1A1A2E',
          }]}>
            <SvgXml xml={avatarSvg} width={dimensions.avatar} height={dimensions.avatar} />
          </View>
        </LinearGradient>
      ) : (
        <View style={[styles.simpleContainer, { 
          width: dimensions.container, 
          height: dimensions.container,
          borderRadius: dimensions.container / 2,
          overflow: 'hidden',
        }]}>
          <SvgXml xml={avatarSvg} width={dimensions.avatar} height={dimensions.avatar} />
        </View>
      )}
      
      {(badge || badgeIcon) && (
        <View style={[
          styles.badge, 
          { 
            width: dimensions.badge, 
            height: dimensions.badge,
            borderRadius: dimensions.badge / 2,
            bottom: -2,
            right: -2,
            backgroundColor: badgeColor || '#1A1A2E',
          }
        ]}>
          <View style={[
            styles.badgeInner,
            {
              width: dimensions.badge - 4,
              height: dimensions.badge - 4,
              borderRadius: (dimensions.badge - 4) / 2,
            }
          ]}>
            {badgeIcon ? (
              <Ionicons 
                name={badgeIcon as keyof typeof Ionicons.glyphMap} 
                size={dimensions.badgeIcon} 
                color="#FFFFFF" 
              />
            ) : badge ? (
              <Text style={[styles.badgeEmoji, { fontSize: dimensions.badgeIcon }]}>{badge}</Text>
            ) : null}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  frame: {
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  simpleContainer: {
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  badge: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0F172A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },
  badgeInner: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeEmoji: {
    fontWeight: '600',
  },
});

export default DicebearAvatar;

// Utility function to generate unique seed from emoji (for migration)
export const generateSeedFromEmoji = (emoji: string, userId?: string): string => {
  // If we have a user ID, use it for truly unique avatars
  if (userId) return userId;
  
  // Otherwise, create a consistent seed from the emoji
  // This ensures the same emoji always generates the same avatar
  const emojiCode = emoji.split('').map(char => char.charCodeAt(0)).join('');
  return `emoji-${emojiCode}`;
};

// Utility to determine rarity based on days clean
export const getRarityFromDays = (daysClean: number): 'common' | 'rare' | 'epic' | 'legendary' => {
  if (daysClean >= 365) return 'legendary';
  if (daysClean >= 100) return 'epic';
  if (daysClean >= 30) return 'rare';
  return 'common';
}; 