"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface BubbleProps {
  baseRadius: number;
  volumeLevel: number;
  index: number;
  color: string;
  originalPosition: [number, number, number];
}

const Bubble = ({ 
  baseRadius, 
  volumeLevel, 
  index, 
  color,
  originalPosition 
}: BubbleProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  const randomPhaseRef = useRef(Math.random() * Math.PI * 2); // Random phase for each bubble
  const randomSpeedRef = useRef(0.8 + Math.random() * 0.4); // Random pulse speed
  const scatterDirectionRef = useRef<[number, number, number]>([
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2,
  ]); // Random scatter direction for each bubble

  useFrame(() => {
    if (!meshRef.current) return;
    
    timeRef.current += 0.015;
    
    // Individual bubble scaling - much more subtle and random
    // Less dramatic than the overall sphere scaling
    const individualVolumeMultiplier = 1 + (volumeLevel / 100) * 0.25; // Scale from 1.0 to 1.25
    
    // Random pulsing animation that varies per bubble
    const distanceFromCenter = Math.sqrt(
      originalPosition[0] ** 2 + originalPosition[1] ** 2 + originalPosition[2] ** 2
    );
    const pulse = Math.sin(
      timeRef.current * randomSpeedRef.current * 1.5 + 
      randomPhaseRef.current + 
      index * 0.05 + 
      distanceFromCenter * 0.3
    ) * 0.1 + 1; // Smaller pulse variation
    
    // Apply subtle individual scaling
    const scale = baseRadius * individualVolumeMultiplier * pulse;
    meshRef.current.scale.setScalar(scale);
    
    // Dynamic scattering: bubbles move outward when voice is active
    const scatterAmount = (volumeLevel / 100) * 0.3; // Scatter up to 30% of radius
    const scatterX = originalPosition[0] + scatterDirectionRef.current[0] * scatterAmount;
    const scatterY = originalPosition[1] + scatterDirectionRef.current[1] * scatterAmount;
    const scatterZ = originalPosition[2] + scatterDirectionRef.current[2] * scatterAmount;
    
    // Smooth interpolation for position
    const currentPos = meshRef.current.position;
    const targetX = scatterX;
    const targetY = scatterY;
    const targetZ = scatterZ;
    
    currentPos.x += (targetX - currentPos.x) * 0.15;
    currentPos.y += (targetY - currentPos.y) * 0.15;
    currentPos.z += (targetZ - currentPos.z) * 0.15;
    
    // Subtle rotation for visual interest
    meshRef.current.rotation.x += 0.001;
    meshRef.current.rotation.y += 0.001;
    
    // Update opacity based on volume - glassmorphic range (more visible when louder)
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    if (material) {
      material.opacity = 0.5 + (volumeLevel / 100) * 0.4; // 0.5 to 0.9 for better visibility
    }
  });

  return (
    <mesh ref={meshRef} position={originalPosition}>
      <sphereGeometry args={[baseRadius, 16, 16]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.6}
        roughness={0.1}
        metalness={0.0}
        envMapIntensity={0.5}
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
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  const targetScaleRef = useRef(1);

  const bubbles = useMemo(() => {
    const count = 800; // Number of bubbles - increased for higher density
    const radius = 2.2; // Sphere radius - reduced for smaller, more modest size
    
    const positions: [number, number, number][] = [];
    
    // Generate positions with density gradient - dense on outside, sparse on inside
    for (let i = 0; i < count; i++) {
      // Uniform angular distribution
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI; // Azimuth
      const phi = Math.acos(2.0 * v - 1.0); // Polar
      
      // Bias radius toward outer edge for shell effect
      // Use power function to heavily weight outer radius
      // Most bubbles will be in outer 40% of radius (creating dense shell)
      // Inner 60% will be sparse (creating hollow center illusion)
      const minRadiusRatio = 0.6; // Start bubbles at 60% of radius
      const biasPower = 0.25; // Lower power = more bias toward outer edge
      const r = radius * (minRadiusRatio + (1 - minRadiusRatio) * Math.pow(Math.random(), biasPower));
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      positions.push([x, y, z]);
    }
    
    return positions;
  }, []);

  // Determine base color palette based on who is speaking - Glassmorphic colors
  const getBubbleColor = useMemo(() => {
    const baseColorPalette = isUserSpeaking 
      ? ["#E0E7FF", "#C7D2FE", "#A5B4FC", "#818CF8"] // Soft indigo/blue glass tones for user
      : isSpeaking 
      ? ["#DBEAFE", "#BFDBFE", "#93C5FD", "#60A5FA"] // Soft blue glass tones for AI
      : ["#F0F9FF", "#E0F2FE", "#BAE6FD", "#7DD3FC"]; // Light cyan/blue glass default
    
    return (index: number): string => {
      // Vary color based on bubble position for visual interest
      const colorIndex = Math.floor((index * 0.618) % baseColorPalette.length);
      return baseColorPalette[colorIndex];
    };
  }, [isUserSpeaking, isSpeaking]);

  // Animate sphere scaling based on voice activity
  useFrame(() => {
    if (!groupRef.current) return;
    
    timeRef.current += 0.015;
    
    // Check if there's active voice activity
    const isActive = volumeLevel > 5 || isSpeaking || isUserSpeaking;
    
    // Calculate target scale based on volume level
    // Sphere grows from 0.75 (idle) to 1.1 (loud speaking) - smaller, more contained
    if (isActive) {
      targetScaleRef.current = 0.75 + (volumeLevel / 100) * 0.35; // 0.75 to 1.1
    } else {
      // Gentle idle pulse when no voice activity - stays at 0.75 with small pulse
      const idlePulse = Math.sin(timeRef.current * 0.5) * 0.015;
      targetScaleRef.current = 0.75 + idlePulse; // 0.735 to 0.765 (centered at 0.75)
    }
    
    // Smooth interpolation towards target scale for fluid animation
    const currentScale = groupRef.current.scale.x;
    const smoothScale = currentScale + (targetScaleRef.current - currentScale) * 0.12;
    
    // Add continuous pulse based on voice activity - creates breathing effect
    let finalScale = smoothScale;
    if (isActive) {
      const voicePulse = Math.sin(timeRef.current * 2.5) * 0.05; // Smaller pulse when active
      finalScale = smoothScale + voicePulse;
      // Clamp to ensure it doesn't exceed 1.1
      finalScale = Math.min(finalScale, 1.1);
    }
    
    // Ensure scale stays within bounds
    finalScale = Math.max(0.73, Math.min(1.1, finalScale));
    groupRef.current.scale.setScalar(finalScale);
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />
      <pointLight position={[-10, -10, -10]} intensity={0.6} />
      <directionalLight position={[0, 5, 5]} intensity={0.5} />
      
      <group ref={groupRef}>
        {bubbles.map((position, index) => (
          <Bubble
            key={index}
            originalPosition={position}
            baseRadius={0.18}
            volumeLevel={volumeLevel}
            index={index}
            color={getBubbleColor(index)}
          />
        ))}
      </group>
      
      <OrbitControls
        enableZoom={false}
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
    <div className="w-full h-full bg-transparent">
      <Canvas 
        camera={{ position: [0, 0, 10], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <SphereVisualizationScene
          volumeLevel={volumeLevel}
          isSpeaking={isSpeaking}
          isUserSpeaking={isUserSpeaking}
        />
      </Canvas>
    </div>
  );
};

