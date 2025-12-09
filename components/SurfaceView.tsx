
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, Stars, Cloud, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { PlanetData } from '../types';

interface SurfaceViewProps {
  planet: PlanetData;
}

// --- Procedural Noise Helpers ---

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (t: number, a: number, b: number) => a + t * (b - a);

const grad = (hash: number, x: number, y: number, z: number) => {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
};

const p = new Uint8Array(512);
const perm = new Array(512);
for(let i=0; i<256; i++) p[i] = i;
for(let i=0; i<256; i++) {
   const r = Math.floor(Math.random() * 256);
   const t = p[i]; p[i] = p[r]; p[r] = t;
}
for(let i=0; i<512; i++) perm[i] = p[i & 255];

const perlin = (x: number, y: number, z: number) => {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    const u = fade(x);
    const v = fade(y);
    const w = fade(z);
    const A = perm[X] + Y, AA = perm[A] + Z, AB = perm[A + 1] + Z;
    const B = perm[X + 1] + Y, BA = perm[B] + Z, BB = perm[B + 1] + Z;

    return lerp(w, lerp(v, lerp(u, grad(perm[AA], x, y, z),
                                   grad(perm[BA], x - 1, y, z)),
                           lerp(u, grad(perm[AB], x, y - 1, z),
                                   grad(perm[BB], x - 1, y - 1, z))),
                   lerp(v, lerp(u, grad(perm[AA + 1], x, y, z - 1),
                                   grad(perm[BA + 1], x - 1, y, z - 1)),
                           lerp(u, grad(perm[AB + 1], x, y - 1, z - 1),
                                   grad(perm[BB + 1], x - 1, y - 1, z - 1))));
};

// --- Planet Specific Logic ---

const getPlanetHeight = (x: number, z: number, planet: PlanetData) => {
  let height = 0;

  // 1. Gas/Ice Giants: Wavy cloud ocean
  if (planet.type === 'gas' || planet.type === 'ice') {
      // Just a base shape, animation is handled in shader/useFrame
      return perlin(x * 0.01, 0, z * 0.01) * 5; 
  }

  // 2. Mercury: Craters (Inverted peaks) + Roughness
  if (planet.id === 'mercury') {
      // Large shapes
      let h = perlin(x * 0.02, 0, z * 0.02);
      // Crater-like effect: Sharp ridges
      h = 1 - Math.abs(h); 
      h = h * h * 15; // Spikey rims
      height += h;
      // Rough detail
      height += perlin(x * 0.1, 0, z * 0.1) * 2;
      return height;
  }

  // 3. Venus: Rolling Volcanic Plains (Smoother)
  if (planet.id === 'venus') {
      height += perlin(x * 0.005, 0, z * 0.005) * 20; // Large rolling hills
      height += perlin(x * 0.02, 0, z * 0.02) * 5; // Smaller features
      // Flatten valleys (lava plains)
      if (height < 5) height = height * 0.5;
      return height;
  }

  // 4. Earth: Mountains and Valleys
  if (planet.id === 'earth') {
      // Big mountains
      let m = perlin(x * 0.008, 0, z * 0.008);
      m = Math.abs(m) * 35; // Sharp peaks
      height += m;
      
      // Detail
      height += perlin(x * 0.05, 0, z * 0.05) * 2;
      
      // Water level flattening (Simulated ocean floor/coast)
      if (height < 3) height = 1; 
      
      return height;
  }

  // 5. Mars: Dusty Plains + Rocks (Existing Logic)
  if (planet.id === 'mars') {
      height += perlin(x * 0.01, 0, z * 0.01) * 12;
      height += perlin(x * 0.05, 0, z * 0.05) * 2;
      if (height < 2) height = height * 0.2; // Flatten valleys
      height += Math.random() * 0.1; 
      return height;
  }

  // Default Rock (Generic)
  height += perlin(x * 0.01, 0, z * 0.01) * 10;
  return height;
};

