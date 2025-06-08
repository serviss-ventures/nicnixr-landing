import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface MinimalAchievementBadgeProps {
  milestone: {
    days: number;
    icon: string;
    color: string;
    title: string;
  };
  size?: number;
  unlocked?: boolean;
}

const MinimalAchievementBadge: React.FC<MinimalAchievementBadgeProps> = ({ 
  milestone, 
  size = 80, 
  unlocked = false 
}) => {
  const opacity = unlocked ? 1 : 0.3;
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background with subtle gradient */}
      <LinearGradient
        colors={unlocked 
          ? [`${milestone.color}20`, `${milestone.color}10`]
          : ['rgba(31, 41, 55, 0.5)', 'rgba(17, 24, 39, 0.5)']}
        style={[styles.background, { opacity }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Inner circle */}
        <View style={[
          styles.innerCircle,
          { 
            backgroundColor: unlocked ? 'rgba(15, 23, 42, 0.8)' : 'rgba(15, 23, 42, 0.5)',
            borderColor: unlocked ? milestone.color : 'rgba(75, 85, 99, 0.5)',
            borderWidth: unlocked ? 2 : 1,
          }
        ]}>
          {/* Icon */}
          <Ionicons 
            name={milestone.icon as any} 
            size={size * 0.35} 
            color={unlocked ? milestone.color : '#6B7280'} 
            style={{ opacity }}
          />
          
          {/* Day number for locked achievements */}
          {!unlocked && (
            <View style={styles.dayBadge}>
              <Text style={styles.dayText}>{milestone.days}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
      
      {/* Subtle glow for unlocked */}
      {unlocked && (
        <View style={[styles.glowRing, { 
          borderColor: milestone.color,
          shadowColor: milestone.color,
        }]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  background: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: '90%',
    height: '90%',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayBadge: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: 'rgba(31, 41, 55, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  dayText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  glowRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 999,
    borderWidth: 1,
    opacity: 0.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
});

export default MinimalAchievementBadge; 