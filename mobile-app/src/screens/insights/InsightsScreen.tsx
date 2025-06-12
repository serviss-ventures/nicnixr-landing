import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
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

  useEffect(() => {
    loadInsights();
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
                    <View style={[styles.milestoneMarker, insightsData?.entryCount >= 5 && styles.milestoneReached]} />
                    <Text style={styles.milestoneText}>5</Text>
                  </View>
                  <View style={[styles.milestone, { left: '66%' }]}>
                    <View style={[styles.milestoneMarker, insightsData?.entryCount >= 30 && styles.milestoneReached]} />
                    <Text style={styles.milestoneText}>30</Text>
                  </View>
                  <View style={[styles.milestone, { left: '100%' }]}>
                    <View style={[styles.milestoneMarker, insightsData?.entryCount >= 100 && styles.milestoneReached]} />
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
                    size={16} 
                    color={insightsData?.entryCount >= 5 ? '#8B5CF6' : COLORS.textSecondary} 
                  />
                  <Text style={[styles.insightLevelText, insightsData?.entryCount >= 5 && styles.insightLevelTextUnlocked]}>
                    Basic Patterns
                  </Text>
                </View>
                <View style={[styles.insightLevel, insightsData?.entryCount >= 30 && styles.insightLevelUnlocked]}>
                  <Ionicons 
                    name="trending-up" 
                    size={16} 
                    color={insightsData?.entryCount >= 30 ? '#8B5CF6' : COLORS.textSecondary} 
                  />
                  <Text style={[styles.insightLevelText, insightsData?.entryCount >= 30 && styles.insightLevelTextUnlocked]}>
                    Correlations
                  </Text>
                </View>
                <View style={[styles.insightLevel, insightsData?.entryCount >= 100 && styles.insightLevelUnlocked]}>
                  <Ionicons 
                    name="sparkles" 
                    size={16} 
                    color={insightsData?.entryCount >= 100 ? '#8B5CF6' : COLORS.textSecondary} 
                  />
                  <Text style={[styles.insightLevelText, insightsData?.entryCount >= 100 && styles.insightLevelTextUnlocked]}>
                    Predictions
                  </Text>
                </View>
              </View>
            </View>

            

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
                        size={20} 
                        color="#8B5CF6" 
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
            <LinearGradient
              colors={['#1A1A2E', '#0F0F1E']}
              style={styles.modalGradient}
            >
              <View style={styles.modalIconContainer}>
                <View style={styles.modalIconBackground}>
                  <Ionicons name="analytics" size={32} color="#8B5CF6" />
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
            </LinearGradient>
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: 1,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  metaInfo: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  lastUpdated: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  entriesCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
    opacity: 0.7,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1.2,
    marginBottom: SPACING.md,
  },
  patternGroup: {
    marginBottom: SPACING.lg,
  },
  challengingGroup: {
    marginTop: SPACING.md,
  },
  patternHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  patternLabel: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  impactLabel: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: SPACING.sm,
  },
  patternItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  patternText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  positiveImpact: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'right',
  },
  negativeImpact: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'right',
  },
  insightCard: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    alignItems: 'flex-start',
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    marginTop: 2,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  insightText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    flexWrap: 'wrap',
    flex: 1,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  modalIconContainer: {
    marginBottom: SPACING.lg,
  },
  modalIconBackground: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  modalMessage: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  progressContainer: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
    minWidth: 180,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  // Data Quality Indicator styles
  dataQualitySection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  dataQualityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  dataQualityTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1.2,
  },
  qualityBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  qualityBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8B5CF6',
    letterSpacing: 0.5,
  },
  qualityProgressContainer: {
    marginBottom: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  qualityProgressBar: {
    height: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 4,
    position: 'relative',
    overflow: 'visible',
  },
  qualityProgressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },
  milestone: {
    position: 'absolute',
    top: -6,
    transform: [{ translateX: -10 }],
    alignItems: 'center',
  },
  milestoneMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    marginBottom: 6,
  },
  milestoneReached: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  milestoneText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  qualityDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  insightLevels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  insightLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.4,
  },
  insightLevelUnlocked: {
    opacity: 1,
  },
  insightLevelText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  insightLevelTextUnlocked: {
    color: COLORS.text,
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