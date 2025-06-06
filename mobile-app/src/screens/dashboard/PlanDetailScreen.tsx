import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
  Animated
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
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  // Handle nicotine pouches which are currently marked as 'other'
  const category = nicotineCategory === 'other' ? 'pouches' : nicotineCategory;
  
  const planDetails: { [key: string]: PlanDetail } = {
    'neural-rewiring': {
      id: 'neural-rewiring',
      title: 'Neural Rewiring',
      description: category === 'cigarettes' 
        ? 'Rewire cigarette-conditioned neural pathways through targeted behavioral interruption and healthy dopamine replacement.'
        : category === 'vape'
        ? 'Break vape pen dependency by rewiring device-seeking behavior and rebuilding natural reward sensitivity.'
        : category === 'chewing'
        ? 'Rewire oral fixation pathways and rebuild jaw muscle memory with healthy stimulation patterns.'
        : category === 'pouches'
        ? 'Reset nicotine-seeking neural pathways and restore natural oral satisfaction without pouches.'
        : 'Rewire your brain\'s reward pathways using evidence-based neuroplasticity techniques and dopamine regulation strategies.',
      icon: 'flash-outline',
      color: '#8B5CF6',
      gradientColors: ['#8B5CF6', '#7C3AED'],
      duration: '1 week',
      goals: category === 'cigarettes' 
        ? [
            'Morning Victory Ritual: Place sugar-free gum or strong mints by your coffee maker. Use them BEFORE your first coffee (breaks the coffee-cigarette link)',
            'Craving Emergency Kit: Fill a small container with cinnamon toothpicks, mints, and a stress ball. Keep it in your pocket at all times',
            'The 5-Minute Rule: When a craving hits, set a 5-minute timer and do 20 pushups or take a walk. Most cravings die in under 3 minutes',
            'Trigger Spot Changes: Rearrange your smoking spots - move the chair you smoke in, avoid the balcony for a week, take a different route to work'
          ]
        : category === 'vape'
        ? [
            'Device Lockdown: Put your vape in a drawer with a 2-minute timer taped on top. This delay often kills the urge before you even open it',
            'Flavor Replacement Pack: Buy strong mints, cinnamon gum, and sour candy. Use one immediately when you want to vape for flavor',
            'Hand Habit Fix: Get a clicking pen or fidget toy. Practice clicking it 10 times whenever your hand reaches for your vape',
            'Social Vaping Solution: At parties, hold a drink with both hands or bring a mocktail with a straw to keep your mouth and hands busy'
          ]
        : category === 'chewing'
        ? [
            'Morning Replacement Ritual: Start each day with 2 pieces of cinnamon gum instead of dip. Keep gum on your nightstand as a reminder',
            'Craving Buster Kit: Pack a tin with sunflower seeds, toothpicks, and sugar-free gum. Use within 30 seconds of any tobacco craving',
            'After-Meal Defense: Immediately after eating, brush your teeth or use strong mouthwash. This breaks the meal-to-dip habit fast',
            'Work Stress Response: When work stress hits, step outside for a 2-minute walk instead of reaching for your tin. Fresh air beats tobacco'
          ]
        : category === 'pouches'
        ? [
            'Morning Mouth Reset: Start your day with a strong mint instead of a pouch. Keep mints on your nightstand to grab first thing',
            'Pocket Replacement Kit: Carry xylitol mints, cinnamon toothpicks, and strong sugar-free gum. Use one within 10 seconds of pouch cravings',
            'Meeting Survival Plan: Before any meeting, pop a long-lasting mint. It keeps your mouth busy without the pouch fidgeting',
            'Bedtime Victory: Place a glass of water and mints by your bed. If you wake up craving, drink water and have a mint instead'
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
      description: category === 'cigarettes'
        ? 'Dominate cigarette cravings using clinical-grade urge management and behavioral intervention techniques.'
        : category === 'vape'
        ? 'Dominate vaping urges through advanced psychological techniques and device dependency breaking.'
        : category === 'chewing'
        ? 'Dominate oral cravings using specialized jaw therapy and oral substitution science.'
        : category === 'pouches'
        ? 'Master pouch cravings through oral desensitization and nicotine absorption interruption techniques.'
        : 'Master advanced craving management using clinical psychology techniques and evidence-based urge surfing.',
      icon: 'shield-checkmark',
      color: '#EF4444',
      gradientColors: ['#EF4444', '#DC2626'],
      duration: '1 week',
      goals: category === 'cigarettes'
        ? [
            'The STOP Method: When craving hits - Stop what you\'re doing, Take 5 deep breaths, Observe the craving without judgment, Proceed with your replacement activity',
            'Craving Surfing: Set a 90-second timer when urge hits. Breathe deeply and remind yourself "This will pass in 90 seconds" - because it will',
            'Trigger Practice: Each morning, hold an unlit cigarette for 30 seconds without lighting it. This builds confidence that you control cigarettes, not vice versa',
            'Emergency Contact: Save a friend\'s number as "Craving Support". Text them "Having a moment" when struggling. Accountability beats willpower'
          ]
        : category === 'vape'
        ? [
            'The 4-7-8 Breathing: When you want to vape, breathe in for 4, hold for 7, out for 8. Do this 3 times - it mimics the vaping action and calms you',
            'Flavor Craving Hack: Keep ultra-strong mints (Altoids work great). The intense flavor overwhelms vape cravings in seconds',
            'Device Exposure Training: Hold your turned-off vape for 1 minute daily while saying "I don\'t need this". Sounds weird but builds mental strength',
            'Social Confidence Builder: Practice saying "I\'m good, thanks" to vape offers. Say it 10 times in the mirror. Confidence comes from practice'
          ]
        : category === 'chewing'
        ? [
            'Mouth Busy Protocol: The moment you want dip, immediately put in sugar-free gum. Chew vigorously for 30 seconds - the urge usually dies',
            'Jaw Tension Release: When craving, clench jaw tight for 5 seconds, then release. Repeat 5 times. This satisfies the jaw muscle memory',
            'Spit Alternative: Carry a water bottle. Take a sip every time you would have spit. Keeps mouth busy and hydrates you',
            'Baseball/Work Hack: During games or meetings, use sunflower seeds or toothpicks. Same mouth action, zero tobacco harm'
          ]
        : category === 'pouches'
        ? [
            'The 5-Minute Delay: When you want a pouch, set a 5-minute timer. Tell yourself "If I still want it in 5 minutes, I\'ll decide then". Usually, you won\'t',
            'Gum Massage Technique: When craving, massage your upper gum with your tongue for 30 seconds. Satisfies the pouch sensation safely',
            'Temperature Shock: Alternate sipping hot tea and ice water. The temperature changes distract your mouth from wanting nicotine',
            'Visible Accountability: Put a rubber band on your wrist. Snap it gently when you crave, then do your replacement activity. Physical reminder = mental strength'
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
      description: category === 'cigarettes'
        ? 'Master stress without cigarettes using advanced nervous system regulation and breathing science.'
        : category === 'vape'
        ? 'Build stress resilience without vaping through advanced anxiety management and device-free coping.'
        : category === 'chewing'
        ? 'Master stress without dip or pouches using oral stress management and jaw tension release techniques.'
        : category === 'pouches'
        ? 'Build stress resilience without nicotine pouches through rapid-acting stress relief and oral comfort techniques.'
        : 'Build advanced stress resilience using evidence-based techniques from clinical psychology and neuroscience research.',
      icon: 'fitness',
      color: '#06B6D4',
      gradientColors: ['#06B6D4', '#0891B2'],
      duration: '1 week',
      goals: category === 'cigarettes'
        ? [
            'Smoke Break Replacement: Every 2 hours at work, take a 5-minute walk outside. Same break, same fresh air, zero cigarettes',
            'Stress Breathing Trick: When stressed, breathe in through nose for 4 counts, out through pursed lips for 8 (mimics smoking, calms you faster)',
            'Desk Stress Kit: Keep a stress ball, rubber band, and mints in your desk drawer. Use one immediately when work stress = cigarette thoughts',
            'The Redirect Response: When someone offers a smoke, say "I\'m taking a quick walk instead, want to join?" Turn triggers into healthy habits'
          ]
        : category === 'vape'
        ? [
            'Stealth Calm Technique: In stressful meetings, press tongue to roof of mouth for 10 seconds. Invisible stress relief that beats vaping',
            'Anxiety Hand Fix: Keep a small smooth stone in your pocket. Rub it when anxious instead of reaching for your vape. Tactile comfort',
            'Mint Emergency System: Carry peppermint oil or extra-strong mints. One whiff/taste cuts stress and vape cravings simultaneously',
            'Social Stress Solution: Before stressful social events, do 2 minutes of power poses in private. Confidence replaces vaping need'
          ]
        : category === 'chewing'
        ? [
            'Jaw Stress Release: When stressed, open mouth wide 5 times, roll jaw in circles. Releases tension without tobacco',
            'Desk Drawer Defense: Stock your workspace with healthy alternatives - almonds, carrots, gum. Stress eating beats stress dipping',
            'Pre-Game Calm: Before sports/competition, do 10 deep breaths and visualize success. Mental prep beats tobacco "courage"',
            'Mouth Comfort Hack: When anxious, press tongue firmly to roof of mouth and hold for 10 seconds. Instant calm, no dip needed'
          ]
        : category === 'pouches'
        ? [
            'Quick Office Relief: Keep xylitol mints in every location you work. Pop one instantly when stress hits - before pouch thoughts start',
            'Meeting Prep Ritual: 2 minutes before stressful meetings, do breathing exercises and place a mint. Enter calm and pouch-free',
            'Stress Station Setup: Create a drawer with mints, gum, tea bags, and stress toy. When stressed, pick one - make it easier than pouches',
            'Evening Wind-Down: Replace post-work pouch with chamomile tea ritual. Same relaxation signal, healthier habit'
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
      description: category === 'cigarettes'
        ? 'Transform from smoker to non-smoker identity using cognitive restructuring and social psychology.'
        : category === 'vape'
        ? 'Transform from vaper to non-user identity through device independence and social confidence building.'
        : category === 'chewing'
        ? 'Transform from tobacco user to clean lifestyle identity through oral health focus and confidence building.'
        : category === 'pouches'
        ? 'Transform from pouch user to naturally confident person through oral health pride and authentic social presence.'
        : 'Rebuild your identity as a non-user through cognitive restructuring and values-based behavior change.',
      icon: 'person-outline',
      color: '#10B981',
      gradientColors: ['#10B981', '#059669'],
      duration: '1 week',
      goals: category === 'cigarettes'
        ? [
            'New Identity Statement: Practice saying "I don\'t smoke" instead of "I\'m trying to quit". Say it 10 times each morning. Words shape reality',
            'Non-Smoker Modeling: Watch how non-smokers handle stress and socialize. Copy their body language and habits. Fake it till you make it',
            'The Three Response Rule: Prepare answers for "Want a cigarette?" - "No thanks, I don\'t smoke" / "I\'m good" / "Not for me". Practice out loud',
            'Breath Pride Practice: Every hour, take 3 deep breaths and think "My lungs are healing". Celebrate your improving health daily'
          ]
        : category === 'vape'
        ? [
            'Device-Free Identity: Practice natural hand gestures when talking. No more fidgeting for vapes. Your hands have better things to do',
            'Trend Leader Mindset: When asked about vaping, say "I make my own choices" with confidence. You\'re not missing out, you\'re leading',
            'Clean Lung Focus: Each morning, take 5 deep breaths and appreciate how clear they feel. You\'re becoming a deep-breathing athlete',
            'Social Media Shift: Follow fitness accounts, not vape culture. Change your feed, change your mindset. You are what you consume'
          ]
        : category === 'chewing'
        ? [
            'Clean Mouth Pride: After brushing, look in mirror and smile. Say "I love my healthy mouth". Positive self-talk builds new identity',
            'Athlete Identity: See yourself as someone optimizing performance. Tobacco users hope to win. Non-users prepare to dominate',
            'Professional Image: Practice speaking clearly without worrying about dip. Your clean mouth gives you confidence in any conversation',
            'Role Model Mindset: Someone is watching you and learning. Be the person you\'d want them to become. Lead by example'
          ]
        : category === 'pouches'
        ? [
            'Pouch-Free Pride: Start each day saying "I don\'t need pouches to be confident". Repeat before any stressful situation',
            'Natural Presence: Practice maintaining eye contact in conversations without pouch adjustments. Your focus is your superpower',
            'Authentic Calm: When stressed, remind yourself "I handle life without nicotine". You\'re stronger than you think',
            'Health Ambassador: Share one benefit of quitting with someone each week. Teaching others reinforces your new identity'
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
      description: category === 'cigarettes'
        ? 'Master smoke-free socializing through advanced social skills and confident non-smoker presence.'
        : category === 'vape'
        ? 'Navigate vaping social circles with confidence while building device-free social skills and presence.'
        : category === 'chewing'
        ? 'Build confidence in sports and professional settings without tobacco while enhancing performance and image.'
        : category === 'pouches'
        ? 'Master social situations without discrete pouch use - build genuine presence and confident communication.'
        : 'Master social situations without nicotine using advanced social psychology and confidence-building techniques.',
      icon: 'people',
      color: '#F59E0B',
      gradientColors: ['#F59E0B', '#D97706'],
      duration: '1 week',
      goals: category === 'cigarettes'
        ? [
            'Smoke Break Alternative: Suggest "coffee walk" or "fresh air break" when others smoke. You\'re not missing out, you\'re upgrading',
            'Party Hands Strategy: Always hold a drink, phone, or snack at parties. Busy hands don\'t reach for cigarettes. Simple but effective',
            'Dating Confidence Line: If smoking comes up on dates, say "I used to smoke but I\'m into healthier stuff now". Shows growth and strength',
            'Work Social Leader: Organize one non-smoking team activity weekly - lunch walks, coffee runs, anything. Be the healthy fun initiator'
          ]
        : category === 'vape'
        ? [
            'Group Engagement Trick: When friends vape, ask engaging questions or tell stories. Be so interesting they forget to vape around you',
            'Confident Hand Habits: Practice expressive hand gestures when talking. Animated hands are interesting, not searching for vapes',
            'Trendsetter Response: When offered a vape, say "I\'m good, but thanks!" with a smile. Confidence is more attractive than clouds',
            'Social Media Power: Post about your vape-free achievements. Your journey might inspire someone else to quit. Lead by example'
          ]
        : category === 'chewing'
        ? [
            'Pre-Game Confidence: Develop a tobacco-free pump-up routine - music, stretches, visualization. Show teammates there\'s a better way',
            'Team Leader Actions: Be first to suggest healthy team traditions. Your tobacco-free energy will inspire better performance',
            'Professional Speaking: In meetings, speak clearly and confidently. No mumbling or tobacco hiding. Your voice deserves to be heard',
            'Mentor Method: Find one person trying to quit and support them weekly. Helping others keeps you accountable and strong'
          ]
        : category === 'pouches'
        ? [
            'Full Presence Practice: In conversations, focus 100% on the speaker. No pouch adjusting means better connections and relationships',
            'Meeting Power Move: Arrive 2 minutes early, get settled with water/coffee. No last-minute pouch panic. You own the room',
            'Natural Confidence Builder: Before social events, do power poses for 2 minutes. Real confidence beats nicotine-fake calm',
            'Story Sharing: Have one funny quitting story ready for social situations. Humor about your journey shows strength and relatability'
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
  const scrollY = useRef(new Animated.Value(0)).current;
  const [selectedGoalIndex, setSelectedGoalIndex] = useState<number | null>(null);
  
  // Get user's nicotine product from Redux store
  const { user } = useSelector((state: RootState) => state.auth);
  const nicotineCategory = user?.nicotineProduct?.category || 'cigarettes';
  
  const planDetail = getPlanDetails(planId, nicotineCategory);

  // Animated values for header
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0.3],
    extrapolate: 'clamp',
  });

  const handleStartPlan = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!planDetail) return;
    
    Alert.alert(
      'Ready to Begin?',
      `Start your ${planTitle} journey with personalized daily goals.`,
      [
        { text: 'Not Yet', style: 'cancel' },
        { 
          text: 'Start', 
          style: 'default',
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
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
              
              // Navigate back to dashboard immediately
              navigation.navigate('DashboardMain');
              
              // Show success message after navigation
              setTimeout(() => {
                Alert.alert(
                  'Plan Activated', 
                  `Your ${planTitle} plan is now active.`,
                  [{ text: 'OK' }]
                );
              }, 300);
            } catch (error) {
              console.error('❌ Failed to start plan:', error);
              Alert.alert('Error', 'Failed to start plan. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleGoalPress = async (index: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedGoalIndex(selectedGoalIndex === index ? null : index);
  };

  if (!planDetail) {
    return (
      <SafeAreaViewCompat style={styles.container} edges={['top', 'left', 'right']}>
        <Text style={styles.errorText}>Plan not found</Text>
      </SafeAreaViewCompat>
    );
  }

  return (
    <SafeAreaViewCompat style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <LinearGradient
        colors={['#0A0F1C', '#0F172A', '#1E293B']}
        style={styles.gradient}
      >
        {/* Simple Header */}
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
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Section - Clean and Bright */}
          <View style={styles.heroSection}>
            {/* Plan Icon */}
            <View style={styles.planIconContainer}>
              <LinearGradient
                colors={planDetail.gradientColors}
                style={styles.planIconGradient}
              >
                <Ionicons name={planDetail.icon as any} size={36} color="#FFFFFF" />
              </LinearGradient>
            </View>
            
            {/* Title and Duration */}
            <Text style={styles.planTitle}>{planDetail.title}</Text>
            <Text style={styles.planDuration}>{planDetail.duration} program</Text>
            
            {/* Description Card */}
            <View style={styles.descriptionCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.04)']}
                style={styles.descriptionGradient}
              >
                <Text style={styles.planDescription}>{planDetail.description}</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Benefits Section - Cards */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What You'll Achieve</Text>
            
            <View style={styles.benefitsContainer}>
              {planDetail.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitCard}>
                  <LinearGradient
                    colors={['rgba(16, 185, 129, 0.1)', 'rgba(6, 182, 212, 0.05)']}
                    style={styles.benefitGradient}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </LinearGradient>
                </View>
              ))}
            </View>
          </View>

          {/* Weekly Goals Section - Expandable Cards */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Action Plan</Text>
              <Text style={styles.sectionSubtitle}>Tap each goal for details</Text>
            </View>
            
            <View style={styles.goalsContainer}>
              {planDetail.goals.map((goal, index) => {
                const isSelected = selectedGoalIndex === index;
                const goalParts = goal.split(':');
                const goalTitle = goalParts[0];
                const goalDescription = goalParts[1] || '';
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.goalCard, isSelected && styles.goalCardExpanded]}
                    onPress={() => handleGoalPress(index)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={isSelected ? 
                        [`${planDetail.color}20`, `${planDetail.color}10`] : 
                        ['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.03)']}
                      style={styles.goalGradient}
                    >
                      <View style={styles.goalHeader}>
                        <View style={[styles.goalNumberContainer, { backgroundColor: `${planDetail.color}20` }]}>
                          <Text style={[styles.goalNumber, { color: planDetail.color }]}>
                            {index + 1}
                          </Text>
                        </View>
                        <Text style={styles.goalTitle} numberOfLines={isSelected ? undefined : 1}>
                          {goalTitle}
                        </Text>
                        <Ionicons 
                          name={isSelected ? "chevron-up" : "chevron-down"} 
                          size={20} 
                          color={COLORS.textSecondary} 
                        />
                      </View>
                      {goalDescription && isSelected && (
                        <View style={styles.goalDescription}>
                          <Text style={styles.goalDescriptionText}>{goalDescription.trim()}</Text>
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Floating Start Button - Prominent */}
        <View style={styles.floatingButtonContainer}>
          <LinearGradient
            colors={['rgba(10, 15, 28, 0.95)', 'rgba(15, 23, 42, 0.98)']}
            style={styles.floatingButtonGradient}
          >
            <TouchableOpacity style={styles.startButton} onPress={handleStartPlan} activeOpacity={0.9}>
              <LinearGradient
                colors={planDetail.gradientColors}
                style={styles.startButtonGradient}
              >
                <Text style={styles.startButtonText}>Start This Plan</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </LinearGradient>
    </SafeAreaViewCompat>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1C',
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
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  planIconContainer: {
    width: 90,
    height: 90,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  planIconGradient: {
    width: 90,
    height: 90,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  planDuration: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.xl,
    letterSpacing: 0.5,
  },
  descriptionCard: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  descriptionGradient: {
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  planDescription: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: 0,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  sectionHeader: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  benefitsContainer: {
    gap: SPACING.md,
  },
  benefitCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  benefitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  benefitText: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
    lineHeight: 24,
    letterSpacing: 0,
    fontWeight: '500',
  },
  goalsContainer: {
    gap: SPACING.sm,
  },
  goalCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  goalCardExpanded: {
    marginBottom: SPACING.md,
  },
  goalGradient: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
  },
  goalNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    letterSpacing: -0.1,
  },
  goalDescription: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingTop: 0,
  },
  goalDescriptionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    letterSpacing: 0,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.md,
  },
  floatingButtonGradient: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  startButton: {
    borderRadius: 20,
    overflow: 'hidden',
    margin: SPACING.xs,
  },
  startButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '700',
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