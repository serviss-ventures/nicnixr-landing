import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
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
  };
}

const TimeSavedModal: React.FC<TimeSavedModalProps> = ({ 
  visible, 
  onClose, 
  stats,
  userProfile
}) => {
  const daysClean = stats?.daysClean || 0;
  
  // Get product-specific time estimates
  const getTimePerUnit = () => {
    const category = userProfile?.category?.toLowerCase() || 'other';
    
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
          minutes: 10,
          activity: 'vaping session',
          explanation: 'Average time spent per vaping session throughout the day'
        };
      
      case 'pouches':
      case 'nicotine_pouches':
      case 'pouch':
      case 'other': // ZYN pouches are stored as 'other'
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
          minutes: 20,
          activity: 'using dip/chew',
          explanation: 'Average time per dip/chew session'
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
  
  // Fun comparisons
  const getComparisons = () => {
    const comparisons = [];
    
    if (timeSaved.totalMinutes >= 120) {
      const movies = Math.floor(timeSaved.totalMinutes / 120);
      comparisons.push({
        icon: 'film',
        text: `${movies} movie${movies > 1 ? 's' : ''}`,
        subtext: 'Average movie length: 2 hours'
      });
    }
    
    if (timeSaved.totalMinutes >= 30) {
      const workouts = Math.floor(timeSaved.totalMinutes / 30);
      comparisons.push({
        icon: 'fitness',
        text: `${workouts} workout${workouts > 1 ? 's' : ''}`,
        subtext: '30-minute exercise sessions'
      });
    }
    
    if (timeSaved.totalMinutes >= 480) {
      const workDays = Math.floor(timeSaved.totalMinutes / 480);
      comparisons.push({
        icon: 'briefcase',
        text: `${workDays} work day${workDays > 1 ? 's' : ''}`,
        subtext: '8-hour work days'
      });
    }
    
    if (timeSaved.totalMinutes >= 60) {
      const books = Math.floor(timeSaved.totalMinutes / 60);
      comparisons.push({
        icon: 'book',
        text: `${books} chapter${books > 1 ? 's' : ''}`,
        subtext: 'Average reading time per chapter'
      });
    }
    
    return comparisons.slice(0, 2); // Show max 2 comparisons to save space
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
          colors={['#000000', '#0A0F1C', '#0F172A']}
          style={styles.modalGradient}
        >
          <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            {/* Header */}
            <View style={styles.premiumModalHeader}>
              <TouchableOpacity 
                style={styles.premiumModalBackButton}
                onPress={onClose}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                  style={styles.premiumModalBackGradient}
                >
                  <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
              <Text style={styles.premiumModalTitle}>Time Saved</Text>
              <View style={styles.modalHeaderSpacer} />
            </View>

            <View style={styles.content}>
              {/* Hero Section */}
              <View style={styles.heroSection}>
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={['rgba(6, 182, 212, 0.2)', 'rgba(59, 130, 246, 0.2)']}
                    style={styles.iconGradient}
                  >
                    <Ionicons name="time" size={28} color="#06B6D4" />
                  </LinearGradient>
                </View>
                
                <Text style={styles.heroTime}>{timeSaved.display}</Text>
                <Text style={styles.heroSubtext}>of your life reclaimed</Text>
              </View>

              {/* Calculation Breakdown */}
              <View style={styles.calculationSection}>
                <Text style={styles.sectionTitle}>HOW WE CALCULATE THIS</Text>
                
                <View style={styles.calculationCard}>
                  <LinearGradient
                    colors={['rgba(6, 182, 212, 0.1)', 'rgba(59, 130, 246, 0.05)']}
                    style={styles.calculationGradient}
                  >
                    {/* Formula */}
                    <View style={styles.formulaContainer}>
                      <View style={styles.formulaItem}>
                        <Text style={styles.formulaNumber}>{Math.round(unitsAvoided)}</Text>
                        <Text style={styles.formulaLabel}>units avoided</Text>
                      </View>
                      
                      <Ionicons name="close" size={20} color={COLORS.textMuted} style={styles.formulaOperator} />
                      
                      <View style={styles.formulaItem}>
                        <Text style={styles.formulaNumber}>{timeData.minutes}</Text>
                        <Text style={styles.formulaLabel}>min per unit</Text>
                      </View>
                      
                      <Ionicons name="pause" size={20} color={COLORS.textMuted} style={styles.formulaEquals} />
                      
                      <View style={styles.formulaItem}>
                        <Text style={[styles.formulaNumber, styles.formulaResult]}>{Math.round(totalMinutesSaved)}</Text>
                        <Text style={styles.formulaLabel}>total minutes</Text>
                      </View>
                    </View>
                    
                    {/* Explanation */}
                    <View style={styles.explanationContainer}>
                      <Ionicons name="information-circle" size={14} color="#06B6D4" />
                      <Text style={styles.explanationText}>
                        {timeData.explanation}
                      </Text>
                    </View>
                  </LinearGradient>
                </View>
              </View>

              {/* Time Breakdown */}
              {timeSaved.totalMinutes > 60 && (
                <View style={styles.breakdownSection}>
                  <Text style={styles.sectionTitle}>TIME BREAKDOWN</Text>
                  
                  <View style={styles.breakdownGrid}>
                    {timeSaved.days > 0 && (
                      <View style={styles.breakdownItem}>
                        <LinearGradient
                          colors={['rgba(99, 102, 241, 0.1)', 'rgba(139, 92, 246, 0.05)']}
                          style={styles.breakdownGradient}
                        >
                          <Text style={styles.breakdownNumber}>{timeSaved.days}</Text>
                          <Text style={styles.breakdownUnit}>day{timeSaved.days > 1 ? 's' : ''}</Text>
                        </LinearGradient>
                      </View>
                    )}
                    
                    {timeSaved.hours > 0 && (
                      <View style={styles.breakdownItem}>
                        <LinearGradient
                          colors={['rgba(16, 185, 129, 0.1)', 'rgba(6, 182, 212, 0.05)']}
                          style={styles.breakdownGradient}
                        >
                          <Text style={styles.breakdownNumber}>{timeSaved.hours}</Text>
                          <Text style={styles.breakdownUnit}>hour{timeSaved.hours > 1 ? 's' : ''}</Text>
                        </LinearGradient>
                      </View>
                    )}
                    
                    {timeSaved.minutes > 0 && (
                      <View style={styles.breakdownItem}>
                        <LinearGradient
                          colors={['rgba(245, 158, 11, 0.1)', 'rgba(239, 68, 68, 0.05)']}
                          style={styles.breakdownGradient}
                        >
                          <Text style={styles.breakdownNumber}>{timeSaved.minutes}</Text>
                          <Text style={styles.breakdownUnit}>minute{timeSaved.minutes > 1 ? 's' : ''}</Text>
                        </LinearGradient>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Comparisons */}
              {comparisons.length > 0 && (
                <View style={styles.comparisonsSection}>
                  <Text style={styles.sectionTitle}>THAT'S EQUIVALENT TO</Text>
                  
                  <View style={styles.comparisonsList}>
                    {comparisons.map((comparison, index) => (
                      <View key={index} style={styles.comparisonCard}>
                        <LinearGradient
                          colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
                          style={styles.comparisonGradient}
                        >
                          <View style={styles.comparisonIcon}>
                            <Ionicons name={comparison.icon as any} size={20} color="#06B6D4" />
                          </View>
                          <View style={styles.comparisonContent}>
                            <Text style={styles.comparisonText}>{comparison.text}</Text>
                            <Text style={styles.comparisonSubtext}>{comparison.subtext}</Text>
                          </View>
                        </LinearGradient>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Motivational Footer */}
              <View style={styles.motivationalSection}>
                <LinearGradient
                  colors={['rgba(99, 102, 241, 0.1)', 'rgba(16, 185, 129, 0.05)']}
                  style={styles.motivationalGradient}
                >
                  <Ionicons name="sparkles" size={18} color="#6366F1" />
                  <Text style={styles.motivationalText}>
                    Every minute saved is a minute you can spend on what truly matters
                  </Text>
                </LinearGradient>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  modalGradient: {
    flex: 1,
  },
  modalHeaderSpacer: {
    width: 40,
  },
  premiumModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  premiumModalBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  premiumModalBackGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
  },
  premiumModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  
  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  iconContainer: {
    marginBottom: SPACING.sm,
  },
  iconGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTime: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -1,
    marginBottom: 4,
  },
  heroSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  
  // Calculation Section
  calculationSection: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    marginBottom: SPACING.md,
  },
  calculationCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  calculationGradient: {
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
    borderRadius: 16,
  },
  formulaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: SPACING.sm,
  },
  formulaItem: {
    alignItems: 'center',
  },
  formulaNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  formulaResult: {
    color: '#06B6D4',
  },
  formulaLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  formulaOperator: {
    marginHorizontal: SPACING.xs,
  },
  formulaEquals: {
    marginHorizontal: SPACING.xs,
    transform: [{ rotate: '90deg' }],
  },
  explanationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderRadius: 10,
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  explanationText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  
  // Breakdown Section
  breakdownSection: {
    marginBottom: SPACING.md,
  },
  breakdownGrid: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  breakdownItem: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  breakdownGradient: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  breakdownNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 0,
  },
  breakdownUnit: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  
  // Comparisons Section
  comparisonsSection: {
    marginBottom: SPACING.md,
  },
  comparisonsList: {
    gap: SPACING.xs,
  },
  comparisonCard: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  comparisonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  comparisonIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  comparisonContent: {
    flex: 1,
  },
  comparisonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 1,
  },
  comparisonSubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  
  // Motivational Section
  motivationalSection: {
    marginBottom: SPACING.sm,
  },
  motivationalGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: 12,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  motivationalText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
    lineHeight: 18,
  },
});

export default TimeSavedModal; 