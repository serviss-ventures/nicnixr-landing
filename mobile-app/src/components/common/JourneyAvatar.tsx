import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { SvgXml, Path } from 'react-native-svg';
import multiavatar from '@multiavatar/multiavatar';
import { LinearGradient } from 'expo-linear-gradient';

interface JourneyAvatarProps {
  milestone: string; // Used as seed for unique avatar
  size?: number;
  unlocked?: boolean;
  daysRequired?: number;
  borderColors?: [string, string];
}

const JourneyAvatar: React.FC<JourneyAvatarProps> = ({ 
  milestone, 
  size = 80, 
  unlocked = false,
  daysRequired = 0,
  borderColors = ['#8B5CF6', '#EC4899']
}) => {
  // Generate unique avatar based on milestone + days
  const avatarSvg = useMemo(() => {
    const seed = `${milestone}_journey_${daysRequired}`;
    return multiavatar(seed);
  }, [milestone, daysRequired]);
  
  // Clean up SVG for React Native
  const cleanSvg = useMemo(() => {
    // Remove the width and height from the SVG to make it scalable
    let svg = avatarSvg.replace(/width="\d+"/, '');
    svg = svg.replace(/height="\d+"/, '');
    // Add viewBox if not present
    if (!svg.includes('viewBox')) {
      svg = svg.replace('<svg', '<svg viewBox="0 0 231 231"');
    }
    return svg;
  }, [avatarSvg]);
  
  const opacity = unlocked ? 1 : 0.3;
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Gradient Border */}
      <LinearGradient
        colors={unlocked ? borderColors : ['#374151', '#1F2937']}
        style={[styles.gradientBorder, { opacity }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.innerContainer}>
          {/* Background Circle */}
          <View style={[
            styles.backgroundCircle,
            { 
              backgroundColor: unlocked ? '#1F2937' : '#0F172A',
              width: size - 8,
              height: size - 8,
            }
          ]}>
            {/* Avatar */}
            <View style={{ opacity }}>
              <SvgXml 
                xml={cleanSvg} 
                width={size - 16} 
                height={size - 16}
              />
            </View>
            
            {/* Locked Overlay */}
            {!unlocked && (
              <View style={styles.lockedOverlay}>
                <View style={[styles.lockIconContainer, { width: size * 0.3, height: size * 0.3 }]}>
                  <Svg width={size * 0.2} height={size * 0.2} viewBox="0 0 24 24">
                    <Path 
                      d="M12 2C9.243 2 7 4.243 7 7v3H6c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7zm4 10.723V20h-2v-2.277a1.993 1.993 0 01-.567-3.677A2.001 2.001 0 0114 16.001c0 .736-.402 1.398-1 1.722z"
                      fill="#6B7280"
                      opacity="0.8"
                    />
                  </Svg>
                </View>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
      
      {/* Glow Effect for Unlocked */}
      {unlocked && (
        <LinearGradient
          colors={[...borderColors, 'transparent']}
          style={[styles.glowEffect, { width: size + 20, height: size + 20 }]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 0.5, y: 0 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gradientBorder: {
    borderRadius: 999,
    padding: 4,
  },
  innerContainer: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  backgroundCircle: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIconContainer: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowEffect: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.3,
    zIndex: -1,
  },
});

export default JourneyAvatar; 