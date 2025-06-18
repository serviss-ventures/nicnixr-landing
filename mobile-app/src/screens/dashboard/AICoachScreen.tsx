import React, { useState, useRef, useEffect } from 'react';
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
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  FlatList,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import { RootState, store } from '../../store/store';
import aiCoachService, { AICoachSession } from '../../services/aiCoachService';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Main component without navigation hooks
export class RecoveryCoachContent extends React.Component<any, any> {
  flatListRef = React.createRef<FlatList>();
  inputRef = React.createRef<TextInput>();
  
  // Animation values
  typingAnimation = new Animated.Value(0);
  messageAnimation = new Animated.Value(0);
  inputFocusAnimation = new Animated.Value(0);
  keyboardListeners: any[] = [];

  state = {
    user: null,
    currentSession: null as AICoachSession | null,
    messages: [
      {
        id: '1',
        text: "Hi there. I'm your Recovery Coach, here to support you 24/7. Whether you're feeling strong or struggling, I'm here to listen and help. What's on your mind today?",
        isUser: false,
        timestamp: new Date()
      }
    ] as Message[],
    inputText: '',
    isTyping: false,
    isLoading: true,
    keyboardHeight: 0,
  };

  // Quick suggestions for new users
  quickSuggestions = [
    "I'm having cravings",
    "Feeling proud today",
    "Need motivation",
    "Tell me about recovery"
  ];

