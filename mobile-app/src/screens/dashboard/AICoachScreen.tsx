import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard,
  Dimensions,
  FlatList,
  Alert,
  ActivityIndicator,
  InteractionManager
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import { RootState, store } from '../../store/store';
import aiCoachService from '../../services/aiCoachService';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import Markdown from 'react-native-markdown-display';

const { width: screenWidth } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  readAt?: Date;
}

// Main component without navigation hooks
export class RecoveryCoachContent extends React.Component<any, any> {
  flatListRef = React.createRef<FlatList>();
  inputRef = React.createRef<TextInput>();
  
  // Animation values
  typingDotsAnimation: Animated.Value;
  inputFocusAnimation: Animated.Value;
  presenceAnimation: Animated.Value;
  contentFadeAnimation: Animated.Value;
  keyboardListeners: any[] = [];
  
  // Quick suggestions for new users - now with rotating sets
  quickSuggestionSets = [
    // Set 1 - Current moment focus
    [
      { title: "Having a craving right now", subtitle: "Help me through this moment" },
      { title: "Feeling really good today", subtitle: "Want to share my win" },
      { title: "Need some motivation", subtitle: "Remind me why I'm doing this" },
      { title: "What helps with stress?", subtitle: "Looking for coping strategies" }
    ],
    // Set 2 - Practical questions
    [
      { title: "Best distraction techniques?", subtitle: "Need something that works" },
      { title: "How to handle social situations", subtitle: "When others are using" },
      { title: "Sleep has been rough", subtitle: "Any tips for better rest?" },
      { title: "Dealing with irritability", subtitle: "Everything's annoying me" }
    ],
    // Set 3 - Emotional support
    [
      { title: "Feeling lonely in this", subtitle: "Need some encouragement" },
      { title: "Is what I'm feeling normal?", subtitle: "Having weird symptoms" },
      { title: "Proud of my progress", subtitle: "Want to celebrate" },
      { title: "Worried about relapsing", subtitle: "How do I stay strong?" }
    ],
    // Set 4 - Progress & reflection
    [
      { title: "What changes should I notice?", subtitle: "Curious about benefits" },
      { title: "Having a tough day", subtitle: "This is harder than expected" },
      { title: "Energy levels are different", subtitle: "Is this normal?" },
      { title: "Tell me something inspiring", subtitle: "Need a boost" }
    ],
    // Set 5 - Specific challenges
    [
      { title: "Morning cravings hit different", subtitle: "How to start the day right" },
      { title: "Weekends are challenging", subtitle: "Different routine throws me off" },
      { title: "Anger is becoming an issue", subtitle: "Getting frustrated easily" },
      { title: "Food tastes different now", subtitle: "Is this a good sign?" }
    ],
    // Set 6 - Support & community
    [
      { title: "Should I tell people?", subtitle: "About my quit journey" },
      { title: "Miss my old routine", subtitle: "Feeling nostalgic" },
      { title: "Small victory to share", subtitle: "Something good happened" },
      { title: "How long until it gets easier?", subtitle: "Need hope" }
    ],
    // Set 7 - Physical & mental
    [
      { title: "Brain fog is real", subtitle: "Can't focus on anything" },
      { title: "Unexpected benefits?", subtitle: "What surprised you?" },
      { title: "Breathing feels different", subtitle: "In a good way" },
      { title: "Mood swings are intense", subtitle: "How to manage them?" }
    ]
  ];

  // Track which set to show
  currentSuggestionSet = 0;

  // Session limits to prevent database bloat
  SESSION_MESSAGE_LIMIT = 100;
  SESSION_WARNING_THRESHOLD = 80;
  
  constructor(props: any) {
    super(props);
    // Initialize animations
    this.typingDotsAnimation = new Animated.Value(0);
    this.inputFocusAnimation = new Animated.Value(0);
    this.presenceAnimation = new Animated.Value(1);
    this.contentFadeAnimation = new Animated.Value(0);
  }

  state = {
    messages: [] as Message[],
    inputText: '',
    isTyping: false,
    currentSession: null as any,
    user: null as any,
    isLoading: true,
    coachStatus: 'online' as 'online' | 'reading' | 'typing',
    lastScrollPosition: 0,
    messageCount: 0,
    hasLoadedHistory: false,
    quickSuggestions: this.quickSuggestionSets[0],
    keyboardHeight: 0
  };

