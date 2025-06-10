import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, Animated, ScrollView, SafeAreaView, StatusBar } from 'react-native';
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
    category: 'pouches', 
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
];

const NicotineProfileStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stepData } = useSelector((state: RootState) => state.onboarding);

  const [selectedProduct, setSelectedProduct] = useState<NicotineProductOption | null>(
    stepData.nicotineProduct ? NICOTINE_PRODUCTS.find(p => p.id === stepData.nicotineProduct?.id) || null : null
  );
  const [dailyAmount, setDailyAmount] = useState(stepData?.dailyAmount !== undefined && stepData?.dailyAmount !== null ? stepData.dailyAmount.toString() : '');
  const [showAmountInput, setShowAmountInput] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const amountFadeAnim = useRef(new Animated.Value(0)).current;

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

    const profileData: any = {
      nicotineProduct: {
        id: selectedProduct.id,
        name: selectedProduct.name,
        category: selectedProduct.category,
        avgCostPerDay: selectedProduct.avgCostPerDay,
        nicotineContent: 0,
        harmLevel: 5,
      },
      customNicotineProduct: '',
      usageDuration: '1_to_3_years',
      dailyAmount: parseFloat(dailyAmount),
      dailyCost: selectedProduct.avgCostPerDay,
    };

    // Add product-specific data
    if (selectedProduct.category === 'vape') {
      profileData.podsPerDay = parseFloat(dailyAmount);
    } else if (selectedProduct.category === 'cigarettes') {
      profileData.packagesPerDay = parseFloat(dailyAmount) / 20; // Convert cigarettes to packs
    } else if (selectedProduct.category === 'chewing') {
      profileData.tinsPerDay = parseFloat(dailyAmount);
    } else if (selectedProduct.id === 'zyn' || selectedProduct.category === 'other') {
      // For pouches (often saved as 'other' with id 'zyn')
      profileData.tinsPerDay = parseFloat(dailyAmount) / 15; // Convert pouches to tins
    }

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
        return 'Tins per day';
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
        return 'Most users go through 0.5-1 tin per day';
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
        return '0.7';
      default:
        return 'Enter amount';
    }
  };

  return (
    <>
      {!showAmountInput ? (
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
                style={[styles.progressFill, { width: `${(3/9) * 100}%` }]}
              />
            </View>
                            <Text style={styles.progressText}>Step 3 of 9</Text>
          </View>

          <View style={styles.content}>
            {/* Header - Only show when product selection is active */}
            <View style={styles.header}>
              <Text style={styles.title}>What&apos;s your nicotine of choice?</Text>
              <Text style={styles.subtitle}>Select your primary nicotine product</Text>
            </View>

            {/* Product Grid */}
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
                    ]}
                    onPress={() => handleProductSelect(product)}
                  >
                    <View style={[styles.productIconContainer, { backgroundColor: product.iconBg }]}>
                      <Ionicons name={product.iconName} size={32} color={product.iconColor} />
                    </View>
                    <Text style={[
                      styles.productName,
                      selectedProduct?.id === product.id && styles.productNameSelected,
                    ]}>
                      {product.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </View>

          {/* Navigation - Only show when not in amount input mode */}
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
      ) : null}

      {/* Amount Input Overlay - Full screen overlay when shown */}
      {selectedProduct && showAmountInput && (
        <Animated.View 
          style={[
            styles.amountInputOverlay,
            {
              opacity: amountFadeAnim,
            }
          ]}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
            <StatusBar backgroundColor="#000000" barStyle="light-content" />
            
            <View style={styles.amountContainer}>
              {/* Scrollable content area */}
              <ScrollView 
                contentContainerStyle={styles.amountScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {/* Header for amount input */}
                <View style={styles.amountHeader}>
                  <Text style={[styles.title, { fontSize: 22 }]}>
                    {selectedProduct.category === 'cigarettes' || 
                     selectedProduct.id === 'zyn' || 
                     selectedProduct.category === 'vape' ? 
                      `How many ${selectedProduct.name.toLowerCase()} do you ${selectedProduct.category === 'cigarettes' ? 'smoke' : 'use'}?` :
                      `How much ${selectedProduct.name.toLowerCase()} do you use?`
                    }
                  </Text>
                  <Text style={[styles.subtitle, { fontSize: 14 }]}>
                    Just a rough estimate - we&apos;ll use this to track your progress
                  </Text>
                </View>

                <View style={styles.selectedProductDisplay}>
                  <TouchableOpacity
                    style={[styles.selectedIconContainer, { backgroundColor: selectedProduct.iconBg }]}
                    onPress={() => handleProductSelect(selectedProduct)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={selectedProduct.iconName} size={28} color={selectedProduct.iconColor} />
                  </TouchableOpacity>
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
                    autoFocus={true}
                    selectTextOnFocus={true}
                    returnKeyType="done"
                    blurOnSubmit={true}
                    onSubmitEditing={handleContinue}
                  />
                  <Text style={styles.inputUnit}>
                    per day
                  </Text>
                </View>
                
                <Text style={styles.helperText}>{getHelperText()}</Text>
                
                {/* Add extra space at bottom for keyboard */}
                <View style={{ height: 200 }} />
              </ScrollView>

              {/* Fixed bottom buttons */}
              <View style={styles.amountActions}>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => handleProductSelect(selectedProduct)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.doneButton,
                    (!dailyAmount || parseFloat(dailyAmount) <= 0) && styles.doneButtonDisabled
                  ]} 
                  onPress={handleContinue}
                  disabled={!dailyAmount || parseFloat(dailyAmount) <= 0}
                >
                  <LinearGradient
                    colors={
                      dailyAmount && parseFloat(dailyAmount) > 0
                        ? [COLORS.primary, COLORS.secondary]
                        : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
                    }
                    style={styles.doneButtonGradient}
                  >
                    <Text style={[
                      styles.doneButtonText,
                      (!dailyAmount || parseFloat(dailyAmount) <= 0) && styles.doneButtonTextDisabled
                    ]}>
                      Continue
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Animated.View>
      )}
    </>
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
    paddingHorizontal: SPACING.sm,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  productCard: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  productCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
    transform: [{ scale: 1.02 }],
  },
  productIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  productNameSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  amountInputOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 9999,
    elevation: 999,
  },
  amountContainer: {
    flex: 1,
  },
  amountScrollContent: {
    paddingTop: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
  },
  amountHeader: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  selectedProductDisplay: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  selectedIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: SPACING.xs,
  },
  changeProductHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  numberInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    fontSize: 24,
    color: COLORS.text,
    borderWidth: 2,
    borderColor: COLORS.primary,
    textAlign: 'center',
    fontWeight: '600',
    minWidth: 100,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  inputUnit: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.lg,
  },
  amountActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xl * 2 : SPACING.xl,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  cancelButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  doneButton: {
    flex: 1,
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  doneButtonGradient: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  doneButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  doneButtonTextDisabled: {
    color: COLORS.textMuted,
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