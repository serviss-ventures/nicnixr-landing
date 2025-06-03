import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Rect, G, Defs, LinearGradient as SvgLinearGradient, Stop, Ellipse } from 'react-native-svg';

interface CustomAvatarProps {
  type: 'ninja' | 'wizard' | 'king' | 'hero' | 'ascended' | 'locked';
  size?: number;
  unlocked?: boolean;
}

const CustomAvatar: React.FC<CustomAvatarProps> = ({ type, size = 60, unlocked = true }) => {
  const renderAvatar = () => {
    switch (type) {
      case 'ninja':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Defs>
              <SvgLinearGradient id="ninjaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#1F2937" />
                <Stop offset="100%" stopColor="#374151" />
              </SvgLinearGradient>
            </Defs>
            {/* Ninja head */}
            <Circle cx="50" cy="40" r="25" fill="url(#ninjaGrad)" />
            {/* Ninja mask */}
            <Path d="M 25 35 Q 50 30 75 35 L 75 45 Q 50 50 25 45 Z" fill="#000000" />
            {/* Eyes */}
            <Circle cx="38" cy="38" r="3" fill="#FFFFFF" />
            <Circle cx="62" cy="38" r="3" fill="#FFFFFF" />
            <Circle cx="38" cy="38" r="1.5" fill="#000000" />
            <Circle cx="62" cy="38" r="1.5" fill="#000000" />
            {/* Headband */}
            <Rect x="20" y="28" width="60" height="5" fill="#8B5CF6" />
            {/* Headband tails */}
            <Path d="M 75 30 L 85 25 L 85 35 Z" fill="#8B5CF6" />
            <Path d="M 75 30 L 85 35 L 85 45 Z" fill="#8B5CF6" />
          </Svg>
        );
      
      case 'wizard':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Defs>
              <SvgLinearGradient id="wizardHat" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#8B5CF6" />
                <Stop offset="100%" stopColor="#6D28D9" />
              </SvgLinearGradient>
              <SvgLinearGradient id="wizardBeard" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#E5E7EB" />
                <Stop offset="100%" stopColor="#D1D5DB" />
              </SvgLinearGradient>
            </Defs>
            {/* Face */}
            <Circle cx="50" cy="50" r="20" fill="#FBBF24" />
            {/* Wizard hat */}
            <Path d="M 30 40 L 50 10 L 70 40 Z" fill="url(#wizardHat)" />
            <Rect x="25" y="38" width="50" height="8" fill="url(#wizardHat)" />
            {/* Stars on hat */}
            <Path d="M 45 25 L 46 28 L 49 28 L 47 30 L 48 33 L 45 31 L 42 33 L 43 30 L 41 28 L 44 28 Z" fill="#FCD34D" />
            {/* Eyes */}
            <Circle cx="42" cy="48" r="2" fill="#000000" />
            <Circle cx="58" cy="48" r="2" fill="#000000" />
            {/* Beard */}
            <Path d="M 35 55 Q 50 65 65 55 L 65 70 Q 50 75 35 70 Z" fill="url(#wizardBeard)" />
          </Svg>
        );
      
      case 'king':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Defs>
              <SvgLinearGradient id="crown" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#FCD34D" />
                <Stop offset="100%" stopColor="#F59E0B" />
              </SvgLinearGradient>
            </Defs>
            {/* Face */}
            <Circle cx="50" cy="55" r="22" fill="#FBBF24" />
            {/* Crown base */}
            <Rect x="25" y="25" width="50" height="15" fill="url(#crown)" />
            {/* Crown peaks */}
            <Path d="M 25 25 L 30 15 L 35 25 M 40 25 L 45 10 L 50 25 M 55 25 L 60 15 L 65 25 M 70 25 L 75 15 L 75 25" fill="url(#crown)" />
            {/* Crown jewels */}
            <Circle cx="30" cy="32" r="3" fill="#EF4444" />
            <Circle cx="50" cy="32" r="4" fill="#3B82F6" />
            <Circle cx="70" cy="32" r="3" fill="#10B981" />
            {/* Eyes */}
            <Circle cx="42" cy="53" r="2" fill="#000000" />
            <Circle cx="58" cy="53" r="2" fill="#000000" />
            {/* Smile */}
            <Path d="M 40 60 Q 50 65 60 60" stroke="#000000" strokeWidth="2" fill="none" />
          </Svg>
        );
      
      case 'hero':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Defs>
              <SvgLinearGradient id="heroSuit" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#3B82F6" />
                <Stop offset="100%" stopColor="#1E40AF" />
              </SvgLinearGradient>
              <SvgLinearGradient id="heroCape" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#DC2626" />
                <Stop offset="100%" stopColor="#991B1B" />
              </SvgLinearGradient>
            </Defs>
            {/* Cape */}
            <Path d="M 20 45 Q 15 70 25 85 L 35 70 L 50 75 L 65 70 L 75 85 Q 85 70 80 45 Q 65 50 50 50 Q 35 50 20 45" fill="url(#heroCape)" />
            {/* Body */}
            <Ellipse cx="50" cy="65" rx="20" ry="25" fill="url(#heroSuit)" />
            {/* Head */}
            <Circle cx="50" cy="35" r="18" fill="#FBBF24" />
            {/* Mask */}
            <Path d="M 30 30 Q 50 25 70 30 L 70 40 Q 50 42 30 40 Z" fill="#1F2937" />
            {/* Eyes */}
            <Ellipse cx="40" cy="35" rx="5" ry="3" fill="#FFFFFF" />
            <Ellipse cx="60" cy="35" rx="5" ry="3" fill="#FFFFFF" />
            {/* Hero emblem */}
            <Circle cx="50" cy="65" r="8" fill="#FCD34D" />
            <Path d="M 50 60 L 52 64 L 56 64 L 53 67 L 54 71 L 50 68 L 46 71 L 47 67 L 44 64 L 48 64 Z" fill="#DC2626" />
          </Svg>
        );
      
      case 'ascended':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Defs>
              <SvgLinearGradient id="ascendedGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#FCD34D" />
                <Stop offset="50%" stopColor="#FFFFFF" />
                <Stop offset="100%" stopColor="#FCD34D" />
              </SvgLinearGradient>
              <SvgLinearGradient id="ascendedAura" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
                <Stop offset="100%" stopColor="#EC4899" stopOpacity="0.3" />
              </SvgLinearGradient>
            </Defs>
            {/* Outer aura */}
            <Circle cx="50" cy="50" r="45" fill="url(#ascendedAura)" />
            <Circle cx="50" cy="50" r="38" fill="url(#ascendedAura)" />
            {/* Inner glow */}
            <Circle cx="50" cy="50" r="30" fill="url(#ascendedGlow)" opacity="0.8" />
            {/* Core being */}
            <Circle cx="50" cy="50" r="20" fill="#FFFFFF" />
            {/* Energy points */}
            <Circle cx="50" cy="20" r="3" fill="#8B5CF6" />
            <Circle cx="75" cy="35" r="3" fill="#EC4899" />
            <Circle cx="75" cy="65" r="3" fill="#8B5CF6" />
            <Circle cx="50" cy="80" r="3" fill="#EC4899" />
            <Circle cx="25" cy="65" r="3" fill="#8B5CF6" />
            <Circle cx="25" cy="35" r="3" fill="#EC4899" />
            {/* Third eye */}
            <Ellipse cx="50" cy="45" rx="3" ry="6" fill="#8B5CF6" />
          </Svg>
        );
      
      case 'locked':
        return (
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Defs>
              <SvgLinearGradient id="lockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#6B7280" />
                <Stop offset="100%" stopColor="#4B5563" />
              </SvgLinearGradient>
            </Defs>
            {/* Lock body */}
            <Rect x="30" y="45" width="40" height="35" rx="5" fill="url(#lockGrad)" />
            {/* Lock shackle */}
            <Path d="M 35 45 L 35 35 Q 35 20 50 20 Q 65 20 65 35 L 65 45" 
                  stroke="url(#lockGrad)" strokeWidth="8" fill="none" strokeLinecap="round" />
            {/* Keyhole */}
            <Circle cx="50" cy="60" r="5" fill="#1F2937" />
            <Rect x="47" y="60" width="6" height="10" fill="#1F2937" />
          </Svg>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { opacity: unlocked ? 1 : 0.5 }]}>
      {renderAvatar()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomAvatar; 