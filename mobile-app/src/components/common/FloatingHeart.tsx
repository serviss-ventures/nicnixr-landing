import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface FloatingHeartProps {
  x: number;
  y: number;
  onComplete: () => void;
}

const FloatingHeart: React.FC<FloatingHeartProps> = ({ x, y, onComplete }) => {
  // Main animation value
  const animationProgress = useRef(new Animated.Value(0)).current;
  
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
  
  // Smooth upward float
  const translateY = animationProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -120],
  });
  
  // Elegant scale animation
  const scale = animationProgress.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0.3, 1.2, 1.0, 0.8],
  });
  
  // Smooth fade
  const opacity = animationProgress.interpolate({
    inputRange: [0, 0.1, 0.8, 1],
    outputRange: [0, 1, 1, 0],
  });
  
  // Ring expansion for ripple effect
  const ringScale = animationProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 2.5, 3.5],
  });
  
  const ringOpacity = animationProgress.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0.6, 0.3, 0],
  });
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: x - 40, // Center the effect
          top: y - 40,
          opacity,
        },
      ]}
      pointerEvents="none"
    >
      {/* Ripple Ring Effect */}
      <Animated.View
        style={[
          styles.rippleRing,
          {
            transform: [{ scale: ringScale }],
            opacity: ringOpacity,
          },
        ]}
      />
      
      {/* Main Heart with Glow */}
      <Animated.View
        style={[
          styles.heartContainer,
          {
            transform: [
              { translateY },
              { scale },
            ],
          },
        ]}
      >
        {/* Glow Effect */}
        <View style={styles.glowContainer}>
          <LinearGradient
            colors={['rgba(236, 72, 153, 0.6)', 'rgba(139, 92, 246, 0.4)', 'transparent']}
            style={styles.glow}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 0.5, y: 1 }}
          />
        </View>
        
        {/* Glass Heart */}
        <View style={styles.heartWrapper}>
          <BlurView intensity={20} tint="dark" style={styles.blurBackground}>
            <LinearGradient
              colors={['rgba(236, 72, 153, 0.3)', 'rgba(139, 92, 246, 0.2)']}
              style={styles.heartGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons 
                name="heart" 
                size={28} 
                color="rgba(255, 255, 255, 0.9)" 
              />
            </LinearGradient>
          </BlurView>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  rippleRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.5)',
    backgroundColor: 'transparent',
  },
  heartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowContainer: {
    position: 'absolute',
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  heartWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  blurBackground: {
    flex: 1,
    overflow: 'hidden',
  },
  heartGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FloatingHeart; 