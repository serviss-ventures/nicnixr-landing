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
      id: 'craving-control',
      title: 'Craving Control',
      description: 'Master urge management with proven techniques, breathing exercises, and instant coping strategies.',
      icon: 'shield',
      color: '#EF4444',
      gradientColors: ['#EF4444', '#DC2626'],
      duration: '1 week',
      goals: [
        'Practice 4-7-8 breathing when cravings hit: inhale 4, hold 7, exhale 8',
        'Try 3 oral alternatives: gum, toothpick, carrot sticks, or stress ball', 
        'Build emergency kit: water, gum, fidget toy, positive affirmations',
        'Create new routine: 5-minute walk or breathing break instead of nicotine'
      ],
      nicotineSpecific: {
        cigarettes: {
          description: 'Master cigarette cravings with hand-to-mouth habit replacement and smoke break alternatives.',
          goals: [
            'Practice 4-7-8 breathing: inhale 4, hold 7, exhale 8 counts',
            'Replace hand-to-mouth: try carrot sticks, toothpick, or stress ball',
            'Create smoke break ritual: 5-minute walk outside instead',
            'Build emergency kit: gum, water bottle, fidget toy, affirmations'
          ]
        },
        vape: {
          description: 'Overcome vape pen urges with device alternatives and cloud replacement activities.',
          goals: [
            'Device alternatives: carry a pen, fidget spinner, or stress ball when you would vape',
            'Cloud substitute: blow bubbles, breathe into cold air, or sip hot beverages',
            'Flavor cravings: try new gum flavors, mints, or flavored sparkling water',
            'Hand-to-mouth habit: practice "fake vaping" - breathe deeply and exhale slowly'
          ]
        },
        chewing: {
          description: 'Beat dip and nicotine pouch cravings with mouth satisfaction techniques and oral habit replacement.',
          goals: [
            'Try mouth alternatives: sunflower seeds, sugar-free gum, toothpicks, or beef jerky',
            'Do jaw exercises: open wide 10x, side-to-side 10x, jaw circles 5x daily',
            'Replace the ritual: sip water or tea when you would normally use dip/pouches',
            'Find new textures: ice chips, celery sticks, or sugar-free hard candy'
          ]
        },
        cigars: {
          description: 'Overcome cigar cravings with relaxation alternatives and social ritual replacement.',
          goals: [
            'Create relaxation ritual: 10-minute meditation or deep breathing',
            'Replace social habit: hold a drink or cigar-shaped object during gatherings',
            'Find new celebration rewards: special coffee, dessert, or activity',
            'Practice mindful moments: 5 minutes of gratitude instead of cigar time'
          ]
        }
      }
    },
    {
      id: 'energy-rebuild',
      title: 'Energy Rebuild',
      description: 'Restore natural energy and mental clarity without nicotine dependence.',
      icon: 'flash',
      color: '#10B981',
      gradientColors: ['#10B981', '#059669'],
      duration: '1 week',
      goals: [
        'Do 5 minutes of box breathing daily: 4 counts in, 4 hold, 4 out, 4 hold',
        'Try natural energy boosters: cold water on face, 10 jumping jacks, or stretches',
        'Power nap technique: 15-minute rest with eyes closed when energy drops',
        'Hydration goal: drink 16oz water immediately when feeling tired'
      ],
      nicotineSpecific: {
        cigarettes: {
          description: 'Rebuild energy without cigarette stimulation and heal lung capacity for better oxygen flow.',
          goals: [
            'Deep breathing exercises: 5 minutes of box breathing (4-4-4-4 counts)',
            'Morning energy boost: 10 jumping jacks or stretches instead of cigarette',
            'Hydration goal: drink 16oz water when you feel tired',
            'Power nap technique: 15-minute rest with eyes closed when energy drops'
          ]
        },
        vape: {
          description: 'Restore natural energy without nicotine hits and rebuild respiratory health.',
          goals: [
            'Natural alertness: cold water on face + 5 deep breaths when tired',
            'Throat healing: warm honey tea or throat coat tea twice daily',
            'Energy timing: note energy levels hourly to find natural peaks',
            'Movement boost: 2-minute walk or desk stretches instead of vape break'
          ]
        },
        chewing: {
          description: 'Rebuild energy without dip or nicotine pouches and restore oral health for better nutrition.',
          goals: [
            'Oral health routine: rinse with salt water twice daily this week',
            'Natural stimulation: chew mint gum or eat an apple when feeling sluggish',
            'Jaw muscle relaxation: massage temples and jaw for 2 minutes twice daily',
            'Energy snacks: eat protein-rich snacks (nuts, yogurt) when energy dips'
          ]
        }
      }
    },
    {
      id: 'stress-recovery',
      title: 'Stress Recovery',
      description: 'Build healthy stress management habits to replace nicotine as your go-to coping mechanism.',
      icon: 'leaf',
      color: '#06B6D4',
      gradientColors: ['#06B6D4', '#0891B2'],
      duration: '1 week',
      goals: [
        'Practice 5-4-3-2-1 grounding: 5 things you see, 4 hear, 3 feel, 2 smell, 1 taste',
        'Quick stress relief: tense all muscles for 10 seconds, then release',  
        'Stress break replacement: step outside for 5 minutes of fresh air',
        'Keep stress tools handy: stress ball, gum, or fidget toy at work/home'
      ],
      nicotineSpecific: {
        cigarettes: {
          description: 'Replace cigarette stress relief with healthy coping mechanisms and breathing techniques.',
          goals: [
            'Stress breathing: 5-4-3-2-1 technique (5 things you see, 4 hear, 3 feel, 2 smell, 1 taste)',
            'Replace smoke breaks: step outside for 5 minutes of fresh air without smoking',
            'Quick stress relief: tense and release all muscles for 10 seconds',
            'Workplace coping: keep stress ball or fidget toy at desk'
          ]
        },
        vape: {
          description: 'Build stress management without vaping and develop new calming rituals.',
          goals: [
            'Anxiety management: progressive muscle relaxation - tense/release each muscle group',
            'Vape ritual replacement: hold warm mug or stress ball when anxious',
            'Flavor comfort: find calming scents (lavender, mint) or herbal teas',
            'Social stress coping: excuse yourself for 2-minute bathroom breathing break'
          ]
        },
        chewing: {
          description: 'Develop stress relief without dip or nicotine pouches and manage jaw tension.',
          goals: [
            'Jaw relaxation: place tongue on roof of mouth, breathe deeply for 1 minute when stressed',
            'Stress alternatives: sugar-free gum, celery sticks, or ice chips instead of dip/pouches',
            'Tension release: do shoulder rolls and neck stretches 3 times daily',
            'Work stress: keep healthy snacks (nuts, seeds) at desk instead of tobacco'
          ]
        }
      }
    },
    {
      id: 'habit-replacement',
      title: 'Habit Replacement',
      description: 'Replace smoking moments with positive alternatives that satisfy your behavioral patterns.',
      icon: 'refresh',
      color: '#8B5CF6',
      gradientColors: ['#8B5CF6', '#7C3AED'],
      duration: '1 week',
      goals: [
        'Morning routine swap: drink coffee + 5 deep breaths instead of nicotine',
        'After-meal replacement: brush teeth or chew mint gum immediately',
        'Car/travel habit: keep water bottle and gum handy for cravings',
        'Social situations: hold drink with both hands during smoking moments'
      ],
      nicotineSpecific: {
        cigarettes: {
          description: 'Replace cigarette rituals and smoking moments with satisfying healthy alternatives.',
          goals: [
            'Morning routine: drink coffee + 5 deep breaths instead of cigarette',
            'After-meal swap: brush teeth or chew mint gum immediately after eating',
            'Car habit: keep water bottle and gum in cupholder for drive cravings',
            'Social replacement: hold drink with both hands during social smoking moments'
          ]
        },
        vape: {
          description: 'Replace vaping habits and device rituals with engaging healthy activities.',
          goals: [
            'Device habit: carry a pen, fidget spinner, or stress ball instead',
            'Cloud alternative: blow bubbles, breathe into cold air, or sip hot tea',
            'Flavor seeking: try new gum flavors, mints, or flavored sparkling water',
            'Pocket ritual: keep small object to fidget with when hands feel empty'
          ]
        },
        chewing: {
          description: 'Replace dip and nicotine pouch moments with satisfying healthy alternatives.',
          goals: [
            'Work habit: keep sunflower seeds or gum at desk instead of dip/pouches',
            'Sports substitute: chew gum or use mouth guard during physical activity',
            'Focus aid: fidget with pen or stress ball when you need concentration',
            'Oral satisfaction: try toothpicks, straws, or sugar-free hard candy'
          ]
        }
      }
    },
    {
      id: 'confidence-boost',
      title: 'Social Confidence',
      description: 'Navigate social situations and peer pressure with confidence and authenticity.',
      icon: 'people',
      color: '#F59E0B',
      gradientColors: ['#F59E0B', '#D97706'],
      duration: '1 week',
      goals: [
        'Practice 3 conversation starters for nicotine-free social events',
        'Confidence technique: order special drink + hold with both hands at gatherings',
        'Peer pressure response: practice saying "I\'m taking a break" confidently',
        'Identity building: identify 3 activities you enjoy that don\'t involve nicotine'
      ],
      nicotineSpecific: {
        cigarettes: {
          description: 'Build confidence in social smoking situations and cigarette-free socializing.',
          goals: [
            'Social skills: practice 3 conversation starters for smoke-free social events',
            'Bar/party confidence: order special drink + hold with both hands during gatherings',
            'Smoke break conversations: suggest "fresh air walks" instead of smoke breaks',
            'Dating confidence: plan nicotine-free date activities (coffee, walks, movies)'
          ]
        },
        vape: {
          description: 'Navigate vaping social circles and build confidence without your device.',
          goals: [
            'Device-free socializing: practice introducing yourself without vape in hand',
            'Cloud community alternatives: suggest outdoor activities or coffee meetups',
            'Peer pressure response: practice saying "I\'m taking a break" with confidence',
            'Social identity: identify 3 non-vaping activities you enjoy with friends'
          ]
        },
        chewing: {
          description: 'Build confidence in sports and social settings without dip or nicotine pouches.',
          goals: [
            'Sports confidence: practice pre-game routine without dip/pouches (gum, water, visualization)',
            'Team dynamics: suggest group activities that don\'t involve tobacco products',
            'Competition focus: develop 3 mental techniques for performance without nicotine',
            'Identity building: identify strengths and skills beyond tobacco use'
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
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={['rgba(16, 185, 129, 0.15)', 'rgba(6, 182, 212, 0.15)']}
        style={[styles.planGradient, styles.recommendedPlanGradient]}
      >
        {/* Recommendation Badge */}
        <View style={styles.recommendationBadge}>
          <Ionicons name="star" size={14} color="#FFFFFF" />
          <Text style={styles.recommendationText}>RECOMMENDED FOR YOU</Text>
        </View>

        <View style={styles.planHeader}>
          <View style={[styles.planIcon, { backgroundColor: plan.color }]}>
            <Ionicons name={plan.icon as any} size={24} color="#FFFFFF" />
          </View>
          <View style={styles.planTitleSection}>
            <Text style={styles.planTitle}>{plan.title}</Text>
            <Text style={styles.planDuration}>{plan.duration}</Text>
          </View>
        </View>
        
        <Text style={styles.planDescription}>{plan.description}</Text>
        
        <View style={styles.goalsSection}>
          <Text style={styles.goalsTitle}>Key Goals:</Text>
          {plan.goals.slice(0, 2).map((goal, index) => (
            <View key={index} style={styles.goalItem}>
              <View style={styles.goalBullet} />
              <Text style={styles.goalText}>{goal}</Text>
            </View>
          ))}
          {plan.goals.length > 2 && (
            <Text style={styles.moreGoals}>+{plan.goals.length - 2} more goals</Text>
          )}
        </View>
        
        <View style={styles.planFooter}>
          <Text style={styles.viewDetailsText}>Start Recommended Plan</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
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
        colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.04)']}
        style={styles.planGradient}
      >
        <View style={styles.planHeader}>
          <View style={[styles.planIcon, { backgroundColor: plan.color }]}>
            <Ionicons name={plan.icon as any} size={24} color="#FFFFFF" />
          </View>
          <View style={styles.planTitleSection}>
            <Text style={styles.planTitle}>{plan.title}</Text>
            <Text style={styles.planDuration}>{plan.duration}</Text>
          </View>
        </View>
        
        <Text style={styles.planDescription}>{plan.description}</Text>
        
        <View style={styles.goalsSection}>
          <Text style={styles.goalsTitle}>Key Goals:</Text>
          {plan.goals.slice(0, 2).map((goal, index) => (
            <View key={index} style={styles.goalItem}>
              <View style={styles.goalBullet} />
              <Text style={styles.goalText}>{goal}</Text>
            </View>
          ))}
          {plan.goals.length > 2 && (
            <Text style={styles.moreGoals}>+{plan.goals.length - 2} more goals</Text>
          )}
        </View>
        
        <View style={styles.planFooter}>
          <Text style={styles.viewDetailsText}>View Plan Details</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
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
            <Text style={styles.heroTitle}>Choose Your Recovery Path</Text>
            <Text style={styles.heroSubtitle}>
              {recommendation ? 
                `Based on your recovery patterns, we've recommended the best plan for you. You can also explore other ` :
                `Select a focused plan to explore targeted strategies for your `
              }
              {nicotineCategory === 'vape' ? 'vaping' : nicotineCategory} recovery journey.
            </Text>
          </View>

          {/* Recommended Plan Section */}
          {!isLoadingRecommendation && recommendedPlan && recommendation && (
            <View style={styles.recommendedSection}>
              <View style={styles.recommendedSectionHeader}>
                <Ionicons name="star" size={20} color={COLORS.primary} />
                <Text style={styles.recommendedSectionTitle}>RECOMMENDED FOR YOU</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.md,
    lineHeight: 36,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textMuted,
    lineHeight: 24,
  },
  plansSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: SPACING.lg,
  },
  planCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  planGradient: {
    padding: SPACING.lg,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  planTitleSection: {
    flex: 1,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  planDuration: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  planDescription: {
    fontSize: 15,
    fontWeight: '400',
    color: COLORS.textMuted,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  goalsSection: {
    marginTop: SPACING.sm,
  },
  goalsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: SPACING.sm,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  goalBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  goalText: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textMuted,
    flex: 1,
  },
  goalTextCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  moreGoals: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  planFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  recommendedSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  recommendedSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  recommendedSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1,
    marginLeft: SPACING.sm,
  },
  recommendedPlanCard: {
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  recommendedPlanGradient: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  recommendationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  recommendationText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: SPACING.xs,
    letterSpacing: 0.5,
  },
  loadingSection: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
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