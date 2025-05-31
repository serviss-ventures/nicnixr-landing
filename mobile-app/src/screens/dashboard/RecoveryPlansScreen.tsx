import React, { useState, useEffect } from 'react';
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
import { StackNavigationProp } from '@react-navigation/stack';
import { DashboardStackParamList } from '../../types';
import { planRecommendationService, PlanRecommendation } from '../../services/planRecommendationService';
import { cancelActivePlan, updatePlanProgress, migrateActivePlanGoalsAsync } from '../../store/slices/planSlice';

interface RecoveryPlan {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  gradientColors: string[];
  duration: string;
  goals: string[];
  nicotineSpecific?: {
    [key: string]: {
      goals: string[];
      description: string;
    };
  };
}

// Function to get personalized plans based on nicotine product
const getPersonalizedPlans = (nicotineCategory: string): RecoveryPlan[] => {
  const basePlans: RecoveryPlan[] = [
    {
      id: 'neural-rewiring',
      title: 'Neural Rewiring',
      description: 'Rewire your brain\'s reward pathways using evidence-based neuroplasticity techniques and dopamine regulation strategies.',
      icon: 'flash-outline',
      color: '#8B5CF6',
      gradientColors: ['#8B5CF6', '#7C3AED'],
      duration: '1 week',
      goals: [
        'Morning dopamine reset: 5-minute cold exposure + deep breathing before any stimulants',
        'Craving extinction: Use 30-second distraction burst when urges hit (jumping jacks, pushups, cold water)',
        'Reward substitution: Identify and practice 3 healthy dopamine activities (music, exercise, social connection)',
        'Neural pathway disruption: Change 2 daily routines that previously triggered nicotine use'
      ],
      nicotineSpecific: {
        cigarettes: {
          description: 'Rewire cigarette-conditioned neural pathways through targeted behavioral interruption and healthy dopamine replacement.',
          goals: [
            'Morning dopamine reset: Cold shower + 2-minute breathing before coffee (disrupts morning cigarette pathway)',
            'Smoke break rewiring: Set 15-minute timer, do 50 jumping jacks when cigarette urge hits',
            'Hand-brain disconnect: Carry and squeeze stress ball for 2 minutes whenever hands seek cigarette motion',
            'Trigger circuit breaking: Take different route to work, sit in new spots, change morning routine'
          ]
        },
        vape: {
          description: 'Break vape pen dependency by rewiring device-seeking behavior and rebuilding natural reward sensitivity.',
          goals: [
            'Device detox protocol: Keep vape in different room, add 30-second delay before each planned use',
            'Flavor pathway rewiring: Intense flavor experiences - hot sauce, strong mint, sour candy when craving hits',
            'Hand satisfaction reset: Practice pen clicking, fidget spinning, or stress ball squeezing for 60 seconds',
            'Cloud replacement training: Practice breath visibility exercises in cold air or with warm drinks'
          ]
        },
        chewing: {
          description: 'Rewire oral fixation pathways and rebuild jaw muscle memory with healthy stimulation patterns.',
          goals: [
            'Oral reset protocol: 20 seconds of jaw clenching exercises + salt water rinse when craving hits',
            'Texture pathway rewiring: Intense texture experiences - ice cubes, raw carrots, sugar-free gum',
            'Spit reflex redirection: Practice swallowing exercises and hydration timing every 30 minutes',
            'Work routine disruption: Change desk setup, use opposite hand for computer mouse for 1 hour daily'
          ]
        },
        cigars: {
          description: 'Rewire celebration and relaxation neural pathways with sophisticated stress management techniques.',
          goals: [
            'Relaxation pathway reset: 5-minute progressive muscle relaxation when stress peaks occur',
            'Celebration rewiring: Create new victory rituals - special tea, meditation, or music playlist',
            'Social circuit breaking: Practice holding drinks with both hands, use conversation starter cards',
            'Status substitution: Develop 3 sophisticated habits that signal success (quality coffee, books, exercise)'
          ]
        }
      }
    },
    {
      id: 'craving-domination',
      title: 'Craving Domination',
      description: 'Master advanced craving management using clinical psychology techniques and evidence-based urge surfing.',
      icon: 'shield-checkmark',
      color: '#EF4444',
      gradientColors: ['#EF4444', '#DC2626'],
      duration: '1 week',
      goals: [
        'Urge surfing mastery: Practice 4-7-8 breathing + body scan when cravings peak (90-second rule)',
        'Cognitive defusion: Use "I\'m having the thought that I need nicotine" technique 5x daily',
        'Emergency response system: Deploy HALT check (Hungry, Angry, Lonely, Tired) + immediate action',
        'Craving prediction: Track triggers in phone notes, predict and prepare for next 3 high-risk moments'
      ],
      nicotineSpecific: {
        cigarettes: {
          description: 'Dominate cigarette cravings using clinical-grade urge management and behavioral intervention techniques.',
          goals: [
            'Smoke urge flooding: When craving hits, immediately smell unlit cigarette for 30 seconds until urge peaks and crashes',
            'Rapid response protocol: STOP technique - Stop, Take a breath, Observe the urge, Proceed with planned alternative',
            'Trigger immunity building: Practice holding unlit cigarette for 60 seconds daily without lighting',
            'Stress inoculation: Pre-practice responses to top 3 smoking triggers using role-play scenarios'
          ]
        },
        vape: {
          description: 'Dominate vaping urges through advanced psychological techniques and device dependency breaking.',
          goals: [
            'Device exposure therapy: Hold turned-off vape for 2 minutes daily, focus on reducing anxiety response',
            'Flavor craving extinction: Use strong mints or essential oils to overwhelm flavor-seeking neural pathways',
            'Stealth urge management: Practice discrete breathing exercises for social vaping situations',
            'Nicotine level stepping: If using, reduce nicotine strength by 25% mid-week to train craving tolerance'
          ]
        },
        chewing: {
          description: 'Dominate oral cravings using specialized jaw therapy and oral substitution science.',
          goals: [
            'Oral saturation technique: Chew sugar-free gum for 20 minutes when major craving hits',
            'Jaw tension mastery: Clench jaw for 10 seconds, release, repeat 5x when dip urge occurs',
            'Stay hydrated and spit-free: Drink water every 30 minutes and practice normal swallowing (no spitting)',
            'Work trigger domination: Set hourly phone alerts to check mouth tension and deploy alternatives'
          ]
        },
        cigars: {
          description: 'Dominate luxury cravings using mindfulness-based stress reduction and social confidence techniques.',
          goals: [
            'Celebration urge reframing: Practice gratitude meditation for 3 minutes when success triggers cigar thoughts',
            'Social confidence building: Practice 3 conversation starters and 2 exit strategies for smoking social events',
            'Stress peak management: Use box breathing (4-4-4-4) immediately when work or life stress spikes',
            'Luxury substitution: Develop sophisticated alternatives - premium coffee, quality chocolate, or aged tea'
          ]
        }
      }
    },
    {
      id: 'stress-mastery',
      title: 'Stress Mastery',
      description: 'Build advanced stress resilience using evidence-based techniques from clinical psychology and neuroscience research.',
      icon: 'fitness',
      color: '#06B6D4',
      gradientColors: ['#06B6D4', '#0891B2'],
      duration: '1 week',
      goals: [
        'Stress inoculation protocol: Practice controlled stress exposure + immediate recovery techniques daily',
        'HRV breathing mastery: Use heart rate variability breathing (5 seconds in, 5 seconds out) for 10 minutes',
        'Cortisol regulation: Morning sunlight exposure + evening digital sunset to optimize stress hormone cycles',
        'Pressure valve system: Identify and practice 3 instant stress releases available in any environment'
      ],
      nicotineSpecific: {
        cigarettes: {
          description: 'Master stress without cigarettes using advanced nervous system regulation and breathing science.',
          goals: [
            'Smoke break replacement protocol: 5-minute walk + 4-7-8 breathing every 2 hours during work',
            'Stress smoke simulation: Practice deep inhale/exhale motions with hands in smoking position (no cigarette)',
            'Work pressure management: Keep stress ball at desk, practice 30-second grip exercises during meetings',
            'Social stress navigation: Learn 2 conversation redirects for smoking peer pressure situations'
          ]
        },
        vape: {
          description: 'Build stress resilience without vaping through advanced anxiety management and device-free coping.',
          goals: [
            'Stealth stress management: Practice inconspicuous breathing techniques for public/work stress situations',
            'Device-free anxiety control: Use progressive muscle relaxation focusing on hands and mouth',
            'Flavor-based stress relief: Keep peppermint oil or strong mints for immediate calming effect',
            'Social anxiety mastery: Practice confident body language and breathing during vape-free social interactions'
          ]
        },
        chewing: {
          description: 'Master stress without dip or pouches using oral stress management and jaw tension release techniques.',
          goals: [
            'Jaw tension release: Open mouth wide 5x, move jaw left-right 5x, then gently massage temples when stressed',
            'Work stress protocol: Keep healthy oral alternatives at desk - nuts, seeds, gum for immediate stress relief',
            'Competition stress mastery: Develop pre-performance routine without tobacco - visualization + controlled breathing',
            'Anxiety mouth relief: Press tongue to roof of mouth for 10 seconds, then swallow normally when anxiety hits'
          ]
        },
        cigars: {
          description: 'Master sophisticated stress management without cigars using executive-level stress techniques.',
          goals: [
            'Executive stress protocol: Practice boardroom breathing - controlled, confident breath control during pressure',
            'Celebration stress reframe: Use success as opportunity for healthy rewards - exercise, quality time, or learning',
            'Social pressure mastery: Practice confident "no thank you" responses with alternative sophisticated behaviors',
            'Luxury stress management: Develop premium self-care routines - quality tea ceremony, meditation, or journaling'
          ]
        }
      }
    },
    {
      id: 'identity-transformation',
      title: 'Identity Transformation',
      description: 'Rebuild your identity as a non-user through cognitive restructuring and values-based behavior change.',
      icon: 'person-outline',
      color: '#10B981',
      gradientColors: ['#10B981', '#059669'],
      duration: '1 week',
      goals: [
        'Values clarification: Write down top 5 life values and how nicotine conflicts with each one',
        'Identity statement crafting: Practice saying "I don\'t use nicotine" 10 times daily with confidence',
        'Behavioral alignment: Choose 3 daily actions that reinforce your new non-user identity',
        'Social identity shift: Tell 3 people about your recovery journey and ask for their support'
      ],
      nicotineSpecific: {
        cigarettes: {
          description: 'Transform from smoker to non-smoker identity using cognitive restructuring and social psychology.',
          goals: [
            'Smoker identity dissolution: Replace "I\'m trying to quit" with "I don\'t smoke" in all self-talk',
            'Non-smoker behavior adoption: Practice confident body language and breathing of successful non-smokers',
            'Social identity restructuring: Plan and practice 3 responses to "Want a cigarette?" in different social contexts',
            'Health identity building: Focus on lung capacity improvements - practice deep breathing and track progress'
          ]
        },
        vape: {
          description: 'Transform from vaper to non-user identity through device independence and social confidence building.',
          goals: [
            'Device-free identity: Practice confident hand positioning and movements without vape device',
            'Social vaping exit: Plan elegant ways to excuse yourself from vaping groups while maintaining friendships',
            'Health-conscious identity: Focus on respiratory improvements and clean lung identity development',
            'Trend-independent mindset: Develop identity around making independent choices rather than following trends'
          ]
        },
        chewing: {
          description: 'Transform from tobacco user to clean lifestyle identity through oral health focus and confidence building.',
          goals: [
            'Clean mouth identity: Focus daily attention on fresh breath, healthy gums, and oral cleanliness',
            'Athletic performance identity: Connect non-tobacco use with improved physical performance and endurance',
            'Professional image enhancement: Practice confident speaking and smiling without tobacco-stained concerns',
            'Role model mindset: See yourself as setting positive example for family, friends, or teammates'
          ]
        },
        cigars: {
          description: 'Transform celebration and success associations away from cigars toward sophisticated, health-conscious alternatives.',
          goals: [
            'Sophisticated celebration identity: Develop elegant success rituals - fine dining, cultural events, or experiences',
            'Health-conscious executive: Align professional image with optimal health and mental clarity choices',
            'Social sophistication: Practice refined conversation and presence that doesn\'t rely on cigar culture',
            'Values-driven success: Connect achievements to health, family, and personal growth rather than consumption'
          ]
        }
      }
    },
    {
      id: 'social-confidence',
      title: 'Social Confidence',
      description: 'Master social situations without nicotine using advanced social psychology and confidence-building techniques.',
      icon: 'people',
      color: '#F59E0B',
      gradientColors: ['#F59E0B', '#D97706'],
      duration: '1 week',
      goals: [
        'Social confidence protocol: Practice power posing for 2 minutes before social events',
        'Conversation mastery: Prepare 5 engaging questions and 3 interesting stories for social interactions',
        'Peer pressure immunity: Role-play confident "no thank you" responses with positive alternative suggestions',
        'Social energy optimization: Identify your peak social hours and plan nicotine-free activities during them'
      ],
      nicotineSpecific: {
        cigarettes: {
          description: 'Master smoke-free socializing through advanced social skills and confident non-smoker presence.',
          goals: [
            'Smoke break social mastery: Suggest "fresh air walks" or "coffee runs" as alternative bonding activities',
            'Party confidence without cigarettes: Practice holding drinks with both hands and engaging in deeper conversations',
            'Dating confidence: Plan impressive smoke-free date activities and practice confident "I don\'t smoke" responses',
            'Work social navigation: Become the person who organizes non-smoking team activities and bonding experiences'
          ]
        },
        vape: {
          description: 'Navigate vaping social circles with confidence while building device-free social skills and presence.',
          goals: [
            'Vape circle confidence: Practice staying engaged in groups without device, focus on being the active listener',
            'Cloud-free presence: Develop confident hand gestures and body language that don\'t involve device manipulation',
            'Trend leadership: Position yourself as someone who makes independent, health-conscious choices confidently',
            'Social media confidence: Share your journey and health improvements to inspire others in your network'
          ]
        },
        chewing: {
          description: 'Build confidence in sports and professional settings without tobacco while enhancing performance and image.',
          goals: [
            'Athletic confidence: Develop pre-game routines focused on breath control, hydration, and mental preparation',
            'Team leadership: Become the teammate who focuses on performance optimization and healthy competition prep',
            'Professional presence: Practice confident speaking and presentations with focus on clear communication',
            'Mentorship mindset: Position yourself as positive influence for younger teammates or colleagues'
          ]
        },
        cigars: {
          description: 'Master sophisticated social situations without cigars while building executive presence and cultural sophistication.',
          goals: [
            'Executive presence: Practice commanding attention through confident posture, eye contact, and thoughtful conversation',
            'Cultural sophistication: Develop knowledge in wine, coffee, or other sophisticated interests to replace cigar culture',
            'Networking mastery: Focus conversations on business, achievements, and mutual interests rather than shared smoking',
            'Celebration leadership: Become the person who suggests memorable, health-conscious ways to mark success and milestones'
          ]
        }
      }
    }
  ];

  // Personalize each plan based on nicotine product
  return basePlans.map(plan => {
    const specificContent = plan.nicotineSpecific?.[nicotineCategory];
    if (specificContent) {
      return {
        ...plan,
        description: specificContent.description,
        goals: specificContent.goals
      };
    }
    return plan;
  });
};