  componentDidMount() {
    // Delay initialization until after navigation transition
    InteractionManager.runAfterInteractions(() => {
      // Get user from Redux store
      const state = store.getState() as RootState;
      this.setState({ user: state.auth.user }, () => {
        this.initializeSession();
      });
      
      // Load the current suggestion set index and initialize suggestions
      this.loadSuggestionSetIndex().then(() => {
        this.setState({ 
          quickSuggestions: this.quickSuggestionSets[this.currentSuggestionSet] 
        });
      });
      
      // Start presence animation
      this.startPresenceAnimation();

      // Pre-configure keyboard animation to prevent jumps
      this.setupKeyboardListeners();
      
      // Delay initial focus to prevent awkward keyboard opening
      this.initialFocusTimer = setTimeout(() => {
        // Only focus if user hasn't started interacting
        if (this.state.messages.length <= 1 && !this.state.inputText) {
          // Optional: Auto-focus input on mount (remove if you don't want this)
          // this.inputRef.current?.focus();
        }
      }, 500);
    });
  }

  componentWillUnmount() {
    this.keyboardListeners.forEach(listener => listener.remove());
    this.stopTypingAnimation();
    if (this.initialFocusTimer) {
      clearTimeout(this.initialFocusTimer);
    }
  }

  initialFocusTimer: any = null;

  setupKeyboardListeners = () => {
    // Keyboard listeners with better scroll handling
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        this.setState({ keyboardHeight: e.endCoordinates.height });
        
        // Smooth animation for input focus
        Animated.timing(this.inputFocusAnimation, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }).start();
        
