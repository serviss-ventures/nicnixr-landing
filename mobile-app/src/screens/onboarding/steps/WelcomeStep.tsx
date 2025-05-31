import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, StatusBar, ScrollView, SafeAreaView } from 'react-native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store/store';
import { nextStep } from '../../../store/slices/onboardingSlice';
import { COLORS, SPACING } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

/**
 * WelcomeStep Component - Clean Onboarding Experience
 * 
 * The first step in the onboarding flow that introduces users to NicNixr.
 * Features a clean, focused design appropriate for a serious nicotine cessation app.
 * 
 * Key Features:
 * - Clean, minimal design
 * - Clear value proposition
 * - Subtle scroll indicators
 * - Professional appearance
 */
const WelcomeStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [hasScrolled, setHasScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  console.log('🎉 WelcomeStep - Component rendering');
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Initialize animations
  useEffect(() => {
    console.log('🎬 WelcomeStep - Starting entrance animation');
    
    // Main entrance animation
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
    ]).start(() => {
      console.log('✅ WelcomeStep - Animation completed');
    });
  }, []);

  const handleScroll = (event: any) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const scrolled = contentOffset.y > 20;
    const progress = contentOffset.y / (contentSize.height - layoutMeasurement.height);
    
    if (scrolled !== hasScrolled) {
      setHasScrolled(scrolled);
    }
    
    setScrollProgress(Math.min(1, Math.max(0, progress)));
  };

  const handleContinue = () => {
    console.log('➡️ WelcomeStep - Continue button pressed');
    dispatch(nextStep());
  };

  console.log('🎨 WelcomeStep - About to render JSX');

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        {/* Clean Background */}
        <LinearGradient
          colors={['#000000', '#0A0F1C', '#0F172A']}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Simple Progress Indicator */}
        <Animated.View style={[styles.progressContainer, { opacity: fadeAnim }]}>
          <View style={styles.progressContent}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={[styles.progressFill, { width: '12.5%' }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
            <Text style={styles.progressText}>Step 1 of 8</Text>
          </View>
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
            bounces={true}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {/* Hero Section with Shield Icon */}
            <View style={styles.heroContainer}>
              <View style={styles.heroIconWrapper}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  style={styles.heroIconBackground}
                >
                  <Ionicons name="shield-checkmark" size={56} color="#FFFFFF" />
                </LinearGradient>
              </View>
            </View>

            {/* Main Title */}
            <Text style={styles.mainTitle}>
              Welcome to Your{'\n'}
              <Text style={styles.mainTitleGradient}>Freedom Journey</Text>
            </Text>
            
            <Text style={styles.subtitle}>
              Quitting nicotine is tough, but you're not alone in this fight.
            </Text>

            {/* Blueprint Callout */}
            <View style={styles.blueprintCallout}>
              <View style={styles.blueprintCard}>
                <Text style={styles.blueprintText}>
                  We're building a{' '}
                  <Text style={styles.highlightText}>Personalized Quit Blueprint</Text>{' '}
                  designed specifically for you.
                </Text>
                
                <View style={styles.blueprintStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>87%</Text>
                    <Text style={styles.statLabel}>Success Rate</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>5min</Text>
                    <Text style={styles.statLabel}>Setup Time</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>100%</Text>
                    <Text style={styles.statLabel}>Private</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Key Features */}
            <View style={styles.featuresContainer}>
              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Ionicons name="analytics" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Data-Driven</Text>
                  <Text style={styles.featureDescription}>
                    Track your progress with real metrics
                  </Text>
                </View>
              </View>
              
              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Ionicons name="fitness" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Health Focused</Text>
                  <Text style={styles.featureDescription}>
                    Monitor your body's recovery in real-time
                  </Text>
                </View>
              </View>
              
              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Ionicons name="trending-up" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Science-Backed</Text>
                  <Text style={styles.featureDescription}>
                    Proven strategies that actually work
                  </Text>
                </View>
              </View>
            </View>

            {/* Motivation Card */}
            <View style={styles.motivationContainer}>
              <View style={styles.motivationCard}>
                <Text style={styles.motivationQuote}>"Take control of your life, one day at a time"</Text>
                <Text style={styles.motivationText}>
                  Every moment without nicotine is a victory. Your journey to freedom starts here.
                </Text>
                
                <View style={styles.motivationFooter}>
                  <View style={styles.motivationStat}>
                    <Text style={styles.motivationStatNumber}>2.3M+</Text>
                    <Text style={styles.motivationStatLabel}>Lives Changed</Text>
                  </View>
                  <View style={styles.motivationStat}>
                    <Text style={styles.motivationStatNumber}>98%</Text>
                    <Text style={styles.motivationStatLabel}>Recommend Us</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </Animated.View>

        {/* Bottom Action */}
        <Animated.View 
          style={[
            styles.bottomContainer, 
            { 
              opacity: fadeAnim,
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.continueButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.continueButtonText}>Let's Build Your Blueprint</Text>
              <View style={styles.continueButtonIcon}>
                <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={styles.disclaimerContainer}>
            <View style={styles.disclaimerRow}>
              <View style={styles.disclaimerItem}>
                <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.disclaimerText}>5 minutes</Text>
              </View>
              <View style={styles.disclaimerDot} />
              <View style={styles.disclaimerItem}>
                <Ionicons name="pause-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.disclaimerText}>Pause anytime</Text>
              </View>
              <View style={styles.disclaimerDot} />
              <View style={styles.disclaimerItem}>
                <Ionicons name="lock-closed-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.disclaimerText}>100% private</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  progressContainer: {
    paddingTop: height * 0.08,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  progressContent: {
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 8,
  },
  progressText: {
    fontSize: 13,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: 200,
    backgroundColor: 'transparent',
  },
  heroContainer: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  heroIconWrapper: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  heroIconBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: Math.min(width * 0.08, 36),
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: Math.min(width * 0.095, 42),
    letterSpacing: -1,
  },
  mainTitleGradient: {
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: Math.min(width * 0.045, 18),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: Math.min(width * 0.055, 24),
    paddingHorizontal: SPACING.sm,
    maxWidth: width * 0.85,
    fontWeight: '500',
  },
  blueprintCallout: {
    marginBottom: SPACING.xl,
    width: '100%',
    maxWidth: width * 0.9,
  },
  blueprintCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: SPACING.xl,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  blueprintBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  blueprintBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  blueprintText: {
    fontSize: Math.min(width * 0.042, 17),
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: Math.min(width * 0.055, 24),
    fontWeight: '600',
  },
  highlightText: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  blueprintStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  featuresContainer: {
    marginBottom: SPACING.xl,
    width: '100%',
    maxWidth: width * 0.85,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: Math.min(width * 0.042, 17),
    color: COLORS.text,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: Math.min(width * 0.035, 14),
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  motivationContainer: {
    width: '100%',
    maxWidth: width * 0.9,
    marginBottom: SPACING.xl,
  },
  motivationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: SPACING.xl,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  motivationQuote: {
    fontSize: Math.min(width * 0.04, 16),
    color: COLORS.primary,
    fontWeight: '700',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  motivationText: {
    fontSize: Math.min(width * 0.04, 16),
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: Math.min(width * 0.052, 22),
    fontWeight: '600',
  },
  motivationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  motivationStat: {
    alignItems: 'center',
  },
  motivationStatNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 2,
  },
  motivationStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    paddingBottom: Math.max(SPACING['2xl'], height * 0.04),
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  continueButton: {
    borderRadius: 24,
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
    paddingVertical: SPACING.lg + 4,
    paddingHorizontal: SPACING.xl,
  },
  continueButtonText: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: '800',
    color: '#FFFFFF',
    marginRight: SPACING.sm,
    letterSpacing: 0.5,
  },
  continueButtonIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disclaimerContainer: {
    alignItems: 'center',
  },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disclaimerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disclaimerText: {
    fontSize: Math.min(width * 0.032, 13),
    color: COLORS.textMuted,
    marginLeft: 4,
    fontWeight: '600',
  },
  disclaimerDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.textMuted,
    marginHorizontal: SPACING.sm,
  },
});

export default WelcomeStep; 