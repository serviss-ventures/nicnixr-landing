import React, { useRef, useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Ocean shader material
const OceanShaderMaterial = shaderMaterial(
  // Uniforms
  {
    time: 0,
    recoveryDays: 0,
    resolution: new THREE.Vector2(1, 1),
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying float vElevation;
    uniform float time;
    uniform float recoveryDays;
    
    // Noise function for wave generation
    float noise(vec2 p) {
      return sin(p.x * 10.0) * sin(p.y * 10.0);
    }
    
    void main() {
      vUv = uv;
      
      // Create waves that calm down as recovery progresses
      float calmness = min(recoveryDays / 30.0, 1.0);
      float waveIntensity = 0.15 * (1.0 - calmness * 0.7);
      
      // Multiple wave layers
      float elevation = 0.0;
      elevation += sin(position.x * 2.0 + time * 0.5) * waveIntensity;
      elevation += sin(position.y * 3.0 + time * 0.3) * waveIntensity * 0.5;
      elevation += noise(position.xy * 5.0 + time * 0.2) * waveIntensity * 0.3;
      
      vElevation = elevation;
      
      vec3 newPosition = position;
      newPosition.z += elevation;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
  // Fragment shader
  `
    varying vec2 vUv;
    varying float vElevation;
    uniform float time;
    uniform float recoveryDays;
    uniform vec2 resolution;
    
    void main() {
      // Color evolution based on recovery days
      float progress = min(recoveryDays / 365.0, 1.0);
      
      // Start with dark, turbulent waters (addiction)
      vec3 darkWater = vec3(0.05, 0.1, 0.15);
      vec3 healingWater = vec3(0.1, 0.3, 0.5);
      vec3 clearWater = vec3(0.2, 0.5, 0.8);
      vec3 pristineWater = vec3(0.3, 0.7, 0.9);
      
      // Gradual color transition
      vec3 color;
      if (recoveryDays < 7.0) {
        // First week: Dark to healing
        float t = recoveryDays / 7.0;
        color = mix(darkWater, healingWater, t);
      } else if (recoveryDays < 30.0) {
        // First month: Healing to clear
        float t = (recoveryDays - 7.0) / 23.0;
        color = mix(healingWater, clearWater, t);
      } else if (recoveryDays < 365.0) {
        // First year: Clear to pristine
        float t = (recoveryDays - 30.0) / 335.0;
        color = mix(clearWater, pristineWater, t);
      } else {
        // Beyond: Pristine with shimmer
        color = pristineWater;
        float shimmer = sin(time * 2.0 + vUv.x * 10.0) * 0.05;
        color += vec3(shimmer);
      }
      
      // Add foam on wave peaks (less foam as recovery progresses)
      float foam = smoothstep(0.1 * (1.0 - progress * 0.5), 0.15, vElevation);
      color += foam * vec3(0.2);
      
      // Add depth gradient
      color *= (0.7 + vUv.y * 0.3);
      
      // Subtle animation
      color += sin(time * 0.5 + vUv.x * 5.0) * 0.02;
      
      gl_FragColor = vec4(color, 0.95);
    }
  `
);

// Extend Three.js
OceanShaderMaterial.key = THREE.MathUtils.generateUUID();

interface OceanMeshProps {
  recoveryDays: number;
}

function OceanMesh({ recoveryDays }: OceanMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const { size } = useThree();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
      materialRef.current.uniforms.resolution.value.set(size.width, size.height);
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[10, 10, 128, 128]} />
      <oceanShaderMaterial
        ref={materialRef}
        recoveryDays={recoveryDays}
        transparent
      />
    </mesh>
  );
}

interface OceanShaderProps {
  recoveryDays: number;
  height?: number;
}

export default function OceanShader({ recoveryDays, height = 200 }: OceanShaderProps) {
  return (
    <View style={[styles.container, { height }]}>
      <Canvas
        camera={{ position: [0, 2, 5], fov: 45 }}
        style={styles.canvas}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <OceanMesh recoveryDays={recoveryDays} />
      </Canvas>
      
      {/* Recovery days overlay */}
      <View style={styles.overlay}>
        <Text style={styles.daysText}>Day {recoveryDays}</Text>
        <Text style={styles.labelText}>Recovery Journey</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    backgroundColor: '#000',
    borderRadius: 16,
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  daysText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  labelText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
}); 