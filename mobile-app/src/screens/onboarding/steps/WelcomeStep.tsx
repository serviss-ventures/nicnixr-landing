import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, StatusBar, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store/store';
import { nextStep } from '../../../store/slices/onboardingSlice';
import { COLORS, SPACING } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

/**
 * WelcomeStep Component - Epic Onboarding Experience
 * 
 * The first step in the onboarding flow that introduces users to NicNixr.
 * Features a beautiful animated entrance, compelling copy, and clear value proposition.
 * 
 * Key Features:
 * - Animated scroll indicator for better UX
 * - Glassmorphism effects
 * - Parallax scrolling animations
 * - Dynamic content reveal
 * - 60fps smooth animations
 * 
 * User Feedback Addressed:
 * - Clear scroll affordance with animated indicator
 * - Visual cues for scrollable content
 * - Enhanced visual hierarchy
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
  const scrollIndicatorAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
      
      // Start scroll indicator animation after entrance
      Animated.timing(scrollIndicatorAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }).start();
      
      // Start pulse animation for scroll indicator
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  const handleScroll = (event: any) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const scrolled = contentOffset.y > 20;
    const progress = contentOffset.y / (contentSize.height - layoutMeasurement.height);
    
    if (scrolled !== hasScrolled) {
      setHasScrolled(scrolled);
      
      // Fade out scroll indicator when user starts scrolling
      if (scrolled && scrollIndicatorAnim._value > 0) {
        Animated.timing(scrollIndicatorAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    }
    
    setScrollProgress(Math.min(1, Math.max(0, progress)));
  };

  const handleContinue = () => {
    console.log('➡️ WelcomeStep - Continue button pressed');
    dispatch(nextStep());
  };

  console.log('🎨 WelcomeStep - About to render JSX');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Epic Background Gradient */}
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Animated Background Elements */}
      <View style={styles.backgroundElements}>
        <Animated.View 
          style={[
            styles.floatingCircle1,
            {
              opacity: fadeAnim,
              transform: [
                { 
                  translateY: scrollIndicatorAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-100, 0],
                  })
                }
              ]
            }
          ]}
        >
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.15)', 'rgba(6, 182, 212, 0.15)']}
            style={styles.circle}
          />
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.floatingCircle2,
            {
              opacity: fadeAnim,
              transform: [
                { 
                  translateY: scrollIndicatorAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0],
                  })
                }
              ]
            }
          ]}
        >
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.15)', 'rgba(236, 72, 153, 0.15)']}
            style={styles.circle}
          />
        </Animated.View>
      </View>

      {/* Progress Indicator with Glassmorphism */}
      <Animated.View style={[styles.progressContainer, { opacity: fadeAnim }]}>
        <BlurView intensity={20} style={styles.progressBlur}>
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
        </BlurView>
      </Animated.View>

      {/* Scrollable Content with Enhanced Design */}
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
          {/* Epic Hero Section */}
          <View style={styles.heroContainer}>
            <Animated.View 
              style={[
                styles.heroIconWrapper,
                {
                  transform: [
                    { scale: pulseAnim }
                  ]
                }
              ]}
            >
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.3)', 'rgba(6, 182, 212, 0.3)']}
                style={styles.heroIconBackground}
              >
                <View style={styles.heroIconInner}>
                  <Ionicons name="heart" size={56} color={COLORS.primary} />
                </View>
              </LinearGradient>
            </Animated.View>
            
            {/* Floating particles around hero */}
            <View style={styles.particlesContainer}>
              <View style={[styles.particle, styles.particle1]} />
              <View style={[styles.particle, styles.particle2]} />
              <View style={[styles.particle, styles.particle3]} />
            </View>
          </View>

          {/* Main Title with Epic Typography */}
          <Text style={styles.mainTitle}>
            Welcome to Your{'\n'}
            <Text style={styles.mainTitleGradient}>Freedom Journey</Text>
          </Text>
          
          <Text style={styles.subtitle}>
            Quitting nicotine is tough, but you're not alone in this fight.
          </Text>

          {/* Epic Blueprint Callout */}
          <View style={styles.blueprintCallout}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.08)', 'rgba(6, 182, 212, 0.08)']}
              style={styles.blueprintCard}
            >
              <View style={styles.blueprintBadge}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  style={styles.blueprintBadgeGradient}
                >
                  <Ionicons name="construct" size={16} color="#FFFFFF" />
                  <Text style={styles.blueprintBadgeText}>AI-POWERED</Text>
                </LinearGradient>
              </View>
              
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
            </LinearGradient>
          </View>

          {/* Enhanced Feature Points */}
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.2)', 'rgba(6, 182, 212, 0.2)']}
                style={styles.featureIcon}
              >
                <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
              </LinearGradient>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Tailored to You</Text>
                <Text style={styles.featureDescription}>
                  Your unique habits, triggers, and lifestyle
                </Text>
              </View>
            </View>
            
            <View style={styles.feature}>
              <LinearGradient
                colors={['rgba(236, 72, 153, 0.2)', 'rgba(139, 92, 246, 0.2)']}
                style={styles.featureIcon}
              >
                <Ionicons name="heart" size={24} color="#EC4899" />
              </LinearGradient>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Emotionally Aware</Text>
                <Text style={styles.featureDescription}>
                  Addresses your fears & deepest motivations
                </Text>
              </View>
            </View>
            
            <View style={styles.feature}>
              <LinearGradient
                colors={['rgba(59, 130, 246, 0.2)', 'rgba(147, 51, 234, 0.2)']}
                style={styles.featureIcon}
              >
                <Ionicons name="trending-up" size={24} color="#3B82F6" />
              </LinearGradient>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Science-Backed</Text>
                <Text style={styles.featureDescription}>
                  Proven strategies that actually work
                </Text>
              </View>
            </View>
          </View>

          {/* Epic Motivation Card */}
          <View style={styles.motivationContainer}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.12)', 'rgba(236, 72, 153, 0.12)']}
              style={styles.motivationCard}
            >
              <View style={styles.motivationHeader}>
                <Text style={styles.motivationEmoji}>🕊️</Text>
                <Text style={styles.motivationQuote}>"Freedom is just one decision away"</Text>
              </View>
              <Text style={styles.motivationText}>
                Every step away from nicotine is a step toward the life you deserve. 
                Let's unlock your full potential together.
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
            </LinearGradient>
          </View>

          {/* Testimonial Preview */}
          <View style={styles.testimonialContainer}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.05)', 'rgba(6, 182, 212, 0.05)']}
              style={styles.testimonialCard}
            >
              <View style={styles.testimonialHeader}>
                <View style={styles.testimonialAvatar}>
                  <Text style={styles.testimonialAvatarText}>JD</Text>
                </View>
                <View style={styles.testimonialInfo}>
                  <Text style={styles.testimonialName}>Jake D.</Text>
                  <Text style={styles.testimonialMeta}>90 days nicotine-free</Text>
                </View>
                <View style={styles.testimonialBadge}>
                  <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
                </View>
              </View>
              <Text style={styles.testimonialText}>
                "This app understood me better than I understood myself. 
                The personalized approach made all the difference."
              </Text>
            </LinearGradient>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Animated Scroll Indicator */}
      <Animated.View 
        style={[
          styles.scrollIndicator,
          {
            opacity: scrollIndicatorAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.8],
            }),
            transform: [
              {
                translateY: pulseAnim.interpolate({
                  inputRange: [1, 1.2],
                  outputRange: [0, -10],
                })
              }
            ]
          }
        ]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
          style={styles.scrollIndicatorGradient}
        >
          <View style={styles.scrollIndicatorContent}>
            <Text style={styles.scrollIndicatorText}>Scroll to explore</Text>
            <Animated.View
              style={{
                transform: [
                  {
                    translateY: pulseAnim.interpolate({
                      inputRange: [1, 1.2],
                      outputRange: [0, 5],
                    })
                  }
                ]
              }}
            >
              <Ionicons name="chevron-down" size={24} color={COLORS.primary} />
            </Animated.View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Enhanced Bottom Action */}
      <Animated.View 
        style={[
          styles.bottomContainer, 
          { 
            opacity: fadeAnim,
            transform: [
              {
                translateY: hasScrolled ? 0 : 20
              }
            ]
          }
        ]}
      >
        {/* Progress indicator dots */}
        <View style={styles.scrollProgressDots}>
          {[0, 0.33, 0.66, 1].map((threshold, index) => (
            <View 
              key={index}
              style={[
                styles.progressDot,
                scrollProgress >= threshold && styles.progressDotActive
              ]}
            />
          ))}
        </View>
        
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backgroundElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  floatingCircle1: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 200,
    height: 200,
  },
  floatingCircle2: {
    position: 'absolute',
    bottom: -100,
    left: -50,
    width: 250,
    height: 250,
  },
  circle: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
  },
  progressContainer: {
    paddingTop: height * 0.08,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  progressBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressContent: {
    padding: SPACING.md,
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
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: 120, // Extra padding for scroll indicator
  },
  heroContainer: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
    position: 'relative',
  },
  heroIconWrapper: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  heroIconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  heroIconInner: {
    width: 116,
    height: 116,
    borderRadius: 58,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  particlesContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    top: -40,
    left: -40,
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  particle1: {
    top: 20,
    left: 30,
    backgroundColor: COLORS.primary,
    opacity: 0.6,
  },
  particle2: {
    top: 40,
    right: 20,
    backgroundColor: COLORS.secondary,
    opacity: 0.5,
  },
  particle3: {
    bottom: 30,
    left: 40,
    backgroundColor: '#8B5CF6',
    opacity: 0.4,
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
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
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
    padding: SPACING.xl,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    position: 'relative',
    overflow: 'hidden',
  },
  blueprintBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    borderRadius: 20,
    overflow: 'hidden',
  },
  blueprintBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  blueprintBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  blueprintText: {
    fontSize: Math.min(width * 0.042, 17),
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: Math.min(width * 0.055, 24),
    fontWeight: '600',
    marginTop: SPACING.sm,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
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
    padding: SPACING.xl,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  motivationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  motivationEmoji: {
    fontSize: 40,
    marginRight: SPACING.sm,
  },
  motivationQuote: {
    fontSize: Math.min(width * 0.038, 15),
    color: COLORS.primary,
    fontWeight: '700',
    fontStyle: 'italic',
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
  testimonialContainer: {
    width: '100%',
    maxWidth: width * 0.9,
    marginBottom: SPACING.xl,
  },
  testimonialCard: {
    padding: SPACING.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  testimonialAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  testimonialAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  testimonialInfo: {
    flex: 1,
  },
  testimonialName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  testimonialMeta: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  testimonialBadge: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  testimonialText: {
    fontSize: Math.min(width * 0.038, 15),
    color: COLORS.text,
    lineHeight: Math.min(width * 0.05, 22),
    fontWeight: '500',
    fontStyle: 'italic',
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 10,
  },
  scrollIndicatorGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: SPACING.lg,
  },
  scrollIndicatorContent: {
    alignItems: 'center',
  },
  scrollIndicatorText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    opacity: 0.8,
  },
  bottomContainer: {
    paddingBottom: Math.max(SPACING['2xl'], height * 0.04),
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scrollProgressDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 4,
    transition: 'all 0.3s ease',
  },
  progressDotActive: {
    width: 20,
    backgroundColor: COLORS.primary,
  },
  continueButton: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
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