  componentDidMount() {
    // Get user from Redux store
    const state = store.getState() as RootState;
    this.setState({ user: state.auth.user }, () => {
      this.initializeSession();
    });
    
    // Auto-focus input after a delay
    setTimeout(() => {
      this.inputRef.current?.focus();
    }, 500);

    // Keyboard listeners
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        this.setState({ keyboardHeight: e.endCoordinates.height });
        Animated.spring(this.inputFocusAnimation, {
          toValue: 1,
          useNativeDriver: false,
          tension: 80,
          friction: 10,
        }).start();
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        this.setState({ keyboardHeight: 0 });
        Animated.spring(this.inputFocusAnimation, {
          toValue: 0,
          useNativeDriver: false,
          tension: 80,
          friction: 10,
        }).start();
      }
    );

    this.keyboardListeners = [keyboardWillShowListener, keyboardWillHideListener];
  }

  componentWillUnmount() {
    this.keyboardListeners.forEach(listener => listener.remove());
  }

  initializeSession = async () => {
    const { user } = this.state;
    const userId = user?.id || user?.user?.id;
    
    if (!userId) {
      console.log('No user ID found, using anonymous session');
      this.setState({ isLoading: false });
      return;
    }
    
    this.setState({ isLoading: true });
    try {
      let session = await aiCoachService.getCurrentSession(userId);
      
      if (!session) {
        session = await aiCoachService.startSession(userId);
      }
      
      if (session) {
        this.setState({ currentSession: session });
        
        const existingMessages = await aiCoachService.getSessionMessages(session.id);
        if (existingMessages.length > 0) {
          const formattedMessages = existingMessages.map(msg => ({
            id: msg.id,
            text: msg.message_text,
            isUser: msg.is_user_message,
            timestamp: new Date(msg.created_at)
          }));
          this.setState({ 
            messages: [this.state.messages[0], ...formattedMessages] 
          });
        }
      }
    } catch (error) {
      console.error('Error initializing AI coach session:', error);
      const fallbackSession: AICoachSession = {
        id: 'temp-session-' + Date.now(),
        user_id: userId,
        started_at: new Date().toISOString(),
        intervention_triggered: false,
        topics_discussed: []
      };
      this.setState({ currentSession: fallbackSession });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  sendMessage = async () => {
    const { inputText, isTyping, currentSession, user, messages } = this.state;
    
    if (!inputText.trim() || isTyping || !currentSession) return;
    
    const userMessageText = inputText.trim();
    this.setState({ inputText: '', isTyping: true });
    
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      text: userMessageText,
      isUser: true,
      timestamp: new Date()
    };
    
    this.setState({ messages: [...messages, tempUserMessage] });
    
    setTimeout(() => {
      this.flatListRef.current?.scrollToEnd({ animated: true });
    }, 50);
    
    try {
      const startTime = Date.now();
      const userId = user?.id || user?.user?.id || 'anonymous';
      
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
      
      const conversationHistory = messages.map(msg => ({
        text: msg.text,
        isUser: msg.isUser
      }));
      
      const aiResponse = await aiCoachService.generateAIResponse(
        userMessageText,
        userId,
        currentSession.id,
        conversationHistory
      );
      const responseTime = Date.now() - startTime;
      
      const savedBotMessage = await aiCoachService.sendMessage(
        currentSession.id,
        userId,
        aiResponse,
        false,
        responseTime
      );
      
      const botMessage: Message = {
        id: savedBotMessage?.id || `bot-${Date.now()}`,
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };
      
      this.setState({ 
        messages: [...this.state.messages, botMessage],
        isTyping: false 
      });
      
      Animated.spring(this.messageAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8
      }).start();
      
      setTimeout(() => {
        this.flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
    } catch (error) {
      console.error('Error sending message:', error);
      this.setState({ isTyping: false });
      Alert.alert(
        'Connection Error',
        'Unable to send message. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  renderMessage = ({ item, index }: { item: Message; index: number }) => {
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
          <Text style={[
            styles.messageText,
            item.isUser ? styles.userText : styles.guideText
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.timestamp,
            item.isUser ? styles.userTimestamp : styles.guideTimestamp
          ]}>
            {item.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </View>
    );
  };

  render() {
    const { navigation } = this.props;
    const { messages, inputText, isTyping, keyboardHeight } = this.state;
    
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#000000', '#0A0F1C', '#111827']}
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
                  <Text style={styles.headerSubtitle}>Always here for you</Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.menuButton}>
                <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.messagesWrapper}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ flex: 1 }}>
                  <FlatList
                    ref={this.flatListRef}
                    data={messages}
                    renderItem={this.renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.messagesContent}
                    showsVerticalScrollIndicator={false}
                    keyboardDismissMode="interactive"
                    keyboardShouldPersistTaps="handled"
                    onContentSizeChange={() => {
                      this.flatListRef.current?.scrollToEnd({ animated: false });
                    }}
                    ListFooterComponent={isTyping ? (
                      <View style={styles.typingIndicatorContainer}>
                        <View style={[styles.messageBubble, styles.guideBubble, styles.typingBubble]}>
                          <View style={styles.typingDots}>
                            {[0, 1, 2].map((index) => (
                              <View key={index} style={styles.typingDot} />
                            ))}
                          </View>
                        </View>
                      </View>
                    ) : null}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>

            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={0}
            >
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    ref={this.inputRef}
                    style={styles.textInput}
                    placeholder="Message your Recovery Coach..."
                    placeholderTextColor={COLORS.textMuted}
                    value={inputText}
                    onChangeText={(text) => this.setState({ inputText: text })}
                    onSubmitEditing={this.sendMessage}
                    returnKeyType="send"
                    multiline
                    maxHeight={100}
                  />
                  <TouchableOpacity 
                    style={[
                      styles.sendButton,
                      { opacity: inputText.trim() ? 1 : 0.4 }
                    ]}
                    onPress={this.sendMessage}
                    disabled={!inputText.trim() || isTyping}
                  >
                    <Ionicons 
                      name="arrow-up-circle" 
                      size={32} 
                      color={inputText.trim() ? COLORS.primary : COLORS.textMuted} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
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
    paddingBottom: SPACING.xl,
  },
  messageRow: {
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  userMessageRow: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: screenWidth * 0.8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  guideBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  guideText: {
    color: COLORS.text,
  },
  userText: {
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  guideTimestamp: {
    color: COLORS.textMuted,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  typingIndicatorContainer: {
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  typingBubble: {
    paddingVertical: 16,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textMuted,
  },
  inputContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    paddingLeft: SPACING.md,
    paddingRight: 6,
    paddingVertical: 6,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    maxHeight: 100,
    paddingVertical: 8,
    lineHeight: 22,
  },
  sendButton: {
    marginLeft: 8,
    padding: 4,
  },
});

export default RecoveryCoachScreen; 