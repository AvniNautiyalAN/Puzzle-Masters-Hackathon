// src/components/3d/SurvivorCharacter3D.jsx
import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import survivorImg from "../../assets/characters/survivor.png";
import { createDeterministicPoints } from "../../utils/mathUtils";

export default function SurvivorCharacter3D({ battleState = "ready", isHit = false }) {
  const groupRef = useRef();
  const meshRef = useRef();
  const muzzleLightRef = useRef();
  const auraRef = useRef();

  // Load survivor texture safely
  const texture = useLoader(THREE.TextureLoader, survivorImg);

  // Custom animation state trackers
  const animTime = useRef(0);
  const recoilTimer = useRef(0);
  const hitTimer = useRef(0);

  // Aura particles for Ultimate
  const auraCount = 25;
  const [auraPositions] = useMemo(() => {
    return [createDeterministicPoints(auraCount, 1.2, 2.2, 1.2, 0)];
  }, [auraCount]);

  useFrame((state, delta) => {
    animTime.current += delta;
    const t = animTime.current;

    if (!groupRef.current) return;

    let targetX = -3.2;
    let targetY = 1.35;
    let targetZ = 0;
    let targetRotZ = 0;
    let targetRotY = 0.15; // slight angle toward zombie
    let targetScale = 2.7;

    // Muzzle Flash default off
    if (muzzleLightRef.current) {
      muzzleLightRef.current.intensity = THREE.MathUtils.lerp(
        muzzleLightRef.current.intensity,
        0,
        delta * 20
      );
    }

    // Hit flash reaction
    if (isHit || battleState === "zombie-attack") {
      hitTimer.current = Math.min(1.0, hitTimer.current + delta * 3);
      const hitProg = Math.sin(hitTimer.current * Math.PI);
      targetX -= hitProg * 0.4;
      targetRotZ += hitProg * 0.15;
      if (meshRef.current?.material) {
        meshRef.current.material.color.setRGB(1.0, 1.0 - hitProg * 0.6, 1.0 - hitProg * 0.6);
      }
    } else {
      hitTimer.current = 0;
      if (meshRef.current?.material) {
        meshRef.current.material.color.setRGB(1.0, 1.0, 1.0);
      }
    }

    // STATE-SPECIFIC ANIMATIONS
    if (battleState === "player-attack") {
      recoilTimer.current += delta * 8;
      const recoil = Math.sin(Math.min(Math.PI, recoilTimer.current)) * 0.35;
      targetX -= recoil;
      targetRotZ += recoil * 0.2;
      if (muzzleLightRef.current && recoilTimer.current < 0.4) {
        muzzleLightRef.current.intensity = 5.0;
      }
    } else {
      recoilTimer.current = 0;
    }

    if (battleState === "ultimate") {
      targetY += 0.4 + Math.sin(t * 8) * 0.1;
      targetScale = 2.9;
      if (auraRef.current) {
        auraRef.current.rotation.y += delta * 4;
      }
    } else if (battleState === "victory") {
      targetY += Math.sin(t * 4) * 0.08;
      targetRotZ = -0.05;
    } else if (battleState === "game-over") {
      targetY = 0.4;
      targetRotZ = -Math.PI / 2.5;
      targetX = -3.6;
    } else {
      // Normal Idle Breathing Cycle
      const breath = Math.sin(t * 2.5) * 0.04;
      targetY += breath;
      targetRotZ += Math.cos(t * 1.5) * 0.015;
    }

    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, delta * 12);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, delta * 12);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, delta * 12);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetRotZ, delta * 12);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, delta * 12);
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, delta * 10));
  });

  return (
    <group ref={groupRef} position={[-3.2, 1.35, 0]}>
      {/* Ground Contact Shadow */}
      <mesh position={[0, -1.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.45} />
      </mesh>

      {/* 3D Character Sprite Mesh */}
      <mesh ref={meshRef} castShadow>
        <planeGeometry args={[1.5, 2.0]} />
        <meshStandardMaterial
          map={texture}
          transparent
          alphaTest={0.1}
          roughness={0.8}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Gun Muzzle Point & Dynamic Flash Light */}
      <pointLight
        ref={muzzleLightRef}
        position={[0.7, 0.25, 0.2]}
        color="#ffeedd"
        distance={6}
        decay={2}
        intensity={0}
      />

      {/* Ultimate Energy Aura (shown during Ultimate) */}
      {battleState === "ultimate" && (
        <group ref={auraRef}>
          <points>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={auraCount}
                array={auraPositions}
                itemSize={3}
              />
            </bufferGeometry>
            <pointsMaterial
              size={0.18}
              color="#38bdf8"
              transparent
              opacity={0.85}
              blending={THREE.AdditiveBlending}
            />
          </points>
          <pointLight position={[0, 0, 0]} color="#38bdf8" distance={5} intensity={3.5} />
        </group>
      )}

      {/* Survivor Back Rim Light for Cinematic Contrast */}
      <pointLight position={[-0.8, 0.5, -0.6]} color="#60a5fa" distance={3.5} intensity={1.2} />
    </group>
  );
}
