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
}

interface LiveRoom {
  id: string;
  name: string;
  topic: string;
  activeUsers: number;
  moderator?: string;
  isLive: boolean;
  startTime?: Date;
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
  const user = useSelector((state: RootState) => state.auth.user);
  const stats = useSelector((state: RootState) => state.progress.stats);
  
  const [activeTab, setActiveTab] = useState<'feed' | 'buddies' | 'rooms' | 'crisis'>('feed');
  const [showBuddyModal, setShowBuddyModal] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  
  // Mock data - would come from API
  const [buddyMatches] = useState<Buddy[]>([
    {
      id: '1',
      name: 'Sarah M.',
      avatar: '👩‍🦰',
      daysClean: 12,
      product: 'vaping',
      timezone: 'PST',
      lastActive: new Date(),
      matchScore: 95,
      status: 'online',
      bio: 'Mom of 2, quit vaping for my kids. Love hiking and coffee chats!',
      supportStyle: 'motivator'
    },
    {
      id: '2',
      name: 'Mike R.',
      avatar: '🧔',
      daysClean: 8,
      product: 'pouches',
      timezone: 'EST',
      lastActive: new Date(Date.now() - 3600000),
      matchScore: 88,
      status: 'offline',
      bio: 'Software dev, using coding to distract from cravings',
      supportStyle: 'analytical'
    }
  ]);
  
  const [liveRooms] = useState<LiveRoom[]>([
    {
      id: '1',
      name: 'Morning Check-in',
      topic: 'Start your day nicotine-free',
      activeUsers: 23,
      moderator: 'Coach Emma',
      isLive: true,
      startTime: new Date()
    },
    {
      id: '2',
      name: 'Craving Support Room',
      topic: '24/7 support when cravings hit hard',
      activeUsers: 45,
      isLive: true
    },
    {
      id: '3',
      name: 'Success Stories',
      topic: 'Weekly celebration - 7pm EST',
      activeUsers: 0,
      isLive: false,
      startTime: new Date(Date.now() + 86400000)
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
  
  // Start float animation for Help button
  useEffect(() => {
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -5,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );
    float.start();
    
    return () => float.stop();
  }, [floatAnim]);
  
  // Slide in animation
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 1,
      tension: 20,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [activeTab, slideAnim]);
  
  const handleCrisisPress = () => {
    setShowCrisisModal(true);
  };
  
  const sendCrisisMessage = (message: string) => {
    // Would send to real-time support system
    Alert.alert(
      'Help is on the way! 🤝',
      'Your message has been sent to the community. Someone will reach out within minutes. Stay strong!',
      [{ text: 'OK', onPress: () => setShowCrisisModal(false) }]
    );
  };
  
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
    <TouchableOpacity style={styles.buddyCard} activeOpacity={0.9}>
      <LinearGradient
        colors={['rgba(16, 185, 129, 0.1)', 'rgba(6, 182, 212, 0.05)']}
        style={styles.buddyCardGradient}
      >
        <View style={styles.buddyHeader}>
          <View style={styles.buddyAvatarContainer}>
            <Text style={styles.buddyAvatar}>{buddy.avatar}</Text>
            <View style={[
              styles.statusDot,
              { backgroundColor: buddy.status === 'online' ? '#10B981' : '#6B7280' }
            ]} />
          </View>
          
          <View style={styles.buddyInfo}>
            <View style={styles.buddyNameRow}>
              <Text style={styles.buddyName}>{buddy.name}</Text>
              <View style={styles.matchBadge}>
                <Text style={styles.matchScore}>{buddy.matchScore}% match</Text>
              </View>
            </View>
            
            <Text style={styles.buddyStats}>
              Day {buddy.daysClean} • Quit {buddy.product} • {buddy.timezone}
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
          <TouchableOpacity style={styles.connectButton}>
            <LinearGradient
              colors={['#10B981', '#06B6D4']}
              style={styles.connectButtonGradient}
            >
              <Ionicons name="people" size={16} color="#FFFFFF" />
              <Text style={styles.connectButtonText}>Connect as Buddies</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.messageButton}>
            <Ionicons name="chatbubble-outline" size={16} color="#10B981" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
  
