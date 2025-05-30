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
  const slashRotateAnim = useRef(new Animated.Value(0)).current;
  const slashGlowAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;
  const slashCutAnim = useRef(new Animated.Value(0)).current;
  const explosionAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // EPIC CINEMATIC SEQUENCE - WHOOP AIN'T GOT NOTHING ON THIS
    const sequence = Animated.sequence([
      // Stage 1: Dramatic entrance (0.8s)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 12,
          useNativeDriver: true,
        }),
      ]),

      // Stage 2: Logo reveals with anticipation (1.0s)
      Animated.parallel([
        // NIX text dramatic entrance
        Animated.timing(logoFadeAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.spring(logoTranslateY, {
          toValue: 0,
          tension: 70,
          friction: 14,
          useNativeDriver: true,
        }),
        // Building anticipation glow
        Animated.sequence([
          Animated.delay(400),
          Animated.timing(glowAnim, {
            toValue: 0.6,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]),

      // Stage 3: THE EPIC SLASH CUTS THROUGH NIX (1.5s) - THIS IS THE MONEY SHOT
      Animated.sequence([
        Animated.delay(300), // Build tension
        
        // Slash preparation - slight rotation and glow buildup
        Animated.parallel([
          Animated.timing(slashRotateAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(slashGlowAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),

        // THE EPIC CUT - Slash grows dramatically through NIX
        Animated.parallel([
          Animated.spring(slashScaleAnim, {
            toValue: 1,
            tension: 150,
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.timing(slashCutAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          // Explosion of light as slash cuts through
          Animated.sequence([
            Animated.delay(300),
            Animated.timing(explosionAnim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]),

      // Stage 4: R reveals after the epic cut (0.6s)
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

      // Stage 5: Particle magic and final glow (0.8s)
      Animated.timing(particleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),

      // Stage 6: Hold the epic moment (1.2s)
      Animated.delay(1200),

      // Stage 7: Cinematic exit (1.0s)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1000,
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
      {/* Epic gradient background with depth */}
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
        
        {/* Neural network pattern overlay with particle effect */}
        <Animated.View 
          style={[
            styles.patternOverlay,
            {
              opacity: particleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.05],
              }),
            },
          ]}
        />
      </Animated.View>

      {/* EPIC BRAND CONTAINER */}
      <Animated.View
        style={[
          styles.brandContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo container with epic slash cutting through */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoFadeAnim,
              transform: [{ translateY: logoTranslateY }],
            },
          ]}
        >
          {/* Dramatic glow behind entire logo */}
          <Animated.View
            style={[
              styles.logoGlow,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.6],
                }),
                transform: [
                  {
                    scale: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.4],
                    }),
                  },
                ],
              },
            ]}
          />

          {/* Explosion effect when slash cuts through */}
          <Animated.View
            style={[
              styles.explosionGlow,
              {
                opacity: explosionAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.8],
                }),
                transform: [
                  {
                    scale: explosionAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 2.5],
                    }),
                  },
                ],
              },
            ]}
          />
          
          {/* NIX text - will be cut by the slash */}
          <View style={styles.nixContainer}>
            <Text style={styles.nixText}>NIX</Text>
            
            {/* THE EPIC SLASH CUTTING THROUGH NIX */}
            <Animated.View
              style={[
                styles.slashCutter,
                {
                  opacity: slashGlowAnim,
                  transform: [
                    { 
                      scaleX: slashScaleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1.2],
                      }),
                    },
                    { 
                      rotate: slashRotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '-8deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={['#10B981', '#06B6D4', '#8B5CF6', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.epicSlash}
              />
              
              {/* Slash glow effect */}
              <Animated.View
                style={[
                  styles.slashGlowEffect,
                  {
                    opacity: slashCutAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                ]}
              />
            </Animated.View>
          </View>
          
          {/* R text - appears after the slash */}
          <Animated.View
            style={[
              styles.rContainer,
              {
                opacity: taglineFadeAnim,
                transform: [{ translateY: taglineTranslateY }],
              },
            ]}
          >
            <Text style={styles.rText}>R</Text>
          </Animated.View>
        </Animated.View>

        {/* Epic tagline with medical authority */}
        <Animated.View
          style={[
            styles.taglineContainer,
            {
              opacity: particleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
              transform: [
                {
                  translateY: particleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.tagline}>NEURAL RECOVERY TECHNOLOGY</Text>
          <Animated.View 
            style={[
              styles.taglineUnderline,
              {
                scaleX: particleAnim,
              },
            ]} 
          />
        </Animated.View>

        {/* Precision built indicator with epic timing */}
        <Animated.View
          style={[
            styles.premiumIndicator,
            {
              opacity: particleAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 0, 0.8],
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
    top: -30,
    left: -40,
    right: -40,
    bottom: -30,
    borderRadius: 100,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 25,
  },
  explosionGlow: {
    position: 'absolute',
    top: -50,
    left: -60,
    right: -60,
    bottom: -50,
    borderRadius: 120,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 60,
    elevation: 30,
  },
  nixContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nixText: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 6,
    textShadowColor: 'rgba(16, 185, 129, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    fontFamily: 'System',
  },
  slashCutter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -60,
    marginTop: -4,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  epicSlash: {
    width: 120,
    height: 8,
    borderRadius: 4,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
  },
  slashGlowEffect: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  rContainer: {
    marginLeft: 20,
  },
  rText: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 6,
    textShadowColor: 'rgba(16, 185, 129, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    fontFamily: 'System',
  },
  taglineContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: 4,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 10,
    fontFamily: 'System',
    textShadowColor: 'rgba(16, 185, 129, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  taglineUnderline: {
    width: 80,
    height: 2,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  premiumIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  indicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6B7280',
    marginHorizontal: 10,
    shadowColor: '#6B7280',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  indicatorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontFamily: 'System',
  },
});

export default BrandSplash; 