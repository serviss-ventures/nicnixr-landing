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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const logoFadeAnim = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(30)).current;
  const taglineFadeAnim = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(20)).current;
  const slashScaleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Premium staged animation sequence
    const sequence = Animated.sequence([
      // Stage 1: Background fade in (0.6s)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),

      // Stage 2: Logo entrance with sophisticated timing (1.2s)
      Animated.parallel([
        // Main logo fade and slide up
        Animated.timing(logoFadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoTranslateY, {
          toValue: 0,
          tension: 80,
          friction: 12,
          useNativeDriver: true,
        }),
        // Slash dramatic entrance
        Animated.sequence([
          Animated.delay(300),
          Animated.spring(slashScaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
        // Glow effect
        Animated.sequence([
          Animated.delay(400),
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ]),

      // Stage 3: Tagline entrance (0.6s)
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(taglineFadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(taglineTranslateY, {
            toValue: 0,
            tension: 80,
            friction: 10,
            useNativeDriver: true,
          }),
        ]),
      ]),

      // Stage 4: Particle effect (0.8s)
      Animated.timing(particleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),

      // Stage 5: Hold the glory (1.0s)
      Animated.delay(1000),

      // Stage 6: Premium exit (0.8s)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]);

    sequence.start(() => {
      onComplete();
    });

    return () => {
      sequence.stop();
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Premium gradient background */}
      <Animated.View
        style={[
          styles.backgroundContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            '#000000',
            '#0A0A0A', 
            '#1A1A1A',
            '#0F0F0F',
            '#000000'
          ]}
          locations={[0, 0.2, 0.5, 0.8, 1]}
          style={styles.background}
        />
        
        {/* Subtle neural network pattern overlay */}
        <Animated.View 
          style={[
            styles.patternOverlay,
            {
              opacity: particleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.03],
              }),
            },
          ]}
        />
      </Animated.View>

      {/* Premium brand container */}
      <Animated.View
        style={[
          styles.brandContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo with sophisticated entrance */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoFadeAnim,
              transform: [{ translateY: logoTranslateY }],
            },
          ]}
        >
          {/* Glow effect behind logo */}
          <Animated.View
            style={[
              styles.logoGlow,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.4],
                }),
                transform: [
                  {
                    scale: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2],
                    }),
                  },
                ],
              },
            ]}
          />
          
          {/* NIX text */}
          <Text style={styles.nixText}>NIX</Text>
          
          {/* Premium animated slash */}
          <Animated.View
            style={[
              styles.slashContainer,
              {
                transform: [{ scaleX: slashScaleAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={['#10B981', '#06B6D4', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.slash}
            />
          </Animated.View>
          
          {/* R text */}
          <Text style={styles.rText}>R</Text>
        </Animated.View>

        {/* Premium tagline with medical authority */}
        <Animated.View
          style={[
            styles.taglineContainer,
            {
              opacity: taglineFadeAnim,
              transform: [{ translateY: taglineTranslateY }],
            },
          ]}
        >
          <Text style={styles.tagline}>NEURAL RECOVERY TECHNOLOGY</Text>
          <View style={styles.taglineUnderline} />
        </Animated.View>

        {/* Subtle premium indicator */}
        <Animated.View
          style={[
            styles.premiumIndicator,
            {
              opacity: particleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.6],
              }),
            },
          ]}
        >
          <View style={styles.indicatorDot} />
          <Text style={styles.indicatorText}>PRECISION BUILT</Text>
          <View style={styles.indicatorDot} />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    // Subtle neural network pattern would be added here via SVG or custom drawing
  },
  brandContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    position: 'relative',
  },
  logoGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 80,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  nixText: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
    textShadowColor: 'rgba(16, 185, 129, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    fontFamily: 'System', // Use system font for maximum compatibility and premium feel
  },
  slashContainer: {
    marginHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slash: {
    width: 80,
    height: 6,
    borderRadius: 3,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 10,
  },
  rText: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
    textShadowColor: 'rgba(16, 185, 129, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    fontFamily: 'System',
  },
  taglineContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
    letterSpacing: 3,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 8,
    fontFamily: 'System',
  },
  taglineUnderline: {
    width: 60,
    height: 1,
    backgroundColor: '#10B981',
    opacity: 0.4,
  },
  premiumIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  indicatorDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#6B7280',
    marginHorizontal: 8,
  },
  indicatorText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6B7280',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: 'System',
  },
});

export default BrandSplash; 