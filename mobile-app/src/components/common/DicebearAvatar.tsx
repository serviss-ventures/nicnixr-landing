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
  collection: object; // DiceBear collection type - specific type depends on library version
  unlockDays: number;
  description: string;
  rarity: AvatarRarity;
  seedModifier?: string;
  customization?: AvatarCustomization;
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
      shirtColor: ['0f172a', '1e293b', '334155'], // Deep midnight blue
      mouth: ['smile'],
      eyebrows: ['up'],
      baseColor: ['f3d5b1', 'e7bc91'], // Natural warm skin
      hairColor: ['44403c', '57534e', '78716c'], // Sophisticated brown
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
      earringsProbability: 20,
      glassesProbability: 0,
      shirtColor: ['fafaf9', 'f5f5f4', 'e7e5e4'], // Clean white
      mouth: ['laughing'],
      eyebrows: ['eyelashesUp'],
      baseColor: ['fecaca', 'fbbcb8'], // Fair with subtle warmth
      hairColor: ['d4a574', 'b08d5d', 'a07c4f'], // Honey blonde
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
      glassesProbability: 20,
      shirtColor: ['18181b', '27272a', '3f3f46'], // Charcoal
      mouth: ['smile'],
      eyebrows: ['up'],
      baseColor: ['8d5524', '6f4518'], // Deep warm skin
      hairColor: ['18181b', '27272a', '3f3f46'], // Black
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
      earringsProbability: 40,
      glassesProbability: 0,
      shirtColor: ['fce7f3', 'fbcfe8', 'f9a8d4'], // Soft pink
      mouth: ['smile'],
      eyebrows: ['eyelashesUp'],
      baseColor: ['fde2cc', 'fcd9bd'], // Peachy glow
      hairColor: ['92400e', '78350f', '713f12'], // Auburn
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
      glassesProbability: 30,
      shirtColor: ['4b5563', '6b7280', '9ca3af'], // Cool gray
      mouth: ['smile'],
      eyebrows: ['up'],
      baseColor: ['b08968', '9a7758'], // Medium tan
      hairColor: ['3f3f46', '52525b', '71717a'], // Steel gray
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
    seedModifier: 'week-warrior-v3-hair',
    customization: {
      earringsProbability: 0,
      glassesProbability: 0,
      shirtColor: ['fbbf24', 'f59e0b', 'd97706'], // Amber gradient
      baseColor: ['f3d5b1', 'e7bc91'], // Healthy glow
      hairColor: ['713f12', '92400e', 'b45309'], // Rich brown
      mouth: ['laughing'], // Proud smile
      eyebrows: ['eyelashesUp'] // Confident expression
    }
  },
  monthMaster: {
    name: 'Month Master',
    collection: micah,
    unlockDays: 30,
    description: 'Unlock at 30 days clean',
    rarity: 'rare',
    seedModifier: 'month-master-v3-hair',
    customization: {
      earringsProbability: 30,
      glassesProbability: 0,
      shirtColor: ['93c5fd', '60a5fa', '3b82f6'], // Blue gradient
      baseColor: ['8d5524', '6f4518'], // Rich deep skin
      hairColor: ['1f2937', '374151', '4b5563'], // Dark blue-gray
      mouth: ['laughing'], // Triumphant smile
      eyebrows: ['eyelashesUp'] // Accomplished look
    }
  },
  seasonSurvivor: {
    name: 'Season Survivor',
    collection: micah,
    unlockDays: 90,
    description: 'Unlock at 90 days clean',
    rarity: 'epic',
    seedModifier: 'season-survivor-v3-hair',
    customization: {
      earringsProbability: 20,
      glassesProbability: 20,
      shirtColor: ['86efac', '4ade80', '22c55e'], // Green gradient
      baseColor: ['b08968', '9a7758'], // Bronze warrior skin
      hairColor: ['059669', '047857', '065f46'], // Forest green
      specialAccessory: 'sunglasses',
      mouth: ['smile'], // Cool confidence
      eyebrows: ['up'] // Focused intensity
    }
  },
  yearLegend: {
    name: 'Year Legend',
    collection: micah,
    unlockDays: 365,
    description: 'Unlock at 1 year clean',
    rarity: 'legendary',
    seedModifier: 'year-legend-v3-hair',
    customization: {
      earringsProbability: 50,
      glassesProbability: 0,
      shirtColor: ['fde047', 'facc15', 'eab308'], // Gold gradient
      baseColor: ['fde2cc', 'fcd9bd'], // Radiant fair skin
      hairColor: ['facc15', 'f59e0b', 'd97706'], // Golden
      specialAccessory: 'crown',
      mouth: ['laughing'], // Pure joy
      eyebrows: ['eyelashesUp'] // Legendary presence
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
    collection: micah,
    unlockDays: -1, // Premium only
    description: 'Transform everything you touch',
    rarity: 'mythic',
    price: '$4.99',
    rotation: 0,
    seedModifier: 'gold-warrior-v4-hair',
    customization: {
      earringsProbability: 0,
      glassesProbability: 0,
      shirtColor: ['fde047', 'facc15', 'eab308'], // Gold gradient
      baseColor: ['fecaca', 'fbbcb8'], // Porcelain glow
      hairColor: ['18181b', '27272a', '3f3f46'], // Sleek black
      mouth: ['laughing'], // Confident smile
      eyebrows: ['eyelashesUp'] // Attractive raised brows
    }
  },
  diamondChampion: {
    name: 'Prismatic Soul',
    collection: micah,
    unlockDays: -1,
    description: 'A thousand facets, one purpose',
    rarity: 'mythic',
    price: '$9.99',
    rotation: 0,
    seedModifier: 'diamond-champion-v5-hair',
    customization: {
      earringsProbability: 20,
      glassesProbability: 0,
      shirtColor: ['e0e7ff', 'c7d2fe', 'a5b4fc'], // Soft indigo
      baseColor: ['8d5524', '6f4518'], // Rich mahogany skin
      hairColor: ['d4d4d8', 'a1a1aa', '71717a'], // Platinum gray
      mouth: ['smile'], // Confident smile
      eyebrows: ['up'] // Strong gaze
    }
  },
  platinumPhoenix: {
    name: 'Ember Rising',
    collection: micah,
    unlockDays: -1,
    description: 'From ashes, something beautiful',
    rarity: 'mythic',
    price: '$7.99',
    rotation: 0,
    seedModifier: 'platinum-phoenix-v3',
    customization: {
      earringsProbability: 30,
      glassesProbability: 0,
      shirtColor: ['fecaca', 'fbbcb8', 'fecdd3'], // Soft rose
      baseColor: ['b08968', '9a7758'], // Warm bronze skin
      hairColor: ['b45309', '92400e', '78350f'], // Auburn
      mouth: ['laughing'], // Radiant joy
      eyebrows: ['up'] // Playful confidence
    }
  },
  cosmicHero: {
    name: 'Void Walker',
    collection: micah,
    unlockDays: -1,
    description: 'Between worlds, beyond limits',
    rarity: 'mythic',
    price: '$6.99',
    rotation: 0,
    seedModifier: 'cosmic-hero-v5-hair',
    customization: {
      earringsProbability: 0,
      glassesProbability: 20,
      shirtColor: ['1e293b', '334155', '475569'], // Deep slate
      baseColor: ['6f4518', '8d5524'], // Deep mahogany
      hairColor: ['71717a', 'a1a1aa', 'd4d4d8'], // Silver
      mouth: ['smile'], // Mysterious allure
      eyebrows: ['up'] // Intense gaze
    }
  },
  emeraldGuardian: {
    name: 'Verdant Keeper',
    collection: micah,
    unlockDays: -1,
    description: 'Ancient wisdom, eternal growth',
    rarity: 'mythic',
    price: '$5.99',
    rotation: 0,
    seedModifier: 'emerald-guardian-v3',
    customization: {
      earringsProbability: 40,
      glassesProbability: 0,
      shirtColor: ['d1fae5', 'a7f3d0', '6ee7b7'], // Mint green
      baseColor: ['b08968', '9a7758'], // Warm bronze
      hairColor: ['047857', '059669', '10b981'], // Forest green
      mouth: ['laughing'], // Warm genuine smile
      eyebrows: ['eyelashesUp'] // Friendly charm
    }
  },
  pearlDancer: {
    name: 'Pearl Dancer',
    collection: micah,
    unlockDays: -1,
    description: 'Grace in every moment',
    rarity: 'mythic',
    price: '$6.99',
    rotation: 0,
    seedModifier: 'pearl-dancer-v3-hair',
    customization: {
      earringsProbability: 50,
      glassesProbability: 0,
      shirtColor: ['fafaf9', 'f5f5f4', 'e7e5e4'], // Pearl white
      baseColor: ['fde2cc', 'fcd9bd'], // Fair porcelain skin
      hairColor: ['facc15', 'f59e0b', 'd97706'], // Golden blonde
      mouth: ['smile'], // Graceful smile
      eyebrows: ['eyelashesUp'] // Elegant expression
    }
  },
  moonlightSiren: {
    name: 'Moonlight Siren',
    collection: micah,
    unlockDays: -1,
    description: 'Dreams made of stardust',
    rarity: 'mythic',
    price: '$7.99',
    rotation: 1,
    seedModifier: 'moonlight-siren-v1',
    customization: {
      earringsProbability: 60,
      glassesProbability: 0,
      shirtColor: ['dbeafe', 'bfdbfe', '93c5fd'], // Sky blue
      baseColor: ['fecaca', 'fbbcb8'], // Fair pink-toned skin
      hairColor: ['3f3f46', '52525b', '71717a'], // Cool gray
      mouth: ['laughing'], // Joyful laugh
      eyebrows: ['eyelashesUp'] // Playful charm
    }
  },
  
  // ROTATION 2 (July 1-31, Oct 1-31, etc)
  rubyKnight: {
    name: 'Crimson Echo',
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
      shirtColor: ['f3e8ff', 'e9d5ff', 'd8b4fe'], // Soft purple
      baseColor: ['fecaca', 'fbbcb8'], // Porcelain with blush
      hairColor: ['7f1d1d', '991b1b', 'b91c1c'], // Deep wine
      mouth: ['smile'], // Seductive smile
      eyebrows: ['up'] // Confident arch
    }
  },
  sapphireWizard: {
    name: 'Azure Enigma',
    collection: micah,
    unlockDays: -1,
    description: 'Questions answered in silence',
    rarity: 'mythic',
    price: '$8.99',
    rotation: 1,
    seedModifier: 'sapphire-wizard-v3',
    customization: {
      earringsProbability: 0,
      glassesProbability: 30,
      shirtColor: ['4b5563', '6b7280', '9ca3af'], // Storm gray
      baseColor: ['f3d5b1', 'e7bc91'], // Golden tan
      hairColor: ['374151', '4b5563', '6b7280'], // Cool gray
      mouth: ['smile'], // Intellectual charm
      eyebrows: ['eyelashesUp'] // Sophisticated look
    }
  },
  amethystSage: {
    name: 'Violet Whisper',
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
  borderColor?: string; // Border color for avatar frame
}

