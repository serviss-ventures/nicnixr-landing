import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, Animated, ScrollView, SafeAreaView, StatusBar, Keyboard } from 'react-native';
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
  category: 'cigarettes' | 'vape' | 'pouches' | 'chewing';
  description: string;
  avgCostPerDay: number;
}

const NICOTINE_PRODUCTS: NicotineProductOption[] = [
  { 
    id: 'cigarettes', 
    name: 'Cigarettes', 
    iconName: 'flame-outline',
    category: 'cigarettes', 
    description: 'Traditional cigarettes', 
    avgCostPerDay: 15 
  },
  { 
    id: 'vape', 
    name: 'Vape', 
    iconName: 'cloud-outline',
    category: 'vape', 
    description: 'E-cigarettes, pods', 
    avgCostPerDay: 8 
  },
  { 
    id: 'zyn', 
    name: 'Nicotine Pouches', 
    iconName: 'ellipse-outline',
    category: 'pouches', 
    description: 'Nicotine pouches', 
    avgCostPerDay: 6 
  },
  { 
    id: 'chewing', 
    name: 'Chew/Dip', 
    iconName: 'leaf-outline',
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
    } else if (selectedProduct.category === 'pouches' || selectedProduct.id === 'zyn') {
      // For pouches - save dailyAmount as pouches per day
      profileData.tinsPerDay = parseFloat(dailyAmount) / 15; // Convert pouches to tins
    }

    dispatch(updateStepData(profileData));
    await dispatch(saveOnboardingProgress(profileData));
    
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
      case 'pouches':
        return 'Pouches per day';
      case 'vape':
        return 'Pods/cartridges per day';
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
      case 'pouches':
        return 'Most people use 8-15 pouches daily';
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
      case 'pouches':
        return '10';
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
        <View style={styles.container}>
          {/* Gradient background */}
          <LinearGradient
            colors={['#000000', '#0A0F1C', '#0F172A']}
            style={StyleSheet.absoluteFillObject}
          />

          <SafeAreaView style={styles.safeArea}>
            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(3/9) * 100}%` }]} />
              </View>
              <Text style={styles.progressText}>Step 3 of 9</Text>
            </View>

            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>What's your nicotine of choice?</Text>
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
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.productIconContainer,
                        selectedProduct?.id === product.id && styles.productIconContainerSelected
                      ]}>
                        <Ionicons 
                          name={product.iconName} 
                          size={32} 
                          color={selectedProduct?.id === product.id ? COLORS.primary : COLORS.textSecondary} 
                        />
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

            {/* Navigation */}
            <View style={styles.navigationContainer}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
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
                activeOpacity={0.7}
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
                  color={(!selectedProduct || !dailyAmount || parseFloat(dailyAmount) <= 0) ? COLORS.textMuted : '#FFFFFF'} 
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      ) : null}

      {/* Amount Input Overlay */}
      {selectedProduct && showAmountInput && (
        <Animated.View 
          style={[
            styles.amountInputOverlay,
            {
              opacity: amountFadeAnim,
            }
          ]}
        >
          {/* Gradient background */}
          <LinearGradient
            colors={['#000000', '#0A0F1C', '#0F172A']}
            style={StyleSheet.absoluteFillObject}
          />

          <SafeAreaView style={styles.safeArea}>
            <StatusBar backgroundColor="#000000" barStyle="light-content" />
            
            <KeyboardAvoidingView 
              style={styles.amountContainer}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
              {/* Progress Indicator */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${(3/9) * 100}%` }]} />
                </View>
                <Text style={styles.progressText}>Step 3 of 9</Text>
              </View>

              <View style={styles.amountContent}>
                {/* Header for amount input */}
                <View style={styles.amountHeader}>
                  <Text style={styles.amountTitle}>
                    {selectedProduct.category === 'cigarettes' || 
                     selectedProduct.category === 'pouches' || 
                     selectedProduct.category === 'vape' ? 
                      `How many ${selectedProduct.name.toLowerCase()} do you ${selectedProduct.category === 'cigarettes' ? 'smoke' : 'use'}?` :
                      `How much ${selectedProduct.name.toLowerCase()} do you use?`
                    }
                  </Text>
                  <Text style={styles.amountSubtitle}>
                    Just a rough estimate - we'll use this to{'\n'}track your progress
                  </Text>
                </View>

                <View style={styles.inputSection}>
                  <View style={styles.selectedProductDisplay}>
                    <TouchableOpacity
                      style={styles.selectedIconContainer}
                      onPress={() => handleProductSelect(selectedProduct)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name={selectedProduct.iconName} size={28} color={COLORS.primary} />
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
                </View>
              </View>

              {/* Back button - hidden behind keyboard, visible when keyboard dismissed */}
              <View style={styles.hiddenBackButtonContainer}>
                <TouchableOpacity
                  style={styles.hiddenBackButton}
                  onPress={() => {
                    setShowAmountInput(false);
                    setDailyAmount('');
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
                  <Text style={styles.hiddenBackButtonText}>Back</Text>
                </TouchableOpacity>
              </View>

            </KeyboardAvoidingView>
          </SafeAreaView>
        </Animated.View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
  },
  progressContainer: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 40,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '400',
  },
  productsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  productCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  productIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  productIconContainerSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  productName: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  productNameSelected: {
    color: COLORS.text,
    fontWeight: '600',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
    paddingTop: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginLeft: -12,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: 8,
    fontWeight: '500',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  continueButtonTextDisabled: {
    color: COLORS.textMuted,
  },
  // Amount Input Overlay Styles
  amountInputOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  amountContainer: {
    flex: 1,
  },
  amountContent: {
    flex: 1,
    paddingHorizontal: 40,
  },
  amountHeader: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  amountTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  amountSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '400',
  },
  inputSection: {
    paddingTop: 10,
  },
  selectedProductDisplay: {
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  changeProductHint: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  amountLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 16,
  },
  numberInput: {
    fontSize: 42,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    minWidth: 100,
    letterSpacing: -1,
  },
  inputUnit: {
    fontSize: 17,
    color: COLORS.textSecondary,
    marginLeft: 10,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  hiddenBackButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  hiddenBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  hiddenBackButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: 8,
    fontWeight: '500',
  },

});

export default NicotineProfileStep; 