  const renderLiveRoom = (room: LiveRoom) => (
    <TouchableOpacity 
      style={[styles.liveRoomCard, !room.isLive && styles.upcomingRoom]}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={room.isLive ? 
          ['rgba(239, 68, 68, 0.1)', 'rgba(245, 158, 11, 0.05)'] :
          ['rgba(107, 114, 128, 0.1)', 'rgba(107, 114, 128, 0.05)']
        }
        style={styles.liveRoomGradient}
      >
        {room.isLive && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
        
        <Text style={styles.roomName}>{room.name}</Text>
        <Text style={styles.roomTopic}>{room.topic}</Text>
        
        <View style={styles.roomFooter}>
          <View style={styles.roomStats}>
            <Ionicons name="people" size={14} color={COLORS.textMuted} />
            <Text style={styles.activeUsers}>
              {room.isLive ? `${room.activeUsers} active` : 'Starts soon'}
            </Text>
          </View>
          
          {room.moderator && (
            <Text style={styles.moderator}>Host: {room.moderator}</Text>
          )}
        </View>
        
        {room.isLive && (
          <TouchableOpacity style={styles.joinRoomButton}>
            <Text style={styles.joinRoomText}>Join Room</Text>
            <Ionicons name="arrow-forward" size={16} color="#EF4444" />
          </TouchableOpacity>
        )}
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
            
            {/* Help Now Button */}
            <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
              <TouchableOpacity 
                style={styles.helpNowButton}
                onPress={handleCrisisPress}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.helpNowButtonGradient}
                >
                  <Ionicons name="heart" size={18} color="#FFFFFF" />
                  <Text style={styles.helpNowButtonText}>Get Support</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
          
          {/* Tab Navigation */}
          <View style={styles.tabWrapper}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.tabContainer}
              contentContainerStyle={styles.tabContent}
            >
              {[
                { id: 'feed', label: 'Feed', icon: 'home' },
                { id: 'buddies', label: 'Buddies', icon: 'people' },
                { id: 'rooms', label: 'Live', icon: 'radio' },
                { id: 'crisis', label: 'Support', icon: 'heart' }
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
                  {tab.id === 'rooms' && (
                    <View style={styles.liveBadge}>
                      <Text style={styles.liveBadgeText}>2</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
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
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Your Buddy Matches</Text>
                    <TouchableOpacity onPress={() => setShowBuddyModal(true)}>
                      <Text style={styles.seeAll}>Find More</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.sectionDescription}>
                    AI-matched buddies based on your quit date, product, and personality
                  </Text>
                  
                  {buddyMatches.map((buddy) => renderBuddyCard(buddy))}
                  
                  <TouchableOpacity style={styles.findBuddyButton}>
                    <LinearGradient
                      colors={['rgba(16, 185, 129, 0.1)', 'rgba(6, 182, 212, 0.05)']}
                      style={styles.findBuddyGradient}
                    >
                      <Ionicons name="search" size={20} color="#10B981" />
                      <Text style={styles.findBuddyText}>Find Your Perfect Buddy</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
            
            {activeTab === 'rooms' && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.roomsSection}>
                  <Text style={styles.sectionTitle}>Live Support Rooms</Text>
                  <Text style={styles.sectionDescription}>
                    Join real-time conversations with others on the same journey
                  </Text>
                  
                  {liveRooms.map((room) => renderLiveRoom(room))}
                  
                  <TouchableOpacity style={styles.scheduleButton}>
                    <Ionicons name="calendar-outline" size={20} color="#10B981" />
                    <Text style={styles.scheduleButtonText}>View Full Schedule</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
            
            {activeTab === 'crisis' && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.crisisSection}>
                  <View style={styles.crisisCard}>
                    <LinearGradient
                      colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.05)']}
                      style={styles.crisisGradient}
                    >
                      <View style={styles.crisisIconContainer}>
                        <LinearGradient
                          colors={['#8B5CF6', '#EC4899']}
                          style={styles.crisisIconGradient}
                        >
                          <Ionicons name="heart" size={24} color="#FFFFFF" />
                        </LinearGradient>
                      </View>
                      <Text style={styles.crisisTitle}>We're Here For You</Text>
                      <Text style={styles.crisisDescription}>
                        Having a tough moment? Connect with people who understand and care
                      </Text>
                      
                      <TouchableOpacity 
                        style={styles.crisisButton}
                        onPress={handleCrisisPress}
                      >
                        <LinearGradient
                          colors={['#8B5CF6', '#EC4899']}
                          style={styles.crisisButtonGradient}
                        >
                          <Text style={styles.crisisButtonText}>Reach Out Now</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </LinearGradient>
                  </View>
                  
                  <View style={styles.resourcesSection}>
                    <Text style={styles.resourcesTitle}>Quick Resources</Text>
                    
                    {[
                      { icon: 'call', label: 'Quitline: 1-800-QUIT-NOW', color: '#10B981' },
                      { icon: 'chatbubbles', label: 'Live Chat Support', color: '#3B82F6' },
                      { icon: 'book', label: 'Coping Strategies', color: '#8B5CF6' },
                      { icon: 'fitness', label: 'Breathing Exercises', color: '#F59E0B' }
                    ].map((resource, index) => (
                      <TouchableOpacity key={index} style={styles.resourceCard}>
                        <View style={[styles.resourceIcon, { backgroundColor: resource.color + '20' }]}>
                          <Ionicons name={resource.icon as any} size={20} color={resource.color} />
                        </View>
                        <Text style={styles.resourceLabel}>{resource.label}</Text>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>
            )}
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
      
      {/* Crisis Support Modal */}
      <Modal
        visible={showCrisisModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCrisisModal(false)}
      >
        <BlurView intensity={100} style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.crisisModal}>
              <LinearGradient
                colors={['#1F2937', '#111827']}
                style={styles.crisisModalGradient}
              >
                <View style={styles.crisisModalHeader}>
                  <Text style={styles.crisisModalTitle}>Get Immediate Help</Text>
                  <TouchableOpacity onPress={() => setShowCrisisModal(false)}>
                    <Ionicons name="close" size={24} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.crisisModalDescription}>
                  Your message will be sent to online buddies and the support team
                </Text>
                
                <TextInput
                  style={styles.crisisInput}
                  placeholder="What's happening right now?"
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  numberOfLines={4}
                  autoFocus
                />
                
                <View style={styles.quickOptions}>
                  <Text style={styles.quickOptionsTitle}>Quick options:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {[
                      'Having strong cravings',
                      'At a trigger location',
                      'Feeling overwhelmed',
                      'Need someone to talk to'
                    ].map((option, index) => (
                      <TouchableOpacity key={index} style={styles.quickOption}>
                        <Text style={styles.quickOptionText}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                <TouchableOpacity 
                  style={styles.sendHelpButton}
                  onPress={() => sendCrisisMessage('test')}
                >
                  <LinearGradient
                    colors={['#8B5CF6', '#EC4899']}
                    style={styles.sendHelpGradient}
                  >
                    <Ionicons name="paper-plane" size={20} color="#FFFFFF" />
                    <Text style={styles.sendHelpText}>Send Message</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </KeyboardAvoidingView>
        </BlurView>
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
  helpNowButton: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  helpNowButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 24,
    gap: 8,
  },
  helpNowButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  tabWrapper: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  tabContainer: {
    flexGrow: 0,
  },
  tabContent: {
    gap: SPACING.xs,
    paddingRight: SPACING.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
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
  liveBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 2,
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
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
  seeAll: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
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
    gap: SPACING.sm,
    marginBottom: 4,
  },
  buddyName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  matchBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  matchScore: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '700',
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
    gap: SPACING.sm,
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
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  findBuddyButton: {
    marginTop: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  findBuddyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 16,
  },
  findBuddyText: {
    color: '#10B981',
    fontWeight: '600',
    fontSize: 16,
  },
  
  // Live Room Styles
  roomsSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  liveRoomCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  upcomingRoom: {
    opacity: 0.7,
  },
  liveRoomGradient: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  roomName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  roomTopic: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  roomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeUsers: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  moderator: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  joinRoomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.md,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  joinRoomText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 14,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: SPACING.lg,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  scheduleButtonText: {
    color: '#10B981',
    fontWeight: '600',
    fontSize: 14,
  },
  
  // Crisis Section Styles
  crisisSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  crisisCard: {
    marginBottom: SPACING.xl,
    borderRadius: 20,
    overflow: 'hidden',
  },
  crisisGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 20,
  },
  crisisIconContainer: {
    marginBottom: SPACING.md,
    borderRadius: 20,
    overflow: 'hidden',
  },
  crisisIconGradient: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crisisTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  crisisDescription: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  crisisButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  crisisButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  crisisButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  resourcesSection: {
    marginTop: SPACING.xl,
  },
  resourcesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: SPACING.md,
    borderRadius: 14,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  resourceLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  
  // Crisis Support Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  crisisModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  crisisModalGradient: {
    padding: SPACING.xl,
    paddingBottom: SPACING['3xl'],
  },
  crisisModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  crisisModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  crisisModalDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  crisisInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: SPACING.lg,
  },
  quickOptions: {
    marginBottom: SPACING.xl,
  },
  quickOptionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  quickOption: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  quickOptionText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
  sendHelpButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  sendHelpGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  sendHelpText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default CommunityScreen; 