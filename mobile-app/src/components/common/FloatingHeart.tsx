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
  }), []);
  
  // Deep purple gradient sets that match the app theme
  const gradients = [
    ['#8B5CF6', '#EC4899'], // Purple to Pink
    ['#7C3AED', '#DB2777'], // Deeper Purple to Deeper Pink
    ['#6D28D9', '#BE185D'], // Even Deeper Purple to Rose
    ['#9333EA', '#F472B6'], // Bright Purple to Light Pink
  ];
  
  const selectedGradient = gradients[randomValues.gradientIndex];
  
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
      {/* Simplified heart with gradient */}
      <View style={[styles.heartContainer, { width: randomValues.size, height: randomValues.size }]}>
        {/* Gradient overlay */}
        <LinearGradient
          colors={selectedGradient as readonly [string, string, ...string[]]}
          style={styles.heartGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons 
            name="heart" 
            size={randomValues.size * 0.8} 
            color="#FFFFFF" 
            style={styles.heartIcon}
          />
        </LinearGradient>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
  heartContainer: {
    borderRadius: 100,
    overflow: 'hidden',
    // Subtle shadow for depth
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  heartGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIcon: {
    marginTop: -1,
  },
});

export default FloatingHeart; 