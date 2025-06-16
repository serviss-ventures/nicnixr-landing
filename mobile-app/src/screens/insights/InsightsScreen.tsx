import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING } from '../../constants/theme';
import { generateInsights } from '../../utils/insightsGenerator';

const JOURNAL_ENTRIES_KEY = '@recovery_journal_entries';
const MINIMUM_ENTRIES = 5;

const InsightsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [insightsData, setInsightsData] = useState<any>(null);
  const [showMinimumEntriesModal, setShowMinimumEntriesModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
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
        
        // Always set the insights data so we have the entry count
        setInsightsData(insights);
        
        if (insights.entryCount < MINIMUM_ENTRIES) {
          setShowMinimumEntriesModal(true);
        }
      } else {
        // No entries at all
        setInsightsData({
          entryCount: 0,
          lastUpdated: 'Never',
          positivePatterns: [],
          challengingPatterns: [],
          insights: []
        });
        setShowMinimumEntriesModal(true);
      }
    } catch (error) {
      console.error('Failed to load insights:', error);
      // Set default data on error
      setInsightsData({
        entryCount: 0,
        lastUpdated: 'Never',
        positivePatterns: [],
        challengingPatterns: [],
        insights: []
      });
      setShowMinimumEntriesModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowMinimumEntriesModal(false);
    navigation.goBack();
  };

  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    if (contentOffset.y > 20 && showScrollIndicator) {
      setShowScrollIndicator(false);
    } else if (contentOffset.y <= 20 && !showScrollIndicator) {
      setShowScrollIndicator(true);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#000000', '#0A0F1C', '#0F172A']}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>RECOVERY INSIGHTS</Text>
              <View style={styles.headerRight} />
            </View>
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Analyzing your data...</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>RECOVERY INSIGHTS</Text>
            <View style={styles.headerRight} />
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {/* Last Updated */}
            <View style={styles.metaInfo}>
              <Text style={styles.lastUpdated}>Last updated: {insightsData?.lastUpdated || 'Never'}</Text>
              <Text style={styles.entriesCount}>Based on {insightsData?.entryCount || 0} journal entries</Text>
            </View>

            {/* Data Quality Indicator */}
            <View style={styles.dataQualitySection}>
              <View style={styles.dataQualityHeader}>
                <Text style={styles.dataQualityTitle}>INSIGHT QUALITY</Text>
                <View style={styles.qualityBadge}>
                  <Text style={styles.qualityBadgeText}>
                    {insightsData?.dataQuality === 'excellent' ? 'EXCELLENT' : 
                     insightsData?.dataQuality === 'good' ? 'GOOD' : 'BUILDING'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.qualityProgressContainer}>
                <View style={styles.qualityProgressBar}>
                  <View 
                    style={[
                      styles.qualityProgressFill,
                      { 
                        width: insightsData?.entryCount >= 100 ? '100%' : 
                               insightsData?.entryCount >= 30 ? '66%' : 
                               insightsData?.entryCount >= 5 ? '33%' : '10%'
                      }
                    ]} 
                  />
                  {/* Milestone markers */}
                  <View style={[styles.milestone, { left: '33%' }]}>
                    <View style={[styles.milestoneMarker, insightsData?.entryCount >= 5 && styles.milestoneReached]}>
                      {insightsData?.entryCount >= 5 && (
                        <Ionicons name="checkmark" size={10} color="#C084FC" />
                      )}
                    </View>
                    <Text style={styles.milestoneText}>5</Text>
                  </View>
                  <View style={[styles.milestone, { left: '66%' }]}>
                    <View style={[styles.milestoneMarker, insightsData?.entryCount >= 30 && styles.milestoneReached]}>
                      {insightsData?.entryCount >= 30 && (
                        <Ionicons name="checkmark" size={10} color="#C084FC" />
                      )}
                    </View>
                    <Text style={styles.milestoneText}>30</Text>
                  </View>
                  <View style={[styles.milestone, { left: '100%' }]}>
                    <View style={[styles.milestoneMarker, insightsData?.entryCount >= 100 && styles.milestoneReached]}>
                      {insightsData?.entryCount >= 100 && (
                        <Ionicons name="checkmark" size={10} color="#C084FC" />
                      )}
                    </View>
                    <Text style={styles.milestoneText}>100</Text>
                  </View>
                </View>
              </View>
              
              <Text style={styles.qualityDescription}>
                {insightsData?.entryCount < 5 ? 
                  `${5 - insightsData?.entryCount} more ${(5 - insightsData?.entryCount) === 1 ? 'entry' : 'entries'} to begin` :
                 insightsData?.entryCount < 30 ? 
                  `${30 - insightsData?.entryCount} more for advanced patterns` :
                 insightsData?.entryCount < 100 ? 
                  `${100 - insightsData?.entryCount} more for expert analysis` :
                  'Maximum depth reached'}
              </Text>
              
              {/* Insight Levels */}
              <View style={styles.insightLevels}>
                <View style={[styles.insightLevel, insightsData?.entryCount >= 5 && styles.insightLevelUnlocked]}>
                  <Ionicons 
                    name="bar-chart-outline" 
                    size={14} 
                    color={insightsData?.entryCount >= 5 ? COLORS.text : COLORS.textSecondary} 
                  />
                  <Text style={[styles.insightLevelText, insightsData?.entryCount >= 5 && styles.insightLevelTextUnlocked]}>
                    Basic Patterns
                  </Text>
                </View>
                <View style={[styles.insightLevel, insightsData?.entryCount >= 30 && styles.insightLevelUnlocked]}>
                  <Ionicons 
                    name="trending-up" 
                    size={14} 
                    color={insightsData?.entryCount >= 30 ? COLORS.text : COLORS.textSecondary} 
                  />
                  <Text style={[styles.insightLevelText, insightsData?.entryCount >= 30 && styles.insightLevelTextUnlocked]}>
                    Correlations
                  </Text>
                </View>
                <View style={[styles.insightLevel, insightsData?.entryCount >= 100 && styles.insightLevelUnlocked]}>
                  <Ionicons 
                    name="sparkles" 
                    size={14} 
                    color={insightsData?.entryCount >= 100 ? COLORS.text : COLORS.textSecondary} 
                  />
                  <Text style={[styles.insightLevelText, insightsData?.entryCount >= 100 && styles.insightLevelTextUnlocked]}>
                    Predictions
                  </Text>
                </View>
              </View>
            </View>

            {/* Scroll Indicator */}
            {showScrollIndicator && insightsData?.entryCount >= 5 && (
              <Animated.View style={[styles.scrollIndicator, { opacity: fadeAnim }]}>
                <Ionicons name="chevron-down" size={24} color="rgba(255, 255, 255, 0.4)" />
                <Text style={styles.scrollIndicatorText}>Scroll for patterns</Text>
              </Animated.View>
            )}

            {/* What Affects Your Recovery */}
            {(insightsData?.positivePatterns?.length > 0 || insightsData?.challengingPatterns?.length > 0) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>WHAT AFFECTS YOUR RECOVERY</Text>
                
                {/* Positive Patterns */}
                {insightsData?.positivePatterns?.length > 0 && (
                  <View style={styles.patternGroup}>
                    <View style={styles.patternHeader}>
                      <Text style={styles.patternLabel}>Positive Patterns</Text>
                      <Text style={styles.impactLabel}>Impact</Text>
                    </View>
                    <View style={styles.divider} />
                    
                    {insightsData.positivePatterns.map((pattern: any, index: number) => (
                      <View key={index} style={styles.patternItem}>
                        <Text style={styles.patternText}>{pattern.factor}</Text>
                        <Text style={styles.positiveImpact}>+{pattern.impact}%</Text>
                      </View>
                    ))}
                  </View>
                )}

              {/* Challenging Patterns */}
              {insightsData?.challengingPatterns?.length > 0 && (
                <View style={[styles.patternGroup, styles.challengingGroup]}>
                  <View style={styles.patternHeader}>
                    <Text style={styles.patternLabel}>Challenging Patterns</Text>
                    <Text style={styles.impactLabel}>Impact</Text>
                  </View>
                  <View style={styles.divider} />
                  
                  {insightsData.challengingPatterns.map((pattern: any, index: number) => (
                    <View key={index} style={styles.patternItem}>
                      <Text style={styles.patternText}>{pattern.factor}</Text>
                      <Text style={styles.negativeImpact}>{pattern.impact}%</Text>
                    </View>
                  ))}
                </View>
              )}
              </View>
            )}

            {/* Insights From Your Journal */}
            {insightsData?.insights?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>INSIGHTS FROM YOUR JOURNAL</Text>
                
                {insightsData.insights.map((insight: any, index: number) => (
                  <View key={index} style={styles.insightCard}>
                    <View style={styles.insightIcon}>
                      <Ionicons 
                        name={insight.icon as keyof typeof Ionicons.glyphMap} 
                        size={18} 
                        color="#C084FC" 
                      />
                    </View>
                    <View style={styles.insightContent}>
                      <Text style={styles.insightTitle}>{insight.title}</Text>
                      <Text style={styles.insightText}>{insight.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* Minimum Entries Modal */}
      <Modal
        visible={showMinimumEntriesModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalContentInner}>
              <View style={styles.modalIconContainer}>
                <View style={styles.modalIconBackground}>
                  <Ionicons name="analytics" size={28} color="#C084FC" />
                </View>
              </View>
              
              <Text style={styles.modalTitle}>Insights Locked</Text>
              <Text style={styles.modalMessage}>
                Track your recovery journey for {MINIMUM_ENTRIES - (insightsData?.entryCount || 0)} more {MINIMUM_ENTRIES - (insightsData?.entryCount || 0) === 1 ? 'day' : 'days'} to unlock personalized insights
              </Text>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${((insightsData?.entryCount || 0) / MINIMUM_ENTRIES) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {insightsData?.entryCount || 0} of {MINIMUM_ENTRIES} days tracked
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={handleCloseModal}
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonText}>Continue Tracking</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: -0.3,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  metaInfo: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
  },
  lastUpdated: {
    fontSize: 13,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4,
  },
  entriesCount: {
    fontSize: 12,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  patternGroup: {
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  challengingGroup: {
    marginTop: 16,
  },
  patternHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  patternLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '400',
  },
  impactLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '300',
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  patternItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  patternText: {
    fontSize: 15,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.7)',
    flex: 1,
  },
  positiveImpact: {
    fontSize: 14,
    color: 'rgba(134, 239, 172, 0.8)',
    fontWeight: '400',
    minWidth: 50,
    textAlign: 'right',
  },
  negativeImpact: {
    fontSize: 14,
    color: 'rgba(239, 68, 68, 0.8)',
    fontWeight: '400',
    minWidth: 50,
    textAlign: 'right',
  },
  insightCard: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'flex-start',
  },
  insightIcon: {
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
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  insightText: {
    fontSize: 14,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 20,
    flexWrap: 'wrap',
    flex: 1,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    backgroundColor: '#0A0F1C',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  modalContentInner: {
    padding: 32,
    alignItems: 'center',
  },
  modalIconContainer: {
    marginBottom: 24,
  },
  modalIconBackground: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(192, 132, 252, 0.1)',
    borderWidth: 0.5,
    borderColor: 'rgba(192, 132, 252, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  modalMessage: {
    fontSize: 15,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 32,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(192, 132, 252, 0.5)',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    minWidth: 180,
    borderWidth: 0.5,
    borderColor: 'rgba(192, 132, 252, 0.3)',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#C084FC',
    textAlign: 'center',
  },
  // Data Quality Indicator styles
  dataQualitySection: {
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  dataQualityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dataQualityTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 0.5,
  },
  qualityBadge: {
    backgroundColor: 'rgba(192, 132, 252, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(192, 132, 252, 0.3)',
  },
  qualityBadgeText: {
    fontSize: 11,
    fontWeight: '400',
    color: '#C084FC',
    letterSpacing: 0.5,
  },
  qualityProgressContainer: {
    marginBottom: 16,
    paddingTop: 6,
  },
  qualityProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 4,
    position: 'relative',
    overflow: 'visible',
  },
  qualityProgressFill: {
    height: '100%',
    backgroundColor: 'rgba(192, 132, 252, 0.6)',
    borderRadius: 4,
  },
  milestone: {
    position: 'absolute',
    top: -5,
    transform: [{ translateX: -10 }],
    alignItems: 'center',
  },
  milestoneMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0A0F1C',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneReached: {
    backgroundColor: '#0A0F1C',
    borderColor: '#C084FC',
  },
  milestoneText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '300',
  },
  qualityDescription: {
    fontSize: 13,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  insightLevels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  insightLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.3,
  },
  insightLevelUnlocked: {
    opacity: 1,
  },
  insightLevelText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginLeft: 6,
    fontWeight: '300',
  },
  insightLevelTextUnlocked: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  scrollIndicator: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  scrollIndicatorText: {
    fontSize: 13,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 12,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    lineHeight: 18,
  },
});

export default InsightsScreen; 