import React, { useEffect, useState, useMemo } from 'react';
import { View, Dimensions, Animated, Text, StyleSheet, Easing } from 'react-native';
import Svg, { Circle, G, Defs, RadialGradient, Stop } from 'react-native-svg';
import { COLORS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

interface Particle {
  id: string;
  x: number;
  y: number;
  active: boolean;
  size: number;
  intensity: number;
  layer: number;
  type: 'sparkle' | 'glow' | 'core';
}

interface EnhancedNeuralNetworkProps {
  daysClean: number;
  recoveryPercentage: number;
  centerText?: string;
  centerSubtext?: string;
  size?: number;
  showStats?: boolean;
}

const EnhancedNeuralNetwork: React.FC<EnhancedNeuralNetworkProps> = ({
  daysClean,
  recoveryPercentage,
  centerText,
  centerSubtext,
  size = 300,
  showStats = true,
}) => {
  const [breathingScale] = useState(new Animated.Value(1));
  const [globalGlow] = useState(new Animated.Value(0.3));
  
  // Calculate network intensity based on recovery progress
  const networkIntensity = useMemo(() => {
    const baseIntensity = Math.min(recoveryPercentage / 100, 1);
    const dayBonus = Math.min(daysClean / 365, 0.3);
    return Math.min(baseIntensity + dayBonus, 1);
  }, [recoveryPercentage, daysClean]);

  // Generate simplified particle field
  const particles = useMemo(() => {
    const particleArray: Particle[] = [];
    const centerX = size / 2;
    const centerY = size / 2;
    const maxRadius = size * 0.4;
    
    // Calculate particle count based on recovery progress - increased for richer field
    const baseParticleCount = 350; // Increased from 200
    const progressBonus = Math.floor(networkIntensity * 450); // Increased from 300
    const totalParticles = Math.min(baseParticleCount + progressBonus, 800); // Increased from 500
    
    // Generate particles in circular distribution
    for (let i = 0; i < totalParticles; i++) {
      // Use square root for more even distribution
      const radiusRatio = Math.sqrt(Math.random());
      const radius = radiusRatio * maxRadius;
      const angle = Math.random() * 2 * Math.PI;
      
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      // Determine particle type and properties based on distance from center
      const distanceFromCenter = radius / maxRadius;
      let particleType: 'sparkle' | 'glow' | 'core';
      let particleSize: number;
      let particleIntensity: number;
      
      if (distanceFromCenter < 0.3) {
        particleType = 'core';
        particleSize = 2 + Math.random() * 2;
        particleIntensity = 0.9 + Math.random() * 0.1;
      } else if (distanceFromCenter < 0.7) {
        particleType = 'glow';
        particleSize = 1.5 + Math.random() * 1.5;
        particleIntensity = 0.7 + Math.random() * 0.2;
      } else {
        particleType = 'sparkle';
        particleSize = 1 + Math.random() * 1;
        particleIntensity = 0.5 + Math.random() * 0.3;
      }
      
      // Determine if particle is active based on recovery progress
      const activationThreshold = Math.random();
      const isActive = activationThreshold < networkIntensity || distanceFromCenter < 0.2;
      
      const particle: Particle = {
        id: `particle-${i}`,
        x,
        y,
        active: isActive,
        layer: Math.floor(distanceFromCenter * 5),
        type: particleType,
        size: particleSize,
        intensity: particleIntensity,
      };
      
      particleArray.push(particle);
    }
    
    return particleArray;
  }, [size, networkIntensity]);

  // Enhanced breathing animation - smoother, no jumps
  useEffect(() => {
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(breathingScale, {
          toValue: 1.02, // Slightly reduced to avoid jumps
          duration: 3800, // Slightly different timing to avoid sync issues
          easing: Easing.inOut(Easing.sin), // Back to sine for ultra-smooth
          useNativeDriver: true,
        }),
        Animated.timing(breathingScale, {
          toValue: 0.98, // Slightly reduced to avoid jumps
          duration: 3800,
          easing: Easing.inOut(Easing.sin), // Back to sine for ultra-smooth
          useNativeDriver: true,
        }),
      ])
    );
    breathingAnimation.start();

    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(globalGlow, {
          toValue: 0.45 + (networkIntensity * 0.25), // Slightly reduced to avoid conflicts
          duration: 5200, // Different timing to avoid sync with breathing
          easing: Easing.inOut(Easing.sin), // Matching easing for harmony
          useNativeDriver: false,
        }),
        Animated.timing(globalGlow, {
          toValue: 0.25 + (networkIntensity * 0.1),
          duration: 5200,
          easing: Easing.inOut(Easing.sin), // Matching easing for harmony
          useNativeDriver: false,
        }),
      ])
    );
    glowAnimation.start();

    return () => {
      breathingAnimation.stop();
      glowAnimation.stop();
    };
  }, [networkIntensity]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={{ 
        transform: [{ scale: breathingScale }] 
      }}>
        <Svg width={size} height={size} style={styles.svg}>
          <Defs>
            {/* Simplified gradients */}
            <RadialGradient id="sparkleGradient" cx="50%" cy="50%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <Stop offset="40%" stopColor="#00FFFF" stopOpacity="0.8" />
              <Stop offset="80%" stopColor={COLORS.primary} stopOpacity="0.5" />
              <Stop offset="100%" stopColor={COLORS.secondary} stopOpacity="0.2" />
            </RadialGradient>
            
            <RadialGradient id="glowGradient" cx="50%" cy="50%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <Stop offset="25%" stopColor="#00FFFF" stopOpacity="0.7" />
              <Stop offset="60%" stopColor={COLORS.primary} stopOpacity="0.6" />
              <Stop offset="100%" stopColor={COLORS.secondary} stopOpacity="0.3" />
            </RadialGradient>
            
            <RadialGradient id="coreGradient" cx="50%" cy="50%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <Stop offset="20%" stopColor="#00FFFF" stopOpacity="0.9" />
              <Stop offset="50%" stopColor={COLORS.primary} stopOpacity="0.7" />
              <Stop offset="100%" stopColor={COLORS.secondary} stopOpacity="0.4" />
            </RadialGradient>
            
            <RadialGradient id="inactiveGradient" cx="50%" cy="50%">
              <Stop offset="0%" stopColor={COLORS.primary} stopOpacity="0.2" />
              <Stop offset="70%" stopColor={COLORS.secondary} stopOpacity="0.1" />
              <Stop offset="100%" stopColor={COLORS.primary} stopOpacity="0.05" />
            </RadialGradient>
          </Defs>
          
          {/* Subtle circular boundary */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={size * 0.4}
            fill="none"
            stroke={COLORS.primary}
            strokeWidth={0.5}
            strokeOpacity={networkIntensity * 0.1}
          />
          
          {/* Draw particles with simplified effects */}
          {particles.map((particle) => {
            const gradientId = particle.active 
              ? particle.type === 'sparkle' ? 'sparkleGradient'
                : particle.type === 'glow' ? 'glowGradient'
                : 'coreGradient'
              : 'inactiveGradient';
              
            return (
              <G key={particle.id}>
                {/* Simplified glow layers for active particles */}
                {particle.active && (
                  <>
                    {/* Outer glow */}
                    <Circle
                      cx={particle.x}
                      cy={particle.y}
                      r={particle.size * 3}
                      fill={COLORS.primary}
                      opacity={particle.intensity * 0.04}
                    />
                    
                    {/* Inner glow */}
                    <Circle
                      cx={particle.x}
                      cy={particle.y}
                      r={particle.size * 1.5}
                      fill="#00FFFF"
                      opacity={particle.intensity * 0.15}
                    />
                  </>
                )}
                
                {/* Main particle */}
                <Circle
                  cx={particle.x}
                  cy={particle.y}
                  r={particle.size}
                  fill={`url(#${gradientId})`}
                  opacity={particle.active ? 0.8 : 0.2}
                />
                
                {/* Bright center for active particles */}
                {particle.active && (
                  <Circle
                    cx={particle.x}
                    cy={particle.y}
                    r={particle.size * 0.3}
                    fill="#FFFFFF"
                    opacity={0.9}
                  />
                )}
              </G>
            );
          })}
        </Svg>
      </Animated.View>
      
      {/* Center text overlay */}
      {showStats && (
        <View style={styles.centerTextContainer}>
          <Text style={styles.centerText}>{centerText || daysClean}</Text>
          {centerSubtext && (
            <Text style={styles.centerSubtext}>{centerSubtext}</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  svg: {
    // No absolute positioning to avoid conflicts
  },
  centerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    width: '100%',
    height: '100%',
  },
  centerText: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.text,
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  centerSubtext: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: -8,
  },
});

export default EnhancedNeuralNetwork; 