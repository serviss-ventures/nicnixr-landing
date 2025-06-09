import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Particle {
  id: string;
  animation: Animated.Value;
  x: number;
  y: number;
  size: number;
  delay: number;
}

interface HeartParticlesProps {
  x: number;
  y: number;
  onComplete: () => void;
}

const HeartParticles: React.FC<HeartParticlesProps> = ({ x, y, onComplete }) => {
  const particles = useRef<Particle[]>([]);
  const completionCount = useRef(0);
  
  // Create particles on mount
  useEffect(() => {
    const particleCount = 8;
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const distance = 30;
      const particleX = Math.cos(angle) * distance;
      const particleY = Math.sin(angle) * distance;
      
      newParticles.push({
        id: `particle-${i}`,
        animation: new Animated.Value(0),
        x: particleX,
        y: particleY,
        size: 3 + Math.random() * 2,
        delay: i * 50, // Stagger the animations
      });
    }
    
    particles.current = newParticles;
    
    // Animate all particles
    newParticles.forEach((particle) => {
      Animated.sequence([
        Animated.delay(particle.delay),
        Animated.timing(particle.animation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        completionCount.current += 1;
        if (completionCount.current === particleCount) {
          onComplete();
        }
      });
    });
  }, [onComplete]);
  
  return (
    <View style={[styles.container, { left: x - 50, top: y - 50 }]} pointerEvents="none">
      {particles.current.map((particle) => {
        const translateX = particle.animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, particle.x * 2],
        });
        
        const translateY = particle.animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, particle.y * 2 - 30],
        });
        
        const scale = particle.animation.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 1, 0],
        });
        
        const opacity = particle.animation.interpolate({
          inputRange: [0, 0.2, 0.8, 1],
          outputRange: [0, 0.8, 0.8, 0],
        });
        
        return (
          <Animated.View
            key={particle.id}
            style={[
              styles.particle,
              {
                transform: [
                  { translateX },
                  { translateY },
                  { scale },
                ],
                opacity,
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(236, 72, 153, 0.8)', 'rgba(139, 92, 246, 0.6)']}
              style={[
                styles.particleGradient,
                { width: particle.size, height: particle.size },
              ]}
            />
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  particle: {
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particleGradient: {
    borderRadius: 50,
  },
});

export default HeartParticles; 