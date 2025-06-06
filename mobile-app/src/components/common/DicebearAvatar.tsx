import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { createAvatar } from '@dicebear/core';
import { 
  micah, 
  lorelei, 
  adventurer, 
  avataaars,
  bottts,
  funEmoji,
  miniavs,
  openPeeps,
  personas
} from '@dicebear/collection';
import { SvgXml } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Avatar style configurations
export const STARTER_AVATARS = {
  micah: {
    name: 'Hero',
    collection: micah,
    unlockDays: 0,
    description: 'Your recovery warrior',
    rarity: 'starter',
    seedModifier: 'hero'
  },
  lorelei: {
    name: 'Guardian',
    collection: lorelei,
    unlockDays: 0,
    description: 'Your gentle protector',
    rarity: 'starter',
    seedModifier: 'guardian'
  },
  adventurer: {
    name: 'Explorer',
    collection: adventurer,
    unlockDays: 0,
    description: 'Your brave adventurer',
    rarity: 'starter',
    seedModifier: 'explorer'
  },
  avataaars: {
    name: 'Classic',
    collection: avataaars,
    unlockDays: 0,
    description: 'Timeless and strong',
    rarity: 'starter',
    seedModifier: 'classic'
  },
  miniavs: {
    name: 'Minimal',
    collection: miniavs,
    unlockDays: 0,
    description: 'Simple and focused',
    rarity: 'starter',
    seedModifier: 'minimal'
  }
};

export const PROGRESS_AVATARS = {
  bottts: {
    name: 'Tech Bot',
    collection: bottts,
    unlockDays: 7,
    description: 'Unlock at 7 days clean',
    rarity: 'rare'
  },
  funEmoji: {
    name: 'Fun Emoji',
    collection: funEmoji,
    unlockDays: 30,
    description: 'Unlock at 30 days clean',
    rarity: 'rare'
  },
  openPeeps: {
    name: 'Open Peeps',
    collection: openPeeps,
    unlockDays: 90,
    description: 'Unlock at 90 days clean',
    rarity: 'epic'
  },
  personas: {
    name: 'Personas',
    collection: personas,
    unlockDays: 365,
    description: 'Unlock at 1 year clean',
    rarity: 'legendary'
  }
};

export const PREMIUM_AVATARS = {
  micahPremium: {
    name: 'Royal Warrior',
    icon: 'trophy',
    collection: micah,
    unlockDays: -1, // Premium only
    description: 'Exclusive royal edition',
    rarity: 'mythic',
    price: '$4.99',
    seedModifier: 'royal',
    premiumFeatures: {
      goldAccessories: true,
      specialBackground: true,
      animatedFrame: true
    }
  },
  loreleiPremium: {
    name: 'Cosmic Guardian',
    icon: 'planet',
    collection: lorelei,
    unlockDays: -1,
    description: 'Ethereal space warrior',
    rarity: 'mythic',
    price: '$4.99',
    seedModifier: 'cosmic',
    premiumFeatures: {
      starryBackground: true,
      glowEffect: true,
      animatedFrame: true
    }
  },
  adventurerPremium: {
    name: 'Lightning Hero',
    icon: 'flash',
    collection: adventurer,
    unlockDays: -1,
    description: 'Electrifying presence',
    rarity: 'mythic',
    price: '$4.99',
    seedModifier: 'lightning',
    premiumFeatures: {
      electricEffect: true,
      powerAura: true,
      animatedFrame: true
    }
  },
  avataaarsPrestige: {
    name: 'Diamond Elite',
    icon: 'diamond',
    collection: avataaars,
    unlockDays: -1,
    description: 'Ultimate prestige avatar',
    rarity: 'mythic',
    price: '$9.99',
    seedModifier: 'diamond',
    premiumFeatures: {
      diamondCrown: true,
      prestigeBadge: true,
      animatedFrame: true,
      exclusiveColors: true
    }
  },
  botttsUltra: {
    name: 'Cyber Nexus',
    icon: 'hardware-chip',
    collection: bottts,
    unlockDays: -1,
    description: 'Next-gen AI companion',
    rarity: 'mythic',
    price: '$7.99',
    seedModifier: 'cyber',
    premiumFeatures: {
      holographicEffect: true,
      matrixAnimation: true,
      animatedFrame: true
    }
  }
};

