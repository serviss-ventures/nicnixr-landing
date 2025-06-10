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
import { useDispatch } from 'react-redux';
import { updateUserData } from '../../store/slices/authSlice';
import { updateStats, updateProgress } from '../../store/slices/progressSlice';
import { AppDispatch } from '../../store/store';

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
  };
}

const AvoidedCalculatorModal: React.FC<AvoidedCalculatorModalProps> = ({ 
  visible, 
  onClose, 
  stats, 
  userProfile
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [tempDailyAmount, setTempDailyAmount] = useState('1');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Get category from user profile - check brand and ID for pouches
  let productCategory = userProfile?.category || 'cigarettes';
  
  // Special handling for pouches - they're saved as 'other' category but ID is 'zyn'
  if (productCategory === 'other' && userProfile?.id === 'zyn') {
    productCategory = 'pouches';
  }
  
  // Get current daily amount based on product type
  const getCurrentDailyAmount = () => {
    if (productCategory === 'cigarettes') {
      return userProfile?.packagesPerDay ? userProfile.packagesPerDay * 20 : 20;
    } else if (productCategory === 'pouches') {
      return userProfile?.dailyAmount || (userProfile?.tinsPerDay ? userProfile.tinsPerDay * 15 : 15);
    } else if (productCategory === 'vape' || productCategory === 'vaping') {
      return userProfile?.podsPerDay || 1;
    } else if (['chew', 'dip', 'chew_dip', 'chewing'].includes(productCategory)) {
      // Chew/dip is stored as tins per WEEK in onboarding, convert to daily portions
      const tinsPerWeek = userProfile?.dailyAmount || 3.5; // dailyAmount actually contains weekly for chew
      const tinsPerDay = tinsPerWeek / 7;
      const portionsPerDay = Math.round(tinsPerDay * 5); // 5 portions per tin
      return portionsPerDay;
    }
    return userProfile?.dailyAmount || 1;
  };
  
  useEffect(() => {
    if (visible) {
      setTempDailyAmount(getCurrentDailyAmount().toString());
    }
  }, [visible, userProfile]);
  
  // Get product-specific details
  const getProductDetails = () => {
    switch (productCategory?.toLowerCase()) {
      case 'cigarettes':
      case 'cigarette':
        return {
          unit: 'cigarette',
          unitPlural: 'cigarettes',
          perPackage: 20,
          packageName: 'pack',
          packageNamePlural: 'packs',
          example: '20 cigarettes = 1 pack',
          icon: 'flame'
        };
      case 'vaping':
      case 'vape':
      case 'e-cigarette':
        return {
          unit: 'pod',
          unitPlural: 'pods',
          perPackage: 1,
          packageName: 'pod',
          packageNamePlural: 'pods',
          example: '1 pod per day',
          icon: 'water'
        };
      case 'pouches':
      case 'nicotine_pouches':
      case 'pouch':
        return {
          unit: 'pouch',
          unitPlural: 'pouches',
          perPackage: 15,
          packageName: 'tin',
          packageNamePlural: 'tins',
          example: '15 pouches = 1 tin',
          icon: 'cube'
        };
      case 'chewing':
      case 'chew':
      case 'dip':
      case 'chew_dip':
        return {
          unit: 'portion',
          unitPlural: 'portions',
          perPackage: 5,
          packageName: 'tin',
          packageNamePlural: 'tins',
          example: '5 portions = 1 tin (typically 3-5 tins/week)',
          icon: 'leaf'
        };
      default:
        return {
          unit: 'unit',
          unitPlural: 'units',
          perPackage: 1,
          packageName: 'unit',
          packageNamePlural: 'units',
          example: '1 unit per day',
          icon: 'help-circle'
        };
    }
  };
  
  const productDetails = getProductDetails();
  const currentDailyAmount = parseInt(tempDailyAmount) || 1;
  
  // Calculate totals
  const totalUnitsAvoided = currentDailyAmount * (stats?.daysClean || 0);
  const packagesAvoided = totalUnitsAvoided / productDetails.perPackage;
  
  const handleSave = async () => {
    try {
      const newDailyAmount = parseInt(tempDailyAmount) || 1;
      
      // Update user profile based on product type
      if (productCategory === 'cigarettes') {
        const packsPerDay = newDailyAmount / 20;
        dispatch(updateUserData({
          packagesPerDay: packsPerDay,
          dailyCost: packsPerDay * 10 // Assuming $10 per pack average
        }));
      } else if (productCategory === 'pouches') {
        const tinsPerDay = newDailyAmount / 15;
        dispatch(updateUserData({
          nicotineProduct: {
            ...userProfile,
            dailyAmount: newDailyAmount
          },
          tinsPerDay: tinsPerDay,
          dailyCost: tinsPerDay * 8 // Assuming $8 per tin average
        }));
      } else if (productCategory === 'vape') {
        dispatch(updateUserData({
          podsPerDay: newDailyAmount,
          dailyCost: newDailyAmount * 15 // Assuming $15 per pod average
        }));
      } else if (['chew', 'dip', 'chew_dip', 'chewing'].includes(productCategory)) {
        // Convert daily portions back to weekly tins for storage consistency
        const tinsPerDay = newDailyAmount / 5;
        const tinsPerWeek = tinsPerDay * 7;
        dispatch(updateUserData({
          nicotineProduct: {
            ...userProfile,
            dailyAmount: tinsPerWeek // Store as weekly to match onboarding
          },
          tinsPerDay: tinsPerDay,
          dailyCost: tinsPerDay * 5 // Assuming $5 per tin average
        }));
      }
      
      // Recalculate stats with new daily amount
      const daysClean = stats?.daysClean || 0;
      dispatch(updateStats({
        unitsAvoided: daysClean * newDailyAmount,
      }));
      
      // Save to AsyncStorage for persistence
      await AsyncStorage.setItem('@custom_daily_amount', newDailyAmount.toString());
      
      // Update progress
      await dispatch(updateProgress());
      
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
                  {productCategory.charAt(0).toUpperCase() + productCategory.slice(1).replace('_', ' ')}
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
                    onChangeText={setTempDailyAmount}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={COLORS.textMuted}
                    maxLength={3}
                  />
                  <Text style={styles.inputUnit}>
                    {parseInt(tempDailyAmount) === 1 ? productDetails.unit : productDetails.unitPlural}
                  </Text>
                </View>
                <Text style={styles.inputHint}>
                  How many {productDetails.unitPlural} did you typically consume per day?
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
                      {totalUnitsAvoided} {totalUnitsAvoided === 1 ? productDetails.unit : productDetails.unitPlural}
                    </Text>
                  </View>
                  
                  {productDetails.perPackage > 1 && (
                    <>
                      <View style={styles.calculationDivider} />
                      <View style={styles.calculationRow}>
                        <Text style={styles.calculationLabel}>Equals:</Text>
                        <Text style={[styles.calculationValue, styles.calculationHighlight]}>
                          {packagesAvoided >= 1 
                            ? `${Math.round(packagesAvoided * 10) / 10} ${packagesAvoided === 1 ? productDetails.packageName : productDetails.packageNamePlural}`
                            : `${totalUnitsAvoided} ${totalUnitsAvoided === 1 ? productDetails.unit : productDetails.unitPlural}`
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
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
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
    paddingBottom: SPACING.xl * 2, // Extra padding to ensure button is visible
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
    marginBottom: SPACING.xl,
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
    marginTop: SPACING.md,
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