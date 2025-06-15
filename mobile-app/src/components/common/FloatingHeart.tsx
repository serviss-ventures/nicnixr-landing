import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface FloatingHeartProps {
  x: number;
  y: number;
  onComplete: () => void;
  color?: string; // Optional color prop for customization
}

const FloatingHeart: React.FC<FloatingHeartProps> = ({ x, y, onComplete, color }) => {
  // Main animation value
  const animationProgress = useRef(new Animated.Value(0)).current;
  
  // Random horizontal drift
  const driftX = useRef((Math.random() - 0.5) * 40).current;
  
  useEffect(() => {
    // Single smooth animation
    Animated.timing(animationProgress, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start(() => {
      onComplete();
    });
  }, [animationProgress, onComplete]);
  
  // Smooth upward float with slight curve
  const translateY = animationProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -120],
  });
  
  // Horizontal drift
  const translateX = animationProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, driftX * 0.5, driftX],
  });
  
  // Elegant scale animation
  const scale = animationProgress.interpolate({
    inputRange: [0, 0.15, 0.5, 0.8, 1],
    outputRange: [0, 1.2, 1.0, 0.8, 0],
  });
  
  // Smooth fade
  const opacity = animationProgress.interpolate({
    inputRange: [0, 0.1, 0.7, 1],
    outputRange: [0, 1, 1, 0],
  });
  
  // Subtle rotation
  const rotate = animationProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '10deg', '-10deg'],
  });
  
  // Dynamic gradient colors
  const gradientColors = color ? [
    color,
    color.replace('0.6)', '0.3)'), // Lighter version
    'transparent'
  ] : [
    'rgba(251, 191, 36, 0.6)', // Default amber
    'rgba(251, 191, 36, 0.3)',
    'transparent'
  ];
  
  const heartColors = color ? [
    color.replace('0.6)', '0.9)'), // More opaque for the heart
    color.replace('0.6)', '0.7)'),
  ] : [
    'rgba(251, 191, 36, 0.9)',
    'rgba(251, 191, 36, 0.7)',
  ];
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: x - 30, // Center the effect
          top: y - 30,
          opacity,
          transform: [
            { translateX },
            { translateY },
            { scale },
            { rotate },
          ],
        },
      ]}
      pointerEvents="none"
    >
      {/* Glow Effect */}
      <View style={styles.glowContainer}>
        <LinearGradient
          colors={gradientColors}
          style={styles.glow}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>
      
      {/* Glass Heart */}
      <View style={styles.heartWrapper}>
        <LinearGradient
          colors={heartColors}
          style={styles.heartGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons 
            name="heart" 
            size={24} 
            color="rgba(255, 255, 255, 0.95)" 
          />
        </LinearGradient>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  glowContainer: {
    position: 'absolute',
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  heartWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  heartGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FloatingHeart; 