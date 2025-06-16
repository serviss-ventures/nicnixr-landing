import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../../constants/theme';
import { STORAGE_KEYS } from '../../constants/app';
import { DailyTip, getTodaysTip, markTipAsViewed } from '../../services/dailyTipService';
import * as Haptics from 'expo-haptics';
import {
  getPersonalizedDailyTips,
  PersonalizedDailyTip,
  getUserPersonalizedProfile,
} from '../../services/personalizedContentService';
import { 
  getEarlyWithdrawalTips,
  getCurrentWithdrawalPhase,
  getWithdrawalIntensity,
  EarlyWithdrawalTip 
} from '../../services/earlyWithdrawalTipsService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { selectProgressStats } from '../../store/slices/progressSlice';

interface DailyTipModalProps {
  visible: boolean;
  onClose: () => void;
}

// Extended tip types for TypeScript
interface ExtendedTip extends EarlyWithdrawalTip {
  withdrawalPhase?: string;
  withdrawalIntensity?: number;
}

// Get personalized tip based on quit progress
const getPersonalizedTip = (daysClean: number): PersonalizedDailyTip | ExtendedTip | null => {
  // For the first 30 days, use the enhanced early withdrawal tips
  if (daysClean <= 30) {
    const hoursSinceQuit = daysClean * 24;
    const userProfile = getUserPersonalizedProfile();
    const earlyTips = getEarlyWithdrawalTips(hoursSinceQuit, userProfile.productType);
    
    // For the first 3 days, show multiple tips throughout the day
    if (daysClean <= 3 && earlyTips.length > 0) {
      // Determine which tip to show based on time of day
      const now = new Date();
      const hour = now.getHours();
      
      let tipIndex = 0;
      if (hour >= 12 && hour < 17) {
        tipIndex = Math.min(1, earlyTips.length - 1); // Afternoon tip
      } else if (hour >= 17) {
        tipIndex = Math.min(2, earlyTips.length - 1); // Evening tip
      }
      
      // Add withdrawal phase info to the tip
      const phase = getCurrentWithdrawalPhase(hoursSinceQuit);
      const intensity = getWithdrawalIntensity(hoursSinceQuit);
      
      return {
        ...earlyTips[tipIndex],
        withdrawalPhase: phase,
        withdrawalIntensity: intensity,
      };
    }
    
    // For days 4-30, combine all tips into one comprehensive tip
    if (earlyTips.length > 0) {
      // Find the physical, social, and mental tips for this day
      const physicalTip = earlyTips.find(t => t.category === 'physical') || earlyTips[0];
      const socialTip = earlyTips.find(t => t.category === 'social');
      const mentalTip = earlyTips.find(t => t.category === 'mental');
      
      // Create a combined tip with all content
      const combinedTip: ExtendedTip = {
        ...physicalTip,
        // Add social and mental content as extra fields
        socialTip: socialTip?.content,
        mentalHealthTip: mentalTip?.content,
        // Add extra actionable advice if available
        actionableAdvice: physicalTip.actionableAdvice + 
          (socialTip && socialTip.actionableAdvice !== physicalTip.actionableAdvice ? 
            '\n\n' + socialTip.actionableAdvice : '') +
          (mentalTip && mentalTip.actionableAdvice !== physicalTip.actionableAdvice ? 
            '\n\n' + mentalTip.actionableAdvice : ''),
        // Add any coping strategies
        copingStrategy: physicalTip.copingStrategy || socialTip?.copingStrategy || mentalTip?.copingStrategy,
      };
      
      return combinedTip;
    }
  }
  
  // After day 30, use the regular personalized tips
  const tips = getPersonalizedDailyTips(daysClean);
  return tips.length > 0 ? tips[0] : null;
};