export const LIMITED_EDITION_AVATARS = {
  founderMicah: {
    name: 'Founder\'s Spirit',
    icon: 'ribbon',
    collection: micah,
    unlockDays: -2, // Limited edition
    description: 'First 100 users only',
    rarity: 'limited',
    price: '$19.99',
    seedModifier: 'founder',
    limitedEdition: {
      current: 37,
      total: 100
    }
  },
  platinumPersonas: {
    name: 'Platinum Phoenix',
    icon: 'flame',
    collection: personas,
    unlockDays: -2,
    description: 'Rise from the ashes',
    rarity: 'limited',
    price: '$14.99',
    seedModifier: 'platinum',
    limitedEdition: {
      current: 12,
      total: 50
    }
  },
  galaxyLorelei: {
    name: 'Galaxy Master',
    icon: 'star',
    collection: lorelei,
    unlockDays: -2,
    description: 'Cosmic enlightenment',
    rarity: 'limited',
    price: '$24.99',
    seedModifier: 'galaxy',
    limitedEdition: {
      current: 3,
      total: 25
    }
  },
  titanBottts: {
    name: 'Titan Protocol',
    icon: 'shield',
    collection: bottts,
    unlockDays: -2,
    description: 'Unbreakable willpower',
    rarity: 'limited',
    price: '$29.99',
    seedModifier: 'titan',
    limitedEdition: {
      current: 7,
      total: 10
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

const RARITY_COLORS = {
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
  style = 'micah',
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
    : sizeMap[size];
  
  const avatarConfig = AVATAR_STYLES[style];
  const frameColors = RARITY_COLORS[avatarConfig.rarity];

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

      // Style-specific options
      if (style === 'micah' || style === 'micahPremium' || style === 'founderMicah') {
        options.baseColor = avatarConfig.rarity === 'mythic' ? ['ffd700', 'ffed4e'] : avatarConfig.rarity === 'limited' ? ['ffedd5', 'fed7aa'] : ['f9c9b6', 'ac6651'];
        options.earringsProbability = avatarConfig.rarity === 'mythic' || avatarConfig.rarity === 'limited' || daysClean >= 365 ? 100 : 0;
        options.facialHairProbability = 0;
        options.glassesProbability = avatarConfig.rarity === 'mythic' || avatarConfig.rarity === 'limited' || daysClean >= 30 ? 100 : 0;
        options.hairColor = avatarConfig.rarity === 'mythic' ? ['ffd700', 'ff6b6b'] : avatarConfig.rarity === 'limited' ? ['dc2626', 'f97316'] : ['2c1b18', '4a312c', '724133', 'a55728'];
        options.mouth = ['smile', 'laughing'];
        options.shirtColor = avatarConfig.rarity === 'mythic' ? ['ff006e', 'c77dff', '7209b7'] : avatarConfig.rarity === 'limited' ? ['dc2626', 'f97316', 'fbbf24'] : ['6bd9e9', 'fc909f', 'f4d150', '8b5cf6', '10b981'];
      } else if (style === 'lorelei' || style === 'loreleiPremium' || style === 'galaxyLorelei') {
        if (avatarConfig.rarity === 'mythic' || avatarConfig.rarity === 'limited') {
          options.frecklesProbability = 100;
          options.glassesProbability = avatarConfig.rarity === 'limited' ? 75 : 50;
        }
      } else if (style === 'avataaars' || style === 'avataaarsPrestige') {
        options.accessories = avatarConfig.rarity === 'mythic' ? ['wayfarers', 'round'] : daysClean >= 60 ? ['prescription01', 'prescription02'] : [];
        options.facialHair = ['blank'];
        options.mouth = ['smile', 'twinkle'];
        options.eyes = ['happy', 'wink', 'hearts'];
        options.clothesColor = avatarConfig.rarity === 'mythic' ? ['ff6b6b', 'feca57', '48dbfb'] : undefined;
      } else if (style === 'adventurer' || style === 'adventurerPremium') {
        options.skinColor = avatarConfig.rarity === 'mythic' ? ['ffb3ba', 'ff6b9d'] : ['f2b3a1', 'd08b73', 'b57c63'];
        options.hairColor = avatarConfig.rarity === 'mythic' ? ['e91e63', 'f06292'] : ['28150a', '4f1a00', '6a2e35'];
        options.eyes = ['variant01', 'variant02', 'variant03'];
        options.eyebrows = ['variant01', 'variant02'];
        options.mouth = ['variant01', 'variant02', 'variant03'];
      } else if (style === 'bottts' || style === 'botttsUltra' || style === 'titanBottts') {
        if (avatarConfig.rarity === 'mythic') {
          options.colors = ['ff006e', 'c77dff', '7209b7', '3a0ca3', '4cc9f0'];
        } else if (avatarConfig.rarity === 'limited') {
          options.colors = ['dc2626', 'f97316', 'fbbf24', 'fcd34d', 'fde047'];
        }
      } else if (style === 'personas' || style === 'platinumPersonas') {
        if (avatarConfig.rarity === 'limited') {
          options.backgroundColor = ['transparent'];
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
            backgroundColor: avatarConfig.rarity === 'mythic' ? 'transparent' : '#1A1A2E',
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