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
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { COLORS, SPACING } from '../../constants/theme';
import { DashboardStackParamList } from '../../types';
import { SafeAreaView as SafeAreaViewCompat } from 'react-native-safe-area-context';

type PlanDetailRouteProp = RouteProp<DashboardStackParamList, 'PlanDetail'>;

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
        ? 'Overcome vaping urges with oral fixation alternatives and cloud-chasing replacement activities.'
        : nicotineCategory === 'chewing'
        ? 'Beat chewing tobacco cravings with mouth satisfaction techniques and oral habit replacement.'
        : 'Master urge management with proven techniques, breathing exercises, and instant coping strategies.',
      icon: 'shield-checkmark',
      color: '#EF4444',
      gradientColors: ['#EF4444', '#DC2626'],
      duration: '2-4 weeks',
      goals: nicotineCategory === 'cigarettes' 
        ? ['Replace hand-to-mouth ritual', 'Smoke break alternatives', 'Morning routine replacement', 'Social smoking triggers']
        : nicotineCategory === 'vape'
        ? ['Oral fixation alternatives', 'Replace vaping rituals', 'Flavor craving management', 'Device habit breaking']
        : nicotineCategory === 'chewing'
        ? ['Oral satisfaction alternatives', 'Jaw tension relief', 'Flavor replacement strategies', 'Spitting habit elimination']
        : ['5-4-3-2-1 grounding technique', 'Breathing mastery', 'Trigger identification', 'Emergency coping kit'],
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
          goals: ['Master 5-4-3-2-1 grounding', 'Identify personal triggers', 'Practice deep breathing']
        },
        {
          week: 2,
          title: 'Technique Mastery',
          description: 'Apply techniques in real situations',
          goals: ['Handle first major craving', 'Build emergency toolkit', 'Practice in trigger situations']
        },
        {
          week: 3,
          title: 'Confidence Building', 
          description: 'Navigate challenging situations with ease',
          goals: ['Master social triggers', 'Develop backup strategies', 'Build success patterns']
        },
        {
          week: 4,
          title: 'Mastery & Maintenance',
          description: 'Automatic responses and long-term success',
          goals: ['Automatic response patterns', 'Mentor others', 'Long-term maintenance plan']
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
        : 'Restore natural energy and mental clarity without nicotine dependence.',
      icon: 'flash',
      color: '#10B981', 
      gradientColors: ['#10B981', '#059669'],
      duration: '3-6 weeks',
      goals: nicotineCategory === 'cigarettes'
        ? ['Lung capacity recovery', 'Natural stimulation techniques', 'Exercise tolerance building', 'Oxygen flow optimization']
        : nicotineCategory === 'vape'
        ? ['Respiratory recovery', 'Natural alertness training', 'Throat healing support', 'Energy rhythm restoration']
        : ['Sleep optimization', 'Natural energy boosters', 'Focus training', 'Fatigue management'],
      benefits: [
        'Increase natural energy by 40-60%',
        'Improve sleep quality and recovery',
        'Enhance mental clarity and focus',
        'Build sustainable energy habits'
      ],
      timeline: [
        {
          week: 1,
          title: 'Energy Assessment',
          description: 'Understand your current energy patterns',
          goals: ['Track energy levels', 'Identify energy drains', 'Optimize sleep hygiene']
        },
        {
          week: 2,
          title: 'Natural Stimulation',
          description: 'Build natural energy sources',
          goals: ['Morning energy routine', 'Natural stimulants', 'Exercise integration']
        },
        {
          week: 3,
          title: 'Rhythm Optimization',
          description: 'Sync with natural energy cycles',
          goals: ['Circadian rhythm optimization', 'Energy peak utilization', 'Recovery periods']
        },
        {
          week: 4,
          title: 'Sustained Energy',
          description: 'Maintain consistent energy levels',
          goals: ['Energy sustainability', 'Stress energy management', 'Long-term vitality']
        }
      ]
    }
    // Add other plans as needed...
  };

  return planDetails[planId] || null;
};

const PlanDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<PlanDetailRouteProp>();
  const { planId, planTitle } = route.params;
  
  const { user } = useSelector((state: RootState) => state.auth);
  const nicotineCategory = user?.nicotineProduct?.category || 'cigarettes';
  
  const planDetail = getPlanDetails(planId, nicotineCategory);

  const handleStartPlan = () => {
    Alert.alert(
      'Start Plan',
      `Ready to begin your ${planTitle} journey? This will set up your personalized plan with daily goals and tracking.`,
      [
        { text: 'Not Yet', style: 'cancel' },
        { 
          text: 'Start Plan', 
          style: 'default',
          onPress: () => {
            // TODO: Implement plan start logic
            Alert.alert('Plan Started!', 'Your recovery plan is now active. Check your dashboard for daily goals.');
            navigation.goBack();
          }
        }
      ]
    );
  };

  if (!planDetail) {
    return (
      <SafeAreaViewCompat style={styles.container} edges={['left', 'right', 'bottom']}>
        <Text style={styles.errorText}>Plan not found</Text>
      </SafeAreaViewCompat>
    );
  }

  return (
    <SafeAreaViewCompat style={styles.container} edges={['left', 'right', 'bottom']}>
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