import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';

interface HeartAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

const HeartAnimation: React.FC<HeartAnimationProps> = ({ show, onComplete }) => {
  const hearts = useRef([...Array(6)].map(() => ({
    translateY: new Animated.Value(0),
    opacity: new Animated.Value(1),
    scale: new Animated.Value(0.5),
  }))).current;

  useEffect(() => {
    if (show) {
      // Start animations for all hearts
      const animations = hearts.map((heart, index) => {
        return Animated.parallel([
          Animated.timing(heart.translateY, {
            toValue: -100 - (Math.random() * 50),
            duration: 1000 + (index * 100),
            useNativeDriver: true,
          }),
          Animated.timing(heart.opacity, {
            toValue: 0,
            duration: 1000 + (index * 100),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(heart.scale, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(heart.scale, {
              toValue: 0.8,
              duration: 800 + (index * 100),
              useNativeDriver: true,
            }),
          ]),
        ]);
      });

      Animated.stagger(100, animations).start(() => {
        // Reset values
        hearts.forEach(heart => {
          heart.translateY.setValue(0);
          heart.opacity.setValue(1);
          heart.scale.setValue(0.5);
        });
        onComplete?.();
      });
    }
  }, [show]);

  if (!show) return null;

  return (
    <View style={styles.container}>
      {hearts.map((heart, index) => (
        <Animated.View
          key={index}
          style={[
            styles.heart,
            {
              left: 50 + (Math.random() * 100),
              transform: [
                { translateY: heart.translateY },
                { scale: heart.scale },
              ],
              opacity: heart.opacity,
            },
          ]}
        >
          <Animated.Text style={styles.heartEmoji}>❤️</Animated.Text>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 1000,
  },
  heart: {
    position: 'absolute',
    bottom: 60,
  },
  heartEmoji: {
    fontSize: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default HeartAnimation; 