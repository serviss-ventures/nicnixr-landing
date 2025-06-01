import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, StatusBar, ScrollView, SafeAreaView } from 'react-native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store/store';
import { nextStep } from '../../../store/slices/onboardingSlice';
import { COLORS, SPACING } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, G, Text as SvgText, Line } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Recovery milestones data
const RECOVERY_MILESTONES = [
  { day: 1, percent: 5, label: '20 min', title: 'Blood pressure drops', color: '#FF6B6B' },
  { day: 3, percent: 15, label: '3 days', title: 'Taste & smell improve', color: '#4ECDC4' },
  { day: 7, percent: 30, label: '1 week', title: 'Breathing easier', color: '#45B7D1' },
  { day: 30, percent: 50, label: '1 month', title: 'Lung function improves', color: '#96CEB4' },
  { day: 90, percent: 70, label: '3 months', title: 'Circulation restored', color: '#DDA0DD' },
  { day: 365, percent: 90, label: '1 year', title: 'Heart disease risk halved', color: '#FFD93D' },
];

/**
 * WelcomeStep Component - Compelling First Screen
 * 
 * Features an animated recovery timeline chart that shows users
 * their potential health improvements journey
 */
const WelcomeStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(null);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const chartAnim = useRef(new Animated.Value(0)).current;
  
  // Individual milestone animations
  const milestoneAnims = useRef(
    RECOVERY_MILESTONES.map(() => new Animated.Value(0))
  ).current;

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
      }).start(() => {
        // Animate milestones sequentially
        const animations = milestoneAnims.map((anim, index) => 
          Animated.timing(anim, {
            toValue: 1,
            duration: 300,
            delay: index * 100,
            useNativeDriver: true,
          })
        );
        Animated.parallel(animations).start();
      });
    });
  }, []);

  const handleContinue = () => {
    dispatch(nextStep());
  };

  const handleMilestonePress = (index: number) => {
    setSelectedMilestone(selectedMilestone === index ? null : index);
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
                colors={[COLORS.primary, COLORS.secondary]}
                style={[styles.progressFill, { width: '12.5%' }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
            <Text style={styles.progressText}>Step 1 of 8</Text>
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
                colors={[COLORS.primary, COLORS.secondary]}
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
                    stroke={COLORS.primary}
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
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={COLORS.primary} />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                  
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

              {/* Milestone dots */}
              <View style={styles.milestonesContainer}>
                {RECOVERY_MILESTONES.map((milestone, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.milestoneWrapper,
                      {
                        left: `${(milestone.day / 365) * 85 + 5}%`,
                        opacity: milestoneAnims[index],
                        transform: [
                          {
                            scale: milestoneAnims[index].interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 1],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.milestoneDot,
                        { backgroundColor: milestone.color },
                        selectedMilestone === index && styles.milestoneDotActive,
                      ]}
                      onPress={() => handleMilestonePress(index)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.milestoneDotInner} />
                    </TouchableOpacity>
                    
                    {selectedMilestone === index && (
                      <View style={styles.milestoneTooltip}>
                        <Text style={styles.milestoneTooltipTitle}>{milestone.title}</Text>
                        <Text style={styles.milestoneTooltipLabel}>{milestone.label}</Text>
                      </View>
                    )}
                  </Animated.View>
                ))}
              </View>
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
                colors={['rgba(16, 185, 129, 0.1)', 'rgba(5, 150, 105, 0.1)']}
                style={styles.statCardBg}
              >
                <Text style={styles.statNumber}>$4,380</Text>
                <Text style={styles.statLabel}>Saved per year</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.statCard}>
              <LinearGradient
                colors={['rgba(59, 130, 246, 0.1)', 'rgba(37, 99, 235, 0.1)']}
                style={styles.statCardBg}
              >
                <Text style={styles.statNumber}>10 years</Text>
                <Text style={styles.statLabel}>Added to life</Text>
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
                <Ionicons name="sparkles" size={20} color={COLORS.primary} />
                <Text style={styles.blueprintBadge}>PERSONALIZED FOR YOU</Text>
              </View>
              
              <Text style={styles.blueprintText}>
                We'll create your custom quit plan based on your specific habits, triggers, and goals
              </Text>
              
              <View style={styles.blueprintFeatures}>
                <View style={styles.blueprintFeature}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                  <Text style={styles.blueprintFeatureText}>AI-powered insights</Text>
                </View>
                <View style={styles.blueprintFeature}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                  <Text style={styles.blueprintFeatureText}>Daily check-ins</Text>
                </View>
                <View style={styles.blueprintFeature}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                  <Text style={styles.blueprintFeatureText}>24/7 support</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          <View style={{ height: 200 }} />
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
              colors={[COLORS.primary, COLORS.secondary]}
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
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  heroIconWrapper: {
    shadowColor: COLORS.primary,
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
    color: COLORS.primary,
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
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: SPACING.xl,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
  milestonesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  milestoneWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  milestoneDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000',
    marginBottom: 20,
  },
  milestoneDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  milestoneDotActive: {
    transform: [{ scale: 1.3 }],
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  milestoneTooltip: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    padding: SPACING.md,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  milestoneTooltipTitle: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'center',
  },
  milestoneTooltipLabel: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.xl,
    width: '100%',
    maxWidth: width * 0.9,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  statCardBg: {
    padding: SPACING.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: SPACING.xl,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
    color: COLORS.primary,
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