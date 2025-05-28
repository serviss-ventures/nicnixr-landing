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

  if (!tip) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header with gradient icon */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <LinearGradient
                colors={getCategoryGradient(tip.category)}
                style={styles.iconContainer}
              >
                <Ionicons name={tip.icon as any} size={24} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.headerText}>
                <Text style={styles.title}>💡 Daily Science Tip</Text>
                <Text style={styles.categoryText}>{tip.category}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content}>
            {/* Main Tip */}
            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipText}>{tip.content}</Text>
            </View>

            {/* Science Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="flask" size={20} color="#10B981" />
                <Text style={styles.sectionTitle}>The Science</Text>
              </View>
              <Text style={styles.sectionText}>{tip.scientificBasis}</Text>
            </View>

            {/* Action Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="checkmark-circle" size={20} color="#F59E0B" />
                <Text style={styles.sectionTitle}>What You Can Do</Text>
              </View>
              <Text style={styles.sectionText}>{tip.actionableAdvice}</Text>
            </View>

            {/* Sources */}
            {tip.sources && tip.sources.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="library" size={20} color="#8B5CF6" />
                  <Text style={styles.sectionTitle}>Research Sources</Text>
                </View>
                {tip.sources.map((source, index) => (
                  <Text key={index} style={styles.sourceText}>• {source}</Text>
                ))}
              </View>
            )}

            {/* Encouragement */}
            <View style={styles.encouragementCard}>
              <Ionicons name="heart" size={24} color="#EC4899" />
              <View style={styles.encouragementText}>
                <Text style={styles.encouragementTitle}>You're Doing Amazing! 💪</Text>
                <Text style={styles.encouragementDescription}>
                  Every day you choose recovery, you're literally rewiring your brain for success. Science is on your side.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer with gradient button */}
          <TouchableOpacity style={styles.button} onPress={handleClose}>
            <LinearGradient
              colors={getCategoryGradient(tip.category)}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Got It! 🚀</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  categoryText: {
    fontSize: 12,
    color: '#B0B0B0',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    padding: 20,
    maxHeight: 400,
  },
  tipCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  tipTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    lineHeight: 26,
  },
  tipText: {
    fontSize: 16,
    color: '#E0E0E0',
    lineHeight: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  sectionText: {
    fontSize: 14,
    color: '#C0C0C0',
    lineHeight: 20,
    paddingLeft: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 10,
    marginTop: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sourceText: {
    fontSize: 12,
    color: '#A0A0A0',
    lineHeight: 18,
    paddingLeft: 30,
    marginBottom: 5,
    fontStyle: 'italic',
  },
  button: {
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  encouragementCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  encouragementText: {
    flex: 1,
    marginLeft: 15,
  },
  encouragementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  encouragementDescription: {
    fontSize: 14,
    color: '#C0C0C0',
    lineHeight: 20,
  },
});

export default DailyTipModal; 