        // Scroll to bottom when keyboard opens
        setTimeout(() => {
          this.flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        this.setState({ keyboardHeight: 0 });
        
        Animated.timing(this.inputFocusAnimation, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );

    this.keyboardListeners = [keyboardWillShowListener, keyboardWillHideListener];
  };

  initializeSession = async () => {
    try {
      // Try to get user from state first (set in componentDidMount)
      let user = this.state.user;
      let userId = user?.id || user?.user?.id;
      
      // If no user in state, try to get from Supabase
      if (!userId) {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        if (!supabaseUser) {
          console.error('No user found');
          this.setState({ isLoading: false, hasLoadedHistory: true });
          return;
        }
        user = supabaseUser;
        userId = supabaseUser.id;
        this.setState({ user });
      }

      // Clean up old sessions
      await this.cleanupAbandonedSessions(userId);

      // Get or create session
      let currentSession = await aiCoachService.getCurrentSession(userId);
      
      if (!currentSession) {
        currentSession = await aiCoachService.startSession(userId);
      }

      if (currentSession) {
        // Load recent messages
        const recentMessages = await aiCoachService.getRecentMessages(currentSession.id, 50);
        const messageCount = await aiCoachService.getSessionMessageCount(currentSession.id);
        
        // Load suggestion set
        await this.loadSuggestionSetIndex();
        
        // Format messages with proper timestamps
        const messages = recentMessages.length > 0 
          ? recentMessages.map(msg => ({
              id: msg.id,
              text: msg.message_text,
              isUser: msg.is_user_message,
              timestamp: new Date(msg.created_at)
            }))
          : [];
        
        this.setState({ 
          currentSession,
          messages,
          messageCount,
          isLoading: false,
          hasLoadedHistory: true,
          quickSuggestions: this.quickSuggestionSets[this.currentSuggestionSet]
        });

        // Start animations
        this.startPresenceAnimation();
        
        // Fade in content
        Animated.timing(this.contentFadeAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();

        // If we have messages, scroll to end after a brief delay
        if (messages.length > 0) {
          setTimeout(() => {
            this.flatListRef.current?.scrollToEnd({ animated: false });
          }, 100);
        }
      }
    } catch (error) {
      console.error('Error initializing session:', error);
      this.setState({ isLoading: false, hasLoadedHistory: true });
    }
  };

  cleanupAbandonedSessions = async (userId: string) => {
    try {
      // Close any sessions older than 7 days that weren't properly ended
      await aiCoachService.cleanupOldSessions(userId, 7);
    } catch (error) {
      console.error('Error cleaning up old sessions:', error);
      // Non-critical error, continue
    }
  };

  sendMessage = async () => {
    const { inputText, isTyping, currentSession, user, messages } = this.state;
    
    if (!inputText.trim() || isTyping || !currentSession) return;
    
    // Blur input to prevent keyboard issues
    this.inputRef.current?.blur();
    
    // Check if we're approaching message limit
    if (messages.length >= this.SESSION_WARNING_THRESHOLD && messages.length < this.SESSION_MESSAGE_LIMIT) {
      if (messages.length === this.SESSION_WARNING_THRESHOLD) {
        // Show warning once at 80 messages
        setTimeout(() => {
          Alert.alert(
            'Long Conversation',
            `You've exchanged ${messages.length} messages in this chat. Consider starting a new conversation soon to keep things organized.`,
            [{ text: 'OK' }]
          );
        }, 2000);
      }
    }
    
    // Enforce message limit
    if (messages.length >= this.SESSION_MESSAGE_LIMIT) {
      Alert.alert(
        'Message Limit Reached',
        'This conversation has reached 100 messages. Please start a new chat to continue.',
        [
          {
            text: 'Start New Chat',
            onPress: this.startNewChat,
          },
          {
            text: 'Cancel',
            style: 'cancel',
          }
        ]
      );
      return;
    }
    
    const userMessageText = inputText.trim();
    this.setState({ inputText: '', isTyping: true });
    
    // Add user message
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      text: userMessageText,
      isUser: true,
      timestamp: new Date()
    };
    
    this.setState({ 
      messages: [...messages, tempUserMessage]
    });
    
    // Immediate scroll to bottom for user message
    setTimeout(() => {
      this.flatListRef.current?.scrollToEnd({ animated: true });
    }, 10);
    
    // Show "reading" status briefly
    setTimeout(() => {
      this.setState({ coachStatus: 'reading' });
      
      // Mark as read
      setTimeout(() => {
        this.setState((prevState: any) => ({
          messages: prevState.messages.map((msg: Message) =>
            msg.id === tempUserMessage.id
              ? { ...msg, readAt: new Date() }
              : msg
          ),
          coachStatus: 'typing'
        }));
        
        // Start typing animation
        this.startTypingAnimation();
      }, 600 + Math.random() * 400);
    }, 300);
    
    try {
      const startTime = Date.now();
      const userId = user?.id || user?.user?.id || 'anonymous';
      
      // Save user message
      const savedUserMessage = await aiCoachService.sendMessage(
        currentSession.id,
        userId,
        userMessageText,
        true
      );
      
      if (savedUserMessage) {
        this.setState({ 
          messages: this.state.messages.map(msg => 
            msg.id === tempUserMessage.id 
              ? { ...msg, id: savedUserMessage.id }
              : msg
          )
        });
      }
      
      // Get conversation history
      const conversationHistory = messages.map(msg => ({
        text: msg.text,
        isUser: msg.isUser
      }));
      
      // Generate AI response
      const aiResponse = await aiCoachService.generateAIResponse(
        userMessageText,
        userId,
        currentSession.id,
        conversationHistory
      );
      
      // Calculate realistic typing time (40 words per minute)
      const wordCount = aiResponse.split(' ').length;
      const typingTime = Math.max(1500, Math.min(wordCount * 150, 5000)); // 1.5-5 seconds
      
      // Wait for "typing" duration
      await new Promise(resolve => setTimeout(resolve, typingTime));
      
      const responseTime = Date.now() - startTime;
      
      // Save bot message
      const savedBotMessage = await aiCoachService.sendMessage(
        currentSession.id,
        userId,
        aiResponse,
        false,
        responseTime
      );
      
      // Stop typing animation
      this.stopTypingAnimation();
      
      // Add complete message
      const botMessage: Message = {
        id: savedBotMessage?.id || `bot-${Date.now()}`,
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };
      
      this.setState({ 
        messages: [...this.state.messages, botMessage],
        isTyping: false,
        coachStatus: 'online'
      });
      
      // Play haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Scroll to bottom for bot message
      setTimeout(() => {
        this.flatListRef.current?.scrollToEnd({ animated: true });
        
        // Ensure keyboard and UI are responsive after bot response
        if (Platform.OS === 'ios') {
          // Force a small UI update to prevent iOS lock-up
          InteractionManager.runAfterInteractions(() => {
            this.forceUpdate();
          });
        }
        
        // Re-focus input after a short delay to ensure UI is ready
        setTimeout(() => {
          this.inputRef.current?.focus();
        }, 100);
      }, 50);
      
    } catch (error) {
      console.error('Error sending message:', error);
      this.setState({ isTyping: false, coachStatus: 'online' });
      this.stopTypingAnimation();
      
      Alert.alert(
        'Connection Error',
        'Unable to send message. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  startPresenceAnimation = () => {
    // Subtle breathing animation for presence indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.presenceAnimation, {
          toValue: 0.4,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(this.presenceAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  startTypingAnimation = () => {
    // Three dots animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.typingDotsAnimation, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(this.typingDotsAnimation, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  stopTypingAnimation = () => {
    this.typingDotsAnimation.stopAnimation();
    this.typingDotsAnimation.setValue(0);
  };

  renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const markdownStyles = {
      body: {
        color: item.isUser ? '#FFFFFF' : COLORS.text,
        fontSize: 16,
        lineHeight: 22,
      },
      strong: {
        fontWeight: '600',
      },
      em: {
        fontStyle: 'italic',
      },
      bullet_list: {
        marginVertical: 4,
      },
      ordered_list: {
        marginVertical: 4,
      },
      list_item: {
        marginVertical: 2,
        flexDirection: 'row',
      },
      paragraph: {
        marginTop: 0,
        marginBottom: 4,
      },
      code_inline: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 14,
      },
    };

    return (
      <View 
        style={[
          styles.messageRow,
          item.isUser && styles.userMessageRow,
          index === 0 && { marginTop: 0 },
        ]}
      >
        <View style={[
          styles.messageBubble,
          item.isUser ? styles.userBubble : styles.guideBubble
        ]}>
          <Markdown 
            style={markdownStyles}
            mergeStyle={true}
          >
            {item.text}
          </Markdown>
          <View style={styles.messageFooter}>
            <Text style={[
              styles.timestamp,
              item.isUser ? styles.userTimestamp : styles.guideTimestamp
            ]}>
              {item.timestamp instanceof Date 
                ? item.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })
                : ''}
            </Text>
            {item.isUser && item.readAt && (
              <View style={styles.readReceipt}>
                <Ionicons name="checkmark-done" size={14} color="rgba(255, 255, 255, 0.6)" />
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  renderTypingIndicator = () => {
    if (this.state.coachStatus !== 'typing') return null;
    
    return (
      <View style={styles.typingIndicatorContainer}>
        <View style={[styles.messageBubble, styles.guideBubble, styles.typingBubble]}>
          <View style={styles.typingDots}>
            {[0, 1, 2].map((index) => (
              <Animated.View 
                key={index} 
                style={[
                  styles.typingDot,
                  {
                    opacity: this.typingDotsAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1]
                    }),
                    transform: [{
                      translateY: this.typingDotsAnimation.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, -3, 0],
                        extrapolate: 'clamp'
                      })
                    }]
                  }
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    );
  };

  handleSuggestionPress = (suggestion: string) => {
    this.setState({ inputText: suggestion }, () => {
      setTimeout(() => this.sendMessage(), 50);
    });
  };

  // Add scroll position tracking
  scrollPosition = 0;
  contentHeight = 0;
  visibleHeight = 0;

  handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    this.scrollPosition = contentOffset.y;
    this.contentHeight = contentSize.height;
    this.visibleHeight = layoutMeasurement.height;
  };

  shouldAutoScroll = () => {
    // Auto-scroll if user is within 100 pixels of the bottom
    const distanceFromBottom = this.contentHeight - (this.scrollPosition + this.visibleHeight);
    return distanceFromBottom < 100;
  };

  showChatOptions = () => {
    Alert.alert(
      'Chat Options',
      'What would you like to do?',
      [
        {
          text: 'Start New Chat',
          onPress: this.confirmNewChat,
        },
        {
          text: 'View Chat History',
          onPress: () => {
            Alert.alert('Coming Soon', 'Chat history feature is in development!');
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  confirmNewChat = () => {
    Alert.alert(
      'Start New Chat?',
      'Your current conversation will be saved. You can always return to previous chats.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Start New',
          onPress: this.startNewChat,
          style: 'destructive',
        },
      ]
    );
  };

  loadSuggestionSetIndex = async () => {
    try {
      const savedIndex = await AsyncStorage.getItem('@suggestion_set_index');
      if (savedIndex !== null) {
        this.currentSuggestionSet = parseInt(savedIndex, 10) % this.quickSuggestionSets.length;
      }
    } catch (error) {
      console.log('Error loading suggestion set index:', error);
    }
  };

  saveSuggestionSetIndex = async (index: number) => {
    try {
      await AsyncStorage.setItem('@suggestion_set_index', index.toString());
    } catch (error) {
      console.log('Error saving suggestion set index:', error);
    }
  };

  getNextSuggestionSet = () => {
    // Rotate to next set
    this.currentSuggestionSet = (this.currentSuggestionSet + 1) % this.quickSuggestionSets.length;
    this.saveSuggestionSetIndex(this.currentSuggestionSet);
    return this.quickSuggestionSets[this.currentSuggestionSet];
  };

  startNewChat = async () => {
    const { currentSession, user } = this.state;
    const userId = user?.id || user?.user?.id;
    
    if (!userId) return;
    
    // End current session
    if (currentSession) {
      await aiCoachService.endSession(currentSession.id);
    }
    
    // Start new session
    const newSession = await aiCoachService.startSession(userId);
    
    if (newSession) {
      // Get next set of suggestions
      const newSuggestions = this.getNextSuggestionSet();
      
      // Reset to empty messages
      this.setState({
        currentSession: newSession,
        messages: [],  // Empty messages for new chat
        coachStatus: 'online',
        quickSuggestions: newSuggestions // Update the suggestions
      });
      
      // Show suggestions again
      setTimeout(() => {
        this.flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  };

  render() {
    const { navigation } = this.props;
    const { messages, inputText, isTyping, isLoading, coachStatus, hasLoadedHistory } = this.state;
    
    // Get status display
    const getStatusText = () => {
      switch (coachStatus) {
        case 'reading':
          return 'Read';
        case 'typing':
          return 'Typing...';
        default:
          return 'Active now';
      }
    };
    
    // Show loading screen while fetching history
    if (isLoading || !hasLoadedHistory) {
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
                  onPress={() => navigation && navigation.goBack()}
                >
                  <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                  <Text style={styles.headerTitle}>Recovery Coach</Text>
                  <View style={styles.statusContainer}>
                    <Animated.View 
                      style={[
                        styles.statusDot,
                        styles.statusDotOnline,
                        { opacity: this.presenceAnimation }
                      ]} 
                    />
                    <Text style={styles.statusText}>loading...</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.menuButton}
                  disabled
                >
                  <Ionicons name="ellipsis-horizontal" size={24} color="rgba(255, 255, 255, 0.3)" />
                </TouchableOpacity>
              </View>

              {/* Loading Content */}
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="rgba(192, 132, 252, 0.5)" />
                <Text style={styles.loadingText}>Loading your conversation...</Text>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </View>
      );
    }
    
    // Show quick suggestions only when there are no messages and no input text
    const showSuggestions = messages.length === 0 && !inputText;

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
                onPress={() => navigation && navigation.goBack()}
              >
                <Ionicons name="chevron-back" size={24} color={COLORS.text} />
              </TouchableOpacity>
              
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Recovery Coach</Text>
                <View style={styles.statusRow}>
                  <Animated.View style={[
                    styles.statusDot,
                    {
                      opacity: this.presenceAnimation,
                      backgroundColor: coachStatus === 'typing' 
                        ? 'rgba(192, 132, 252, 0.8)' 
                        : 'rgba(134, 239, 172, 0.8)'
                    }
                  ]} />
                  <Text style={styles.headerSubtitle}>
                    {getStatusText()}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.menuButton}
                onPress={this.showChatOptions}
              >
                <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <Animated.View style={[styles.messagesWrapper, { opacity: this.contentFadeAnimation }]}>
              <FlatList
                ref={this.flatListRef}
                data={messages}
                renderItem={this.renderMessage}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps="never"
                removeClippedSubviews={Platform.OS === 'android'}
                maintainVisibleContentPosition={{
                  minIndexForVisible: 0,
                  autoscrollToTopThreshold: 100,
                }}
                onContentSizeChange={() => {
                  // Only auto-scroll if user is near the bottom
                  if (this.shouldAutoScroll()) {
                    this.flatListRef.current?.scrollToEnd({ animated: false });
                  }
                }}
                onScroll={this.handleScroll}
                scrollEventThrottle={16}
                ListFooterComponent={this.renderTypingIndicator()}
              />
            </Animated.View>

            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={0}
              style={{ 
                backgroundColor: 'transparent',
              }}
            >
              {showSuggestions && (
                <View style={styles.suggestionsContainer}>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: SPACING.md }}
                    style={{ marginHorizontal: -SPACING.md }}
                  >
                    {this.state.quickSuggestions.map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.suggestionChip,
                          index === 0 && { marginLeft: 0 },
                          index === this.state.quickSuggestions.length - 1 && { marginRight: SPACING.md }
                        ]}
                        onPress={() => this.handleSuggestionPress(suggestion.title)}
                      >
                        <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                        <Text style={styles.suggestionSubtitle}>{suggestion.subtitle}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  {/* Right fade only - like ChatGPT */}
                  <LinearGradient
                    colors={['transparent', '#0F172A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.suggestionFadeRight}
                    pointerEvents="none"
                  />
                </View>
              )}
              
              <Animated.View style={[
                styles.inputContainer,
                {
                  transform: [{
                    translateY: this.inputFocusAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -2]
                    })
                  }]
                }
              ]}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    ref={this.inputRef}
                    style={styles.textInput}
                    placeholder="Ask anything"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={inputText}
                    onChangeText={(text) => this.setState({ inputText: text })}
                    onSubmitEditing={this.sendMessage}
                    returnKeyType="send"
                    multiline
                    maxHeight={100}
                    blurOnSubmit={false}
                    enablesReturnKeyAutomatically
                    autoCorrect={false}
                    autoCapitalize="sentences"
                    onFocus={() => {
                      // Ensure we're scrolled to bottom when focusing
                      setTimeout(() => {
                        this.flatListRef.current?.scrollToEnd({ animated: true });
                      }, 300);
                    }}
                  />
                  <TouchableOpacity 
                    style={[
                      styles.sendButton,
                      inputText.trim() && styles.sendButtonActive
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      this.sendMessage();
                    }}
                    disabled={!inputText.trim() || isTyping}
                  >
                    <Ionicons 
                      name="arrow-up" 
                      size={20}
                      color={inputText.trim() ? '#000000' : 'rgba(255, 255, 255, 0.4)'} 
                    />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }
}

// Wrapper component for navigation
const RecoveryCoachScreen = (props: any) => {
  return <RecoveryCoachContent {...props} />;
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
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(134, 239, 172, 0.8)',
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -8,
  },
  messagesWrapper: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    flexGrow: 1,
  },
  messageRow: {
    marginBottom: 8,
    marginTop: 2,
  },
  userMessageRow: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: screenWidth * 0.7,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  guideBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignSelf: 'flex-start',
  },
  userBubble: {
    backgroundColor: 'rgba(192, 132, 252, 0.85)',
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  guideText: {
    color: COLORS.text,
  },
  userText: {
    color: '#FFFFFF',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 10,
  },
  guideTimestamp: {
    color: COLORS.textMuted,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  readReceipt: {
    marginLeft: 8,
  },
  typingIndicatorContainer: {
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  typingBubble: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textSecondary,
  },
  inputContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: 'transparent',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingLeft: 16,
    paddingRight: 4,
    paddingVertical: 4,
    minHeight: 48,
    maxHeight: 120,
    // ChatGPT-style subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    maxHeight: 100,
    paddingVertical: 6,
    paddingRight: 8,
    lineHeight: 20,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginRight: 4,
    padding: 0,
  },
  sendButtonActive: {
    backgroundColor: 'rgba(192, 132, 252, 0.9)',
  },
  suggestionsContainer: {
    paddingBottom: 8,
    position: 'relative',
  },
  suggestionChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  suggestionTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '500',
  },
  suggestionSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },

  suggestionFadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 30,
    zIndex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.text,
    fontSize: 16,
    marginTop: SPACING.sm,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDotOnline: {
    backgroundColor: 'rgba(134, 239, 172, 0.8)',
  },
  statusText: {
    color: COLORS.text,
    fontSize: 12,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  messagesContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 10,
    backgroundColor: '#000000',
  },
});

export default RecoveryCoachScreen; 