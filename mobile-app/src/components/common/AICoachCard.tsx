import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING } from '../../constants/theme';
import { DashboardStackParamList } from '../../types';
import { StackNavigationProp } from '@react-navigation/stack';

const { width } = Dimensions.get('window');

type NavigationProp = StackNavigationProp<DashboardStackParamList, 'DashboardMain'>;

interface RecoveryCoachCardProps {
  onDailyOutlookPress?: () => void;
  onDirectChatPress?: () => void;
  journalData?: {
    daysClean: number;
    product: string;
    mood?: string;
    moodEmoji?: string;
    entry?: string;
    savedTriggers?: string[];
    exerciseCompleted?: boolean;
  };
  daysClean?: number;
}

const RecoveryCoachCard: React.FC<RecoveryCoachCardProps> = ({
  onDailyOutlookPress,
  onDirectChatPress,
  journalData,
  daysClean = 0
}) => {
  const navigation = useNavigation<NavigationProp>();

  const handlePress = () => {
    navigation.navigate('AICoach');
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={['rgba(16, 185, 129, 0.12)', 'rgba(6, 182, 212, 0.08)', 'rgba(139, 92, 246, 0.06)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.card}>
          {/* Warm Guide Avatar */}
          <View style={styles.guideContainer}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary, '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.guideGradientBg}
            >
              <Text style={styles.guideEmoji}>✨</Text>
            </LinearGradient>
            
            {/* Online indicator */}
            <View style={styles.guideIndicator}>
              <View style={styles.guideIndicatorDot} />
            </View>
          </View>
          
          {/* Main Content Area */}
          <View style={styles.contentArea}>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>Recovery Coach</Text>
              <Text style={styles.cardSubtitle}>Your personal support companion</Text>
            </View>
          </View>
          
          {/* Chat Icon */}
          <View style={styles.chatContainer}>
            <Ionicons name="chatbubble-ellipses" size={18} color={COLORS.primary} />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  cardGradient: {
    borderRadius: 16,
    padding: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md + 2,
    gap: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  guideContainer: {
    width: 48,
    height: 48,
    position: 'relative',
    marginRight: 4,
  },
  guideGradientBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  guideEmoji: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  guideIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.8)',
  },
  guideIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  contentArea: {
    flex: 1,
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.primary,
    letterSpacing: -0.1,
  },
  chatContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
});

export default RecoveryCoachCard; 