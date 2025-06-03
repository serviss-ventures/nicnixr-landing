import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import { DailyTip, getTodaysTip, markTipAsViewed } from '../../services/dailyTipService';

interface DailyTipModalProps {
  visible: boolean;
  onClose: () => void;
}

const DailyTipModal: React.FC<DailyTipModalProps> = ({ visible, onClose }) => {
  const [tip, setTip] = useState<DailyTip | null>(null);

  useEffect(() => {
    if (visible) {
      console.log('📚 Daily Tip Modal opening...');
      const todaysTip = getTodaysTip();
      setTip(todaysTip);
      console.log('📚 Tip loaded:', todaysTip.title);
    }
  }, [visible]);

  const handleClose = () => {
    console.log('📚 Closing Daily Tip Modal');
    if (tip) {
      markTipAsViewed(tip.id);
    }
    onClose();
  };

  const getCategoryGradient = (category: string) => {
    switch (category) {
      case 'neuroplasticity':
        return ['#8B5CF6', '#EC4899'];
      case 'health':
        return ['#10B981', '#06B6D4'];
      case 'psychology':
        return ['#F59E0B', '#EF4444'];
      case 'practical':
        return ['#3B82F6', '#8B5CF6'];
      case 'motivation':
        return ['#10B981', '#F59E0B'];
      default:
        return ['#8B5CF6', '#EC4899'];
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'neuroplasticity':
        return '#8B5CF6';
      case 'health':
        return '#10B981';
      case 'psychology':
        return '#F59E0B';
      case 'practical':
        return '#3B82F6';
      case 'motivation':
        return '#10B981';
      default:
        return '#8B5CF6';
    }
  };

  const getEncouragementMessage = (category: string, dayNumber: number) => {
    // Special messages for key milestones
    if (dayNumber === 1) {
      return "You've taken the first step! 🌟";
    } else if (dayNumber === 7) {
      return "One week strong! 🎉";
    } else if (dayNumber === 14) {
      return "Two weeks of success! ⚡";
    } else if (dayNumber === 30) {
      return "One month milestone! 🎊";
    } else if (dayNumber >= 365) {
      return "You're a legend! 👑";
    } else if (dayNumber >= 90) {
      return "Expert level! ⭐";
    } else if (dayNumber >= 30) {
      return "Established! 💪";
    }
    
    return "Keep going strong! 🚀";
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
        <View style={styles.container}>
          {/* Compact Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={[styles.iconContainer, { backgroundColor: `${categoryColor}20` }]}>
                <Ionicons name={tip.icon as any} size={20} color={categoryColor} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.title}>💡 Daily Science Tip</Text>
                <Text style={[styles.categoryText, { color: categoryColor }]}>{tip.category}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Compact Content */}
          <View style={styles.content}>
            {/* Main Tip - Condensed */}
            <View style={[styles.tipCard, { borderColor: `${categoryColor}30` }]}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipText}>{tip.content}</Text>
            </View>

            {/* Action Section - Full Width */}
            <View style={styles.actionSection}>
              <View style={styles.actionHeader}>
                <Ionicons name="checkmark-circle" size={18} color="#F59E0B" />
                <Text style={styles.actionTitle}>Action Plan</Text>
              </View>
              <Text style={styles.actionText}>
                {tip.actionableAdvice}
              </Text>
            </View>

            {/* Compact Encouragement Banner */}
            <View style={[styles.encouragementBanner, { backgroundColor: `${categoryColor}15` }]}>
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
                colors={getCategoryGradient(tip.category)}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Got It!</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
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
    backgroundColor: '#1A1A2E',
    borderRadius: 18,
    width: '100%',
    maxWidth: 380,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  
  // Compact Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
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
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Compact Content
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 300,
  },
  tipCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
  },
  tipTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 22,
  },
  tipText: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 20,
  },
  
  // Action Section - Full Width
  actionSection: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 20,
  },
  
  // Compact Encouragement Banner
  encouragementBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  encouragementText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  

  
  // Compact Footer
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
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
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default DailyTipModal; 