type AvatarRarity = 'starter' | 'common' | 'rare' | 'epic' | 'legendary' | 'unique' | 'mythic';

const RARITY_COLORS: Record<AvatarRarity, string[]> = {
  starter: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
  common: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
  rare: ['rgba(251, 191, 36, 0.2)', 'rgba(251, 191, 36, 0.1)'], // Amber
  epic: ['rgba(147, 197, 253, 0.2)', 'rgba(147, 197, 253, 0.1)'], // Blue  
  legendary: ['rgba(134, 239, 172, 0.2)', 'rgba(134, 239, 172, 0.1)'], // Green
  unique: ['rgba(250, 204, 21, 0.2)', 'rgba(250, 204, 21, 0.1)'], // Gold
  mythic: ['rgba(192, 132, 252, 0.2)', 'rgba(192, 132, 252, 0.1)'], // Purple
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
  backgroundColor = '#0F172A',
  borderColor,
}) => {
  const sizeMap = {
    small: { container: 40, avatar: 36, badge: 16, badgeIcon: 10 },
    medium: { container: 56, avatar: 52, badge: 20, badgeIcon: 12 },
    large: { container: 80, avatar: 76, badge: 26, badgeIcon: 15 },
    xlarge: { container: 120, avatar: 116, badge: 34, badgeIcon: 19 },
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
  const frameColors = RARITY_COLORS[avatarConfig?.rarity as AvatarRarity] || RARITY_COLORS.starter;

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
        hairProbability?: number;
        hair?: ("fonze" | "mrT" | "dougFunny" | "mrClean" | "dannyPhantom" | "full" | "turban" | "pixie")[];
        baseColor?: string[];
        hairColor?: string[];
        shirtColor?: string[];
        mouth?: ("smile" | "laughing" | "surprised" | "nervous" | "sad" | "pucker" | "frown" | "smirk")[];
        eyebrows?: ("up" | "eyelashesUp" | "down" | "eyelashesDown")[];
      }
      
      const options: DicebearOptions = {
        seed,
        size: dimensions.avatar,
        backgroundColor: config.rarity === 'mythic' ? ['transparent'] : [backgroundColor.replace('#', '')],
      };

      // Ensure hair for premium avatars (mythic rarity)
      options.hairProbability = config.rarity === 'mythic' ? 100 : 80; // 100% hair for premium, 80% for others
      options.facialHairProbability = 0; // Always clean-shaven for consistency
      
      // Force specific hair styles for premium and progress avatars to ensure they have hair
      if (config.rarity === 'mythic' || config.rarity === 'rare' || config.rarity === 'epic' || config.rarity === 'legendary') {
        options.hair = ["full", "pixie", "turban", "fonze"]; // Multiple options for variety but all have visible hair
      }

      // Apply customization from avatar config
      const customization = config.customization;
      if (customization) {
        // Basic customization
        options.earringsProbability = customization.earringsProbability || 0;
        options.glassesProbability = customization.glassesProbability || 0;
        
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
          options.mouth = customization.mouth as ("smile" | "laughing" | "surprised" | "nervous" | "sad" | "pucker" | "frown" | "smirk")[];
        }
        
        if (customization.eyebrows) {
          options.eyebrows = customization.eyebrows as ("up" | "eyelashesUp" | "down" | "eyelashesDown")[];
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
        borderColor ? (
          <View style={[styles.frame, { 
            width: dimensions.container, 
            height: dimensions.container,
            borderRadius: dimensions.container / 2,
            borderWidth: 2,
            borderColor: borderColor,
            backgroundColor: 'transparent',
          }]}>
            <View style={[styles.innerCircle, { 
              width: dimensions.container - 4, 
              height: dimensions.container - 4,
              borderRadius: (dimensions.container - 4) / 2,
              overflow: 'hidden',
              backgroundColor: avatarConfig?.rarity === 'mythic' ? 'transparent' : '#0F172A',
            }]}>
              <SvgXml xml={avatarSvg} width={dimensions.avatar} height={dimensions.avatar} />
            </View>
          </View>
        ) : (
          <LinearGradient
            colors={frameColors as any}
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
              backgroundColor: avatarConfig?.rarity === 'mythic' ? 'transparent' : '#0F172A',
            }]}>
              <SvgXml xml={avatarSvg} width={dimensions.avatar} height={dimensions.avatar} />
            </View>
          </LinearGradient>
        )
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
            backgroundColor: badgeColor ? badgeColor + '20' : 'rgba(0, 0, 0, 0.6)',
          }
        ]}>
          <View style={[
            styles.badgeInner,
            {
              width: dimensions.badge - 2,
              height: dimensions.badge - 2,
              borderRadius: (dimensions.badge - 2) / 2,
            }
          ]}>
            {badgeIcon ? (
              <Ionicons 
                name={badgeIcon as keyof typeof Ionicons.glyphMap} 
                size={dimensions.badgeIcon} 
                color={badgeColor || 'rgba(255, 255, 255, 0.9)'} 
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
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  simpleContainer: {
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  badge: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  badgeInner: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeEmoji: {
    fontWeight: '500',
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

// Helper function to get consistent avatar border colors based on days clean
export const getAvatarBorderColor = (daysClean: number): string => {
  if (daysClean >= 365) return 'rgba(250, 204, 21, 0.8)'; // Gold - 1 year+
  if (daysClean >= 90) return 'rgba(134, 239, 172, 0.8)'; // Green - 3 months+
  if (daysClean >= 30) return 'rgba(147, 197, 253, 0.8)'; // Blue - 1 month+
  if (daysClean >= 7) return 'rgba(251, 191, 36, 0.7)'; // Amber - 1 week+
  return 'rgba(255, 255, 255, 0.5)'; // White - early days
};

// Lighter version for UI elements (like journey icons)
export const getAvatarBorderColorLight = (daysClean: number): string => {
  if (daysClean >= 365) return 'rgba(250, 204, 21, 0.5)'; // Gold
  if (daysClean >= 90) return 'rgba(134, 239, 172, 0.5)'; // Green
  if (daysClean >= 30) return 'rgba(147, 197, 253, 0.5)'; // Blue
  if (daysClean >= 7) return 'rgba(251, 191, 36, 0.4)'; // Amber
  return 'rgba(255, 255, 255, 0.4)'; // White
}; 