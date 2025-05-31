import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { COLORS, SPACING } from '../../constants/theme';
import { DashboardStackParamList } from '../../types';
import { SafeAreaView as SafeAreaViewCompat } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { startPlan, savePlanToStorage, RecoveryPlan } from '../../store/slices/planSlice';

type PlanDetailRouteProp = RouteProp<DashboardStackParamList, 'PlanDetail'>;
type NavigationProp = StackNavigationProp<DashboardStackParamList, 'PlanDetail'>;

interface PlanDetail {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  gradientColors: string[];
  duration: string;
  goals: string[];
  benefits: string[];
}

// Comprehensive plan details with timelines
const getPlanDetails = (planId: string, nicotineCategory: string): PlanDetail | null => {
  const planDetails: { [key: string]: PlanDetail } = {
    'neural-rewiring': {
      id: 'neural-rewiring',
      title: 'Neural Rewiring',
      description: nicotineCategory === 'cigarettes' 
        ? 'Rewire cigarette-conditioned neural pathways through targeted behavioral interruption and healthy dopamine replacement.'
        : nicotineCategory === 'vape'
        ? 'Break vape pen dependency by rewiring device-seeking behavior and rebuilding natural reward sensitivity.'
        : nicotineCategory === 'chewing'
        ? 'Rewire oral fixation pathways and rebuild jaw muscle memory with healthy stimulation patterns.'
        : 'Rewire your brain\'s reward pathways using evidence-based neuroplasticity techniques and dopamine regulation strategies.',
      icon: 'flash-outline',
      color: '#8B5CF6',
      gradientColors: ['#8B5CF6', '#7C3AED'],
      duration: '1 week',
      goals: nicotineCategory === 'cigarettes' 
        ? [
            'Morning dopamine reset: Cold shower + 2-minute breathing before coffee (disrupts morning cigarette pathway)',
            'Smoke break rewiring: Set 15-minute timer, do 50 jumping jacks when cigarette urge hits',
            'Hand-brain disconnect: Carry and squeeze stress ball for 2 minutes whenever hands seek cigarette motion',
            'Trigger circuit breaking: Take different route to work, sit in new spots, change morning routine'
          ]
        : nicotineCategory === 'vape'
        ? [
            'Device detox protocol: Keep vape in different room, add 30-second delay before each planned use',
            'Flavor pathway rewiring: Intense flavor experiences - hot sauce, strong mint, sour candy when craving hits',
            'Hand satisfaction reset: Practice pen clicking, fidget spinning, or stress ball squeezing for 60 seconds',
            'Cloud replacement training: Practice breath visibility exercises in cold air or with warm drinks'
          ]
        : nicotineCategory === 'chewing'
        ? [
            'Oral reset protocol: 20 seconds of jaw clenching exercises + salt water rinse when craving hits',
            'Texture pathway rewiring: Intense texture experiences - ice cubes, raw carrots, sugar-free gum',
            'Spit reflex redirection: Practice swallowing exercises and hydration timing every 30 minutes',
            'Work routine disruption: Change desk setup, use opposite hand for computer mouse for 1 hour daily'
          ]
        : [
            'Morning dopamine reset: 5-minute cold exposure + deep breathing before any stimulants',
            'Craving extinction: Use 30-second distraction burst when urges hit (jumping jacks, pushups, cold water)',
            'Reward substitution: Identify and practice 3 healthy dopamine activities (music, exercise, social connection)',
            'Neural pathway disruption: Change 2 daily routines that previously triggered nicotine use'
          ],
      benefits: [
        'Rewire addiction neural pathways in 72 hours using neuroplasticity science',
        'Reduce craving intensity by 60-80% through dopamine system reset',
        'Build lasting behavioral changes that prevent relapse long-term',
        'Restore natural reward sensitivity and emotional regulation capacity'
      ],
    },
    'craving-domination': {
      id: 'craving-domination',
      title: 'Craving Domination',
      description: nicotineCategory === 'cigarettes'
        ? 'Dominate cigarette cravings using clinical-grade urge management and behavioral intervention techniques.'
        : nicotineCategory === 'vape'
        ? 'Dominate vaping urges through advanced psychological techniques and device dependency breaking.'
        : nicotineCategory === 'chewing'
        ? 'Dominate oral cravings using specialized jaw therapy and oral substitution science.'
        : 'Master advanced craving management using clinical psychology techniques and evidence-based urge surfing.',
      icon: 'shield-checkmark',
      color: '#EF4444',
      gradientColors: ['#EF4444', '#DC2626'],
      duration: '1 week',
      goals: nicotineCategory === 'cigarettes'
        ? [
            'Smoke urge flooding: When craving hits, immediately smell unlit cigarette for 30 seconds until urge peaks and crashes',
            'Rapid response protocol: STOP technique - Stop, Take a breath, Observe the urge, Proceed with planned alternative',
            'Trigger immunity building: Practice holding unlit cigarette for 60 seconds daily without lighting',
            'Stress inoculation: Pre-practice responses to top 3 smoking triggers using role-play scenarios'
          ]
        : nicotineCategory === 'vape'
        ? [
            'Device exposure therapy: Hold turned-off vape for 2 minutes daily, focus on reducing anxiety response',
            'Flavor craving extinction: Use strong mints or essential oils to overwhelm flavor-seeking neural pathways',
            'Stealth urge management: Practice discrete breathing exercises for social vaping situations',
            'Nicotine level stepping: If using, reduce nicotine strength by 25% mid-week to train craving tolerance'
          ]
        : nicotineCategory === 'chewing'
        ? [
            'Oral saturation technique: Chew sugar-free gum for 20 minutes when major craving hits',
            'Jaw tension mastery: Clench jaw for 10 seconds, release, repeat 5x when dip urge occurs',
            'Stay hydrated and spit-free: Drink water every 30 minutes and practice normal swallowing (no spitting)',
            'Work trigger domination: Set hourly phone alerts to check mouth tension and deploy alternatives'
          ]
        : [
            'Urge surfing mastery: Practice 4-7-8 breathing + body scan when cravings peak (90-second rule)',
            'Cognitive defusion: Use "I\'m having the thought that I need nicotine" technique 5x daily',
            'Emergency response system: Deploy HALT check (Hungry, Angry, Lonely, Tired) + immediate action',
            'Craving prediction: Track triggers in phone notes, predict and prepare for next 3 high-risk moments'
          ],
      benefits: [
        'Master the 90-second craving rule - outlast any urge using clinical techniques',
        'Build craving immunity through controlled exposure and desensitization',
        'Develop instant response protocols for high-stress trigger situations',
        'Achieve 85% reduction in craving frequency within first week'
      ],
    },
    'stress-mastery': {
      id: 'stress-mastery',
      title: 'Stress Mastery',
      description: nicotineCategory === 'cigarettes'
        ? 'Master stress without cigarettes using advanced nervous system regulation and breathing science.'
        : nicotineCategory === 'vape'
        ? 'Build stress resilience without vaping through advanced anxiety management and device-free coping.'
        : nicotineCategory === 'chewing'
        ? 'Master stress without dip or pouches using oral stress management and jaw tension release techniques.'
        : 'Build advanced stress resilience using evidence-based techniques from clinical psychology and neuroscience research.',
      icon: 'fitness',
      color: '#06B6D4',
      gradientColors: ['#06B6D4', '#0891B2'],
      duration: '1 week',
      goals: nicotineCategory === 'cigarettes'
        ? [
            'Smoke break replacement protocol: 5-minute walk + 4-7-8 breathing every 2 hours during work',
            'Stress smoke simulation: Practice deep inhale/exhale motions with hands in smoking position (no cigarette)',
            'Work pressure management: Keep stress ball at desk, practice 30-second grip exercises during meetings',
            'Social stress navigation: Learn 2 conversation redirects for smoking peer pressure situations'
          ]
        : nicotineCategory === 'vape'
        ? [
            'Stealth stress management: Practice inconspicuous breathing techniques for public/work stress situations',
            'Device-free anxiety control: Use progressive muscle relaxation focusing on hands and mouth',
            'Flavor-based stress relief: Keep peppermint oil or strong mints for immediate calming effect',
            'Social anxiety mastery: Practice confident body language and breathing during vape-free social interactions'
          ]
        : nicotineCategory === 'chewing'
        ? [
            'Jaw tension release: Open mouth wide 5x, move jaw left-right 5x, then gently massage temples when stressed',
            'Work stress protocol: Keep healthy oral alternatives at desk - nuts, seeds, gum for immediate stress relief',
            'Competition stress mastery: Develop pre-performance routine without tobacco - visualization + controlled breathing',
            'Anxiety mouth relief: Press tongue to roof of mouth for 10 seconds, then swallow normally when anxiety hits'
          ]
        : [
            'Stress inoculation protocol: Practice controlled stress exposure + immediate recovery techniques daily',
            'HRV breathing mastery: Use heart rate variability breathing (5 seconds in, 5 seconds out) for 10 minutes',
            'Cortisol regulation: Morning sunlight exposure + evening digital sunset to optimize stress hormone cycles',
            'Pressure valve system: Identify and practice 3 instant stress releases available in any environment'
          ],
      benefits: [
        'Reduce stress response by 70% using evidence-based nervous system regulation',
        'Build resilience to triggers through controlled stress exposure training',
        'Master heart rate variability breathing for instant calm in any situation',
        'Optimize cortisol cycles for better sleep, energy, and emotional stability'
      ],
    },
    'identity-transformation': {
      id: 'identity-transformation',
      title: 'Identity Transformation',
      description: nicotineCategory === 'cigarettes'
        ? 'Transform from smoker to non-smoker identity using cognitive restructuring and social psychology.'
        : nicotineCategory === 'vape'
        ? 'Transform from vaper to non-user identity through device independence and social confidence building.'
        : nicotineCategory === 'chewing'
        ? 'Transform from tobacco user to clean lifestyle identity through oral health focus and confidence building.'
        : 'Rebuild your identity as a non-user through cognitive restructuring and values-based behavior change.',
      icon: 'person-outline',
      color: '#10B981',
      gradientColors: ['#10B981', '#059669'],
      duration: '1 week',
      goals: nicotineCategory === 'cigarettes'
        ? [
            'Smoker identity dissolution: Replace "I\'m trying to quit" with "I don\'t smoke" in all self-talk',
            'Non-smoker behavior adoption: Practice confident body language and breathing of successful non-smokers',
            'Social identity restructuring: Plan and practice 3 responses to "Want a cigarette?" in different social contexts',
            'Health identity building: Focus on lung capacity improvements - practice deep breathing and track progress'
          ]
        : nicotineCategory === 'vape'
        ? [
            'Device-free identity: Practice confident hand positioning and movements without vape device',
            'Social vaping exit: Plan elegant ways to excuse yourself from vaping groups while maintaining friendships',
            'Health-conscious identity: Focus on respiratory improvements and clean lung identity development',
            'Trend-independent mindset: Develop identity around making independent choices rather than following trends'
          ]
        : nicotineCategory === 'chewing'
        ? [
            'Clean mouth identity: Focus daily attention on fresh breath, healthy gums, and oral cleanliness',
            'Athletic performance identity: Connect non-tobacco use with improved physical performance and endurance',
            'Professional image enhancement: Practice confident speaking and smiling without tobacco-stained concerns',
            'Role model mindset: See yourself as setting positive example for family, friends, or teammates'
          ]
        : [
            'Values clarification: Write down top 5 life values and how nicotine conflicts with each one',
            'Identity statement crafting: Practice saying "I don\'t use nicotine" 10 times daily with confidence',
            'Behavioral alignment: Choose 3 daily actions that reinforce your new non-user identity',
            'Social identity shift: Tell 3 people about your recovery journey and ask for their support'
          ],
      benefits: [
        'Transform self-concept from user to non-user using cognitive psychology principles',
        'Build unshakeable confidence in social situations without nicotine dependency',
        'Align behaviors with core values for intrinsic motivation and lasting change',
        'Create social accountability network that reinforces new identity'
      ],
    },
    'social-confidence': {
      id: 'social-confidence',
      title: 'Social Confidence',
      description: nicotineCategory === 'cigarettes'
        ? 'Master smoke-free socializing through advanced social skills and confident non-smoker presence.'
        : nicotineCategory === 'vape'
        ? 'Navigate vaping social circles with confidence while building device-free social skills and presence.'
        : nicotineCategory === 'chewing'
        ? 'Build confidence in sports and professional settings without tobacco while enhancing performance and image.'
        : 'Master social situations without nicotine using advanced social psychology and confidence-building techniques.',
      icon: 'people',
      color: '#F59E0B',
      gradientColors: ['#F59E0B', '#D97706'],
      duration: '1 week',
      goals: nicotineCategory === 'cigarettes'
        ? [
            'Smoke break social mastery: Suggest "fresh air walks" or "coffee runs" as alternative bonding activities',
            'Party confidence without cigarettes: Practice holding drinks with both hands and engaging in deeper conversations',
            'Dating confidence: Plan impressive smoke-free date activities and practice confident "I don\'t smoke" responses',
            'Work social navigation: Become the person who organizes non-smoking team activities and bonding experiences'
          ]
        : nicotineCategory === 'vape'
        ? [
            'Vape circle confidence: Practice staying engaged in groups without device, focus on being the active listener',
            'Cloud-free presence: Develop confident hand gestures and body language that don\'t involve device manipulation',
            'Trend leadership: Position yourself as someone who makes independent, health-conscious choices confidently',
            'Social media confidence: Share your journey and health improvements to inspire others in your network'
          ]
        : nicotineCategory === 'chewing'
        ? [
            'Athletic confidence: Develop pre-game routines focused on breath control, hydration, and mental preparation',
            'Team leadership: Become the teammate who focuses on performance optimization and healthy competition prep',
            'Professional presence: Practice confident speaking and presentations with focus on clear communication',
            'Mentorship mindset: Position yourself as positive influence for younger teammates or colleagues'
          ]
        : [
            'Social confidence protocol: Practice power posing for 2 minutes before social events',
            'Conversation mastery: Prepare 5 engaging questions and 3 interesting stories for social interactions',
            'Peer pressure immunity: Role-play confident "no thank you" responses with positive alternative suggestions',
            'Social energy optimization: Identify your peak social hours and plan nicotine-free activities during them'
          ],
      benefits: [
        'Build magnetic social presence that doesn\'t rely on nicotine as social lubricant',
        'Master peer pressure resistance through advanced social psychology techniques',
        'Develop leadership qualities that inspire others toward healthier choices',
        'Create deeper, more authentic relationships free from addiction-based bonding'
      ],
    }
  };

  return planDetails[planId] || null;
};

const PlanDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PlanDetailRouteProp>();
  const { planId, planTitle } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  
  // Get user's nicotine product from Redux store
  const { user } = useSelector((state: RootState) => state.auth);
  const nicotineCategory = user?.nicotineProduct?.category || 'cigarettes';
  
  const planDetail = getPlanDetails(planId, nicotineCategory);

  const handleStartPlan = async () => {
    if (!planDetail) return;
    
    Alert.alert(
      'Start Plan',
      `Ready to begin your ${planTitle} journey? This will set up your personalized plan with daily goals and tracking.`,
      [
        { text: 'Not Yet', style: 'cancel' },
        { 
          text: 'Start Plan', 
          style: 'default',
          onPress: async () => {
            try {
              // Create RecoveryPlan object from planDetail
              const recoveryPlan: RecoveryPlan = {
                id: planDetail.id,
                title: planDetail.title,
                description: planDetail.description,
                icon: planDetail.icon,
                color: planDetail.color,
                gradientColors: planDetail.gradientColors,
                duration: planDetail.duration,
                goals: planDetail.goals,
                nicotineSpecific: {
                  [nicotineCategory]: planDetail.goals
                }
              };
              
              // Save plan to Redux
              dispatch(startPlan(recoveryPlan));
              
              // Save to AsyncStorage for persistence
              const activePlan = {
                ...recoveryPlan,
                startDate: new Date().toISOString(),
                weekNumber: 1,
                completedGoals: [],
                progress: 0,
              };
              dispatch(savePlanToStorage(activePlan));
              
              // Show success message
              Alert.alert(
                'Plan Started! 🎯', 
                `Your ${planTitle} plan is now active. Check your dashboard for daily goals and progress tracking.`,
                [{ 
                  text: 'Go to Dashboard', 
                  onPress: () => {
                    // Navigate back to the main dashboard (reset navigation stack)
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'DashboardMain' }],
                    });
                  }
                }]
              );
            } catch (error) {
              console.error('❌ Failed to start plan:', error);
              Alert.alert('Error', 'Failed to start plan. Please try again.');
            }
          }
        }
      ]
    );
  };

  if (!planDetail) {
    return (
      <SafeAreaViewCompat style={styles.container} edges={['left', 'right']}>
        <Text style={styles.errorText}>Plan not found</Text>
      </SafeAreaViewCompat>
    );
  }

  return (
    <SafeAreaViewCompat style={styles.container} edges={['left', 'right']}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('RecoveryPlans', { mode: 'explore' })}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
              style={styles.backButtonGradient}
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Plan Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.planIconContainer}>
              <View style={[styles.planIconGlow, { backgroundColor: planDetail.color + '30' }]} />
              <LinearGradient
                colors={planDetail.gradientColors}
                style={styles.planIconGradient}
              >
                <Ionicons name={planDetail.icon as any} size={36} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.planTitle}>{planDetail.title}</Text>
            <View style={styles.durationBadge}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.durationBadgeGradient}
              >
                <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.planDuration}>{planDetail.duration}</Text>
              </LinearGradient>
            </View>
            <Text style={styles.planDescription}>{planDetail.description}</Text>
          </View>

          {/* Benefits */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What You'll Achieve</Text>
            <View style={styles.benefitsContainer}>
              {planDetail.benefits.map((benefit, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.benefitCard}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['rgba(16, 185, 129, 0.08)', 'rgba(6, 182, 212, 0.04)', 'rgba(255, 255, 255, 0.02)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.benefitGradient}
                  >
                    <View style={styles.benefitIconContainer}>
                      <LinearGradient
                        colors={[COLORS.primary + '30', COLORS.primary + '20']}
                        style={styles.benefitIconGradient}
                      >
                        <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                      </LinearGradient>
                    </View>
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Timeline */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>This Week's Focus</Text>
            <View style={styles.weekFocusCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.04)', 'rgba(255, 255, 255, 0.02)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.weekFocusGradient}
              >
                <View style={styles.weekFocusHeader}>
                  <LinearGradient
                    colors={planDetail.gradientColors}
                    style={styles.weekBadge}
                  >
                    <Text style={styles.weekBadgeText}>WEEK 1</Text>
                  </LinearGradient>
                </View>
                <Text style={styles.weekFocusTitle}>
                  {planDetail.id === 'neural-rewiring' ? 'Neural Pathway Disruption' :
                   planDetail.id === 'craving-domination' ? 'Craving Mastery Training' :
                   planDetail.id === 'stress-mastery' ? 'Stress System Optimization' :
                   planDetail.id === 'identity-transformation' ? 'Identity Reconstruction' :
                   planDetail.id === 'social-confidence' ? 'Social Mastery Development' :
                   'Weekly Focus'}
                </Text>
                <Text style={styles.weekFocusDescription}>
                  {planDetail.id === 'neural-rewiring' ? 'Interrupt established addiction circuits and begin building new reward pathways' :
                   planDetail.id === 'craving-domination' ? 'Learn to dominate urges using clinical psychology and exposure therapy techniques' :
                   planDetail.id === 'stress-mastery' ? 'Build advanced stress resilience using clinical psychology and neuroscience techniques' :
                   planDetail.id === 'identity-transformation' ? 'Rebuild your core identity as a confident non-user using psychological transformation techniques' :
                   planDetail.id === 'social-confidence' ? 'Build advanced social confidence and leadership skills for nicotine-free interactions' :
                   'Focus on building lasting behavioral changes this week'}
                </Text>
                <View style={styles.weekFocusGoals}>
                  {planDetail.goals.map((goal, goalIndex) => (
                    <View key={goalIndex} style={styles.goalItem}>
                      <LinearGradient
                        colors={[planDetail.color + '40', planDetail.color + '20']}
                        style={styles.goalBulletGradient}
                      >
                        <View style={styles.goalBullet} />
                      </LinearGradient>
                      <Text style={styles.goalText}>{goal}</Text>
                    </View>
                  ))}
                </View>
              </LinearGradient>
            </View>
          </View>
        </ScrollView>

        {/* Start Button */}
        <View style={styles.startSection}>
          <TouchableOpacity style={styles.startButton} onPress={handleStartPlan}>
            <LinearGradient
              colors={planDetail.gradientColors}
              style={styles.startButtonGradient}
            >
              <Text style={styles.startButtonText}>Start This Plan</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaViewCompat>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    overflow: 'hidden',
  },
  backButtonGradient: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    padding: SPACING.xl,
    paddingTop: SPACING['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  planIconContainer: {
    width: 100,
    height: 100,
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  planIconGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 60,
    opacity: 0.4,
    filter: 'blur(20px)',
  },
  planIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  planTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: SPACING.sm,
    letterSpacing: -0.5,
  },
  durationBadge: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  durationBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
  },
  planDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: -0.1,
  },
  planDescription: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: -0.2,
    paddingHorizontal: SPACING.md,
  },
  section: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: SPACING.lg,
    letterSpacing: -0.3,
  },
  benefitsContainer: {
    gap: SPACING.sm,
  },
  benefitCard: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  benefitGradient: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  benefitIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    overflow: 'hidden',
    flexShrink: 0,
  },
  benefitIconGradient: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
    lineHeight: 24,
    letterSpacing: -0.1,
  },
  weekFocusCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  weekFocusGradient: {
    padding: SPACING.lg,
  },
  weekFocusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  weekBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  weekBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  weekFocusTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: SPACING.sm,
    letterSpacing: -0.3,
  },
  weekFocusDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: SPACING.lg,
    lineHeight: 24,
    letterSpacing: -0.1,
  },
  weekFocusGoals: {
    gap: SPACING.md,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  goalBulletGradient: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  goalBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  goalText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
    lineHeight: 24,
    letterSpacing: -0.1,
  },
  startSection: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  startButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});

export default PlanDetailScreen; 