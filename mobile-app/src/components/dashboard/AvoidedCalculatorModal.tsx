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
                {/* Avoided Amount */}
                <View style={styles.heroSection}>
                  <Text style={styles.heroLabel}>Total Avoided</Text>
                  <Text style={styles.heroAmount}>
                    {formatUnitsDisplay(totalUnitsAvoided, currentProfile)}
                  </Text>
                  <Text style={styles.heroSubtext}>
                    Based on {currentDailyAmount} {currentDailyAmount === 1 ? productInfo.singularUnit : productInfo.pluralUnit} daily
                  </Text>
                </View>

                {/* Daily Usage Setting */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Your Daily Usage</Text>
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
                  <Text style={styles.hint}>
                    Adjust to calculate your actual avoided amount
                  </Text>
                </View>

                {/* What You've Avoided */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>What You've Avoided</Text>
                  <View style={styles.avoidedGrid}>
                    <View style={styles.avoidedItem}>
                      <View style={styles.avoidedIcon}>
                        <Ionicons name="water-outline" size={20} color="#F59E0B" />
                      </View>
                      <Text style={styles.avoidedValue}>
                        {productInfo.id === 'cigarettes' 
                          ? `${Math.round(totalUnitsAvoided * 1.2).toLocaleString()}mg`
                          : productInfo.id === 'vape'
                          ? `${Math.round(totalUnitsAvoided * 35).toLocaleString()}mg`
                          : productInfo.id === 'pouches'
                          ? `${Math.round(totalUnitsAvoided * 6).toLocaleString()}mg`
                          : `${Math.round(totalUnitsAvoided * 5.8).toLocaleString()}mg`}
                      </Text>
                      <Text style={styles.avoidedLabel}>Nicotine</Text>
                    </View>
                    
                    {productInfo.id === 'cigarettes' && (
                      <>
                        <View style={styles.avoidedDivider} />
                        <View style={styles.avoidedItem}>
                          <View style={styles.avoidedIcon}>
                            <Ionicons name="warning-outline" size={20} color="#EF4444" />
                          </View>
                          <Text style={styles.avoidedValue}>
                            {Math.round(totalUnitsAvoided * 12).toLocaleString()}mg
                          </Text>
                          <Text style={styles.avoidedLabel}>Tar</Text>
                        </View>
                      </>
                    )}
                    
                    {productInfo.id === 'vape' && (
                      <>
                        <View style={styles.avoidedDivider} />
                        <View style={styles.avoidedItem}>
                          <View style={styles.avoidedIcon}>
                            <Ionicons name="flask-outline" size={20} color="#8B5CF6" />
                          </View>
                          <Text style={styles.avoidedValue}>
                            {Math.round(totalUnitsAvoided * 2).toLocaleString()}ml
                          </Text>
                          <Text style={styles.avoidedLabel}>Chemicals</Text>
                        </View>
                      </>
                    )}
                  </View>
                </View>

                {/* Calculation Note */}
                <View style={styles.calcNote}>
                  <Text style={styles.calcNoteText}>
                    Calculated as {stats?.daysClean || 0} days × {currentDailyAmount} {currentDailyAmount === 1 ? productInfo.singularUnit : productInfo.pluralUnit}
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

  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl * 1.5,
    paddingTop: SPACING.lg,
  },
  heroLabel: {
    fontSize: FONTS.sm,
    fontWeight: '500',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  heroAmount: {
    fontSize: FONTS['5xl'],
    fontWeight: '300',
    color: COLORS.text,
    letterSpacing: -2,
    marginBottom: SPACING.xs,
  },
  heroSubtext: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    fontWeight: '400',
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

  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  input: {
    flex: 1,
    fontSize: FONTS.lg,
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
    paddingVertical: 12,
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
  hint: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    fontWeight: '400',
  },

  // Avoided Grid
  avoidedGrid: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  avoidedItem: {
    flex: 1,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  avoidedDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  avoidedIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avoidedValue: {
    fontSize: FONTS['2xl'],
    fontWeight: '300',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  avoidedLabel: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // Calculation Note
  calcNote: {
    alignItems: 'center',
    paddingTop: SPACING.sm,
  },
  calcNoteText: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    fontWeight: '400',
    fontStyle: 'italic',
  },
});

export default AvoidedCalculatorModal; 