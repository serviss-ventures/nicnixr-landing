import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface OceanShaderProps {
  recoveryDays: number;
  height?: number;
}

export default function OceanShader({ recoveryDays, height = 200 }: OceanShaderProps) {
  const waveAnimation = useRef(new Animated.Value(0)).current;
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Wave animation - slower as recovery progresses
    const calmness = Math.min(recoveryDays / 30, 1);
    const waveDuration = 3000 + (calmness * 7000); // 3s to 10s

    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnimation, {
          toValue: 1,
          duration: waveDuration,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnimation, {
          toValue: 0,
          duration: waveDuration,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Shimmer animation for long-term recovery
    if (recoveryDays > 365) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnimation, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [recoveryDays]);

  // Color evolution based on recovery days
  const getGradientColors = () => {
    if (recoveryDays < 7) {
      // First week: Dark, turbulent waters
      return ['#1e3a5f', '#2d5a7f', '#1a4d73'];
    } else if (recoveryDays < 30) {
      // First month: Healing waters
      return ['#2563eb', '#3b82f6', '#1e40af'];
    } else if (recoveryDays < 365) {
      // First year: Clear waters
      return ['#60a5fa', '#93c5fd', '#3b82f6'];
    } else {
      // Beyond: Pristine waters
      return ['#93c5fd', '#bfdbfe', '#60a5fa'];
    }
  };

  const waveTransform = waveAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const shimmerOpacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  return (
    <View style={[styles.container, { height }]}>
      <LinearGradient
        colors={getGradientColors()}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Multiple animated wave layers */}
        <Animated.View
          style={[
            styles.waveOverlay,
            {
              transform: [{ translateY: waveTransform }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.2)']}
            style={styles.wave}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.5 }}
          />
        </Animated.View>
        
        {/* Second wave layer */}
        <Animated.View
          style={[
            styles.waveOverlay,
            {
              transform: [{ 
                translateY: waveAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [5, -15],
                })
              }],
              opacity: 0.5,
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0)']}
            style={styles.wave}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        </Animated.View>

        {/* Water texture overlay */}
        <View style={styles.textureOverlay}>
          {[...Array(6)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.ripple,
                {
                  top: `${i * 20}%`,
                  opacity: 0.1 - (i * 0.015),
                },
              ]}
            />
          ))}
        </View>

        {/* Shimmer effect for long-term recovery */}
        {recoveryDays > 365 && (
          <Animated.View
            style={[
              styles.shimmer,
              {
                opacity: shimmerOpacity,
              },
            ]}
          />
        )}

        {/* Recovery days overlay */}
        <View style={styles.overlay}>
          <Text style={styles.daysText}>Day {recoveryDays}</Text>
          <Text style={styles.labelText}>Recovery Journey</Text>
          
          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min((recoveryDays / 365) * 100, 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {recoveryDays < 365 
                ? `${Math.round((recoveryDays / 365) * 100)}% to 1 Year`
                : 'Journey Continues'
              }
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    position: 'relative',
  },
  waveOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  wave: {
    flex: 1,
  },
  textureOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  ripple: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 100,
    transform: [{ scaleY: 0.3 }],
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  daysText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  labelText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  progressContainer: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.7,
    marginTop: 8,
  },
}); 