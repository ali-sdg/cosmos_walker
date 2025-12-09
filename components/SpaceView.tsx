
import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Sparkles, Billboard, Float } from '@react-three/drei';
import * as THREE from 'three';
import { CelestialBody } from '../types';
import { CELESTIAL_DATA } from '../constants';

interface SpaceViewProps {
  onSelect: (body: CelestialBody) => void;
  selectedId: string | null;
}

// --- Visual Components ---

const GlowingOrb = ({ color, scale, opacity = 0.6 }: { color: string, scale: number, opacity?: number }) => (
  <Billboard>
    <mesh scale={[scale, scale, 1]}>
      <circleGeometry args={[1, 32]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={opacity} 
        blending={THREE.AdditiveBlending} 
        depthWrite={false}
        map={new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/glow.png')}
      />
    </mesh>
  </Billboard>
);

const GalaxyMesh: React.FC<{ body: CelestialBody }> = ({ body }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Slow rotation for the galaxy
      groupRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Core Glow */}
      <mesh>
        <sphereGeometry args={[body.radius * 0.4, 32, 32]} />
        <meshBasicMaterial color={body.color} transparent opacity={0.8} blending={THREE.AdditiveBlending} />
      </mesh>
      <GlowingOrb color={body.color} scale={body.radius * 4} opacity={0.5} />
      
      {/* Spiral Arms - Dense Core */}
      <Sparkles 
        count={3000} 
        scale={[body.radius * 3, body.radius * 0.5, body.radius * 3]} 
        size={6} 
        speed={0.2} 
        opacity={0.6} 
        color={body.color} 
        noise={1}
      />
      {/* Spiral Arms - Outer scattered stars */}
      <Sparkles 
        count={2000} 
        scale={[body.radius * 6, body.radius * 1, body.radius * 6]} 
        size={3} 
        speed={0.1} 
        opacity={0.4} 
        color="#ffffff" 
        noise={2}
      />
    </group>
  );
};

