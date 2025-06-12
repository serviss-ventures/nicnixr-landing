import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Canvas, Circle, Shader, Skia, vec } from '@shopify/react-native-skia';
import { useSharedValue, useDerivedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';

// The final, robust shader source code
const shaderSource = Skia.RuntimeEffect.Make(`
  uniform float time;
  uniform vec2 resolution;
  uniform float recoveryDays;

  // 2D Simplex Noise for natural, organic patterns
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Main shader function
  vec4 main(vec2 fragCoord) {
    vec2 centered_uv = (fragCoord.xy - 0.5 * resolution.xy) / resolution.y;
    
    // Overall progress from 0.0 to 1.0 over 120 days
    float progress = clamp(recoveryDays / 120.0, 0.0, 1.0);

    // Act 1: The Storm (Days 0-30), transition out from day 30-45
    float storm_factor = 1.0 - smoothstep(30.0, 45.0, recoveryDays);
    // Act 2: The Clearing (Days 30-90), transition in from 30-45 and out from 90-105
    float clearing_factor = smoothstep(30.0, 45.0, recoveryDays) - smoothstep(90.0, 105.0, recoveryDays);
    // Act 3: Healing Waters (Days 90+), transition in from 90-105
    float healing_factor = smoothstep(90.0, 105.0, recoveryDays);

    // --- Define parameters for each act ---
    // Speed: Storm is fast, Clearing is moderate, Healing is very slow
    float speed = (0.5 * storm_factor) + (0.2 * clearing_factor) + (0.05 * healing_factor);
    // Turbulence: Storm is chaotic, Clearing is wavy, Healing is gentle
    float turbulence = (6.0 * storm_factor) + (3.5 * clearing_factor) + (2.0 * healing_factor);
    // Foam: Lots of foam in storm, less in clearing, minimal in healing
    float foam_threshold = (0.55 * storm_factor) + (0.7 * clearing_factor) + (0.85 * healing_factor);

    // Multi-layered noise for a more complex and natural water effect
    float noise = 0.5 * snoise(centered_uv * turbulence + time * speed);
    noise += 0.25 * snoise(centered_uv * turbulence * 2.2 + time * speed * 1.6);
    noise += 0.125 * snoise(centered_uv * turbulence * 4.5 + time * speed * 2.4);

    // --- Define color palettes for each act ---
    vec3 storm_color_dark = vec3(0.02, 0.05, 0.1);
    vec3 storm_color_light = vec3(0.1, 0.15, 0.25);
    vec3 clearing_color_dark = vec3(0.1, 0.2, 0.35);
    vec3 clearing_color_light = vec3(0.15, 0.4, 0.7);
    // Epic Healing Waters: A deep, powerful blue contrasted with a bright, ethereal cyan.
    vec3 healing_color_dark = vec3(0.05, 0.2, 0.4); 
    vec3 healing_color_light = vec3(0.4, 0.7, 1.0);
    vec3 foam_color = vec3(0.95, 0.95, 1.0);

    // Mix colors based on noise for each act
    vec3 storm_final_color = mix(storm_color_dark, storm_color_light, smoothstep(-1.0, 1.0, noise));
    vec3 clearing_final_color = mix(clearing_color_dark, clearing_color_light, smoothstep(-1.0, 1.0, noise));
    vec3 healing_final_color = mix(healing_color_dark, healing_color_light, smoothstep(-1.0, 1.0, noise));

    // Blend the acts together based on their factors
    vec3 water_color = (storm_final_color * storm_factor) + (clearing_final_color * clearing_factor) + (healing_final_color * healing_factor);

    // Add foam
    water_color = mix(water_color, foam_color, smoothstep(foam_threshold, foam_threshold + 0.1, noise));

    // Apply a soft vignette to keep focus on the center
    float vignette = 1.0 - smoothstep(0.4, 0.5, length(centered_uv));
    
    return vec4(water_color * vignette, 1.0);
  }
`)!;

if (!shaderSource) {
  throw new Error("CRITICAL: Failed to compile the Skia shader for the Recovery Visualizer.");
}

interface StormyRecoveryVisualizerProps {
  recoveryDays: number;
  size?: number;
}

export default function StormyRecoveryVisualizer({ recoveryDays, size = 250 }: StormyRecoveryVisualizerProps) {
  const time = useSharedValue(0);

  useEffect(() => {
    // Slower, more majestic animation loop (50 seconds)
    time.value = withRepeat(
      withTiming(100, { duration: 50000, easing: Easing.linear }),
      -1,
      false
    );
  }, [time]);
  
  const uniforms = useDerivedValue(() => {
    return {
      resolution: [size, size],
      recoveryDays: Math.max(0, recoveryDays),
      time: time.value,
    };
  }, [recoveryDays, size, time]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Canvas style={styles.canvas}>
        <Circle cx={size / 2} cy={size / 2} r={size / 2}>
          <Shader source={shaderSource} uniforms={uniforms} />
        </Circle>
      </Canvas>
      <View style={styles.overlay}>
        <Text style={styles.daysText}>{Math.floor(recoveryDays)}</Text>
        <Text style={styles.labelText}>Days Clean</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    backgroundColor: '#0A0F1C',
    borderRadius: 9999,
  },
  canvas: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  daysText: {
    fontSize: 72,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.95)',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 15,
  },
  labelText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.75)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: -5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
}); 