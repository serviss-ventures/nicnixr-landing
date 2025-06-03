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
            'Morning Victory Ritual: Place nicotine gum by your coffee maker. Chew it BEFORE your first coffee (breaks the coffee-cigarette link)',
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
            'Pocket Replacement Kit: Carry xylitol mints, cinnamon toothpicks, and nicotine gum. Use one within 10 seconds of pouch cravings',
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
    <SafeAreaViewCompat style={styles.container} edges={['top', 'left', 'right']}>
      <LinearGradient
        colors={['#000000', '#0A0F1C']}
        style={styles.gradient}
      >
        {/* Animated Header */}
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{planDetail.title}</Text>
          <View style={styles.headerSpacer} />
        </Animated.View>

        {/* Fixed Header (always visible) */}
        <View style={[styles.header, styles.fixedHeader]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerSpacer} />
        </View>

        <Animated.ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        >
          {/* Hero Section - Simplified */}
          <Animated.View style={[styles.heroSection, { opacity: heroOpacity }]}>
            {/* Plan Icon */}
            <View style={styles.planIconContainer}>
              <LinearGradient
                colors={planDetail.gradientColors}
                style={styles.planIconGradient}
              >
                <Ionicons name={planDetail.icon as any} size={32} color="#FFFFFF" />
              </LinearGradient>
            </View>
            
            {/* Title and Duration */}
            <Text style={styles.planTitle}>{planDetail.title}</Text>
            <Text style={styles.planDuration}>{planDetail.duration} program</Text>
            
            {/* Description */}
            <Text style={styles.planDescription}>{planDetail.description}</Text>
          </Animated.View>

          {/* Benefits Section - Streamlined */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What You'll Achieve</Text>
            
            <View style={styles.benefitsContainer}>
              {planDetail.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <View style={styles.benefitBullet} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Weekly Goals Section - Cleaner */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Week 1 Goals</Text>
            
            <View style={styles.goalsContainer}>
              {planDetail.goals.map((goal, index) => {
                const isSelected = selectedGoalIndex === index;
                const goalParts = goal.split(':');
                const goalTitle = goalParts[0];
                const goalDescription = goalParts[1] || '';
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.goalCard}
                    onPress={() => handleGoalPress(index)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.goalHeader}>
                      <Text style={[styles.goalNumber, { color: planDetail.color }]}>{index + 1}</Text>
                      <Text style={styles.goalTitle}>{goalTitle}</Text>
                    </View>
                    {goalDescription && isSelected && (
                      <Animated.View style={styles.goalDescription}>
                        <Text style={styles.goalDescriptionText}>{goalDescription.trim()}</Text>
                      </Animated.View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: 100 }} />
        </Animated.ScrollView>

        {/* Floating Start Button - Simplified */}
        <View style={styles.floatingButtonContainer}>
          <TouchableOpacity style={styles.startButton} onPress={handleStartPlan}>
            <LinearGradient
              colors={planDetail.gradientColors}
              style={styles.startButtonGradient}
            >
              <Text style={styles.startButtonText}>Start This Plan</Text>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  fixedHeader: {
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
    marginTop: 60,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: SPACING['2xl'],
    paddingBottom: SPACING['3xl'],
    paddingHorizontal: SPACING.xl,
  },
  planIconContainer: {
    width: 80,
    height: 80,
    marginBottom: SPACING.lg,
  },
  planIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  planDuration: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
  },
  planDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: -0.2,
    paddingHorizontal: SPACING.lg,
  },
  section: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING['2xl'],
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: SPACING.lg,
  },
  benefitsContainer: {
    gap: SPACING.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  benefitBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 8,
  },
  benefitText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    flex: 1,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  goalsContainer: {
    gap: SPACING.sm,
  },
  goalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  goalNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    letterSpacing: -0.2,
  },
  goalDescription: {
    marginTop: SPACING.sm,
    paddingLeft: 32,
  },
  goalDescriptionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  startButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  startButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '600',
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