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
}

const STORAGE_KEY = '@recovery_journal_factors';
const JOURNAL_ENTRIES_KEY = '@recovery_journal_entries';

const RecoveryJournal: React.FC<RecoveryJournalProps> = ({ visible, onClose, daysClean }) => {
  const navigation = useNavigation<StackNavigationProp<DashboardStackParamList>>();
  const [showCustomize, setShowCustomize] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
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
  }, []);

  // Reset to today when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedDate(new Date());
    }
  }, [visible]);

  // Load journal data when date changes
  useEffect(() => {
    loadJournalEntry(selectedDate);
  }, [selectedDate]);

  // Handle customize animation
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: showCustomize ? -SCREEN_WIDTH : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showCustomize, slideAnim]);

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
        } else {
          // Reset to default values if no entry exists for this date
          resetJournalData();
        }
      } else {
        resetJournalData();
      }
    } catch (error) {
      console.error('Failed to load journal entry:', error);
      resetJournalData();
    }
  };

  // Save journal entry for the selected date
  const saveJournalEntry = async (data: JournalData) => {
    try {
      const allEntries = await AsyncStorage.getItem(JOURNAL_ENTRIES_KEY);
      const entries = allEntries ? JSON.parse(allEntries) : {};
      const dateKey = formatDateKey(selectedDate);
      
      // Save the entry for the selected date
      entries[dateKey] = data;
      
      await AsyncStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(entries));
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
    const hasData = Object.entries(journalData).some(([, val]) => {
      if (typeof val === 'string') return val.trim().length > 0;
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
      
      // TODO: Also save to analytics database when available
                // Journal data saved successfully
      
      onClose();
      
      setTimeout(() => {
        Alert.alert(
          'Journal Saved', 
          `Your recovery journal for ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} has been saved! 🎉`
        );
      }, 300);
    } catch {
      Alert.alert('Save Failed', 'Unable to save your journal entry. Please try again.');
    }
  }, [journalData, selectedDate, onClose, saveJournalEntry, formatDateKey]);

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
          <Ionicons name="close" size={18} color={value === false ? "#FFFFFF" : "#6B7280"} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.quickToggle,
            value === true && styles.quickToggleYes
          ]}
          onPress={() => updateJournalData(dataKey, true)}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark" size={18} color={value === true ? "#FFFFFF" : "#6B7280"} />
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
                    const newDate = new Date(selectedDate);
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
                      const newDate = new Date(selectedDate);
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
                  onClose(); // Close the journal modal first
                  navigation.navigate('Insights');
                }}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name="bulb-outline" 
                  size={18} 
                  color={daysClean >= 5 ? "#8B5CF6" : "#6B7280"} 
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
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.saveGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.saveText}>
                    {selectedDate.toDateString() === new Date().toDateString() 
                      ? 'Save Journal Entry' 
                      : `Update ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} Entry`}
                  </Text>
                </LinearGradient>
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
      >
        <LinearGradient
          colors={['#000000', '#0A0F1C']}
          style={{ flex: 1 }}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <CustomizePanel 
              enabledFactors={enabledFactors}
              onSave={handleCustomizeSave}
              onClose={() => setShowCustomize(false)}
            />
          </SafeAreaView>
        </LinearGradient>
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
        <View style={[styles.customizeFactorIcon, isEnabled && styles.customizeFactorIconActive]}>
          <Ionicons 
            name={icon as keyof typeof Ionicons.glyphMap} 
            size={20} 
            color={isEnabled ? '#8B5CF6' : '#6B7280'} 
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
          <Ionicons 
            name={isEnabled ? "checkmark-sharp" : "close"} 
            size={16} 
            color="#FFFFFF" 
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
        <Ionicons name="information-circle" size={20} color="#3B82F6" />
        <Text style={styles.customizeInfoText}>
          Core factors are always tracked and cannot be disabled. Add additional factors based on your recovery needs.
        </Text>
      </View>

      <ScrollView style={styles.customizeContent} showsVerticalScrollIndicator={false}>
        {/* Core Mental Health Section */}
        <View style={styles.customizeSection}>
          <Text style={styles.customizeSectionTitle}>CORE MENTAL HEALTH</Text>
          <FactorToggle 
            icon="happy-outline"
            title="Mood State"
            description="Track daily mood patterns"
            factorKey="moodState"
            isCore={true}
          />
          <FactorToggle 
            icon="flame-outline"
            title="Craving Tracking"
            description="Monitor nicotine cravings"
            factorKey="cravingTracking"
            isCore={true}
          />
          <FactorToggle 
            icon="thermometer-outline"
            title="Craving Intensity"
            description="Rate craving strength"
            factorKey="cravingIntensity"
            isCore={true}
          />
          <FactorToggle 
            icon="alert-circle-outline"
            title="Stress Level"
            description="Monitor daily stress"
            factorKey="stressLevel"
            isCore={true}
          />
          <FactorToggle 
            icon="pulse-outline"
            title="Anxiety Level"
            description="Track anxiety patterns"
            factorKey="anxietyLevel"
            isCore={true}
          />
        </View>

        {/* Core Physical Section */}
        <View style={styles.customizeSection}>
          <Text style={styles.customizeSectionTitle}>CORE PHYSICAL</Text>
          <FactorToggle 
            icon="moon-outline"
            title="Sleep Quality"
            description="Rate your sleep quality"
            factorKey="sleepQuality"
            isCore={true}
          />
          <FactorToggle 
            icon="time-outline"
            title="Sleep Duration"
            description="Track hours of sleep"
            factorKey="sleepDuration"
            isCore={true}
          />
          <FactorToggle 
            icon="battery-charging-outline"
            title="Energy Level"
            description="Monitor daily energy"
            factorKey="energyLevel"
            isCore={true}
          />
        </View>

        {/* Core Behavioral Section */}
        <View style={styles.customizeSection}>
          <Text style={styles.customizeSectionTitle}>CORE BEHAVIORAL</Text>
          <FactorToggle 
            icon="warning-outline"
            title="Triggers Encountered"
            description="Track exposure to triggers"
            factorKey="triggersEncountered"
            isCore={true}
          />
          <FactorToggle 
            icon="shield-checkmark-outline"
            title="Coping Strategies"
            description="Track strategy usage"
            factorKey="copingStrategiesUsed"
            isCore={true}
          />
        </View>

        {/* Additional Factors - Mental Health */}
        <View style={styles.customizeSection}>
          <Text style={styles.customizeSectionTitle}>ADDITIONAL MENTAL HEALTH</Text>
          <FactorToggle 
            icon="cloud-outline"
            title="Breathing Exercises"
            description="Track breathing practice"
            factorKey="breathingExercises"
          />
          <FactorToggle 
            icon="flower-outline"
            title="Meditation Time"
            description="Log meditation minutes"
            factorKey="meditationTime"
          />
          <FactorToggle 
            icon="trending-up-outline"
            title="Mood Swings"
            description="Track mood volatility"
            factorKey="moodSwings"
          />
          <FactorToggle 
            icon="flash-outline"
            title="Irritability"
            description="Monitor irritability levels"
            factorKey="irritability"
          />
          <FactorToggle 
            icon="eye-outline"
            title="Concentration"
            description="Track focus ability"
            factorKey="concentration"
          />
        </View>

        {/* Additional Factors - Physical */}
        <View style={styles.customizeSection}>
          <Text style={styles.customizeSectionTitle}>ADDITIONAL PHYSICAL</Text>
          <FactorToggle 
            icon="water-outline"
            title="Hydration Level"
            description="Track water intake"
            factorKey="hydrationLevel"
          />
          <FactorToggle 
            icon="fitness-outline"
            title="Physical Activity"
            description="Log exercise completion"
            factorKey="physicalActivity"
          />
          <FactorToggle 
            icon="timer-outline"
            title="Exercise Duration"
            description="Track workout length"
            factorKey="exerciseDuration"
          />
          <FactorToggle 
            icon="restaurant-outline"
            title="Appetite"
            description="Monitor appetite changes"
            factorKey="appetite"
          />
          <FactorToggle 
            icon="medical-outline"
            title="Headaches"
            description="Track headache occurrence"
            factorKey="headaches"
          />
        </View>

        {/* Additional Factors - Behavioral & Wellness */}
        <View style={styles.customizeSection}>
          <Text style={styles.customizeSectionTitle}>BEHAVIORAL & WELLNESS</Text>
          <FactorToggle 
            icon="people-outline"
            title="Social Interactions"
            description="Track social support"
            factorKey="socialInteractions"
          />
          <FactorToggle 
            icon="hand-left-outline"
            title="Avoided Triggers"
            description="Track trigger avoidance"
            factorKey="avoidedTriggers"
          />
          <FactorToggle 
            icon="checkmark-done-outline"
            title="Productive Day"
            description="Rate daily productivity"
            factorKey="productiveDay"
          />
          <FactorToggle 
            icon="heart-outline"
            title="Gratitude"
            description="Daily gratitude reflection"
            factorKey="gratefulFor"
          />
          <FactorToggle 
            icon="help-circle-outline"
            title="Biggest Challenge"
            description="Identify daily challenges"
            factorKey="biggestChallenge"
          />
          <FactorToggle 
            icon="flag-outline"
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
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
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
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
  },
  premiumModalTitle: {
    fontSize: 18,
    fontWeight: '700',
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
    marginBottom: SPACING.lg,
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
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Insights Button styles - no longer absolute positioned
  insightsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  insightsButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  insightsButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
    marginLeft: 4,
  },
  insightsButtonTextActive: {
    color: '#8B5CF6',
  },
  insightsButtonDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#8B5CF6',
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
    fontSize: 14,
    fontWeight: '600',
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
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  quickQuestion: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
    letterSpacing: -0.2,
  },
  quickToggleGroup: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  quickToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickToggleNo: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  quickToggleYes: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  counterContainer: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  counterTitle: {
    fontSize: 16,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '600',
    color: '#FFFFFF',
  },
  counterUnit: {
    fontSize: 12,
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
    overflow: 'hidden',
  },
  saveGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },

  // Customize Panel Styles
  customizeContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  customizeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  customizeCloseButton: {
    padding: SPACING.xs,
  },
  customizeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  customizeSaveButton: {
    padding: SPACING.xs,
  },
  customizeSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  customizeInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: 'rgba(31, 41, 55, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 12,
  },
  customizeInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
    marginLeft: SPACING.sm,
  },
  customizeContent: {
    flex: 1,
  },
  customizeSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  customizeSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1.2,
    marginBottom: SPACING.md,
  },
  customizeFactorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  customizeFactorCardActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  customizeFactorCardCore: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  customizeFactorIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  customizeFactorIconActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  customizeFactorContent: {
    flex: 1,
  },
  customizeFactorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  customizeFactorTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E5E7EB',
    letterSpacing: -0.2,
  },
  customizeFactorTitleDisabled: {
    color: '#6B7280',
  },
  customizeCoreBadge: {
    marginLeft: SPACING.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 4,
  },
  customizeCoreBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3B82F6',
    letterSpacing: 0.5,
  },
  customizeFactorDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  customizeFactorDescriptionDisabled: {
    color: '#6B7280',
  },
  customizeFactorToggle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#6B7280',
    marginLeft: SPACING.md,
  },
  customizeFactorToggleActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  customizeFactorToggleInactive: {
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    borderColor: '#6B7280',
  },
  
  // Text input styles
  textInputContainer: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  textInputTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: SPACING.sm,
    letterSpacing: -0.2,
  },
  textInputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 60,
  },
  textInputButtonFilled: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  textInputPlaceholder: {
    fontSize: 15,
    color: '#6B7280',
    flex: 1,
    marginRight: SPACING.sm,
  },
  textInputValue: {
    fontSize: 15,
    color: '#FFFFFF',
    flex: 1,
    marginRight: SPACING.sm,
    lineHeight: 20,
  },
  inputHelper: {
    fontSize: 12,
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
    fontWeight: '700',
    color: '#FFFFFF',
  },
  textModalCloseButton: {
    padding: SPACING.sm,
  },
  textModalInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: 16,
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
    backgroundColor: '#8B5CF6',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  textModalSaveButtonDisabled: {
    backgroundColor: 'rgba(139, 92, 246, 0.5)',
    shadowOpacity: 0,
    elevation: 0,
  },
  textModalSaveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  textModalSaveButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.6)',
  },

  // Scale component styles
  scaleContainer: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  scaleTitle: {
    fontSize: 16,
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
    color: '#6B7280',
  },
  scaleValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B5CF6',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  scaleButtonActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  scaleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  scaleButtonTextActive: {
    color: '#FFFFFF',
  },
});

export default RecoveryJournal; 