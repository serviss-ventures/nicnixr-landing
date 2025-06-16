import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../../constants/theme';
import * as Haptics from 'expo-haptics';
import { 
  getTodaysProductTip,
  DailyProductTip 
} from '../../services/dailyTipsByProductService';
import { getUserPersonalizedProfile } from '../../services/personalizedContentService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { selectProgressStats } from '../../store/slices/progressSlice';

interface DailyTipModalProps {
  visible: boolean;
  onClose: () => void;
}

const DailyTipModal: React.FC<DailyTipModalProps> = ({ visible, onClose }) => {
  const [tip, setTip] = useState<DailyProductTip | null>(null);
  const [slideAnimation] = useState(new Animated.Value(0));
  
  // Get days clean from Redux store
  const progressStats = useSelector(selectProgressStats);
  const daysClean = progressStats?.daysClean || 0;

  useEffect(() => {
    if (visible) {
      // Get user's product type and today's tip
      const userProfile = getUserPersonalizedProfile();
      const productType = userProfile.productType || 'vape'; // Default to vape if not set
      const todaysTip = getTodaysProductTip(daysClean, productType);
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
    onClose();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'physical':
        return '#06B6D4';
      case 'social':
        return '#F59E0B';
      case 'mental':
        return '#8B5CF6';
      case 'milestone':
        return '#10B981';
      default:
        return '#C084FC';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'physical':
        return 'PHYSICAL';
      case 'social':
        return 'SOCIAL';
      case 'mental':
        return 'MENTAL';
      case 'milestone':
        return 'MILESTONE';
      default:
        return category.toUpperCase();
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
            colors={['#000000', '#0A0F1C', '#0F172A']}
            style={styles.gradientContainer}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.06)' }]}>
                  <Ionicons name="trophy" size={20} color={categoryColor} />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.headerTitle}>Daily Science Tip</Text>
                  <Text style={[styles.headerSubtitle, { color: categoryColor }]}>
                    {getCategoryLabel(tip.category)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={20} color="rgba(255, 255, 255, 0.5)" />
              </TouchableOpacity>
            </View>

            {/* Day Label */}
            <View style={styles.dayContainer}>
              <Text style={styles.dayText}>Day {daysClean === 0 ? 1 : daysClean}</Text>
              <View style={[styles.categoryTag, { backgroundColor: categoryColor + '20' }]}>
                <Text style={[styles.categoryTagText, { color: categoryColor }]}>
                  {getCategoryLabel(tip.category)}
                </Text>
              </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
              {/* Tip Title & Content */}
              <View style={styles.tipSection}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipContent}>{tip.content}</Text>
              </View>

              {/* Actionable Advice */}
              <View style={styles.adviceSection}>
                <Ionicons name="bulb-outline" size={18} color="#F59E0B" style={styles.adviceIcon} />
                <Text style={styles.adviceText}>{tip.actionableAdvice}</Text>
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity style={styles.actionButton} onPress={handleClose}>
              <LinearGradient
                colors={['rgba(192, 132, 252, 0.1)', 'rgba(192, 132, 252, 0.05)']}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="checkmark-circle" size={20} color="#C084FC" />
                <Text style={styles.actionButtonText}>Got It!</Text>
              </LinearGradient>
            </TouchableOpacity>
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
    borderRadius: 20,
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
    overflow: 'hidden',
  },
  gradientContainer: {
    padding: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
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
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.1,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '300',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  
  // Day Container
  dayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.5,
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  
  // Content
  content: {
    marginBottom: 20,
  },
  tipSection: {
    marginBottom: 20,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 1)',
    marginBottom: 8,
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  tipContent: {
    fontSize: 14,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  
  // Advice Section
  adviceSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  adviceIcon: {
    marginRight: 10,
    marginTop: 1,
  },
  adviceText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  
  // Action Button
  actionButton: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#C084FC',
    letterSpacing: 0.1,
  },
});

export default DailyTipModal; 