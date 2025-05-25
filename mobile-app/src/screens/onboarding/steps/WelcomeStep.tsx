import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, StatusBar, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store/store';
import { nextStep } from '../../../store/slices/onboardingSlice';
import { COLORS, SPACING } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

/**
 * WelcomeStep Component
 * 
 * The first step in the onboarding flow that introduces users to NixR.
 * Features a beautiful animated entrance, compelling copy, and clear value proposition.
 * 
 * Key Features:
 * - Smooth entrance animations (fade, slide, scale)
 * - Responsive design that adapts to all screen sizes
 * - Professional typography with perfect hierarchy
 * - Motivational messaging focused on personalization
 * - Clear call-to-action to begin the blueprint creation
 * 
 * Animation Details:
 * - 800ms parallel animation on mount
 * - Uses native driver for 60fps performance
 * - Fade in + slide up + scale effects
 * 
 * Design Principles:
 * - Mobile-first responsive design
 * - Mathematical spacing ratios
 * - Consistent color scheme
 * - Accessibility-compliant contrast
 */
const WelcomeStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Entrance animation
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    dispatch(nextStep());
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Progress Indicator */}
      <Animated.View style={[styles.progressContainer, { opacity: fadeAnim }]}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={[styles.progressFill, { width: '12.5%' }]}
          />
        </View>
        <Text style={styles.progressText}>Step 1 of 8</Text>
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.View 
        style={[
          styles.scrollContainer,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ],
          },
        ]}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Hero Icon */}
          <View style={styles.heroContainer}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.2)', 'rgba(6, 182, 212, 0.2)']}
              style={styles.heroIconBackground}
            >
              <Ionicons name="heart" size={48} color={COLORS.primary} />
            </LinearGradient>
          </View>

          {/* Main Title */}
          <Text style={styles.mainTitle}>Welcome to Your{'\n'}Freedom Journey</Text>
          
          <Text style={styles.subtitle}>
            Quitting nicotine is tough, but you're not alone in this fight.
          </Text>

          {/* Blueprint Callout */}
          <View style={styles.blueprintCallout}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.1)', 'rgba(6, 182, 212, 0.1)']}
              style={styles.blueprintCard}
            >
              <Text style={styles.blueprintText}>
                We're building a <Text style={styles.highlightText}>Personalized Quit Blueprint</Text> designed specifically for you.
              </Text>
            </LinearGradient>
          </View>

          {/* Feature Points */}
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.featureText}>Tailored to your unique habits</Text>
            </View>
            
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Ionicons name="heart" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.featureText}>Addresses your fears & motivations</Text>
            </View>
            
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Ionicons name="trending-up" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.featureText}>Strategies that actually work</Text>
            </View>
          </View>

          {/* Motivation */}
          <View style={styles.motivationContainer}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.15)', 'rgba(236, 72, 153, 0.15)']}
              style={styles.motivationCard}
            >
              <Text style={styles.motivationEmoji}>🕊️</Text>
              <Text style={styles.motivationText}>
                Every step away from nicotine is a step toward freedom.{'\n'}Let's unlock your potential together.
              </Text>
            </LinearGradient>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Bottom Action */}
      <Animated.View style={[styles.bottomContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          style={styles.continueButton} 
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.continueButtonGradient}
          >
            <Text style={styles.continueButtonText}>Let's Build Your Blueprint</Text>
            <Ionicons name="arrow-forward" size={24} color={COLORS.text} />
          </LinearGradient>
        </TouchableOpacity>
        
        <Text style={styles.disclaimerText}>
          Takes 5 minutes • Pause anytime • Completely private
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  progressContainer: {
    paddingTop: height * 0.08, // Responsive to screen height
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 8,
  },
  progressText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  heroContainer: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  heroIconBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  mainTitle: {
    fontSize: Math.min(width * 0.075, 32), // Responsive font size
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: Math.min(width * 0.09, 38),
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Math.min(width * 0.045, 18),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: Math.min(width * 0.055, 24),
    paddingHorizontal: SPACING.sm,
    maxWidth: width * 0.85,
  },
  blueprintCallout: {
    marginBottom: SPACING.xl,
    width: '100%',
    maxWidth: width * 0.9,
  },
  blueprintCard: {
    padding: SPACING.xl,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  blueprintText: {
    fontSize: Math.min(width * 0.042, 17),
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: Math.min(width * 0.055, 24),
    fontWeight: '500',
  },
  highlightText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  featuresContainer: {
    marginBottom: SPACING.xl,
    width: '100%',
    maxWidth: width * 0.85,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  featureText: {
    fontSize: Math.min(width * 0.04, 16),
    color: COLORS.text,
    flex: 1,
    lineHeight: Math.min(width * 0.05, 22),
    fontWeight: '600',
  },
  motivationContainer: {
    width: '100%',
    maxWidth: width * 0.9,
  },
  motivationCard: {
    padding: SPACING.xl,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    alignItems: 'center',
  },
  motivationEmoji: {
    fontSize: 32,
    marginBottom: SPACING.md,
  },
  motivationText: {
    fontSize: Math.min(width * 0.04, 16),
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: Math.min(width * 0.052, 22),
    fontWeight: '600',
  },
  bottomContainer: {
    paddingBottom: Math.max(SPACING['2xl'], height * 0.04), // Account for safe area
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  continueButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg + 2,
    paddingHorizontal: SPACING.xl,
  },
  continueButtonText: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: '700',
    color: COLORS.text,
    marginRight: SPACING.sm,
    letterSpacing: 0.5,
  },
  disclaimerText: {
    fontSize: Math.min(width * 0.035, 14),
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: Math.min(width * 0.045, 20),
    fontWeight: '500',
  },
});

export default WelcomeStep; 