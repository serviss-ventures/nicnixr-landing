import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, Animated } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { nextStep, previousStep, updateStepData, saveOnboardingProgress } from '../../../store/slices/onboardingSlice';
import { COLORS, SPACING } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface GenderOption {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface AgeRangeOption {
  id: string;
  label: string;
  minAge: number;
  maxAge?: number;
}

const GENDER_OPTIONS: GenderOption[] = [
  {
    id: 'male',
    label: 'Male',
    icon: 'male',
  },
  {
    id: 'female', 
    label: 'Female',
    icon: 'female',
  },
  {
    id: 'non-binary',
    label: 'Non-binary',
    icon: 'person',
  },
  {
    id: 'prefer-not-to-say',
    label: 'Prefer not to say',
    icon: 'help-circle-outline',
  },
];

const AGE_RANGES: AgeRangeOption[] = [
  {
    id: 'under-18',
    label: 'Under 18',
    minAge: 0,
    maxAge: 17,
  },
  {
    id: '18-24',
    label: '18-24',
    minAge: 18,
    maxAge: 24,
  },
  {
    id: '25-34',
    label: '25-34', 
    minAge: 25,
    maxAge: 34,
  },
  {
    id: '35-44',
    label: '35-44',
    minAge: 35,
    maxAge: 44,
  },
  {
    id: '45-54',
    label: '45-54',
    minAge: 45,
    maxAge: 54,
  },
  {
    id: '55-64',
    label: '55-64',
    minAge: 55,
    maxAge: 64,
  },
  {
    id: '65+',
    label: '65+',
    minAge: 65,
  },
];

const DemographicsStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stepData } = useSelector((state: RootState) => state.onboarding);
  
  const [selectedGender, setSelectedGender] = useState<string>(stepData.gender || '');
  const [selectedAgeRange, setSelectedAgeRange] = useState<string>(stepData.ageRange || '');
  const [showGender, setShowGender] = useState(true);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  const handleContinue = async () => {
    if (!selectedGender) {
      Alert.alert('Please select your gender', 'This helps us personalize your recovery journey.');
      return;
    }

    if (!selectedAgeRange) {
      Alert.alert('Please select your age range', 'Recovery patterns vary by age, so this helps us provide better guidance.');
      return;
    }

    const demographicsData = {
      gender: selectedGender,
      ageRange: selectedAgeRange,
    };

    dispatch(updateStepData(demographicsData));
    await dispatch(saveOnboardingProgress(demographicsData));
    dispatch(nextStep());
  };

  const handleBack = () => {
    if (!showGender) {
      // Animate transition back to gender selection
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setShowGender(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    } else {
      dispatch(previousStep());
    }
  };

  const handleGenderSelect = (genderId: string) => {
    setSelectedGender(genderId);
    // Animate transition to age selection
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setShowGender(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }, 300);
  };

  const handleAgeSelect = async (ageId: string) => {
    // Check if under 18 first
    if (ageId === 'under-18') {
      Alert.alert(
        'Age Requirement',
        'You must be 18 or older to use this app. We recommend speaking with a parent, guardian, or healthcare provider about quitting nicotine.',
        [
          {
            text: 'I understand',
            style: 'default'
          }
        ]
      );
      return;
    }

    setSelectedAgeRange(ageId);
    
    // Automatically proceed after a brief delay
    setTimeout(async () => {
      const demographicsData = {
        gender: selectedGender,
        ageRange: ageId,
      };

      dispatch(updateStepData(demographicsData));
      await dispatch(saveOnboardingProgress(demographicsData));
      dispatch(nextStep());
    }, 300);
  };

  return (
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
            <View style={[styles.progressFill, { width: `${(2/9) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>Step 2 of 9</Text>
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {showGender ? (
            <>
              {/* Gender Selection */}
              <View style={styles.header}>
                <Text style={styles.title}>How do you identify?</Text>
                <Text style={styles.subtitle}>
                  This helps us personalize your recovery experience
                </Text>
              </View>

              <View style={styles.optionsContainer}>
                {GENDER_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionCard,
                      selectedGender === option.id && styles.optionCardSelected,
                    ]}
                    onPress={() => handleGenderSelect(option.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.optionIconContainer,
                      selectedGender === option.id && styles.optionIconContainerSelected
                    ]}>
                      <Ionicons 
                        name={option.icon} 
                        size={28} 
                        color={selectedGender === option.id ? COLORS.primary : COLORS.textSecondary} 
                      />
                    </View>
                    <Text style={[
                      styles.optionLabel,
                      selectedGender === option.id && styles.optionLabelSelected,
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            <>
              {/* Age Range Selection */}
              <View style={styles.header}>
                <Text style={styles.title}>What's your age range?</Text>
                <Text style={styles.subtitle}>
                  Recovery timelines and strategies can vary by age
                </Text>
              </View>

              <View style={styles.ageRangeContainer}>
                {AGE_RANGES.map((range) => (
                  <TouchableOpacity
                    key={range.id}
                    style={[
                      styles.ageRangeCard,
                      selectedAgeRange === range.id && styles.ageRangeCardSelected,
                      range.id === 'under-18' && styles.ageRangeCardRestricted,
                    ]}
                    onPress={() => handleAgeSelect(range.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.ageRangeLabel,
                      selectedAgeRange === range.id && styles.ageRangeLabelSelected,
                      range.id === 'under-18' && styles.ageRangeLabelRestricted,
                    ]}>
                      {range.label}
                    </Text>
                    {range.id === 'under-18' && (
                      <View style={styles.restrictionBadge}>
                        <Text style={styles.ageRangeRestriction}>18+ required</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </Animated.View>

        {/* Navigation */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
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
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    flex: 1,
    alignContent: 'center',
  },
  optionCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  optionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionIconContainerSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: COLORS.text,
    fontWeight: '600',
  },
  ageRangeContainer: {
    flex: 1,
  },
  ageRangeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ageRangeCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  ageRangeCardRestricted: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  ageRangeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
    letterSpacing: -0.2,
  },
  ageRangeLabelSelected: {
    color: COLORS.text,
    fontWeight: '600',
  },
  ageRangeLabelRestricted: {
    color: COLORS.textMuted,
  },
  restrictionBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ageRangeRestriction: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  navigationContainer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
    paddingTop: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    padding: 12,
    marginLeft: -12,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default DemographicsStep; 