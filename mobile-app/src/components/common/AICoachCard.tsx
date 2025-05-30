import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING } from '../../constants/theme';
import { DashboardStackParamList } from '../../types';
import { StackNavigationProp } from '@react-navigation/stack';

const { width } = Dimensions.get('window');

type NavigationProp = StackNavigationProp<DashboardStackParamList, 'DashboardMain'>;

interface AICoachCardProps {
  onDailyOutlookPress?: () => void;
  onDirectChatPress?: () => void;
  journalData?: any;
  daysClean?: number;
}

const AICoachCard: React.FC<AICoachCardProps> = ({
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
        {/* Logo Box on Left */}
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>NX</Text>
        </View>
        
        {/* Main Content Area */}
        <View style={styles.contentArea}>
          <Ionicons name="sunny-outline" size={16} color={COLORS.textMuted} style={styles.contentIcon} />
          <Text style={styles.cardTitle}>Your Daily Outlook</Text>
        </View>
        
        {/* Arrow on Right */}
        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  contentArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentIcon: {
    marginRight: SPACING.xs,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
  },
});

export default AICoachCard; 