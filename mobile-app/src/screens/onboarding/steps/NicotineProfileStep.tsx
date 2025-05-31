import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { nextStep, previousStep, updateStepData, saveOnboardingProgress } from '../../../store/slices/onboardingSlice';
import { COLORS, SPACING } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface NicotineProductOption {
  id: string;
  name: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  category: 'cigarettes' | 'vape' | 'cigars' | 'chewing' | 'patches' | 'gum' | 'other';
  description: string;
  avgCostPerDay: number;
}

const NICOTINE_PRODUCTS: NicotineProductOption[] = [
  { 
    id: 'cigarettes', 
    name: 'Cigarettes', 
    iconName: 'flame-outline',
    iconColor: '#FF6B6B',
    iconBg: 'rgba(255, 107, 107, 0.15)',
    category: 'cigarettes', 
    description: 'Traditional cigarettes', 
    avgCostPerDay: 15 
  },
  { 
    id: 'vape', 
    name: 'Vape', 
    iconName: 'cloud-outline',
    iconColor: '#4ECDC4',
    iconBg: 'rgba(78, 205, 196, 0.15)',
    category: 'vape', 
    description: 'E-cigarettes, pods', 
    avgCostPerDay: 8 
  },
  { 
    id: 'zyn', 
    name: 'Nicotine Pouches', 
    iconName: 'ellipse-outline',
    iconColor: '#A8E6CF',
    iconBg: 'rgba(168, 230, 207, 0.15)',
    category: 'other', 
    description: 'Nicotine pouches', 
    avgCostPerDay: 6 
  },
  { 
    id: 'chewing', 
    name: 'Chew/Dip', 
    iconName: 'leaf-outline',
    iconColor: '#DDA0DD',
    iconBg: 'rgba(221, 160, 221, 0.15)',
    category: 'chewing', 
    description: 'Chewing tobacco', 
    avgCostPerDay: 6 
  },
  { 
    id: 'other', 
    name: 'Other', 
    iconName: 'help-circle-outline',
    iconColor: '#FFB347',
    iconBg: 'rgba(255, 179, 71, 0.15)',
    category: 'other', 
    description: 'Something else', 
    avgCostPerDay: 10 
  },
];

const NicotineProfileStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stepData } = useSelector((state: RootState) => state.onboarding);

  const [selectedProduct, setSelectedProduct] = useState<NicotineProductOption | null>(
    stepData.nicotineProduct ? NICOTINE_PRODUCTS.find(p => p.id === stepData.nicotineProduct?.id) || null : null
  );
  const [customProduct, setCustomProduct] = useState(stepData.customNicotineProduct || '');
  const [dailyAmount, setDailyAmount] = useState(stepData?.dailyAmount !== undefined && stepData?.dailyAmount !== null ? stepData.dailyAmount.toString() : '');
  const [showAmountInput, setShowAmountInput] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const amountFadeAnim = useRef(new Animated.Value(0)).current;
  const amountSlideAnim = useRef(new Animated.Value(50)).current;

  // If we already have a selected product, show the amount input immediately
  useEffect(() => {
    if (selectedProduct && !showAmountInput) {
      setShowAmountInput(true);
      // Animate in the amount input
      Animated.parallel([
        Animated.timing(amountFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(amountSlideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, []);

  const handleProductSelect = (product: NicotineProductOption) => {
    if (selectedProduct?.id === product.id && showAmountInput) {
      // If clicking the same product, go back to product selection
      setShowAmountInput(false);
      setSelectedProduct(null);
      setDailyAmount('');
      
      // Animate back to product selection
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(amountFadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      setSelectedProduct(product);
      setDailyAmount('');
      
      // Animate transition to amount input
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(amountFadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(amountSlideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setShowAmountInput(true);
      });
    }
  };

  const handleAmountChange = (text: string) => {
    // Remove any non-numeric characters except decimal point
    const numericText = text.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = numericText.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limit to reasonable numbers (max 999)
    const number = parseFloat(numericText);
    if (number > 999) {
      return;
    }
    
    setDailyAmount(numericText);
  };

  const handleContinue = async () => {
    if (!selectedProduct) {
      Alert.alert('Please select your nicotine product', 'This helps us create your personalized plan.');
      return;
    }

    if (!dailyAmount || parseFloat(dailyAmount) <= 0) {
      Alert.alert('Please enter your daily usage', 'We need this to calculate your progress milestones.');
      return;
    }

    const profileData = {
      nicotineProduct: {
        id: selectedProduct.id,
        name: selectedProduct.name,
        category: selectedProduct.category,
        avgCostPerDay: selectedProduct.avgCostPerDay,
        nicotineContent: 0,
        harmLevel: 5,
      },
      customNicotineProduct: selectedProduct.id === 'other' ? customProduct : '',
      usageDuration: '1_to_3_years',
      dailyAmount: parseFloat(dailyAmount),
      dailyCost: selectedProduct.avgCostPerDay,
    };

    console.log('💾 Saving nicotine profile data:', profileData);

    dispatch(updateStepData(profileData));
    await dispatch(saveOnboardingProgress(profileData));
    
    console.log('✅ Nicotine profile saved successfully');
    
    dispatch(nextStep());
  };

  const handleBack = () => {
    dispatch(previousStep());
  };

  const getAmountLabel = () => {
    if (!selectedProduct) return 'Amount per day';
    
    switch (selectedProduct.category) {
      case 'cigarettes':
        return 'Cigarettes per day';
      case 'other':
        return selectedProduct.id === 'zyn' ? 'Pouches per day' : 'Amount per day';
      case 'vape':
        return 'Pods/cartridges per day';
      case 'cigars':
        return 'Cigars per day';
      case 'chewing':
        return 'Cans/pouches per week';
      default:
        return 'Amount per day';
    }
  };

  const getHelperText = () => {
    if (!selectedProduct) return '';
    
    switch (selectedProduct.category) {
      case 'cigarettes':
        return 'Most people smoke about 20 cigarettes (1 pack) per day';
      case 'other':
        if (selectedProduct.id === 'zyn') {
          return 'Most people use 8-15 pouches daily';
        }
        return 'Just your best estimate';
      case 'vape':
        return 'A typical pod lasts 1-2 days for most users';
      case 'chewing':
        return 'Most users go through 3-5 cans per week';
      default:
        return 'Just your best estimate';
    }
  };

  const getPlaceholder = () => {
    if (!selectedProduct) return 'Enter amount';
    
    switch (selectedProduct.category) {
      case 'cigarettes':
        return '20';
      case 'other':
        return selectedProduct.id === 'zyn' ? '10' : 'Enter amount';
      case 'vape':
        return '1';
      case 'chewing':
        return '3.5';
      default:
        return 'Enter amount';
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
    >
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={[styles.progressFill, { width: '25%' }]}
          />
        </View>
        <Text style={styles.progressText}>Step 2 of 9</Text>
      </View>

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {showAmountInput && selectedProduct 
              ? `How much ${selectedProduct.name.toLowerCase()} do you use?`
              : 'What\'s your nicotine of choice?'
            }
          </Text>
          <Text style={styles.subtitle}>
            {showAmountInput && selectedProduct 
              ? 'Just a rough estimate - we\'ll use this to track your progress'
              : 'Select your primary nicotine product'
            }
          </Text>
        </View>

        {/* Product Grid - Always visible but faded when amount input is shown */}
        <Animated.View 
          style={[
            styles.productsContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          <View style={styles.productsGrid}>
            {NICOTINE_PRODUCTS.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={[
                  styles.productCard,
                  selectedProduct?.id === product.id && styles.productCardSelected,
                  showAmountInput && selectedProduct?.id !== product.id && styles.productCardDisabled,
                ]}
                onPress={() => handleProductSelect(product)}
                disabled={showAmountInput && selectedProduct?.id !== product.id}
              >
                <View style={[styles.productIconContainer, { backgroundColor: product.iconBg }]}>
                  <Ionicons name={product.iconName} size={24} color={product.iconColor} />
                </View>
                <Text style={[
                  styles.productName,
                  selectedProduct?.id === product.id && styles.productNameSelected,
                  showAmountInput && selectedProduct?.id !== product.id && styles.productNameDisabled,
                ]}>
                  {product.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Amount Input - Overlays the product grid when shown */}
        {selectedProduct && (
          <Animated.View 
            style={[
              styles.amountInputContainer,
              {
                opacity: amountFadeAnim,
                transform: [{ translateY: amountSlideAnim }],
              }
            ]}
            pointerEvents={showAmountInput ? 'auto' : 'none'}
          >
            <View style={styles.selectedProductDisplay}>
              <View style={[styles.selectedIconContainer, { backgroundColor: selectedProduct.iconBg }]}>
                <Ionicons name={selectedProduct.iconName} size={32} color={selectedProduct.iconColor} />
              </View>
              <Text style={styles.changeProductHint}>Tap to change</Text>
            </View>

            <Text style={styles.amountLabel}>{getAmountLabel()}</Text>
            
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.numberInput}
                value={dailyAmount}
                onChangeText={handleAmountChange}
                placeholder={getPlaceholder()}
                placeholderTextColor={COLORS.textMuted}
                keyboardType="decimal-pad"
                autoFocus={showAmountInput}
                selectTextOnFocus={true}
                returnKeyType="done"
                blurOnSubmit={true}
              />
              <Text style={styles.inputUnit}>
                {selectedProduct.category === 'chewing' ? 'per week' : 'per day'}
              </Text>
            </View>
            
            <Text style={styles.helperText}>{getHelperText()}</Text>

            {/* Custom Product Input */}
            {selectedProduct?.id === 'other' && (
              <View style={styles.customInputContainer}>
                <TextInput
                  style={styles.customTextInput}
                  value={customProduct}
                  onChangeText={setCustomProduct}
                  placeholder="What product do you use?"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            )}
          </Animated.View>
        )}
      </View>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.continueButton,
            (!selectedProduct || !dailyAmount || parseFloat(dailyAmount) <= 0) && styles.continueButtonDisabled
          ]} 
          onPress={handleContinue}
          disabled={!selectedProduct || !dailyAmount || parseFloat(dailyAmount) <= 0}
        >
          <LinearGradient
            colors={
              selectedProduct && dailyAmount && parseFloat(dailyAmount) > 0
                ? [COLORS.primary, COLORS.secondary]
                : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
            }
            style={styles.continueButtonGradient}
          >
            <Text style={[
              styles.continueButtonText,
              (!selectedProduct || !dailyAmount || parseFloat(dailyAmount) <= 0) && styles.continueButtonTextDisabled
            ]}>
              Next: Your Motivations
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={20} 
              color={
                selectedProduct && dailyAmount && parseFloat(dailyAmount) > 0
                  ? COLORS.text
                  : COLORS.textMuted
              } 
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  progressContainer: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    lineHeight: 32,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  productsContainer: {
    marginBottom: SPACING.lg,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '30%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: SPACING.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  productCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  productCardDisabled: {
    opacity: 0.4,
  },
  productIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  productNameSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  productNameDisabled: {
    color: COLORS.textMuted,
  },
  amountInputContainer: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  selectedProductDisplay: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  selectedIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: SPACING.xs,
  },
  changeProductHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  amountLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  numberInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    fontSize: 32,
    color: COLORS.text,
    borderWidth: 2,
    borderColor: COLORS.primary,
    textAlign: 'center',
    fontWeight: 'bold',
    minWidth: 120,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  inputUnit: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: SPACING.md,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: SPACING.xs,
  },
  customInputContainer: {
    marginTop: SPACING.lg,
    width: '100%',
  },
  customTextInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: SPACING.md,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    textAlign: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING['2xl'],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    marginTop: SPACING.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  continueButton: {
    borderRadius: SPACING.md,
    overflow: 'hidden',
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  continueButtonTextDisabled: {
    color: COLORS.textMuted,
  },
});

export default NicotineProfileStep; 