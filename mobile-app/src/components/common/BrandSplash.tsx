import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

interface BrandSplashProps {
  onComplete: () => void;
}

const BrandSplash: React.FC<BrandSplashProps> = ({ onComplete }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const nixAnim = useRef(new Animated.Value(0)).current;
  const slashAnim = useRef(new Animated.Value(0)).current;
  const rAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const sequence = Animated.sequence([
      // 1. Initial dramatic entrance (1.5s)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),

      // 2. NIX letters appear with dramatic stagger (1.2s)
      Animated.stagger(200, [
        Animated.spring(nixAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),

      // 3. EPIC SLASH through NIX (0.8s)
      Animated.timing(slashAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),

      // 4. R appears with bounce (0.6s)
      Animated.spring(rAnim, {
        toValue: 1,
        tension: 120,
        friction: 6,
        useNativeDriver: true,
      }),

      // 5. Glow and particles (1s)
      Animated.parallel([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(particleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),

      // 6. Tagline appears (0.5s)
      Animated.timing(taglineAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),

      // 7. HOLD FOR IMPACT - Professional timing (1.5s)
      Animated.delay(1500),

      // 8. Epic exit (1s)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]);

    // Continuous pulse for the glow
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();

    sequence.start(() => {
      pulse.stop();
      onComplete();
    });

    return () => {
      pulse.stop();
    };
  }, []);

  // Interpolations
  const nixTranslateY = nixAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0],
  });

  const nixScale = nixAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const slashScale = slashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const slashRotate = slashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-45deg', '-15deg'],
  });

  const rScale = rAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const rTranslateX = rAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  const taglineTranslateY = taglineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  return (
    <View style={styles.container}>
      {/* Professional Background */}
      <LinearGradient
        colors={['#000000', '#0a0a0a', '#111111', '#0a0a0a', '#000000']}
        style={styles.background}
      />

      {/* Subtle Background Gradient */}
      <View style={styles.subtleBackground} />

      {/* Main Brand Container */}
      <Animated.View
        style={[
          styles.brandContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) }
            ],
          },
        ]}
      >
        {/* Epic Glow Effect */}
        <Animated.View
          style={[
            styles.glowContainer,
            {
              opacity: glowAnim,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.8)', 'rgba(6, 182, 212, 0.6)', 'rgba(16, 185, 129, 0.4)', 'transparent']}
            style={styles.glow}
          />
        </Animated.View>

        {/* Brand Text Container */}
        <View style={styles.textContainer}>
          {/* NIX with Epic Slash */}
          <View style={styles.nixContainer}>
            {/* N */}
            <Animated.Text
              style={[
                styles.nixLetter,
                {
                  opacity: nixAnim,
                  transform: [
                    { translateY: nixTranslateY },
                    { scale: nixScale }
                  ],
                },
              ]}
            >
              N
            </Animated.Text>

            {/* I */}
            <Animated.Text
              style={[
                styles.nixLetter,
                {
                  opacity: nixAnim,
                  transform: [
                    { translateY: nixTranslateY },
                    { scale: nixScale }
                  ],
                },
              ]}
            >
              I
            </Animated.Text>

            {/* X */}
            <Animated.Text
              style={[
                styles.nixLetter,
                {
                  opacity: nixAnim,
                  transform: [
                    { translateY: nixTranslateY },
                    { scale: nixScale }
                  ],
                },
              ]}
            >
              X
            </Animated.Text>
          </View>

          {/* EPIC SLASH THROUGH NIX */}
          <Animated.View
            style={[
              styles.epicSlash,
              {
                opacity: slashAnim,
                transform: [
                  { scale: slashScale },
                  { rotate: slashRotate },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['#FF0000', '#FF4444', '#FF6B6B', '#FF8888']}
              style={styles.slashGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            {/* Slash glow */}
            <LinearGradient
              colors={['rgba(255, 0, 0, 0.8)', 'rgba(255, 68, 68, 0.6)', 'transparent']}
              style={styles.slashGlow}
            />
          </Animated.View>

          {/* R - The Hero */}
          <Animated.Text
            style={[
              styles.rLetter,
              {
                opacity: rAnim,
                transform: [
                  { translateX: rTranslateX },
                  { scale: rScale }
                ],
              },
            ]}
          >
            R
          </Animated.Text>
        </View>

        {/* Epic Tagline */}
        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: taglineAnim,
              transform: [{ translateY: taglineTranslateY }],
            },
          ]}
        >
          BREAK FREE. LIVE EPIC.
        </Animated.Text>
      </Animated.View>

      {/* Professional Accent Lines */}
      <Animated.View style={[styles.accentLinesContainer, { opacity: particleAnim }]}>
        <View style={styles.accentLineTop} />
        <View style={styles.accentLineBottom} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#000000',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  subtleBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(16, 185, 129, 0.02)',
  },
  brandContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowContainer: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    top: -150,
    left: -150,
  },
  glow: {
    flex: 1,
    borderRadius: 250,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    position: 'relative',
  },
  nixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  nixLetter: {
    fontSize: 84,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -3,
    textShadowColor: 'rgba(16, 185, 129, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
    fontFamily: 'System',
  },
  epicSlash: {
    position: 'absolute',
    width: 120,
    height: 12,
    left: 0,
    top: '50%',
    marginTop: -6,
    zIndex: 10,
  },
  slashGradient: {
    flex: 1,
    borderRadius: 6,
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 20,
  },
  slashGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 16,
  },
  rLetter: {
    fontSize: 84,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -3,
    marginLeft: SPACING.lg,
    textShadowColor: 'rgba(16, 185, 129, 1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 40,
    fontFamily: 'System',
  },
  tagline: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 4,
    textAlign: 'center',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(16, 185, 129, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  accentLinesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  accentLineTop: {
    position: 'absolute',
    top: '25%',
    left: '10%',
    right: '10%',
    height: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  accentLineBottom: {
    position: 'absolute',
    bottom: '25%',
    left: '10%',
    right: '10%',
    height: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
});

export default BrandSplash; 