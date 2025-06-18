import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store/store';
import { nextStep } from '../../../store/slices/onboardingSlice';
import { setUser } from '../../../store/slices/authSlice';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { supabase } from '../../../lib/supabase';
import { onboardingAnalytics } from '../../../services/onboardingAnalytics';
import { User } from '../../../types';
import { logger } from '../../../services/logger';
import { remoteLogger } from '../../../services/remoteLogger';

const { width } = Dimensions.get('window');

/**
 * WelcomeStep Component - Minimalist Introduction
 * 
 * Ultra-minimal design inspired by Apple and Tesla
 * Focus on the journey, not the features
 */
const WelcomeStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Simple, elegant entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    remoteLogger.setContext('screen', 'WelcomeStep');
    remoteLogger.info('User starting onboarding');
    
    try {
      // Create anonymous session to track user through funnel
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        // This is expected to fail in development or offline environments
        logger.debug('Anonymous auth skipped', error);
        remoteLogger.warn('Anonymous auth failed', {
          error: error.message,
          code: error.code
        });
      }
      
      if (data?.user) {
        // Fetch the full user profile (including username) from our users table
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          console.error('Profile fetch error:', profileError);
        }
          
        if (profile) {
          // Set user with full profile including generated username
          dispatch(setUser({
            id: data.user.id,
            email: profile.email,
            username: profile.username,
            displayName: profile.display_name,
            isAnonymous: true,
            dateJoined: data.user.created_at,
            avatarUrl: profile.avatar_url,
          } as User));
          
          console.log('Anonymous user created:', {
            id: data.user.id,
            username: profile.username
          });
        } else {
          // Fallback if profile fetch fails
          dispatch(setUser({
            id: data.user.id,
            email: undefined,
            username: 'NixrWarrior', // Temporary fallback
            displayName: 'NixrWarrior',
            isAnonymous: true,
            dateJoined: data.user.created_at,
          } as User));
        }
        
        // Track onboarding start
        await onboardingAnalytics.trackConversionEvent(
          data.user.id,
          'onboarding_started',
          0
        );
      }
    } catch (err) {
      logger.warn('Continuing without anonymous auth', err);
      remoteLogger.error('Exception during anonymous auth', err);
      // Continue anyway - don't block user progress
    }
    
    dispatch(nextStep());
  };

  return (
    <LinearGradient
      colors={['#000000', '#0A0F1C', '#0F172A']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Icon - Much more spacious */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="pulse" size={36} color="rgba(139, 92, 246, 0.8)" />
            </View>
          </View>

          {/* Title - Refined */}
          <View style={styles.header}>
            <Text style={styles.title}>Begin Your Recovery</Text>
            <Text style={styles.subtitle}>
              Join thousands who have broken free from nicotine
            </Text>
          </View>

          {/* CTA - Clean and spaced */}
          <View style={styles.ctaContainer}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleGetStarted}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl * 2,  // Spacious like BlueprintReveal
  },
  
  // Icon - Spacious and refined
  iconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl * 2,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Header - Clean typography
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl * 3,  // Generous spacing
  },
  title: {
    fontSize: FONTS['3xl'],
    fontWeight: '400',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONTS.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 24,
    maxWidth: width * 0.85,
  },
  
  // CTA - Clean and accessible
  ctaContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    overflow: 'hidden',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  buttonText: {
    fontSize: FONTS.base,
    fontWeight: '500',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
});

export default WelcomeStep; 