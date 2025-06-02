import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING } from '../../constants/theme';
import { DashboardStackParamList } from '../../types';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Circle, Path, Defs, LinearGradient as SvgLinearGradient, Stop, G } from 'react-native-svg';

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
      <LinearGradient
        colors={['rgba(16, 185, 129, 0.08)', 'rgba(6, 182, 212, 0.05)', 'rgba(99, 102, 241, 0.03)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.card}>
          {/* Custom AI Visualization */}
          <View style={styles.aiContainer}>
            <LinearGradient
              colors={[COLORS.primary + '20', COLORS.secondary + '20']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.aiGradientBg}
            >
              <Svg width={48} height={48} viewBox="0 0 48 48">
                <Defs>
                  <SvgLinearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={COLORS.primary} stopOpacity="0.9" />
                    <Stop offset="100%" stopColor={COLORS.secondary} stopOpacity="0.9" />
                  </SvgLinearGradient>
                </Defs>
                
                {/* AI Brain Pattern */}
                <G>
                  {/* Central core */}
                  <Circle cx={24} cy={24} r={3} fill="url(#aiGrad)" />
                  
                  {/* Neural pathways - hexagonal pattern */}
                  <Path 
                    d="M24 12 L32 16 L32 24 L24 28 L16 24 L16 16 Z" 
                    stroke="url(#aiGrad)" 
                    strokeWidth="1.5" 
                    fill="none"
                    opacity="0.6"
                  />
                  
                  {/* Outer connections */}
                  <Path 
                    d="M24 4 L40 12 L40 28 L24 36 L8 28 L8 12 Z" 
                    stroke="url(#aiGrad)" 
                    strokeWidth="1" 
                    fill="none"
                    opacity="0.3"
                  />
                  
                  {/* Data nodes */}
                  <Circle cx={24} cy={12} r={2} fill="url(#aiGrad)" opacity="0.8" />
                  <Circle cx={32} cy={16} r={2} fill="url(#aiGrad)" opacity="0.6" />
                  <Circle cx={32} cy={24} r={2} fill="url(#aiGrad)" opacity="0.8" />
                  <Circle cx={24} cy={28} r={2} fill="url(#aiGrad)" opacity="0.6" />
                  <Circle cx={16} cy={24} r={2} fill="url(#aiGrad)" opacity="0.8" />
                  <Circle cx={16} cy={16} r={2} fill="url(#aiGrad)" opacity="0.6" />
                  
                  {/* Connection lines */}
                  <Path 
                    d="M24 24 L24 12 M24 24 L32 16 M24 24 L32 24 M24 24 L24 28 M24 24 L16 24 M24 24 L16 16" 
                    stroke="url(#aiGrad)" 
                    strokeWidth="1" 
                    opacity="0.4"
                  />
                </G>
              </Svg>
            </LinearGradient>
            
            {/* AI indicator dot */}
            <View style={styles.aiIndicator}>
              <View style={styles.aiIndicatorDot} />
            </View>
          </View>
          
          {/* Main Content Area */}
          <View style={styles.contentArea}>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>AI Recovery Coach</Text>
              <Text style={styles.cardSubtitle}>Personalized insights & guidance</Text>
            </View>
          </View>
          
          {/* Arrow */}
          <View style={styles.arrowContainer}>
            <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md + 2,
    gap: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  aiContainer: {
    width: 48,
    height: 48,
    position: 'relative',
    marginRight: 4,
  },
  aiGradientBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  aiIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  aiIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
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
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: -0.1,
  },
  arrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
  },
});

export default AICoachCard; 