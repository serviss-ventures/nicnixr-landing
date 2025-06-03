import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

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
  
  // Gradient color sets for variety
  const gradients = [
    ['#EC4899', '#8B5CF6'], // Pink to purple
    ['#F59E0B', '#EF4444'], // Orange to red
    ['#10B981', '#06B6D4'], // Green to cyan
    ['#8B5CF6', '#3B82F6'], // Purple to blue
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
      <LinearGradient
        colors={selectedGradient}
        style={[styles.heartGradient, { width: randomValues.size, height: randomValues.size }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons 
          name={selectedShape as any} 
          size={randomValues.size * 0.7} 
          color="#FFFFFF" 
          style={styles.heartIcon}
        />
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
  heartGradient: {
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  heartIcon: {
    marginTop: -1,
  },
});

export default FloatingHeart; 