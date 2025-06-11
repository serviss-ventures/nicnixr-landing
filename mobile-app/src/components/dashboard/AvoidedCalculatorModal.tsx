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
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserData, selectUser } from '../../store/slices/authSlice';
import { updateStats, updateProgress, updateUserProfile, selectProgressStats } from '../../store/slices/progressSlice';
import { AppDispatch, RootState } from '../../store/store';
import { 
  getProductDetails, 
  normalizeProductCategory,
  getDailyUnits 
} from '../../utils/nicotineProducts';
import { calculateNewDailyCost } from '../../utils/costCalculations';

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
  const reduxStats = useSelector(selectProgressStats); // Get latest stats from Redux
  const reduxUser = useSelector(selectUser); // Get latest user data from Redux
  const [tempDailyAmount, setTempDailyAmount] = useState('1');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Get normalized product category
  const productCategory = normalizeProductCategory(userProfile);
  
  // Debug logging
  if (__DEV__ && visible) {
    console.log('🔍 AvoidedCalculatorModal userProfile:', userProfile);
    console.log('🔍 AvoidedCalculatorModal productCategory:', productCategory);
  }
  
  // Use Redux user data first, then fall back to props
  const currentProfile = reduxUser || userProfile;
  
  useEffect(() => {
    if (visible) {
      // Get current daily amount in units from shared utility
      const currentAmount = getDailyUnits(currentProfile, productCategory);
      setTempDailyAmount(currentAmount.toString());
    }
  }, [visible, userProfile, currentProfile, productCategory]);
  
  // Get product details from shared utility
  const productDetails = getProductDetails(productCategory);
  const currentDailyAmount = parseFloat(tempDailyAmount) || 1;
  
  // Calculate totals
  const totalUnitsAvoided = currentDailyAmount * (stats?.daysClean || 0);
  const packagesAvoided = totalUnitsAvoided / productDetails.perPackage;
  
  const handleSave = async () => {
    try {
      const newDailyAmount = parseFloat(tempDailyAmount) || 1;
      
      // Calculate new daily cost using utility
      const newDailyCost = calculateNewDailyCost(newDailyAmount, reduxUser || userProfile, productCategory);
      
      // Update user profile based on product type
      if (productCategory === 'cigarettes') {
        const packsPerDay = newDailyAmount / 20;
        
        dispatch(updateUserData({
          packagesPerDay: packsPerDay,
          dailyAmount: newDailyAmount,
          dailyCost: newDailyCost
        }));
        
        dispatch(updateUserProfile({
          dailyAmount: newDailyAmount,
          dailyCost: newDailyCost,
          category: productCategory
        }));
      } else if (productCategory === 'pouches') {
        const tinsPerDay = newDailyAmount / 15;
        
        dispatch(updateUserData({
          nicotineProduct: {
            ...userProfile,
            dailyAmount: newDailyAmount
          },
          dailyAmount: newDailyAmount,
          tinsPerDay: tinsPerDay,
          dailyCost: newDailyCost
        }));
        
        dispatch(updateUserProfile({
          dailyAmount: newDailyAmount,
          dailyCost: newDailyCost,
          category: productCategory
        }));
      } else if (productCategory === 'vape') {
        dispatch(updateUserData({
          podsPerDay: newDailyAmount,
          dailyAmount: newDailyAmount,
          dailyCost: newDailyCost
        }));
        
        dispatch(updateUserProfile({
          dailyAmount: newDailyAmount,
          dailyCost: newDailyCost,
          category: productCategory
        }));
      } else if (productCategory === 'chewing') {
        const tinsPerDay = newDailyAmount;
        
        dispatch(updateUserData({
          nicotineProduct: {
            ...userProfile,
            category: productCategory,
            dailyAmount: tinsPerDay
          },
          dailyAmount: tinsPerDay,
          tinsPerDay: tinsPerDay,
          dailyCost: newDailyCost
        }));
        
        dispatch(updateUserProfile({
          dailyAmount: tinsPerDay,
          dailyCost: newDailyCost,
          category: productCategory
        }));
      }
      
      // Save to AsyncStorage for persistence
      await AsyncStorage.setItem('@custom_daily_amount', newDailyAmount.toString());
      
      // Show success
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1500);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to update daily amount. Please try again.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      presentationStyle={Platform.OS === 'ios' ? 'overFullScreen' : 'fullScreen'}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <SafeAreaView style={styles.modalContainer} edges={['bottom']}>
          <LinearGradient
            colors={['#0F172A', '#1E293B']}
            style={styles.content}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Ionicons name={productDetails.icon as any} size={24} color="#6366F1" />
              </View>
              <Text style={styles.title}>Units Avoided Calculator</Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Product Info */}
              <View style={styles.productInfo}>
                <Text style={styles.productLabel}>Your Product</Text>
                <Text style={styles.productName}>
                  {productCategory === 'other' 
                    ? 'Nicotine Product' 
                    : productCategory === 'pouches'
                    ? 'Nicotine Pouches'
                    : productCategory.charAt(0).toUpperCase() + productCategory.slice(1).replace('_', ' ')}
                </Text>
                <Text style={styles.productExample}>{productDetails.example}</Text>
              </View>

              {/* Daily Usage Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>
                  Daily {productDetails.unitPlural} consumed
                </Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={tempDailyAmount}
                    onChangeText={(text) => {
                      // Allow only numbers and decimal point
                      const cleaned = text.replace(/[^0-9.]/g, '');
                      // Prevent multiple decimal points
                      const parts = cleaned.split('.');
                      if (parts.length > 2) return;
                      // Limit to 2 decimal places
                      if (parts[1] && parts[1].length > 2) return;
                      setTempDailyAmount(cleaned);
                    }}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={COLORS.textMuted}
                    maxLength={6}
                  />
                  <Text style={styles.inputUnit}>
                    {parseFloat(tempDailyAmount) === 1 ? productDetails.unit : productDetails.unitPlural}
                  </Text>
                </View>
                <Text style={styles.inputHint}>
                  {productCategory === 'chewing' 
                    ? `How many tins did you typically consume per day?`
                    : `How many ${productDetails.unitPlural} did you typically consume per day?`
                  }
                </Text>
              </View>

              {/* Calculation Display */}
              <View style={styles.calculationSection}>
                <Text style={styles.calculationTitle}>Your Progress</Text>
                
                <View style={styles.calculationCard}>
                  <View style={styles.calculationRow}>
                    <Text style={styles.calculationLabel}>Days clean:</Text>
                    <Text style={styles.calculationValue}>{stats?.daysClean || 0}</Text>
                  </View>
                  
                  <View style={styles.calculationDivider} />
                  
                  <View style={styles.calculationRow}>
                    <Text style={styles.calculationLabel}>Daily usage:</Text>
                    <Text style={styles.calculationValue}>
                      {currentDailyAmount} {currentDailyAmount === 1 ? productDetails.unit : productDetails.unitPlural}
                    </Text>
                  </View>
                  
                  <View style={styles.calculationDivider} />
                  
                  <View style={styles.calculationRow}>
                    <Text style={styles.calculationLabel}>Total avoided:</Text>
                    <Text style={[styles.calculationValue, styles.calculationTotal]}>
                      {totalUnitsAvoided % 1 === 0 ? totalUnitsAvoided : totalUnitsAvoided.toFixed(1)} {totalUnitsAvoided === 1 ? productDetails.unit : productDetails.unitPlural}
                    </Text>
                  </View>
                  
                  {productDetails.perPackage > 1 && (
                    <>
                      <View style={styles.calculationDivider} />
                      <View style={styles.calculationRow}>
                        <Text style={styles.calculationLabel}>Equals:</Text>
                        <Text style={[styles.calculationValue, styles.calculationHighlight]}>
                          {packagesAvoided >= 1 
                            ? `${packagesAvoided % 1 === 0 ? packagesAvoided : packagesAvoided.toFixed(1)} ${Math.round(packagesAvoided) === 1 ? productDetails.packageName : productDetails.packageNamePlural}`
                            : `${totalUnitsAvoided % 1 === 0 ? totalUnitsAvoided : totalUnitsAvoided.toFixed(1)} ${totalUnitsAvoided === 1 ? productDetails.unit : productDetails.unitPlural}`
                          }
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  style={styles.saveButtonGradient}
                >
                  {showSuccess ? (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="white" />
                      <Text style={styles.saveButtonText}>Updated!</Text>
                    </>
                  ) : (
                    <Text style={styles.saveButtonText}>Update Daily Usage</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </LinearGradient>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '85%',
  },
  content: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 20 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginLeft: SPACING.md,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl, // Reduced padding for better fit
  },
  productInfo: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  productLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  productExample: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  inputSection: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    paddingVertical: SPACING.md,
  },
  inputUnit: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  inputHint: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  calculationSection: {
    marginBottom: SPACING.md,
  },
  calculationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  calculationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  calculationLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  calculationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  calculationTotal: {
    color: COLORS.primary,
  },
  calculationHighlight: {
    color: '#6366F1',
    fontSize: 18,
  },
  calculationDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: SPACING.xs,
  },
  saveButton: {
    marginTop: SPACING.xs,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: 12,
    gap: SPACING.xs,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
});

export default AvoidedCalculatorModal; 