// Determine Vertex Color based on Height and Planet ID
const getPlanetColor = (height: number, x: number, z: number, planet: PlanetData): THREE.Color => {
    const c = new THREE.Color();

    if (planet.type === 'gas' || planet.type === 'ice') {
        // Simple variation for clouds
        const noise = perlin(x * 0.05, 0, z * 0.05);
        c.set(planet.surfaceColor || planet.color);
        c.offsetHSL(0, 0, noise * 0.1);
        return c;
    }

    if (planet.id === 'mercury') {
        // Grey variations
        const noise = perlin(x*0.1, 0, z*0.1);
        c.set('#5c5c5c');
        // Darker lowlands, lighter rims
        const val = (height / 20) + (noise * 0.2);
        c.offsetHSL(0, 0, val * 0.2); 
        return c;
    }

    if (planet.id === 'venus') {
        // Volcanic rock
        c.set('#3d1e08'); // Dark rock
        // Higher = Hotter/Brighter? Or lighter rock?
        // Let's make lowlands darker, highlands lighter brown
        c.lerp(new THREE.Color('#8B4513'), Math.min(1, height / 20));
        return c;
    }

    if (planet.id === 'earth') {
        if (height <= 1.5) {
            // "Water/Sand" line
            return new THREE.Color('#C2B280'); // Sand
        } else if (height < 15) {
            // Grass/Dirt
            c.set('#2d4c1e');
            // Vary grass color
            const n = perlin(x*0.1, 0, z*0.1);
            c.offsetHSL(0.1 * n, 0, 0);
            return c;
        } else if (height < 25) {
            // Rock
            return new THREE.Color('#666666');
        } else {
            // Snow
            return new THREE.Color('#ffffff');
        }
    }

    if (planet.id === 'mars') {
        c.set('#8a3b1c'); // Rust
        const n = perlin(x*0.2, 0, z*0.2);
        c.offsetHSL(0.02 * n, 0, n * 0.05); // Subtle variation
        return c;
    }

    c.set(planet.surfaceColor || planet.color);
    return c;
}

// --- Components ---

