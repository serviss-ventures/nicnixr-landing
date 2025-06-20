import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { COLORS, SPACING } from '../../constants/theme';
import { calculateScientificRecovery, ScientificRecoveryData } from '../../services/scientificRecoveryService';
import { getGenderSpecificBenefits, GenderSpecificBenefit, getBenefitExplanation } from '../../services/genderSpecificRecoveryService';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  interpolate,
  withTiming,
  withSequence,
  FadeIn,
  FadeOut,
  runOnJS,
} from 'react-native-reanimated';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const nicotinePouchMilestones = [
  { day: 1, title: "The Fog Lifts Soon", description: "Brain fog is common as your dopamine levels begin to reset. This is a sign of healing. Stay hydrated and be patient with yourself.", icon: 'brain', iconSet: 'MaterialCommunityIcons' },
  { day: 3, title: "Peak Withdrawal", description: "Headaches and dizziness are normal as your body clears out the last of the nicotine. Your circulation is already improving.", icon: 'head-alert-outline', iconSet: 'MaterialCommunityIcons' },
  // ... keep other milestones
]

const ProgressScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const stats = useSelector((state: RootState) => state.progress.stats);
  const userProfile = useSelector((state: RootState) => state.progress.userProfile);
  const user = useSelector((state: RootState) => state.auth.user);
  const { achievements } = useSelector((state: RootState) => state.achievement);
  const [selectedTab, setSelectedTab] = useState<'benefits' | 'systems'>('benefits');
  const [expandedBenefit, setExpandedBenefit] = useState<string | null>(null);
  const [genderBenefits, setGenderBenefits] = useState<GenderSpecificBenefit[]>([]);
  const [expandedSystem, setExpandedSystem] = useState<string | null>(null);
  const [recoveryData, setRecoveryData] = useState<ScientificRecoveryData | null>(null);

  const getPhase = (score: number) => {
    if (score < 15) return { name: 'Initial Healing', color: 'rgba(255, 255, 255, 0.6)', icon: 'leaf-outline' as const };
    if (score < 50) return { name: 'System Recovery', color: 'rgba(255, 255, 255, 0.7)', icon: 'shield-checkmark-outline' as const };
    if (score < 90) return { name: 'Risk Reduction', color: 'rgba(255, 255, 255, 0.8)', icon: 'fitness-outline' as const };
    return { name: 'Full Recovery', color: 'rgba(255, 255, 255, 0.95)', icon: 'star-outline' as const };
  };

  const currentPhase = getPhase(recoveryData?.overallRecovery || 0);

  useEffect(() => {
    if (stats) {
      const data = calculateScientificRecovery(stats.daysClean, userProfile);
      setRecoveryData(data);
      
      const productType = userProfile?.category || userProfile?.productType || 'cigarettes';
      let customMilestones: GenderSpecificBenefit[] = [];

      // Custom milestones are no longer needed since we added them to the service
      // The service now has comprehensive early milestones for all product types
      customMilestones = [];
      
      let benefits = getGenderSpecificBenefits(productType, user?.gender, stats);
      const existingIds = new Set(benefits.map(b => b.timeframe));
      const newBenefits = customMilestones.filter(m => !existingIds.has(m.timeframe));
      benefits = [...newBenefits, ...benefits];
      
      setGenderBenefits(benefits);
    }
  }, [stats, userProfile, user]);
  
  if (!recoveryData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9CA3AF" />
      </View>
    );
  }
  
  // Get dynamic phase content based on exact day and product type
  const getDynamicPhaseContent = (daysClean: number, productType: string) => {
    // Special milestones that override phase content
    const specialMilestones = [
      { day: 1, title: "24 Hours Free", icon: "time-outline" },
      { day: 3, title: "Peak Withdrawal Conquered", icon: "trophy-outline" },
      { day: 7, title: "One Week Strong", icon: "shield-checkmark-outline" },
      { day: 14, title: "Two Weeks of Freedom", icon: "rocket-outline" },
      { day: 21, title: "New Habits Forming", icon: "refresh-outline" },
      { day: 30, title: "One Month Milestone", icon: "star-outline" },
      { day: 60, title: "Two Months Strong", icon: "flame-outline" },
      { day: 90, title: "Quarter Year Hero", icon: "medal-outline" },
      { day: 100, title: "Century Mark!", icon: "sparkles-outline" },
      { day: 180, title: "Half Year Champion", icon: "trophy-outline" },
      { day: 365, title: "One Year Legend", icon: "diamond-outline" },
    ];

    const milestone = specialMilestones.find(m => m.day === daysClean);
    if (milestone) {
      return {
        title: milestone.title,
        icon: milestone.icon,
        isSpecial: true
      };
    }

    // Product-specific dynamic content
    const isVape = productType === 'vape';
    const isCigs = productType === 'cigarettes';
    const isDip = productType === 'chew_dip' || productType === 'dip' || productType === 'chewing';
    const isPouches = productType === 'pouches' || productType === 'nicotine_pouches';

    // Days 0-7: Early withdrawal phase (product-specific)
    if (daysClean === 0) {
      return { title: "Day One Begins", icon: "play-outline" };
    } else if (daysClean === 2) {
      if (isVape) return { title: "Vapor-Free Lungs Healing", icon: "cloud-off-outline" };
      if (isDip) return { title: "Mouth Tissues Recovering", icon: "happy-outline" };
      if (isPouches) return { title: "Gums Starting to Heal", icon: "medical-outline" };
      return { title: "48 Hours - Nicotine Clearing", icon: "water-outline" };
    } else if (daysClean === 4) {
      if (isVape) return { title: "Throat Irritation Fading", icon: "mic-outline" };
      if (isDip) return { title: "Taste Returning Fully", icon: "restaurant-outline" };
      if (isPouches) return { title: "Oral pH Normalizing", icon: "water-outline" };
      return { title: "Taste Buds Awakening", icon: "restaurant-outline" };
    } else if (daysClean === 5) {
      if (isVape) return { title: "Chest Tightness Easing", icon: "body-outline" };
      if (isDip) return { title: "Jaw Tension Released", icon: "happy-outline" };
      return { title: "Energy Stabilizing", icon: "flash-outline" };
    } else if (daysClean === 6) {
      if (isVape) return { title: "Deep Breathing Returns", icon: "fitness-outline" };
      return { title: "Sleep Improving", icon: "moon-outline" };
    
    // Days 8-14: Early recovery (more variety)
    } else if (daysClean === 8) {
      if (isVape) return { title: "Lung Capacity Growing", icon: "expand-outline" };
      return { title: "Physical Cravings Fading", icon: "trending-down-outline" };
    } else if (daysClean === 9) {
      return { title: "Mental Fog Lifting", icon: "partly-sunny-outline" };
    } else if (daysClean === 10) {
      if (isDip) return { title: "Gum Line Healing", icon: "happy-outline" };
      return { title: "Double Digits!", icon: "ribbon-outline" };
    } else if (daysClean === 11) {
      return { title: "Focus Sharpening", icon: "telescope-outline" };
    } else if (daysClean === 12) {
      if (isVape) return { title: "Airways Clearing", icon: "wind-outline" };
      return { title: "Natural Highs Returning", icon: "sunny-outline" };
    } else if (daysClean === 13) {
      return { title: "Mood Stabilizing", icon: "analytics-outline" };
    
    // Days 15-21: Habit formation
    } else if (daysClean === 15) {
      if (isCigs) return { title: "Smoker's Cough Gone", icon: "mic-off-outline" };
      return { title: "Two Weeks Plus!", icon: "add-circle-outline" };
    } else if (daysClean === 16) {
      return { title: "New Routines Solid", icon: "git-branch-outline" };
    } else if (daysClean === 17) {
      if (isVape) return { title: "Vape Cough History", icon: "checkmark-done-outline" };
      return { title: "Stress Response Better", icon: "pulse-outline" };
    } else if (daysClean === 18) {
      return { title: "Confidence Building", icon: "trending-up-outline" };
    } else if (daysClean === 19) {
      if (isDip) return { title: "Oral Health Restored", icon: "happy-outline" };
      return { title: "Natural Energy Peak", icon: "battery-charging-outline" };
    } else if (daysClean === 20) {
      return { title: "20 Days Strong", icon: "barbell-outline" };
    
    // Days 22-30: Approaching one month
    } else if (daysClean === 22) {
      return { title: "Three Weeks Plus", icon: "calendar-outline" };
    } else if (daysClean === 23) {
      if (isVape) return { title: "Lung Function 30% Better", icon: "stats-chart-outline" };
      return { title: "Immune Defense Up", icon: "shield-outline" };
    } else if (daysClean === 24) {
      return { title: "Skin Glowing", icon: "sparkles-outline" };
    } else if (daysClean === 25) {
      return { title: "Quarter Month Done", icon: "pie-chart-outline" };
    } else if (daysClean === 26) {
      if (isCigs) return { title: "Circulation Optimal", icon: "pulse-outline" };
      return { title: "Sleep Quality Peak", icon: "bed-outline" };
    } else if (daysClean === 27) {
      return { title: "Mental Clarity Peak", icon: "bulb-outline" };
    } else if (daysClean === 28) {
      return { title: "Four Weeks Tomorrow", icon: "timer-outline" };
    } else if (daysClean === 29) {
      return { title: "Month Within Reach", icon: "flag-outline" };
    
    // Days 31-60: Building momentum (daily variety)
    } else if (daysClean >= 31 && daysClean <= 60) {
      const day31to60 = [
        { d: 31, t: "Month Plus One", i: "add-outline" },
        { d: 32, t: "Momentum Strong", i: "speedometer-outline" },
        { d: 33, t: "33 Days Free", i: "ribbon-outline" },
        { d: 34, t: "5 Weeks Done", i: "checkmark-circle-outline" },
        { d: 35, t: "Neural Pathways New", i: "git-network-outline" },
        { d: 36, t: "Habits Automatic", i: "sync-outline" },
        { d: 37, t: "Energy Abundant", i: "battery-full-outline" },
        { d: 38, t: "Cravings Rare", i: "trending-down-outline" },
        { d: 39, t: "Freedom Expanding", i: "resize-outline" },
        { d: 40, t: "40 Days Strong", i: "medal-outline" },
        { d: 41, t: "Six Weeks Free", i: "calendar-outline" },
        { d: 42, t: "Life's Answer", i: "planet-outline" },
        { d: 43, t: "Progress Steady", i: "trending-up-outline" },
        { d: 44, t: "Mind Clear", i: "eye-outline" },
        { d: 45, t: "Halfway to 90", i: "speedometer-outline" },
        { d: 46, t: "Body Healing", i: "body-outline" },
        { d: 47, t: "Spirit Rising", i: "sunny-outline" },
        { d: 48, t: "Seven Weeks", i: "layers-outline" },
        { d: 49, t: "Square of Seven", i: "grid-outline" },
        { d: 50, t: "Half Century!", i: "star-half-outline" },
        { d: 51, t: "Unstoppable Now", i: "rocket-outline" },
        { d: 52, t: "Power Building", i: "flash-outline" },
        { d: 53, t: "Freedom Sweet", i: "ice-cream-outline" },
        { d: 54, t: "Nine Weeks Soon", i: "time-outline" },
        { d: 55, t: "Double Nickels", i: "car-sport-outline" },
        { d: 56, t: "Eight Weeks Done", i: "checkmark-done-outline" },
        { d: 57, t: "Healing Deep", i: "water-outline" },
        { d: 58, t: "Nearly 60", i: "hourglass-outline" },
        { d: 59, t: "Tomorrow's Two Months", i: "alarm-outline" },
      ];
      
      const dayConfig = day31to60.find(d => d.d === daysClean);
      if (dayConfig) {
        return { title: dayConfig.t, icon: dayConfig.i };
      }
      return { title: `Day ${daysClean} - Growing Stronger`, icon: "trending-up-outline" };
    
    // Days 61-90: Transformation phase
    } else if (daysClean >= 61 && daysClean <= 90) {
      // Every 2-3 days, new message
      const messages = [
        { range: [61, 62], title: "Two Months Plus", icon: "add-circle-outline" },
        { range: [63, 64], title: "Nine Weeks Strong", icon: "fitness-outline" },
        { range: [65, 66], title: "Habits Locked In", icon: "lock-closed-outline" },
        { range: [67, 69], title: "10 Weeks Free", icon: "ribbon-outline" },
        { range: [70, 71], title: "Seventy Days!", icon: "sparkles-outline" },
        { range: [72, 74], title: "Identity Shifting", icon: "person-outline" },
        { range: [75, 76], title: "75% to 100", icon: "pie-chart-outline" },
        { range: [77, 79], title: "11 Weeks Done", icon: "calendar-outline" },
        { range: [80, 81], title: "Eighty Strong", icon: "barbell-outline" },
        { range: [82, 84], title: "Nearly Three Months", icon: "hourglass-outline" },
        { range: [85, 86], title: "Excellence Daily", icon: "star-outline" },
        { range: [87, 89], title: "Quarter Year Soon", icon: "timer-outline" },
      ];
      
      const message = messages.find(m => daysClean >= m.range[0] && daysClean <= m.range[1]);
      if (message) {
        return { title: message.title, icon: message.icon };
      }
      return { title: `Day ${daysClean} - Transforming`, icon: "color-wand-outline" };
    
    // Days 91-180: Long-term recovery
    } else if (daysClean >= 91 && daysClean <= 180) {
      // Weekly variety
      const weekNum = Math.floor((daysClean - 91) / 7) + 13; // Starting from week 13
      const weekMessages = [
        "Three Months Plus",
        "Freedom Expanding",
        "Health Optimizing",
        "Life Transforming",
        "Strength Building",
        "Joy Increasing",
        "Peace Deepening",
        "Success Living",
        "Wisdom Growing",
        "Purpose Clear",
        "Vision Strong",
        "Future Bright",
        "Six Months Near"
      ];
      
      const messageIndex = Math.min(weekNum - 13, weekMessages.length - 1);
      return { 
        title: `Day ${daysClean} - ${weekMessages[messageIndex]}`, 
        icon: daysClean % 7 === 0 ? "star-outline" : "trending-up-outline" 
      };
    
    // Days 181-365: Approaching one year
    } else if (daysClean >= 181 && daysClean <= 365) {
      const monthNum = Math.floor(daysClean / 30);
      const daysInMonth = daysClean % 30;
      
      if (daysInMonth === 0) {
        return { title: `${monthNum} Months Exactly!`, icon: "calendar-outline" };
      } else if (daysInMonth === 15) {
        return { title: `${monthNum}.5 Months Free`, icon: "time-outline" };
      } else if (daysClean === 200) {
        return { title: "200 Days Legend!", icon: "trophy-outline" };
      } else if (daysClean === 250) {
        return { title: "250 Days Strong!", icon: "diamond-outline" };
      } else if (daysClean === 300) {
        return { title: "300 Days Hero!", icon: "shield-outline" };
      } else if (daysClean === 364) {
        return { title: "Tomorrow = 1 Year!", icon: "gift-outline" };
      } else {
        return { title: `Day ${daysClean} - Living Free`, icon: "infinite-outline" };
      }
    
    // Beyond one year
    } else {
      const years = Math.floor(daysClean / 365);
      const remainingDays = daysClean % 365;
      const months = Math.floor(remainingDays / 30);
      
      if (remainingDays === 0) {
        return { title: `${years} Year${years > 1 ? 's' : ''} Exactly!`, icon: "trophy-outline" };
      } else if (months > 0) {
        return { title: `${years}y ${months}m Free`, icon: "infinite-outline" };
      } else {
        return { title: `${years} Year${years > 1 ? 's' : ''} + ${remainingDays} Days`, icon: "add-circle-outline" };
      }
    }
  };

  // Current Phase Card Component - Simplified without memoization
  const CurrentPhaseCard = (() => {
    // Default values to prevent flash
    const phaseContent = getDynamicPhaseContent(stats?.daysClean || 0, userProfile?.category || 'cigarettes');
    const phase = recoveryData?.phase || { 
      name: 'Starting Recovery', 
      description: 'Your journey begins',
      icon: 'flag-outline',
      color: 'rgba(255, 255, 255, 0.5)'
    };
    const overallRecovery = recoveryData?.overallRecovery || 0;
    
    // Calculate gradient based on recovery percentage
    const getProgressGradient = () => {
      if (overallRecovery >= 80) {
        return ['rgba(134, 239, 172, 0.25)', 'rgba(134, 239, 172, 0.15)'];
      } else if (overallRecovery >= 60) {
        return ['rgba(147, 197, 253, 0.2)', 'rgba(147, 197, 253, 0.12)'];
      } else if (overallRecovery >= 40) {
        return ['rgba(251, 191, 36, 0.2)', 'rgba(251, 191, 36, 0.12)'];
      } else {
        const opacity = 0.15 + (overallRecovery / 100) * 0.1;
        return [`rgba(255, 255, 255, ${opacity})`, `rgba(255, 255, 255, ${opacity * 0.6})`];
      }
    };
    
    const progressGradient = getProgressGradient();
    
    // Product-specific "What's Happening" section
    const getWhatsHappening = () => {
      const productType = userProfile?.category || userProfile?.productType || 'cigarettes';
      const daysClean = stats?.daysClean || 0;
      
      switch (productType) {
        case 'vape':
          if (daysClean < 7) return ['Lung irritation reducing', 'Chemical clearance beginning', 'Airways starting to open'];
          if (daysClean < 30) return ['Lung capacity improving', 'EVALI risk eliminated', 'Deep breathing returning'];
          if (daysClean < 90) return ['Full respiratory recovery', 'Exercise endurance building', 'Oxygen efficiency restored'];
          return ['Peak lung performance', 'Athletic capacity maximized', 'Complete respiratory health'];
          
        case 'cigarettes':
          if (daysClean < 7) return ['Carbon monoxide clearing', 'Oxygen levels rising', 'Cilia beginning to regrow'];
          if (daysClean < 30) return ['Lung function improving', 'Circulation restoring', 'Energy levels increasing'];
          if (daysClean < 90) return ['Significant lung recovery', 'Heart disease risk dropping', 'Breathing deeply again'];
          return ['Cancer risk halved', 'Full cardiovascular recovery', 'Optimal respiratory health'];
          
        case 'chewing':
        case 'chew':
        case 'dip':
        case 'chew_dip':
          if (daysClean < 7) return ['Mouth sores healing', 'Gum inflammation reducing', 'Taste returning'];
          if (daysClean < 30) return ['Oral tissues regenerating', 'Cancer risk dropping', 'Jaw tension releasing'];
          if (daysClean < 90) return ['Gum line restored', 'Oral cancer risk plummeting', 'Complete mouth healing'];
          return ['Full oral recovery', 'Cancer risk minimized', 'Dental health optimized'];
          
        case 'pouches':
        case 'nicotine_pouches':
          if (daysClean < 7) return ['Gum irritation fading', 'Oral pH normalizing', 'Nicotine clearing'];
          if (daysClean < 30) return ['Gum health restoring', 'Oral tissues healing', 'Inflammation gone'];
          if (daysClean < 90) return ['Complete gum recovery', 'Oral microbiome balanced', 'Full mouth health'];
          return ['Optimal oral health', 'Long-term damage reversed', 'Perfect gum condition'];
          
        default:
          return ['Body healing', 'Health improving', 'Recovery progressing'];
      }
    };
    
    const whatsHappening = getWhatsHappening();
    
    return (
      <View style={[styles.phaseCard, { margin: SPACING.lg }]}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
          style={styles.phaseGradient}
        >
          <View style={styles.phaseHeader}>
            <View style={styles.phaseTopRow}>
              <View style={styles.phaseInfo}>
                <View style={styles.phaseLabelRow}>
                  <View style={[styles.phaseIconWrapper, { backgroundColor: `${phase.color}15` }]}>
                    <Ionicons name={phase.icon as any} size={16} color={phase.color} />
                  </View>
                  <Text style={styles.phaseLabel}>{phase.name}</Text>
                </View>
                <Text style={styles.phaseName}>{phaseContent.title}</Text>
                <Text style={styles.phaseTimeframe}>{phaseContent.subtitle}</Text>
              </View>
              <View style={styles.phaseScoreContainer}>
                <Text style={styles.phaseScore}>{Math.round(overallRecovery)}</Text>
                <Text style={styles.phaseScoreUnit}>%</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.phaseProgressContainer}>
            <View style={styles.phaseProgressBar}>
              <Animated.View 
                style={[
                  styles.phaseProgressFill, 
                  { width: `${overallRecovery}%` }
                ]} 
              >
                <LinearGradient
                  colors={progressGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFillObject}
                />
              </Animated.View>
            </View>
            <Text style={styles.phaseProgressText}>
              {overallRecovery < 100 
                ? `${100 - Math.round(overallRecovery)}% remaining in your recovery journey`
                : 'You've achieved complete recovery!'}
            </Text>
          </View>
          
          <Text style={styles.phaseDescription}>{phaseContent.description}</Text>
          
          <View style={styles.phaseProcesses}>
            <Text style={styles.phaseProcessesTitle}>What's happening now:</Text>
            {whatsHappening.map((process, index) => (
              <View key={index} style={styles.phaseProcess}>
                <View style={[styles.phaseProcessDot, { backgroundColor: phase.color }]} />
                <Text style={styles.phaseProcessText}>{process}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </View>
    );
  })();
  
  // Tab Selector Component
  const TabSelector = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'benefits' && styles.tabActive]}
        onPress={() => setSelectedTab('benefits')}
      >
        <View style={styles.tabContent}>
          <Ionicons 
            name="trending-up" 
            size={16} 
            color={selectedTab === 'benefits' ? 'rgba(147, 197, 253, 0.9)' : COLORS.textSecondary} 
          />
          <Text style={[styles.tabText, selectedTab === 'benefits' && styles.tabTextActive]}>
            Recovery Timeline
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'systems' && styles.tabActive]}
        onPress={() => setSelectedTab('systems')}
      >
        <View style={styles.tabContent}>
          <Ionicons 
            name="body" 
            size={16} 
            color={selectedTab === 'systems' ? 'rgba(134, 239, 172, 0.9)' : COLORS.textSecondary} 
          />
          <Text style={[styles.tabText, selectedTab === 'systems' && styles.tabTextActive]}>
            Body Systems
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
  
  // Benefit Card Component
  const BenefitCard = ({ benefit }: { benefit: GenderSpecificBenefit }) => {
    const isExpanded = expandedBenefit === benefit.id;
    const rotation = useSharedValue(0);
    const height = useSharedValue(0);
    const opacity = useSharedValue(0);
    
    React.useEffect(() => {
      rotation.value = withSpring(isExpanded ? 180 : 0, {
        damping: 15,
        stiffness: 150,
      });
      
      if (isExpanded) {
        height.value = withSpring(150, {
          damping: 15,
          stiffness: 100,
        });
        opacity.value = withTiming(1, { duration: 250 });
      } else {
        opacity.value = withTiming(0, { duration: 150 });
        height.value = withTiming(0, { duration: 200 });
      }
    }, [isExpanded]);
    
    const animatedIconStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotation.value}deg` }],
    }));
    
    const animatedContentStyle = useAnimatedStyle(() => ({
      height: height.value,
      opacity: opacity.value,
      marginTop: interpolate(height.value, [0, 150], [0, 12]),
      overflow: 'hidden',
    }));
    
    return (
      <TouchableOpacity 
        style={[
          styles.benefitCard,
          benefit.achieved && styles.benefitCardAchieved,
          !benefit.achieved && styles.benefitCardLocked,
        ]}
        onPress={() => benefit.achieved && setExpandedBenefit(isExpanded ? null : benefit.id)}
        activeOpacity={benefit.achieved ? 0.7 : 1}
        disabled={!benefit.achieved}
      >
        {benefit.achieved && (
          <LinearGradient
            colors={[
              'rgba(134, 239, 172, 0.03)', // Soft green tint
              'rgba(134, 239, 172, 0.01)'
            ]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}
        <View style={styles.benefitHeader}>
          <View style={[
            styles.benefitIcon,
            { 
              backgroundColor: benefit.achieved 
                ? benefit.daysRequired <= 7 
                  ? 'rgba(147, 197, 253, 0.08)' // Early recovery - soft blue
                  : benefit.daysRequired <= 30
                  ? 'rgba(134, 239, 172, 0.08)' // Mid recovery - soft green  
                  : benefit.daysRequired <= 90
                  ? 'rgba(251, 191, 36, 0.08)' // Later recovery - soft amber
                  : 'rgba(192, 132, 252, 0.08)' // Long term - soft purple
                : 'rgba(255, 255, 255, 0.03)',
              borderColor: benefit.achieved
                ? benefit.daysRequired <= 7
                  ? 'rgba(147, 197, 253, 0.15)'
                  : benefit.daysRequired <= 30
                  ? 'rgba(134, 239, 172, 0.15)'
                  : benefit.daysRequired <= 90
                  ? 'rgba(251, 191, 36, 0.15)'
                  : 'rgba(192, 132, 252, 0.15)'
                : 'rgba(255, 255, 255, 0.06)'
            },
            !benefit.achieved && styles.benefitIconLocked,
          ]}>
            <Ionicons 
              name={benefit.icon as any}
              size={22} 
              color={
                benefit.achieved 
                  ? benefit.daysRequired <= 7
                    ? 'rgba(147, 197, 253, 0.8)' // Soft blue
                    : benefit.daysRequired <= 30
                    ? 'rgba(134, 239, 172, 0.8)' // Soft green
                    : benefit.daysRequired <= 90
                    ? 'rgba(251, 191, 36, 0.8)' // Soft amber
                    : 'rgba(192, 132, 252, 0.8)' // Soft purple
                  : COLORS.textSecondary
              } 
            />
          </View>
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTimeframe}>{benefit.timeframe}</Text>
            <Text 
              style={[
                styles.benefitTitle,
                !benefit.achieved && styles.benefitTitleLocked,
              ]}
              numberOfLines={2}
            >
              {benefit.title}
            </Text>
            {benefit.category !== 'shared' && (
              <View style={[
                styles.benefitCategoryBadge, 
                benefit.achieved && { 
                  backgroundColor: benefit.category === 'male' 
                    ? 'rgba(147, 197, 253, 0.15)' // Soft blue for male
                    : 'rgba(244, 114, 182, 0.15)', // Soft pink for female
                  borderWidth: 1,
                  borderColor: benefit.category === 'male'
                    ? 'rgba(147, 197, 253, 0.3)'
                    : 'rgba(244, 114, 182, 0.3)'
                }
              ]}>
                <Ionicons 
                  name={benefit.category === 'male' ? 'male' : 'female'} 
                  size={10} 
                  color={
                    benefit.achieved 
                      ? (benefit.category === 'male' ? 'rgba(147, 197, 253, 0.9)' : 'rgba(244, 114, 182, 0.9)')
                      : '#9CA3AF'
                  } 
                />
                <Text style={[
                  styles.benefitCategoryText, 
                  benefit.achieved && { 
                    color: benefit.category === 'male' 
                      ? 'rgba(147, 197, 253, 0.9)' 
                      : 'rgba(244, 114, 182, 0.9)' 
                  }
                ]}>
                  {benefit.category === 'male' ? 'Male' : 'Female'}
                </Text>
              </View>
            )}
          </View>
          {benefit.achieved && (
            <Animated.View style={[animatedIconStyle, styles.benefitChevron]}>
              <Ionicons 
                name="chevron-down" 
                size={18} 
                color={COLORS.textSecondary} 
              />
            </Animated.View>
          )}
        </View>
        
        {isExpanded && benefit.achieved && (
          <Animated.View style={animatedContentStyle}>
            <View style={styles.benefitDetails}>
              <Text style={styles.benefitDescription}>{benefit.description}</Text>
              <Text style={styles.benefitScientific}>{getBenefitExplanation(benefit, stats)}</Text>
              <View style={styles.benefitAchievedBadge}>
                <View style={[styles.achievedIconWrapper, { backgroundColor: 'rgba(134, 239, 172, 0.15)' }]}>
                  <Ionicons name="checkmark-circle" size={16} color="rgba(134, 239, 172, 0.8)" />
                </View>
                <Text style={[styles.benefitAchievedText, { color: 'rgba(134, 239, 172, 0.9)' }]}>Achieved</Text>
              </View>
            </View>
          </Animated.View>
        )}
      </TouchableOpacity>
    );
  };
  
  // System Recovery Component
  const SystemRecovery = () => {
    // Define the system interface
    interface SystemData {
      name: string;
      percentage: number;
      icon: string;
      color: string;
    }
    
    const getSystemDescription = (systemName: string): string => {
      switch (systemName) {
        case 'Neurological Recovery':
          return 'Your brain\'s reward system is healing from nicotine dependence. This includes dopamine receptors, neural pathways, and overall brain chemistry.';
        case 'Cardiovascular Health':
          return 'Your heart and blood vessels are recovering. Blood pressure normalizes, circulation improves, and heart disease risk decreases.';
        case 'Respiratory Function':
          return 'Your lungs are clearing out toxins and healing. Breathing becomes easier, lung capacity increases, and cilia regrow.';
        case 'Chemical Detox':
          return 'Your body is eliminating nicotine and other harmful chemicals. Liver function improves and toxins are flushed from your system.';
        case 'Gum Health':
          return 'Your gums and oral tissues are healing from nicotine damage. Blood flow improves, inflammation reduces, and tissue regenerates.';
        case 'Immune System':
          return 'Your immune system is strengthening. White blood cell counts normalize and your body becomes better at fighting infections.';
        case 'Energy & Metabolism':
          return 'Your energy production and metabolism are stabilizing. Fatigue decreases as your cells become more efficient without nicotine.';
        case 'Digestive Health':
          return 'Your digestive system is healing. Gut bacteria rebalance, nutrient absorption improves, and digestive discomfort decreases.';
        default:
          return '';
      }
    };
    
    const SystemCard = ({ system, index }: { system: SystemData; index: number }) => {
      const isExpanded = expandedSystem === system.name;
      const rotation = useSharedValue(0);
      const height = useSharedValue(0);
      const opacity = useSharedValue(0);
      
      React.useEffect(() => {
        rotation.value = withSpring(isExpanded ? 180 : 0, {
          damping: 15,
          stiffness: 150,
        });
        
        if (isExpanded) {
          // Increase height to accommodate full description text
          height.value = withSpring(120, {
            damping: 15,
            stiffness: 100,
          });
          opacity.value = withTiming(1, { duration: 250 });
        } else {
          opacity.value = withTiming(0, { duration: 150 });
          height.value = withTiming(0, { duration: 200 });
        }
      }, [isExpanded]);
      
      const animatedIconStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
      }));
      
      const animatedContentStyle = useAnimatedStyle(() => ({
        height: height.value,
        opacity: opacity.value,
        marginTop: interpolate(height.value, [0, 120], [0, 8]),
        overflow: 'hidden',
      }));
      
      const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
      }));
      
      // Calculate gradient opacity based on percentage
      const getSystemGradient = () => {
        if (system.percentage >= 80) {
          // High recovery - soft green
          return [
            'rgba(134, 239, 172, 0.2)',
            'rgba(134, 239, 172, 0.1)'
          ];
        } else if (system.percentage >= 60) {
          // Good recovery - soft blue
          return [
            'rgba(147, 197, 253, 0.15)',
            'rgba(147, 197, 253, 0.08)'
          ];
        } else if (system.percentage >= 40) {
          // Moderate recovery - soft amber
          return [
            'rgba(251, 191, 36, 0.15)',
            'rgba(251, 191, 36, 0.08)'
          ];
        } else {
          // Early recovery - subtle white
          const baseOpacity = 0.15 + (system.percentage / 100) * 0.1;
          return [
            `rgba(255, 255, 255, ${baseOpacity})`,
            `rgba(255, 255, 255, ${baseOpacity * 0.7})`
          ];
        }
      };
      
      // Get system icon color based on percentage
      const getSystemIconColor = () => {
        if (system.percentage >= 80) return 'rgba(134, 239, 172, 0.8)'; // Soft green
        if (system.percentage >= 60) return 'rgba(147, 197, 253, 0.8)'; // Soft blue
        if (system.percentage >= 40) return 'rgba(251, 191, 36, 0.8)'; // Soft amber
        return `rgba(255, 255, 255, ${0.6 + (system.percentage / 100) * 0.3})`;
      };
      
      return (
        <TouchableOpacity 
          style={styles.systemCard}
          onPress={() => setExpandedSystem(expandedSystem === system.name ? null : system.name)}
          activeOpacity={0.7}
        >
          <View style={styles.systemHeader}>
            <View style={styles.systemInfo}>
              <View style={[styles.systemIconWrapper, { backgroundColor: `rgba(255, 255, 255, ${0.03 + (system.percentage / 100) * 0.05})` }]}>
                <Ionicons name={system.icon as any} size={22} color={getSystemIconColor()} />
              </View>
              <Text style={styles.systemName}>{system.name}</Text>
            </View>
            <View style={styles.systemRight}>
              <Text style={[styles.systemPercentage, { color: getSystemIconColor() }]}>
                {system.percentage}%
              </Text>
              <Animated.View style={animatedStyle}>
                <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
              </Animated.View>
            </View>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${system.percentage}%` }
                ]} 
              >
                <LinearGradient
                  colors={getSystemGradient()}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFillObject}
                />
              </View>
            </View>
          </View>
          
          <Animated.View style={animatedContentStyle}>
            <View style={styles.systemDetails}>
              <Text style={styles.systemDescription}>
                {getSystemDescription(system.name)}
              </Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
      );
    };
    
    const getProductSystems = () => {
      if (!recoveryData || !recoveryData.metrics) {
        // Return default empty systems if no data
        return [
          { name: 'Neurological Recovery', percentage: 0, icon: 'bulb-outline', color: '#9CA3AF' },
          { name: 'Cardiovascular Health', percentage: 0, icon: 'heart-outline', color: '#9CA3AF' },
        ];
      }
      
      const baseNeurological = {
        name: 'Neurological Recovery',
        percentage: Math.round(recoveryData.neurologicalRecovery || 0),
        icon: 'bulb-outline',
        color: '#9CA3AF',
      };
      
      const baseCardiovascular = {
        name: 'Cardiovascular Health',
        percentage: Math.round(recoveryData.metrics.cardiovascular_function?.value || 0),
        icon: 'heart-outline',
        color: '#9CA3AF',
      };
      
      const productType = userProfile?.category || userProfile?.productType || 'cigarettes';
      
      switch (productType) {
        case 'cigarettes':
          return [
            baseNeurological,
            baseCardiovascular,
            {
              name: 'Respiratory Function',
              percentage: Math.round(recoveryData.metrics.respiratory_function?.value || 0),
              icon: 'cloud-outline',
              color: '#9CA3AF',
            },
            {
              name: 'Chemical Detox',
              percentage: Math.round(recoveryData.metrics.metabolic_function?.value || 0),
              icon: 'water-outline',
              color: '#9CA3AF',
            },
            {
              name: 'Immune System',
              percentage: Math.round(recoveryData.metrics.inflammatory_markers?.value || 0),
              icon: 'shield-checkmark-outline',
              color: '#9CA3AF',
            },
          ];
          
        case 'vape':
          return [
            baseNeurological,
            baseCardiovascular,
            {
              name: 'Respiratory Function',
              percentage: Math.round(recoveryData.metrics.respiratory_function?.value || 0),
              icon: 'cloud-outline',
              color: '#9CA3AF',
            },
            {
              name: 'Chemical Detox',
              percentage: Math.round(recoveryData.metrics.metabolic_function?.value || 0),
              icon: 'water-outline',
              color: '#9CA3AF',
            },
            {
              name: 'Energy & Metabolism',
              percentage: Math.round(recoveryData.metrics.metabolic_function?.value || 0),
              icon: 'flash-outline',
              color: '#9CA3AF',
            },
          ];
          
        case 'chewing':
        case 'dip':
        case 'chew_dip':
          return [
            baseNeurological,
            baseCardiovascular,
            {
              name: 'Gum Health',
              percentage: Math.round(recoveryData.metrics.oral_health?.value || 0),
              icon: 'medical-outline',
              color: '#9CA3AF',
            },
            {
              name: 'Digestive Health',
              percentage: Math.round(recoveryData.metrics.metabolic_function?.value || 0),
              icon: 'nutrition-outline',
              color: '#9CA3AF',
            },
            {
              name: 'Jaw & TMJ Recovery',
              percentage: Math.round(recoveryData.metrics.tmj_recovery?.value || 0),
              icon: 'body-outline',
              color: '#9CA3AF',
            },
          ];
          
        case 'pouches':
        case 'nicotine_pouches':
          return [
            baseNeurological,
            baseCardiovascular,
            {
              name: 'Gum Health',
              percentage: Math.round(recoveryData.metrics.oral_health?.value || 0),
              icon: 'medical-outline',
              color: '#9CA3AF',
            },
            {
              name: 'Energy & Metabolism',
              percentage: Math.round(recoveryData.metrics.metabolic_function?.value || 0),
              icon: 'flash-outline',
              color: '#9CA3AF',
            },
          ];
          
        default:
          // Default to basic systems if unknown product type
          return [baseNeurological, baseCardiovascular];
      }
    };
    
    const systems = getProductSystems();
    
    return (
      <View style={styles.systemsContainer}>
        {systems.map((system, index) => (
          <SystemCard key={index} system={system} index={index} />
        ))}
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerIconWrapper}>
                <Ionicons name="pulse-outline" size={24} color="rgba(192, 132, 252, 0.8)" />
              </View>
              <Text style={styles.title}>Recovery Progress</Text>
            </View>
            {user?.gender !== 'other' && (
              <View style={styles.personalizedBadge}>
                <Ionicons name="person-circle-outline" size={12} color="rgba(192, 132, 252, 0.6)" />
                <Text style={styles.personalizedText}>Personalized for you</Text>
              </View>
            )}
          </View>
          
          {/* Current Phase Card */}
          {CurrentPhaseCard}
          
          {/* Tab Selector */}
          <TabSelector />
          
          {/* Content based on selected tab */}
          {selectedTab === 'benefits' ? (
            <View style={styles.contentContainer}>
              <View style={styles.sectionHeaderWithIcon}>
                <View style={styles.sectionIconWrapper}>
                  <Ionicons name="trending-up" size={20} color="rgba(147, 197, 253, 0.7)" />
                </View>
                <View style={styles.sectionTextWrapper}>
                  <Text style={styles.sectionTitle}>Recovery Timeline</Text>
                  <Text style={styles.sectionSubtitle}>Key health milestones on your journey.</Text>
                </View>
              </View>
              {genderBenefits.map((benefit) => (
                <BenefitCard key={benefit.id} benefit={benefit} />
              ))}
            </View>
          ) : (
            <View style={styles.contentContainer}>
              <View style={styles.sectionHeaderWithIcon}>
                <View style={[styles.sectionIconWrapper, { backgroundColor: 'rgba(134, 239, 172, 0.08)' }]}>
                  <Ionicons name="body" size={20} color="rgba(134, 239, 172, 0.7)" />
                </View>
                <View style={styles.sectionTextWrapper}>
                  <Text style={styles.sectionTitle}>Body System Recovery</Text>
                  <Text style={styles.sectionSubtitle}>How your systems are healing over time.</Text>
                </View>
              </View>
              <SystemRecovery />
            </View>
          )}
          
          {/* Full Recovery Celebration */}
          {recoveryData.overallRecovery >= 100 && (
            <View style={styles.fullRecoveryContainer}>
              <LinearGradient
                colors={[
                  'rgba(134, 239, 172, 0.08)',
                  'rgba(134, 239, 172, 0.03)',
                  'transparent'
                ]}
                style={styles.fullRecoveryGradient}
              >
                <View style={styles.fullRecoveryContent}>
                  <View style={styles.fullRecoveryIconWrapper}>
                    <Ionicons name="trophy" size={32} color="rgba(250, 204, 21, 0.8)" />
                  </View>
                  <Text style={styles.fullRecoveryTitle}>Full Recovery Achieved</Text>
                  <Text style={styles.fullRecoverySubtitle}>
                    Your body has completed its healing journey
                  </Text>
                  <View style={styles.fullRecoveryStats}>
                    <View style={styles.fullRecoveryStat}>
                      <Text style={styles.fullRecoveryStatValue}>{stats.daysClean}</Text>
                      <Text style={styles.fullRecoveryStatLabel}>Days</Text>
                    </View>
                    <View style={styles.fullRecoveryDivider} />
                    <View style={styles.fullRecoveryStat}>
                      <Text style={styles.fullRecoveryStatValue}>100%</Text>
                      <Text style={styles.fullRecoveryStatLabel}>Healed</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>
          )}
          
          {/* Scientific Note */}
          <View style={styles.noteCard}>
            <View style={[styles.noteIcon, { backgroundColor: 'rgba(251, 191, 36, 0.08)' }]}>
              <Ionicons name="information-circle-outline" size={18} color="rgba(251, 191, 36, 0.7)" />
            </View>
            <Text style={styles.noteText}>{recoveryData.scientificNote}</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0F1C',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl * 3,
  },
  
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  headerIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(192, 132, 252, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 0,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.15)',
  },
  title: {
    fontSize: 22,
    fontWeight: '500',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  personalizedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xs,
    gap: 4,
  },
  personalizedText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  
  phaseCard: {
    margin: SPACING.lg,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  phaseGradient: {
    padding: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  phaseHeader: {
    marginBottom: SPACING.lg,
  },
  phaseTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    overflow: 'visible',
  },
  phaseInfo: {
    flex: 1,
  },
  phaseLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  phaseIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  phaseLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginLeft: 0,
  },
  phaseName: {
    fontSize: 20,
    fontWeight: '400',
    color: COLORS.text,
    marginBottom: 4,
  },
  phaseTimeframe: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '300',
  },
  phaseScoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    position: 'relative',
    overflow: 'visible',
  },
  phaseScore: {
    fontSize: 36,
    fontWeight: '300',
    color: COLORS.text,
  },
  phaseScoreUnit: {
    fontSize: 18,
    fontWeight: '300',
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  phaseProgressContainer: {
    marginBottom: SPACING.lg,
  },
  phaseProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  phaseProgressFill: {
    height: '100%',
  },
  phaseProgressGradient: {
    flex: 1,
  },
  phaseProgressText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '300',
  },
  phaseDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.lg,
    fontWeight: '300',
  },
  phaseProcesses: {
    marginTop: SPACING.sm,
  },
  phaseProcessesTitle: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  phaseProcess: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  phaseProcessDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginTop: 7,
    marginRight: SPACING.sm,
  },
  phaseProcessText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 18,
    fontWeight: '300',
  },
  
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    padding: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '400',
  },
  
  contentContainer: {
    paddingHorizontal: SPACING.lg,
  },
  sectionHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
    paddingHorizontal: 0,
  },
  sectionIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    flexShrink: 0,
  },
  sectionTextWrapper: {
    flex: 1,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: COLORS.text,
    marginBottom: 4,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 0,
    fontWeight: '300',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  benefitCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  benefitCardAchieved: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'transparent',
  },
  benefitCardLocked: {
    opacity: 0.5,
  },
  benefitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  benefitIconLocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  benefitContent: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  benefitTimeframe: {
    fontSize: 10,
    fontWeight: '400',
    color: '#9CA3AF',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.text,
    lineHeight: 18,
  },
  benefitTitleLocked: {
    color: COLORS.textSecondary,
  },
  benefitChevron: {
    padding: 4,
  },
  benefitDetails: {
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  benefitDescription: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
    marginBottom: SPACING.sm,
    fontWeight: '300',
  },
  benefitScientific: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
    fontStyle: 'italic',
    fontWeight: '300',
  },
  benefitAchievedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    gap: 6,
  },
  achievedIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(134, 239, 172, 0.2)',
  },
  benefitAchievedText: {
    fontSize: 12,
    fontWeight: '400',
  },
  benefitCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginTop: 4,
    gap: 4,
  },
  benefitCategoryText: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '400',
  },
  
  systemsContainer: {
    gap: SPACING.sm,
  },
  systemCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  systemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  systemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 0,
  },
  systemIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  systemName: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.text,
    marginLeft: 0,
  },
  systemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  systemPercentage: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.95)',
  },
  progressBarContainer: {
    marginTop: SPACING.md,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 2,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  systemDetails: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  systemDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
    fontWeight: '300',
  },
  
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  noteIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 17,
    fontWeight: '300',
  },
  phaseCompleteBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(134, 239, 172, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(134, 239, 172, 0.2)',
  },
  
  // Full Recovery Styles
  fullRecoveryContainer: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    borderRadius: 16,
    overflow: 'hidden',
  },
  fullRecoveryGradient: {
    borderWidth: 0.5,
    borderColor: 'rgba(134, 239, 172, 0.1)',
    borderRadius: 20,
  },
  fullRecoveryContent: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  fullRecoveryIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(250, 204, 21, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.2)',
  },
  fullRecoveryTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: 'rgba(134, 239, 172, 0.95)',
    marginBottom: SPACING.xs,
    letterSpacing: -0.3,
  },
  fullRecoverySubtitle: {
    fontSize: 14,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: SPACING.xl,
  },
  fullRecoveryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xl,
  },
  fullRecoveryStat: {
    alignItems: 'center',
  },
  fullRecoveryStatValue: {
    fontSize: 28,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: -0.5,
  },
  fullRecoveryStatLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fullRecoveryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default ProgressScreen; 