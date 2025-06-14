import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  PanResponder,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

import DicebearAvatar, {
  STARTER_AVATARS,
  PROGRESS_AVATARS,
  PREMIUM_AVATARS,
  getDaysUntilRotation,
} from '../../components/common/DicebearAvatar';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface AvatarCategory {
  id: string;
  title: string;
  subtitle: string;
  avatars: any[];
  icon: string;
}

const AvatarSelectionScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const plan = useSelector((state: RootState) => state.plan.plan);
  const [selectedAvatar, setSelectedAvatar] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('starter');
  const [loadingPurchase, setLoadingPurchase] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Calculate days clean
  const daysClean = plan?.quitDate
    ? Math.floor((Date.now() - new Date(plan.quitDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  useEffect(() => {
    // Load saved avatar
    loadSavedAvatar();
    
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadSavedAvatar = async () => {
    try {
      const savedAvatar = await AsyncStorage.getItem('selected_avatar');
      if (savedAvatar) {
        setSelectedAvatar(JSON.parse(savedAvatar));
      }
    } catch (error) {
      console.error('Error loading saved avatar:', error);
    }
  };

  const handleAvatarSelect = async (styleKey: string, styleName: string) => {
    const newAvatar = {
      type: 'dicebear',
      name: styleName,
      style: styleKey,
    };
    setSelectedAvatar(newAvatar);
    await AsyncStorage.setItem('selected_avatar', JSON.stringify(newAvatar));
    
    // Exit animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.goBack();
    });
  };

  const categories: AvatarCategory[] = [
    {
      id: 'starter',
      title: 'Start Your Journey',
      subtitle: 'Choose your companion',
      avatars: Object.entries(STARTER_AVATARS),
      icon: 'star-outline',
    },
    {
      id: 'progress',
      title: 'Progress Rewards',
      subtitle: 'Unlock by staying clean',
      avatars: Object.entries(PROGRESS_AVATARS),
      icon: 'trophy-outline',
    },
    {
      id: 'premium',
      title: 'Premium Collection',
      subtitle: `${getDaysUntilRotation()} days until refresh`,
      avatars: Object.entries(PREMIUM_AVATARS),
      icon: 'sparkles',
    },
  ];

  const renderAvatarCard = ([styleKey, config]: [string, any], categoryId: string) => {
    const isSelected = selectedAvatar?.style === styleKey;
    const isPurchased = user?.purchasedAvatars?.includes(styleKey) || false;
    const isLocked = categoryId === 'progress' && daysClean < config.unlockDays;
    const isPremium = categoryId === 'premium';

    return (
      <TouchableOpacity
        key={styleKey}
        style={[
          styles.avatarCard,
          isSelected && styles.avatarCardSelected,
          isLocked && styles.avatarCardLocked,
          isPremium && styles.avatarCardPremium,
        ]}
        onPress={() => {
          if (isLocked) return;
          if (isPremium && !isPurchased) {
            // Handle premium purchase
            console.log('Premium purchase:', styleKey);
            return;
          }
          handleAvatarSelect(styleKey, config.name);
        }}
        disabled={isLocked}
        activeOpacity={0.8}
      >
        {isLocked && (
          <View style={styles.lockedOverlay}>
            <Ionicons name="lock-closed" size={32} color="rgba(255, 255, 255, 0.3)" />
            <Text style={styles.lockedText}>Day {config.unlockDays}</Text>
          </View>
        )}
        
        <View style={styles.avatarContainer}>
          <DicebearAvatar
            userId={user?.id || 'default-user'}
            size={120}
            daysClean={daysClean}
            style={styleKey as any}
            showFrame={!isLocked}
          />
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Ionicons name="checkmark-circle" size={24} color="rgba(255, 255, 255, 0.9)" />
            </View>
          )}
        </View>
        
        <Text style={[styles.avatarName, isLocked && styles.avatarNameLocked]}>
          {config.name}
        </Text>
        <Text style={[styles.avatarDescription, isLocked && styles.avatarDescriptionLocked]}>
          {config.description}
        </Text>
        
        {isPremium && !isPurchased && (
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>{config.price}</Text>
          </View>
        )}
        
        {isPremium && isPurchased && (
          <View style={styles.ownedTag}>
            <Text style={styles.ownedText}>Owned</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={28} color="rgba(255, 255, 255, 0.9)" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Choose Your Avatar</Text>
            <Text style={styles.headerSubtitle}>Express yourself</Text>
          </View>
        </View>
        
        {/* Category Tabs */}
        <View style={styles.categoryTabs}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                selectedCategory === category.id && styles.categoryTabActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons
                name={category.icon as any}
                size={20}
                color={selectedCategory === category.id ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.4)'}
              />
              <Text style={[
                styles.categoryTabText,
                selectedCategory === category.id && styles.categoryTabTextActive,
              ]}>
                {category.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Avatar Grid */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {categories.find(c => c.id === selectedCategory) && (
            <>
              <Text style={styles.categoryTitle}>
                {categories.find(c => c.id === selectedCategory)?.title}
              </Text>
              <Text style={styles.categorySubtitle}>
                {categories.find(c => c.id === selectedCategory)?.subtitle}
              </Text>
              
              <View style={styles.avatarGrid}>
                {categories
                  .find(c => c.id === selectedCategory)
                  ?.avatars.map(avatar => renderAvatarCard(avatar, selectedCategory))}
              </View>
            </>
          )}
          
          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>
      
      {loadingPurchase && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="rgba(255, 255, 255, 0.8)" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginRight: 44, // Balance the back button
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
  },
  categoryTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  categoryTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 8,
  },
  categoryTabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  categoryTabText: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  categoryTabTextActive: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  categoryTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  categorySubtitle: {
    fontSize: 16,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 24,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  avatarCard: {
    width: (screenWidth - 40 - 32) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 20,
    margin: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  avatarCardSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  avatarCardLocked: {
    opacity: 0.5,
  },
  avatarCardPremium: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    borderRadius: 20,
  },
  lockedText: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.3)',
    marginTop: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  selectedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarName: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    textAlign: 'center',
  },
  avatarNameLocked: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  avatarDescription: {
    fontSize: 12,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 16,
  },
  avatarDescriptionLocked: {
    color: 'rgba(255, 255, 255, 0.2)',
  },
  priceTag: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  ownedTag: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
  },
  ownedText: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 16,
  },
});

export default AvatarSelectionScreen; 