const SunInSky = ({ color, type }: { color: string, type: string }) => {
  if (type === 'gas') return null;
  return (
    <group position={[100, 30, -100]}>
      <mesh>
        <circleGeometry args={[8, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <sprite scale={[60, 60, 1]}>
        <spriteMaterial 
          map={new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/glow.png')} 
          color={color} 
          blending={THREE.AdditiveBlending}
          opacity={0.6}
        />
      </sprite>
    </group>
  )
}

const RealisticGround = ({ planet }: { planet: PlanetData }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    
    // Create geometry with vertex colors enabled
    const geometry = useMemo(() => {
        const geo = new THREE.PlaneGeometry(400, 400, 200, 200);
        // Add color attribute
        const count = geo.attributes.position.count;
        geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
        return geo;
    }, []);

    useEffect(() => {
        if (!meshRef.current) return;
        
        const posAttribute = geometry.attributes.position;
        const colorAttribute = geometry.attributes.color;
        
        for (let i = 0; i < posAttribute.count; i++) {
            const x = posAttribute.getX(i);
            const y = posAttribute.getY(i);
            const worldX = x;
            const worldZ = -y; 

            const height = getPlanetHeight(worldX, worldZ, planet);
            
            // Set Height
            posAttribute.setZ(i, height);

            // Set Color
            const c = getPlanetColor(height, worldX, worldZ, planet);
            colorAttribute.setXYZ(i, c.r, c.g, c.b);
        }

        geometry.computeVertexNormals();
        posAttribute.needsUpdate = true;
        colorAttribute.needsUpdate = true;
    }, [planet, geometry]);

    // Gas Giant Animation
    useFrame(({ clock }) => {
        if ((planet.type === 'gas' || planet.type === 'ice') && meshRef.current) {
            const time = clock.getElapsedTime();
            const pos = meshRef.current.geometry.attributes.position;
            for(let i=0; i<pos.count; i++){
                 const x = pos.getX(i);
                 const y = pos.getY(i);
                 // Rolling waves
                 const wave = Math.sin(x * 0.02 + time * 0.3) * Math.cos(y * 0.02 + time * 0.2) * 6;
                 pos.setZ(i, wave);
            }
            pos.needsUpdate = true;
            meshRef.current.geometry.computeVertexNormals();
        }
    });

    return (
        <mesh 
            ref={meshRef} 
            geometry={geometry}
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[0, -2, 0]} 
            receiveShadow
            castShadow
        >
            {planet.type === 'gas' || planet.type === 'ice' ? (
                <meshStandardMaterial 
                    vertexColors
                    roughness={0.1}
                    metalness={0.6}
                    transparent
                    opacity={0.9}
                />
            ) : (
                <meshStandardMaterial 
                    vertexColors
                    roughness={0.9}
                    metalness={0.1}
                />
            )}
        </mesh>
    );
}

const Rocks = ({ planet, count, minSize, maxSize, spread }: any) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    
    // Determine Rock Color based on Planet
    const rockColor = useMemo(() => {
        if (planet.id === 'mercury') return new THREE.Color('#444444');
        if (planet.id === 'venus') return new THREE.Color('#221100');
        if (planet.id === 'earth') return new THREE.Color('#555555');
        return new THREE.Color(planet.surfaceColor || planet.color).multiplyScalar(0.7); // Darker version of ground
    }, [planet]);

    useEffect(() => {
        if (!meshRef.current) return;
        if (planet.type === 'gas' || planet.type === 'ice') return; // No rocks on gas giants

        let finalCount = count;
        // Adjust density per planet
        if (planet.id === 'venus') finalCount = count * 0.3; // Less rocks, more plates
        if (planet.id === 'mercury') finalCount = count * 1.5; // Debris field

        for (let i = 0; i < finalCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.sqrt(Math.random()) * spread; 
            const x = Math.cos(angle) * r;
            const z = Math.sin(angle) * r;
            
            const y = getPlanetHeight(x, z, planet);
            
            // Do not place rocks underwater on Earth
            if (planet.id === 'earth' && y < 1.5) {
                dummy.scale.set(0,0,0);
            } else {
                dummy.position.set(x, y, z);
                dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                const s = minSize + Math.random() * (maxSize - minSize);
                dummy.scale.set(s, s * 0.8, s); 
            }
            
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [planet, count, minSize, maxSize, spread, dummy]);

    if (planet.type === 'gas' || planet.type === 'ice') return null;

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={rockColor} roughness={0.9} />
        </instancedMesh>
    );
}

// --- Player ---

const usePlayerControls = () => {
  const [movement, setMovement] = useState({
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    sprint: false
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowUp': case 'KeyW': setMovement((m) => ({ ...m, moveForward: true })); break;
        case 'ArrowLeft': case 'KeyA': setMovement((m) => ({ ...m, moveLeft: true })); break;
        case 'ArrowDown': case 'KeyS': setMovement((m) => ({ ...m, moveBackward: true })); break;
        case 'ArrowRight': case 'KeyD': setMovement((m) => ({ ...m, moveRight: true })); break;
        case 'ShiftLeft': case 'ShiftRight': setMovement((m) => ({ ...m, sprint: true })); break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowUp': case 'KeyW': setMovement((m) => ({ ...m, moveForward: false })); break;
        case 'ArrowLeft': case 'KeyA': setMovement((m) => ({ ...m, moveLeft: false })); break;
        case 'ArrowDown': case 'KeyS': setMovement((m) => ({ ...m, moveBackward: false })); break;
        case 'ArrowRight': case 'KeyD': setMovement((m) => ({ ...m, moveRight: false })); break;
        case 'ShiftLeft': case 'ShiftRight': setMovement((m) => ({ ...m, sprint: false })); break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return movement;
};

const Player = ({ speed = 10, planet }: { speed?: number, planet: PlanetData }) => {
  const { camera } = useThree();
  const { moveForward, moveBackward, moveLeft, moveRight, sprint } = usePlayerControls();
  const direction = useRef(new THREE.Vector3());
  
  useFrame((state, delta) => {
    const currentSpeed = sprint ? speed * 2.5 : speed;

    direction.current.z = Number(moveForward) - Number(moveBackward);
    direction.current.x = Number(moveRight) - Number(moveLeft);
    direction.current.normalize();

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    if (moveForward) camera.position.add(forward.multiplyScalar(currentSpeed * delta));
    if (moveBackward) camera.position.add(forward.multiplyScalar(-currentSpeed * delta));
    if (moveRight) camera.position.add(right.multiplyScalar(currentSpeed * delta));
    if (moveLeft) camera.position.add(right.multiplyScalar(-currentSpeed * delta));
    
    // Terrain Following
    let targetHeight = 0;
    if (planet.type === 'gas' || planet.type === 'ice') {
        // Float on gas
        const wave = Math.sin(camera.position.x * 0.02 + state.clock.getElapsedTime() * 0.3) * Math.cos(camera.position.z * 0.02 + state.clock.getElapsedTime() * 0.2) * 6;
        targetHeight = wave + 15; // Hover higher above clouds
    } else {
        const terrainHeight = getPlanetHeight(camera.position.x, camera.position.z, planet);
        targetHeight = terrainHeight + 2; 
    }
    
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetHeight, 0.1);

    // Walk Bob
    if (moveForward || moveBackward || moveLeft || moveRight) {
        camera.position.y += Math.sin(state.clock.getElapsedTime() * 12) * 0.05;
    }
  });

  return null;
};

// --- Main Component ---

export const SurfaceView: React.FC<SurfaceViewProps> = ({ planet }) => {
  return (
    <Canvas shadows camera={{ position: [0, 4, 0], fov: 60 }}>
      <color attach="background" args={[planet.atmosphereColor || '#000000']} />
      {/* Dynamic fog distance based on planet atmosphere density */}
      <fog attach="fog" args={[planet.atmosphereColor || '#000000', 10, planet.id === 'venus' ? 40 : (planet.type === 'gas' ? 80 : 150)]} />

      <ambientLight intensity={planet.type === 'gas' ? 0.6 : 0.2} />
      <directionalLight 
        position={[100, 50, -50]} 
        intensity={planet.id === 'mercury' ? 3 : 1.5} 
        color={planet.id === 'earth' ? "#ffeebb" : "#ffffff"}
        castShadow 
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      
      <SunInSky color={planet.atmosphereColor || '#000000'} type={planet.type} />
      
      {(planet.atmosphereColor || '#000000') === '#000000' && (
          <Stars count={5000} fade opacity={0.8} />
      )}

      {/* The Ground */}
      <RealisticGround planet={planet} />
      
      {/* Rocks - Only for rocky planets */}
      {planet.type === 'rocky' && (
        <>
            <Rocks 
                planet={planet} 
                count={3000} 
                minSize={0.05} 
                maxSize={0.2} 
                spread={150} 
            />
            <Rocks 
                planet={planet} 
                count={150} 
                minSize={0.5} 
                maxSize={2.5} 
                spread={180} 
            />
        </>
      )}

      {/* Atmospheric Particles */}
      {planet.id !== 'mercury' && (
           <Sparkles 
            count={1000} 
            scale={120} 
            size={4} 
            speed={0.2} 
            opacity={0.3} 
            color="#fff" 
            position={[0, 5, 0]}
          />
      )}

      {/* Floating Gas Layers for Giants */}
      {planet.type === 'gas' && (
         <group>
             <Cloud position={[0, -10, 0]} opacity={0.8} speed={0.5} width={200} depth={50} segments={40} color={planet.color} />
             <Cloud position={[0, 40, 0]} opacity={0.3} speed={0.8} width={200} depth={50} segments={40} color="#ffffff" />
         </group>
      )}

      <Player speed={8} planet={planet} />
      <PointerLockControls />
    </Canvas>
  );
};
