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
      <View style={styles.card}>
        {/* Warm Guide Avatar */}
        <View style={styles.guideContainer}>
          <View style={styles.guideGradientBg}>
            <Ionicons name="chatbubbles" size={20} color="#FFFFFF" />
          </View>
          
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
          <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md + 2,
    gap: SPACING.md,
  },
  guideContainer: {
    width: 44,
    height: 44,
    position: 'relative',
    marginRight: 4,
  },
  guideGradientBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  guideIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.8)',
  },
  guideIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
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
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '300',
    color: '#9CA3AF',
    letterSpacing: -0.1,
  },
  chatContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
});

export default RecoveryCoachCard; 