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
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});

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
        quitDate: stepData.quitDate || new Date().toISOString(),
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
    // Subtle pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3000,
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
        quitDate: stepData.quitDate || new Date().toISOString(),
        nicotineProduct: stepData.nicotineProduct!,
        dailyCost: stepData.dailyCost || 15,
        packagesPerDay: stepData.dailyAmount || 10,
        motivationalGoals: stepData.reasonsToQuit || ['health'],
        previousAttempts: stepData.previousAttempts || 0,
        reasonsToQuit: stepData.reasonsToQuit || ['health'],
        firstName: stepData.firstName || 'NixR',
        lastName: stepData.lastName || '',
      };
      
      console.log('🚀 Starting completion flow with data:', onboardingData);
      
      // Complete authentication - this will handle both auth and onboarding completion
      const result = await dispatch(authCompleteOnboarding(onboardingData));
      
      if (authCompleteOnboarding.fulfilled.match(result)) {
        console.log('✅ Authentication and onboarding completed successfully!');
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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (isGeneratingBlueprint) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          {/* Modern Loading Animation */}
          <View style={styles.loadingIconContainer}>
            <LinearGradient
              colors={['#10B981', '#06B6D4', '#8B5CF6']}
              style={styles.loadingGradient}
            >
              <Ionicons name="sparkles" size={48} color={COLORS.text} />
            </LinearGradient>
          </View>
          
          <Text style={styles.loadingTitle}>Finalizing Your Recovery Plan</Text>
          <Text style={styles.loadingSubtitle}>
            We're assembling everything into your personalized roadmap to freedom
          </Text>
          
          <View style={styles.loadingSteps}>
            <View style={styles.loadingStep}>
              <View style={styles.stepIcon} />
              <Text style={styles.stepText}>Mapping your daily recovery milestones</Text>
            </View>
            <View style={styles.loadingStep}>
              <View style={styles.stepIcon} />
              <Text style={styles.stepText}>Personalizing strategies for your triggers</Text>
            </View>
            <View style={styles.loadingStep}>
              <View style={styles.stepIcon} />
              <Text style={styles.stepText}>Building your support network features</Text>
            </View>
            <View style={styles.loadingStep}>
              <View style={styles.stepIcon} />
              <Text style={styles.stepText}>Activating your neural recovery tracking</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (!quitBlueprint || !showBlueprint) {
    return <View style={styles.container} />;
  }

  // Get personalized data from previous steps
  const successProbability = stepData?.successProbability || 87;
  const nicotineProduct = stepData?.nicotineProduct?.name || 'nicotine';
  const quitDateObj = new Date(stepData?.quitDate || new Date());
  const daysUntilQuit = Math.ceil((quitDateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={[styles.progressFill, { width: '100%' }]}
          />
        </View>
        <Text style={styles.progressText}>Step 8 of 8</Text>
      </View>

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header - Seamless transition from analysis */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <LinearGradient
                colors={['#10B981', '#06B6D4']}
                style={styles.iconGradient}
              >
                <Ionicons name="map" size={32} color={COLORS.text} />
              </LinearGradient>
            </View>
            
            <Text style={styles.headerTitle}>Your Recovery Roadmap</Text>
            <Text style={styles.headerSubtitle}>
              Based on your {successProbability}% success outlook, here's your personalized plan
            </Text>
          </View>

          {/* Quick Start Summary */}
          <View style={styles.summaryCard}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.1)', 'rgba(6, 182, 212, 0.1)']}
              style={styles.summaryGradient}
            >
              <View style={styles.summaryHeader}>
                <View style={styles.calendarIcon}>
                  <View style={styles.calendarTop} />
                  <View style={styles.calendarBody}>
                    <Text style={styles.calendarText} numberOfLines={1} adjustsFontSizeToFit>
                      {daysUntilQuit === 0 ? 'Today' : `${daysUntilQuit}d`}
                    </Text>
                  </View>
                </View>
                <Text style={styles.summaryTitle}>Your Journey Begins</Text>
              </View>
              
              <Text style={styles.summaryText}>
                {daysUntilQuit === 0 
                  ? `Starting today, your brain begins healing from ${nicotineProduct}. Every hour brings new recovery milestones.`
                  : `In ${daysUntilQuit} days, you'll begin your freedom from ${nicotineProduct}. Until then, we'll help you prepare.`
                }
              </Text>
            </LinearGradient>
          </View>

          {/* Your Daily Experience */}
          <TouchableOpacity 
            style={styles.sectionCard}
            onPress={() => toggleSection('daily')}
            activeOpacity={0.7}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <View style={styles.sunIcon}>
                  <View style={styles.sunCore} />
                  <View style={styles.sunRay1} />
                  <View style={styles.sunRay2} />
                  <View style={styles.sunRay3} />
                  <View style={styles.sunRay4} />
                </View>
              </View>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Your Daily Experience</Text>
                <Text style={styles.sectionPreview}>Wake up to personalized support every day</Text>
              </View>
              <Ionicons 
                name={expandedSections.daily ? "chevron-up" : "chevron-down"} 
                size={24} 
                color={COLORS.textSecondary} 
              />
            </View>
            
            {expandedSections.daily && (
              <Animated.View style={styles.sectionContent}>
                <View style={styles.featureItem}>
                  <View style={styles.featureBullet} />
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureTitle}>Morning Motivation</Text>
                    <Text style={styles.featureDescription}>
                      Start each day with an inspiring message tailored to your current recovery phase
                    </Text>
                  </View>
                </View>
                
                <View style={styles.featureItem}>
                  <View style={styles.featureBullet} />
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureTitle}>Smart Daily Tips</Text>
                    <Text style={styles.featureDescription}>
                      Get practical advice specific to {nicotineProduct} recovery, exactly when you need it
                    </Text>
                  </View>
                </View>
                
                <View style={styles.featureItem}>
                  <View style={styles.featureBullet} />
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureTitle}>Progress Celebrations</Text>
                    <Text style={styles.featureDescription}>
                      Unlock achievements and see your stats grow - money saved, health recovered, life regained
                    </Text>
                  </View>
                </View>
              </Animated.View>
            )}
          </TouchableOpacity>

          {/* Neural Recovery Tracking */}
          <TouchableOpacity 
            style={styles.sectionCard}
            onPress={() => toggleSection('neural')}
            activeOpacity={0.7}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <View style={styles.brainIcon}>
                  <View style={styles.brainLeft} />
                  <View style={styles.brainRight} />
                  <View style={styles.brainStem} />
                </View>
              </View>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Neural Recovery Map</Text>
                <Text style={styles.sectionPreview}>Watch your brain heal in real-time</Text>
              </View>
              <Ionicons 
                name={expandedSections.neural ? "chevron-up" : "chevron-down"} 
                size={24} 
                color={COLORS.textSecondary} 
              />
            </View>
            
            {expandedSections.neural && (
              <Animated.View style={styles.sectionContent}>
                <View style={styles.neuralPreview}>
                  <LinearGradient
                    colors={['rgba(139, 92, 246, 0.1)', 'rgba(16, 185, 129, 0.1)']}
                    style={styles.neuralPreviewGradient}
                  >
                    <Text style={styles.neuralPreviewText}>
                      See your dopamine pathways regenerate day by day
                    </Text>
                  </LinearGradient>
                </View>
                
                <View style={styles.featureItem}>
                  <View style={styles.featureBullet} />
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureTitle}>5 Recovery Phases</Text>
                    <Text style={styles.featureDescription}>
                      Track your progress through Awakening, Rewiring, Strengthening, Thriving, and Mastery phases
                    </Text>
                  </View>
                </View>
                
                <View style={styles.featureItem}>
                  <View style={styles.featureBullet} />
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureTitle}>Daily Brain Updates</Text>
                    <Text style={styles.featureDescription}>
                      Get science-backed insights about what's happening in your brain each day
                    </Text>
                  </View>
                </View>
              </Animated.View>
            )}
          </TouchableOpacity>

          {/* Community Support */}
          <TouchableOpacity 
            style={styles.sectionCard}
            onPress={() => toggleSection('community')}
            activeOpacity={0.7}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <View style={styles.peopleIcon}>
                  <View style={styles.person1} />
                  <View style={styles.person2} />
                  <View style={styles.person3} />
                </View>
              </View>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Recovery Warriors</Text>
                <Text style={styles.sectionPreview}>Join teams and support each other</Text>
              </View>
              <Ionicons 
                name={expandedSections.community ? "chevron-up" : "chevron-down"} 
                size={24} 
                color={COLORS.textSecondary} 
              />
            </View>
            
            {expandedSections.community && (
              <Animated.View style={styles.sectionContent}>
                <View style={styles.featureItem}>
                  <View style={styles.featureBullet} />
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureTitle}>Team Challenges</Text>
                    <Text style={styles.featureDescription}>
                      Join forces with others quitting {nicotineProduct} and achieve milestones together
                    </Text>
                  </View>
                </View>
                
                <View style={styles.featureItem}>
                  <View style={styles.featureBullet} />
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureTitle}>Peer Support</Text>
                    <Text style={styles.featureDescription}>
                      Get encouragement and advice from people who understand your journey
                    </Text>
                  </View>
                </View>
                
                <View style={styles.featureItem}>
                  <View style={styles.featureBullet} />
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureTitle}>Victory Sharing</Text>
                    <Text style={styles.featureDescription}>
                      Celebrate wins together and inspire others with your progress
                    </Text>
                  </View>
                </View>
              </Animated.View>
            )}
          </TouchableOpacity>

          {/* Recovery Journal */}
          <TouchableOpacity 
            style={styles.sectionCard}
            onPress={() => toggleSection('journal')}
            activeOpacity={0.7}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <View style={styles.journalIcon}>
                  <View style={styles.journalCover} />
                  <View style={styles.journalLine1} />
                  <View style={styles.journalLine2} />
                  <View style={styles.journalLine3} />
                </View>
              </View>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Smart Recovery Journal</Text>
                <Text style={styles.sectionPreview}>Track patterns and prevent relapses</Text>
              </View>
              <Ionicons 
                name={expandedSections.journal ? "chevron-up" : "chevron-down"} 
                size={24} 
                color={COLORS.textSecondary} 
              />
            </View>
            
            {expandedSections.journal && (
              <Animated.View style={styles.sectionContent}>
                <View style={styles.featureItem}>
                  <View style={styles.featureBullet} />
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureTitle}>Intelligent Tracking</Text>
                    <Text style={styles.featureDescription}>
                      Our AI identifies patterns in your moods, triggers, and cravings to help you stay ahead
                    </Text>
                  </View>
                </View>
                
                <View style={styles.featureItem}>
                  <View style={styles.featureBullet} />
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureTitle}>Customizable Factors</Text>
                    <Text style={styles.featureDescription}>
                      Track what matters to you - from sleep quality to stress levels to victories
                    </Text>
                  </View>
                </View>
              </Animated.View>
            )}
          </TouchableOpacity>

          {/* Ready to Start */}
          <View style={styles.readySection}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.1)', 'rgba(139, 92, 246, 0.1)']}
              style={styles.readyCard}
            >
              <Text style={styles.readyTitle}>Start Your {successProbability}% Success Journey Now</Text>
              <Text style={styles.readyDescription}>
                Every day you wait is another day controlled by {nicotineProduct}. Your personalized AI system is ready to guide you to freedom.
              </Text>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{successProbability}%</Text>
                  <Text style={styles.statLabel}>Success Rate</Text>
                  <Text style={styles.statSubLabel}>vs 3-5% alone</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>247K+</Text>
                  <Text style={styles.statLabel}>Users Helped</Text>
                  <Text style={styles.statSubLabel}>and growing</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>24/7</Text>
                  <Text style={styles.statLabel}>AI Support</Text>
                  <Text style={styles.statSubLabel}>always there</Text>
                </View>
              </View>
              
              <View style={styles.urgencyContainer}>
                <LinearGradient
                  colors={['rgba(245, 158, 11, 0.1)', 'rgba(245, 158, 11, 0.05)']}
                  style={styles.urgencyGradient}
                >
                  <View style={styles.urgencyContent}>
                    <Ionicons name="gift" size={18} color="#F59E0B" />
                    <View style={styles.urgencyTextContainer}>
                      <Text style={styles.urgencyText}>
                        Limited Time Offer
                      </Text>
                      <Text style={styles.urgencySubtext}>
                        Free first month • Normally $29.99
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      </Animated.View>

      {/* CTA Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.startButton} onPress={handleGetStarted}>
          <LinearGradient
            colors={['#10B981', '#06B6D4', '#8B5CF6']}
            style={styles.startButtonGradient}
          >
            <Animated.View 
              style={[
                styles.buttonContent,
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              <Ionicons name="rocket" size={24} color="#FFFFFF" />
              <Text style={styles.startButtonText}>Start Free Now</Text>
            </Animated.View>
          </LinearGradient>
        </TouchableOpacity>
        
        <Text style={styles.ctaNote}>
          Free for 30 days • Then $9.99/month • Cancel anytime
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
  loadingIconContainer: {
    marginBottom: SPACING['2xl'],
  },
  loadingGradient: {
    padding: SPACING.xl,
    borderRadius: SPACING.lg,
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
  loadingSteps: {
    alignItems: 'flex-start',
  },
  loadingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stepIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: SPACING.sm,
  },
  stepText: {
    fontSize: 14,
    color: COLORS.text,
  },
  content: {
    flex: 1,
    paddingTop: SPACING.xl,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  progressBar: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    flex: 1,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  headerIcon: {
    marginBottom: SPACING.md,
  },
  iconGradient: {
    padding: SPACING.sm,
    borderRadius: SPACING.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  summaryCard: {
    marginBottom: SPACING.xl,
  },
  summaryGradient: {
    padding: SPACING.lg,
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  calendarIcon: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  calendarTop: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  calendarBody: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10B981',
    textAlign: 'center',
    lineHeight: 18,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  summaryText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  sectionCard: {
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  sectionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionPreview: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionContent: {
    padding: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  featureBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: SPACING.sm,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  featureDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  neuralPreview: {
    marginBottom: SPACING.lg,
  },
  neuralPreviewGradient: {
    padding: SPACING.lg,
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  neuralPreviewText: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  readySection: {
    marginBottom: SPACING.xl,
  },
  readyCard: {
    padding: SPACING.lg,
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  readyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    lineHeight: 28,
  },
  readyDescription: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: SPACING.xs,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'center',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#10B981',
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  statSubLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    opacity: 0.8,
  },
  urgencyContainer: {
    marginTop: SPACING.lg,
  },
  urgencyGradient: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  urgencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgencyTextContainer: {
    marginLeft: SPACING.sm,
    alignItems: 'center',
  },
  urgencyText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '700',
  },
  urgencySubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  bottomContainer: {
    paddingVertical: SPACING.lg,
  },
  startButton: {
    borderRadius: SPACING.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  startButtonGradient: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: SPACING.sm,
  },
  ctaNote: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  
  // Custom icon styles
  sunIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunCore: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F59E0B',
  },
  sunRay1: {
    position: 'absolute',
    top: -4,
    width: 2,
    height: 6,
    backgroundColor: '#F59E0B',
  },
  sunRay2: {
    position: 'absolute',
    right: -4,
    width: 6,
    height: 2,
    backgroundColor: '#F59E0B',
  },
  sunRay3: {
    position: 'absolute',
    bottom: -4,
    width: 2,
    height: 6,
    backgroundColor: '#F59E0B',
  },
  sunRay4: {
    position: 'absolute',
    left: -4,
    width: 6,
    height: 2,
    backgroundColor: '#F59E0B',
  },
  
  brainIcon: {
    width: 28,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brainLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 14,
    height: 20,
    backgroundColor: '#8B5CF6',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  brainRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 14,
    height: 20,
    backgroundColor: '#8B5CF6',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  brainStem: {
    position: 'absolute',
    bottom: -4,
    width: 8,
    height: 8,
    backgroundColor: '#8B5CF6',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  
  peopleIcon: {
    width: 30,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  person1: {
    position: 'absolute',
    left: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  person2: {
    position: 'absolute',
    left: 10,
    top: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F59E0B',
  },
  person3: {
    position: 'absolute',
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  
  journalIcon: {
    width: 24,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  journalCover: {
    width: 20,
    height: 24,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  journalLine1: {
    position: 'absolute',
    top: 6,
    left: 4,
    width: 12,
    height: 2,
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
  },
  journalLine2: {
    position: 'absolute',
    top: 11,
    left: 4,
    width: 10,
    height: 2,
    backgroundColor: '#FFFFFF',
    opacity: 0.6,
  },
  journalLine3: {
    position: 'absolute',
    top: 16,
    left: 4,
    width: 8,
    height: 2,
    backgroundColor: '#FFFFFF',
    opacity: 0.4,
  },
});

export default BlueprintRevealStep; 