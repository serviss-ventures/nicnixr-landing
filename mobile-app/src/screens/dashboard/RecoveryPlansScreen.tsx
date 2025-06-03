import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
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
import { SafeAreaView as SafeAreaViewCompat } from 'react-native-safe-area-context';

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
  // Map "other" category to "pouches" for nicotine pouches/Zyn
  const mappedCategory = nicotineCategory === 'other' ? 'pouches' : nicotineCategory;
  
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
        'Morning Victory Ritual: Place nicotine gum by your coffee maker. Chew it BEFORE your first coffee (breaks the coffee-cigarette link)',
        'Craving Emergency Kit: Fill a small container with cinnamon toothpicks, mints, and a stress ball. Keep it in your pocket at all times',
        'The 5-Minute Rule: When a craving hits, set a 5-minute timer and do 20 pushups or take a walk. Most cravings die in under 3 minutes',
        'Trigger Spot Changes: Rearrange your smoking spots - move the chair you smoke in, avoid the balcony for a week, take a different route to work'
      ],
      nicotineSpecific: {
        cigarettes: {
          description: 'Rewire cigarette-conditioned neural pathways through targeted behavioral interruption and healthy dopamine replacement.',
          goals: [
            'Morning Victory Ritual: Place nicotine gum by your coffee maker. Chew it BEFORE your first coffee (breaks the coffee-cigarette link)',
            'Craving Emergency Kit: Fill a small container with cinnamon toothpicks, mints, and a stress ball. Keep it in your pocket at all times',
            'The 5-Minute Rule: When a craving hits, set a 5-minute timer and do 20 pushups or take a walk. Most cravings die in under 3 minutes',
            'Trigger Spot Changes: Rearrange your smoking spots - move the chair you smoke in, avoid the balcony for a week, take a different route to work'
          ]
        },
        vape: {
          description: 'Break vape pen dependency by rewiring device-seeking behavior and rebuilding natural reward sensitivity.',
          goals: [
            'Device Lockdown: Put your vape in a drawer with a 2-minute timer taped on top. This delay often kills the urge before you even open it',
            'Flavor Replacement Pack: Buy strong mints, cinnamon gum, and sour candy. Use one immediately when you want to vape for flavor',
            'Hand Habit Fix: Get a clicking pen or fidget toy. Practice clicking it 10 times whenever your hand reaches for your vape',
            'Social Vaping Solution: At parties, hold a drink with both hands or bring a mocktail with a straw to keep your mouth and hands busy'
          ]
        },
        chewing: {
          description: 'Rewire oral fixation pathways and rebuild jaw muscle memory with healthy stimulation patterns.',
          goals: [
            'Morning Replacement Ritual: Start each day with 2 pieces of cinnamon gum instead of dip. Keep gum on your nightstand as a reminder',
            'Craving Buster Kit: Pack a tin with sunflower seeds, toothpicks, and sugar-free gum. Use within 30 seconds of any tobacco craving',
            'After-Meal Defense: Immediately after eating, brush your teeth or use strong mouthwash. This breaks the meal-to-dip habit fast',
            'Work Stress Response: When work stress hits, step outside for a 2-minute walk instead of reaching for your tin. Fresh air beats tobacco'
          ]
        },
        pouches: {
          description: 'Break nicotine pouch dependency by rewiring oral habits and building healthier stress responses.',
          goals: [
            'Pouch Timing Replacement: Set phone alarms for your usual pouch times. When they ring, drink water or chew gum instead',
            'Oral Satisfaction Kit: Keep mints, gum, and toothpicks in a small tin. Use immediately when you crave a pouch',
            'Morning Ritual Change: Replace your morning pouch with strong coffee or tea. Same wake-up effect, zero nicotine',
            'Stress Response Reset: When stress hits, do 10 quick desk push-ups instead of reaching for a pouch. Physical relief beats chemical'
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
        'The STOP Method: When craving hits - Stop what you\'re doing, Take 5 deep breaths, Observe the craving without judgment, Proceed with your replacement activity',
        'Craving Surfing: Set a 90-second timer when urge hits. Breathe deeply and remind yourself "This will pass in 90 seconds" - because it will',
        'Trigger Practice: Each morning, hold an unlit cigarette for 30 seconds without lighting it. This builds confidence that you control cigarettes, not vice versa',
        'Emergency Contact: Save a friend\'s number as "Craving Support". Text them "Having a moment" when struggling. Accountability beats willpower'
      ],
      nicotineSpecific: {
        cigarettes: {
          description: 'Dominate cigarette cravings using clinical-grade urge management and behavioral intervention techniques.',
          goals: [
            'The STOP Method: When craving hits - Stop what you\'re doing, Take 5 deep breaths, Observe the craving without judgment, Proceed with your replacement activity',
            'Craving Surfing: Set a 90-second timer when urge hits. Breathe deeply and remind yourself "This will pass in 90 seconds" - because it will',
            'Trigger Practice: Each morning, hold an unlit cigarette for 30 seconds without lighting it. This builds confidence that you control cigarettes, not vice versa',
            'Emergency Contact: Save a friend\'s number as "Craving Support". Text them "Having a moment" when struggling. Accountability beats willpower'
          ]
        },
        vape: {
          description: 'Dominate vaping urges through advanced psychological techniques and device dependency breaking.',
          goals: [
            'The 4-7-8 Breathing: When you want to vape, breathe in for 4, hold for 7, out for 8. Do this 3 times - it mimics the vaping action and calms you',
            'Flavor Craving Hack: Keep ultra-strong mints (Altoids work great). The intense flavor overwhelms vape cravings in seconds',
            'Device Exposure Training: Hold your turned-off vape for 1 minute daily while saying "I don\'t need this". Sounds weird but builds mental strength',
            'Social Confidence Builder: Practice saying "I\'m good, thanks" to vape offers. Say it 10 times in the mirror. Confidence comes from practice'
          ]
        },
        chewing: {
          description: 'Dominate oral cravings using specialized jaw therapy and oral substitution science.',
          goals: [
            'Mouth Busy Protocol: The moment you want dip, immediately put in sugar-free gum. Chew vigorously for 30 seconds - the urge usually dies',
            'Jaw Tension Release: When craving, clench jaw tight for 5 seconds, then release. Repeat 5 times. This satisfies the jaw muscle memory',
            'Spit Alternative: Carry a water bottle. Take a sip every time you would have spit. Keeps mouth busy and hydrates you',
            'Baseball/Work Hack: During games or meetings, use sunflower seeds or toothpicks. Same mouth action, zero tobacco harm'
          ]
        },
        pouches: {
          description: 'Dominate nicotine pouch cravings using advanced oral substitution and habit disruption techniques.',
          goals: [
            'The Mint Override: Keep extra-strong mints (Altoids/Fisherman\'s Friend) everywhere. Pop one the instant you crave a pouch - intensity wins',
            'Cold Water Shock: When craving hits, drink ice-cold water or chew ice. The cold sensation satisfies oral needs instantly',
            'Pouch Time Redirect: At your usual pouch times, immediately do something active - 20 jumping jacks, walk around, stretch. Movement kills cravings',
            'Buddy Text System: Save a friend as "Pouch Craving SOS". Text them "Need distraction" when struggling. Conversation beats isolation'
          ]
        },
        cigars: {
          description: 'Dominate luxury cravings using mindfulness-based stress reduction and social confidence techniques.',
          goals: [
            'The 5-Minute Delay: When you want a cigar, set a 5-minute timer. Tell yourself "If I still want it in 5 minutes, I\'ll decide then". Usually, you won\'t',
            'Celebration Redirect: When success triggers cigar thoughts, immediately do 3 minutes of gratitude journaling. Celebrate differently',
            'Social Script Practice: Rehearse saying "I appreciate the offer, but I\'m good" with confidence. Practice makes natural',
            'Luxury Alternative Ritual: Replace cigar time with premium coffee or tea ceremony. Same sophistication, zero harm'
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
        'Smoke Break Replacement: Every 2 hours at work, take a 5-minute walk outside. Same break, same fresh air, zero cigarettes',
        'Stress Breathing Trick: When stressed, breathe in through nose for 4 counts, out through pursed lips for 8 (mimics smoking, calms you faster)',
        'Desk Stress Kit: Keep a stress ball, rubber band, and mints in your desk drawer. Use one immediately when work stress = cigarette thoughts',
        'The Redirect Response: When someone offers a smoke, say "I\'m taking a quick walk instead, want to join?" Turn triggers into healthy habits'
      ],
      nicotineSpecific: {
        cigarettes: {
          description: 'Master stress without cigarettes using advanced nervous system regulation and breathing science.',
          goals: [
            'Smoke Break Replacement: Every 2 hours at work, take a 5-minute walk outside. Same break, same fresh air, zero cigarettes',
            'Stress Breathing Trick: When stressed, breathe in through nose for 4 counts, out through pursed lips for 8 (mimics smoking, calms you faster)',
            'Desk Stress Kit: Keep a stress ball, rubber band, and mints in your desk drawer. Use one immediately when work stress = cigarette thoughts',
            'The Redirect Response: When someone offers a smoke, say "I\'m taking a quick walk instead, want to join?" Turn triggers into healthy habits'
          ]
        },
        vape: {
          description: 'Build stress resilience without vaping through advanced anxiety management and device-free coping.',
          goals: [
            'Stealth Calm Technique: In stressful meetings, press tongue to roof of mouth for 10 seconds. Invisible stress relief that beats vaping',
            'Anxiety Hand Fix: Keep a small smooth stone in your pocket. Rub it when anxious instead of reaching for your vape. Tactile comfort',
            'Mint Emergency System: Carry peppermint oil or extra-strong mints. One whiff/taste cuts stress and vape cravings simultaneously',
            'Social Stress Solution: Before stressful social events, do 2 minutes of power poses in private. Confidence replaces vaping need'
          ]
        },
        chewing: {
          description: 'Master stress without dip using oral stress management and jaw tension release techniques.',
          goals: [
            'Jaw Stress Release: When stressed, open mouth wide 5 times, roll jaw in circles. Releases tension without tobacco',
            'Desk Drawer Defense: Stock your workspace with healthy alternatives - almonds, carrots, gum. Stress eating beats stress dipping',
            'Pre-Game Calm: Before sports/competition, do 10 deep breaths and visualize success. Mental prep beats tobacco "courage"',
            'Mouth Comfort Hack: When anxious, press tongue firmly to roof of mouth and hold for 10 seconds. Instant calm, no dip needed'
          ]
        },
        pouches: {
          description: 'Build stress resilience without nicotine pouches through advanced oral fixation management and stress relief techniques.',
          goals: [
            'Pouch-Free Stress Break: Every 2 hours, take a 5-minute walk or do desk stretches. Same routine, zero nicotine',
            'Oral Comfort Alternative: Keep sugar-free gum, mints, or toothpicks handy. Satisfies the oral fixation without the harm',
            'Stress Response Training: When stressed, do 4-7-8 breathing (inhale 4, hold 7, exhale 8). Calms you faster than any pouch',
            'The Replacement Ritual: When you\'d normally use a pouch, drink cold water or chew ice. Refreshing oral sensation, zero addiction'
          ]
        },
        cigars: {
          description: 'Master sophisticated stress management without cigars using executive-level stress techniques.',
          goals: [
            'Executive Breathing Protocol: In high-stress moments, do 3 cycles of box breathing (4-4-4-4). Calms you faster than any cigar',
            'Success Celebration Shift: Replace stress-relief cigars with victory workouts or nature walks. Healthier rewards for achievements',
            'Premium Tea Ritual: Stock high-quality teas for evening wind-down. Same ritual satisfaction, zero tobacco toxins',
            'Boardroom Confidence: Before big meetings, do 2-minute power poses. Natural confidence beats nicotine-induced calm'
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
        'New Identity Statement: Practice saying "I don\'t smoke" instead of "I\'m trying to quit". Say it 10 times each morning. Words shape reality',
        'Non-Smoker Modeling: Watch how non-smokers handle stress and socialize. Copy their body language and habits. Fake it till you make it',
        'The Three Response Rule: Prepare answers for "Want a cigarette?" - "No thanks, I don\'t smoke" / "I\'m good" / "Not for me". Practice out loud',
        'Breath Pride Practice: Every hour, take 3 deep breaths and think "My lungs are healing". Celebrate your improving health daily'
      ],
      nicotineSpecific: {
        cigarettes: {
          description: 'Transform from smoker to non-smoker identity using cognitive restructuring and social psychology.',
          goals: [
            'New Identity Statement: Practice saying "I don\'t smoke" instead of "I\'m trying to quit". Say it 10 times each morning. Words shape reality',
            'Non-Smoker Modeling: Watch how non-smokers handle stress and socialize. Copy their body language and habits. Fake it till you make it',
            'The Three Response Rule: Prepare answers for "Want a cigarette?" - "No thanks, I don\'t smoke" / "I\'m good" / "Not for me". Practice out loud',
            'Breath Pride Practice: Every hour, take 3 deep breaths and think "My lungs are healing". Celebrate your improving health daily'
          ]
        },
        vape: {
          description: 'Transform from vaper to non-user identity through device independence and social confidence building.',
          goals: [
            'Device-Free Identity: Practice natural hand gestures when talking. No more fidgeting for vapes. Your hands have better things to do',
            'Trend Leader Mindset: When asked about vaping, say "I make my own choices" with confidence. You\'re not missing out, you\'re leading',
            'Clean Lung Focus: Each morning, take 5 deep breaths and appreciate how clear they feel. You\'re becoming a deep-breathing athlete',
            'Social Media Shift: Follow fitness accounts, not vape culture. Change your feed, change your mindset. You are what you consume'
          ]
        },
        chewing: {
          description: 'Transform from tobacco user to clean lifestyle identity through oral health focus and confidence building.',
          goals: [
            'Clean Mouth Pride: After brushing, look in mirror and smile. Say "I love my healthy mouth". Positive self-talk builds new identity',
            'Athlete Identity: See yourself as someone optimizing performance. Tobacco users hope to win. Non-users prepare to dominate',
            'Professional Image: Practice speaking clearly without worrying about dip. Your clean mouth gives you confidence in any conversation',
            'Role Model Mindset: Someone is watching you and learning. Be the person you\'d want them to become. Lead by example'
          ]
        },
        pouches: {
          description: 'Transform from pouch user to nicotine-free identity through health focus and personal empowerment.',
          goals: [
            'Freedom Statement: Practice saying "I don\'t use nicotine" with pride. Say it 10 times daily. You\'re choosing freedom over addiction',
            'Health Optimizer Identity: See yourself as someone who makes the best health choices. Pouches were yesterday, vitality is today',
            'Clean Living Focus: Each morning, appreciate your nicotine-free body. Take 5 deep breaths and feel the difference. You\'re healing',
            'Inspiration Mindset: Your quit journey can inspire others. Share your progress. Be the success story someone needs to see'
          ]
        },
        cigars: {
          description: 'Transform celebration and success associations away from cigars toward sophisticated, health-conscious alternatives.',
          goals: [
            'Success Redefinition: Start saying "I celebrate with experiences, not substances". Your achievements deserve better than smoke',
            'Cultural Evolution: Replace cigar knowledge with wine, coffee, or art expertise. Stay sophisticated, lose the tobacco',
            'Health Executive Identity: Tell colleagues "I\'m optimizing my performance" when declining cigars. Success requires clarity',
            'Legacy Focus: Ask yourself "What example am I setting?" before each decision. Your health is your greatest asset'
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
        'Smoke Break Alternative: Suggest "coffee walk" or "fresh air break" when others smoke. You\'re not missing out, you\'re upgrading',
        'Party Hands Strategy: Always hold a drink, phone, or snack at parties. Busy hands don\'t reach for cigarettes. Simple but effective',
        'Dating Confidence Line: If smoking comes up on dates, say "I used to smoke but I\'m into healthier stuff now". Shows growth and strength',
        'Work Social Leader: Organize one non-smoking team activity weekly - lunch walks, coffee runs, anything. Be the healthy fun initiator'
      ],
      nicotineSpecific: {
        cigarettes: {
          description: 'Master smoke-free socializing through advanced social skills and confident non-smoker presence.',
          goals: [
            'Smoke Break Alternative: Suggest "coffee walk" or "fresh air break" when others smoke. You\'re not missing out, you\'re upgrading',
            'Party Hands Strategy: Always hold a drink, phone, or snack at parties. Busy hands don\'t reach for cigarettes. Simple but effective',
            'Dating Confidence Line: If smoking comes up on dates, say "I used to smoke but I\'m into healthier stuff now". Shows growth and strength',
            'Work Social Leader: Organize one non-smoking team activity weekly - lunch walks, coffee runs, anything. Be the healthy fun initiator'
          ]
        },
        vape: {
          description: 'Navigate vaping social circles with confidence while building device-free social skills and presence.',
          goals: [
            'Group Engagement Trick: When friends vape, ask engaging questions or tell stories. Be so interesting they forget to vape around you',
            'Confident Hand Habits: Practice expressive hand gestures when talking. Animated hands are interesting, not searching for vapes',
            'Trendsetter Response: When offered a vape, say "I\'m good, but thanks!" with a smile. Confidence is more attractive than clouds',
            'Social Media Power: Post about your vape-free achievements. Your journey might inspire someone else to quit. Lead by example'
          ]
        },
        chewing: {
          description: 'Build confidence in sports and professional settings without tobacco while enhancing performance and image.',
          goals: [
            'Pre-Game Confidence: Develop a tobacco-free pump-up routine - music, stretches, visualization. Show teammates there\'s a better way',
            'Team Leader Actions: Be first to suggest healthy team traditions. Your tobacco-free energy will inspire better performance',
            'Professional Speaking: In meetings, speak clearly and confidently. No mumbling or tobacco hiding. Your voice deserves to be heard',
            'Mentor Method: Find one person trying to quit and support them weekly. Helping others keeps you accountable and strong'
          ]
        },
        pouches: {
          description: 'Master social situations without nicotine pouches while building authentic confidence and presence.',
          goals: [
            'Social Comfort Strategy: At social events, always have a drink or snack in hand. Keeps you occupied without needing a pouch',
            'Confidence Without Chemicals: Practice power poses before social situations. Natural confidence beats nicotine-induced calm',
            'The Honest Response: When offered nicotine, say "I\'m good without it" with a smile. Authenticity is attractive',
            'Activity Leader: Suggest active social plans - hiking, sports, games. Engaged people don\'t think about pouches'
          ]
        },
        cigars: {
          description: 'Master sophisticated social situations without cigars while building executive presence and cultural sophistication.',
          goals: [
            'Executive Presence: Maintain eye contact and confident posture in all interactions. Your presence speaks louder than smoke',
            'Cultural Conversations: Become the person who discusses business wins, travel, or investments instead of tobacco',
            'Success Celebration Leader: Suggest team dinners, achievement walls, or experience rewards instead of cigar celebrations',
            'Network Differently: Build connections through shared interests in fitness, technology, or culture rather than smoking rituals'
          ]
        }
      }
    }
  ];

  // Personalize each plan based on nicotine product
  return basePlans.map(plan => {
    const specificContent = plan.nicotineSpecific?.[mappedCategory];
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
              // Navigate back immediately for instant feedback
              navigation.goBack();
              
              // Cancel the plan (this is now faster)
              await dispatch(cancelActivePlan()).unwrap();
              
              // Show success message after navigation
              setTimeout(() => {
                Alert.alert(
                  'Plan Cancelled',
                  'Your plan has been cancelled. You can start a new plan anytime.'
                );
              }, 100);
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
    <SafeAreaViewCompat style={styles.container} edges={['top', 'left', 'right']}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={styles.gradientContainer}
      >
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
      </LinearGradient>
    </SafeAreaViewCompat>
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