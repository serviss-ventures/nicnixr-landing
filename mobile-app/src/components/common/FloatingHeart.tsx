import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

interface FloatingHeartProps {
  x: number;
  y: number;
  onComplete: () => void;
}

const FloatingHeart: React.FC<FloatingHeartProps> = ({ x, y, onComplete }) => {
  // Create animated values only once using useRef
  const animatedValue = useRef(new Animated.Value(0)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;
  
  // Random variations for each heart
  const randomValues = useMemo(() => ({
    duration: 2500 + Math.random() * 1500, // 2.5-4 seconds
    height: -200 - Math.random() * 150, // Float up 200-350px
    drift: (Math.random() - 0.5) * 80, // Drift left/right
    size: 20 + Math.random() * 15, // 20-35 size
    gradientIndex: Math.floor(Math.random() * 4), // Pick gradient
    shapeIndex: Math.floor(Math.random() * 3), // Pick shape
  }), []);
  
  // Brand-aligned gradient sets with glassmorphic feel
  const gradients = [
    [COLORS.primary, COLORS.secondary], // Emerald to Cyan
    [COLORS.secondary, COLORS.accent], // Cyan to Purple
    [COLORS.accent, COLORS.primary], // Purple to Emerald
    ['rgba(16, 185, 129, 0.8)', 'rgba(139, 92, 246, 0.8)'], // Transparent variants
  ];
  
  const selectedGradient = gradients[randomValues.gradientIndex];
  
  // Different icon shapes for variety
  const shapes = ['heart', 'heart', 'star']; // More hearts than stars
  const selectedShape = shapes[randomValues.shapeIndex];
  
  useEffect(() => {
    // Main animation
    const animation = Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: randomValues.duration,
        useNativeDriver: true,
      }),
      // Gentle rotation
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: randomValues.duration,
        useNativeDriver: true,
      })
    ]);
    
    animation.start(() => {
      onComplete();
    });
    
    // Cleanup function to stop animation if component unmounts
    return () => {
      animation.stop();
    };
  }, [animatedValue, rotateValue, onComplete, randomValues.duration]);
  
  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, randomValues.height],
  });
  
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, randomValues.drift],
  });
  
  const scale = animatedValue.interpolate({
    inputRange: [0, 0.15, 0.5, 1],
    outputRange: [0, 1.3, 1.0, 0],
  });
  
  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.1, 0.8, 1],
    outputRange: [0, 1, 1, 0],
  });
  
  const rotateOutput = useMemo(() => `${(Math.random() - 0.5) * 45}deg`, []);
  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', rotateOutput],
  });
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: x,
          top: y,
          transform: [
            { translateY },
            { translateX },
            { scale },
            { rotate },
          ],
          opacity,
        },
      ]}
    >
      {/* Glassmorphic container */}
      <View style={[styles.glassmorphicContainer, { width: randomValues.size, height: randomValues.size }]}>
        {/* Background blur effect */}
        <View style={styles.blurBackground} />
        
        {/* Gradient overlay */}
        <LinearGradient
          colors={selectedGradient as readonly [string, string, ...string[]]}
          style={styles.heartGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons 
            name={selectedShape as any} 
            size={randomValues.size * 0.6} 
            color="rgba(255, 255, 255, 0.9)" 
            style={styles.heartIcon}
          />
        </LinearGradient>
        
        {/* Glass edge highlight */}
        <View style={styles.glassEdge} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
  glassmorphicContainer: {
    borderRadius: 100,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Subtle glass background
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // Glass border
    // Glassmorphic shadow
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  blurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  heartGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8, // Slightly transparent for glass effect
  },
  heartIcon: {
    marginTop: -1,
  },
  glassEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: '50%',
    bottom: '50%',
    borderTopLeftRadius: 100,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
});

export default FloatingHeart; 