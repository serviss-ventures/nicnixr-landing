import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AVATAR_FRAME_COLORS } from '../../constants/avatars';

interface AvatarProps {
  emoji: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  badge?: string;
  showFrame?: boolean;
  isOnline?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ 
  emoji, 
  size = 'medium', 
  rarity = 'common',
  badge,
  showFrame = true,
  isOnline
}) => {
  const sizeMap = {
    small: { container: 40, emoji: 20, badge: 16, badgeEmoji: 10 },
    medium: { container: 56, emoji: 28, badge: 20, badgeEmoji: 12 },
    large: { container: 80, emoji: 40, badge: 24, badgeEmoji: 14 },
    xlarge: { container: 120, emoji: 60, badge: 32, badgeEmoji: 18 },
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
      
      {badge && (
        <View style={[styles.badge, { 
          width: dimensions.badge, 
          height: dimensions.badge,
          borderRadius: dimensions.badge / 2,
          bottom: -2,
          right: -2
        }]}>
          <Text style={{ fontSize: dimensions.badgeEmoji }}>{badge}</Text>
        </View>
      )}
      
      {isOnline !== undefined && (
        <View style={[
          styles.statusDot,
          { 
            backgroundColor: isOnline ? '#10B981' : '#6B7280',
            width: dimensions.container * 0.2,
            height: dimensions.container * 0.2,
            borderRadius: dimensions.container * 0.1,
            bottom: 0,
            right: 0
          }
        ]} />
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
    backgroundColor: '#1A1A2E',
    borderWidth: 2,
    borderColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#1A1A2E',
  },
});

export default Avatar; 