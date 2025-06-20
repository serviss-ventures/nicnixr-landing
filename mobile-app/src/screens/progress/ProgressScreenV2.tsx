import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { COLORS, SPACING } from '../../constants/theme';
import { useRoute, RouteProp } from '@react-navigation/native';

// Import tab components (to be created)
import JourneyTab from './tabs/JourneyTab';
import AchievementsTab from './tabs/AchievementsTab';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Tab configuration
const TABS = [
  {
    id: 'journey',
    label: 'Journey',
    icon: 'location-outline' as const,
    activeColor: 'rgba(147, 197, 253, 0.6)', // Much softer blue
  },
  {
    id: 'achievements',
    label: 'Achievements',
    icon: 'star-outline' as const,
    activeColor: 'rgba(250, 204, 21, 0.6)', // Much softer gold
  },
] as const;

type TabId = typeof TABS[number]['id'];

type ProgressScreenRouteProp = RouteProp<{
  Progress: { initialTab?: TabId };
}, 'Progress'>;

const ProgressScreenV2: React.FC = () => {
  const route = useRoute<ProgressScreenRouteProp>();
  const initialTab = route.params?.initialTab || 'journey';
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  
  // Redux selectors
  const stats = useSelector((state: RootState) => state.progress.stats);
  const user = useSelector((state: RootState) => state.auth.user);
  const achievements = useSelector((state: RootState) => state.achievement);
  
  useEffect(() => {
    // Simulate loading for now
    setTimeout(() => setIsLoading(false), 500);
  }, []);
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.textSecondary} />
      </View>
    );
  }
  
  // Tab Bar Component
  const TabBar = () => (
    <View style={styles.tabBar}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.7}
          >
            <View style={styles.tabButtonContent}>
              <View style={[
                styles.tabIconWrapper,
                isActive && { 
                  backgroundColor: `${tab.activeColor}08`, // Even more subtle
                  borderColor: `${tab.activeColor}15`, // Softer border
                }
              ]}>
                <Ionicons
                  name={tab.icon}
                  size={24}
                  color={isActive ? tab.activeColor : 'rgba(255, 255, 255, 0.4)'} // Softer inactive
                />
              </View>
              <Text style={[
                styles.tabLabel,
                isActive && { 
                  color: COLORS.text,
                  fontWeight: '400'
                }
              ]}>
                {tab.label}
              </Text>
              {isActive && (
                <View style={[
                  styles.tabIndicator,
                  { backgroundColor: tab.activeColor }
                ]} />
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
  
  // Header Component
  const Header = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Your Progress</Text>
      <Text style={styles.subtitle}>Track your recovery journey</Text>
    </View>
  );
  
  return (
    <LinearGradient
      colors={['#000000', '#0A0F1C', '#0F172A']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>Track your recovery journey</Text>
        </View>

        {/* Tab Navigation */}
        <TabBar />
        
        <View style={styles.tabContentContainer}>
          {activeTab === 'journey' ? (
            <JourneyTab stats={stats} user={user} />
          ) : (
            <AchievementsTab achievements={achievements} stats={stats} />
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0F1C',
  },
  
  // Header Styles
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  title: {
    fontSize: 28,
    fontWeight: '400',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '300',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  
  // Tab Bar Styles
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    gap: SPACING.md,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.xs,
  },
  tabActive: {
    // Active state handled by child elements
  },
  tabButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '300',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    letterSpacing: 0.2,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -12,
    width: 48,
    height: 2,
    borderRadius: 1,
  },
  
  // Tab Content
  tabContentContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default ProgressScreenV2; 