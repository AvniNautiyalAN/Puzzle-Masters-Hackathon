// src/components/3d/BattleCanvas.jsx
import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

import PostApocalypticCity from "./PostApocalypticCity";
import SurvivorCharacter3D from "./SurvivorCharacter3D";
import ZombieCharacter3D from "./ZombieCharacter3D";
import CombatVFX from "./CombatVFX";

// Camera Controller with Screen Shake & Cinematic Tracking
function CameraRig({ battleState, isBoss }) {
  const shakeIntensity = useRef(0);

  useEffect(() => {
    if (battleState === "player-attack") {
      shakeIntensity.current = 0.18;
    } else if (battleState === "zombie-attack") {
      shakeIntensity.current = isBoss ? 0.45 : 0.3;
    } else if (battleState === "ultimate") {
      shakeIntensity.current = 0.55;
    }
  }, [battleState, isBoss]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const cam = state.camera;

    let targetX = Math.sin(t * 0.4) * 0.3;
    let targetY = 1.9 + Math.cos(t * 0.3) * 0.1;
    let targetZ = isBoss ? 8.2 : 7.2;

    if (battleState === "ultimate") {
      targetZ = 6.2;
      targetY = 1.7;
    } else if (battleState === "boss-intro") {
      targetX = 1.5;
      targetZ = 6.5;
    }

    if (shakeIntensity.current > 0.005) {
      targetX += Math.sin(t * 50) * shakeIntensity.current * 1.5;
      targetY += Math.cos(t * 60) * shakeIntensity.current * 1.5;
      shakeIntensity.current = THREE.MathUtils.lerp(shakeIntensity.current, 0, delta * 8);
    }

    cam.position.x = THREE.MathUtils.lerp(cam.position.x, targetX, delta * 6);
    cam.position.y = THREE.MathUtils.lerp(cam.position.y, targetY, delta * 6);
    cam.position.z = THREE.MathUtils.lerp(cam.position.z, targetZ, delta * 6);
    cam.lookAt(0, 1.4, 0);
  });

  return null;
}

export default function BattleCanvas({
  battleState = "ready",
  zombieType = "walker",
  isZombieHit = false,
  isPlayerHit = false,
  isZombieDead = false,
  damageEvents = [],
  onRemoveDamageEvent,
}) {
  const isBoss = zombieType === "professor";

  return (
    <div style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
      <Canvas
        shadows
        camera={{ position: [0, 2.0, 7.5], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor("#070a0d");
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1;
        }}
      >
        {/* Post-Apocalyptic Volumetric Distance Fog */}
        <fog attach="fog" args={["#080c10", 6, 26]} />

        {/* Global Dark Ambient Lighting */}
        <ambientLight intensity={0.55} color="#475569" />

        {/* Moon / Storm Overhead Key Light */}
        <directionalLight
          position={[-6, 12, 6]}
          intensity={1.2}
          color="#93c5fd"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0001}
        />

        {/* Warm Low Atmospheric Fill Light */}
        <directionalLight position={[6, 3, -4]} intensity={0.4} color="#f97316" />

        {/* Camera Motion & Impact Shake Rig */}
        <CameraRig battleState={battleState} isBoss={isBoss} />

        {/* 3D Ruined City World */}
        <PostApocalypticCity />

        {/* 3D Survivor Character */}
        <SurvivorCharacter3D battleState={battleState} isHit={isPlayerHit} />

        {/* 3D Zombie / Boss Character */}
        <ZombieCharacter3D
          zombieType={zombieType}
          battleState={battleState}
          isHit={isZombieHit}
          isDead={isZombieDead}
        />

        {/* 3D Combat Visual Effects (Tracers, Sparks, Floating Damage) */}
        <CombatVFX
          battleState={battleState}
          damageEvents={damageEvents}
          onRemoveDamageEvent={onRemoveDamageEvent}
        />
      </Canvas>
    </div>
  );
}
