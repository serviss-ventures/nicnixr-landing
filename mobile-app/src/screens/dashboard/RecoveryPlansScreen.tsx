import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { COLORS, SPACING } from '../../constants/theme';
import { StackNavigationProp } from '@react-navigation/stack';
import { DashboardStackParamList } from '../../types';

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
      icon: 'shield-checkmark',
      color: '#EF4444',
      gradientColors: ['#EF4444', '#DC2626'],
      duration: '2-4 weeks',
      goals: ['5-4-3-2-1 grounding technique', 'Breathing mastery', 'Trigger identification', 'Emergency coping kit'],
      nicotineSpecific: {
        cigarettes: {
          description: 'Master cigarette cravings with hand-to-mouth habit replacement and smoke break alternatives.',
          goals: ['Replace hand-to-mouth ritual', 'Smoke break alternatives', 'Morning routine replacement', 'Social smoking triggers']
        },
        vape: {
          description: 'Overcome vaping urges with oral fixation alternatives and cloud-chasing replacement activities.',
          goals: ['Oral fixation alternatives', 'Replace vaping rituals', 'Flavor craving management', 'Device habit breaking']
        },
        chewing: {
          description: 'Beat chewing tobacco cravings with mouth satisfaction techniques and oral habit replacement.',
          goals: ['Oral satisfaction alternatives', 'Jaw tension relief', 'Flavor replacement strategies', 'Spitting habit elimination']
        },
        cigars: {
          description: 'Overcome cigar cravings with relaxation alternatives and social ritual replacement.',
          goals: ['Relaxation ritual replacement', 'Social smoking alternatives', 'Celebration habit substitution', 'Taste memory management']
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
      duration: '3-6 weeks',
      goals: ['Sleep optimization', 'Natural energy boosters', 'Focus training', 'Fatigue management'],
      nicotineSpecific: {
        cigarettes: {
          description: 'Rebuild energy without cigarette stimulation and heal lung capacity for better oxygen flow.',
          goals: ['Lung capacity recovery', 'Natural stimulation techniques', 'Exercise tolerance building', 'Oxygen flow optimization']
        },
        vape: {
          description: 'Restore natural energy without nicotine hits and rebuild respiratory health.',
          goals: ['Respiratory recovery', 'Natural alertness training', 'Throat healing support', 'Energy rhythm restoration']
        },
        chewing: {
          description: 'Rebuild energy without nicotine absorption and restore oral health for better nutrition.',
          goals: ['Oral health recovery', 'Nutrient absorption improvement', 'Natural stimulation methods', 'Jaw muscle relaxation']
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
      duration: '4-8 weeks',
      goals: ['Mindfulness practice', 'Stress reframing', 'Relaxation techniques', 'Emotional regulation'],
      nicotineSpecific: {
        cigarettes: {
          description: 'Replace cigarette stress relief with healthy coping mechanisms and breathing techniques.',
          goals: ['Smoking break replacement', 'Deep breathing mastery', 'Stress smoke alternatives', 'Workplace coping strategies']
        },
        vape: {
          description: 'Build stress management without vaping and develop new calming rituals.',
          goals: ['Vaping ritual replacement', 'Anxiety management techniques', 'Flavor comfort alternatives', 'Social stress coping']
        },
        chewing: {
          description: 'Develop stress relief without chewing tobacco and jaw tension management.',
          goals: ['Jaw relaxation techniques', 'Stress chewing alternatives', 'Tension release methods', 'Workplace stress management']
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
      duration: '2-6 weeks',
      goals: ['Trigger mapping', 'Healthy swaps', 'Routine redesign', 'Habit stacking'],
      nicotineSpecific: {
        cigarettes: {
          description: 'Replace cigarette rituals and smoking moments with satisfying healthy alternatives.',
          goals: ['Morning cigarette replacement', 'After-meal alternatives', 'Car smoking substitutes', 'Social smoking alternatives']
        },
        vape: {
          description: 'Replace vaping habits and device rituals with engaging healthy activities.',
          goals: ['Device handling alternatives', 'Cloud-watching substitutes', 'Flavor seeking replacement', 'Pocket habit alternatives']
        },
        chewing: {
          description: 'Replace chewing moments and oral fixation with satisfying healthy options.',
          goals: ['Work chewing alternatives', 'Sports substitutes', 'Concentration aids', 'Oral fixation replacement']
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
      duration: '3-5 weeks',
      goals: ['Conversation skills', 'Peer pressure tactics', 'Self-advocacy', 'Social identity'],
      nicotineSpecific: {
        cigarettes: {
          description: 'Build confidence in social smoking situations and cigarette-free socializing.',
          goals: ['Non-smoking social skills', 'Bar/party confidence', 'Smoke break conversations', 'Dating without cigarettes']
        },
        vape: {
          description: 'Navigate vaping social circles and build confidence without your device.',
          goals: ['Vape-free socializing', 'Cloud community alternatives', 'Device-free confidence', 'Social identity rebuilding']
        },
        chewing: {
          description: 'Build confidence in sports and social settings without chewing tobacco.',
          goals: ['Sports confidence without dip', 'Team social dynamics', 'Competition mindset', 'Masculine identity rebuilding']
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
  
  // Get user's nicotine product from Redux store
  const { user } = useSelector((state: RootState) => state.auth);
  const nicotineCategory = user?.nicotineProduct?.category || 'cigarettes';
  
  // Get personalized plans based on user's nicotine product
  const recoveryPlans: RecoveryPlan[] = getPersonalizedPlans(nicotineCategory);

  const handlePlanPress = (planId: string, planTitle: string) => {
    navigation.navigate('PlanDetail', {
      planId,
      planTitle
    });
  };

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
        <Text style={styles.headerTitle}>Recovery Plans</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Choose Your Recovery Path</Text>
          <Text style={styles.heroSubtitle}>
            Select a focused plan to explore targeted strategies for your {nicotineCategory === 'vape' ? 'vaping' : nicotineCategory} recovery journey. 
            Each plan is personalized with proven techniques specific to your nicotine product.
          </Text>
        </View>

        {/* Plans Section */}
        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>PERSONALIZED FOR {nicotineCategory.toUpperCase()}</Text>
          {recoveryPlans.map(renderPlanCard)}
        </View>
      </ScrollView>
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
});

export default RecoveryPlansScreen; 