const DailyTipModal: React.FC<DailyTipModalProps> = ({ visible, onClose }) => {
  const [tip, setTip] = useState<DailyTip | PersonalizedDailyTip | ExtendedTip | null>(null);
  const [slideAnimation] = useState(new Animated.Value(0));
  
  // Get days clean from Redux store
  const progressStats = useSelector(selectProgressStats);
  const daysClean = progressStats?.daysClean || 0;
  
  console.log('🔍 DailyTipModal - Days clean from Redux:', daysClean);

  useEffect(() => {
    if (visible) {
      console.log('🔍 DailyTipModal - Modal opened, days clean:', daysClean);
      
      const todaysTip = getPersonalizedTip(daysClean);
      setTip(todaysTip);
      
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
  }, [visible, daysClean]);

  const handleClose = async () => {
    if (tip) {
      await markTipAsViewed(tip.id);
    }
    onClose();
  };

  const getCategoryGradient = (category: string) => {
    // All categories use the same subtle gradient now
    return ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.05)'];
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'neuroplasticity':
        return '#C4B5FD';
      case 'health':
        return '#10B981';
      case 'psychology':
        return '#FCD34D';
      case 'practical':
        return '#60A5FA';
      case 'motivation':
        return '#10B981';
      case 'physical':
        return '#06B6D4';
      case 'social':
        return '#F59E0B';
      case 'mental':
        return '#8B5CF6';
      case 'situational':
        return '#EC4899';
      default:
        return '#C4B5FD';
    }
  };

  if (!tip) return null;

  const categoryColor = getCategoryColor(tip.category);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.container,
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
          <LinearGradient
            colors={['#000000', '#0A0F1C']}
            style={styles.gradientContainer}
          >
            {/* Compact Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.06)' }]}>
                  <Ionicons name={tip.icon as any} size={16} color={categoryColor} />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.title}>Daily Science Tip</Text>
                  <Text style={[styles.categoryText, { color: categoryColor }]}>{tip.category}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView 
              style={styles.contentWrapper}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {/* Date and Category Tag */}
              <View style={styles.dateHeader}>
                <Text style={styles.dateText}>
                  {daysClean === 0 ? 'Day 1 Begins' : `Day ${daysClean}`}
                </Text>
                
                {/* Category Tag */}
                <View style={[
                  styles.categoryTag, 
                  { backgroundColor: getCategoryTagColor(tip) }
                ]}>
                  <Text style={styles.categoryTagText}>
                    {getCategoryLabel(tip)}
                  </Text>
                </View>
              </View>

              {/* Main Tip Content */}
              <View style={styles.tipCard}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipText}>{tip.content}</Text>
              </View>
              
              {/* Actionable Advice - Always visible */}
              <View style={styles.adviceCard}>
                <Ionicons name="bulb-outline" size={16} color="#F59E0B" />
                <Text style={styles.adviceText}>
                  {tip.actionableAdvice}
                </Text>
              </View>

              {/* Social Tip (if available) */}
              {tip.socialTip && (
                <View style={[styles.adviceCard, styles.socialCard]}>
                  <Ionicons name="people-outline" size={16} color="#06B6D4" />
                  <Text style={styles.socialText}>
                    {tip.socialTip}
                  </Text>
                </View>
              )}

              {/* Mental Health Tip (if available) */}
              {tip.mentalHealthTip && (
                <View style={[styles.adviceCard, styles.mentalCard]}>
                  <Ionicons name="heart-outline" size={16} color="#8B5CF6" />
                  <Text style={styles.mentalText}>
                    {tip.mentalHealthTip}
                  </Text>
                </View>
              )}
              
              {/* Coping Strategy (if available) */}
              {tip.copingStrategy && (
                <View style={[styles.adviceCard, styles.copingCard]}>
                  <Ionicons name="shield-checkmark-outline" size={16} color="#10B981" />
                  <Text style={styles.copingText}>
                    {tip.copingStrategy}
                  </Text>
                </View>
              )}

              {/* Withdrawal Intensity Indicator (for early days) */}
              {tip.withdrawalIntensity && daysClean <= 3 && (
                <View style={styles.intensityIndicator}>
                  <Text style={styles.intensityText}>
                    {getIntensityMessage(tip.withdrawalIntensity)}
                  </Text>
                </View>
              )}

              {/* Scientific Basis - One Line (for regular tips) */}
              {tip.scientificBasis && (
                <View style={styles.scienceSection}>
                  <View style={styles.scienceHeader}>
                    <Ionicons name="flask-outline" size={12} color="rgba(255, 255, 255, 0.5)" />
                    <Text style={styles.scienceTitle}>Science</Text>
                  </View>
                  <Text style={styles.scienceText} numberOfLines={2}>
                    {tip.scientificBasis}
                  </Text>
                </View>
              )}

              {/* Trigger Warning (if available) */}
              {tip.triggerWarning && (
                <View style={styles.warningCard}>
                  <Ionicons name="warning-outline" size={14} color="#EF4444" />
                  <Text style={styles.warningText}>
                    {tip.triggerWarning}
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Compact Action Button */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.actionButton} onPress={handleClose}>
                <LinearGradient
                  colors={getCategoryGradient(tip.category) as readonly [string, string, ...string[]]}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="checkmark-circle" size={16} color={categoryColor} />
                  <Text style={[styles.actionButtonText, { color: categoryColor }]}>Got It!</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  container: {
    borderRadius: 24,
    width: '100%',
    maxWidth: 360,
    // Remove fixed height to let content determine size
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
    overflow: 'hidden',
  },
  gradientContainer: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
  },
  
  // Compact Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 0,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '300',
    textTransform: 'capitalize',
    marginTop: 0,
    opacity: 0.7,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  
  // Content Wrapper
  contentWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  tipCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '400',
    color: COLORS.text,
    marginBottom: 4,
    lineHeight: 20,
    letterSpacing: -0.3,
  },
  tipText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 16,
    fontWeight: '300',
  },
  
  // Action Section - Compact
  actionSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.text,
    marginLeft: 6,
    letterSpacing: 0,
  },
  actionText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 15,
    fontWeight: '300',
  },
  
  // Science Section
  scienceSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 0,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  scienceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  scienceTitle: {
    fontSize: 11,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.5)',
    marginLeft: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  scienceText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 14,
    fontWeight: '300',
  },

  
  // Compact Footer
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: -0.1,
  },

  // Additional styles for new features
  adviceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  adviceText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  socialCard: {
    backgroundColor: 'rgba(6, 182, 212, 0.05)',
    borderColor: 'rgba(6, 182, 212, 0.15)',
  },
  socialText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  mentalCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderColor: 'rgba(139, 92, 246, 0.15)',
  },
  mentalText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  copingCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderColor: 'rgba(16, 185, 129, 0.15)',
  },
  copingText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  intensityIndicator: {
    marginTop: 6,
    marginBottom: 0,
  },
  intensityLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  intensityBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  intensityFill: {
    height: '100%',
    borderRadius: 2,
  },
  intensityText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '300',
    textAlign: 'center',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  warningText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
    letterSpacing: 0.1,
    fontStyle: 'italic',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  warningText: {
    fontSize: 11,
    color: 'rgba(239, 68, 68, 0.9)',
    marginLeft: 6,
    flex: 1,
    fontWeight: '400',
  },
  
  // Additional styles for enhanced tips
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '300',
    letterSpacing: 0.3,
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  adviceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 8,
  },
  adviceText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
    fontWeight: '300',
  },
});