const BodyMesh: React.FC<{ body: CelestialBody, isSelected: boolean, onSelect: (body: CelestialBody) => void }> = ({ body, isSelected, onSelect }) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Group>(null);
  const [startAngle] = useState(Math.random() * Math.PI * 2);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    // Orbital Movement
    if (body.distance > 0) {
      const t = clock.getElapsedTime() * body.orbitSpeed * 0.1 + startAngle;
      const x = Math.cos(t) * body.distance;
      const z = Math.sin(t) * body.distance;
      groupRef.current.position.set(x, 0, z);
    }

    // Self Rotation (Visual only)
    if (meshRef.current) {
      meshRef.current.rotation.y += body.rotationSpeed;
    }
  });

  const renderVisuals = () => {
    if (body.type === 'galaxy') {
      return <GalaxyMesh body={body} />;
    }

    if (body.type === 'star') {
      return (
        <group ref={meshRef}>
          {/* Star Core */}
          <mesh>
            <sphereGeometry args={[body.radius, 32, 32]} />
            <meshBasicMaterial color={body.color} />
          </mesh>
          {/* Intense Glow */}
          <GlowingOrb color={body.color} scale={body.radius * 8} opacity={0.8} />
          {/* Secondary Halo */}
          <GlowingOrb color="#ffffff" scale={body.radius * 3} opacity={0.4} />
          
          {/* Real Light Source */}
          {body.id === 'sun' && <pointLight color={body.color} intensity={2.5} distance={2000} decay={1} />}
        </group>
      );
    }

    // Planets
    return (
      <group ref={meshRef}>
        {/* Planet Surface - Jewel Style */}
        <mesh>
          <sphereGeometry args={[body.radius, 64, 64]} />
          <meshStandardMaterial 
            color={body.color}
            roughness={0.3}     // Shiny
            metalness={0.4}     // Slightly metallic
            emissive={body.color}
            emissiveIntensity={0.6} // High neon glow to ensure visibility
          />
        </mesh>
        
        {/* Atmospheric Rim */}
        <mesh scale={[1.1, 1.1, 1.1]}>
          <sphereGeometry args={[body.radius, 32, 32]} />
          <meshBasicMaterial 
            color={body.color} 
            transparent 
            opacity={0.2} 
            side={THREE.BackSide} 
            blending={THREE.AdditiveBlending} 
          />
        </mesh>

        {/* Rings */}
        {body.hasRings && (
          <mesh rotation={[-Math.PI / 2.5, 0, 0]}>
            <ringGeometry args={[body.radius * 1.4, body.radius * 2.4, 64]} />
            <meshStandardMaterial 
              color={body.color} 
              side={THREE.DoubleSide} 
              transparent 
              opacity={0.5} 
              emissive={body.color}
              emissiveIntensity={0.3}
            />
          </mesh>
        )}
      </group>
    );
  };

  return (
    <group ref={groupRef}>
      <group 
        onClick={(e) => { e.stopPropagation(); onSelect(body); }}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
      >
        {body.type === 'planet' ? <Float speed={2} rotationIntensity={0.2} floatIntensity={2}>{renderVisuals()}</Float> : renderVisuals()}

        {/* Label */}
        <Billboard position={[0, body.radius * 1.5 + (body.type === 'galaxy' ? 10 : 2), 0]}>
          <Text
            fontSize={body.type === 'galaxy' ? 20 : (body.type === 'star' ? 10 : 4)}
            color={isSelected ? "#ffffff" : body.color}
            anchorX="center"
            anchorY="bottom"
            outlineWidth={body.type === 'planet' ? 0.2 : 0}
            outlineColor="#000000"
          >
            {body.displayName}
          </Text>
        </Billboard>

        {/* Selection Indicator */}
        {isSelected && (
           <mesh>
             <ringGeometry args={[body.radius * 1.8, body.radius * 1.9, 64]} />
             <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} transparent opacity={0.8} />
             <Billboard>
                <mesh>
                   {/* Billboard wrapper ensures ring faces camera if needed, or use simple ring */}
                </mesh>
             </Billboard>
           </mesh>
        )}
      </group>

      {/* Orbit Line */}
      {body.distance > 0 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-body.distance, 0, 0]}>
           <ringGeometry args={[body.distance - 0.2, body.distance + 0.2, 128]} />
           <meshBasicMaterial color={body.color} transparent opacity={0.15} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
        </mesh>
      )}
    </group>
  );
};

// --- Main Scene ---

export const SpaceView: React.FC<SpaceViewProps> = ({ onSelect, selectedId }) => {
  return (
    <Canvas 
      camera={{ position: [0, 80, 250], fov: 45, far: 50000 }} 
      dpr={[1, 2]}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
    >
      <Suspense fallback={null}>
        <color attach="background" args={['#050a14']} />
        
        {/* Cinematic Fog */}
        <fog attach="fog" args={['#050a14', 500, 5000]} />

        {/* Lights */}
        <ambientLight intensity={0.5} color="#0d1b2a" />
        <pointLight position={[0, 100, 0]} intensity={1} color="#4444ff" distance={1000} />

        {/* Background Stars */}
        <Stars radius={300} depth={100} count={5000} factor={4} saturation={0} fade speed={0.5} />
        
        {/* Horizon Grid (Star Walk style) */}
        <gridHelper args={[5000, 40, 0x112240, 0x050a14]} position={[0, -50, 0]} />

        {/* Celestial Bodies */}
        <group>
          {CELESTIAL_DATA.map((body) => (
              <BodyMesh 
                key={body.id} 
                body={body} 
                isSelected={selectedId === body.id}
                onSelect={onSelect} 
              />
          ))}
        </group>

        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          maxDistance={3000} 
          minDistance={10}
          zoomSpeed={0.8}
          rotateSpeed={0.5}
        />
      </Suspense>
    </Canvas>
  );
};
