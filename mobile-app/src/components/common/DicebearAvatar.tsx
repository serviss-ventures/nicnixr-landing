import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
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
  limitedEdition?: {
    current?: number;
    total?: number;
    availableFrom?: string;
    availableUntil?: string;
    season?: string;
    type?: 'time-limited' | 'seasonal';
    getDaysRemaining?: () => number;
    isAvailable?: () => boolean;
  };
}

// Avatar style configurations - ALL USING MICAH STYLE
export const STARTER_AVATARS = {
  warrior: {
    name: 'Midnight Warrior',
    collection: micah,
    unlockDays: 0,
    description: 'Mysterious and confident',
    rarity: 'starter',
    seedModifier: 'midnight-warrior-v3',
    customization: {
      earringsProbability: 0,
      glassesProbability: 0,
      shirtColor: ['1e293b', '334155'], // Sophisticated dark gray
      mouth: ['smile'],
      eyebrows: ['up'],
      baseColor: ['ffedd5', 'fed7aa'], // Warm, healthy skin tone
      hairColor: ['78350f', '92400e'], // Rich brown hair
    }
  },
  fighter: {
    name: 'Golden Phoenix',
    collection: micah,
    unlockDays: 0,
    description: 'Radiant energy unleashed',
    rarity: 'starter',
    seedModifier: 'golden-phoenix-v3',
    customization: {
      earringsProbability: 100,
      glassesProbability: 0,
      shirtColor: ['fbbf24', 'fcd34d'], // Elegant gold
      mouth: ['smile'],
      eyebrows: ['eyelashesUp'],
      baseColor: ['fef3c7', 'fde68a'], // Glowing skin
      hairColor: ['dc2626', 'ef4444'], // Vibrant red hair
    }
  },
  hero: {
    name: 'Storm Captain',
    collection: micah,
    unlockDays: 0,
    description: 'Natural born leader',
    rarity: 'starter',
    seedModifier: 'storm-captain-v3',
    customization: {
      earringsProbability: 0,
      glassesProbability: 75,
      shirtColor: ['2563eb', '3b82f6'], // Sharp blue
      mouth: ['smile'],
      eyebrows: ['up'],
      baseColor: ['f9fafb', 'f3f4f6'], // Fair skin
      hairColor: ['1f2937', '111827'], // Sleek black hair
    }
  },
  champion: {
    name: 'Sunset Guardian',
    collection: micah,
    unlockDays: 0,
    description: 'Warm soul, fierce spirit',
    rarity: 'starter',
    seedModifier: 'sunset-guardian-v3',
    customization: {
      earringsProbability: 75,
      glassesProbability: 0,
      shirtColor: ['ec4899', 'f472b6'], // Lovely pink
      mouth: ['laughing'],
      eyebrows: ['eyelashesUp'],
      baseColor: ['fef2f2', 'fee2e2'], // Rosy skin tone
      hairColor: ['f59e0b', 'fbbf24'], // Golden blonde
    }
  },
  phoenix: {
    name: 'Wild Phoenix',
    collection: micah,
    unlockDays: 0,
    description: 'Free spirit on the rise',
    rarity: 'starter',
    seedModifier: 'wild-phoenix-v3',
    customization: {
      earringsProbability: 0,
      glassesProbability: 0,
      shirtColor: ['059669', '10b981'], // Fresh green
      mouth: ['smile'],
      eyebrows: ['up'],
      baseColor: ['ffedd5', 'fed7aa'], // Sun-kissed skin
      hairColor: ['7c2d12', '9a3412'], // Auburn hair
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
      specialAccessory: 'crown',
      mouth: ['laughing'], // Biggest smile for 1 year!
      eyebrows: ['eyelashesUp'] // Radiant expression
    }
  }
};

