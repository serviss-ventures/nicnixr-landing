import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, ScrollView } from 'react-native';
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
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.06)' }]}>
                  <Ionicons name={tip.icon as any} size={18} color={categoryColor} />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.title}>Daily Science Tip</Text>
                  <Text style={[styles.categoryText, { color: categoryColor }]}>{tip.category}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Compact Content */}
            <ScrollView 
              style={styles.contentWrapper}
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
              bounces={false}
              scrollEnabled={true}
              keyboardShouldPersistTaps="handled"
            >
                {/* Main Tip - Condensed */}
                <View style={[styles.tipCard, { borderColor: 'rgba(255, 255, 255, 0.06)' }]}>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <Text style={styles.tipText}>{tip.content}</Text>
                </View>

                {/* Action Section - Full Width */}
                <View style={styles.actionSection}>
                  <View style={styles.actionHeader}>
                    <Ionicons name="checkmark-circle" size={16} color="#FCD34D" />
                    <Text style={styles.actionTitle}>Action Plan</Text>
                  </View>
                  <Text style={styles.actionText}>
                    {tip.actionableAdvice}
                  </Text>
                </View>

                {/* Scientific Basis - Compact */}
                {tip.scientificBasis && (
                  <View style={styles.scienceSection}>
                    <View style={styles.scienceHeader}>
                      <Ionicons name="flask-outline" size={14} color="rgba(255, 255, 255, 0.5)" />
                      <Text style={styles.scienceTitle}>The Science</Text>
                    </View>
                    <Text style={styles.scienceText} numberOfLines={3}>
                      {tip.scientificBasis}
                    </Text>
                  </View>
                )}

                {/* Compact Encouragement Banner */}
                <View style={[styles.encouragementBanner, { backgroundColor: 'rgba(255, 255, 255, 0.03)' }]}>
                  <Ionicons name="heart" size={14} color={categoryColor} />
                  <Text style={[styles.encouragementText, { color: categoryColor }]}>
                    {getEncouragementMessage(tip.category, tip.dayNumber || 0)}
                  </Text>
                </View>
              </ScrollView>

            {/* Compact Action Button */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.actionButton} onPress={handleClose}>
                <LinearGradient
                  colors={getCategoryGradient(tip.category) as readonly [string, string, ...string[]]}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="checkmark-circle" size={18} color={categoryColor} />
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
    maxHeight: '80%', // Ensure it doesn't exceed screen height
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 0,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '300',
    textTransform: 'capitalize',
    marginTop: 1,
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
    flex: 1,
    maxHeight: 400, // Set a max height to ensure content is visible
  },
  
  // Compact Content
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  tipCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tipTitle: {
    fontSize: 17,
    fontWeight: '400',
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  tipText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
    fontWeight: '300',
  },
  
  // Action Section - Full Width
  actionSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.text,
    marginLeft: 8,
    letterSpacing: 0,
  },
  actionText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
    fontWeight: '300',
  },
  
  // Science Section
  scienceSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  scienceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  scienceTitle: {
    fontSize: 12,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.5)',
    marginLeft: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  scienceText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 16,
    fontWeight: '300',
  },
  
  // Compact Encouragement Banner
  encouragementBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 0,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  encouragementText: {
    fontSize: 12,
    fontWeight: '400',
    marginLeft: 8,
    flex: 1,
    letterSpacing: 0.1,
  },
  
  // Compact Footer
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
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
    letterSpacing: -0.1,
  },
});

export default DailyTipModal; 