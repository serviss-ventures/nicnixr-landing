import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SPACING } from '../../constants/theme';
import { DashboardStackParamList } from '../../types';
import { generateInsights } from '../../utils/insightsGenerator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface JournalData {
  // Core Mental Health
  moodPositive: boolean | null;
  hadCravings: boolean | null;
  cravingIntensity: number; // 1-10 scale
  stressHigh: boolean | null;
  anxietyLevel: number; // 1-10 scale
  
  // Core Physical
  sleepQuality: boolean | null;
  sleepHours: number;
  energyLevel: number; // 1-10 scale
  
  // Core Behavioral
  triggersEncountered: boolean | null;
  copingStrategiesUsed: boolean | null;
  
  // Additional Mental Health
  usedBreathing: boolean | null;
  meditationMinutes: number;
  moodSwings: boolean | null;
  irritability: boolean | null;
  concentration: number; // 1-10 scale
  
  // Additional Physical
  waterGlasses: number;
  exercised: boolean | null;
  exerciseMinutes: number;
  appetite: number; // 1-10 scale
  headaches: boolean | null;
  
  // Additional Behavioral
  socialSupport: boolean | null;
  avoidedTriggers: boolean | null;
  productiveDay: boolean | null;
  
  // Additional Wellness
  gratefulFor: string;
  biggestChallenge: string;
  tomorrowGoal: string;
  
  // Custom Notes
  notes: string;
}

interface EnabledFactors {
  // Core factors (enabled by default)
  moodState: boolean;
  cravingTracking: boolean;
  cravingIntensity: boolean;
  stressLevel: boolean;
  anxietyLevel: boolean;
  sleepQuality: boolean;
  sleepDuration: boolean;
  energyLevel: boolean;
  triggersEncountered: boolean;
  copingStrategiesUsed: boolean;
  
  // Additional factors (opt-in)
  breathingExercises: boolean;
  meditationTime: boolean;
  moodSwings: boolean;
  irritability: boolean;
  concentration: boolean;
  hydrationLevel: boolean;
  physicalActivity: boolean;
  exerciseDuration: boolean;
  appetite: boolean;
  headaches: boolean;
  socialInteractions: boolean;
  avoidedTriggers: boolean;
  productiveDay: boolean;
  gratefulFor: boolean;
  biggestChallenge: boolean;
  tomorrowGoal: boolean;
}

interface RecoveryJournalProps {
  visible: boolean;
  onClose: () => void;
  daysClean: number;
  onNavigateToInsights?: () => void;
}

const STORAGE_KEY = '@recovery_journal_factors';
const JOURNAL_ENTRIES_KEY = '@recovery_journal_entries';