// Premium rotation helper - rotates every 30 days
const getPremiumRotation = (): number => {
  const startDate = new Date('2025-06-01'); // Start of rotation
  const now = new Date();
  const diffTime = now.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const rotation = Math.floor(diffDays / 30) % 3; // Cycle through 3 sets
  return rotation;
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
    seedModifier: 'gold-warrior',
    customization: {
      earringsProbability: 100,
      glassesProbability: 50,
      shirtColor: ['fbbf24', 'fcd34d', 'fde047'], // Shimmering gold gradient
      baseColor: ['fef3c7', 'fde68a'], // Golden glow skin
      hairColor: ['f59e0b', 'fbbf24', 'fcd34d'], // Luminous gold hair
      mouth: ['laughing'], // Triumphant expression
      eyebrows: ['eyelashesUp'] // Confident look
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
    seedModifier: 'diamond-champion',
    customization: {
      earringsProbability: 100,
      glassesProbability: 100,
      shirtColor: ['e0e7ff', 'c7d2fe', 'a5b4fc'], // Diamond shimmer gradient
      baseColor: ['f0f9ff', 'e0f2fe'], // Pristine porcelain
      hairColor: ['818cf8', '6366f1', '4f46e5'], // Iridescent blue-purple
      mouth: ['smile'], // Serene confidence
      eyebrows: ['up'] // Regal bearing
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
    seedModifier: 'platinum-phoenix',
    customization: {
      earringsProbability: 100,
      glassesProbability: 25,
      shirtColor: ['dc2626', 'ef4444', 'f87171'], // Fire gradient
      baseColor: ['fef3c7', 'fed7aa'], // Warm ember glow
      hairColor: ['dc2626', 'ef4444', 'fb923c'], // Flame-kissed hair
      mouth: ['smile'],
      eyebrows: ['eyelashesUp'] // Rising strength
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
    seedModifier: 'cosmic-hero',
    customization: {
      earringsProbability: 75,
      glassesProbability: 100,
      shirtColor: ['7c3aed', '8b5cf6', 'a78bfa'], // Cosmic purple gradient
      baseColor: ['ede9fe', 'e9d5ff'], // Ethereal lavender skin
      hairColor: ['7c3aed', '6d28d9', '5b21b6'], // Deep space purple
      mouth: ['smile'], // Knowing smile
      eyebrows: ['up'] // Cosmic awareness
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
    seedModifier: 'emerald-guardian',
    customization: {
      earringsProbability: 100,
      glassesProbability: 75,
      shirtColor: ['059669', '10b981', '34d399'], // Living emerald gradient
      baseColor: ['d1fae5', 'a7f3d0'], // Fresh mint complexion
      hairColor: ['047857', '059669', '10b981'], // Forest green hair
      mouth: ['laughing'], // Joy of growth
      eyebrows: ['eyelashesUp'] // Wise and kind
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
    seedModifier: 'ruby-knight-2025',
    customization: {
      earringsProbability: 100,
      glassesProbability: 25,
      shirtColor: ['ef4444', 'dc2626', 'b91c1c'], // Blood ruby gradient
      baseColor: ['fef2f2', 'fee2e2'], // Rose-tinted skin
      hairColor: ['991b1b', 'dc2626', 'ef4444'], // Crimson cascade
      mouth: ['smile'],
      eyebrows: ['up'] // Fierce loyalty
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
    seedModifier: 'sapphire-wizard-2025',
    customization: {
      earringsProbability: 50,
      glassesProbability: 100,
      shirtColor: ['2563eb', '1d4ed8', '1e3a8a'], // Deep sapphire gradient
      baseColor: ['eff6ff', 'dbeafe'], // Mystic pale blue
      hairColor: ['1e40af', '2563eb', '3b82f6'], // Ocean depth hair
      mouth: ['smile'], // Enigmatic smile
      eyebrows: ['up'] // Raised in knowing
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
    seedModifier: 'amethyst-sage-2025',
    customization: {
      earringsProbability: 100,
      glassesProbability: 50,
      shirtColor: ['9333ea', '7c3aed', '6d28d9'], // Royal amethyst gradient
      baseColor: ['faf5ff', 'f3e8ff'], // Dream-touched skin
      hairColor: ['9333ea', '7c3aed', 'a855f7'], // Mystical purple waves
      mouth: ['smile'], // Gentle wisdom
      eyebrows: ['eyelashesUp'] // Dreamy expression
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
    seedModifier: 'obsidian-ninja-2025',
    customization: {
      earringsProbability: 0,
      glassesProbability: 100,
      shirtColor: ['1f2937', '111827', '030712'], // Void black gradient
      baseColor: ['f9fafb', 'f3f4f6'], // Moonlight pale
      hairColor: ['030712', '111827', '1f2937'], // Midnight cascade
      mouth: ['smile'],
      eyebrows: ['up'] // Alert and ready
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
    seedModifier: 'bronze-titan-2025',
    customization: {
      earringsProbability: 100,
      glassesProbability: 0,
      shirtColor: ['b45309', '92400e', '78350f'], // Burnished bronze gradient
      baseColor: ['ffedd5', 'fed7aa'], // Sun-bronzed skin
      hairColor: ['78350f', '92400e', 'b45309'], // Copper waves
      mouth: ['smile'],
      eyebrows: ['eyelashesUp'] // Determined brow
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
    seedModifier: 'crystal-mage-2025',
    customization: {
      earringsProbability: 100,
      glassesProbability: 100,
      shirtColor: ['e0f2fe', 'bae6fd', '7dd3fc'], // Crystal clear gradient
      baseColor: ['f0f9ff', 'e0f2fe'], // Glass-like translucence
      hairColor: ['38bdf8', '0ea5e9', '0284c7'], // Frozen waterfall
      mouth: ['laughing'], // Crystal clear joy
      eyebrows: ['up'] // Visionary gaze
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
    seedModifier: 'fire-elemental-2025',
    customization: {
      earringsProbability: 0,
      glassesProbability: 50,
      shirtColor: ['f97316', 'ea580c', 'dc2626'], // Molten lava gradient
      baseColor: ['fef3c7', 'fed7aa'], // Heat-kissed glow
      hairColor: ['ef4444', 'f97316', 'fbbf24'], // Living flame hair
      mouth: ['smile'],
      eyebrows: ['up'] // Burning determination
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
    seedModifier: 'ice-emperor-2025',
    customization: {
      earringsProbability: 100,
      glassesProbability: 100,
      shirtColor: ['c7d2fe', 'a5b4fc', '818cf8'], // Glacial gradient
      baseColor: ['f8fafc', 'f1f5f9'], // Arctic pale
      hairColor: ['6366f1', '4f46e5', '4338ca'], // Frozen twilight
      mouth: ['smile'], // Cool confidence
      eyebrows: ['up'] // Imperial bearing
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
    seedModifier: 'storm-bringer-2025',
    customization: {
      earringsProbability: 100,
      glassesProbability: 0,
      shirtColor: ['6b7280', '4b5563', '374151'], // Storm cloud gradient
      baseColor: ['e5e7eb', 'd1d5db'], // Storm-touched skin
      hairColor: ['fbbf24', 'f59e0b', 'fcd34d'], // Lightning strike hair
      mouth: ['laughing'], // Electric energy
      eyebrows: ['eyelashesUp'] // Charged expression
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
    seedModifier: 'earth-shaman-2025',
    customization: {
      earringsProbability: 100,
      glassesProbability: 75,
      shirtColor: ['78350f', '713f12', '451a03'], // Rich earth gradient
      baseColor: ['fef3c7', 'fde68a'], // Sun-warmed earth tone
      hairColor: ['451a03', '713f12', '92400e'], // Tree bark brown
      mouth: ['smile'], // Grounded wisdom
      eyebrows: ['eyelashesUp'] // Nature's kindness
    }
  }
};

// Get current premium avatars based on rotation
export const PREMIUM_AVATARS = Object.entries(ALL_PREMIUM_AVATARS)
  .filter(([_, config]) => config.rotation === getPremiumRotation())
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

// Get current date for seasonal/limited availability checks
const getCurrentSeason = (): string => {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
};

const isDateInRange = (startDate: string, endDate: string): boolean => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  return now >= start && now <= end;
};

const getDaysRemaining = (endDate: string): number => {
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

// LIMITED DROPS - 14 days only (auto-updates)
export const LIMITED_DROP_AVATARS = {
  exclusiveDrop: {
    name: 'The Anomaly',
    icon: 'flash',
    collection: micah,
    unlockDays: -2,
    description: 'Something that shouldn\'t exist, yet does',
    rarity: 'limited',
    price: '$19.99',
    seedModifier: 'limited-drop-2025',
    customization: {
      earringsProbability: 100,
      glassesProbability: 75,
      shirtColor: ['dc2626', 'ef4444', 'fbbf24'], // Red to gold gradient
      baseColor: ['fef3c7', 'fed7aa'], // Warm exclusive tone
      hairColor: ['dc2626', 'b91c1c', 'f59e0b'], // Fire to gold cascade
      mouth: ['smile'],
      eyebrows: ['eyelashesUp'], // Enigmatic look
      specialBadge: 'exclusive'
    },
    limitedEdition: {
      // This will be available for 14 days from whenever the app updates
      availableFrom: '2025-06-06', // Today's date
      availableUntil: '2025-06-20', // 14 days from now
      type: 'time-limited',
      getDaysRemaining: () => getDaysRemaining('2025-06-20'),
      isAvailable: () => isDateInRange('2025-06-06', '2025-06-20')
    }
  },
  
  rareRelease: {
    name: 'Midnight Bloom',
    icon: 'star',
    collection: micah,
    unlockDays: -2,
    description: 'Flowers that only open in darkness',
    rarity: 'limited',
    price: '$24.99',
    seedModifier: 'rare-release-june-2025',
    customization: {
      earringsProbability: 100,
      glassesProbability: 50,
      shirtColor: ['7c3aed', '8b5cf6', 'ec4899'], // Purple to pink gradient
      baseColor: ['e9d5ff', 'fce7f3'], // Mystic lavender
      hairColor: ['7c3aed', '6d28d9', 'ec4899'], // Deep purple to pink
      mouth: ['smile'], // Mysterious smile
      eyebrows: ['up'], // Knowing gaze
      specialBadge: 'rare'
    },
    limitedEdition: {
      availableFrom: '2025-06-06',
      availableUntil: '2025-06-20',
      type: 'time-limited',
      getDaysRemaining: () => getDaysRemaining('2025-06-20'),
      isAvailable: () => isDateInRange('2025-06-06', '2025-06-20')
    }
  },
  
  specialEdition: {
    name: 'Echo Chamber',
    icon: 'sparkles',
    collection: micah,
    unlockDays: -2,
    description: 'Your strength, amplified infinitely',
    rarity: 'limited',
    price: '$21.99',
    seedModifier: 'special-edition-june-2025',
    customization: {
      earringsProbability: 75,
      glassesProbability: 100,
      shirtColor: ['0891b2', '06b6d4', '14b8a6'], // Cyan to teal gradient
      baseColor: ['cffafe', 'ccfbf1'], // Ocean-touched skin
      hairColor: ['0891b2', '0e7490', '14b8a6'], // Aqua flow
      mouth: ['laughing'], // Resonant joy
      eyebrows: ['eyelashesUp'], // Uplifting energy
      specialBadge: 'special'
    },
    limitedEdition: {
      availableFrom: '2025-06-06',
      availableUntil: '2025-06-20',
      type: 'time-limited',
      getDaysRemaining: () => getDaysRemaining('2025-06-20'),
      isAvailable: () => isDateInRange('2025-06-06', '2025-06-20')
    }
  },
  
  founderEdition: {
    name: 'First Light',
    icon: 'medal',
    collection: micah,
    unlockDays: -2,
    description: 'Before the dawn, there was you',
    rarity: 'limited',
    price: '$29.99',
    seedModifier: 'founder-edition-2025',
    customization: {
      earringsProbability: 100,
      glassesProbability: 25,
      shirtColor: ['b91c1c', 'dc2626', 'f59e0b'], // Dark red to amber gradient
      baseColor: ['fef2f2', 'fef3c7'], // Dawn-kissed complexion
      hairColor: ['991b1b', '7f1d1d', 'b91c1c'], // Deep burgundy cascade
      mouth: ['laughing'], // Proud pioneer smile
      eyebrows: ['eyelashesUp'], // Visionary expression
      specialBadge: 'founder'
    },
    limitedEdition: {
      availableFrom: '2025-06-06',
      availableUntil: '2025-06-20',
      type: 'time-limited',
      getDaysRemaining: () => getDaysRemaining('2025-06-20'),
      isAvailable: () => isDateInRange('2025-06-06', '2025-06-20')
    }
  }
};
// SEASONAL AVATARS - 4 per season
export const SEASONAL_AVATARS = {
  // SUMMER COLLECTION (June, July, August)
  summerLegend: {
    name: 'Solar Drift',
    icon: 'sunny',
    collection: micah,
    unlockDays: -2,
    description: 'Carried by warm winds to distant shores',
    rarity: 'limited',
    price: '$17.99',
    seedModifier: 'summer-legend-2025',
    customization: {
      earringsProbability: 100,
      glassesProbability: 50,
      shirtColor: ['fbbf24', 'f59e0b', 'fb923c'], // Premium sun gradient
      baseColor: ['fef3c7', 'fed7aa'], // Perfect sun-kissed bronze
      hairColor: ['f59e0b', 'fbbf24', 'fcd34d'], // Luminous golden blonde
      mouth: ['laughing'], // Radiant joy
      eyebrows: ['eyelashesUp'], // Sun-touched happiness
      specialBadge: 'summer'
    },
    limitedEdition: {
      season: 'summer',
      type: 'seasonal',
      isAvailable: () => getCurrentSeason() === 'summer'
    }
  },
  
  beachWarrior: {
    name: 'Tide Turner',
    icon: 'water',
    collection: micah,
    unlockDays: -2,
    description: 'Master of ebb and flow',
    rarity: 'limited',
    price: '$19.99',
    seedModifier: 'beach-warrior-2025',
    customization: {
      earringsProbability: 0,
      glassesProbability: 100,
      shirtColor: ['06b6d4', '0891b2', '0284c7'], // Ocean wave gradient
      baseColor: ['fed7aa', 'fdba74'], // Beach-tanned skin
      hairColor: ['fcd34d', 'fbbf24', 'fde68a'], // Sun-bleached locks
      mouth: ['smile'], // Confident swimmer
      eyebrows: ['eyelashesUp'], // Ocean wisdom
      specialBadge: 'beach'
    },
    limitedEdition: {
      season: 'summer',
      type: 'seasonal',
      isAvailable: () => getCurrentSeason() === 'summer'
    }
  },
  
  sunsetChaser: {
    name: 'Golden Hour',
    icon: 'partly-sunny',
    collection: micah,
    unlockDays: -2,
    description: 'That perfect moment, captured forever',
    rarity: 'limited',
    price: '$18.99',
    seedModifier: 'sunset-chaser-2025',
    customization: {
      earringsProbability: 100,
      glassesProbability: 0,
      shirtColor: ['fb923c', 'f97316', 'ea580c'], // Sunset orange gradient
      baseColor: ['fef3c7', 'fed7aa'], // Golden hour glow
      hairColor: ['dc2626', 'ef4444', 'f97316'], // Sunset fire hair
      mouth: ['smile'], // Peaceful contentment
      eyebrows: ['up'], // Dreamy expression
      specialBadge: 'sunset'
    },
    limitedEdition: {
      season: 'summer',
      type: 'seasonal',
      isAvailable: () => getCurrentSeason() === 'summer'
    }
  },
  
  tropicalSoul: {
    name: 'Paradise Lost',
    icon: 'flower',
    collection: micah,
    unlockDays: -2,
    description: 'Found where you least expected',
    rarity: 'limited',
    price: '$19.99',
    seedModifier: 'tropical-soul-2025',
    customization: {
      earringsProbability: 100,
      glassesProbability: 50,
      shirtColor: ['10b981', '059669', '047857'], // Lush tropical gradient
      baseColor: ['fef3c7', 'fde68a'], // Island warmth
      hairColor: ['7c3aed', '8b5cf6', 'a78bfa'], // Exotic orchid purple
      mouth: ['laughing'], // Island freedom
      eyebrows: ['up'], // Tropical bliss
      specialBadge: 'tropical'
    },
    limitedEdition: {
      season: 'summer',
      type: 'seasonal',
      isAvailable: () => getCurrentSeason() === 'summer'
    }
  },
  
  // FALL COLLECTION (September, October, November)
  fallHarvest: {
    name: 'Autumn Reverie',
    icon: 'leaf',
    collection: micah,
    unlockDays: -2,
    description: 'Dreams written in falling leaves',
    rarity: 'limited',
    price: '$17.99',
    seedModifier: 'fall-harvest-2025',
    customization: {
      earringsProbability: 100,
      glassesProbability: 75,
      shirtColor: ['ea580c', 'dc2626', '7c2d12'], // Autumn leaf gradient
      baseColor: ['fef3c7', 'ffedd5'], // Harvest moon glow
      hairColor: ['c2410c', '9a3412', '78350f'], // Autumn auburn cascade
      mouth: ['smile'], // Harvest contentment
      eyebrows: ['eyelashesUp'], // Grateful expression
      specialBadge: 'fall'
    },
    limitedEdition: {
      season: 'fall',
      type: 'seasonal',
      isAvailable: () => getCurrentSeason() === 'fall'
    }
  },
  
  pumpkinSpice: {
    name: 'Cinnamon Dreams',
    icon: 'cafe',
    collection: micah,
    unlockDays: -2,
    description: 'Warmth that lingers on the tongue',
    rarity: 'limited',
    price: '$19.99',
    seedModifier: 'pumpkin-spice-2025',
    customization: {
      earringsProbability: 0,
      glassesProbability: 100,
      shirtColor: ['f97316', 'ea580c', 'dc2626'], // Pumpkin spice gradient
      baseColor: ['ffedd5', 'fed7aa'], // Cinnamon warmth
      hairColor: ['92400e', '78350f', 'b45309'], // Rich brown waves
      mouth: ['smile'], // Cozy comfort
      eyebrows: ['up'], // Warm welcome
      specialBadge: 'pumpkin'
    },
    limitedEdition: {
      season: 'fall',
      type: 'seasonal',
      isAvailable: () => getCurrentSeason() === 'fall'
    }
  },
  
  mapleWarrior: {
    name: 'Ember Dance',
    icon: 'leaf',
    collection: micah,
    unlockDays: -2,
    description: 'Moving with the wind\'s whispers',
    rarity: 'limited',
    price: '$21.99',
    seedModifier: 'maple-warrior-2025',
    customization: {
      earringsProbability: 100,
      glassesProbability: 0,
      shirtColor: ['dc2626', 'b91c1c', '991b1b'], // Maple red gradient
      baseColor: ['fef2f2', 'fee2e2'], // Rosy autumn light
      hairColor: ['7c2d12', '7f1d1d', '991b1b'], // Deep maple red
      mouth: ['smile'], // Autumn strength
      eyebrows: ['eyelashesUp'], // Fierce beauty
      specialBadge: 'maple'
    },
    limitedEdition: {
      season: 'fall',
      type: 'seasonal',
      isAvailable: () => getCurrentSeason() === 'fall'
    }
  },
  
  harvestMoon: {
    name: 'Luna\'s Harvest',
    icon: 'moon',
    collection: micah,
    unlockDays: -2,
    description: 'Gathering strength under silver light',
    rarity: 'limited',
    price: '$19.99',
    seedModifier: 'harvest-moon-2025',
    customization: {
      earringsProbability: 100,
      glassesProbability: 100,
      shirtColor: ['1e293b', '334155', '475569'], // Moonlight gradient
      baseColor: ['e0e7ff', 'c7d2fe'], // Moonlit porcelain
      hairColor: ['1e3a8a', '1e40af', '2563eb'], // Midnight blue cascade
      mouth: ['smile'], // Lunar mystery
      eyebrows: ['up'], // Nocturnal wisdom
      specialBadge: 'moon'
    },
    limitedEdition: {
      season: 'fall',
      type: 'seasonal',
      isAvailable: () => getCurrentSeason() === 'fall'
    }
  },
  
  // WINTER COLLECTION (December, January, February)
  winterWarrior: {
    name: 'Frost Whisper',
    icon: 'snow',
    collection: micah,
    unlockDays: -2,
    description: 'Silent promises in frozen breath',
    rarity: 'limited',
    price: '$14.99',
    seedModifier: 'winter-warrior-2025',
    customization: {
      earringsProbability: 100,
      glassesProbability: 50,
      shirtColor: ['60a5fa', '3b82f6', 'dbeafe'], // Arctic ice gradient
      baseColor: ['f0f9ff', 'e0f2fe'], // Frost-kissed skin
      hairColor: ['1e3a8a', '1e40af', '3b82f6'], // Winter storm blue
      mouth: ['smile'], // Cold confidence
      eyebrows: ['up'], // Winter clarity
      specialBadge: 'winter'
    },
    limitedEdition: {
      season: 'winter',
      type: 'seasonal',
      isAvailable: () => getCurrentSeason() === 'winter'
    }
  },
  
  frostGuardian: {
    name: 'Crystal Keeper',
    icon: 'snow',
    collection: micah,
    unlockDays: -2,
    description: 'Guardian of what lies beneath the ice',
    rarity: 'limited',
    price: '$16.99',
    seedModifier: 'frost-guardian-2025',
    customization: {
      earringsProbability: 0,
      glassesProbability: 100,
      shirtColor: ['dbeafe', 'bfdbfe', '93c5fd'], // Ice crystal gradient
      baseColor: ['f8fafc', 'f1f5f9'], // Snow pure white
      hairColor: ['64748b', '475569', '334155'], // Silver frost cascade
      mouth: ['smile'], // Stoic guardian
      eyebrows: ['up'], // Vigilant watch
      specialBadge: 'frost'
    },
    limitedEdition: {
      season: 'winter',
      type: 'seasonal',
      isAvailable: () => getCurrentSeason() === 'winter'
    }
  },
  
  polarPhoenix: {
    name: 'Arctic Flame',
    icon: 'flame',
    collection: micah,
    unlockDays: -2,
    description: 'Fire that burns without warmth',
    rarity: 'limited',
    price: '$18.99',
    seedModifier: 'polar-phoenix-2025',
    customization: {
      earringsProbability: 100,
      glassesProbability: 0,
      shirtColor: ['818cf8', '6366f1', '4f46e5'], // Aurora purple gradient
      baseColor: ['ede9fe', 'ddd6fe'], // Ethereal ice
      hairColor: ['4338ca', '3730a3', '4c1d95'], // Deep aurora purple
      mouth: ['smile'], // Cold fire intensity
      eyebrows: ['eyelashesUp'], // Mystical presence
      specialBadge: 'phoenix'
    },
    limitedEdition: {
      season: 'winter',
      type: 'seasonal',
      isAvailable: () => getCurrentSeason() === 'winter'
    }
  },
  
  auroraSeeker: {
    name: 'Northern Lights',
    icon: 'sparkles',
    collection: micah,
    unlockDays: -2,
    description: 'Dancing where earth meets heaven',
    rarity: 'limited',
    price: '$19.99',
    seedModifier: 'aurora-seeker-2025',
    customization: {
      earringsProbability: 100,
      glassesProbability: 75,
      shirtColor: ['10b981', '059669', '14b8a6'], // Aurora green gradient
      baseColor: ['f0fdf4', 'dcfce7'], // Northern light glow
      hairColor: ['0891b2', '0e7490', '0c4a6e'], // Teal aurora cascade
      mouth: ['laughing'], // Aurora joy
      eyebrows: ['eyelashesUp'], // Wonder-struck
      specialBadge: 'aurora'
    },
    limitedEdition: {
      season: 'winter',
      type: 'seasonal',
      isAvailable: () => getCurrentSeason() === 'winter'
    }
  },
  
  // SPRING COLLECTION (March, April, May)
  springBloom: {
    name: 'Emergence',
    icon: 'flower',
    collection: micah,
    unlockDays: -2,
    description: 'Breaking through when least expected',
    rarity: 'limited',
    price: '$14.99',
    seedModifier: 'spring-bloom-2025',
    customization: {
      earringsProbability: 100,
      glassesProbability: 0,
      shirtColor: ['86efac', '22c55e', 'fbbf24'], // Spring bloom gradient
      baseColor: ['ecfccb', 'fef3c7'], // Fresh spring complexion
      hairColor: ['16a34a', '15803d', '22c55e'], // New growth green
      mouth: ['smile'], // Spring renewal
      eyebrows: ['up'], // Hopeful expression
      specialBadge: 'spring'
    },
    limitedEdition: {
      season: 'spring',
      type: 'seasonal',
      isAvailable: () => getCurrentSeason() === 'spring'
    }
  },
  
  cherryBlossom: {
    name: 'Sakura Spirit',
    icon: 'rose',
    collection: micah,
    unlockDays: -2,
    description: 'Beautiful because it doesn\'t last',
    rarity: 'limited',
    price: '$16.99',
    seedModifier: 'cherry-blossom-2025',
    customization: {
      earringsProbability: 0,
      glassesProbability: 50,
      shirtColor: ['fbbcb8', 'f9a8d4', 'f472b6'], // Cherry blossom gradient
      baseColor: ['fef2f2', 'ffe4e6'], // Petal soft skin
      hairColor: ['ec4899', 'db2777', 'f9a8d4'], // Pink blossom cascade
      mouth: ['smile'], // Gentle beauty
      eyebrows: ['up'], // Serene grace
      specialBadge: 'cherry'
    },
    limitedEdition: {
      season: 'spring',
      type: 'seasonal',
      isAvailable: () => getCurrentSeason() === 'spring'
    }
  },
  
  rainbowHope: {
    name: 'Prism Walker',
    icon: 'rainbow',
    collection: micah,
    unlockDays: -2,
    description: 'Finding color in the rain',
    rarity: 'limited',
    price: '$18.99',
    seedModifier: 'rainbow-hope-2025',
    customization: {
      earringsProbability: 100,
      glassesProbability: 25,
      shirtColor: ['a78bfa', '8b5cf6', '7c3aed'], // Rainbow purple gradient
      baseColor: ['faf5ff', 'f3e8ff'], // Light prism glow
      hairColor: ['2563eb', '1d4ed8', '3b82f6'], // Rainbow blue cascade
      mouth: ['laughing'], // Colorful joy
      eyebrows: ['eyelashesUp'], // Bright optimism
      specialBadge: 'rainbow'
    },
    limitedEdition: {
      season: 'spring',
      type: 'seasonal',
      isAvailable: () => getCurrentSeason() === 'spring'
    }
  },
  
  gardenGuide: {
    name: 'Seed Keeper',
    icon: 'leaf',
    collection: micah,
    unlockDays: -2,
    description: 'Planting tomorrow\'s miracles',
    rarity: 'limited',
    price: '$19.99',
    seedModifier: 'garden-guide-2025',
    customization: {
      earringsProbability: 100,
      glassesProbability: 100,
      shirtColor: ['84cc16', '65a30d', '4d7c0f'], // Garden green gradient
      baseColor: ['f7fee7', 'ecfccb'], // Earth-nurtured skin
      hairColor: ['713f12', '78350f', '92400e'], // Rich soil brown
      mouth: ['smile'], // Patient wisdom
      eyebrows: ['eyelashesUp'], // Nurturing gaze
      specialBadge: 'garden'
    },
    limitedEdition: {
      season: 'spring',
      type: 'seasonal',
      isAvailable: () => getCurrentSeason() === 'spring'
    }
  }
};

// Combine all avatars for easy access (includes ALL premium avatars for validation)
export const AVATAR_STYLES = {
  ...STARTER_AVATARS,
  ...PROGRESS_AVATARS,
  ...ALL_PREMIUM_AVATARS, // Include all premium avatars for style validation
  ...LIMITED_DROP_AVATARS,
  ...SEASONAL_AVATARS
};

// Keep separate exports for UI organization
export const LIMITED_EDITION_AVATARS = {
  ...LIMITED_DROP_AVATARS,
  ...SEASONAL_AVATARS
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

type AvatarRarity = 'starter' | 'common' | 'rare' | 'epic' | 'legendary' | 'unique' | 'mythic' | 'limited';

const RARITY_COLORS: Record<AvatarRarity, string[]> = {
  starter: ['#10B981', '#34D399'],
  common: ['#6B7280', '#9CA3AF'],
  rare: ['#3B82F6', '#60A5FA'],
  epic: ['#8B5CF6', '#A78BFA'],
  legendary: ['#F59E0B', '#FCD34D'],
  unique: ['#10B981', '#34D399'],
  mythic: ['#EC4899', '#F472B6', '#FB923C'], // Animated gradient effect
  limited: ['#DC2626', '#F97316', '#FBBF24'], // Red to gold limited edition
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
  
  // Fallback to warrior if style doesn't exist
  if (!avatarConfig) {
    console.warn(`Avatar style '${style}' not found, falling back to 'warrior'`);
    return (
      <DicebearAvatar
        {...arguments[0]}
        style="warrior"
      />
    );
  }
  
  const frameColors = RARITY_COLORS[avatarConfig.rarity] || RARITY_COLORS.starter;

  // Generate avatar SVG
  const avatarSvg = useMemo(() => {
    try {
      const avatarStyle = avatarConfig.collection;
      // Use seedModifier if available for variety
      const seed = avatarConfig.seedModifier ? `${userId}-${avatarConfig.seedModifier}` : userId;
      
      const options: any = {
        seed,
        size: dimensions.avatar,
        backgroundColor: avatarConfig.rarity === 'mythic' ? ['transparent'] : [backgroundColor.replace('#', '')],
      };

      // Apply customization from avatar config
      const customization = avatarConfig.customization;
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
  }, [userId, dimensions.avatar, backgroundColor, style, daysClean, avatarConfig]);

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
                name={badgeIcon as any} 
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