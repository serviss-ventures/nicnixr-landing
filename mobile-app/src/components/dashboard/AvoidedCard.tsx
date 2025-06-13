import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../constants/theme';
import { formatUnitsDisplay } from '../../services/productService';

interface AvoidedCardProps {
  unitsAvoided: number;
  userProfile: any;
  onPress: () => void;
}

const AvoidedCard: React.FC<AvoidedCardProps> = ({ unitsAvoided, userProfile, onPress }) => {
  const avoidedDisplay = formatUnitsDisplay(unitsAvoided, userProfile);
  const [value, ...unitParts] = avoidedDisplay.split(' ');
  const unit = unitParts.join(' ');

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={['rgba(236, 72, 153, 0.08)', 'rgba(139, 92, 246, 0.04)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#EC4899" />
            </View>
            <Text style={styles.label}>Avoided</Text>
          </View>
          
          <View style={styles.valueContainer}>
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.unit}>{unit}</Text>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Tap for details</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </View>
        </View>
        
        {/* Subtle gradient overlay */}
        <View style={styles.overlay} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    height: 160,
  },
  gradient: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: FONTS.sm,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.xs,
  },
  value: {
    fontSize: FONTS['4xl'],
    fontWeight: '300',
    color: COLORS.text,
    letterSpacing: -1.5,
    lineHeight: FONTS['4xl'] * 1.1,
  },
  unit: {
    fontSize: FONTS.base,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '50%',
    height: '50%',
    backgroundColor: 'rgba(236, 72, 153, 0.03)',
    borderBottomLeftRadius: 100,
    opacity: 0.5,
  },
});

export default AvoidedCard; 