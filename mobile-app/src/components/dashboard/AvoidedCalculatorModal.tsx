import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  TextInput,
  Keyboard,
  ScrollView,
  Alert,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserData, selectUser } from '../../store/slices/authSlice';
import { updateStats, updateProgress, updateUserProfile, selectProgressStats } from '../../store/slices/progressSlice';
import { AppDispatch, RootState } from '../../store/store';
import { 
  getProductInfo,
  getDailyUnits,
  formatUnitsDisplay,
  calculateDailyCost,
  getCostPerPackage
} from '../../services/productService';
import * as Haptics from 'expo-haptics';

interface AvoidedCalculatorModalProps {
  visible: boolean;
  onClose: () => void;
  stats: { 
    unitsAvoided?: number; 
    daysClean?: number 
  };
  userProfile: { 
    category?: string; 
    id?: string; 
    brand?: string; 
    packagesPerDay?: number; 
    dailyAmount?: number; 
    tinsPerDay?: number; 
    podsPerDay?: number;
    nicotineProduct?: {
      category?: string;
      id?: string;
      brand?: string;
    };
  };
}

const AvoidedCalculatorModal: React.FC<AvoidedCalculatorModalProps> = ({ 
  visible, 
  onClose, 
  stats, 
  userProfile
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const reduxStats = useSelector(selectProgressStats);
  const reduxUser = useSelector(selectUser);
  const [tempDailyAmount, setTempDailyAmount] = useState('1');
  const [showSuccess, setShowSuccess] = useState(false);
  const [slideAnimation] = useState(new Animated.Value(0));
  
  // Use Redux user data first, then fall back to props
  const currentProfile = reduxUser || userProfile;
  
  // Get product info from our new service
  const productInfo = getProductInfo(currentProfile);
  
  useEffect(() => {
    if (visible) {
      // Get current daily amount from our service
      const currentAmount = getDailyUnits(currentProfile);
      setTempDailyAmount(currentAmount.toString());
      
      // Animate modal entrance
      Animated.spring(slideAnimation, {
        toValue: 1,
        tension: 65,
        friction: 10,
        useNativeDriver: true,
      }).start();
    } else {
      // Reset animation
      slideAnimation.setValue(0);
    }
  }, [visible, currentProfile]);
  
  const currentDailyAmount = parseFloat(tempDailyAmount) || 1;
  
  // Calculate totals
  const totalUnitsAvoided = currentDailyAmount * (stats?.daysClean || 0);
  
  const handleSave = async () => {
    try {
      const newDailyAmount = parseFloat(tempDailyAmount) || 1;
      
      // Get current cost per package
      const currentCostPerPackage = getCostPerPackage(currentProfile?.dailyCost || 10, currentProfile);
      
      // Calculate new daily cost based on the new daily amount
      const newDailyCost = (newDailyAmount / productInfo.unitsPerPackage) * currentCostPerPackage;
      
      // Update user profile based on product type
      if (productInfo.id === 'cigarettes') {
        const packsPerDay = newDailyAmount / 20;
        
        dispatch(updateUserData({
          packagesPerDay: packsPerDay,
          dailyAmount: newDailyAmount,
          dailyCost: newDailyCost
        }));
        
        dispatch(updateUserProfile({
          dailyAmount: newDailyAmount,
          dailyCost: newDailyCost,
          category: productInfo.id
        }));
      } else if (productInfo.id === 'pouches') {
        const tinsPerDay = newDailyAmount / 15;
        
        dispatch(updateUserData({
          nicotineProduct: {
            ...currentProfile.nicotineProduct,
            category: 'pouches',
            dailyAmount: newDailyAmount
          },
          dailyAmount: newDailyAmount,
          tinsPerDay: tinsPerDay,
          dailyCost: newDailyCost
        }));
        
        dispatch(updateUserProfile({
          dailyAmount: newDailyAmount,
          dailyCost: newDailyCost,
          category: productInfo.id
        }));
      } else if (productInfo.id === 'vape') {
        dispatch(updateUserData({
          podsPerDay: newDailyAmount,
          dailyAmount: newDailyAmount,
          dailyCost: newDailyCost
        }));
        
        dispatch(updateUserProfile({
          dailyAmount: newDailyAmount,
          dailyCost: newDailyCost,
          category: productInfo.id
        }));
      } else if (productInfo.id === 'chewing') {
        dispatch(updateUserData({
          nicotineProduct: {
            ...currentProfile.nicotineProduct,
            category: 'chewing',
            dailyAmount: newDailyAmount
          },
          dailyAmount: newDailyAmount,
          tinsPerDay: newDailyAmount,
          dailyCost: newDailyCost
        }));
        
        dispatch(updateUserProfile({
          dailyAmount: newDailyAmount,
          dailyCost: newDailyCost,
          category: productInfo.id
        }));
      }
      
      // Save to AsyncStorage for persistence
      await AsyncStorage.setItem('@custom_daily_amount', newDailyAmount.toString());
      
      // Show success
      setShowSuccess(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to update daily amount. Please try again.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'formSheet' : 'pageSheet'}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={['#000000', '#0A0F1C']}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Minimal Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <Animated.View 
              style={[
                styles.contentContainer,
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
              <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
                scrollEnabled={false}
              >
                {/* Title Section */}
                <View style={styles.titleSection}>
                  <Text style={styles.titleLabel}>Total Avoided</Text>
                  <Text style={styles.titleAmount}>
                    {formatUnitsDisplay(totalUnitsAvoided, currentProfile)}
                  </Text>
                  <Text style={styles.subtitle}>
                    in {stats?.daysClean || 0} days
                  </Text>
                </View>

                {/* Daily Usage Input */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Daily Usage</Text>
                  <View style={styles.inputRow}>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        value={tempDailyAmount}
                        onChangeText={(text) => {
                          const cleaned = text.replace(/[^0-9.]/g, '');
                          const parts = cleaned.split('.');
                          if (parts.length > 2) return;
                          if (parts[1] && parts[1].length > 2) return;
                          setTempDailyAmount(cleaned);
                        }}
                        keyboardType="decimal-pad"
                        placeholder="0"
                        placeholderTextColor="rgba(255, 255, 255, 0.2)"
                        returnKeyType="done"
                        onSubmitEditing={handleSave}
                        blurOnSubmit={true}
                      />
                      <Text style={styles.inputUnit}>
                        {parseFloat(tempDailyAmount) === 1 ? productInfo.singularUnit : productInfo.pluralUnit}/day
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={[styles.updateButton, showSuccess && styles.updateButtonSuccess]}
                      onPress={handleSave}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.updateButtonText}>
                        {showSuccess ? 'Saved' : 'Update'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Impact Grid */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Your Impact</Text>
                  <View style={styles.impactGrid}>
                    <View style={styles.impactRow}>
                      <View style={styles.impactItem}>
                        <View style={styles.impactIcon}>
                          <Ionicons name="calendar-outline" size={18} color="#8B5CF6" />
                        </View>
                        <Text style={styles.impactValue}>{stats?.daysClean || 0}</Text>
                        <Text style={styles.impactLabel}>Days Clean</Text>
                      </View>
                      <View style={styles.impactDivider} />
                      <View style={styles.impactItem}>
                        <View style={styles.impactIcon}>
                          <Ionicons name="shield-checkmark-outline" size={18} color="#10B981" />
                        </View>
                        <Text style={styles.impactValue}>
                          {Math.round(totalUnitsAvoided).toLocaleString()}
                        </Text>
                        <Text style={styles.impactLabel}>{productInfo.pluralUnit}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.impactRowDivider} />
                    
                    <View style={styles.impactRow}>
                      <View style={styles.impactItem}>
                        <View style={styles.impactIcon}>
                          <Ionicons name="water-outline" size={18} color="#F59E0B" />
                        </View>
                        <Text style={styles.impactValue}>
                          {productInfo.id === 'cigarettes' 
                            ? Math.round(totalUnitsAvoided * 1.2)
                            : productInfo.id === 'vape'
                            ? Math.round(totalUnitsAvoided * 35)
                            : productInfo.id === 'pouches'
                            ? Math.round(totalUnitsAvoided * 6)
                            : Math.round(totalUnitsAvoided * 5.8)}mg
                        </Text>
                        <Text style={styles.impactLabel}>Nicotine</Text>
                      </View>
                      <View style={styles.impactDivider} />
                      <View style={styles.impactItem}>
                        <View style={styles.impactIcon}>
                          <Ionicons name="trending-up-outline" size={18} color="#EC4899" />
                        </View>
                        <Text style={styles.impactValue}>
                          {currentDailyAmount}
                        </Text>
                        <Text style={styles.impactLabel}>Daily Avg</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Health Note */}
                <View style={styles.healthNote}>
                  <Ionicons name="heart-outline" size={16} color="#10B981" />
                  <Text style={styles.healthNoteText}>
                    Your body is healing and recovering every single day
                  </Text>
                </View>
              </ScrollView>
            </Animated.View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: SPACING.md,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
  },

  // Title Section
  titleSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  titleLabel: {
    fontSize: FONTS.xs,
    fontWeight: '500',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  titleAmount: {
    fontSize: FONTS['4xl'],
    fontWeight: '300',
    color: COLORS.text,
    letterSpacing: -1.5,
    lineHeight: FONTS['4xl'] * 1.1,
  },
  subtitle: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    fontWeight: '400',
    marginTop: 2,
  },

  // Section Styles
  section: {
    marginBottom: SPACING.xl,
  },
  sectionLabel: {
    fontSize: FONTS.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },

  // Input Row
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 44,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  input: {
    flex: 1,
    fontSize: FONTS.base,
    fontWeight: '400',
    color: COLORS.text,
    paddingVertical: SPACING.sm,
  },
  inputUnit: {
    fontSize: FONTS.sm,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  updateButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  updateButtonSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  updateButtonText: {
    fontSize: FONTS.sm,
    fontWeight: '600',
    color: COLORS.text,
  },

  // Impact Grid - 2x2
  impactGrid: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  impactRow: {
    flexDirection: 'row',
  },
  impactRowDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  impactItem: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  impactDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  impactIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  impactValue: {
    fontSize: FONTS.lg,
    fontWeight: '400',
    color: COLORS.text,
  },
  impactLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // Health Note
  healthNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
  },
  healthNoteText: {
    fontSize: FONTS.sm,
    color: COLORS.text,
    fontWeight: '400',
  },
});

export default AvoidedCalculatorModal; 