const RecoveryJournal: React.FC<RecoveryJournalProps> = ({ visible, onClose, daysClean, onNavigateToInsights }) => {
  const navigation = useNavigation<StackNavigationProp<DashboardStackParamList>>();
  const [showCustomize, setShowCustomize] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hasInitialized, setHasInitialized] = useState(false);
  const [hasExistingEntry, setHasExistingEntry] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Text input modal state
  const [textInputModalVisible, setTextInputModalVisible] = useState(false);
  const [textInputModalConfig, setTextInputModalConfig] = useState<{
    title: string;
    placeholder: string;
    value: string;
    dataKey: keyof JournalData;
    maxLength: number;
  }>({
    title: '',
    placeholder: '',
    value: '',
    dataKey: 'notes',
    maxLength: 500,
  });
  const [tempTextValue, setTempTextValue] = useState('');
  
  const [journalData, setJournalData] = useState<JournalData>({
    // Core Mental Health
    moodPositive: null,
    hadCravings: null,
    cravingIntensity: 5,
    stressHigh: null,
    anxietyLevel: 5,
    
    // Core Physical
    sleepQuality: null,
    sleepHours: 7,
    energyLevel: 5,
    
    // Core Behavioral
    triggersEncountered: null,
    copingStrategiesUsed: null,
    
    // Additional Mental Health
    usedBreathing: null,
    meditationMinutes: 0,
    moodSwings: null,
    irritability: null,
    concentration: 5,
    
    // Additional Physical
    waterGlasses: 0,
    exercised: null,
    exerciseMinutes: 0,
    appetite: 5,
    headaches: null,
    
    // Additional Behavioral
    socialSupport: null,
    avoidedTriggers: null,
    productiveDay: null,
    
    // Additional Wellness
    gratefulFor: '',
    biggestChallenge: '',
    tomorrowGoal: '',
    
    // Custom Notes
    notes: '',
  });

  const [enabledFactors, setEnabledFactors] = useState<EnabledFactors>({
    // Core factors (enabled by default)
    moodState: true,
    cravingTracking: true,
    cravingIntensity: true,
    stressLevel: true,
    anxietyLevel: true,
    sleepQuality: true,
    sleepDuration: true,
    energyLevel: true,
    triggersEncountered: true,
    copingStrategiesUsed: true,
    
    // Additional factors (opt-in)
    breathingExercises: false,
    meditationTime: false,
    moodSwings: false,
    irritability: false,
    concentration: false,
    hydrationLevel: false,
    physicalActivity: false,
    exerciseDuration: false,
    appetite: false,
    headaches: false,
    socialInteractions: false,
    avoidedTriggers: false,
    productiveDay: false,
    gratefulFor: false,
    biggestChallenge: false,
    tomorrowGoal: false,
  });

  // Load saved preferences
  useEffect(() => {
    loadEnabledFactors();
    // Debug: Log total entry count on mount
    if (__DEV__) {
      AsyncStorage.getItem(JOURNAL_ENTRIES_KEY).then(entries => {
        if (entries) {
          const parsed = JSON.parse(entries);
          const count = Object.keys(parsed).length;
          console.log(`[Journal Debug] Total saved entries: ${count}`);
          console.log(`[Journal Debug] Entry dates:`, Object.keys(parsed).sort());
        }
      });
    }
  }, []);

  // Reset to today only on initial open
  useEffect(() => {
    if (visible && !hasInitialized) {
      setSelectedDate(new Date());
      setHasInitialized(true);
    }
    // Reset the flag when modal closes so next open starts fresh
    if (!visible) {
      setHasInitialized(false);
    }
  }, [visible, hasInitialized]);

  // Load journal data when date changes
  useEffect(() => {
    if (selectedDate) {
      loadJournalEntry(selectedDate);
    }
  }, [selectedDate]);

  // Handle customize animation
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: showCustomize ? -SCREEN_WIDTH : showInsights ? -SCREEN_WIDTH * 2 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showCustomize, showInsights, slideAnim]);

  // Removed keyboard event listeners - might be interfering

  const loadEnabledFactors = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const savedFactors = JSON.parse(saved);
        // Ensure core factors are always enabled
        const factorsWithCore = {
          ...savedFactors,
          // Core factors must always be enabled
          moodState: true,
          cravingTracking: true,
          cravingIntensity: true,
          stressLevel: true,
          anxietyLevel: true,
          sleepQuality: true,
          sleepDuration: true,
          energyLevel: true,
          triggersEncountered: true,
          copingStrategiesUsed: true,
        };
        setEnabledFactors(factorsWithCore);
      }
      // If no saved preferences, the default state already has core factors enabled
    } catch (error) {
      console.error('Failed to load journal preferences:', error);
    }
  };

  const saveEnabledFactors = async (factors: EnabledFactors) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(factors));
    } catch (error) {
      console.error('Failed to save journal preferences:', error);
    }
  };

  // Format date as YYYY-MM-DD for consistent storage keys
  const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Load journal entry for a specific date
  const loadJournalEntry = async (date: Date) => {
    try {
      const allEntries = await AsyncStorage.getItem(JOURNAL_ENTRIES_KEY);
      if (allEntries) {
        const entries = JSON.parse(allEntries);
        const dateKey = formatDateKey(date);
        const entry = entries[dateKey];
        
        if (entry) {
          setJournalData(entry);
          setHasExistingEntry(true);
        } else {
          // Reset to default values if no entry exists for this date
          resetJournalData();
          setHasExistingEntry(false);
        }
      } else {
        resetJournalData();
        setHasExistingEntry(false);
      }
    } catch (error) {
      console.error('Failed to load journal entry:', error);
      resetJournalData();
      setHasExistingEntry(false);
    }
  };

  // Save journal entry for the selected date
  const saveJournalEntry = async (data: JournalData) => {
    try {
      const allEntries = await AsyncStorage.getItem(JOURNAL_ENTRIES_KEY);
      const entries = allEntries ? JSON.parse(allEntries) : {};
      const dateKey = formatDateKey(selectedDate);
      
      // Clean the data to ensure no undefined values
      const cleanedData = Object.keys(data).reduce((acc, key) => {
        const value = data[key as keyof JournalData];
        if (value !== undefined) {
          acc[key as keyof JournalData] = value;
        }
        return acc;
      }, {} as JournalData);
      
      // Save the entry for the selected date
      entries[dateKey] = cleanedData;
      
      await AsyncStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(entries));
      
      // After successful save, update hasExistingEntry
      setHasExistingEntry(true);
    } catch (error) {
      console.error('Failed to save journal entry:', error);
      throw error; // Re-throw to handle in the calling function
    }
  };

  // Reset journal data to defaults
  const resetJournalData = () => {
    setJournalData({
      // Core Mental Health
      moodPositive: null,
      hadCravings: null,
      cravingIntensity: 5,
      stressHigh: null,
      anxietyLevel: 5,
      
      // Core Physical
      sleepQuality: null,
      sleepHours: 7,
      energyLevel: 5,
      
      // Core Behavioral
      triggersEncountered: null,
      copingStrategiesUsed: null,
      
      // Additional Mental Health
      usedBreathing: null,
      meditationMinutes: 0,
      moodSwings: null,
      irritability: null,
      concentration: 5,
      
      // Additional Physical
      waterGlasses: 0,
      exercised: null,
      exerciseMinutes: 0,
      appetite: 5,
      headaches: null,
      
      // Additional Behavioral
      socialSupport: null,
      avoidedTriggers: null,
      productiveDay: null,
      
      // Additional Wellness
      gratefulFor: '',
      biggestChallenge: '',
      tomorrowGoal: '',
      
      // Custom Notes
      notes: '',
    });
  };

  const updateJournalData = useCallback((key: keyof JournalData, value: boolean | number | string | null) => {
    setJournalData(prev => ({ ...prev, [key]: value }));
    // Only haptic feedback for non-text inputs
    if (typeof value !== 'string') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleComplete = useCallback(async () => {
    // Check if at least some data was entered
    const hasData = Object.entries(journalData).some(([key, val]) => {
      // Skip default numeric values that haven't been changed
      if (key === 'cravingIntensity' || key === 'anxietyLevel' || key === 'sleepHours' || 
          key === 'energyLevel' || key === 'concentration' || key === 'appetite') {
        // Only count these if other related fields are filled
        return false;
      }
      if (typeof val === 'string') return val.trim().length > 0;
      if (typeof val === 'number' && key !== 'meditationMinutes' && key !== 'waterGlasses' && key !== 'exerciseMinutes') {
        return val !== 0;
      }
      return val !== null;
    });
    
    if (!hasData) {
      Alert.alert('No Data', 'Please track at least one factor before saving.');
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Save to AsyncStorage
      await saveJournalEntry(journalData);
      
      // Verify the save was successful
      const allEntries = await AsyncStorage.getItem(JOURNAL_ENTRIES_KEY);
      if (allEntries) {
        const entries = JSON.parse(allEntries);
        const dateKey = formatDateKey(selectedDate);
        if (entries[dateKey]) {
          console.log(`Journal entry successfully saved for ${dateKey}`);
        } else {
          console.error(`Failed to verify save for ${dateKey}`);
        }
      }
      
      onClose();
      
      setTimeout(() => {
        Alert.alert(
          hasExistingEntry ? 'Journal Updated' : 'Journal Saved', 
          `Your recovery journal for ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} has been ${hasExistingEntry ? 'updated' : 'saved'}.`
        );
      }, 300);
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Save Failed', 'Unable to save your journal entry. Please try again.');
    }
  }, [journalData, selectedDate, onClose, saveJournalEntry, hasExistingEntry, formatDateKey, JOURNAL_ENTRIES_KEY]);

  const handleCustomizeSave = useCallback((factors: EnabledFactors) => {
    setEnabledFactors(factors);
    saveEnabledFactors(factors);
    setShowCustomize(false);
  }, []);

  // Open text input modal
  const openTextInputModal = useCallback((config: {
    title: string;
    placeholder: string;
    value: string;
    dataKey: keyof JournalData;
    maxLength: number;
  }) => {
    setTextInputModalConfig(config);
    setTempTextValue(config.value);
    setTextInputModalVisible(true);
  }, []);

  // Save text from modal
  const saveTextFromModal = useCallback(() => {
    updateJournalData(textInputModalConfig.dataKey, tempTextValue);
    setTextInputModalVisible(false);
  }, [textInputModalConfig.dataKey, tempTextValue, updateJournalData]);

  // Quick toggle component
  const QuickToggle = ({ 
    question, 
    dataKey, 
    value 
  }: { 
    question: string; 
    dataKey: keyof JournalData; 
    value: boolean | null;
  }) => (
    <View style={styles.quickItem}>
      <Text style={styles.quickQuestion}>{question}</Text>
      <View style={styles.quickToggleGroup}>
        <TouchableOpacity 
          style={[
            styles.quickToggle,
            value === false && styles.quickToggleNo
          ]}
          onPress={() => updateJournalData(dataKey, false)}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={16} color={value === false ? "#EF4444" : "#6B7280"} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.quickToggle,
            value === true && styles.quickToggleYes
          ]}
          onPress={() => updateJournalData(dataKey, true)}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark" size={16} color={value === true ? "#22C55E" : "#6B7280"} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Scale component for 1-10 ratings
  const QuickScale = ({ 
    title, 
    dataKey, 
    value,
    lowLabel = 'Low',
    highLabel = 'High'
  }: { 
    title: string; 
    dataKey: keyof JournalData; 
    value: number;
    lowLabel?: string;
    highLabel?: string;
  }) => (
    <View style={styles.scaleContainer}>
      <Text style={styles.scaleTitle}>{title}</Text>
      <View style={styles.scaleLabels}>
        <Text style={styles.scaleLabelText}>{lowLabel}</Text>
        <Text style={styles.scaleValue}>{value}</Text>
        <Text style={styles.scaleLabelText}>{highLabel}</Text>
      </View>
      <View style={styles.scaleRow}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.scaleButton,
              value === num && styles.scaleButtonActive
            ]}
            onPress={() => updateJournalData(dataKey, num)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.scaleButtonText,
              value === num && styles.scaleButtonTextActive
            ]}>
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Replace the existing QuickTextInput component with this simpler version
  const QuickTextInput = ({ 
    title, 
    dataKey, 
    value,
    placeholder
  }: { 
    title: string; 
    dataKey: keyof JournalData; 
    value: string;
    placeholder: string;
  }) => {
    const maxLength = dataKey === 'notes' ? 500 : 200;
    
    return (
      <TouchableOpacity
        style={styles.textInputContainer}
        onPress={() => openTextInputModal({
          title: title || 'Add your thoughts',
          placeholder,
          value,
          dataKey,
          maxLength,
        })}
        activeOpacity={0.7}
      >
        {title ? <Text style={styles.textInputTitle}>{title}</Text> : null}
        <View style={[styles.textInputButton, value && styles.textInputButtonFilled]}>
          {value ? (
            <Text style={styles.textInputValue} numberOfLines={dataKey === 'notes' ? 4 : 2}>
              {value}
            </Text>
          ) : (
            <Text style={styles.textInputPlaceholder}>
              {placeholder}
            </Text>
          )}
          <Ionicons 
            name={value ? "create-outline" : "add-circle-outline"} 
            size={20} 
            color={value ? "#8B5CF6" : "#6B7280"} 
          />
        </View>
        {dataKey === 'notes' && value && (
          <Text style={styles.inputHelper}>{value.length}/500 characters</Text>
        )}
      </TouchableOpacity>
    );
  };

  // Counter component
  const QuickCounter = ({ 
    title, 
    dataKey, 
    value, 
    unit, 
    min = 0, 
    max = 24, 
    step = 1 
  }: { 
    title: string; 
    dataKey: keyof JournalData; 
    value: number; 
    unit: string;
    min?: number;
    max?: number;
    step?: number;
  }) => (
    <View style={styles.counterContainer}>
      <Text style={styles.counterTitle}>{title}</Text>
      <View style={styles.counterRow}>
        <TouchableOpacity 
          style={[
            styles.counterButton,
            value <= min && styles.counterButtonDisabled
          ]}
          onPress={() => updateJournalData(dataKey, Math.max(min, value - step))}
          activeOpacity={0.7}
          disabled={value <= min}
        >
          <Ionicons name="remove" size={20} color={value <= min ? "#374151" : "#FFFFFF"} />
        </TouchableOpacity>
        
        <View style={styles.counterValue}>
          <Text style={styles.counterNumber}>{value}</Text>
          <Text style={styles.counterUnit}>{unit}</Text>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.counterButton,
            value >= max && styles.counterButtonDisabled
          ]}
          onPress={() => updateJournalData(dataKey, Math.min(max, value + step))}
          activeOpacity={0.7}
          disabled={value >= max}
        >
          <Ionicons name="add" size={20} color={value >= max ? "#374151" : "#FFFFFF"} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'formSheet' : 'pageSheet'}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={['#000000', '#0A0F1C', '#0F172A']}
          style={styles.modalGradient}
        >
          <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            {/* Header */}
            <View style={styles.premiumModalHeader}>
              <TouchableOpacity 
                style={styles.premiumModalBackButton}
                onPress={onClose}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                  style={styles.premiumModalBackGradient}
                >
                  <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
              <Text style={styles.premiumModalTitle}>Recovery Journal</Text>
              <TouchableOpacity 
                style={styles.settingsButton}
                onPress={() => setShowCustomize(true)}
              >
                <Ionicons name="options-outline" size={22} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Date Navigation */}
            <View style={styles.dateNav}>
              <View style={styles.dateNavLeft}>
                <TouchableOpacity 
                  style={styles.dateArrow}
                  onPress={() => {
                    const newDate = new Date(selectedDate.getTime());
                    newDate.setDate(newDate.getDate() - 1);
                    setSelectedDate(newDate);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-back" size={20} color="#9CA3AF" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => {
                    setSelectedDate(new Date());
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dateText}>
                    {selectedDate.toDateString() === new Date().toDateString() 
                      ? 'Today' 
                      : selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.dateArrow,
                    selectedDate.toDateString() === new Date().toDateString() && styles.dateArrowDisabled
                  ]}
                  onPress={() => {
                    if (selectedDate.toDateString() !== new Date().toDateString()) {
                      const newDate = new Date(selectedDate.getTime());
                      newDate.setDate(newDate.getDate() + 1);
                      setSelectedDate(newDate);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                  }}
                  activeOpacity={0.7}
                  disabled={selectedDate.toDateString() === new Date().toDateString()}
                >
                  <Ionicons 
                    name="chevron-forward" 
                    size={20} 
                    color={selectedDate.toDateString() === new Date().toDateString() ? "#374151" : "#9CA3AF"} 
                  />
                </TouchableOpacity>
              </View>
              
              {/* Insights Button - Separated from date navigation */}
              <TouchableOpacity 
                style={[styles.insightsButton, daysClean >= 5 && styles.insightsButtonActive]}
                onPress={() => {
                  try {
                    console.log('[RecoveryJournal] Insights button pressed');
                    console.log('[RecoveryJournal] Days clean:', daysClean);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    
                    if (daysClean >= 5) {
                      setShowInsights(true);
                    } else {
                      Alert.alert(
                        'Insights Locked',
                        `Track your recovery journey for ${5 - daysClean} more ${5 - daysClean === 1 ? 'day' : 'days'} to unlock personalized insights.`,
                        [{ text: 'OK' }]
                      );
                    }
                  } catch (error) {
                    console.error('[RecoveryJournal] Error showing insights:', error);
                  }
                }}
                activeOpacity={0.8}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons 
                  name="bulb-outline" 
                  size={16} 
                  color={daysClean >= 5 ? "#FFFFFF" : "#6B7280"} 
                />
                <Text style={[styles.insightsButtonText, daysClean >= 5 && styles.insightsButtonTextActive]}>
                  Insights
                </Text>
                {daysClean >= 5 && (
                  <View style={styles.insightsButtonDot} />
                )}
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView 
              ref={scrollViewRef}
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Core Mental Health Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Mental Health</Text>
                
                {enabledFactors.moodState && (
                  <QuickToggle 
                    question="Feeling positive today?"
                    dataKey="moodPositive"
                    value={journalData.moodPositive}
                  />
                )}
                
                {enabledFactors.cravingTracking && (
                  <QuickToggle 
                    question="Had nicotine cravings?"
                    dataKey="hadCravings"
                    value={journalData.hadCravings}
                  />
                )}
                
                {enabledFactors.cravingIntensity && journalData.hadCravings && (
                  <QuickScale 
                    title="Craving intensity"
                    dataKey="cravingIntensity"
                    value={journalData.cravingIntensity}
                    lowLabel="Mild"
                    highLabel="Intense"
                  />
                )}
                
                {enabledFactors.stressLevel && (
                  <QuickToggle 
                    question="High stress today?"
                    dataKey="stressHigh"
                    value={journalData.stressHigh}
                  />
                )}
                
                {enabledFactors.anxietyLevel && (
                  <QuickScale 
                    title="Anxiety level"
                    dataKey="anxietyLevel"
                    value={journalData.anxietyLevel}
                    lowLabel="Calm"
                    highLabel="Anxious"
                  />
                )}
                
                {enabledFactors.moodSwings && (
                  <QuickToggle 
                    question="Experienced mood swings?"
                    dataKey="moodSwings"
                    value={journalData.moodSwings}
                  />
                )}
                
                {enabledFactors.irritability && (
                  <QuickToggle 
                    question="Feeling irritable?"
                    dataKey="irritability"
                    value={journalData.irritability}
                  />
                )}
                
                {enabledFactors.concentration && (
                  <QuickScale 
                    title="Focus & concentration"
                    dataKey="concentration"
                    value={journalData.concentration}
                    lowLabel="Poor"
                    highLabel="Sharp"
                  />
                )}
                
                {enabledFactors.breathingExercises && (
                  <QuickToggle 
                    question="Used breathing exercises?"
                    dataKey="usedBreathing"
                    value={journalData.usedBreathing}
                  />
                )}
                
                {enabledFactors.meditationTime && (
                  <QuickCounter 
                    title="Meditation time"
                    dataKey="meditationMinutes"
                    value={journalData.meditationMinutes}
                    unit="minutes"
                    min={0}
                    max={60}
                    step={5}
                  />
                )}
              </View>

              {/* Physical Recovery Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Physical Recovery</Text>
                
                {enabledFactors.sleepQuality && (
                  <QuickToggle 
                    question="Good sleep quality?"
                    dataKey="sleepQuality"
                    value={journalData.sleepQuality}
                  />
                )}
                
                {enabledFactors.sleepDuration && (
                  <QuickCounter 
                    title="Hours of sleep"
                    dataKey="sleepHours"
                    value={journalData.sleepHours}
                    unit="hours"
                    min={0}
                    max={24}
                    step={0.5}
                  />
                )}
                
                {enabledFactors.energyLevel && (
                  <QuickScale 
                    title="Energy level"
                    dataKey="energyLevel"
                    value={journalData.energyLevel}
                    lowLabel="Exhausted"
                    highLabel="Energetic"
                  />
                )}
                
                {enabledFactors.appetite && (
                  <QuickScale 
                    title="Appetite"
                    dataKey="appetite"
                    value={journalData.appetite}
                    lowLabel="Poor"
                    highLabel="Normal"
                  />
                )}
                
                {enabledFactors.headaches && (
                  <QuickToggle 
                    question="Had headaches?"
                    dataKey="headaches"
                    value={journalData.headaches}
                  />
                )}
                
                {enabledFactors.hydrationLevel && (
                  <QuickCounter 
                    title="Water intake"
                    dataKey="waterGlasses"
                    value={journalData.waterGlasses}
                    unit="glasses"
                    min={0}
                    max={20}
                    step={1}
                  />
                )}
                
                {enabledFactors.physicalActivity && (
                  <QuickToggle 
                    question="Exercised today?"
                    dataKey="exercised"
                    value={journalData.exercised}
                  />
                )}
                
                {enabledFactors.exerciseDuration && journalData.exercised && (
                  <QuickCounter 
                    title="Exercise duration"
                    dataKey="exerciseMinutes"
                    value={journalData.exerciseMinutes}
                    unit="minutes"
                    min={0}
                    max={180}
                    step={15}
                  />
                )}
              </View>

              {/* Behavioral Tracking Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Behavioral Tracking</Text>
                
                {enabledFactors.triggersEncountered && (
                  <QuickToggle 
                    question="Encountered triggers?"
                    dataKey="triggersEncountered"
                    value={journalData.triggersEncountered}
                  />
                )}
                
                {enabledFactors.copingStrategiesUsed && (
                  <QuickToggle 
                    question="Used coping strategies?"
                    dataKey="copingStrategiesUsed"
                    value={journalData.copingStrategiesUsed}
                  />
                )}
                
                {enabledFactors.avoidedTriggers && (
                  <QuickToggle 
                    question="Successfully avoided triggers?"
                    dataKey="avoidedTriggers"
                    value={journalData.avoidedTriggers}
                  />
                )}
                
                {enabledFactors.productiveDay && (
                  <QuickToggle 
                    question="Had a productive day?"
                    dataKey="productiveDay"
                    value={journalData.productiveDay}
                  />
                )}
              </View>

              {/* Wellness Section */}
              {(enabledFactors.socialInteractions || enabledFactors.gratefulFor || enabledFactors.biggestChallenge || enabledFactors.tomorrowGoal) && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Wellness & Reflection</Text>
                  
                  {enabledFactors.socialInteractions && (
                    <QuickToggle 
                      question="Had social support?"
                      dataKey="socialSupport"
                      value={journalData.socialSupport}
                    />
                  )}
                  
                  {enabledFactors.gratefulFor && (
                    <QuickTextInput 
                      title="What are you grateful for today?"
                      dataKey="gratefulFor"
                      value={journalData.gratefulFor}
                      placeholder="Share something positive from your day..."
                    />
                  )}
                  
                  {enabledFactors.biggestChallenge && (
                    <QuickTextInput 
                      title="What was your biggest challenge?"
                      dataKey="biggestChallenge"
                      value={journalData.biggestChallenge}
                      placeholder="Describe any difficulties you faced..."
                    />
                  )}
                  
                  {enabledFactors.tomorrowGoal && (
                    <QuickTextInput 
                      title="What's your goal for tomorrow?"
                      dataKey="tomorrowGoal"
                      value={journalData.tomorrowGoal}
                      placeholder="Set an intention for tomorrow..."
                    />
                  )}
                </View>
              )}

              {/* Custom Notes Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Journal Notes</Text>
                <QuickTextInput 
                  title=""
                  dataKey="notes"
                  value={journalData.notes}
                  placeholder="Add any additional thoughts, observations, or reflections about your recovery journey today..."
                />
              </View>
            </ScrollView>

            {/* Save Button */}
            <View style={styles.footer}>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleComplete}
                activeOpacity={0.8}
              >
                <Text style={styles.saveText}>
                  {hasExistingEntry 
                    ? `Update ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} Entry`
                    : 'Save Journal Entry'}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      {/* Text Input Modal */}
      <Modal
        visible={textInputModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setTextInputModalVisible(false)}
      >
        <View style={styles.textModalOverlay}>
          <TouchableOpacity 
            style={styles.textModalBackdrop} 
            activeOpacity={1} 
            onPress={() => setTextInputModalVisible(false)}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.textModalKeyboardView}
          >
            <View style={styles.textModalContent}>
              <View style={styles.textModalDragIndicator} />
              <View style={styles.textModalHeader}>
                <Text style={styles.textModalTitle}>{textInputModalConfig.title}</Text>
                <TouchableOpacity 
                  onPress={() => setTextInputModalVisible(false)} 
                  style={styles.textModalCloseButton}
                >
                  <Ionicons name="close-circle" size={28} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <TextInput
                style={styles.textModalInput}
                placeholder={textInputModalConfig.placeholder}
                placeholderTextColor="#6B7280"
                value={tempTextValue}
                onChangeText={setTempTextValue}
                multiline
                numberOfLines={textInputModalConfig.dataKey === 'notes' ? 6 : 4}
                maxLength={textInputModalConfig.maxLength}
                autoFocus
                textAlignVertical="top"
              />
              
              <View style={styles.textModalFooter}>
                <Text style={styles.textModalCharacterCount}>
                  {tempTextValue.length}/{textInputModalConfig.maxLength} characters
                </Text>
                <TouchableOpacity 
                  style={[
                    styles.textModalSaveButton,
                    tempTextValue.trim().length === 0 && styles.textModalSaveButtonDisabled
                  ]}
                  onPress={saveTextFromModal}
                  disabled={tempTextValue.trim().length === 0}
                >
                  <Text style={[
                    styles.textModalSaveButtonText,
                    tempTextValue.trim().length === 0 && styles.textModalSaveButtonTextDisabled
                  ]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Customize Modal */}
      <Modal
        visible={showCustomize}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCustomize(false)}
        statusBarTranslucent={true}
      >
        <View style={{ flex: 1, backgroundColor: '#000000' }}>
          <LinearGradient
            colors={['#000000', '#0A0F1C', '#0F172A']}
            style={{ flex: 1 }}
          >
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
              <CustomizePanel 
                enabledFactors={enabledFactors}
                onSave={handleCustomizeSave}
                onClose={() => setShowCustomize(false)}
              />
            </SafeAreaView>
          </LinearGradient>
        </View>
      </Modal>
      
      {/* Insights Modal */}
      <Modal
        visible={showInsights}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInsights(false)}
        statusBarTranslucent={true}
      >
        <View style={{ flex: 1, backgroundColor: '#000000' }}>
          <LinearGradient
            colors={['#000000', '#0A0F1C', '#0F172A']}
            style={{ flex: 1 }}
          >
          <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            <InsightsPanel 
              onClose={() => setShowInsights(false)}
            />
          </SafeAreaView>
        </LinearGradient>
        </View>
      </Modal>
    </Modal>
  );
};

