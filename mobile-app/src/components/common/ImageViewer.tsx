import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Image,
  Modal,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  GestureResponderEvent,
  PanResponder,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';
import ReanimatedAnimated, { multiply, timing, Value, event } from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

interface ImageViewerProps {
  images: string[];
  initialIndex?: number;
  visible: boolean;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  images,
  initialIndex = 0,
  visible,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [scale, setScale] = useState(new Animated.Value(1));
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  
  const baseScale = useRef(new ReanimatedAnimated.Value(1)).current;
  const pinchScale = useRef(new ReanimatedAnimated.Value(1)).current;
  const imageScale = multiply(baseScale, pinchScale);

  // Pan responder for swipe down to close
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
          const newOpacity = 1 - Math.min(gestureState.dy / 200, 1);
          opacity.setValue(newOpacity);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: screenHeight,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onClose();
            translateY.setValue(0);
            opacity.setValue(1);
          });
        } else {
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const handlePinchGestureEvent = event(
    [{ nativeEvent: { scale: pinchScale } }],
    { useNativeDriver: true }
  );

  const handlePinchStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      timing(pinchScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      
      baseScale.setValue(
        (baseScale as any)._value * (pinchScale as any)._value
      );
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setLoading(true);
      setError(false);
    }
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setLoading(true);
      setError(false);
    }
  };

  const handleImageLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleImageError = () => {
    setLoading(false);
    setError(true);
  };

  const handleSwipe = (event: GestureResponderEvent) => {
    const { locationX } = event.nativeEvent;
    if (locationX < screenWidth / 3) {
      goToPrevious();
    } else if (locationX > (screenWidth * 2) / 3) {
      goToNext();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      onRequestClose={onClose}
      animationType="fade"
      statusBarTranslucent
    >
      <StatusBar hidden={Platform.OS === 'ios'} />
      <Animated.View 
        style={[
          styles.container,
          {
            opacity,
            transform: [{ translateY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Close button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>

        {/* Image counter */}
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>
            {currentIndex + 1} / {images.length}
          </Text>
        </View>

        {/* Main image */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleSwipe}
          style={styles.imageContainer}
        >
          <PinchGestureHandler
            onGestureEvent={handlePinchGestureEvent}
            onHandlerStateChange={handlePinchStateChange}
          >
            <ReanimatedAnimated.View
              style={[
                styles.imageWrapper,
                {
                  transform: [{ scale: imageScale }],
                },
              ]}
            >
              {loading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="white" />
                </View>
              )}
              {error ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="image-outline" size={60} color="#666" />
                  <Text style={styles.errorText}>Failed to load image</Text>
                </View>
              ) : (
                <Image
                  source={{ uri: images[currentIndex] }}
                  style={styles.image}
                  resizeMode="contain"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              )}
            </ReanimatedAnimated.View>
          </PinchGestureHandler>
        </TouchableOpacity>

        {/* Navigation arrows for tablets */}
        {isTablet && (
          <>
            <TouchableOpacity
              style={[styles.navigationButton, styles.leftButton]}
              onPress={goToPrevious}
              disabled={currentIndex === 0}
              activeOpacity={0.8}
            >
              <Ionicons
                name="chevron-back"
                size={40}
                color={currentIndex === 0 ? '#444' : 'white'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navigationButton, styles.rightButton]}
              onPress={goToNext}
              disabled={currentIndex === images.length - 1}
              activeOpacity={0.8}
            >
              <Ionicons
                name="chevron-forward"
                size={40}
                color={currentIndex === images.length - 1 ? '#444' : 'white'}
              />
            </TouchableOpacity>
          </>
        )}

        {/* Navigation dots */}
        {images.length > 1 && (
          <View style={styles.dotsContainer}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentIndex && styles.activeDot,
                ]}
              />
            ))}
          </View>
        )}
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  counterContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    zIndex: 10,
  },
  counterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: screenWidth,
    height: screenHeight * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#666',
    marginTop: 10,
    fontSize: 16,
  },
  navigationButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
  },
  leftButton: {
    left: 20,
  },
  rightButton: {
    right: 20,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  activeDot: {
    backgroundColor: 'white',
    width: 24,
  },
});

export default ImageViewer;