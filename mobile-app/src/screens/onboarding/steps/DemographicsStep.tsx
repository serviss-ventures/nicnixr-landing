import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
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
  color: string;
  bgColor: string;
}

interface AgeRangeOption {
  id: string;
  label: string;
  minAge: number;
  maxAge?: number;
  description: string;
}

const GENDER_OPTIONS: GenderOption[] = [
  {
    id: 'male',
    label: 'Male',
    icon: 'male',
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
  },
  {
    id: 'female', 
    label: 'Female',
    icon: 'female',
    color: '#EC4899',
    bgColor: 'rgba(236, 72, 153, 0.15)',
  },
  {
    id: 'non-binary',
    label: 'Non-binary',
    icon: 'person',
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
  },
  {
    id: 'prefer-not-to-say',
    label: 'Prefer not to say',
    icon: 'help-circle-outline',
    color: '#6B7280',
    bgColor: 'rgba(107, 114, 128, 0.15)',
  },
];

const AGE_RANGES: AgeRangeOption[] = [
  {
    id: 'under-18',
    label: 'Under 18',
    minAge: 0,
    maxAge: 17,
    description: 'Not eligible for this app',
  },
  {
    id: '18-24',
    label: '18-24',
    minAge: 18,
    maxAge: 24,
    description: 'Young adult',
  },
  {
    id: '25-34',
    label: '25-34', 
    minAge: 25,
    maxAge: 34,
    description: 'Early career',
  },
  {
    id: '35-44',
    label: '35-44',
    minAge: 35,
    maxAge: 44,
    description: 'Established',
  },
  {
    id: '45-54',
    label: '45-54',
    minAge: 45,
    maxAge: 54,
    description: 'Mid-life',
  },
  {
    id: '55-64',
    label: '55-64',
    minAge: 55,
    maxAge: 64,
    description: 'Pre-retirement',
  },
  {
    id: '65+',
    label: '65+',
    minAge: 65,
    description: 'Senior',
  },
];

const DemographicsStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stepData } = useSelector((state: RootState) => state.onboarding);
  
  const [selectedGender, setSelectedGender] = useState<string>(stepData.gender || '');
  const [selectedAgeRange, setSelectedAgeRange] = useState<string>(stepData.ageRange || '');
  const [showGender, setShowGender] = useState(true);

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

    console.log('💾 Saving demographics data:', demographicsData);

    dispatch(updateStepData(demographicsData));
    await dispatch(saveOnboardingProgress(demographicsData));
    
    console.log('✅ Demographics saved successfully');
    
    dispatch(nextStep());
  };

  const handleBack = () => {
    if (!showGender) {
      // Go back to gender selection
      setShowGender(true);
    } else {
      dispatch(previousStep());
    }
  };

  const handleGenderSelect = (genderId: string) => {
    setSelectedGender(genderId);
    // Automatically move to age selection after a brief delay
    setTimeout(() => {
      setShowGender(false);
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

      console.log('💾 Saving demographics data:', demographicsData);

      dispatch(updateStepData(demographicsData));
      await dispatch(saveOnboardingProgress(demographicsData));
      
      console.log('✅ Demographics saved successfully');
      
      dispatch(nextStep());
    }, 300);
  };

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={[COLORS.accent, '#EC4899']}
            style={[styles.progressFill, { width: `${(2/9) * 100}%` }]}
          />
        </View>
        <Text style={styles.progressText}>Step 2 of 9</Text>
      </View>

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
              >
                <View style={[styles.optionIconContainer, { backgroundColor: option.bgColor }]}>
                  <Ionicons name={option.icon} size={32} color={option.color} />
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

          {/* Navigation for gender selection */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
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
              >
                <Text style={[
                  styles.ageRangeLabel,
                  selectedAgeRange === range.id && styles.ageRangeLabelSelected,
                  range.id === 'under-18' && styles.ageRangeLabelRestricted,
                ]}>
                  {range.label}
                </Text>
                {range.id === 'under-18' && (
                  <Text style={styles.ageRangeRestriction}>Not eligible</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Navigation for age selection - only back button */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
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
  header: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
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
    paddingHorizontal: SPACING.md,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    flex: 1,
    alignContent: 'center',
  },
  optionCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
    minHeight: 120,
  },
  optionCardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    transform: [{ scale: 1.02 }],
  },
  optionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  ageRangeContainer: {
    paddingHorizontal: SPACING.sm,
    flex: 1,
  },
  ageRangeCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ageRangeCardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  ageRangeCardRestricted: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  ageRangeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  ageRangeLabelSelected: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  ageRangeLabelRestricted: {
    color: COLORS.textMuted,
  },
  ageRangeRestriction: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
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
});

export default DemographicsStep; 