// Helper functions
const getCategoryLabel = (tip: DailyTip | PersonalizedDailyTip | ExtendedTip): string => {
  if ('category' in tip) {
    const categoryLabels = {
      physical: 'Physical',
      social: 'Social',
      mental: 'Mental Health',
      situational: 'Situational',
      neuroplasticity: 'Brain Health',
      health: 'Health',
      psychology: 'Psychology',
      practical: 'Practical',
      motivation: 'Motivation',
    };
    return categoryLabels[tip.category] || tip.category;
  }
  return 'Daily Tip';
};

const getCategoryTagColor = (tip: DailyTip | PersonalizedDailyTip | ExtendedTip): string => {
  if ('urgencyLevel' in tip && tip.urgencyLevel === 'high') {
    return 'rgba(239, 68, 68, 0.15)'; // Red for high urgency
  }
  return 'rgba(139, 92, 246, 0.1)'; // Default purple
};

const getIntensityColor = (intensity: number): string => {
  if (intensity <= 3) return '#10B981'; // Green
  if (intensity <= 6) return '#F59E0B'; // Orange
  return '#EF4444'; // Red
};

const getIntensityMessage = (intensity: number): string => {
  if (intensity <= 3) return 'This is real. You\'re feeling it.';
  if (intensity <= 6) return 'It\'s intense right now. That\'s normal.';
  if (intensity === 9) return 'Peak withdrawal. You\'re at the summit.';
  return 'This is tough. And temporary.';
};

export default DailyTipModal; 