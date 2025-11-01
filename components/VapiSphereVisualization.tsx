"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface BubbleProps {
  position: [number, number, number];
  baseRadius: number;
  volumeLevel: number;
  index: number;
  color: string;
}

const Bubble = ({ position, baseRadius, volumeLevel, index, color }: BubbleProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useFrame(() => {
    if (!meshRef.current) return;
    
    timeRef.current += 0.015;
    
    // Calculate expansion based on volume level (0-100)
    // More dramatic expansion for higher volumes
    const volumeMultiplier = 1 + (volumeLevel / 100) * 0.8; // Scale from 1.0 to 1.8
    
    // Add pulsing animation that varies by bubble position
    const distanceFromCenter = Math.sqrt(
      position[0] ** 2 + position[1] ** 2 + position[2] ** 2
    );
    const pulse = Math.sin(timeRef.current * 2 + index * 0.1 + distanceFromCenter) * 0.15 + 1;
    
    // Apply the scale with volume-based expansion
    const scale = baseRadius * volumeMultiplier * pulse;
    meshRef.current.scale.setScalar(scale);
    
    // Subtle rotation for visual interest
    meshRef.current.rotation.x += 0.002;
    meshRef.current.rotation.y += 0.002;
    
    // Update opacity based on volume (more visible when louder)
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    if (material) {
      material.opacity = 0.3 + (volumeLevel / 100) * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[baseRadius, 16, 16]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.6}
        roughness={0.2}
        metalness={0.2}
      />
    </mesh>
  );
};

interface SphereVisualizationProps {
  volumeLevel: number;
  isSpeaking: boolean;
  isUserSpeaking: boolean;
}

const SphereVisualizationScene = ({
  volumeLevel,
  isSpeaking,
  isUserSpeaking,
}: SphereVisualizationProps) => {
  const bubbles = useMemo(() => {
    const count = 300; // Number of bubbles
    const radius = 3; // Sphere radius
    
    const positions: [number, number, number][] = [];
    
    // Generate positions using spherical distribution
    for (let i = 0; i < count; i++) {
      // Uniform distribution on sphere surface and interior
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI; // Azimuth
      const phi = Math.acos(2.0 * v - 1.0); // Polar
      const r = radius * Math.cbrt(Math.random()); // Cube root for uniform volume distribution
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      positions.push([x, y, z]);
    }
    
    return positions;
  }, []);

  // Determine base color palette based on who is speaking
  const getBubbleColor = useMemo(() => {
    const baseColorPalette = isUserSpeaking 
      ? ["#4169E1", "#6495ED", "#87CEEB", "#ADD8E6"] // Blue tones for user
      : isSpeaking 
      ? ["#50C878", "#7FFFD4", "#90EE90", "#98FB98"] // Green tones for AI
      : ["#87CEEB", "#B0E0E6", "#ADD8E6", "#E0F6FF"]; // Sky blue default
    
    return (index: number): string => {
      // Vary color based on bubble position for visual interest
      const colorIndex = Math.floor((index * 0.618) % baseColorPalette.length);
      return baseColorPalette[colorIndex];
    };
  }, [isUserSpeaking, isSpeaking]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />
      <pointLight position={[-10, -10, -10]} intensity={0.6} />
      <directionalLight position={[0, 5, 5]} intensity={0.5} />
      
      <group>
        {bubbles.map((position, index) => (
          <Bubble
            key={index}
            position={position}
            baseRadius={0.08}
            volumeLevel={volumeLevel}
            index={index}
            color={getBubbleColor(index)}
          />
        ))}
      </group>
      
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        autoRotate={true}
        autoRotateSpeed={0.5}
        minDistance={5}
        maxDistance={15}
      />
    </>
  );
};

export const VapiSphereVisualization = ({
  volumeLevel,
  isSpeaking,
  isUserSpeaking,
}: SphereVisualizationProps) => {
  return (
    <div className="w-full h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg overflow-hidden shadow-lg">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <SphereVisualizationScene
          volumeLevel={volumeLevel}
          isSpeaking={isSpeaking}
          isUserSpeaking={isUserSpeaking}
        />
      </Canvas>
    </div>
  );
};

