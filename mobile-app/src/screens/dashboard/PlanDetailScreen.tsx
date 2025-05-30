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
  timeline: {
    week: number;
    title: string;
    description: string;
    goals: string[];
  }[];
}

// Comprehensive plan details with timelines
const getPlanDetails = (planId: string, nicotineCategory: string): PlanDetail | null => {
  const planDetails: { [key: string]: PlanDetail } = {
    'craving-control': {
      id: 'craving-control',
      title: 'Craving Control',
      description: nicotineCategory === 'cigarettes' 
        ? 'Master cigarette cravings with hand-to-mouth habit replacement and smoke break alternatives.'
        : nicotineCategory === 'vape'
        ? 'Overcome vape pen urges with device alternatives and cloud replacement activities.'
        : nicotineCategory === 'chewing'
        ? 'Beat dip and nicotine pouch cravings with mouth satisfaction techniques and oral habit replacement.'
        : 'Master urge management with proven techniques, breathing exercises, and instant coping strategies.',
      icon: 'shield',
      color: '#EF4444',
      gradientColors: ['#EF4444', '#DC2626'],
      duration: '1 week',
      goals: nicotineCategory === 'cigarettes' 
        ? [
            'Practice 4-7-8 breathing: inhale 4, hold 7, exhale 8 counts',
            'Replace hand-to-mouth: try carrot sticks, toothpick, or stress ball',
            'Create smoke break ritual: 5-minute walk outside instead',
            'Build emergency kit: gum, water bottle, fidget toy, affirmations'
          ]
        : nicotineCategory === 'vape'
        ? [
            'Device alternatives: carry a pen, fidget spinner, or stress ball when you would vape',
            'Cloud substitute: blow bubbles, breathe into cold air, or sip hot beverages',
            'Flavor cravings: try new gum flavors, mints, or flavored sparkling water',
            'Hand-to-mouth habit: practice "fake vaping" - breathe deeply and exhale slowly'
          ]
        : nicotineCategory === 'chewing'
        ? [
            'Try mouth alternatives: sunflower seeds, sugar-free gum, toothpicks, or beef jerky',
            'Do jaw exercises: open wide 10x, side-to-side 10x, jaw circles 5x daily',
            'Replace the ritual: sip water or tea when you would normally use dip/pouches',
            'Find new textures: ice chips, celery sticks, or sugar-free hard candy'
          ]
        : [
            'Practice 4-7-8 breathing when cravings hit: inhale 4, hold 7, exhale 8',
            'Try 3 oral alternatives: gum, toothpick, carrot sticks, or stress ball', 
            'Build emergency kit: water, gum, fidget toy, positive affirmations',
            'Create new routine: 5-minute walk or breathing break instead of nicotine'
          ],
      benefits: [
        'Reduce craving intensity by 60-80%',
        'Develop instant coping techniques',
        'Build confidence in high-risk situations',
        'Create personalized emergency plan'
      ],
      timeline: [
        {
          week: 1,
          title: 'Foundation Building',
          description: 'Learn core craving management techniques',
          goals: nicotineCategory === 'cigarettes' 
            ? [
                'Practice 4-7-8 breathing: inhale 4, hold 7, exhale 8 counts',
                'Replace hand-to-mouth: try carrot sticks, toothpick, or stress ball',
                'Create smoke break ritual: 5-minute walk outside instead',
                'Build emergency kit: gum, water bottle, fidget toy, affirmations'
              ]
            : nicotineCategory === 'vape'
            ? [
                'Device alternatives: carry a pen, fidget spinner, or stress ball when you would vape',
                'Cloud substitute: blow bubbles, breathe into cold air, or sip hot beverages',
                'Flavor cravings: try new gum flavors, mints, or flavored sparkling water',
                'Hand-to-mouth habit: practice "fake vaping" - breathe deeply and exhale slowly'
              ]
            : nicotineCategory === 'chewing'
            ? [
                'Try mouth alternatives: sunflower seeds, sugar-free gum, toothpicks, or beef jerky',
                'Do jaw exercises: open wide 10x, side-to-side 10x, jaw circles 5x daily',
                'Replace the ritual: sip water or tea when you would normally use dip/pouches',
                'Find new textures: ice chips, celery sticks, or sugar-free hard candy'
              ]
            : [
                'Practice 4-7-8 breathing when cravings hit: inhale 4, hold 7, exhale 8',
                'Try 3 oral alternatives: gum, toothpick, carrot sticks, or stress ball', 
                'Build emergency kit: water, gum, fidget toy, positive affirmations',
                'Create new routine: 5-minute walk or breathing break instead of nicotine'
              ]
        }
      ]
    },
    'energy-rebuild': {
      id: 'energy-rebuild',
      title: 'Energy Rebuild',
      description: nicotineCategory === 'cigarettes'
        ? 'Rebuild energy without cigarette stimulation and heal lung capacity for better oxygen flow.'
        : nicotineCategory === 'vape'
        ? 'Restore natural energy without nicotine hits and rebuild respiratory health.'
        : nicotineCategory === 'chewing'
        ? 'Rebuild energy without dip or nicotine pouches and restore oral health for better nutrition.'
        : 'Restore natural energy and mental clarity without nicotine dependence.',
      icon: 'flash',
      color: '#10B981', 
      gradientColors: ['#10B981', '#059669'],
      duration: '1 week',
      goals: nicotineCategory === 'cigarettes'
        ? [
            'Deep breathing exercises: 5 minutes of box breathing (4-4-4-4 counts)',
            'Morning energy boost: 10 jumping jacks or stretches instead of cigarette',
            'Hydration goal: drink 16oz water when you feel tired',
            'Power nap technique: 15-minute rest with eyes closed when energy drops'
          ]
        : nicotineCategory === 'vape'
        ? [
            'Natural alertness: cold water on face + 5 deep breaths when tired',
            'Throat healing: warm honey tea or throat coat tea twice daily',
            'Energy timing: note energy levels hourly to find natural peaks',
            'Movement boost: 2-minute walk or desk stretches instead of vape break'
          ]
        : nicotineCategory === 'chewing'
        ? [
            'Oral health routine: rinse with salt water twice daily this week',
            'Natural stimulation: chew mint gum or eat an apple when feeling sluggish',
            'Jaw muscle relaxation: massage temples and jaw for 2 minutes twice daily',
            'Energy snacks: eat protein-rich snacks (nuts, yogurt) when energy dips'
          ]
        : [
            'Do 5 minutes of box breathing daily: 4 counts in, 4 hold, 4 out, 4 hold',
            'Try natural energy boosters: cold water on face, 10 jumping jacks, or stretches',
            'Power nap technique: 15-minute rest with eyes closed when energy drops',
            'Hydration goal: drink 16oz water immediately when feeling tired'
          ],
      benefits: [
        'Increase natural energy by 40-60%',
        'Improve sleep quality and recovery',
        'Enhance mental clarity and focus',
        'Build sustainable energy habits'
      ],
      timeline: [
        {
          week: 1,
          title: 'Energy Restoration',
          description: 'Rebuild natural energy without nicotine dependence',
          goals: nicotineCategory === 'cigarettes'
            ? [
                'Deep breathing exercises: 5 minutes of box breathing (4-4-4-4 counts)',
                'Morning energy boost: 10 jumping jacks or stretches instead of cigarette',
                'Hydration goal: drink 16oz water when you feel tired',
                'Power nap technique: 15-minute rest with eyes closed when energy drops'
              ]
            : nicotineCategory === 'vape'
            ? [
                'Natural alertness: cold water on face + 5 deep breaths when tired',
                'Throat healing: warm honey tea or throat coat tea twice daily',
                'Energy timing: note energy levels hourly to find natural peaks',
                'Movement boost: 2-minute walk or desk stretches instead of vape break'
              ]
            : nicotineCategory === 'chewing'
            ? [
                'Oral health routine: rinse with salt water twice daily this week',
                'Natural stimulation: chew mint gum or eat an apple when feeling sluggish',
                'Jaw muscle relaxation: massage temples and jaw for 2 minutes twice daily',
                'Energy snacks: eat protein-rich snacks (nuts, yogurt) when energy dips'
              ]
            : [
                'Do 5 minutes of box breathing daily: 4 counts in, 4 hold, 4 out, 4 hold',
                'Try natural energy boosters: cold water on face, 10 jumping jacks, or stretches',
                'Power nap technique: 15-minute rest with eyes closed when energy drops',
                'Hydration goal: drink 16oz water immediately when feeling tired'
              ]
        }
      ]
    },
    'stress-recovery': {
      id: 'stress-recovery',
      title: 'Stress Recovery',
      description: nicotineCategory === 'cigarettes'
        ? 'Replace cigarette stress relief with healthy coping mechanisms and breathing techniques.'
        : nicotineCategory === 'vape'
        ? 'Build stress management without vaping and develop new calming rituals.'
        : nicotineCategory === 'chewing'
        ? 'Develop stress relief without dip or nicotine pouches and manage jaw tension.'
        : 'Build healthy stress management habits to replace nicotine as your go-to coping mechanism.',
      icon: 'leaf',
      color: '#06B6D4',
      gradientColors: ['#06B6D4', '#0891B2'],
      duration: '1 week',
      goals: nicotineCategory === 'cigarettes'
        ? [
            'Stress breathing: 5-4-3-2-1 technique (5 things you see, 4 hear, 3 feel, 2 smell, 1 taste)',
            'Replace smoke breaks: step outside for 5 minutes of fresh air without smoking',
            'Quick stress relief: tense and release all muscles for 10 seconds',
            'Workplace coping: keep stress ball or fidget toy at desk'
          ]
        : nicotineCategory === 'vape'
        ? [
            'Anxiety management: progressive muscle relaxation - tense/release each muscle group',
            'Vape ritual replacement: hold warm mug or stress ball when anxious',
            'Flavor comfort: find calming scents (lavender, mint) or herbal teas',
            'Social stress coping: excuse yourself for 2-minute bathroom breathing break'
          ]
        : nicotineCategory === 'chewing'
        ? [
            'Jaw relaxation: place tongue on roof of mouth, breathe deeply for 1 minute when stressed',
            'Stress alternatives: sugar-free gum, celery sticks, or ice chips instead of dip/pouches',
            'Tension release: do shoulder rolls and neck stretches 3 times daily',
            'Work stress: keep healthy snacks (nuts, seeds) at desk instead of tobacco'
          ]
        : [
            'Practice 5-4-3-2-1 grounding: 5 things you see, 4 hear, 3 feel, 2 smell, 1 taste',
            'Quick stress relief: tense all muscles for 10 seconds, then release',  
            'Stress break replacement: step outside for 5 minutes of fresh air',
            'Keep stress tools handy: stress ball, gum, or fidget toy at work/home'
          ],
      benefits: [
        'Reduce stress response by 50-70%',
        'Develop instant calming techniques',
        'Build resilience to triggers',
        'Create healthy coping patterns'
      ],
      timeline: [
        {
          week: 1,
          title: 'Stress Management',
          description: 'Build healthy stress relief without nicotine',
          goals: nicotineCategory === 'cigarettes'
            ? [
                'Stress breathing: 5-4-3-2-1 technique (5 things you see, 4 hear, 3 feel, 2 smell, 1 taste)',
                'Replace smoke breaks: step outside for 5 minutes of fresh air without smoking',
                'Quick stress relief: tense and release all muscles for 10 seconds',
                'Workplace coping: keep stress ball or fidget toy at desk'
              ]
            : nicotineCategory === 'vape'
            ? [
                'Anxiety management: progressive muscle relaxation - tense/release each muscle group',
                'Vape ritual replacement: hold warm mug or stress ball when anxious',
                'Flavor comfort: find calming scents (lavender, mint) or herbal teas',
                'Social stress coping: excuse yourself for 2-minute bathroom breathing break'
              ]
            : nicotineCategory === 'chewing'
            ? [
                'Jaw relaxation: place tongue on roof of mouth, breathe deeply for 1 minute when stressed',
                'Stress alternatives: sugar-free gum, celery sticks, or ice chips instead of dip/pouches',
                'Tension release: do shoulder rolls and neck stretches 3 times daily',
                'Work stress: keep healthy snacks (nuts, seeds) at desk instead of tobacco'
              ]
            : [
                'Practice 5-4-3-2-1 grounding: 5 things you see, 4 hear, 3 feel, 2 smell, 1 taste',
                'Quick stress relief: tense all muscles for 10 seconds, then release',  
                'Stress break replacement: step outside for 5 minutes of fresh air',
                'Keep stress tools handy: stress ball, gum, or fidget toy at work/home'
              ]
        }
      ]
    },
    'habit-replacement': {
      id: 'habit-replacement',
      title: 'Habit Replacement',
      description: nicotineCategory === 'cigarettes'
        ? 'Replace cigarette rituals and smoking moments with satisfying healthy alternatives.'
        : nicotineCategory === 'vape'
        ? 'Replace vaping habits and device rituals with engaging healthy activities.'
        : nicotineCategory === 'chewing'
        ? 'Replace dip and nicotine pouch moments with satisfying healthy alternatives.'
        : 'Replace smoking moments with positive alternatives that satisfy your behavioral patterns.',
      icon: 'refresh',
      color: '#8B5CF6',
      gradientColors: ['#8B5CF6', '#7C3AED'],
      duration: '1 week',
      goals: nicotineCategory === 'cigarettes'
        ? [
            'Morning routine: drink coffee + 5 deep breaths instead of cigarette',
            'After-meal swap: brush teeth or chew mint gum immediately after eating',
            'Car habit: keep water bottle and gum in cupholder for drive cravings',
            'Social replacement: hold drink with both hands during social smoking moments'
          ]
        : nicotineCategory === 'vape'
        ? [
            'Device habit: carry a pen, fidget spinner, or stress ball instead',
            'Cloud alternative: blow bubbles, breathe into cold air, or sip hot tea',
            'Flavor seeking: try new gum flavors, mints, or flavored sparkling water',
            'Pocket ritual: keep small object to fidget with when hands feel empty'
          ]
        : nicotineCategory === 'chewing'
        ? [
            'Work habit: keep sunflower seeds or gum at desk instead of dip/pouches',
            'Sports substitute: chew gum or use mouth guard during physical activity',
            'Focus aid: fidget with pen or stress ball when you need concentration',
            'Oral satisfaction: try toothpicks, straws, or sugar-free hard candy'
          ]
        : [
            'Morning routine swap: drink coffee + 5 deep breaths instead of nicotine',
            'After-meal replacement: brush teeth or chew mint gum immediately',
            'Car/travel habit: keep water bottle and gum handy for cravings',
            'Social situations: hold drink with both hands during smoking moments'
          ],
      benefits: [
        'Replace 80-90% of habit triggers',
        'Build satisfying alternatives',
        'Maintain social connections',
        'Create positive rituals'
      ],
      timeline: [
        {
          week: 1,
          title: 'Habit Transformation',
          description: 'Replace nicotine habits with healthy alternatives',
          goals: nicotineCategory === 'cigarettes'
            ? [
                'Morning routine: drink coffee + 5 deep breaths instead of cigarette',
                'After-meal swap: brush teeth or chew mint gum immediately after eating',
                'Car habit: keep water bottle and gum in cupholder for drive cravings',
                'Social replacement: hold drink with both hands during social smoking moments'
              ]
            : nicotineCategory === 'vape'
            ? [
                'Device habit: carry a pen, fidget spinner, or stress ball instead',
                'Cloud alternative: blow bubbles, breathe into cold air, or sip hot tea',
                'Flavor seeking: try new gum flavors, mints, or flavored sparkling water',
                'Pocket ritual: keep small object to fidget with when hands feel empty'
              ]
            : nicotineCategory === 'chewing'
            ? [
                'Work habit: keep sunflower seeds or gum at desk instead of dip/pouches',
                'Sports substitute: chew gum or use mouth guard during physical activity',
                'Focus aid: fidget with pen or stress ball when you need concentration',
                'Oral satisfaction: try toothpicks, straws, or sugar-free hard candy'
              ]
            : [
                'Morning routine swap: drink coffee + 5 deep breaths instead of nicotine',
                'After-meal replacement: brush teeth or chew mint gum immediately',
                'Car/travel habit: keep water bottle and gum handy for cravings',
                'Social situations: hold drink with both hands during smoking moments'
              ]
        }
      ]
    },
    'confidence-boost': {
      id: 'confidence-boost',
      title: 'Social Confidence',
      description: nicotineCategory === 'cigarettes'
        ? 'Build confidence in social smoking situations and cigarette-free socializing.'
        : nicotineCategory === 'vape'
        ? 'Navigate vaping social circles and build confidence without your device.'
        : nicotineCategory === 'chewing'
        ? 'Build confidence in sports and social settings without dip or nicotine pouches.'
        : 'Navigate social situations and peer pressure with confidence and authenticity.',
      icon: 'people',
      color: '#F59E0B',
      gradientColors: ['#F59E0B', '#D97706'],
      duration: '1 week',
      goals: nicotineCategory === 'cigarettes'
        ? [
            'Social skills: practice 3 conversation starters for smoke-free social events',
            'Bar/party confidence: order special drink + hold with both hands during gatherings',
            'Smoke break conversations: suggest "fresh air walks" instead of smoke breaks',
            'Dating confidence: plan nicotine-free date activities (coffee, walks, movies)'
          ]
        : nicotineCategory === 'vape'
        ? [
            'Device-free socializing: practice introducing yourself without vape in hand',
            'Cloud community alternatives: suggest outdoor activities or coffee meetups',
            'Peer pressure response: practice saying "I\'m taking a break" with confidence',
            'Social identity: identify 3 non-vaping activities you enjoy with friends'
          ]
        : nicotineCategory === 'chewing'
        ? [
            'Sports confidence: practice pre-game routine without dip/pouches (gum, water, visualization)',
            'Team dynamics: suggest group activities that don\'t involve tobacco products',
            'Competition focus: develop 3 mental techniques for performance without nicotine',
            'Identity building: identify strengths and skills beyond tobacco use'
          ]
        : [
            'Practice 3 conversation starters for nicotine-free social events',
            'Confidence technique: order special drink + hold with both hands at gatherings',
            'Peer pressure response: practice saying "I\'m taking a break" confidently',
            'Identity building: identify 3 activities you enjoy that don\'t involve nicotine'
          ],
      benefits: [
        'Build social confidence by 70-80%',
        'Develop peer pressure resistance',
        'Maintain friendships and connections',
        'Create authentic social identity'
      ],
      timeline: [
        {
          week: 1,
          title: 'Social Confidence',
          description: 'Navigate social situations without nicotine',
          goals: nicotineCategory === 'cigarettes'
            ? [
                'Social skills: practice 3 conversation starters for smoke-free social events',
                'Bar/party confidence: order special drink + hold with both hands during gatherings',
                'Smoke break conversations: suggest "fresh air walks" instead of smoke breaks',
                'Dating confidence: plan nicotine-free date activities (coffee, walks, movies)'
              ]
            : nicotineCategory === 'vape'
            ? [
                'Device-free socializing: practice introducing yourself without vape in hand',
                'Cloud community alternatives: suggest outdoor activities or coffee meetups',
                'Peer pressure response: practice saying "I\'m taking a break" with confidence',
                'Social identity: identify 3 non-vaping activities you enjoy with friends'
              ]
            : nicotineCategory === 'chewing'
            ? [
                'Sports confidence: practice pre-game routine without dip/pouches (gum, water, visualization)',
                'Team dynamics: suggest group activities that don\'t involve tobacco products',
                'Competition focus: develop 3 mental techniques for performance without nicotine',
                'Identity building: identify strengths and skills beyond tobacco use'
              ]
            : [
                'Practice 3 conversation starters for nicotine-free social events',
                'Confidence technique: order special drink + hold with both hands at gatherings',
                'Peer pressure response: practice saying "I\'m taking a break" confidently',
                'Identity building: identify 3 activities you enjoy that don\'t involve nicotine'
              ]
        }
      ]
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
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Plan Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={[styles.planIcon, { backgroundColor: planDetail.color }]}>
              <Ionicons name={planDetail.icon as any} size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.planTitle}>{planDetail.title}</Text>
            <Text style={styles.planDuration}>{planDetail.duration}</Text>
            <Text style={styles.planDescription}>{planDetail.description}</Text>
          </View>

          {/* Benefits */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What You'll Achieve</Text>
            {planDetail.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>

          {/* Goals */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Goals</Text>
            {planDetail.goals.map((goal, index) => (
              <View key={index} style={styles.goalItem}>
                <View style={styles.goalBullet} />
                <Text style={styles.goalText}>{goal}</Text>
              </View>
            ))}
          </View>

          {/* Timeline */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Journey</Text>
            {planDetail.timeline.map((week, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineHeader}>
                  <View style={styles.weekBadge}>
                    <Text style={styles.weekText}>Week {week.week}</Text>
                  </View>
                  <Text style={styles.timelineTitle}>{week.title}</Text>
                </View>
                <Text style={styles.timelineDescription}>{week.description}</Text>
                <View style={styles.timelineGoals}>
                  {week.goals.map((goal, goalIndex) => (
                    <Text key={goalIndex} style={styles.timelineGoal}>• {goal}</Text>
                  ))}
                </View>
              </View>
            ))}
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
    backgroundColor: '#0F0F0F',
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
    alignItems: 'center',
    padding: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  planIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  planTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
  },
  planDuration: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  planDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.lg,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  benefitText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  goalBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  goalText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    flex: 1,
  },
  timelineItem: {
    marginBottom: SPACING.xl,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  weekBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    marginRight: SPACING.sm,
  },
  weekText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timelineDescription: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 22,
  },
  timelineGoals: {
    marginLeft: SPACING.md,
  },
  timelineGoal: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  startSection: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  startButton: {
    borderRadius: 12,
    overflow: 'hidden',
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
    fontWeight: '700',
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});

export default PlanDetailScreen; 