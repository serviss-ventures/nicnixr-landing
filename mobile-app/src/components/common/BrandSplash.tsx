import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
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
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slashAnim = useRef(new Animated.Value(0)).current;
  const nixAnim = useRef(new Animated.Value(0)).current;
  const rAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const sequence = Animated.sequence([
      // Initial fade in and scale
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.elastic(1.2),
          useNativeDriver: true,
        }),
      ]),

      // Slash animation - dramatic entrance
      Animated.timing(slashAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.back(2)),
        useNativeDriver: true,
      }),

      // NIX letters appear with stagger
      Animated.stagger(150, [
        Animated.timing(nixAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      // R appears with bounce
      Animated.timing(rAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.elastic(1.5),
        useNativeDriver: true,
      }),

      // Glow effect
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      // Hold for brand impact
      Animated.delay(1200),

      // Exit animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 600,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]);

    // Continuous pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: true,
        }),
      ])
    );

    // Subtle rotation for dynamic feel
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    pulse.start();
    rotate.start();

    sequence.start(() => {
      pulse.stop();
      rotate.stop();
      onComplete();
    });

    return () => {
      pulse.stop();
      rotate.stop();
    };
  }, [fadeAnim, scaleAnim, slashAnim, nixAnim, rAnim, glowAnim, pulseAnim, rotateAnim, onComplete]);

  const slashTranslateX = slashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 0],
  });

  const slashRotate = slashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['45deg', '15deg'],
  });

  const nixTranslateY = nixAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  const rTranslateX = rAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8],
  });

  const backgroundRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <LinearGradient
        colors={['#000000', '#0F172A', '#1E293B', '#0F172A', '#000000']}
        style={styles.background}
      />

      {/* Rotating Background Elements */}
      <Animated.View 
        style={[
          styles.backgroundCircle,
          {
            transform: [{ rotate: backgroundRotate }]
          }
        ]}
      >
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.1)', 'transparent', 'rgba(6, 182, 212, 0.1)']}
          style={styles.gradientCircle}
        />
      </Animated.View>

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
        {/* Glow Effect */}
        <Animated.View
          style={[
            styles.glowContainer,
            {
              opacity: glowOpacity,
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.6)', 'rgba(6, 182, 212, 0.6)', 'transparent']}
            style={styles.glow}
          />
        </Animated.View>

        {/* Brand Text Container */}
        <View style={styles.textContainer}>
          {/* NIX with Slash */}
          <View style={styles.nixContainer}>
            {/* N */}
            <Animated.Text
              style={[
                styles.nixLetter,
                {
                  opacity: nixAnim,
                  transform: [{ translateY: nixTranslateY }],
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
                  transform: [{ translateY: nixTranslateY }],
                },
              ]}
            >
              I
            </Animated.Text>

            {/* X with Slash Overlay */}
            <View style={styles.xContainer}>
              <Animated.Text
                style={[
                  styles.nixLetter,
                  {
                    opacity: nixAnim,
                    transform: [{ translateY: nixTranslateY }],
                  },
                ]}
              >
                X
              </Animated.Text>
              
              {/* Slash Effect */}
              <Animated.View
                style={[
                  styles.slashContainer,
                  {
                    opacity: slashAnim,
                    transform: [
                      { translateX: slashTranslateX },
                      { rotate: slashRotate },
                    ],
                  },
                ]}
              >
                <LinearGradient
                  colors={['#EF4444', '#DC2626', '#B91C1C']}
                  style={styles.slash}
                />
              </Animated.View>
            </View>
          </View>

          {/* R */}
          <Animated.Text
            style={[
              styles.rLetter,
              {
                opacity: rAnim,
                transform: [{ translateX: rTranslateX }],
              },
            ]}
          >
            R
          </Animated.Text>
        </View>

        {/* Tagline */}
        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: glowAnim,
            },
          ]}
        >
          Break Free. Live Free.
        </Animated.Text>
      </Animated.View>

      {/* Particle Effects */}
      <View style={styles.particlesContainer}>
        {[...Array(6)].map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                left: `${15 + index * 15}%`,
                top: `${20 + (index % 3) * 20}%`,
                opacity: glowAnim,
                transform: [
                  {
                    scale: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundCircle: {
    position: 'absolute',
    width: width * 2,
    height: width * 2,
    top: -width,
    left: -width / 2,
  },
  gradientCircle: {
    flex: 1,
    borderRadius: width,
  },
  brandContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowContainer: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    top: -100,
    left: -100,
  },
  glow: {
    flex: 1,
    borderRadius: 200,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  nixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  nixLetter: {
    fontSize: 72,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -2,
    textShadowColor: 'rgba(16, 185, 129, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  xContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slashContainer: {
    position: 'absolute',
    width: 60,
    height: 8,
    top: '50%',
    left: '50%',
    marginTop: -4,
    marginLeft: -30,
  },
  slash: {
    flex: 1,
    borderRadius: 4,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  rLetter: {
    fontSize: 72,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -2,
    marginLeft: SPACING.sm,
    textShadowColor: 'rgba(16, 185, 129, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 25,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  particlesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
});

export default BrandSplash; 