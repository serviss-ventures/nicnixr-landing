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
  getProductInfo,
  getDailyUnits,
  formatUnitsDisplay,
  calculateDailyCost,
  getCostPerPackage
} from '../../services/productService';

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
  
  // Use Redux user data first, then fall back to props
  const currentProfile = reduxUser || userProfile;
  
  // Get product info from our new service
  const productInfo = getProductInfo(currentProfile);
  
  useEffect(() => {
    if (visible) {
      // Get current daily amount from our service
      const currentAmount = getDailyUnits(currentProfile);
      setTempDailyAmount(currentAmount.toString());
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
                <Ionicons name={productInfo.icon as any} size={24} color="#6366F1" />
              </View>
              <Text style={styles.title}>{productInfo.displayName} Calculator</Text>
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
                <Text style={styles.productName}>{productInfo.displayName}</Text>
                <Text style={styles.productExample}>
                  {productInfo.unitsPerPackage > 1 
                    ? `${productInfo.unitsPerPackage} ${productInfo.pluralUnit} = 1 ${productInfo.packageName}`
                    : `Track your daily ${productInfo.pluralUnit}`}
                </Text>
              </View>

              {/* Daily Usage Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>
                  Daily {productInfo.pluralUnit} consumed
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
                    {parseFloat(tempDailyAmount) === 1 ? productInfo.singularUnit : productInfo.pluralUnit}
                  </Text>
                </View>
                <Text style={styles.inputHint}>
                  How many {productInfo.pluralUnit} did you typically consume per day?
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
                      {currentDailyAmount} {currentDailyAmount === 1 ? productInfo.singularUnit : productInfo.pluralUnit}
                    </Text>
                  </View>
                  
                  <View style={styles.calculationDivider} />
                  
                  <View style={styles.calculationRow}>
                    <Text style={styles.calculationLabel}>Total avoided:</Text>
                    <Text style={[styles.calculationValue, styles.calculationTotal]}>
                      {formatUnitsDisplay(totalUnitsAvoided, currentProfile)}
                    </Text>
                  </View>
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