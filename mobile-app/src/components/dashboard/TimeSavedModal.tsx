import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';

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
  const daysClean = stats?.daysClean || 0;
  
  // Get the proper unit name based on product
  const getUnitName = (count: number = 1) => {
    // Check both direct category and nested nicotineProduct.category
    const category = userProfile?.category?.toLowerCase() || 
                    userProfile?.nicotineProduct?.category?.toLowerCase() || 
                    'other';
    const isPlural = count !== 1;
    
    // Special handling for pouches saved as 'other' category - map to pouches
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
    // Check both direct category and nested nicotineProduct.category
    const category = userProfile?.category?.toLowerCase() || 
                    userProfile?.nicotineProduct?.category?.toLowerCase() || 
                    'other';
    

    
    switch (category) {
      case 'cigarettes':
      case 'cigarette':
        return {
          minutes: 7,
          activity: 'smoking a cigarette',
          explanation: 'Average time to smoke one cigarette including breaks'
        };
      
      case 'vaping':
      case 'vape':
      case 'e-cigarette':
        return {
          minutes: 60,
          activity: 'vaping session',
          explanation: 'Total time spent vaping per pod/cartridge throughout the day'
        };
      
      case 'pouches':
      case 'nicotine_pouches':
      case 'pouch':
        return {
          minutes: 30,
          activity: 'using a pouch',
          explanation: 'Average time a pouch is kept in (30-45 minutes)'
        };
      
      case 'chewing':
      case 'chew':
      case 'dip':
      case 'chew_dip':
        return {
          minutes: 40,
          activity: 'using a tin',
          explanation: 'Average time spent per tin'
        };
      
      case 'other':
        // Map 'other' to pouches
        return {
          minutes: 30,
          activity: 'using a pouch',
          explanation: 'Average time a pouch is kept in (30-45 minutes)'
        };
      
      default:
        return {
          minutes: 10,
          activity: 'using nicotine',
          explanation: 'Estimated average time per use'
        };
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
  
  // Fun comparisons - always show something meaningful
  const getComparisons = () => {
    const comparisons = [];
    const minutes = timeSaved.totalMinutes;
    
    // Always show these comparisons based on time saved
    if (minutes >= 480) {
      const workDays = Math.floor(minutes / 480);
      comparisons.push({
        icon: 'briefcase',
        text: `${workDays} full work day${workDays > 1 ? 's' : ''}`,
        subtext: 'Time for a vacation!'
      });
    }
    
    if (minutes >= 120) {
      const movies = Math.floor(minutes / 120);
      comparisons.push({
        icon: 'film',
        text: `${movies} movie${movies > 1 ? 's' : ''}`,
        subtext: 'Netflix & actually chill'
      });
    }
    
    if (minutes >= 60) {
      const books = Math.floor(minutes / 60);
      comparisons.push({
        icon: 'book',
        text: `${books} book chapter${books > 1 ? 's' : ''}`,
        subtext: 'Feed your mind'
      });
    }
    
    if (minutes >= 30) {
      const workouts = Math.floor(minutes / 30);
      comparisons.push({
        icon: 'fitness',
        text: `${workouts} workout${workouts > 1 ? 's' : ''}`,
        subtext: 'Get those gains'
      });
    }
    
    if (minutes >= 15) {
      const meditations = Math.floor(minutes / 15);
      comparisons.push({
        icon: 'leaf',
        text: `${meditations} meditation${meditations > 1 ? 's' : ''}`,
        subtext: 'Find your zen'
      });
    }
    
    // For very small amounts of time
    if (minutes < 15 && minutes > 0) {
      comparisons.push({
        icon: 'cafe',
        text: 'A coffee break',
        subtext: 'Small wins matter too'
      });
    }
    
    return comparisons.slice(0, 3); // Show up to 3 comparisons
  };
  
  const comparisons = getComparisons();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'formSheet' : 'pageSheet'}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={['#0A0F1C', '#000000']}
          style={styles.modalGradient}
        >
          <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={onClose}
              >
                <Ionicons name="close" size={24} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Time Saved</Text>
              <View style={styles.headerSpacer} />
            </View>

            <ScrollView 
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
            >
              {/* Hero Section */}
              <View style={styles.heroSection}>
                <LinearGradient
                  colors={['rgba(167, 139, 250, 0.15)', 'rgba(236, 72, 153, 0.1)']}
                  style={styles.heroCard}
                >
                  <View style={styles.heroIconWrapper}>
                    <Ionicons name="time" size={24} color="#A78BFA" />
                  </View>
                  <Text style={styles.heroValue}>{timeSaved.display}</Text>
                  <Text style={styles.heroLabel}>of your life reclaimed</Text>
                </LinearGradient>
              </View>

              {/* Calculation Card */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>CALCULATION</Text>
                
                <View style={styles.calculationCard}>
                  <LinearGradient
                    colors={['rgba(139, 92, 246, 0.08)', 'rgba(167, 139, 250, 0.05)']}
                    style={styles.cardGradient}
                  >
                    <View style={styles.calculationRow}>
                      <View style={styles.calculationItem}>
                        <Text style={styles.calculationValue}>{unitsAvoided % 1 === 0 ? unitsAvoided : unitsAvoided.toFixed(1)}</Text>
                        <Text style={styles.calculationLabel}>{getUnitName(unitsAvoided)} avoided</Text>
                      </View>
                      
                      <View style={styles.calculationOperator}>
                        <Text style={styles.operatorText}>×</Text>
                      </View>
                      
                      <View style={styles.calculationItem}>
                        <Text style={styles.calculationValue}>{timeData.minutes}</Text>
                        <Text style={styles.calculationLabel}>min per {getUnitName(1)}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.calculationDivider} />
                    
                    <View style={styles.calculationResult}>
                      <Text style={styles.resultLabel}>Total Time Saved</Text>
                      <Text style={styles.resultValue}>{Math.round(totalMinutesSaved)} minutes</Text>
                    </View>
                  </LinearGradient>
                </View>
              </View>

              {/* Comparisons - Cleaner Design */}
              {comparisons.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>WHAT YOU COULD DO INSTEAD</Text>
                  
                  <View style={styles.comparisonsList}>
                    {comparisons.map((comparison, index) => (
                      <View key={index} style={styles.comparisonCard}>
                        <LinearGradient
                          colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
                          style={styles.comparisonGradient}
                        >
                          <View style={styles.comparisonIconWrapper}>
                            <Ionicons name={comparison.icon as any} size={20} color="#A78BFA" />
                          </View>
                          <View style={styles.comparisonContent}>
                            <Text style={styles.comparisonValue}>{comparison.text}</Text>
                            <Text style={styles.comparisonDetail}>{comparison.subtext}</Text>
                          </View>
                        </LinearGradient>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Motivational Footer - Minimal */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Every minute saved is a minute for what matters most
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#0A0F1C',
  },
  modalGradient: {
    flex: 1,
  },
  
  // Header - Cleaner design
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 40,
  },
  
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  
  // Hero Section - Matching home screen cards
  heroSection: {
    marginBottom: SPACING.md,
  },
  heroCard: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  heroValue: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -1,
    marginBottom: 2,
  },
  heroLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },
  
  // Sections
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  
  // Calculation Card - Clean design
  calculationCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
  },
  calculationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calculationItem: {
    flex: 1,
    alignItems: 'center',
  },
  calculationValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 2,
  },
  calculationLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
    textAlign: 'center',
  },
  calculationOperator: {
    paddingHorizontal: SPACING.sm,
  },
  operatorText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.3)',
    fontWeight: '600',
  },
  calculationDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: SPACING.sm,
  },
  calculationResult: {
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
    marginBottom: 2,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#A78BFA',
  },
  
  // Breakdown Grid - Matching home screen
  breakdownGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  breakdownCard: {
    flex: 1,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
  },
  breakdownGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  breakdownValue: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 2,
  },
  breakdownLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },
  
  // Comparisons - Cleaner
  comparisonsList: {
    gap: SPACING.sm,
  },
  comparisonCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  comparisonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
  },
  comparisonIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  comparisonContent: {
    flex: 1,
  },
  comparisonValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 1,
  },
  comparisonDetail: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },
  
  // Footer - Minimal
  footer: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '500',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  
  // Remove old styles
  premiumModalHeader: undefined,
  premiumModalBackButton: undefined,
  premiumModalBackGradient: undefined,
  premiumModalTitle: undefined,
  modalHeaderSpacer: undefined,
  iconContainer: undefined,
  iconGradient: undefined,
  heroTime: undefined,
  heroSubtext: undefined,
  calculationSection: undefined,
  calculationGradient: undefined,
  formulaContainer: undefined,
  formulaItem: undefined,
  formulaNumber: undefined,
  formulaResult: undefined,
  formulaLabel: undefined,
  formulaOperator: undefined,
  explanationContainer: undefined,
  explanationText: undefined,
  breakdownSection: undefined,
  breakdownItem: undefined,
  breakdownNumber: undefined,
  breakdownUnit: undefined,
  comparisonsSection: undefined,
  comparisonIcon: undefined,
  comparisonText: undefined,
  comparisonSubtext: undefined,
  motivationalSection: undefined,
  motivationalGradient: undefined,
  motivationalText: undefined,
});

export default TimeSavedModal; 