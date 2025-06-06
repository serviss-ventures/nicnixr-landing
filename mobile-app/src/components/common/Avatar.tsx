import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AVATAR_FRAME_COLORS } from '../../constants/avatars';

interface AvatarProps {
  emoji: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  badge?: string;
  badgeType?: 'flame' | 'lightning' | 'crown';
  badgeIcon?: string;
  badgeColor?: string;
  showFrame?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ 
  emoji, 
  size = 'medium', 
  rarity = 'common',
  badge,
  badgeType = 'flame',
  badgeIcon,
  badgeColor,
  showFrame = true
}) => {
  const sizeMap = {
    small: { container: 40, emoji: 20, badge: 18, badgeEmoji: 11 },
    medium: { container: 56, emoji: 28, badge: 22, badgeEmoji: 13 },
    large: { container: 80, emoji: 40, badge: 28, badgeEmoji: 16 },
    xlarge: { container: 120, emoji: 60, badge: 36, badgeEmoji: 20 },
  };

  const dimensions = sizeMap[size];
  const frameColors = AVATAR_FRAME_COLORS[rarity];

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
        >
          <View style={[styles.innerCircle, { 
            width: dimensions.container - 4, 
            height: dimensions.container - 4,
            borderRadius: (dimensions.container - 4) / 2
          }]}>
            <Text style={[styles.emoji, { fontSize: dimensions.emoji }]}>{emoji}</Text>
          </View>
        </LinearGradient>
      ) : (
        <View style={[styles.simpleContainer, { 
          width: dimensions.container, 
          height: dimensions.container,
          borderRadius: dimensions.container / 2
        }]}>
          <Text style={[styles.emoji, { fontSize: dimensions.emoji }]}>{emoji}</Text>
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
                size={dimensions.badgeEmoji} 
                color="#FFFFFF" 
              />
            ) : (
              <Text style={[styles.badgeEmoji, { fontSize: dimensions.badgeEmoji }]}>{badge}</Text>
            )}
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
  emoji: {
    textAlign: 'center',
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
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default Avatar; 