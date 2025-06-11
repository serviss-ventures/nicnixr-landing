import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, StatusBar, ScrollView, SafeAreaView } from 'react-native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store/store';
import { nextStep } from '../../../store/slices/onboardingSlice';
import { COLORS, SPACING } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, G, Text as SvgText, Line, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Recovery milestones data - updated with brand colors
const RECOVERY_MILESTONES = [
  { day: 1, percent: 5, label: '20 min', title: 'Heart rate normalizes', color: '#EC4899' },
  { day: 3, percent: 15, label: '72 hours', title: 'Nicotine leaves system', color: '#A78BFA' },
  { day: 7, percent: 30, label: '1 week', title: 'Dopamine receptors healing', color: '#8B5CF6' },
  { day: 30, percent: 50, label: '1 month', title: 'Anxiety & mood stabilize', color: '#10B981' },
  { day: 90, percent: 70, label: '3 months', title: 'Brain chemistry balanced', color: '#06B6D4' },
  { day: 365, percent: 90, label: '1 year', title: 'Addiction pathways reset', color: '#F59E0B' },
];

/**
 * WelcomeStep Component - Compelling First Screen
 * 
 * Features an animated recovery timeline chart that shows users
 * their potential health improvements journey
 */
const WelcomeStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const chartAnim = useRef(new Animated.Value(0)).current;
  
  // Initialize animations
  useEffect(() => {
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
      // Start chart animation after main content loads
      Animated.timing(chartAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const handleContinue = () => {
    dispatch(nextStep());
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        {/* Gradient Background */}
        <LinearGradient
          colors={['#000000', '#0A0F1C', '#0F172A']}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Progress Indicator */}
        <Animated.View style={[styles.progressContainer, { opacity: fadeAnim }]}>
          <View style={styles.progressContent}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={[COLORS.accent, '#EC4899']}
                style={[styles.progressFill, { width: '12.5%' }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
                          <Text style={styles.progressText}>Step 1 of 9</Text>
          </View>
        </Animated.View>

        {/* Main Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Hero Section */}
          <Animated.View 
            style={[
              styles.heroSection,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ],
              },
            ]}
          >
            <View style={styles.heroIconWrapper}>
              <LinearGradient
                colors={[COLORS.accent, '#EC4899']}
                style={styles.heroIconBackground}
              >
                <Ionicons name="shield-checkmark" size={48} color="#FFFFFF" />
              </LinearGradient>
            </View>

            <Text style={styles.mainTitle}>
              Your Body Starts{'\n'}
              <Text style={styles.mainTitleGradient}>Healing Immediately</Text>
            </Text>
            
            <Text style={styles.subtitle}>
              See what happens when you quit nicotine
            </Text>
          </Animated.View>

          {/* Recovery Timeline Chart */}
          <Animated.View 
            style={[
              styles.chartContainer,
              { 
                opacity: chartAnim,
                transform: [{ scale: chartAnim }]
              }
            ]}
          >
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Your Recovery Timeline</Text>
              
              {/* Chart SVG */}
              <View style={styles.chart}>
                <Svg width={width - 80} height={220} style={styles.svgChart}>
                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map((y, i) => (
                    <Line
                      key={i}
                      x1="30"
                      y1={200 - (y * 1.8)}
                      x2={width - 110}
                      y2={200 - (y * 1.8)}
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* Progress curve */}
                  <Path
                    d={`M 30 200 Q ${(width - 110) * 0.3} 120 ${(width - 110) * 0.5} 80 T ${width - 110} 20`}
                    stroke={COLORS.accent}
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                  
                  {/* Gradient fill under curve */}
                  <Path
                    d={`M 30 200 Q ${(width - 110) * 0.3} 120 ${(width - 110) * 0.5} 80 T ${width - 110} 20 L ${width - 110} 200 L 30 200`}
                    fill="url(#gradient)"
                    opacity="0.2"
                  />
                  
                  {/* Gradient definition */}
                  <Defs>
                    <SvgLinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <Stop offset="0%" stopColor={COLORS.accent} />
                      <Stop offset="100%" stopColor="transparent" />
                    </SvgLinearGradient>
                  </Defs>
                  
                  {/* Y-axis label */}
                  <SvgText
                    x="10"
                    y="15"
                    fill={COLORS.textSecondary}
                    fontSize="10"
                    fontWeight="600"
                  >
                    100%
                  </SvgText>
                  <SvgText
                    x="10"
                    y="205"
                    fill={COLORS.textSecondary}
                    fontSize="10"
                    fontWeight="600"
                  >
                    0%
                  </SvgText>
                </Svg>
              </View>
            </View>
          </Animated.View>

          {/* Recovery Milestones Grid */}
          <Animated.View 
            style={[
              styles.milestonesGridContainer,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.milestonesTitle}>Recovery Milestones</Text>
            <View style={styles.milestonesGrid}>
              {RECOVERY_MILESTONES.map((milestone, index) => (
                <View
                  key={index}
                  style={styles.milestoneCard}
                >
                  <View style={[styles.milestoneIndicator, { backgroundColor: milestone.color }]} />
                  <Text style={styles.milestoneTime}>{milestone.label}</Text>
                  <Text style={styles.milestoneDescription}>{milestone.title}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Stats Cards */}
          <Animated.View 
            style={[
              styles.statsContainer,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.statCard}>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.15)', 'rgba(236, 72, 153, 0.1)']}
                style={styles.statCardBg}
              >
                <Text style={styles.statNumber}>$2,400+</Text>
                <Text style={styles.statLabel}>Saved per year</Text>
              </LinearGradient>
            </View>
          </Animated.View>

          {/* Blueprint Callout */}
          <Animated.View 
            style={[
              styles.blueprintCallout,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.blueprintCard}>
              <View style={styles.blueprintHeader}>
                <Ionicons name="sparkles" size={20} color={COLORS.accent} />
                <Text style={styles.blueprintBadge}>PERSONALIZED FOR YOU</Text>
              </View>
              
              <Text style={styles.blueprintText}>
                We'll create your custom quit plan based on your specific habits, triggers, and goals
              </Text>
              
              <View style={styles.blueprintFeatures}>
                <View style={styles.blueprintFeature}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.accent} />
                  <Text style={styles.blueprintFeatureText}>AI-powered insights</Text>
                </View>
                <View style={styles.blueprintFeature}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.accent} />
                  <Text style={styles.blueprintFeatureText}>Daily journaling</Text>
                </View>
                <View style={styles.blueprintFeature}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.accent} />
                  <Text style={styles.blueprintFeatureText}>Personal recovery plans</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Bottom Action */}
        <Animated.View 
          style={[
            styles.bottomContainer, 
            { opacity: fadeAnim }
          ]}
        >
          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.accent, '#EC4899']}
              style={styles.continueButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.continueButtonText}>Start Your Recovery</Text>
              <View style={styles.continueButtonIcon}>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
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
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  progressContent: {
    borderRadius: 16,
    padding: SPACING.sm,
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
  heroSection: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  heroIconWrapper: {
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  heroIconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: Math.min(width * 0.08, 32),
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
    lineHeight: Math.min(width * 0.095, 38),
    letterSpacing: -1,
  },
  mainTitleGradient: {
    color: COLORS.accent,
  },
  subtitle: {
    fontSize: Math.min(width * 0.042, 17),
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: Math.min(width * 0.055, 22),
    paddingHorizontal: SPACING.sm,
    maxWidth: width * 0.85,
    fontWeight: '500',
  },
  chartContainer: {
    marginBottom: SPACING.xl,
    width: '100%',
    alignItems: 'center',
  },
  chartCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    padding: SPACING.xl,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    width: width - 40,
  },
  chartTitle: {
    fontSize: Math.min(width * 0.045, 18),
    color: COLORS.text,
    fontWeight: '700',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  chart: {
    height: 220,
    width: '100%',
    marginBottom: SPACING.sm,
  },
  svgChart: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  milestonesGridContainer: {
    marginBottom: SPACING.xl,
    width: '100%',
    maxWidth: width * 0.9,
  },
  milestonesTitle: {
    fontSize: Math.min(width * 0.045, 18),
    color: COLORS.text,
    fontWeight: '700',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  milestonesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  milestoneCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  milestoneIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: SPACING.sm,
  },
  milestoneTime: {
    fontSize: Math.min(width * 0.035, 14),
    color: COLORS.accent,
    fontWeight: '700',
    marginBottom: 4,
  },
  milestoneDescription: {
    fontSize: Math.min(width * 0.032, 13),
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  statsContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    width: '100%',
    maxWidth: width * 0.9,
  },
  statCard: {
    width: '80%',
    maxWidth: 280,
  },
  statCardBg: {
    padding: SPACING.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  blueprintCallout: {
    marginBottom: SPACING.xl,
    width: '100%',
    maxWidth: width * 0.9,
  },
  blueprintCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    padding: SPACING.xl,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
  },
  blueprintHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  blueprintBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.accent,
    marginLeft: 6,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  blueprintText: {
    fontSize: Math.min(width * 0.04, 16),
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: Math.min(width * 0.055, 22),
    fontWeight: '600',
    marginBottom: SPACING.lg,
  },
  blueprintFeatures: {
    gap: SPACING.md,
  },
  blueprintFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  blueprintFeatureText: {
    fontSize: Math.min(width * 0.038, 15),
    color: COLORS.text,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 20, 30, 0.7)',
    paddingBottom: Math.max(SPACING.xl, height * 0.02),
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  continueButton: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    shadowColor: COLORS.accent,
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
    width: 28,
    height: 28,
    borderRadius: 14,
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