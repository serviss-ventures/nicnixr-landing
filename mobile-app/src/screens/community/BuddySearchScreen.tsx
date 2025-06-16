import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import * as Haptics from 'expo-haptics';
import { RootState } from '../../store';
import { COLORS, SPACING } from '../../constants/theme';
// import Avatar from '../../components/common/Avatar';
import DicebearAvatar, { generateSeedFromEmoji, getRarityFromDays } from '../../components/common/DicebearAvatar';
import BuddyService, { BuddyProfile } from '../../services/buddyService';
import inviteService from '../../services/inviteService';
import { debounce } from 'lodash';
import { getBadgeForDaysClean } from '../../utils/badges';


const BuddySearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const stats = useSelector((state: RootState) => state.progress.stats);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BuddyProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [sendingRequests, setSendingRequests] = useState<Set<string>>(new Set());

  // Debounced search function
  const performSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setSearchResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);

      try {
        // Use the BuddyService to search for buddies
        const results = await BuddyService.searchBuddies(
          query,
          currentUser?.id || 'current-user'
        );
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [currentUser]
  );

  useEffect(() => {
    performSearch(searchQuery);
  }, [searchQuery, performSearch]);

  const handleSendRequest = async (buddy: BuddyProfile) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setSendingRequests(prev => new Set(prev).add(buddy.id));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the buddy's connection status
      setSearchResults(prev =>
        prev.map(b =>
          b.id === buddy.id
            ? { ...b, connectionStatus: 'pending-sent' as const }
            : b
        )
      );

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error sending buddy request:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSendingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(buddy.id);
        return newSet;
      });
    }
  };

  const handleInviteFriend = async () => {
    try {
      // Create invite with user data
      const inviteData = await inviteService.createInvite(
        currentUser?.id || 'user123',
        currentUser?.username || 'Anonymous',
        '', // Avatar will be generated from user ID
        stats?.daysClean || 0
      );
      
      const inviteLink = `https://nixr.app/invite/${inviteData.code}`;
      
      const message = `Hey! I'm ${stats?.daysClean || 0} days nicotine-free using NixR. Want to be my quit buddy? 

We can support each other through cravings and celebrate milestones together! 💪

Join me with this link: ${inviteLink}

Your invite code: ${inviteData.code}`;

      const result = await Share.share({
        message,
        title: 'Be My Quit Buddy on NixR',
      });

      if (result.action === Share.sharedAction) {
        Alert.alert(
          'Invite Sent',
          'When your friend joins with your code, they\'ll automatically be connected as your buddy.',
          [{ text: 'Awesome!', style: 'default' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to share invite. Please try again.');
    }
  };

  const renderBuddyItem = ({ item }: { item: BuddyProfile }) => {
    const isSending = sendingRequests.has(item.id);
    
    return (
      <TouchableOpacity
        style={styles.buddyCard}
        onPress={() => {
          navigation.navigate('BuddyProfile' as never, {
            buddy: {
              id: item.id,
              name: item.name,
              daysClean: item.daysClean,
              status: item.status,
              bio: item.bio,
              supportStyles: item.supportStyles,
            }
          } as never);
        }}
        activeOpacity={0.9}
      >
        <View style={styles.buddyCardGradient}>
          <View style={styles.buddyInfo}>
            <DicebearAvatar
              userId={item.id}
              size="medium"
              daysClean={item.daysClean}
              style="warrior"
              badge={getBadgeForDaysClean(item.daysClean)?.icon ? undefined : getBadgeForDaysClean(item.daysClean)?.emoji}
              badgeIcon={getBadgeForDaysClean(item.daysClean)?.icon}
              badgeColor={getBadgeForDaysClean(item.daysClean)?.color}
            />
            
            <View style={styles.buddyDetails}>
              <Text style={styles.buddyName}>{item.name}</Text>
              <Text style={styles.buddyStats}>
                Day {item.daysClean} • Quit {item.product}
              </Text>
              <Text style={styles.buddyBio} numberOfLines={1}>
                {item.bio}
              </Text>
            </View>
          </View>

          <View style={styles.actionContainer}>
            {item.connectionStatus === 'connected' ? (
              <View style={styles.connectedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="rgba(255, 255, 255, 0.6)" />
                <Text style={styles.connectedText}>Connected</Text>
              </View>
            ) : item.connectionStatus === 'pending-sent' ? (
              <View style={styles.pendingBadge}>
                <Ionicons name="time-outline" size={16} color="rgba(255, 255, 255, 0.5)" />
                <Text style={styles.pendingText}>Pending</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.addButton, isSending && styles.addButtonDisabled]}
                onPress={() => handleSendRequest(item)}
                disabled={isSending}
              >
                <View style={styles.addButtonGradient}>
                  {isSending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="person-add" size={16} color="#FFFFFF" />
                      <Text style={styles.addButtonText}>Add</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (!hasSearched) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🔍</Text>
          <Text style={styles.emptyStateTitle}>Search for Buddies</Text>
          <Text style={styles.emptyStateText}>
            Type at least 3 characters to search for friends by name
          </Text>
        </View>
      );
    }

    if (searchQuery.length < 3) {
      return null;
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateIcon}>🤷</Text>
        <Text style={styles.emptyStateTitle}>No Results Found</Text>
        <Text style={styles.emptyStateText}>
          Can't find who you're looking for? Invite them to join NixR and become your quit buddy!
        </Text>
        <TouchableOpacity 
          style={styles.inviteButton}
          onPress={handleInviteFriend}
        >
          <View style={styles.inviteButtonGradient}>
            <Ionicons name="person-add" size={20} color="#FFFFFF" />
            <Text style={styles.inviteButtonText}>Invite Friend</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <KeyboardAvoidingView
            style={styles.keyboardAvoid}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Find Buddies</Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color={COLORS.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by name..."
                  placeholderTextColor={COLORS.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setHasSearched(false);
                    }}
                    style={styles.clearButton}
                  >
                    <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
              {searchQuery.length > 0 && searchQuery.length < 3 && (
                <Text style={styles.searchHint}>
                  Type {3 - searchQuery.length} more character{3 - searchQuery.length !== 1 ? 's' : ''} to search
                </Text>
              )}
            </View>

            {/* Results */}
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="rgba(255, 255, 255, 0.4)" />
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            ) : (
              <FlatList
                data={searchResults}
                renderItem={renderBuddyItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptyState}
                keyboardShouldPersistTaps="handled"
              />
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
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
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 16,
    fontWeight: '300',
    color: COLORS.text,
  },
  clearButton: {
    padding: SPACING.xs,
  },
  searchHint: {
    fontSize: 12,
    fontWeight: '300',
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    marginLeft: SPACING.md,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    flexGrow: 1,
  },
  buddyCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  buddyCardGradient: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  buddyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buddyDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  buddyName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  buddyStats: {
    fontSize: 13,
    fontWeight: '300',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  buddyBio: {
    fontSize: 12,
    fontWeight: '300',
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  actionContainer: {
    marginTop: SPACING.sm,
    alignItems: 'flex-end',
  },
  addButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  addButtonDisabled: {
    opacity: 0.7,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  connectedText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '400',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '400',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 14,
    fontWeight: '300',
    color: COLORS.textMuted,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '300',
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  inviteButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  inviteButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    gap: 8,
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
  },
});

export default BuddySearchScreen; 