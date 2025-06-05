import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, Dimensions, Animated, Text, StyleSheet, Easing } from 'react-native';
import Svg, { Circle, G, Defs, RadialGradient, Stop, Ellipse, Line } from 'react-native-svg';
import { COLORS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

interface Particle {
  id: string;
  x: number;
  y: number;
  baseSize: number;
  layer: number;
  type: 'core' | 'inner' | 'middle' | 'outer';
  angle: number;
  radius: number;
  activationThreshold: number;
  connections: number[];
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
  // Animation values with refs to prevent re-initialization
  const breathingScale = useRef(new Animated.Value(1)).current;
  
  // Smooth interpolated values for recovery progress
  const smoothRecovery = useRef(new Animated.Value(recoveryPercentage / 100)).current;
  const smoothDays = useRef(new Animated.Value(Math.min(daysClean / 90, 1))).current;
  
  // Update smooth values when props change
  useEffect(() => {
    Animated.parallel([
      Animated.timing(smoothRecovery, {
        toValue: recoveryPercentage / 100,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(smoothDays, {
        toValue: Math.min(daysClean / 90, 1),
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [recoveryPercentage, daysClean, smoothRecovery, smoothDays]);
  
  // Generate stable particle field that doesn't change
  const particles = useMemo(() => {
    const particleArray: Particle[] = [];
    const centerX = size / 2;
    const centerY = size / 2;
    const maxRadius = size * 0.42;
    const centerClearZone = size * 0.12;
    
    // Create particles in concentric rings for stable, beautiful distribution
    const rings = [
      { count: 6, radius: 0.25, type: 'core' as const },
      { count: 12, radius: 0.4, type: 'inner' as const },
      { count: 18, radius: 0.6, type: 'middle' as const },
      { count: 24, radius: 0.8, type: 'middle' as const },
      { count: 30, radius: 1, type: 'outer' as const },
    ];
    
    let particleIndex = 0;
    
    rings.forEach((ring, ringIndex) => {
      for (let i = 0; i < ring.count; i++) {
        const angle = (i / ring.count) * Math.PI * 2;
        const radiusVariation = 0.9 + Math.random() * 0.2; // Slight variation
        const actualRadius = Math.max(centerClearZone, ring.radius * maxRadius * radiusVariation);
        
        const x = centerX + actualRadius * Math.cos(angle);
        const y = centerY + actualRadius * Math.sin(angle);
        
        // Activation threshold determines when particle lights up
        // Adjusted for better early progression
        let activationThreshold: number;
        if (ring.type === 'core') {
          // Core particles activate very early (days 0-3)
          activationThreshold = Math.random() * 0.03;
        } else if (ring.type === 'inner') {
          // Inner ring activates days 1-7
          activationThreshold = 0.01 + Math.random() * 0.06;
        } else if (ringIndex === 2) {
          // First middle ring activates days 3-15
          activationThreshold = 0.03 + Math.random() * 0.12;
        } else if (ringIndex === 3) {
          // Second middle ring activates days 10-30
          activationThreshold = 0.1 + Math.random() * 0.2;
        } else {
          // Outer ring activates days 20-60
          activationThreshold = 0.2 + Math.random() * 0.4;
        }
        
        // Create connections to nearby particles
        const connections: number[] = [];
        if (ringIndex > 0 && i % 2 === 0) {
          // Connect to inner ring
          connections.push(Math.max(0, particleIndex - rings[ringIndex - 1].count));
        }
        if (i > 0) {
          // Connect to previous particle in same ring
          connections.push(particleIndex - 1);
        }
        
        particleArray.push({
          id: `particle-${particleIndex}`,
          x,
          y,
          baseSize: ring.type === 'core' ? 2.5 : ring.type === 'inner' ? 2 : ring.type === 'middle' ? 1.5 : 1.2,
          layer: ringIndex,
          type: ring.type,
          angle,
          radius: actualRadius,
          activationThreshold,
          connections,
        });
        
        particleIndex++;
      }
    });
    
    // Add some random particles for organic feel - reduced from 50 to 20
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = centerClearZone + Math.random() * (maxRadius - centerClearZone);
      
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      // More generous activation for random particles too
      const normalizedRadius = radius / maxRadius;
      let activationThreshold: number;
      if (normalizedRadius < 0.4) {
        activationThreshold = Math.random() * 0.08;
      } else if (normalizedRadius < 0.7) {
        activationThreshold = 0.05 + Math.random() * 0.25;
      } else {
        activationThreshold = 0.2 + Math.random() * 0.5;
      }
      
      particleArray.push({
        id: `particle-extra-${i}`,
        x,
        y,
        baseSize: 0.8 + Math.random() * 0.8,
        layer: Math.floor((radius / maxRadius) * 4),
        type: radius < maxRadius * 0.5 ? 'inner' : 'outer',
        angle,
        radius,
        activationThreshold,
        connections: [],
      });
    }
    
    return particleArray;
  }, [size]);

  // Main animations - simplified for performance
  useEffect(() => {
    // Gentle breathing animation
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(breathingScale, {
          toValue: 1.01,  // Even more subtle
          duration: 5000,  // Slower for less CPU usage
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(breathingScale, {
          toValue: 0.99,
          duration: 5000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      { resetBeforeIteration: false }
    );
    
    breathingAnimation.start();

    return () => {
      breathingAnimation.stop();
    };
  }, [recoveryPercentage, breathingScale]);

  // Calculate color based on recovery progress
  const getProgressColor = (progress: number) => {
    if (progress < 0.3) return '#00CED1'; // Dark turquoise
    if (progress < 0.6) return '#00FFFF'; // Cyan
    if (progress < 0.9) return '#40E0D0'; // Turquoise
    return '#7FFFD4'; // Aquamarine
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={{ 
        transform: [{ scale: breathingScale }],
        width: size,
        height: size,
      }}>
        <Svg width={size} height={size} style={styles.svg}>
          <Defs>
            {/* Dynamic gradients that change with progress */}
            <RadialGradient id="coreGradient" cx="50%" cy="50%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <Stop offset="20%" stopColor={getProgressColor(recoveryPercentage / 100)} stopOpacity="0.9" />
              <Stop offset="60%" stopColor={COLORS.primary} stopOpacity="0.7" />
              <Stop offset="100%" stopColor={COLORS.secondary} stopOpacity="0.4" />
            </RadialGradient>
            
            <RadialGradient id="activeGradient" cx="50%" cy="50%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <Stop offset="30%" stopColor={getProgressColor(recoveryPercentage / 100)} stopOpacity="0.8" />
              <Stop offset="70%" stopColor={COLORS.primary} stopOpacity="0.6" />
              <Stop offset="100%" stopColor={COLORS.secondary} stopOpacity="0.3" />
            </RadialGradient>
            
            <RadialGradient id="inactiveGradient" cx="50%" cy="50%">
              <Stop offset="0%" stopColor={COLORS.primary} stopOpacity="0.25" />
              <Stop offset="100%" stopColor={COLORS.secondary} stopOpacity="0.1" />
            </RadialGradient>
            
            {/* Center dark gradient for text visibility */}
            <RadialGradient id="centerDarkGradient" cx="50%" cy="50%">
              <Stop offset="0%" stopColor="#000000" stopOpacity="0.85" />
              <Stop offset="60%" stopColor="#000000" stopOpacity="0.7" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </RadialGradient>
            
            {/* Glow gradient */}
            <RadialGradient id="glowGradient" cx="50%" cy="50%">
              <Stop offset="0%" stopColor={getProgressColor(recoveryPercentage / 100)} stopOpacity="0.4" />
              <Stop offset="50%" stopColor={COLORS.primary} stopOpacity="0.2" />
              <Stop offset="100%" stopColor={COLORS.secondary} stopOpacity="0.05" />
            </RadialGradient>
          </Defs>
          
          {/* Animated background glow - simplified */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={size * 0.45}
            fill="url(#glowGradient)"
            opacity={0.5}
          />
          
          {/* Connection lines between particles */}
          <G opacity={Math.min(recoveryPercentage / 100 * 2, 0.4)}>
            {particles.map((particle) => 
              particle.connections.map((targetIndex) => {
                const target = particles[targetIndex];
                if (!target || particle.activationThreshold > recoveryPercentage / 100) return null;
                
                return (
                  <Line
                    key={`${particle.id}-${targetIndex}`}
                    x1={particle.x}
                    y1={particle.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={getProgressColor(recoveryPercentage / 100)}
                    strokeWidth={0.3}
                    opacity={0.5}
                  />
                );
              })
            )}
          </G>
          
          {/* Dark background for center text */}
          <Ellipse
            cx={size / 2}
            cy={size / 2}
            rx={size * 0.16}
            ry={size * 0.12}
            fill="url(#centerDarkGradient)"
          />
          
          {/* Particles - simplified without animations */}
          {particles.map((particle) => {
            const isActive = particle.activationThreshold <= recoveryPercentage / 100;
            
            return (
              <G key={particle.id}>
                {/* Simple glow for active particles */}
                {isActive && (
                  <Circle
                    cx={particle.x}
                    cy={particle.y}
                    r={particle.baseSize * 2.5}
                    fill={particle.type === 'core' ? COLORS.primary : getProgressColor(recoveryPercentage / 100)}
                    opacity={0.15}
                  />
                )}
                
                {/* Main particle - no animation */}
                <Circle
                  cx={particle.x}
                  cy={particle.y}
                  r={particle.baseSize}
                  fill={isActive 
                    ? particle.type === 'core' ? 'url(#coreGradient)' : 'url(#activeGradient)'
                    : 'url(#inactiveGradient)'
                  }
                  opacity={isActive ? 0.9 : 0.4}
                />
                
                {/* Bright center dot for active particles */}
                {isActive && particle.type !== 'outer' && (
                  <Circle
                    cx={particle.x}
                    cy={particle.y}
                    r={particle.baseSize * 0.3}
                    fill="#FFFFFF"
                    opacity={0.9}
                  />
                )}
              </G>
            );
          })}
          
          {/* Subtle outer ring */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={size * 0.42}
            fill="none"
            stroke={COLORS.primary}
            strokeWidth={0.5}
            strokeOpacity={0.1}
          />
        </Svg>
      </Animated.View>
      
      {/* Center text with enhanced visibility */}
      {showStats && (
        <View style={styles.centerTextContainer}>
          <View style={styles.textBackdrop}>
            <Text style={styles.centerText}>{centerText || daysClean}</Text>
            {centerSubtext && (
              <Text style={styles.centerSubtext}>{centerSubtext}</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  centerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    width: '100%',
    height: '100%',
  },
  textBackdrop: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 60,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  centerText: {
    fontSize: 52,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: '#000000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    letterSpacing: -1.5,
  },
  centerSubtext: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: -6,
    textShadowColor: '#000000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
    letterSpacing: 0.5,
  },
});

export default EnhancedNeuralNetwork; 