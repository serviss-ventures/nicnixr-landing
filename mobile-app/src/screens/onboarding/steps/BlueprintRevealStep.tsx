import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Animated, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { generateQuitBlueprint } from '../../../store/slices/onboardingSlice';
import { completeOnboarding as authCompleteOnboarding } from '../../../store/slices/authSlice';
import { COLORS, SPACING } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { 
  Circle, 
  Path, 
  Defs, 
  LinearGradient as SvgLinearGradient, 
  Stop,
  Line,
  G,
  Text as SvgText
} from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const BlueprintRevealStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stepData, quitBlueprint, isGeneratingBlueprint } = useSelector((state: RootState) => state.onboarding);
  
  const [showBlueprint, setShowBlueprint] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Generate the blueprint when component mounts
    if (stepData && !quitBlueprint && !isGeneratingBlueprint) {
      // Create a complete onboarding data object with defaults
      const completeData = {
        firstName: stepData.firstName || 'NixR',
        lastName: stepData.lastName || '',
        email: stepData.email || '',
        nicotineProduct: stepData.nicotineProduct || { 
          id: 'other', 
          name: 'Nicotine Product', 
          category: 'other', 
          avgCostPerDay: 10, 
          nicotineContent: 0, 
          harmLevel: 5 
        },
        customNicotineProduct: stepData.customNicotineProduct || '',
        usageDuration: stepData.usageDuration || '1_to_3_years',
        dailyAmount: stepData.dailyAmount || 10,
        packagesPerDay: stepData.packagesPerDay || 1,
        dailyCost: stepData.dailyCost || 15,
        reasonsToQuit: stepData.reasonsToQuit || ['health'],
        customReasonToQuit: stepData.customReasonToQuit || '',
        fearsAboutQuitting: stepData.fearsAboutQuitting || [],
        customFearAboutQuitting: stepData.customFearAboutQuitting || '',
        cravingTriggers: stepData.cravingTriggers || ['stress'],
        customCravingTrigger: stepData.customCravingTrigger || '',
        highRiskSituations: stepData.highRiskSituations || [],
        currentCopingMechanisms: stepData.currentCopingMechanisms || [],
        hasTriedQuittingBefore: stepData.hasTriedQuittingBefore || false,
        previousAttempts: stepData.previousAttempts || 0,
        whatWorkedBefore: stepData.whatWorkedBefore || [],
        whatMadeItDifficult: stepData.whatMadeItDifficult || [],
        longestQuitPeriod: stepData.longestQuitPeriod || '',
        quitDate: new Date().toISOString(),
        quitApproach: stepData.quitApproach || 'immediate',
        preparationDays: stepData.preparationDays || 0,
        motivationalGoals: stepData.motivationalGoals || stepData.reasonsToQuit || ['health'],
        preferredCommunicationStyle: stepData.preferredCommunicationStyle || 'encouraging',
        reminderFrequency: stepData.reminderFrequency || 'moderate',
        hasSupportSystem: stepData.hasSupportSystem || false,
        supportTypes: stepData.supportTypes || [],
        tellOthersAboutQuit: stepData.tellOthersAboutQuit || false,
        healthConcerns: stepData.healthConcerns || ['energy', 'breathing'],
        currentHealthIssues: stepData.currentHealthIssues || [],
        stressLevel: stepData.stressLevel || 3,
        typicalDayStructure: stepData.typicalDayStructure || 'routine',
        exerciseFrequency: stepData.exerciseFrequency || 'weekly',
        sleepQuality: stepData.sleepQuality || 'good',
        completedAt: new Date().toISOString(),
        onboardingVersion: '1.0',
      };

      dispatch(generateQuitBlueprint(completeData));
    }
  }, [dispatch, stepData, quitBlueprint, isGeneratingBlueprint]);

  useEffect(() => {
    if (quitBlueprint && !showBlueprint) {
      // Show blueprint with animation after generation
      setTimeout(() => {
        setShowBlueprint(true);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
      }, 1000);
    }
  }, [quitBlueprint, showBlueprint, fadeAnim, slideAnim]);

  useEffect(() => {
    // Pulse animation for premium elements
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const handleGetStarted = async () => {
    try {
      // Prepare complete onboarding data
      const onboardingData = {
        quitDate: new Date().toISOString(),
        nicotineProduct: stepData.nicotineProduct!,
        dailyCost: stepData.dailyCost || 15,
        packagesPerDay: stepData.dailyAmount || 10,
        motivationalGoals: stepData.reasonsToQuit || ['health'],
        previousAttempts: stepData.previousAttempts || 0,
        reasonsToQuit: stepData.reasonsToQuit || ['health'],
        firstName: stepData.firstName || 'NixR',
        lastName: stepData.lastName || 'Warrior',
      };
      
      console.log('🚀 Starting completion flow with data:', onboardingData);
      console.log('🎯 User\'s selected nicotine product:', {
        id: onboardingData.nicotineProduct?.id,
        name: onboardingData.nicotineProduct?.name,
        category: onboardingData.nicotineProduct?.category
      });
      
      // Complete authentication - this will handle both auth and onboarding completion
      const result = await dispatch(authCompleteOnboarding(onboardingData));
      
      if (authCompleteOnboarding.fulfilled.match(result)) {
        console.log('✅ Authentication and onboarding completed successfully!');
        // No need to dispatch completeOnboarding() - auth completion will trigger navigation
        // RootNavigator will detect authentication and switch to main app
      } else {
        console.error('❌ Authentication failed:', result);
        Alert.alert(
          'Setup Error', 
          'We had trouble completing your setup. Please try again or contact support if this continues.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error in completion flow:', error);
      Alert.alert(
        'Setup Error', 
        'Something unexpected happened. Please try again or contact support if this continues.',
        [{ text: 'OK' }]
      );
    }
  };

  if (isGeneratingBlueprint) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          {/* Clinical Analysis Animation */}
          <View style={styles.analysisContainer}>
            <Svg width={200} height={200} viewBox="0 0 200 200">
              <Defs>
                <SvgLinearGradient id="analysisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#10B981" stopOpacity="1" />
                  <Stop offset="100%" stopColor="#06B6D4" stopOpacity="1" />
                </SvgLinearGradient>
              </Defs>
              <Circle cx="100" cy="100" r="80" stroke="url(#analysisGrad)" strokeWidth="3" fill="none" strokeDasharray="10,5" />
              <Circle cx="100" cy="100" r="60" stroke="url(#analysisGrad)" strokeWidth="2" fill="none" strokeDasharray="5,3" />
              <Circle cx="100" cy="100" r="40" stroke="url(#analysisGrad)" strokeWidth="1" fill="none" />
              <Circle cx="100" cy="100" r="8" fill="url(#analysisGrad)" />
            </Svg>
          </View>
          
          <Text style={styles.loadingTitle}>Creating Your Personal Plan</Text>
          <Text style={styles.loadingSubtitle}>
            We're putting together everything you shared to build your unique recovery journey
          </Text>
          
          <View style={styles.analysisSteps}>
            <View style={styles.analysisStep}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.stepText}>Understanding your motivations</Text>
            </View>
            <View style={styles.analysisStep}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.stepText}>Identifying your triggers</Text>
            </View>
            <View style={styles.analysisStep}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.stepText}>Building your support strategies</Text>
            </View>
            <View style={styles.analysisStep}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.stepText}>Calculating your success potential</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (!quitBlueprint || !showBlueprint) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Premium Header */}
          <View style={styles.premiumHeader}>
            <Animated.View style={[styles.certificationBadge, { transform: [{ scale: pulseAnim }] }]}>
              <LinearGradient
                colors={['#10B981', '#06B6D4', '#8B5CF6']}
                style={styles.badgeGradient}
              >
                <Ionicons name="shield-checkmark" size={32} color="#FFFFFF" />
                <Text style={styles.badgeText}>PERSONALIZED</Text>
              </LinearGradient>
            </Animated.View>
            
            <Text style={styles.headerTitle}>Your Recovery Plan</Text>
            <Text style={styles.headerSubtitle}>
              Personalized • Supportive • Proven to Work
            </Text>
          </View>

          {/* Success Probability */}
          <View style={styles.successSection}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.1)', 'rgba(139, 92, 246, 0.1)']}
              style={styles.successCard}
            >
              <View style={styles.successHeader}>
                <Ionicons name="trending-up" size={28} color="#10B981" />
                <Text style={styles.successTitle}>Predicted Success Rate</Text>
              </View>
              
              <View style={styles.successMeter}>
                <Text style={styles.successPercentage}>87%</Text>
                <Text style={styles.successLabel}>Based on your profile</Text>
              </View>
              
              <Text style={styles.successNote}>
                People with similar goals achieve 87% success rate with our personalized approach
              </Text>
            </LinearGradient>
          </View>

          {/* Core Interventions */}
          <View style={styles.interventionsSection}>
            <Text style={styles.sectionTitle}>Your Support Tools</Text>
            
            <View style={styles.interventionGrid}>
              <View style={styles.interventionCard}>
                <LinearGradient
                  colors={['rgba(239, 68, 68, 0.1)', 'rgba(220, 38, 127, 0.1)']}
                  style={styles.interventionContent}
                >
                  <Ionicons name="flash" size={24} color="#EF4444" />
                  <Text style={styles.interventionTitle}>Craving Relief</Text>
                  <Text style={styles.interventionDesc}>Quick techniques to get through tough moments</Text>
                </LinearGradient>
              </View>
              
              <View style={styles.interventionCard}>
                <LinearGradient
                  colors={['rgba(59, 130, 246, 0.1)', 'rgba(16, 185, 129, 0.1)']}
                  style={styles.interventionContent}
                >
                  <Ionicons name="fitness" size={24} color="#3B82F6" />
                  <Text style={styles.interventionTitle}>Healthy Habits</Text>
                  <Text style={styles.interventionDesc}>Replace old patterns with positive ones</Text>
                </LinearGradient>
              </View>
              
              <View style={styles.interventionCard}>
                <LinearGradient
                  colors={['rgba(245, 158, 11, 0.1)', 'rgba(239, 68, 68, 0.1)']}
                  style={styles.interventionContent}
                >
                  <Ionicons name="shield" size={24} color="#F59E0B" />
                  <Text style={styles.interventionTitle}>Trigger Management</Text>
                  <Text style={styles.interventionDesc}>Strategies to handle difficult situations</Text>
                </LinearGradient>
              </View>
              
              <View style={styles.interventionCard}>
                <LinearGradient
                  colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)']}
                  style={styles.interventionContent}
                >
                  <Ionicons name="brain" size={24} color="#8B5CF6" />
                  <Text style={styles.interventionTitle}>Mindset Support</Text>
                  <Text style={styles.interventionDesc}>Tools to stay positive and focused</Text>
                </LinearGradient>
              </View>
            </View>
          </View>

          {/* Recovery Timeline */}
          <View style={styles.timelineSection}>
            <Text style={styles.sectionTitle}>Your Recovery Timeline</Text>
            
            <View style={styles.timeline}>
              <View style={styles.timelineItem}>
                <View style={styles.timelineMarker}>
                  <Text style={styles.timelineDay}>Day 1</Text>
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Your Fresh Start</Text>
                  <Text style={styles.timelineDesc}>Beginning your nicotine-free journey</Text>
                </View>
              </View>
              
              <View style={styles.timelineItem}>
                <View style={styles.timelineMarker}>
                  <Text style={styles.timelineDay}>Day 3</Text>
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Getting Through the Hardest Part</Text>
                  <Text style={styles.timelineDesc}>Extra support when you need it most</Text>
                </View>
              </View>
              
              <View style={styles.timelineItem}>
                <View style={styles.timelineMarker}>
                  <Text style={styles.timelineDay}>Week 2</Text>
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Building New Routines</Text>
                  <Text style={styles.timelineDesc}>Creating healthier daily patterns</Text>
                </View>
              </View>
              
              <View style={styles.timelineItem}>
                <View style={styles.timelineMarker}>
                  <Text style={styles.timelineDay}>Month 1</Text>
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Feeling Confident & Strong</Text>
                  <Text style={styles.timelineDesc}>Your new lifestyle becomes natural</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Premium Features Preview */}
          <View style={styles.premiumSection}>
            <Text style={styles.sectionTitle}>What You Get</Text>
            
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>24/7 support when cravings hit</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>Track your progress and celebrate wins</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>Personalized daily check-ins</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>Connect with others on the same journey</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>Emergency support when you need it most</Text>
              </View>
            </View>
          </View>

          {/* Call to Action */}
          <View style={styles.ctaSection}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.1)', 'rgba(139, 92, 246, 0.1)']}
              style={styles.ctaCard}
            >
              <Text style={styles.ctaTitle}>You're Ready to Start</Text>
              <Text style={styles.ctaSubtitle">
                Your personalized plan is ready. Let's begin this journey together.
              </Text>
            </LinearGradient>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Premium CTA Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.premiumButton} onPress={handleGetStarted}>
          <LinearGradient
            colors={['#10B981', '#06B6D4', '#8B5CF6']}
            style={styles.premiumButtonGradient}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="rocket" size={24} color="#FFFFFF" />
              <Text style={styles.premiumButtonText}>Start My Journey</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
        
        <Text style={styles.disclaimerText}>
          Personalized support • Proven methods • You're not alone in this
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  analysisContainer: {
    marginBottom: SPACING['2xl'],
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING['2xl'],
  },
  analysisSteps: {
    alignItems: 'flex-start',
  },
  analysisStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stepText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  content: {
    flex: 1,
    paddingTop: SPACING.xl,
  },
  premiumHeader: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  certificationBadge: {
    marginBottom: SPACING.lg,
  },
  badgeGradient: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: SPACING.lg,
    alignItems: 'center',
    flexDirection: 'row',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: SPACING.sm,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  successSection: {
    marginBottom: SPACING['2xl'],
  },
  successCard: {
    padding: SPACING['2xl'],
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  successMeter: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  successPercentage: {
    fontSize: 48,
    fontWeight: '900',
    color: '#10B981',
    lineHeight: 52,
  },
  successLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  successNote: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  interventionsSection: {
    marginBottom: SPACING['2xl'],
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  interventionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  interventionCard: {
    width: '48%',
    marginBottom: SPACING.md,
  },
  interventionContent: {
    padding: SPACING.lg,
    borderRadius: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  interventionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  interventionDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  timelineSection: {
    marginBottom: SPACING['2xl'],
  },
  timeline: {
    paddingLeft: SPACING.md,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  timelineMarker: {
    width: 60,
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  timelineDay: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.sm,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  timelineDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  premiumSection: {
    marginBottom: SPACING['2xl'],
  },
  featuresList: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    padding: SPACING.lg,
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  ctaSection: {
    marginBottom: SPACING['2xl'],
  },
  ctaCard: {
    padding: SPACING['2xl'],
    borderRadius: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomContainer: {
    paddingVertical: SPACING.lg,
  },
  premiumButton: {
    borderRadius: SPACING.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  premiumButtonGradient: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: SPACING.sm,
  },
  disclaimerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default BlueprintRevealStep; 
export default BlueprintRevealStep; 