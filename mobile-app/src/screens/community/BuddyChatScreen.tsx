import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CommunityStackParamList } from '../../navigation/CommunityStackNavigator';
import { COLORS, SPACING } from '../../constants/theme';
import * as Haptics from 'expo-haptics';
import DicebearAvatar from '../../components/common/DicebearAvatar';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'buddy';
  timestamp: Date;
  type?: 'system' | 'check-in';
}

interface RouteParams {
  buddy: {
    id: string;
    name: string;
    daysClean: number;
    status: 'online' | 'offline';
  };
  onEndConnection?: () => void;
}

type NavigationProp = StackNavigationProp<CommunityStackParamList, 'BuddyChat'>;

const BuddyChatScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { buddy, onEndConnection } = (route.params as RouteParams) || {
    buddy: {
      id: '1',
      name: 'Sarah M.',
      daysClean: 12,
      status: 'online' as const,
    },
    onEndConnection: undefined
  };
  
  const [message, setMessage] = useState('');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey! So glad we matched. How are you doing today?',
      sender: 'buddy',
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: '2',
      text: "Hi Sarah! I'm doing okay, day 8 is tough but pushing through. How about you?",
      sender: 'me',
      timestamp: new Date(Date.now() - 3000000),
    },
    {
      id: '3',
      text: "I remember day 8! The cravings were intense. What's helping you cope?",
      sender: 'buddy',
      timestamp: new Date(Date.now() - 2400000),
    },
    {
      id: '4',
      text: "I've been going for walks when it gets bad. Also the breathing exercises in the app help!",
      sender: 'me',
      timestamp: new Date(Date.now() - 1800000),
    },
    {
      id: '5',
      text: "That's great! Walking saved me so many times. Keep it up! The first few weeks are the hardest but you're doing amazing.",
      sender: 'buddy',
      timestamp: new Date(Date.now() - 1200000),
    },
  ]);
  
  const flatListRef = useRef<FlatList>(null);
  
  // Scroll to bottom when component mounts or messages change
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, [messages]);
  
  const sendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message,
        sender: 'me',
        timestamp: new Date(),
      };
      
      setMessages([...messages, newMessage]);
      setMessage('');
      
      // Simulate buddy response
      setTimeout(() => {
        const responses = [
          "That's awesome! Keep it up! 💪",
          "I'm here if you need to talk more.",
          "You've got this! One day at a time.",
          "Thanks for sharing. How can I support you?",
        ];
        
        const buddyResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: responses[Math.floor(Math.random() * responses.length)],
          sender: 'buddy',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, buddyResponse]);
      }, 2000);
    }
  };
  
  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender === 'me';
    
    if (item.type === 'system') {
      return (
        <View style={styles.systemMessage}>
          <Text style={styles.systemMessageText}>{item.text}</Text>
        </View>
      );
    }
    
    return (
      <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
        {!isMe && (
          <View style={styles.messageAvatarContainer}>
            <DicebearAvatar
              userId={buddy.id}
              size={32}
              daysClean={buddy.daysClean}
              style="warrior"
              showFrame={false}
            />
          </View>
        )}
        <View style={[styles.messageBubble, isMe && styles.messageBubbleMe]}>
          <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
            {item.text}
          </Text>
          <Text style={[styles.messageTime, isMe && styles.messageTimeMe]}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };
  
  const quickResponses = [
    "How are you today? 👋",
    "Having a craving right now 😰",
    "Just wanted to check in ✅",
    "Thanks for the support! 🙏",
    "Feeling strong today! 💪",
    "Need some motivation 🎯",
  ];
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => {
              // Navigate to Community buddies tab instead of going back
              navigation.navigate('CommunityMain', {
                initialTab: 'buddies'
              } as any);
            }}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            
            <View style={styles.headerInfo}>
              <View style={styles.headerTitleRow}>
                <DicebearAvatar
                  userId={buddy.id}
                  size={40}
                  daysClean={buddy.daysClean}
                  style="warrior"
                />
                <View>
                  <Text style={styles.headerName}>{buddy.name}</Text>
                  <View style={styles.headerStatus}>
                    <Text style={styles.statusText}>
                      Day {buddy.daysClean}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            
            <TouchableOpacity onPress={() => setShowOptionsMenu(true)}>
              <Ionicons name="ellipsis-vertical" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
            }}
          />
        </SafeAreaView>
        
        {/* Quick Responses */}
        <View style={styles.quickResponsesWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.quickResponsesContainer}
            contentContainerStyle={styles.quickResponsesContent}
          >
            {quickResponses.map((text, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickResponse}
                onPress={() => {
                  setMessage(text);
                  // Just populate the message box, don't send
                }}
              >
                <Text style={styles.quickResponseText}>{text}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor={COLORS.textMuted}
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={500}
              />
              <TouchableOpacity 
                style={styles.sendButton}
                onPress={sendMessage}
                disabled={!message.trim()}
              >
                <View
                  style={[styles.sendButtonGradient, {
                    backgroundColor: message.trim() ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)'
                  }]}
                >
                  <Ionicons name="send" size={20} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
        
        {/* Options Menu Modal */}
        <Modal
          visible={showOptionsMenu}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowOptionsMenu(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1}
            onPress={() => setShowOptionsMenu(false)}
          >
            <View style={styles.optionsMenu}>
              <TouchableOpacity 
                style={styles.optionItem}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowOptionsMenu(false);
                  // Navigate to buddy profile - add connectionStatus since they're connected if chatting
                  navigation.navigate('BuddyProfile', { 
                    buddy: {
                      ...buddy,
                      connectionStatus: 'connected' // They must be connected if you're chatting
                    }
                  });
                }}
              >
                <Ionicons name="person-outline" size={20} color={COLORS.text} />
                <Text style={styles.optionText}>View Profile</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.optionItem}
                                      onPress={async () => {
                        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setShowOptionsMenu(false);
                        setReportReason(''); // Clear any previous selection
                        setShowReportModal(true);
                      }}
                    >
                      <Ionicons name="flag-outline" size={20} color="rgba(255, 255, 255, 0.5)" />
                      <Text style={styles.optionText}>Report Issue</Text>
                    </TouchableOpacity>
              
              <View style={styles.optionDivider} />
              
              <TouchableOpacity 
                style={styles.optionItem}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setShowOptionsMenu(false);
                  Alert.alert(
                    'End Buddy Connection?',
                    `Are you sure you want to disconnect from ${buddy.name}?\n\nThis will remove them from your buddy list. You can always match with new buddies later.`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'End Connection', 
                        style: 'destructive',
                        onPress: async () => {
                          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          // Call the end connection function if provided
                          if (onEndConnection) {
                            onEndConnection();
                          }
                          Alert.alert(
                            'Connection Ended',
                            'We hope you find the right buddy match for your journey. Stay strong! 💪',
                            [{ 
                              text: 'OK', 
                              onPress: () => navigation.navigate('CommunityMain', {
                                initialTab: 'buddies'
                              } as any)
                            }]
                          );
                        }
                      },
                    ]
                  );
                }}
              >
                <Ionicons name="close-circle-outline" size={20} color="rgba(255, 255, 255, 0.4)" />
                <Text style={styles.optionText}>End Buddy Connection</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
        
        {/* Report Issue Modal */}
        <Modal
          visible={showReportModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => {
            setShowReportModal(false);
            setReportReason('');
          }}
        >
          <View style={styles.reportModalOverlay}>
            <View style={styles.reportModalContent}>
              <LinearGradient
                colors={['#1F2937', '#111827']}
                style={styles.reportModalGradient}
              >
                {/* Header */}
                <View style={styles.reportModalHeader}>
                  <View style={styles.reportModalHeaderLeft}>
                    <View style={styles.reportIconContainer}>
                      <Ionicons name="flag" size={24} color="rgba(255, 255, 255, 0.5)" />
                    </View>
                    <View>
                      <Text style={styles.reportModalTitle}>Report Issue</Text>
                      <Text style={styles.reportModalSubtitle}>Help us keep the community safe</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => {
                      setShowReportModal(false);
                      setReportReason('');
                    }}
                  >
                    <Ionicons name="close" size={24} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
                
                {/* Report Reasons */}
                <View style={styles.reportReasonsSection}>
                  <Text style={styles.reportSectionTitle}>What&apos;s the issue?</Text>
                  {[
                    { id: 'inappropriate', label: 'Inappropriate behavior', icon: 'warning' },
                    { id: 'harassment', label: 'Harassment or bullying', icon: 'hand-left' },
                    { id: 'spam', label: 'Spam or scam', icon: 'mail' },
                    { id: 'fake', label: 'Fake profile', icon: 'alert-circle' },
                    { id: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
                  ].map((reason) => (
                    <TouchableOpacity
                      key={reason.id}
                      style={[
                        styles.reportReasonItem,
                        reportReason === reason.id && styles.reportReasonItemSelected
                      ]}
                      onPress={() => {
                        setReportReason(reason.id);
                      }}
                    >
                      <Ionicons 
                        name={reason.icon as keyof typeof Ionicons.glyphMap} 
                        size={20} 
                        color={reportReason === reason.id ? 'rgba(255, 255, 255, 0.7)' : COLORS.textMuted} 
                      />
                      <Text style={[
                        styles.reportReasonText,
                        reportReason === reason.id && styles.reportReasonTextSelected
                      ]}>
                        {reason.label}
                      </Text>
                      {reportReason === reason.id && (
                        <Ionicons name="checkmark-circle" size={20} color="rgba(255, 255, 255, 0.7)" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
                
                {/* Actions */}
                <View style={styles.reportModalActions}>
                  <TouchableOpacity 
                    style={styles.reportCancelButton}
                    onPress={() => {
                      setShowReportModal(false);
                      setReportReason('');
                    }}
                  >
                    <Text style={styles.reportCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.reportSubmitButton,
                      !reportReason && styles.reportSubmitButtonDisabled
                    ]}
                    disabled={!reportReason}
                    onPress={async () => {
                      if (!reportReason) return;
                      
                      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      
                      // Submit the report
                      // For now, we just show a success message
                      
                      setShowReportModal(false);
                      
                      // Show success alert
                      Alert.alert(
                        'Report Submitted',
                        'Thank you for helping keep our community safe.',
                        [{ text: 'OK' }]
                      );
                      
                      // Reset form
                      setReportReason('');
                    }}
                  >
                    <View
                      style={[styles.reportSubmitGradient, {
                        backgroundColor: reportReason ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)'
                      }]}
                    >
                      <Ionicons name="send" size={18} color="#FFFFFF" />
                      <Text style={styles.reportSubmitText}>Submit Report</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </View>
        </Modal>
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
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerAvatar: {
    fontSize: 32,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '300',
    color: COLORS.textMuted,
  },
  messagesList: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    fontSize: 24,
    marginBottom: 4,
  },
  messageAvatarContainer: {
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: '75%',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: SPACING.md,
    borderBottomLeftRadius: 4,
  },
  messageBubbleMe: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    fontWeight: '300',
    color: COLORS.text,
    lineHeight: 20,
  },
  messageTextMe: {
    color: COLORS.text,
  },
  messageTime: {
    fontSize: 11,
    fontWeight: '300',
    color: COLORS.textMuted,
    marginTop: 4,
  },
  messageTimeMe: {
    color: COLORS.textMuted,
  },
  systemMessage: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  systemMessageText: {
    fontSize: 12,
    fontWeight: '300',
    color: COLORS.textMuted,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quickResponsesWrapper: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  quickResponsesContainer: {
    height: 50,
  },
  quickResponsesContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  quickResponse: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginRight: SPACING.sm,
  },
  quickResponseText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '400',
  },
  inputContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '300',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: SPACING.lg,
  },
  optionsMenu: {
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
    borderRadius: 16,
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  optionText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '400',
  },
  optionDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: SPACING.xs,
  },
  
  // Report Modal Styles
  reportModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  reportModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  reportModalGradient: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  reportModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  reportModalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  reportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportModalTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  reportModalSubtitle: {
    fontSize: 14,
    fontWeight: '300',
    color: COLORS.textMuted,
  },
  reportReasonsSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  reportSectionTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  reportReasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: SPACING.sm,
  },
  reportReasonItemSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  reportReasonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '300',
    color: COLORS.text,
  },
  reportReasonTextSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '400',
  },
  reportModalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  reportCancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingVertical: SPACING.md,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  reportCancelText: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.text,
  },
  reportSubmitButton: {
    flex: 2,
    borderRadius: 24,
    overflow: 'hidden',
  },
  reportSubmitButtonDisabled: {
    opacity: 0.5,
  },
  reportSubmitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  reportSubmitText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
  },
});

export default BuddyChatScreen; 