import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
  FlatList,
  RefreshControl,
  Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { COLORS, SPACING } from '../../constants/theme';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import Avatar from '../../components/common/Avatar';
import { CHARACTER_AVATARS } from '../../constants/avatars';

// Types
interface Buddy {
  id: string;
  name: string;
  avatar: string;
  daysClean: number;
  product: string;
  timezone: string;
  lastActive: Date;
  matchScore: number;
  status: 'online' | 'offline' | 'in-crisis';
  bio: string;
  supportStyle: 'motivator' | 'listener' | 'tough-love' | 'analytical';
  connectionStatus: 'connected' | 'pending-sent' | 'pending-received' | 'not-connected';
  connectionDate?: Date;
}

interface CommunityPost {
  id: string;
  author: string;
  authorAvatar: string;
  authorDaysClean: number;
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
  tags: string[];
  type: 'story' | 'question' | 'milestone' | 'crisis';
}

const CommunityScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const user = useSelector((state: RootState) => state.auth.user);
  const stats = useSelector((state: RootState) => state.progress.stats);
  
  const [activeTab, setActiveTab] = useState<'feed' | 'buddies'>('feed');
  const [showBuddyModal, setShowBuddyModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // Mock data - would come from API
  const [buddyMatches] = useState<Buddy[]>([
    {
      id: '1',
      name: 'Sarah M.',
      avatar: '🦸‍♀️',
      daysClean: 12,
      product: 'vaping',
      timezone: 'PST',
      lastActive: new Date(),
      matchScore: 95,
      status: 'online',
      bio: 'Mom of 2, quit vaping for my kids. Love hiking and coffee chats!',
      supportStyle: 'motivator',
      connectionStatus: 'connected',
      connectionDate: new Date(Date.now() - 86400000) // Connected yesterday
    },
    {
      id: '2',
      name: 'Mike R.',
      avatar: '🧙‍♂️',
      daysClean: 8,
      product: 'pouches',
      timezone: 'EST',
      lastActive: new Date(Date.now() - 3600000),
      matchScore: 88,
      status: 'offline',
      bio: 'Software dev, using coding to distract from cravings',
      supportStyle: 'analytical',
      connectionStatus: 'not-connected'
    },
    {
      id: '3',
      name: 'Emma L.',
      avatar: '👩‍🎨',
      daysClean: 15,
      product: 'vaping',
      timezone: 'PST',
      lastActive: new Date(Date.now() - 7200000),
      matchScore: 92,
      status: 'online',
      bio: 'Artist finding new ways to cope. Daily sketching helps!',
      supportStyle: 'listener',
      connectionStatus: 'pending-received'
    },
    {
      id: '4',
      name: 'James K.',
      avatar: '🏃‍♂️',
      daysClean: 10,
      product: 'cigarettes',
      timezone: 'CST',
      lastActive: new Date(Date.now() - 1800000),
      matchScore: 85,
      status: 'online',
      bio: 'Running my way to freedom. 5K goal by day 30!',
      supportStyle: 'motivator',
      connectionStatus: 'pending-sent'
    }
  ]);
  
  const [communityPosts] = useState<CommunityPost[]>([
    {
      id: '1',
      author: 'Jessica K.',
      authorAvatar: '👩',
      authorDaysClean: 30,
      content: "Just hit 30 days! 🎉 The cravings are finally getting easier. To everyone in their first week - IT GETS BETTER! My buddy Tom helped me through some rough nights. Find yourself a quit buddy, it makes all the difference!",
      timestamp: new Date(Date.now() - 3600000),
      likes: 156,
      comments: 23,
      isLiked: true,
      tags: ['milestone', '30-days', 'buddy-success'],
      type: 'milestone'
    },
    {
      id: '2',
      author: 'Anonymous',
      authorAvatar: '🫥',
      authorDaysClean: 5,
      content: "Having a really hard time right now. At a party and everyone's vaping. My hands are literally shaking. Someone please talk me out of this.",
      timestamp: new Date(Date.now() - 300000),
      likes: 45,
      comments: 67,
      isLiked: false,
      tags: ['help', 'craving', 'urgent'],
      type: 'crisis'
    }
  ]);
  
  // Slide in animation
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 1,
      tension: 20,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [activeTab, slideAnim]);
  
  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };
  
  const renderBuddyCard = (buddy: Buddy) => (
    <TouchableOpacity 
      style={styles.buddyCard} 
      activeOpacity={0.9}
      onPress={() => navigation.navigate('BuddyChat' as never, { 
        buddy: {
          id: buddy.id,
          name: buddy.name,
          avatar: buddy.avatar,
          daysClean: buddy.daysClean,
          status: buddy.status,
        }
      } as never)}
    >
      <LinearGradient
        colors={['rgba(16, 185, 129, 0.1)', 'rgba(6, 182, 212, 0.05)']}
        style={styles.buddyCardGradient}
      >
        <View style={styles.buddyHeader}>
          <View style={styles.buddyAvatarContainer}>
            <Avatar 
              emoji={buddy.avatar}
              size="medium"
              rarity={buddy.daysClean > 30 ? 'epic' : buddy.daysClean > 7 ? 'rare' : 'common'}
              badge={buddy.daysClean > 7 ? '🔥' : undefined}
              isOnline={buddy.status === 'online'}
            />
          </View>
          
          <View style={styles.buddyInfo}>
            <View style={styles.buddyNameRow}>
              <Text style={styles.buddyName}>{buddy.name}</Text>
            </View>
            
            <Text style={styles.buddyStats}>
              Day {buddy.daysClean} • Quit {buddy.product}
            </Text>
            
            <Text style={styles.buddyBio} numberOfLines={2}>
              "{buddy.bio}"
            </Text>
            
            <View style={styles.buddySupportStyle}>
              <Ionicons 
                name={
                  buddy.supportStyle === 'motivator' ? 'rocket' :
                  buddy.supportStyle === 'listener' ? 'ear' :
                  buddy.supportStyle === 'tough-love' ? 'barbell' :
                  'analytics'
                } 
                size={14} 
                color="#10B981" 
              />
              <Text style={styles.supportStyleText}>
                {buddy.supportStyle.charAt(0).toUpperCase() + buddy.supportStyle.slice(1).replace('-', ' ')}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.buddyActions}>
          {buddy.connectionStatus === 'connected' ? (
            <>
              <TouchableOpacity 
                style={styles.messageButton}
                onPress={() => navigation.navigate('BuddyChat' as never, { 
                  buddy: {
                    id: buddy.id,
                    name: buddy.name,
                    avatar: buddy.avatar,
                    daysClean: buddy.daysClean,
                    status: buddy.status,
                  }
                } as never)}
              >
                <LinearGradient
                  colors={['#10B981', '#06B6D4']}
                  style={styles.messageButtonGradient}
                >
                  <Ionicons name="chatbubble" size={16} color="#FFFFFF" />
                  <Text style={styles.messageButtonText}>Message Buddy</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <View style={styles.connectedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.connectedText}>Connected</Text>
              </View>
            </>
          ) : buddy.connectionStatus === 'pending-sent' ? (
            <View style={styles.pendingBadge}>
              <Ionicons name="time-outline" size={16} color="#F59E0B" />
              <Text style={styles.pendingText}>Request Sent</Text>
            </View>
          ) : buddy.connectionStatus === 'pending-received' ? (
            <>
              <TouchableOpacity style={styles.acceptButton}>
                <LinearGradient
                  colors={['#10B981', '#06B6D4']}
                  style={styles.acceptButtonGradient}
                >
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.declineButton}>
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.connectButton}>
              <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                style={styles.connectButtonGradient}
              >
                <Ionicons name="person-add" size={16} color="#FFFFFF" />
                <Text style={styles.connectButtonText}>Send Request</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
  
  const renderPost = (post: CommunityPost) => (
    <View style={styles.postCard}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
        style={styles.postGradient}
      >
        {post.type === 'crisis' && (
          <View style={styles.crisisHeader}>
            <Ionicons name="heart" size={16} color="#EC4899" />
            <Text style={styles.crisisLabel}>NEEDS SUPPORT</Text>
          </View>
        )}
        
        <View style={styles.postHeader}>
          <Text style={styles.postAvatar}>{post.authorAvatar}</Text>
          <View style={styles.postAuthorInfo}>
            <Text style={styles.postAuthor}>{post.author}</Text>
            <Text style={styles.postMeta}>
              Day {post.authorDaysClean} • {getTimeAgo(post.timestamp)}
            </Text>
          </View>
          
          {post.type === 'milestone' && (
            <View style={styles.milestoneIcon}>
              <Ionicons name="trophy" size={20} color="#F59E0B" />
            </View>
          )}
        </View>
        
        <Text style={styles.postContent}>{post.content}</Text>
        
        <View style={styles.postTags}>
          {post.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.postAction}>
            <Ionicons 
              name={post.isLiked ? "heart" : "heart-outline"} 
              size={20} 
              color={post.isLiked ? "#EF4444" : COLORS.textMuted} 
            />
            <Text style={styles.postActionText}>{post.likes}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.postAction}>
            <Ionicons name="chatbubble-outline" size={20} color={COLORS.textMuted} />
            <Text style={styles.postActionText}>{post.comments}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.postAction}>
            <Ionicons name="share-outline" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
          
          {post.type === 'crisis' && (
            <TouchableOpacity style={styles.helpButton}>
              <Text style={styles.helpButtonText}>Send Love</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Community</Text>
              <Text style={styles.subtitle}>
                {stats?.daysClean || 0} days strong • Never alone
              </Text>
            </View>
          </View>
          
          {/* Tab Navigation */}
          <View style={styles.tabWrapper}>
            <View style={styles.tabContainer}>
              {[
                { id: 'feed', label: 'Feed', icon: 'home' },
                { id: 'buddies', label: 'Buddies', icon: 'people' }
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                  onPress={() => setActiveTab(tab.id as any)}
                >
                  <Ionicons 
                    name={tab.icon as any} 
                    size={18} 
                    color={activeTab === tab.id ? '#10B981' : COLORS.textMuted} 
                  />
                  <Text style={[
                    styles.tabText,
                    activeTab === tab.id && styles.activeTabText
                  ]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Content */}
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: slideAnim,
                transform: [{ 
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })
                }]
              }
            ]}
          >
            {activeTab === 'feed' && (
              <FlatList
                data={communityPosts}
                renderItem={({ item }) => renderPost(item)}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => {
                      setRefreshing(true);
                      setTimeout(() => setRefreshing(false), 2000);
                    }}
                    tintColor="#10B981"
                  />
                }
              />
            )}
            
            {activeTab === 'buddies' && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.buddySection}>
                  {/* Find New Buddies Button */}
                  <TouchableOpacity 
                    style={styles.findBuddyButton}
                    onPress={() => navigation.navigate('BuddyMatching' as never)}
                  >
                    <LinearGradient
                      colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.05)']}
                      style={styles.findBuddyGradient}
                    >
                      <Ionicons name="sparkles" size={20} color="#8B5CF6" />
                      <Text style={styles.findBuddyText}>Find New Buddies</Text>
                      <Ionicons name="arrow-forward" size={20} color="#8B5CF6" />
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  {/* Connected Buddies */}
                  {buddyMatches.filter(b => b.connectionStatus === 'connected').length > 0 && (
                    <>
                      <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Your Buddies</Text>
                        <Text style={styles.sectionCount}>
                          {buddyMatches.filter(b => b.connectionStatus === 'connected').length}
                        </Text>
                      </View>
                      {buddyMatches
                        .filter(b => b.connectionStatus === 'connected')
                        .map((buddy) => (
                          <React.Fragment key={buddy.id}>
                            {renderBuddyCard(buddy)}
                          </React.Fragment>
                        ))}
                    </>
                  )}
                  
                  {/* Pending Requests */}
                  {buddyMatches.filter(b => b.connectionStatus === 'pending-received').length > 0 && (
                    <>
                      <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Buddy Requests</Text>
                        <View style={styles.requestBadge}>
                          <Text style={styles.requestBadgeText}>
                            {buddyMatches.filter(b => b.connectionStatus === 'pending-received').length}
                          </Text>
                        </View>
                      </View>
                      {buddyMatches
                        .filter(b => b.connectionStatus === 'pending-received')
                        .map((buddy) => (
                          <React.Fragment key={buddy.id}>
                            {renderBuddyCard(buddy)}
                          </React.Fragment>
                        ))}
                    </>
                  )}
                  
                  {/* Suggested Matches */}
                  {buddyMatches.filter(b => b.connectionStatus === 'not-connected').length > 0 && (
                    <>
                      <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Suggested Matches</Text>
                      </View>
                      <Text style={styles.sectionDescription}>
                        AI-matched buddies based on your quit date, product, and personality
                      </Text>
                      {buddyMatches
                        .filter(b => b.connectionStatus === 'not-connected')
                        .map((buddy) => (
                          <React.Fragment key={buddy.id}>
                            {renderBuddyCard(buddy)}
                          </React.Fragment>
                        ))}
                    </>
                  )}
                </View>
              </ScrollView>
            )}
          </Animated.View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  tabWrapper: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeTab: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  activeTabText: {
    color: '#10B981',
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  
  // Post Styles
  postCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  postGradient: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  crisisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(236, 72, 153, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.2)',
  },
  crisisLabel: {
    color: '#EC4899',
    fontSize: 12,
    fontWeight: '700',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  postAvatar: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  postAuthorInfo: {
    flex: 1,
  },
  postAuthor: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  postMeta: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  milestoneIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postContent: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  postTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tag: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xl,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postActionText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  helpButton: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(236, 72, 153, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.2)',
  },
  helpButtonText: {
    color: '#EC4899',
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Buddy Styles
  buddySection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  buddyCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  buddyCardGradient: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 16,
  },
  buddyHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  buddyAvatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  buddyAvatar: {
    fontSize: 40,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#000000',
  },
  buddyInfo: {
    flex: 1,
  },
  buddyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  buddyName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  buddyStats: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  buddyBio: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  buddySupportStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  supportStyleText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  buddyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  connectButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  connectButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  messageButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: SPACING.sm,
  },
  messageButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  messageButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  connectedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  pendingText: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: SPACING.sm,
  },
  acceptButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  declineButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(107, 114, 128, 0.2)',
  },
  findBuddyButton: {
    marginBottom: SPACING.xl,
    borderRadius: 16,
    overflow: 'hidden',
  },
  findBuddyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
  },
  findBuddyText: {
    color: '#8B5CF6',
    fontWeight: '600',
    fontSize: 16,
    flex: 1,
    marginLeft: 12,
  },
  sectionCount: {
    fontSize: 14,
    color: COLORS.textMuted,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  requestBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  requestBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default CommunityScreen; 