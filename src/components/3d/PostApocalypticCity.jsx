// src/components/3d/PostApocalypticCity.jsx
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createDeterministicPoints } from "../../utils/mathUtils";

// Burning barrel with dynamic flickering fire and rising sparks
function BurningBarrel({ position, color = "#ff5500" }) {
  const lightRef = useRef();
  const fireParticlesRef = useRef();

  const particleCount = 20;
  const [positions] = useMemo(() => {
    return [createDeterministicPoints(particleCount, 0.4, 1.2, 0.4, 0.8)];
  }, [particleCount]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (lightRef.current) {
      lightRef.current.intensity = 2.5 + Math.sin(time * 12 + position[0]) * 0.8 + Math.cos(time * 23) * 0.4;
    }
    if (fireParticlesRef.current) {
      const posAttr = fireParticlesRef.current.geometry.attributes.position;
      for (let i = 0; i < particleCount; i++) {
        let y = posAttr.getY(i) + delta * (1.2 + i * 0.05);
        if (y > 2.4) {
          y = 0.8;
          posAttr.setX(i, (Math.sin(time + i) * 0.5) * 0.4);
          posAttr.setZ(i, (Math.cos(time + i) * 0.5) * 0.4);
        }
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group position={position}>
      {/* Rusty Oil Drum */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.4, 1.0, 16]} />
        <meshStandardMaterial color="#2d2218" roughness={0.9} metalness={0.4} />
      </mesh>
      {/* Barrel Rims */}
      <mesh position={[0, 0.75, 0]}>
        <torusGeometry args={[0.43, 0.03, 8, 16]} />
        <meshStandardMaterial color="#1a140e" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <torusGeometry args={[0.43, 0.03, 8, 16]} />
        <meshStandardMaterial color="#1a140e" roughness={0.8} />
      </mesh>

      {/* Fire Core */}
      <mesh position={[0, 1.05, 0]}>
        <coneGeometry args={[0.3, 0.6, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.85} />
      </mesh>

      {/* Dynamic Light */}
      <pointLight ref={lightRef} position={[0, 1.3, 0]} color={color} distance={8} decay={2} castShadow />

      {/* Rising Spark Particles */}
      <points ref={fireParticlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.12} color="#ffaa22" transparent opacity={0.9} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}

// Concrete ruined building block
function RuinedBuilding({ position, scale = [4, 14, 4], rotation = [0, 0, 0], color = "#1a1e22" }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Main Concrete Monolith */}
      <mesh position={[0, scale[1] / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={scale} />
        <meshStandardMaterial color={color} roughness={0.95} metalness={0.15} />
      </mesh>
      {/* Shattered Upper Section */}
      <mesh position={[0.4, scale[1] + 1.2, -0.3]} castShadow>
        <boxGeometry args={[scale[0] * 0.7, 2.5, scale[2] * 0.6]} />
        <meshStandardMaterial color="#14181c" roughness={0.9} />
      </mesh>
      {/* Exposed Rebar Girders */}
      <mesh position={[-scale[0] * 0.3, scale[1] + 1.8, scale[2] * 0.2]}>
        <cylinderGeometry args={[0.04, 0.04, 3.2, 6]} />
        <meshStandardMaterial color="#884422" roughness={0.7} metalness={0.8} />
      </mesh>
      <mesh position={[-scale[0] * 0.35, scale[1] + 1.5, scale[2] * 0.25]} rotation={[0.2, 0.3, 0.4]}>
        <cylinderGeometry args={[0.04, 0.04, 2.5, 6]} />
        <meshStandardMaterial color="#884422" roughness={0.7} metalness={0.8} />
      </mesh>

      {/* Broken Glowing Window Grids */}
      {Array.from({ length: 4 }).map((_, idx) => (
        <mesh key={idx} position={[0, (idx + 1) * 3, scale[2] / 2 + 0.02]}>
          <planeGeometry args={[scale[0] * 0.6, 1.2]} />
          <meshStandardMaterial
            color={idx % 2 === 0 ? "#112233" : "#221105"}
            roughness={0.3}
            emissive={idx === 1 ? "#ff6600" : "#003366"}
            emissiveIntensity={idx === 1 ? 0.35 : 0.15}
          />
        </mesh>
      ))}
    </group>
  );
}

// Streetlight tilted and damaged
function DamagedStreetLight({ position, rotation = [0, 0, 0.15] }) {
  const lightRef = useRef();

  useFrame((state) => {
    if (lightRef.current) {
      const t = state.clock.getElapsedTime();
      const flicker = Math.sin(t * 18) > 0.4 ? 1.2 : 0.85;
      lightRef.current.intensity = flicker;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Base & Pole */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 5.0, 8]} />
        <meshStandardMaterial color="#262c30" metalness={0.8} roughness={0.5} />
      </mesh>
      {/* Top Arm */}
      <mesh position={[0.6, 4.8, 0]} rotation={[0, 0, -Math.PI / 3]}>
        <cylinderGeometry args={[0.06, 0.06, 1.5, 8]} />
        <meshStandardMaterial color="#262c30" metalness={0.8} roughness={0.5} />
      </mesh>
      {/* Lamp Head */}
      <mesh position={[1.1, 4.3, 0]}>
        <boxGeometry args={[0.5, 0.15, 0.3]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Glowing Bulb */}
      <mesh position={[1.1, 4.2, 0]}>
        <boxGeometry args={[0.4, 0.05, 0.2]} />
        <meshBasicMaterial color="#ffea88" />
      </mesh>
      {/* Flickering Spot/Point Light */}
      <pointLight ref={lightRef} position={[1.1, 3.8, 0]} color="#ffe066" distance={9} decay={2} />
    </group>
  );
}

// Atmospheric Drifting Embers & Dust Cloud
function AtmosphericEmbers() {
  const pointsRef = useRef();
  const count = 120;

  const [positions] = useMemo(() => {
    return [createDeterministicPoints(count, 30, 10, 20, 0)];
  }, [count]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      const posAttr = pointsRef.current.geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        let x = posAttr.getX(i) + delta * 0.3;
        let y = posAttr.getY(i) + delta * 0.15;
        if (x > 15) x = -15;
        if (y > 10) y = 0.2;
        posAttr.setX(i, x);
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.14}
        color="#ff7722"
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function PostApocalypticCity() {
  return (
    <group>
      {/* Main Road Surface */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[36, 0.1, 24]} />
        <meshStandardMaterial color="#131718" roughness={0.96} metalness={0.1} />
      </mesh>

      {/* Broken Road Lane Stripes */}
      {[-10, -5, 0, 5, 10].map((x) => (
        <mesh key={x} position={[x, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[2.5, 0.25]} />
          <meshStandardMaterial color="#4a4220" roughness={0.9} transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Left Sidewalk & Rubble Curb */}
      <mesh position={[0, 0.08, -6.5]} receiveShadow>
        <boxGeometry args={[36, 0.25, 4]} />
        <meshStandardMaterial color="#212629" roughness={0.95} />
      </mesh>

      {/* Front Road Curb */}
      <mesh position={[0, 0.08, 6.5]} receiveShadow>
        <boxGeometry args={[36, 0.25, 4]} />
        <meshStandardMaterial color="#212629" roughness={0.95} />
      </mesh>

      {/* --- RUINED SKYSCRAPERS (BACKGROUND / DEPTH) --- */}
      <RuinedBuilding position={[-14, 0, -11]} scale={[7, 18, 6]} color="#171b1e" />
      <RuinedBuilding position={[-7, 0, -13]} scale={[6, 24, 7]} color="#121517" />
      <RuinedBuilding position={[0, 0, -14]} scale={[8, 20, 8]} color="#191e21" />
      <RuinedBuilding position={[8, 0, -12]} scale={[6, 26, 6]} color="#14171a" />
      <RuinedBuilding position={[15, 0, -10]} scale={[7, 17, 6]} color="#181c1f" />

      {/* Mid-ground Ruins (Flanks) */}
      <RuinedBuilding position={[-13, 0, -4]} scale={[4.5, 10, 4.5]} color="#22282c" />
      <RuinedBuilding position={[13, 0, -4]} scale={[4.5, 11, 4.5]} color="#22282c" />

      {/* Concrete Highway Barricades (Jersey Barriers) */}
      <mesh position={[-6.5, 0.45, -2.8]} rotation={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.9, 0.6]} />
        <meshStandardMaterial color="#33383d" roughness={0.9} />
      </mesh>
      <mesh position={[6.5, 0.45, -2.8]} rotation={[0, -0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.9, 0.6]} />
        <meshStandardMaterial color="#33383d" roughness={0.9} />
      </mesh>

      {/* Rubble Debris Piles */}
      {[-8, -3, 3, 8].map((x, i) => (
        <group key={i} position={[x + (i % 2) * 0.5, 0.2, -4.5 + (i % 3) * 0.4]}>
          <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
            <dodecahedronGeometry args={[0.4 + (i % 2) * 0.2, 0]} />
            <meshStandardMaterial color="#2d3236" roughness={0.98} />
          </mesh>
          <mesh castShadow position={[0.3, 0.05, 0.2]}>
            <boxGeometry args={[0.3, 0.2, 0.4]} />
            <meshStandardMaterial color="#222629" roughness={0.98} />
          </mesh>
        </group>
      ))}

      {/* Burning Oil Barrels with Dynamic Lighting */}
      <BurningBarrel position={[-5.5, 0, -2.2]} color="#ff5500" />
      <BurningBarrel position={[5.5, 0, -2.2]} color="#ff4400" />
      <BurningBarrel position={[-10.5, 0, 1.5]} color="#ff7711" />
      <BurningBarrel position={[10.5, 0, 1.5]} color="#ff6600" />

      {/* Broken Flickering Street Lights */}
      <DamagedStreetLight position={[-8.5, 0, -3.5]} rotation={[0, 0, 0.12]} />
      <DamagedStreetLight position={[8.5, 0, -3.5]} rotation={[0, Math.PI, -0.1]} />

      {/* Floating Embers & Ash System */}
      <AtmosphericEmbers />
    </group>
  );
}
