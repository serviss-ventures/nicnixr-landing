import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import {
  Scene,
  PerspectiveCamera,
  BufferGeometry,
  BufferAttribute,
  PointsMaterial,
  Points,
  Color,
} from 'three';

interface ParticleVisualizationProps {
  progress?: number; // 0-100
  color?: string;
}

export default function ParticleVisualization({ 
  progress = 50, 
  color = '#00ff00' 
}: ParticleVisualizationProps) {
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const particlesRef = useRef<Points | null>(null);

  const onContextCreate = async (gl: any) => {
    // Create renderer
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    // Create scene
    const scene = new Scene();
    scene.background = new Color(0x000000);

    // Create camera
    const camera = new PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );
    camera.position.z = 50;

    // Create particles
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const baseColor = new Color(color);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Position particles in a sphere
      const radius = 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Color based on progress
      const intensity = i < (particleCount * progress / 100) ? 1 : 0.2;
      colors[i3] = baseColor.r * intensity;
      colors[i3 + 1] = baseColor.g * intensity;
      colors[i3 + 2] = baseColor.b * intensity;

      // Random sizes
      sizes[i] = Math.random() * 2 + 0.5;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('color', new BufferAttribute(colors, 3));
    geometry.setAttribute('size', new BufferAttribute(sizes, 1));

    const material = new PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });

    const particles = new Points(geometry, material);
    particlesRef.current = particles;
    scene.add(particles);

    // Animation loop
    const animate = () => {
      timeout.current = requestAnimationFrame(animate);

      // Rotate particles
      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.002;
        particlesRef.current.rotation.x += 0.001;
      }

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    animate();
  };

  // Update colors when progress changes
  useEffect(() => {
    if (particlesRef.current) {
      const geometry = particlesRef.current.geometry;
      const colors = geometry.attributes.color.array as Float32Array;
      const particleCount = colors.length / 3;
      const baseColor = new Color(color);

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const intensity = i < (particleCount * progress / 100) ? 1 : 0.2;
        colors[i3] = baseColor.r * intensity;
        colors[i3 + 1] = baseColor.g * intensity;
        colors[i3 + 2] = baseColor.b * intensity;
      }

      geometry.attributes.color.needsUpdate = true;
    }
  }, [progress, color]);

  return (
    <View style={styles.container}>
      <GLView
        style={styles.glView}
        onContextCreate={onContextCreate}
      />
      <View style={styles.overlay}>
        <Text style={styles.progressText}>{progress}% Complete</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  glView: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  progressText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
}); 