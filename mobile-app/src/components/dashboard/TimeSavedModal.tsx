import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../constants/theme';
import * as Haptics from 'expo-haptics';

interface TimeSavedModalProps {
  visible: boolean;
  onClose: () => void;
  stats: { 
    daysClean?: number;
    unitsAvoided?: number;
  };
  userProfile: { 
    category?: string; 
    id?: string; 
    brand?: string; 
    packagesPerDay?: number; 
    dailyAmount?: number; 
    tinsPerDay?: number; 
    podsPerDay?: number; 
    nicotineProduct?: {
      category?: string;
      id?: string;
    };
  };
}

const TimeSavedModal: React.FC<TimeSavedModalProps> = ({ 
  visible, 
  onClose, 
  stats,
  userProfile
}) => {
  const [slideAnimation] = useState(new Animated.Value(0));
  const daysClean = stats?.daysClean || 0;
  
  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnimation, {
        toValue: 1,
        tension: 65,
        friction: 10,
        useNativeDriver: true,
      }).start();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      slideAnimation.setValue(0);
    }
  }, [visible]);
  
  // Get the proper unit name based on product
  const getUnitName = (count: number = 1) => {
    const category = userProfile?.category?.toLowerCase() || 
                    userProfile?.nicotineProduct?.category?.toLowerCase() || 
                    'other';
    const isPlural = count !== 1;
    
    if (category === 'other') {
      return isPlural ? 'pouches' : 'pouch';
    }
    
    switch (category) {
      case 'cigarettes':
      case 'cigarette':
        return isPlural ? 'cigarettes' : 'cigarette';
      case 'vaping':
      case 'vape':
      case 'e-cigarette':
        return isPlural ? 'pods' : 'pod';
      case 'pouches':
      case 'nicotine_pouches':
      case 'pouch':
        return isPlural ? 'pouches' : 'pouch';
      case 'chewing':
      case 'chew':
      case 'dip':
      case 'chew_dip':
        return isPlural ? 'tins' : 'tin';
      default:
        return isPlural ? 'units' : 'unit';
    }
  };
  
  // Get product-specific time estimates
  const getTimePerUnit = () => {
    const category = userProfile?.category?.toLowerCase() || 
                    userProfile?.nicotineProduct?.category?.toLowerCase() || 
                    'other';

    switch (category) {
      case 'cigarettes':
      case 'cigarette':
        return { minutes: 7, activity: 'per cigarette' };
      case 'vaping':
      case 'vape':
      case 'e-cigarette':
        return { minutes: 60, activity: 'per pod' };
      case 'pouches':
      case 'nicotine_pouches':
      case 'pouch':
      case 'other':
        return { minutes: 30, activity: 'per pouch' };
      case 'chewing':
      case 'chew':
      case 'dip':
      case 'chew_dip':
        return { minutes: 40, activity: 'per tin' };
      default:
        return { minutes: 10, activity: 'per use' };
    }
  };
  
  const timeData = getTimePerUnit();
  const unitsAvoided = stats?.unitsAvoided || 0;
  const totalMinutesSaved = unitsAvoided * timeData.minutes;
  
  // Convert to readable format
  const formatTimeSaved = (minutes: number) => {
    const days = Math.floor(minutes / (24 * 60));
    const hours = Math.floor((minutes % (24 * 60)) / 60);
    const mins = Math.floor(minutes % 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0 || parts.length === 0) parts.push(`${mins}m`);
    
    return {
      display: parts.join(' '),
      days,
      hours,
      minutes: mins,
      totalMinutes: minutes
    };
  };
  
  const timeSaved = formatTimeSaved(totalMinutesSaved);
  
  // Simple time equivalents
  const getTimeEquivalents = () => {
    const minutes = timeSaved.totalMinutes;
    const equivalents = [];
    
    if (minutes >= 1440) {
      const days = Math.floor(minutes / 1440);
      equivalents.push({ value: days, unit: days === 1 ? 'full day' : 'full days' });
    } else if (minutes >= 480) {
      const workDays = Math.floor(minutes / 480);
      equivalents.push({ value: workDays, unit: workDays === 1 ? 'work day' : 'work days' });
    } else if (minutes >= 120) {
      const movies = Math.floor(minutes / 120);
      equivalents.push({ value: movies, unit: movies === 1 ? 'movie' : 'movies' });
    } else if (minutes >= 60) {
      const books = Math.floor(minutes / 60);
      equivalents.push({ value: books, unit: books === 1 ? 'book chapter' : 'book chapters' });
    } else if (minutes >= 30) {
      const workouts = Math.floor(minutes / 30);
      equivalents.push({ value: workouts, unit: workouts === 1 ? 'workout' : 'workouts' });
    }
    
    return equivalents[0]; // Return the most significant equivalent
  };
  
  const timeEquivalent = getTimeEquivalents();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'formSheet' : 'pageSheet'}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={['#000000', '#0A0F1C']}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Minimal Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <Animated.View 
              style={[
                styles.contentContainer,
                {
                  opacity: slideAnimation,
                  transform: [{
                    translateY: slideAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })
                  }]
                }
              ]}
            >
              <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
                scrollEnabled={false}
              >
                {/* Hero Time */}
                <View style={styles.heroSection}>
                  <Text style={styles.heroLabel}>Time Saved</Text>
                  <Text style={styles.heroAmount}>{timeSaved.display}</Text>
                  <Text style={styles.heroSubtext}>of your life back</Text>
                </View>

                {/* Calculation Breakdown */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>How it's calculated</Text>
                  <View style={styles.calculationCard}>
                    <View style={styles.calcRow}>
                      <View style={styles.calcItem}>
                        <Text style={styles.calcValue}>
                          {Math.round(unitsAvoided).toLocaleString()}
                        </Text>
                        <Text style={styles.calcLabel}>{getUnitName(unitsAvoided)}</Text>
                      </View>
                      <Text style={styles.calcOperator}>×</Text>
                      <View style={styles.calcItem}>
                        <Text style={styles.calcValue}>{timeData.minutes}</Text>
                        <Text style={styles.calcLabel}>min {timeData.activity}</Text>
                      </View>
                    </View>
                    <View style={styles.calcDivider} />
                    <View style={styles.calcTotal}>
                      <Text style={styles.calcTotalLabel}>equals</Text>
                      <Text style={styles.calcTotalValue}>
                        {Math.round(totalMinutesSaved).toLocaleString()} minutes
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Time Equivalent */}
                {timeEquivalent && (
                  <View style={styles.equivalentCard}>
                    <Ionicons name="bulb-outline" size={16} color="#F59E0B" />
                    <Text style={styles.equivalentText}>
                      That's {timeEquivalent.value} {timeEquivalent.unit} of your life back
                    </Text>
                  </View>
                )}

                {/* Life Stats Grid */}
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{daysClean}</Text>
                    <Text style={styles.statLabel}>days clean</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {Math.round(totalMinutesSaved / daysClean) || 0}
                    </Text>
                    <Text style={styles.statLabel}>min/day saved</Text>
                  </View>
                </View>
              </ScrollView>
            </Animated.View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: SPACING.md,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: 0,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl * 1.5,
    paddingTop: SPACING.lg,
  },
  heroLabel: {
    fontSize: FONTS.sm,
    fontWeight: '500',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  heroAmount: {
    fontSize: FONTS['5xl'],
    fontWeight: '300',
    color: COLORS.text,
    letterSpacing: -2,
    marginBottom: SPACING.xs,
  },
  heroSubtext: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },

  // Section
  section: {
    marginBottom: SPACING.xl,
  },
  sectionLabel: {
    fontSize: FONTS.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },

  // Calculation Card
  calculationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  calcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calcItem: {
    flex: 1,
    alignItems: 'center',
  },
  calcValue: {
    fontSize: FONTS.xl,
    fontWeight: '400',
    color: COLORS.text,
    marginBottom: 2,
  },
  calcLabel: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    fontWeight: '400',
  },
  calcOperator: {
    fontSize: FONTS.lg,
    color: COLORS.textMuted,
    fontWeight: '300',
    paddingHorizontal: SPACING.sm,
  },
  calcDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: SPACING.md,
  },
  calcTotal: {
    alignItems: 'center',
  },
  calcTotalLabel: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    fontWeight: '400',
    marginBottom: 4,
  },
  calcTotalValue: {
    fontSize: FONTS.lg,
    fontWeight: '500',
    color: COLORS.primary,
  },

  // Equivalent Card
  equivalentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.15)',
    marginBottom: SPACING.xl,
  },
  equivalentText: {
    fontSize: FONTS.sm,
    color: COLORS.text,
    fontWeight: '400',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  statValue: {
    fontSize: FONTS.lg,
    fontWeight: '400',
    color: COLORS.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    fontWeight: '400',
    textTransform: 'lowercase',
  },
});

export default TimeSavedModal; 