// Customize Panel Component
const CustomizePanel: React.FC<{
  enabledFactors: EnabledFactors;
  onSave: (factors: EnabledFactors) => void;
  onClose: () => void;
}> = ({ enabledFactors, onSave, onClose }) => {
  const [localFactors, setLocalFactors] = useState(enabledFactors);

  useEffect(() => {
    setLocalFactors(enabledFactors);
  }, [enabledFactors]);

  const toggleFactor = (factor: keyof EnabledFactors) => {
    // Core factors cannot be disabled
    const coreFactors: (keyof EnabledFactors)[] = [
      'moodState', 'cravingTracking', 'cravingIntensity', 'stressLevel', 
      'anxietyLevel', 'sleepQuality', 'sleepDuration', 'energyLevel', 
      'triggersEncountered', 'copingStrategiesUsed'
    ];
    
    if (coreFactors.includes(factor) && localFactors[factor]) {
      // Don't allow disabling core factors
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    
    setLocalFactors(prev => ({
      ...prev,
      [factor]: !prev[factor]
    }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSave(localFactors);
  };

  const FactorToggle = ({ 
    icon, 
    title, 
    description, 
    factorKey,
    isCore = false 
  }: { 
    icon: string; 
    title: string; 
    description: string; 
    factorKey: keyof EnabledFactors;
    isCore?: boolean;
  }) => {
    const isEnabled = localFactors[factorKey];
    
    return (
      <TouchableOpacity
        style={[
          styles.customizeFactorCard,
          isEnabled && styles.customizeFactorCardActive,
          isCore && styles.customizeFactorCardCore
        ]}
        onPress={() => toggleFactor(factorKey)}
        activeOpacity={0.7}
        disabled={isCore && isEnabled}
      >
        <View style={[
          styles.customizeFactorIcon, 
          isEnabled && styles.customizeFactorIconActive,
          isCore && styles.customizeFactorIconCore
        ]}>
          <Ionicons 
            name={icon as keyof typeof Ionicons.glyphMap} 
            size={20} 
            color={isCore ? '#C084FC' : (isEnabled ? '#86EFAC' : 'rgba(255, 255, 255, 0.4)')} 
          />
        </View>
        
        <View style={styles.customizeFactorContent}>
          <View style={styles.customizeFactorHeader}>
            <Text style={[styles.customizeFactorTitle, !isEnabled && styles.customizeFactorTitleDisabled]}>
              {title}
            </Text>
            {isCore && (
              <View style={styles.customizeCoreBadge}>
                <Text style={styles.customizeCoreBadgeText}>CORE</Text>
              </View>
            )}
          </View>
          <Text style={[styles.customizeFactorDescription, !isEnabled && styles.customizeFactorDescriptionDisabled]}>
            {description}
          </Text>
        </View>
        
        <View style={[
          styles.customizeFactorToggle,
          isEnabled && styles.customizeFactorToggleActive,
          !isEnabled && styles.customizeFactorToggleInactive
        ]}>
          <View 
            style={[
              styles.customizeFactorToggleThumb,
              isEnabled && styles.customizeFactorToggleThumbActive
            ]} 
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.customizeContainer}>
      {/* Header */}
      <View style={styles.customizeHeader}>
        <TouchableOpacity onPress={onClose} style={styles.customizeCloseButton}>
          <Ionicons name="close" size={24} color="#9CA3AF" />
        </TouchableOpacity>
        <Text style={styles.customizeTitle}>Customize Tracking</Text>
        <TouchableOpacity onPress={handleSave} style={styles.customizeSaveButton}>
          <Text style={styles.customizeSaveText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Info Banner */}
      <View style={styles.customizeInfoBanner}>
        <Ionicons name="information-circle" size={20} color="#C084FC" />
        <Text style={styles.customizeInfoText}>
          Core factors are always tracked and cannot be disabled. Add additional factors based on your recovery needs.
        </Text>
      </View>

      <ScrollView style={styles.customizeContent} showsVerticalScrollIndicator={false}>
        {/* Core Mental Health Section */}
        <View style={styles.customizeSection}>
          <Text style={styles.customizeSectionTitle}>Core Mental Health</Text>
          <FactorToggle 
            icon="happy"
            title="Mood State"
            description="Track daily mood patterns"
            factorKey="moodState"
            isCore={true}
          />
          <FactorToggle 
            icon="flame"
            title="Craving Tracking"
            description="Monitor nicotine cravings"
            factorKey="cravingTracking"
            isCore={true}
          />
          <FactorToggle 
            icon="speedometer"
            title="Craving Intensity"
            description="Rate craving strength"
            factorKey="cravingIntensity"
            isCore={true}
          />
          <FactorToggle 
            icon="warning"
            title="Stress Level"
            description="Monitor daily stress"
            factorKey="stressLevel"
            isCore={true}
          />
          <FactorToggle 
            icon="pulse"
            title="Anxiety Level"
            description="Track anxiety patterns"
            factorKey="anxietyLevel"
            isCore={true}
          />
        </View>

        {/* Core Physical Section */}
        <View style={styles.customizeSection}>
          <Text style={styles.customizeSectionTitle}>Core Physical</Text>
          <FactorToggle 
            icon="moon"
            title="Sleep Quality"
            description="Rate your sleep quality"
            factorKey="sleepQuality"
            isCore={true}
          />
          <FactorToggle 
            icon="time"
            title="Sleep Duration"
            description="Track hours of sleep"
            factorKey="sleepDuration"
            isCore={true}
          />
          <FactorToggle 
            icon="battery-charging"
            title="Energy Level"
            description="Monitor daily energy"
            factorKey="energyLevel"
            isCore={true}
          />
        </View>

        {/* Core Behavioral Section */}
        <View style={styles.customizeSection}>
          <Text style={styles.customizeSectionTitle}>Core Behavioral</Text>
          <FactorToggle 
            icon="alert-circle"
            title="Triggers Encountered"
            description="Track exposure to triggers"
            factorKey="triggersEncountered"
            isCore={true}
          />
          <FactorToggle 
            icon="shield-checkmark"
            title="Coping Strategies"
            description="Track strategy usage"
            factorKey="copingStrategiesUsed"
            isCore={true}
          />
        </View>

        {/* Additional Factors - Mental Health */}
        <View style={styles.customizeSection}>
          <Text style={styles.customizeSectionTitle}>Additional Mental Health</Text>
          <FactorToggle 
            icon="wind"
            title="Breathing Exercises"
            description="Track breathing practice"
            factorKey="breathingExercises"
          />
          <FactorToggle 
            icon="leaf"
            title="Meditation Time"
            description="Log meditation minutes"
            factorKey="meditationTime"
          />
          <FactorToggle 
            icon="swap-horizontal"
            title="Mood Swings"
            description="Track mood volatility"
            factorKey="moodSwings"
          />
          <FactorToggle 
            icon="flash"
            title="Irritability"
            description="Monitor irritability levels"
            factorKey="irritability"
          />
          <FactorToggle 
            icon="glasses"
            title="Concentration"
            description="Track focus ability"
            factorKey="concentration"
          />
        </View>

        {/* Additional Factors - Physical */}
        <View style={styles.customizeSection}>
          <Text style={styles.customizeSectionTitle}>Additional Physical</Text>
          <FactorToggle 
            icon="water"
            title="Hydration Level"
            description="Track water intake"
            factorKey="hydrationLevel"
          />
          <FactorToggle 
            icon="fitness"
            title="Physical Activity"
            description="Log exercise completion"
            factorKey="physicalActivity"
          />
          <FactorToggle 
            icon="stopwatch"
            title="Exercise Duration"
            description="Track workout length"
            factorKey="exerciseDuration"
          />
          <FactorToggle 
            icon="restaurant"
            title="Appetite"
            description="Monitor appetite changes"
            factorKey="appetite"
          />
          <FactorToggle 
            icon="medical"
            title="Headaches"
            description="Track headache occurrence"
            factorKey="headaches"
          />
        </View>

        {/* Additional Factors - Behavioral & Wellness */}
        <View style={styles.customizeSection}>
          <Text style={styles.customizeSectionTitle}>Behavioral & Wellness</Text>
          <FactorToggle 
            icon="people"
            title="Social Interactions"
            description="Track social support"
            factorKey="socialInteractions"
          />
          <FactorToggle 
            icon="hand-right"
            title="Avoided Triggers"
            description="Track trigger avoidance"
            factorKey="avoidedTriggers"
          />
          <FactorToggle 
            icon="checkmark-done"
            title="Productive Day"
            description="Rate daily productivity"
            factorKey="productiveDay"
          />
          <FactorToggle 
            icon="heart"
            title="Gratitude"
            description="Daily gratitude reflection"
            factorKey="gratefulFor"
          />
          <FactorToggle 
            icon="help-circle"
            title="Biggest Challenge"
            description="Identify daily challenges"
            factorKey="biggestChallenge"
          />
          <FactorToggle 
            icon="flag"
            title="Tomorrow's Goal"
            description="Set daily intentions"
            factorKey="tomorrowGoal"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // Modal Container
  modalContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  modalGradient: {
    flex: 1,
  },
  
  // Premium Modal Header
  premiumModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  premiumModalBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  premiumModalBackGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
  },
  premiumModalTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  
  // Date Navigation
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,  // Add space from header
    marginBottom: SPACING.lg,
    zIndex: 999,  // Ensure date nav is above the footer
  },
  dateNavLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: SPACING.md, // Add space between date nav and insights button
  },
  dateArrow: {
    padding: SPACING.sm,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateArrowDisabled: {
    opacity: 0.3,
  },
  dateButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.xs,
    maxWidth: 200, // Prevent date text from getting too wide
  },
  dateText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#FFFFFF',
  },

  // Insights Button styles - no longer absolute positioned
  insightsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,  // Increased from 8
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 10,  // Ensure button is on top
    minHeight: 44,  // iOS minimum touch target
  },
  insightsButtonActive: {
    backgroundColor: 'rgba(192, 132, 252, 0.1)',
    borderColor: 'rgba(192, 132, 252, 0.3)',
  },
  insightsButtonText: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.4)',
    marginLeft: 4,
    letterSpacing: -0.2,
  },
  insightsButtonTextActive: {
    color: '#C084FC',
  },
  insightsButtonDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#C084FC',
    marginLeft: 4,
  },
  
  modalContent: {
    flex: 1,
  },
  
  // Legacy styles for customization panel
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
  },
  slidingContainer: {
    flexDirection: 'row',
    width: SCREEN_WIDTH * 2,
    flex: 1,
  },
  panelContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
  },
  quickItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  quickQuestion: {
    fontSize: 16,
    fontWeight: '300',
    color: '#FFFFFF',
    flex: 1,
    letterSpacing: -0.2,
  },
  quickToggleGroup: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  quickToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  quickToggleNo: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#EF4444',
  },
  quickToggleYes: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: '#22C55E',
  },
  counterContainer: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  counterTitle: {
    fontSize: 16,
    fontWeight: '300',
    color: '#FFFFFF',
    marginBottom: SPACING.sm,
    letterSpacing: -0.2,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  counterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  counterButtonDisabled: {
    opacity: 0.3,
  },
  counterValue: {
    alignItems: 'center',
    minWidth: 80,
  },
  counterNumber: {
    fontSize: 24,
    fontWeight: '300',
    color: '#FFFFFF',
  },
  counterUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
    marginTop: 2,
  },
  insightsCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    alignSelf: 'flex-start',
  },
  insightsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 6,
  },
  insightsContentActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  insightsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: -0.1,
  },
  insightsTextActive: {
    color: '#8B5CF6',
  },
  insightsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B5CF6',
    marginLeft: 2,
  },
  insightsTextContainer: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  saveButton: {
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 17,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },

  // Customize Panel Styles
  customizeContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  customizeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  customizeCloseButton: {
    padding: 8,
  },
  customizeTitle: {
    fontSize: 20,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: -0.3,
  },
  customizeSaveButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(192, 132, 252, 0.3)',
  },
  customizeSaveText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#C084FC',
  },
  customizeInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    backgroundColor: 'rgba(192, 132, 252, 0.05)',
    borderWidth: 0.5,
    borderColor: 'rgba(192, 132, 252, 0.15)',
    borderRadius: 16,
  },
  customizeInfoText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 18,
    marginLeft: 12,
  },
  customizeContent: {
    flex: 1,
    paddingBottom: 0, // Remove any extra padding that might cause blue line
  },
  customizeSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  customizeSectionTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  customizeFactorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  customizeFactorCardActive: {
    backgroundColor: 'rgba(134, 239, 172, 0.08)',
    borderColor: 'rgba(134, 239, 172, 0.2)',
  },
  customizeFactorCardCore: {
    backgroundColor: 'rgba(192, 132, 252, 0.08)',
    borderColor: 'rgba(192, 132, 252, 0.2)',
  },
  customizeFactorIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  customizeFactorIconActive: {
    backgroundColor: 'rgba(134, 239, 172, 0.15)',
  },
  customizeFactorIconCore: {
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
  },
  customizeFactorContent: {
    flex: 1,
  },
  customizeFactorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  customizeFactorTitle: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: -0.2,
  },
  customizeFactorTitleDisabled: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  customizeCoreBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderRadius: 6,
  },
  customizeCoreBadgeText: {
    fontSize: 10,
    fontWeight: '400',
    color: '#C084FC',
    letterSpacing: 0.3,
  },
  customizeFactorDescription: {
    fontSize: 13,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.5)',
    lineHeight: 16,
  },
  customizeFactorDescriptionDisabled: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  customizeFactorToggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 2,
    marginLeft: 12,
  },
  customizeFactorToggleActive: {
    backgroundColor: 'rgba(134, 239, 172, 0.3)',
  },
  customizeFactorToggleInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  customizeFactorToggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    transform: [{ translateX: 0 }],
  },
  customizeFactorToggleThumbActive: {
    backgroundColor: '#FFFFFF',
    transform: [{ translateX: 20 }],
  },
  
  // Text input styles
  textInputContainer: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  textInputTitle: {
    fontSize: 16,
    fontWeight: '300',
    color: '#FFFFFF',
    marginBottom: SPACING.sm,
    letterSpacing: -0.2,
  },
  textInputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    minHeight: 60,
  },
  textInputButtonFilled: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textInputPlaceholder: {
    fontSize: 15,
    fontWeight: '300',
    color: '#6B7280',
    flex: 1,
    marginRight: SPACING.sm,
  },
  textInputValue: {
    fontSize: 15,
    fontWeight: '300',
    color: '#FFFFFF',
    flex: 1,
    marginRight: SPACING.sm,
    lineHeight: 20,
  },
  inputHelper: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
    marginTop: SPACING.xs,
  },
  
  // Text Input Modal styles - matching onboarding pattern
  textModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  textModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  textModalKeyboardView: {
    justifyContent: 'flex-end',
  },
  textModalContent: {
    backgroundColor: '#1f1f1f',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xl * 2 : SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  textModalDragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  textModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  textModalTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  textModalCloseButton: {
    padding: SPACING.sm,
  },
  textModalInput: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: 16,
    fontWeight: '300',
    color: '#FFFFFF',
    textAlignVertical: 'top',
    minHeight: 120,
    marginBottom: SPACING.lg,
  },
  textModalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textModalCharacterCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  textModalSaveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  textModalSaveButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  textModalSaveButtonText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  textModalSaveButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.4)',
  },

  // Scale component styles
  scaleContainer: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  scaleTitle: {
    fontSize: 16,
    fontWeight: '300',
    color: '#FFFFFF',
    marginBottom: SPACING.sm,
    letterSpacing: -0.2,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  scaleLabelText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
  },
  scaleValue: {
    fontSize: 18,
    fontWeight: '300',
    color: '#FFFFFF',
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  scaleButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  scaleButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  scaleButtonText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
  },
  scaleButtonTextActive: {
    color: '#FFFFFF',
  },
  
  // Insights Panel Styles
  insightsPanelContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  insightsPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  insightsPanelContent: {
    flex: 1,
    paddingBottom: 0, // Remove any extra padding that might cause blue line
  },
  insightsLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightsLoadingText: {
    fontSize: 16,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  insightsMetaInfo: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
  },
  insightsLastUpdated: {
    fontSize: 13,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4,
  },
  insightsEntriesCount: {
    fontSize: 12,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  insightsQualitySection: {
    paddingHorizontal: 24,
    marginTop: 12,
    marginBottom: 24,
  },
  insightsQualityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightsQualityTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 0.5,
  },
  insightsQualityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(192, 132, 252, 0.3)',
  },
  insightsQualityBadgeText: {
    fontSize: 11,
    fontWeight: '400',
    color: '#C084FC',
    letterSpacing: 0.5,
  },
  insightsQualityProgressContainer: {
    marginBottom: 8,
  },
  insightsQualityProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  insightsQualityProgressFill: {
    height: '100%',
    backgroundColor: '#C084FC',
    borderRadius: 2,
  },
  insightsQualityDescription: {
    fontSize: 12,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  insightsSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  insightsSectionTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  insightsPatternGroup: {
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  insightsPatternHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  insightsPatternLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '400',
  },
  insightsImpactLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '300',
  },
  insightsDivider: {
    height: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  insightsPatternItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  insightsPatternText: {
    fontSize: 15,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.7)',
    flex: 1,
  },
  insightsPositiveImpact: {
    fontSize: 14,
    color: 'rgba(134, 239, 172, 0.8)',
    fontWeight: '400',
    minWidth: 50,
    textAlign: 'right',
  },
  insightsNegativeImpact: {
    fontSize: 14,
    color: 'rgba(239, 68, 68, 0.8)',
    fontWeight: '400',
    minWidth: 50,
    textAlign: 'right',
  },
  insightsCard: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'flex-start',
  },
  insightsIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(192, 132, 252, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(192, 132, 252, 0.2)',
  },
  insightsCardContent: {
    flex: 1,
  },
  insightsCardTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  insightsCardText: {
    fontSize: 14,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 20,
  },
});

