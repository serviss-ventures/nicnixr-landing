import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

interface CelebrationAnimationsProps {
  type: 'heart' | 'highFive' | 'cheer' | 'sparkle';
  trigger: boolean;
  onComplete?: () => void;
  sourcePosition?: { x: number; y: number };
}

interface AnimatedElement {
  id: string;
  animatedValue: Animated.Value;
  rotateValue: Animated.Value;
  scaleValue: Animated.Value;
  opacityValue: Animated.Value;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  icon: string;
  color: string;
  size: number;
}

const CelebrationAnimations: React.FC<CelebrationAnimationsProps> = ({
  type,
  trigger,
  onComplete,
  sourcePosition = { x: width / 2, y: height / 2 }
}) => {
  const [elements, setElements] = useState<AnimatedElement[]>([]);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const createAnimatedElement = (index: number): AnimatedElement => {
    const id = `${type}_${Date.now()}_${index}`;
    const animatedValue = new Animated.Value(0);
    const rotateValue = new Animated.Value(0);
    const scaleValue = new Animated.Value(0);
    const opacityValue = new Animated.Value(1);

    // Random spread pattern
    const angle = (Math.PI * 2 * index) / getElementCount() + (Math.random() - 0.5) * 0.5;
    const distance = 100 + Math.random() * 150;
    const startX = sourcePosition.x;
    const startY = sourcePosition.y;
    const endX = startX + Math.cos(angle) * distance;
    const endY = startY + Math.sin(angle) * distance - 50; // Slight upward bias

    const config = getElementConfig();
    
    return {
      id,
      animatedValue,
      rotateValue,
      scaleValue,
      opacityValue,
      startX,
      startY,
      endX: Math.max(20, Math.min(width - 20, endX)),
      endY: Math.max(50, Math.min(height - 100, endY)),
      icon: config.icon,
      color: config.color,
      size: config.size + Math.random() * 10
    };
  };

  const getElementCount = () => {
    switch (type) {
      case 'heart': return 8;
      case 'highFive': return 6;
      case 'cheer': return 10;
      case 'sparkle': return 12;
      default: return 8;
    }
  };

  const getElementConfig = () => {
    switch (type) {
      case 'heart':
        return {
          icon: 'heart',
          color: '#FF6B9D',
          size: 20
        };
      case 'highFive':
        return {
          icon: 'hand-left',
          color: '#10B981',
          size: 24
        };
      case 'cheer':
        return {
          icon: 'trophy',
          color: '#F59E0B',
          size: 22
        };
      case 'sparkle':
        return {
          icon: 'star',
          color: '#8B5CF6',
          size: 18
        };
      default:
        return {
          icon: 'heart',
          color: '#FF6B9D',
          size: 20
        };
    }
  };

  const startAnimation = () => {
    const newElements = Array.from({ length: getElementCount() }, (_, index) => 
      createAnimatedElement(index)
    );
    
    setElements(newElements);

    // Create staggered animations for each element
    const animations = newElements.map((element, index) => {
      return Animated.sequence([
        // Delay for staggered effect
        Animated.delay(index * 50),
        
        // Parallel animations for each element
        Animated.parallel([
          // Main movement animation
          Animated.timing(element.animatedValue, {
            toValue: 1,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
          
          // Scale animation (pop in, then shrink)
          Animated.sequence([
            Animated.timing(element.scaleValue, {
              toValue: 1.2,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(element.scaleValue, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.delay(1000),
            Animated.timing(element.scaleValue, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
          
          // Rotation animation
          Animated.timing(element.rotateValue, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: true,
          }),
          
          // Opacity fade out
          Animated.sequence([
            Animated.delay(1500),
            Animated.timing(element.opacityValue, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ])
      ]);
    });

    // Run all animations in parallel
    animationRef.current = Animated.parallel(animations);
    
    animationRef.current.start(() => {
      setElements([]);
      onComplete?.();
    });
  };

  useEffect(() => {
    if (trigger) {
      startAnimation();
    }
    
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [trigger]);

  const renderElement = (element: AnimatedElement) => {
    const translateX = element.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, element.endX - element.startX],
    });

    const translateY = element.animatedValue.interpolate({
      inputRange: [0, 0.3, 1],
      outputRange: [0, -30, element.endY - element.startY],
    });

    const rotate = element.rotateValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Animated.View
        key={element.id}
        style={[
          styles.animatedElement,
          {
            left: element.startX - element.size / 2,
            top: element.startY - element.size / 2,
            transform: [
              { translateX },
              { translateY },
              { rotate },
              { scale: element.scaleValue },
            ],
            opacity: element.opacityValue,
          },
        ]}
      >
        {type === 'highFive' ? (
          <View style={styles.highFiveContainer}>
            <Ionicons
              name={element.icon as any}
              size={element.size}
              color={element.color}
            />
            <Text style={[styles.highFiveText, { color: element.color }]}>
              ✋
            </Text>
          </View>
        ) : (
          <Ionicons
            name={element.icon as any}
            size={element.size}
            color={element.color}
          />
        )}
        
        {/* Glow effect */}
        <View
          style={[
            styles.glowEffect,
            {
              backgroundColor: element.color,
              width: element.size * 1.5,
              height: element.size * 1.5,
            },
          ]}
        />
      </Animated.View>
    );
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {elements.map(renderElement)}
    </View>
  );
};

// Burst Animation Component for multiple celebration types
interface CelebrationBurstProps {
  trigger: boolean;
  sourcePosition?: { x: number; y: number };
  onComplete?: () => void;
}

export const CelebrationBurst: React.FC<CelebrationBurstProps> = ({
  trigger,
  sourcePosition,
  onComplete
}) => {
  const [showHearts, setShowHearts] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [completedAnimations, setCompletedAnimations] = useState(0);

  useEffect(() => {
    if (trigger) {
      setCompletedAnimations(0);
      setShowHearts(true);
      
      // Stagger the sparkles
      setTimeout(() => {
        setShowSparkles(true);
      }, 200);
    }
  }, [trigger]);

  const handleAnimationComplete = () => {
    setCompletedAnimations(prev => {
      const newCount = prev + 1;
      if (newCount >= 2) {
        setShowHearts(false);
        setShowSparkles(false);
        onComplete?.();
      }
      return newCount;
    });
  };

  return (
    <>
      <CelebrationAnimations
        type="heart"
        trigger={showHearts}
        sourcePosition={sourcePosition}
        onComplete={handleAnimationComplete}
      />
      <CelebrationAnimations
        type="sparkle"
        trigger={showSparkles}
        sourcePosition={sourcePosition}
        onComplete={handleAnimationComplete}
      />
    </>
  );
};

// High Five Celebration Component
export const HighFiveCelebration: React.FC<CelebrationBurstProps> = ({
  trigger,
  sourcePosition,
  onComplete
}) => {
  const [showHighFives, setShowHighFives] = useState(false);
  const [showCheers, setShowCheers] = useState(false);
  const [completedAnimations, setCompletedAnimations] = useState(0);

  useEffect(() => {
    if (trigger) {
      setCompletedAnimations(0);
      setShowHighFives(true);
      
      // Stagger the cheers
      setTimeout(() => {
        setShowCheers(true);
      }, 300);
    }
  }, [trigger]);

  const handleAnimationComplete = () => {
    setCompletedAnimations(prev => {
      const newCount = prev + 1;
      if (newCount >= 2) {
        setShowHighFives(false);
        setShowCheers(false);
        onComplete?.();
      }
      return newCount;
    });
  };

  return (
    <>
      <CelebrationAnimations
        type="highFive"
        trigger={showHighFives}
        sourcePosition={sourcePosition}
        onComplete={handleAnimationComplete}
      />
      <CelebrationAnimations
        type="cheer"
        trigger={showCheers}
        sourcePosition={sourcePosition}
        onComplete={handleAnimationComplete}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  animatedElement: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highFiveContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  highFiveText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  glowEffect: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.3,
    zIndex: -1,
  },
});

export default CelebrationAnimations; 