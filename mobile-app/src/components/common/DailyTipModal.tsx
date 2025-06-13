import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../../constants/theme';
import { DailyTip, getTodaysTip, markTipAsViewed } from '../../services/dailyTipService';
import * as Haptics from 'expo-haptics';

interface DailyTipModalProps {
  visible: boolean;
  onClose: () => void;
}

const DailyTipModal: React.FC<DailyTipModalProps> = ({ visible, onClose }) => {
  const [tip, setTip] = useState<DailyTip | null>(null);
  const [slideAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      const todaysTip = getTodaysTip();
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
  }, [visible]);

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
      default:
        return '#C4B5FD';
    }
  };

  const getEncouragementMessage = (category: string, dayNumber: number) => {
    // Special messages for key milestones
    if (dayNumber === 1) {
      return "You've taken the first step!";
    } else if (dayNumber === 7) {
      return "One week strong!";
    } else if (dayNumber === 14) {
      return "Two weeks of success!";
    } else if (dayNumber === 30) {
      return "One month milestone!";
    } else if (dayNumber >= 365) {
      return "You're a legend!";
    } else if (dayNumber >= 90) {
      return "Expert level!";
    } else if (dayNumber >= 30) {
      return "Established!";
    }
    
    return "Keep going strong!";
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
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]}>
                  <Ionicons name={tip.icon as any} size={20} color={categoryColor} />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.title}>Daily Science Tip</Text>
                  <Text style={[styles.categoryText, { color: categoryColor }]}>{tip.category}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Compact Content */}
            <View style={styles.content}>
              {/* Main Tip - Condensed */}
              <View style={[styles.tipCard, { borderColor: 'rgba(255, 255, 255, 0.06)' }]}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipText}>{tip.content}</Text>
              </View>

              {/* Action Section - Full Width */}
              <View style={styles.actionSection}>
                <View style={styles.actionHeader}>
                  <Ionicons name="checkmark-circle" size={18} color="#FCD34D" />
                  <Text style={styles.actionTitle}>Action Plan</Text>
                </View>
                <Text style={styles.actionText}>
                  {tip.actionableAdvice}
                </Text>
              </View>

              {/* Compact Encouragement Banner */}
              <View style={[styles.encouragementBanner, { backgroundColor: 'rgba(255, 255, 255, 0.03)' }]}>
                <Ionicons name="heart" size={16} color={categoryColor} />
                <Text style={[styles.encouragementText, { color: categoryColor }]}>
                  {getEncouragementMessage(tip.category, tip.dayNumber || 0)}
                </Text>
              </View>
            </View>

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
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    borderRadius: 20,
    width: '100%',
    maxWidth: 380,
    minHeight: 500,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
  },
  gradientContainer: {
    flex: 1,
    minHeight: 500,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
  },
  
  // Compact Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '400',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Compact Content
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    minHeight: 350,
  },
  tipCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    lineHeight: 24,
  },
  tipText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontWeight: '400',
  },
  
  // Action Section - Full Width
  actionSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  actionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontWeight: '400',
  },
  
  // Compact Encouragement Banner
  encouragementBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  encouragementText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  
  // Compact Footer
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default DailyTipModal; 