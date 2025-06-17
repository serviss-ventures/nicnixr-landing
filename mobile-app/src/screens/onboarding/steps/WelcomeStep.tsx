import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store/store';
import { nextStep } from '../../../store/slices/onboardingSlice';
import { setUser } from '../../../store/slices/authSlice';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { supabase } from '../../../lib/supabase';
import { onboardingAnalytics } from '../../../services/onboardingAnalytics';

const { width } = Dimensions.get('window');

/**
 * WelcomeStep Component - Elegant Introduction
 * 
 * Minimal, powerful design inspired by Apple and Tesla's aesthetic
 * Clean typography, purposeful spacing, and subtle animations
 */
const WelcomeStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation for the button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleGetStarted = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      // Create anonymous session to track user through funnel
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (data?.user) {
        // Set anonymous user in Redux
        dispatch(setUser({
          id: data.user.id,
          email: null,
          isAnonymous: true,
          created_at: data.user.created_at,
        }));
        
        // Track onboarding start
        await onboardingAnalytics.trackConversionEvent(
          data.user.id,
          'onboarding_started',
          0
        );
        
        console.log('Anonymous user created:', data.user.id);
      }
    } catch (error) {
      console.log('Continuing without anonymous auth:', error);
      // Continue anyway - don't block user progress
    }
    
    dispatch(nextStep());
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.2)']}
            style={styles.logoGradient}
          >
            <Text style={styles.logo}>N</Text>
          </LinearGradient>
        </View>

        <Text style={styles.appName}>NIXR</Text>
        <Text style={styles.tagline}>Your Journey to Freedom</Text>

        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>🧠</Text>
            <Text style={styles.featureText}>AI-Powered Support</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>🤝</Text>
            <Text style={styles.featureText}>Community of 10,000+</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>🏆</Text>
            <Text style={styles.featureText}>Personalized Recovery Plan</Text>
          </View>
        </View>

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.2)']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.privacyText}>
          No account needed to explore
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    marginBottom: SPACING.xl,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.text,
  },
  appName: {
    fontSize: FONTS['3xl'],
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 2,
    marginBottom: SPACING.sm,
  },
  tagline: {
    fontSize: FONTS.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xxl,
  },
  featureList: {
    marginBottom: SPACING.xxl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  featureText: {
    fontSize: FONTS.base,
    color: COLORS.text,
    fontWeight: '400',
  },
  button: {
    width: width - SPACING.xl * 2,
    marginBottom: SPACING.lg,
  },
  buttonGradient: {
    paddingVertical: 18,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  buttonText: {
    fontSize: FONTS.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  privacyText: {
    fontSize: FONTS.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

export default WelcomeStep; 