type NavigationProp = StackNavigationProp<DashboardStackParamList, 'RecoveryPlans'>;

const RecoveryPlansScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<DashboardStackParamList, 'RecoveryPlans'>>();
  const dispatch = useDispatch<AppDispatch>();
  const [recommendation, setRecommendation] = useState<PlanRecommendation | null>(null);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(true);
  
  // Get route parameters
  const { mode = 'explore', activePlanId } = route.params || {};
  
  // Get user's nicotine product from Redux store
  const { user } = useSelector((state: RootState) => state.auth);
  const { activePlan } = useSelector((state: RootState) => state.plan);
  const nicotineCategory = user?.nicotineProduct?.category || 'cigarettes';
  
  // Get personalized plans based on user's nicotine product
  const allPlans: RecoveryPlan[] = getPersonalizedPlans(nicotineCategory);

  const handlePlanPress = (planId: string, planTitle: string) => {
    navigation.navigate('PlanDetail', {
      planId,
      planTitle
    });
  };

  const handleCancelPlan = () => {
    if (!activePlan) return;
    
    Alert.alert(
      'Cancel Plan',
      `Are you sure you want to cancel your "${activePlan.title}" plan? Your progress will be saved, but the plan will no longer be active.`,
      [
        { text: 'Keep Plan', style: 'cancel' },
        { 
          text: 'Cancel Plan', 
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(cancelActivePlan()).unwrap();
              Alert.alert(
                'Plan Cancelled',
                'Your plan has been cancelled. You can start a new plan anytime.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel plan. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleToggleGoal = async (goal: string) => {
    if (!activePlan) return;
    
    try {
      const isCompleted = activePlan.completedGoals.includes(goal);
      
      // Dispatch the update to Redux store
      dispatch(updatePlanProgress({ 
        goalId: goal, 
        completed: !isCompleted 
      }));
      
      // Optional: Show brief feedback
      const action = isCompleted ? 'unmarked' : 'completed';
      console.log(`🎯 Goal "${goal}" ${action}`);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to update goal. Please try again.');
    }
  };

  // Load recommendation on component mount (only in explore mode)
  useEffect(() => {
    if (mode !== 'explore') return;
    
    const loadRecommendation = async () => {
      try {
        setIsLoadingRecommendation(true);
        const rec = await planRecommendationService.getRecommendedPlan(nicotineCategory);
        setRecommendation(rec);
        console.log('🎯 Plan recommendation loaded:', rec);
      } catch (error) {
        console.error('❌ Failed to load plan recommendation:', error);
      } finally {
        setIsLoadingRecommendation(false);
      }
    };

    loadRecommendation();
  }, [nicotineCategory, mode]);

  // Migrate active plan goals if needed (only in manage mode)
  useEffect(() => {
    if (mode !== 'manage' || !activePlan) return;
    
    const migrateGoalsIfNeeded = async () => {
      try {
        // Find the current plan template
        const currentPlan = allPlans.find(plan => plan.id === activePlan.id);
        if (!currentPlan) return;
        
        // Check if goals need migration (compare first goal as indicator)
        const needsMigration = activePlan.goals[0] !== currentPlan.goals[0];
        
        if (needsMigration) {
          console.log('🔄 Migrating active plan goals from old to new format');
          console.log('📝 Old goals:', activePlan.goals);
          console.log('📝 New goals:', currentPlan.goals);
          
          // Migrate to new goals
          await dispatch(migrateActivePlanGoalsAsync(currentPlan.goals));
        }
      } catch (error) {
        console.error('❌ Failed to migrate plan goals:', error);
      }
    };

    migrateGoalsIfNeeded();
  }, [mode, activePlan, allPlans, dispatch]);

  // Split plans into recommended and others
  const getOrganizedPlans = () => {
    if (!recommendation) {
      return { recommendedPlan: null, otherPlans: allPlans };
    }

    const recommendedPlan = allPlans.find(plan => plan.id === recommendation.planId);
    const otherPlans = allPlans.filter(plan => plan.id !== recommendation.planId);
    
    return { recommendedPlan, otherPlans };
  };

  const { recommendedPlan, otherPlans } = getOrganizedPlans();

  const renderRecommendedPlanCard = (plan: RecoveryPlan, recommendation: PlanRecommendation) => (
    <TouchableOpacity
      key={`recommended-${plan.id}`}
      style={[styles.planCard, styles.recommendedPlanCard]}
      onPress={() => handlePlanPress(plan.id, plan.title)}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['rgba(16, 185, 129, 0.12)', 'rgba(6, 182, 212, 0.08)', 'rgba(139, 92, 246, 0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.planGradient, styles.recommendedPlanGradient]}
      >
        {/* Glow effect for recommended card */}
        <View style={styles.recommendedGlow} />
        
        {/* Recommendation Badge */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.recommendationBadgeGradient}
        >
          <Ionicons name="star" size={14} color="#FFFFFF" />
          <Text style={styles.recommendationText}>RECOMMENDED FOR YOU</Text>
        </LinearGradient>

        <View style={styles.planHeader}>
          <LinearGradient
            colors={[plan.color, plan.gradientColors[1]]}
            style={[styles.planIcon, styles.recommendedPlanIcon]}
          >
            <Ionicons name={plan.icon as any} size={26} color="#FFFFFF" />
          </LinearGradient>
          <View style={styles.planTitleSection}>
            <Text style={[styles.planTitle, styles.recommendedPlanTitle]}>{plan.title}</Text>
            <Text style={styles.planDuration}>
              <Ionicons name="time-outline" size={12} color={COLORS.textMuted} /> {plan.duration}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.planDescription, styles.recommendedDescription]}>{plan.description}</Text>
        
        {/* Enhanced Goals Section */}
        <View style={styles.goalsSection}>
          <View style={styles.goalsSectionHeader}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
            <Text style={styles.goalsTitle}>Key Goals</Text>
          </View>
          {plan.goals.slice(0, 2).map((goal, index) => (
            <View key={index} style={styles.goalItem}>
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.3)', 'rgba(16, 185, 129, 0.1)']}
                style={styles.goalBullet}
              />
              <Text style={styles.goalText}>{goal}</Text>
            </View>
          ))}
          {plan.goals.length > 2 && (
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.1)', 'transparent']}
              style={styles.moreGoalsGradient}
            >
              <Text style={styles.moreGoals}>+{plan.goals.length - 2} more goals</Text>
            </LinearGradient>
          )}
        </View>

        {/* Action Section */}
        <View style={styles.planFooter}>
          <View style={styles.recommendationConfidence}>
            <Text style={styles.confidenceText}>
              {recommendation.confidence}% match for your needs
            </Text>
          </View>
          <View style={styles.viewDetailsContainer}>
            <Text style={styles.viewDetailsText}>Start Plan</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderPlanCard = (plan: RecoveryPlan) => (
    <TouchableOpacity
      key={plan.id}
      style={styles.planCard}
      onPress={() => handlePlanPress(plan.id, plan.title)}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.planGradient}
      >
        <View style={styles.planHeader}>
          <LinearGradient
            colors={[plan.color + '20', plan.color + '10']}
            style={[styles.planIcon, { borderColor: plan.color + '40' }]}
          >
            <Ionicons name={plan.icon as any} size={24} color={plan.color} />
          </LinearGradient>
          <View style={styles.planTitleSection}>
            <Text style={styles.planTitle}>{plan.title}</Text>
            <View style={styles.planDurationContainer}>
              <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
              <Text style={styles.planDuration}>{plan.duration}</Text>
            </View>
          </View>
          <LinearGradient
            colors={['transparent', plan.color + '10']}
            style={styles.planAccent}
          />
        </View>
        
        <Text style={styles.planDescription} numberOfLines={3}>{plan.description}</Text>
        
        <View style={styles.goalsSection}>
          <View style={styles.goalsSectionHeader}>
            <Ionicons name="flag" size={14} color={COLORS.textMuted} />
            <Text style={styles.goalsTitle}>Focus Areas</Text>
          </View>
          {plan.goals.slice(0, 2).map((goal, index) => (
            <View key={index} style={styles.goalItem}>
              <View style={[styles.goalBullet, { backgroundColor: plan.color + '60' }]} />
              <Text style={styles.goalText} numberOfLines={1}>{goal}</Text>
            </View>
          ))}
        </View>

        <View style={styles.planFooter}>
          <View style={styles.planStats}>
            <View style={styles.planStat}>
              <Text style={styles.planStatValue}>{plan.goals.length}</Text>
              <Text style={styles.planStatLabel}>goals</Text>
            </View>
            <View style={styles.planStatDivider} />
            <View style={styles.planStat}>
              <Text style={styles.planStatValue}>7</Text>
              <Text style={styles.planStatLabel}>days</Text>
            </View>
          </View>
          <View style={styles.viewDetailsContainer}>
            <Text style={[styles.viewDetailsText, { color: plan.color }]}>View Plan</Text>
            <Ionicons name="arrow-forward" size={16} color={plan.color} />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Render function for manage mode
  const renderManageView = () => {
    if (!activePlan) {
      return (
        <View style={styles.noActivePlanContainer}>
          <Ionicons name="clipboard-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.noActivePlanTitle}>No Active Plan</Text>
          <Text style={styles.noActivePlanSubtitle}>
            You don't have an active recovery plan. Would you like to explore available plans?
          </Text>
          <TouchableOpacity 
            style={styles.explorePlansButton}
            onPress={() => navigation.navigate('RecoveryPlans', { mode: 'explore' })}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.explorePlansGradient}
            >
              <Text style={styles.explorePlansButtonText}>Explore Plans</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }

    // Find the plan details from our plans list
    const planDetails = allPlans.find(plan => plan.id === activePlan.id);
    
    return (
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>My Active Plan</Text>
          <Text style={styles.heroSubtitle}>
            Track your progress and manage your current recovery plan.
          </Text>
        </View>

        {/* Active Plan Card */}
        <View style={styles.activePlanSection}>
          <View style={styles.activePlanCard}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.15)', 'rgba(6, 182, 212, 0.15)']}
              style={styles.activePlanGradient}
            >
              {/* Plan Header */}
              <View style={styles.activePlanHeader}>
                <View style={[styles.planIcon, { backgroundColor: planDetails?.color || COLORS.primary }]}>
                  <Ionicons name={(planDetails?.icon as any) || 'shield'} size={24} color="#FFFFFF" />
                </View>
                <View style={styles.activePlanInfo}>
                  <Text style={styles.activePlanTitle}>{activePlan.title}</Text>
                  <Text style={styles.activePlanWeek}>Week {activePlan.weekNumber} • {activePlan.progress}% Complete</Text>
                </View>
                <View style={styles.activePlanStatus}>
                  <View style={[styles.statusDot, { backgroundColor: COLORS.primary }]} />
                  <Text style={styles.statusText}>Active</Text>
                </View>
              </View>

              {/* Progress Section */}
              <View style={styles.progressSection}>
                <Text style={styles.progressTitle}>Weekly Progress</Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${activePlan.progress}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>{activePlan.progress}%</Text>
                </View>
              </View>

              {/* Goals Section */}
              <View style={styles.goalsSection}>
                <Text style={styles.goalsTitle}>Weekly Goals ({activePlan.completedGoals.length}/{activePlan.goals.length})</Text>
                {activePlan.goals.map((goal, index) => {
                  const isCompleted = activePlan.completedGoals.includes(goal);
                  return (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.goalItemInteractive}
                      onPress={() => handleToggleGoal(goal)}
                      activeOpacity={0.7}
                    >
                      <Ionicons 
                        name={isCompleted ? "checkmark-circle" : "ellipse-outline"} 
                        size={24} 
                        color={isCompleted ? COLORS.primary : COLORS.textMuted} 
                      />
                      <Text style={[
                        styles.goalText,
                        { marginLeft: SPACING.sm },
                        isCompleted && styles.goalTextCompleted
                      ]}>
                        {goal}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Plan Description */}
              {planDetails && (
                <View style={styles.planDescriptionSection}>
                  <Text style={styles.planDescriptionTitle}>About This Plan</Text>
                  <Text style={styles.planDescription}>{planDetails.description}</Text>
                </View>
              )}

              {/* Cancel Option - Subtle and at the bottom */}
              <View style={styles.cancelOptionSection}>
                <TouchableOpacity 
                  style={styles.cancelPlanLink}
                  onPress={handleCancelPlan}
                >
                  <Text style={styles.cancelPlanLinkText}>Cancel this plan</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={styles.gradientContainer}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.backButtonGradient}
              >
                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {mode === 'manage' ? 'Manage Plan' : 'Recovery Plans'}
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Render based on mode */}
          {mode === 'manage' ? renderManageView() : (
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {/* Hero Section */}
              <View style={styles.heroSection}>
                <LinearGradient
                  colors={['rgba(16, 185, 129, 0.1)', 'rgba(6, 182, 212, 0.05)']}
                  style={styles.heroGradient}
                >
                  <Text style={styles.heroTitle}>Choose Your Recovery Path</Text>
                  <Text style={styles.heroSubtitle}>
                    {recommendation ? 
                      `Based on your recovery patterns, we've recommended the best plan for you. You can also explore other ` :
                      `Select a focused plan to explore targeted strategies for your `
                    }
                    {nicotineCategory === 'vape' ? 'vaping' : nicotineCategory} recovery journey.
                  </Text>
                </LinearGradient>
              </View>

              {/* Recommended Plan Section */}
              {!isLoadingRecommendation && recommendedPlan && recommendation && (
                <View style={styles.recommendedSection}>
                  <View style={styles.recommendedSectionHeader}>
                    <LinearGradient
                      colors={[COLORS.primary + '30', COLORS.primary + '20']}
                      style={styles.recommendedBadge}
                    >
                      <Ionicons name="star" size={16} color={COLORS.primary} />
                      <Text style={styles.recommendedSectionTitle}>RECOMMENDED FOR YOU</Text>
                    </LinearGradient>
                  </View>
                  {renderRecommendedPlanCard(recommendedPlan, recommendation)}
                </View>
              )}

              {/* Other Plans Section */}
              {otherPlans.length > 0 && (
                <View style={styles.plansSection}>
                  <Text style={styles.sectionTitle}>
                    {recommendedPlan ? 'OTHER PLANS' : `PERSONALIZED FOR ${nicotineCategory.toUpperCase()}`}
                  </Text>
                  {otherPlans.map(renderPlanCard)}
                </View>
              )}

              {/* Loading State */}
              {isLoadingRecommendation && (
                <View style={styles.loadingSection}>
                  <Text style={styles.loadingText}>Analyzing your recovery patterns...</Text>
                </View>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
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
    padding: SPACING.lg,
    paddingBottom: 0,
  },
  heroGradient: {
    padding: SPACING.xl,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: SPACING.md,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  plansSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1.2,
    marginBottom: SPACING.lg,
    marginTop: SPACING.xl,
  },
  planCard: {
    marginBottom: SPACING.lg,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  planGradient: {
    padding: SPACING.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  planIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  planTitleSection: {
    flex: 1,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  planDurationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  planDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  planDescription: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  goalsSection: {
    marginTop: SPACING.sm,
  },
  goalsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  goalsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: SPACING.xs,
    letterSpacing: 0.5,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  goalBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: SPACING.sm,
    marginTop: 6,
  },
  goalText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  goalTextCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  moreGoals: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  moreGoalsGradient: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  planFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  planStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planStat: {
    alignItems: 'center',
  },
  planStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  planStatLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: SPACING.md,
  },
  viewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewDetailsText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  planAccent: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 80,
    height: 80,
    borderRadius: 40,
    transform: [{ translateX: 20 }, { translateY: -20 }],
    opacity: 0.3,
  },
  recommendedSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  recommendedSectionHeader: {
    marginBottom: SPACING.md,
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 16,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  recommendedSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
    marginLeft: SPACING.xs,
  },
  recommendedPlanCard: {
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.15,
  },
  recommendedPlanGradient: {
    backgroundColor: 'rgba(16, 185, 129, 0.03)',
    position: 'relative',
  },
  recommendedGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
    zIndex: -1,
  },
  recommendationBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignSelf: 'flex-start',
    marginBottom: SPACING.lg,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: SPACING.xs,
    letterSpacing: 0.8,
  },
  recommendedPlanIcon: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  recommendedPlanTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  recommendedDescription: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  recommendationConfidence: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  loadingSection: {
    padding: SPACING['3xl'],
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  noActivePlanContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  noActivePlanTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.md,
  },
  noActivePlanSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
  },
  explorePlansButton: {
    padding: SPACING.md,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  explorePlansGradient: {
    padding: SPACING.md,
    borderRadius: 8,
  },
  explorePlansButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  activePlanSection: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  activePlanCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  activePlanGradient: {
    padding: SPACING.lg,
  },
  activePlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  activePlanInfo: {
    flex: 1,
  },
  activePlanTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  activePlanWeek: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  activePlanStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  planDescriptionSection: {
    marginTop: SPACING.md,
  },
  planDescriptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.sm,
  },
  cancelOptionSection: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  cancelPlanLink: {
    padding: SPACING.md,
  },
  cancelPlanLinkText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
    opacity: 0.7,
  },
  progressSection: {
    marginTop: SPACING.md,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    flex: 1,
    marginRight: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  goalItemInteractive: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.xs,
    borderRadius: 8,
  },
});

export default RecoveryPlansScreen; 