// Insights Panel Component
const InsightsPanel: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const [insightsData, setInsightsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadInsights();
    
    // Pulse animation for scroll indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const loadInsights = async () => {
    try {
      setIsLoading(true);
      const allEntries = await AsyncStorage.getItem(JOURNAL_ENTRIES_KEY);
      
      if (allEntries) {
        const entries = JSON.parse(allEntries);
        const insights = generateInsights(entries);
        setInsightsData(insights);
      }
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.insightsPanelContainer}>
        <View style={styles.insightsPanelHeader}>
          <TouchableOpacity onPress={onClose} style={styles.customizeCloseButton}>
            <Ionicons name="arrow-back" size={24} color="#9CA3AF" />
          </TouchableOpacity>
          <Text style={styles.customizeTitle}>Recovery Insights</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.insightsLoadingContainer}>
          <Text style={styles.insightsLoadingText}>Analyzing your data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.insightsPanelContainer}>
      {/* Header */}
      <View style={styles.insightsPanelHeader}>
        <TouchableOpacity onPress={onClose} style={styles.customizeCloseButton}>
          <Ionicons name="arrow-back" size={24} color="#9CA3AF" />
        </TouchableOpacity>
        <Text style={styles.customizeTitle}>Recovery Insights</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.insightsPanelContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Meta Info */}
        <View style={styles.insightsMetaInfo}>
          <Text style={styles.insightsLastUpdated}>Last updated: {insightsData?.lastUpdated || 'Never'}</Text>
          <Text style={styles.insightsEntriesCount}>Based on {insightsData?.entryCount || 0} journal entries</Text>
        </View>

        {/* Data Quality Indicator */}
        <View style={styles.insightsQualitySection}>
          <View style={styles.insightsQualityHeader}>
            <Text style={styles.insightsQualityTitle}>INSIGHT QUALITY</Text>
            <View style={styles.insightsQualityBadge}>
              <Text style={styles.insightsQualityBadgeText}>
                {insightsData?.dataQuality === 'excellent' ? 'EXCELLENT' : 
                 insightsData?.dataQuality === 'good' ? 'GOOD' : 'BUILDING'}
              </Text>
            </View>
          </View>
          
          <View style={styles.insightsQualityProgressContainer}>
            <View style={styles.insightsQualityProgressBar}>
              <View 
                style={[
                  styles.insightsQualityProgressFill,
                  { 
                    width: insightsData?.entryCount >= 100 ? '100%' : 
                           insightsData?.entryCount >= 30 ? '66%' : 
                           insightsData?.entryCount >= 5 ? '33%' : '10%'
                  }
                ]} 
              />
            </View>
          </View>
          
          <Text style={styles.insightsQualityDescription}>
            {insightsData?.entryCount < 5 ? 
              `${5 - insightsData?.entryCount} more ${(5 - insightsData?.entryCount) === 1 ? 'entry' : 'entries'} to begin` :
             insightsData?.entryCount < 30 ? 
              `${30 - insightsData?.entryCount} more for advanced patterns` :
             insightsData?.entryCount < 100 ? 
              `${100 - insightsData?.entryCount} more for expert analysis` :
              'Maximum depth reached'}
          </Text>
        </View>

        {/* Patterns */}
        {(insightsData?.positivePatterns?.length > 0 || insightsData?.challengingPatterns?.length > 0) && (
          <View style={styles.insightsSection}>
            <Text style={styles.insightsSectionTitle}>WHAT AFFECTS YOUR RECOVERY</Text>
            
            {/* Positive Patterns */}
            {insightsData?.positivePatterns?.length > 0 && (
              <View style={styles.insightsPatternGroup}>
                <View style={styles.insightsPatternHeader}>
                  <Text style={styles.insightsPatternLabel}>Positive Patterns</Text>
                  <Text style={styles.insightsImpactLabel}>Impact</Text>
                </View>
                <View style={styles.insightsDivider} />
                
                {insightsData.positivePatterns.map((pattern: any, index: number) => (
                  <View key={index} style={styles.insightsPatternItem}>
                    <Text style={styles.insightsPatternText}>{pattern.factor}</Text>
                    <Text style={styles.insightsPositiveImpact}>+{pattern.impact}%</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Challenging Patterns */}
            {insightsData?.challengingPatterns?.length > 0 && (
              <View style={[styles.insightsPatternGroup, { marginTop: 16 }]}>
                <View style={styles.insightsPatternHeader}>
                  <Text style={styles.insightsPatternLabel}>Challenging Patterns</Text>
                  <Text style={styles.insightsImpactLabel}>Impact</Text>
                </View>
                <View style={styles.insightsDivider} />
                
                {insightsData.challengingPatterns.map((pattern: any, index: number) => (
                  <View key={index} style={styles.insightsPatternItem}>
                    <Text style={styles.insightsPatternText}>{pattern.factor}</Text>
                    <Text style={styles.insightsNegativeImpact}>{pattern.impact}%</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Insights */}
        {insightsData?.insights?.length > 0 && (
          <View style={styles.insightsSection}>
            <Text style={styles.insightsSectionTitle}>INSIGHTS FROM YOUR JOURNAL</Text>
            
            {insightsData.insights.map((insight: any, index: number) => (
              <View key={index} style={styles.insightsCard}>
                <View style={styles.insightsIcon}>
                  <Ionicons 
                    name={insight.icon as keyof typeof Ionicons.glyphMap} 
                    size={18} 
                    color="#C084FC" 
                  />
                </View>
                <View style={styles.insightsCardContent}>
                  <Text style={styles.insightsCardTitle}>{insight.title}</Text>
                  <Text style={styles.insightsCardText}>{insight.description}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default RecoveryJournal; 