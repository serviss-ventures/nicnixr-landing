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
    name: 'Recovery Warrior',
    collection: micah,
    unlockDays: 0,
    description: 'Your journey begins',
    rarity: 'starter',
    seedModifier: 'warrior',
    customization: {
      earringsProbability: 0,
      glassesProbability: 0,
      shirtColor: ['10b981', '06b6d4'], // Green to teal (hope)
    }
  },
  fighter: {
    name: 'Freedom Fighter',
    collection: micah,
    unlockDays: 0,
    description: 'Breaking free from nicotine',
    rarity: 'starter',
    seedModifier: 'fighter',
    customization: {
      earringsProbability: 0,
      glassesProbability: 0,
      shirtColor: ['3b82f6', '6366f1'], // Blue (clarity)
    }
  },
  hero: {
    name: 'Quit Hero',
    collection: micah,
    unlockDays: 0,
    description: 'Your personal hero',
    rarity: 'starter',
    seedModifier: 'hero',
    customization: {
      earringsProbability: 0,
      glassesProbability: 0,
      shirtColor: ['8b5cf6', 'a78bfa'], // Purple (strength)
    }
  },
  champion: {
    name: 'Clean Champion',
    collection: micah,
    unlockDays: 0,
    description: 'Champion of change',
    rarity: 'starter',
    seedModifier: 'champion',
    customization: {
      earringsProbability: 0,
      glassesProbability: 0,
      shirtColor: ['ec4899', 'f472b6'], // Pink (self-love)
    }
  },
  phoenix: {
    name: 'Rising Phoenix',
    collection: micah,
    unlockDays: 0,
    description: 'Rise from the ashes',
    rarity: 'starter',
    seedModifier: 'phoenix',
    customization: {
      earringsProbability: 0,
      glassesProbability: 0,
      shirtColor: ['f59e0b', 'f97316'], // Orange (energy)
      mouth: ['smile'], // Hopeful smile for new beginnings
      eyebrows: ['up'] // Optimistic expression
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

export const PREMIUM_AVATARS = {
  goldWarrior: {
    name: 'Gold Warrior',
    icon: 'trophy',
    collection: micah,
    unlockDays: -1, // Premium only
    description: 'Premium golden edition',
    rarity: 'mythic',
    price: '$4.99',
    seedModifier: 'gold-warrior',
    customization: {
      earringsProbability: 100,
      glassesProbability: 100,
      shirtColor: ['fbbf24', 'fcd34d', 'fde047'], // Premium gold
      baseColor: ['ffd700', 'ffed4e'], // Golden skin tone
      hairColor: ['fbbf24', 'f59e0b'], // Golden hair
      mouth: ['laughing'], // Triumphant expression
      eyebrows: ['eyelashesUp'] // Confident look
    }
  },
  diamondChampion: {
    name: 'Diamond Champion',
    icon: 'diamond',
    collection: micah,
    unlockDays: -1,
    description: 'Ultimate prestige avatar',
    rarity: 'mythic',
    price: '$9.99',
    seedModifier: 'diamond-champion',
    customization: {
      earringsProbability: 100,
      glassesProbability: 100,
      shirtColor: ['e0e7ff', 'c7d2fe', 'a5b4fc'], // Diamond shimmer
      baseColor: ['f9fafb', 'f3f4f6'], // Platinum skin
      hairColor: ['6366f1', '4f46e5'], // Premium blue
    }
  },
  platinumPhoenix: {
    name: 'Platinum Phoenix',
    icon: 'flame',
    collection: micah,
    unlockDays: -1,
    description: 'Rise in platinum style',
    rarity: 'mythic',
    price: '$7.99',
    seedModifier: 'platinum-phoenix',
    customization: {
      earringsProbability: 100,
      glassesProbability: 100,
      shirtColor: ['dc2626', 'ef4444', 'f87171'], // Fire gradient
      baseColor: ['fef3c7', 'fde68a'], // Warm glow
      hairColor: ['dc2626', 'b91c1c'], // Fire red
    }
  },
  cosmicHero: {
    name: 'Cosmic Hero',
    icon: 'planet',
    collection: micah,
    unlockDays: -1,
    description: 'Transcend your limits',
    rarity: 'mythic',
    price: '$6.99',
    seedModifier: 'cosmic-hero',
    customization: {
      earringsProbability: 100,
      glassesProbability: 100,
      shirtColor: ['7c3aed', '8b5cf6', 'a78bfa'], // Cosmic purple
      baseColor: ['e9d5ff', 'f3e8ff'], // Ethereal
      hairColor: ['7c3aed', '6d28d9'], // Deep purple
    }
  },
  emeraldGuardian: {
    name: 'Emerald Guardian',
    icon: 'shield',
    collection: micah,
    unlockDays: -1,
    description: 'Protected and powerful',
    rarity: 'mythic',
    price: '$5.99',
    seedModifier: 'emerald-guardian',
    customization: {
      earringsProbability: 100,
      glassesProbability: 100,
      shirtColor: ['059669', '10b981', '34d399'], // Emerald gradient
      baseColor: ['d1fae5', 'a7f3d0'], // Fresh mint
      hairColor: ['047857', '065f46'], // Deep green
    }
  }
};

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

export const LIMITED_EDITION_AVATARS = {
  // LIMITED DROP - 14 days only (auto-updates)
  limitedDrop: {
    name: 'Exclusive Drop',
    icon: 'flash',
    collection: micah,
    unlockDays: -2,
    description: 'Limited time only!',
    rarity: 'limited',
    price: '$19.99',
    seedModifier: 'limited-drop-2025',
    customization: {
      earringsProbability: 100,
      glassesProbability: 100,
      shirtColor: ['dc2626', 'ef4444', 'fbbf24'], // Red to gold gradient
      baseColor: ['fef3c7', 'fed7aa'], // Warm exclusive tone
      hairColor: ['dc2626', 'b91c1c'], // Fire red
      specialBadge: 'exclusive'
    },
    limitedEdition: {
      // This will be available for 14 days from whenever the app updates
      availableFrom: '2025-01-06', // Today's date
      availableUntil: '2025-01-20', // 14 days from now
      type: 'time-limited',
      getDaysRemaining: () => getDaysRemaining('2025-01-20'),
      isAvailable: () => isDateInRange('2025-01-06', '2025-01-20')
    }
  },
  
  // SEASONAL AVATARS - Auto-rotate based on season
  winterWarrior: {
    name: 'Winter Warrior',
    icon: 'snow',
    collection: micah,
    unlockDays: -2,
    description: 'Winter exclusive',
    rarity: 'limited',
    price: '$14.99',
    seedModifier: 'winter-2025',
    customization: {
      earringsProbability: 100,
      glassesProbability: 100,
      shirtColor: ['60a5fa', '3b82f6', 'dbeafe'], // Ice blue gradient
      baseColor: ['f0f9ff', 'e0f2fe'], // Frosty skin
      hairColor: ['1e3a8a', '1e40af'], // Deep winter blue
      specialBadge: 'winter'
    },
    limitedEdition: {
      season: 'winter',
      type: 'seasonal',
      isAvailable: () => getCurrentSeason() === 'winter'
    }
  },
  
  springBloom: {
    name: 'Spring Bloom',
    icon: 'flower',
    collection: micah,
    unlockDays: -2,
    description: 'Spring exclusive',
    rarity: 'limited',
    price: '$14.99',
    seedModifier: 'spring-2025',
    customization: {
      earringsProbability: 100,
      glassesProbability: 100,
      shirtColor: ['86efac', '22c55e', 'fbbf24'], // Spring green to yellow
      baseColor: ['ecfccb', 'fef3c7'], // Fresh spring tone
      hairColor: ['16a34a', '15803d'], // Nature green
      specialBadge: 'spring'
    },
    limitedEdition: {
      season: 'spring',
      type: 'seasonal',
      isAvailable: () => getCurrentSeason() === 'spring'
    }
  },
  
  summerLegend: {
    name: 'Summer Legend',
    icon: 'sunny',
    collection: micah,
    unlockDays: -2,
    description: 'Summer exclusive',
    rarity: 'limited',
    price: '$14.99',
    seedModifier: 'summer-2025',
    customization: {
      earringsProbability: 100,
      glassesProbability: 100,
      shirtColor: ['fbbf24', 'f59e0b', 'fb923c'], // Sun gradient
      baseColor: ['fef3c7', 'fed7aa'], // Sun-kissed
      hairColor: ['f59e0b', 'ea580c'], // Bright summer
      specialBadge: 'summer'
    },
    limitedEdition: {
      season: 'summer',
      type: 'seasonal',
      isAvailable: () => getCurrentSeason() === 'summer'
    }
  },
  
  fallHarvest: {
    name: 'Fall Harvest',
    icon: 'leaf',
    collection: micah,
    unlockDays: -2,
    description: 'Fall exclusive',
    rarity: 'limited',
    price: '$14.99',
    seedModifier: 'fall-2025',
    customization: {
      earringsProbability: 100,
      glassesProbability: 100,
      shirtColor: ['ea580c', 'dc2626', '7c2d12'], // Autumn colors
      baseColor: ['fef3c7', 'ffedd5'], // Warm autumn
      hairColor: ['c2410c', '9a3412'], // Fall brown/red
      specialBadge: 'fall'
    },
    limitedEdition: {
      season: 'fall',
      type: 'seasonal',
      isAvailable: () => getCurrentSeason() === 'fall'
    }
  }
};

// Combine all avatars for easy access
export const AVATAR_STYLES = {
  ...STARTER_AVATARS,
  ...PROGRESS_AVATARS,
  ...PREMIUM_AVATARS,
  ...LIMITED_EDITION_AVATARS
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

  // Determine achievement badge based on days clean
  const getAchievementBadge = () => {
    if (daysClean >= 365) return { icon: 'trophy', color: '#FFD700' };
    if (daysClean >= 180) return { icon: 'star', color: '#F59E0B' };
    if (daysClean >= 90) return { icon: 'rocket', color: '#8B5CF6' };
    if (daysClean >= 30) return { icon: 'shield-checkmark', color: '#3B82F6' };
    if (daysClean >= 7) return { icon: 'checkmark-circle', color: '#10B981' };
    return null;
  };

  const achievementBadge = getAchievementBadge();

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
      
      {(badge || badgeIcon || achievementBadge) && (
        <View style={[
          styles.badge, 
          { 
            width: dimensions.badge, 
            height: dimensions.badge,
            borderRadius: dimensions.badge / 2,
            bottom: -2,
            right: -2,
            backgroundColor: badgeColor || achievementBadge?.color || '#1A1A2E',
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
            <Ionicons 
              name={(badgeIcon || achievementBadge?.icon || 'checkmark') as any} 
              size={dimensions.badgeIcon} 
              color="#FFFFFF" 
            />
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