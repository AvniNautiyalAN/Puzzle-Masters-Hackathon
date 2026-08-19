// src/components/3d/ZombieCharacter3D.jsx
import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

import walkerImg from "../../assets/characters/zombie_walker.png";
import screamerImg from "../../assets/characters/zombie_screamer.png";
import bruteImg from "../../assets/characters/zombie_brute.png";
import bossImg from "../../assets/characters/zombie_boss.png";
import { createDeterministicPoints } from "../../utils/mathUtils";

export default function ZombieCharacter3D({
  zombieType = "walker",
  battleState = "ready",
  isHit = false,
  isDead = false,
}) {
  const groupRef = useRef();
  const meshRef = useRef();
  const auraLightRef = useRef();
  const ashParticlesRef = useRef();

  // Load textures
  const walkerTex = useLoader(THREE.TextureLoader, walkerImg);
  const screamerTex = useLoader(THREE.TextureLoader, screamerImg);
  const bruteTex = useLoader(THREE.TextureLoader, bruteImg);
  const bossTex = useLoader(THREE.TextureLoader, bossImg);

  const activeTexture =
    zombieType === "screamer"
      ? screamerTex
      : zombieType === "brute"
      ? bruteTex
      : zombieType === "professor"
      ? bossTex
      : walkerTex;

  const isBoss = zombieType === "professor";
  const isBrute = zombieType === "brute";
  const isScreamer = zombieType === "screamer";

  const baseScale = isBoss ? 3.8 : isBrute ? 3.3 : isScreamer ? 2.6 : 2.7;
  const baseY = isBoss ? 1.85 : isBrute ? 1.65 : 1.35;

  const animTime = useRef(0);
  const attackTimer = useRef(0);
  const hitTimer = useRef(0);
  const deathTimer = useRef(0);

  // Dissolve Ash Particles on Death
  const ashCount = 35;
  const [ashPositions] = useMemo(() => {
    return [createDeterministicPoints(ashCount, 1.5, 2.5, 1.5, 0)];
  }, [ashCount]);

  useFrame((state, delta) => {
    animTime.current += delta;
    const t = animTime.current;

    if (!groupRef.current) return;

    let targetX = 3.2;
    let targetY = baseY;
    let targetZ = 0;
    let targetRotZ = 0;
    let targetRotY = -0.15;
    let currentScale = baseScale;
    let opacity = 1.0;

    // DEATH ANIMATION
    if (isDead) {
      deathTimer.current = Math.min(2.5, deathTimer.current + delta);
      const prog = deathTimer.current;
      targetY = baseY - Math.min(baseY - 0.3, prog * 1.2);
      targetRotZ = Math.PI / 2.3;
      targetX += 0.5;
      opacity = Math.max(0, 1.0 - (prog - 0.5) * 0.7);

      if (ashParticlesRef.current) {
        const posAttr = ashParticlesRef.current.geometry.attributes.position;
        for (let i = 0; i < ashCount; i++) {
          posAttr.setY(i, posAttr.getY(i) + delta * 1.5);
          posAttr.setX(i, posAttr.getX(i) + Math.sin(t * 3 + i) * delta * 0.5);
        }
        ashParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }
    } else {
      deathTimer.current = 0;

      // HIT REACTION
      if (isHit || battleState === "player-attack" || battleState === "ultimate") {
        hitTimer.current = Math.min(1.0, hitTimer.current + delta * 4);
        const hitProg = Math.sin(hitTimer.current * Math.PI);
        targetX += hitProg * (battleState === "ultimate" ? 0.9 : 0.45);
        targetRotZ -= hitProg * 0.2;
        if (meshRef.current?.material) {
          meshRef.current.material.color.setRGB(1.0, 1.0 - hitProg * 0.7, 1.0 - hitProg * 0.7);
        }
      } else {
        hitTimer.current = 0;
        if (meshRef.current?.material) {
          meshRef.current.material.color.setRGB(1.0, 1.0, 1.0);
        }
      }

      // ATTACK LUNGE ANIMATION
      if (battleState === "zombie-attack") {
        attackTimer.current += delta * 4;
        const attackProgress = Math.sin(Math.min(Math.PI, attackTimer.current));
        targetX -= attackProgress * 4.2;
        targetY += Math.sin(attackProgress * Math.PI) * 0.3;
        targetRotZ -= attackProgress * 0.25;
      } else {
        attackTimer.current = 0;

        if (isScreamer) {
          targetY += Math.sin(t * 7) * 0.04;
          targetRotZ += Math.sin(t * 10) * 0.03;
        } else if (isBoss) {
          targetY += Math.sin(t * 1.8) * 0.06;
          targetRotZ += Math.cos(t * 1.2) * 0.02;
          if (auraLightRef.current) {
            auraLightRef.current.intensity = 3.5 + Math.sin(t * 5) * 1.2;
          }
        } else if (isBrute) {
          targetY += Math.sin(t * 2.0) * 0.05;
          targetRotZ += Math.sin(t * 1.5) * 0.03;
        } else {
          targetY += Math.sin(t * 2.5) * 0.035;
          targetRotZ += Math.sin(t * 2.0) * 0.04;
        }
      }
    }

    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, delta * 12);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, delta * 12);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, delta * 12);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetRotZ, delta * 12);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, delta * 12);
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, currentScale, delta * 8));

    if (meshRef.current?.material) {
      meshRef.current.material.opacity = opacity;
    }
  });

  const auraColor = isBoss ? "#c084fc" : isBrute ? "#22c55e" : isScreamer ? "#ef4444" : "#eab308";

  return (
    <group ref={groupRef} position={[3.2, baseY, 0]}>
      {/* Ground Contact Shadow */}
      <mesh position={[0, -baseY + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[isBoss ? 0.9 : isBrute ? 0.75 : 0.55, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.5} />
      </mesh>

      {/* 3D Zombie Billboard Sprite */}
      <mesh ref={meshRef} castShadow>
        <planeGeometry args={[1.5, 2.0]} />
        <meshStandardMaterial
          map={activeTexture}
          transparent
          alphaTest={0.1}
          roughness={0.85}
          metalness={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Characteristic Aura Glow Light */}
      <pointLight
        ref={auraLightRef}
        position={[0, 0.4, 0.5]}
        color={auraColor}
        distance={isBoss ? 8 : 5}
        intensity={isBoss ? 3.5 : isBrute ? 2.5 : 1.8}
        decay={2}
      />

      {/* Rim Light for Dramatic Atmosphere */}
      <pointLight position={[1.2, 0.6, -0.6]} color="#10b981" distance={4} intensity={1.5} />

      {/* Death Dissolve Particles */}
      {isDead && (
        <points ref={ashParticlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={ashCount}
              array={ashPositions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.16}
            color={auraColor}
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
    </group>
  );
}
