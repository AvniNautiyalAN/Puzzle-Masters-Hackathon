// src/components/3d/CombatVFX.jsx
import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

let _vfxIdCounter = 0;
function nextVfxId() {
  return ++_vfxIdCounter;
}

// Glowing bullet tracer projectile
function BulletTracer({ start = [-2.5, 1.35, 0.1], end = [2.6, 1.35, 0], onComplete }) {
  const meshRef = useRef();
  const progress = useRef(0);

  useFrame((state, delta) => {
    progress.current += delta * 5.5;
    const p = Math.min(1.0, progress.current);

    if (meshRef.current) {
      meshRef.current.position.x = THREE.MathUtils.lerp(start[0], end[0], p);
      meshRef.current.position.y = THREE.MathUtils.lerp(start[1], end[1], p);
      meshRef.current.position.z = THREE.MathUtils.lerp(start[2], end[2], p);
      meshRef.current.scale.set(1.0 + p * 0.5, 1.0, 1.0);
    }

    if (p >= 1.0) {
      onComplete?.();
    }
  });

  return (
    <group ref={meshRef} position={start}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
        <meshBasicMaterial color="#ffea77" />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 1.4, 8]} />
        <meshBasicMaterial color="#ff8800" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
      </mesh>
      <pointLight color="#ffcc33" distance={3} intensity={4} />
    </group>
  );
}

// Impact Spark / Blood Explosion — deterministic initial positions
function ImpactSparks({ position = [2.8, 1.35, 0], color = "#ff4400" }) {
  const pointsRef = useRef();
  const particleCount = 20;

  const { posArray, velArray } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = position[0];
      pos[i * 3 + 1] = position[1];
      pos[i * 3 + 2] = position[2];

      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 2.5 + (i % 5) * 0.8;
      vel[i * 3] = Math.cos(angle) * speed;
      vel[i * 3 + 1] = Math.abs(Math.sin(angle)) * speed + 1.0;
      vel[i * 3 + 2] = Math.sin(angle) * speed;
    }
    return { posArray: pos, velArray: vel };
  }, [position, particleCount]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      const posAttr = pointsRef.current.geometry.attributes.position;
      for (let i = 0; i < particleCount; i++) {
        posAttr.setX(i, posAttr.getX(i) + velArray[i * 3] * delta);
        posAttr.setY(i, posAttr.getY(i) + velArray[i * 3 + 1] * delta - 9.8 * delta * delta);
        posAttr.setZ(i, posAttr.getZ(i) + velArray[i * 3 + 2] * delta);
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={posArray}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color={color}
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Floating Damage / Status HTML Numbers in 3D Space
function FloatingDamageNumber({ text, position, isCritical, isPlayer, id, onRemove }) {
  const [offsetY, setOffsetY] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const start = performance.now();
    const interval = setInterval(() => {
      const elapsed = (performance.now() - start) / 1000;
      setOffsetY(elapsed * 1.8);
      setOpacity(Math.max(0, 1 - elapsed * 1.1));
      if (elapsed > 1.0) {
        clearInterval(interval);
        onRemove(id);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [id, onRemove]);

  return (
    <Html position={[position[0], position[1] + offsetY, position[2]]} center>
      <div
        style={{
          fontFamily: "'Orbitron', 'Impact', sans-serif",
          fontSize: isCritical ? "32px" : "24px",
          fontWeight: 900,
          color: isPlayer ? "#ef4444" : isCritical ? "#f59e0b" : "#ffffff",
          textShadow: isPlayer
            ? "0 0 10px #dc2626, 0 2px 4px #000"
            : isCritical
            ? "0 0 16px #d97706, 0 2px 6px #000"
            : "0 0 8px #06b6d4, 0 2px 4px #000",
          letterSpacing: "1px",
          transform: `scale(${isCritical ? 1.25 : 1.0})`,
          opacity: opacity,
          pointerEvents: "none",
          whiteSpace: "nowrap",
          userSelect: "none",
          transition: "opacity 0.05s linear",
        }}
      >
        {text}
      </div>
    </Html>
  );
}

// Ultimate Blast Sphere VFX
function UltimateVFX({ active }) {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (active && meshRef.current) {
      meshRef.current.scale.addScalar(delta * 12);
      if (meshRef.current.material) {
        meshRef.current.material.opacity = Math.max(0, meshRef.current.material.opacity - delta * 1.2);
      }
    } else if (meshRef.current) {
      meshRef.current.scale.set(0.1, 0.1, 0.1);
      if (meshRef.current.material) {
        meshRef.current.material.opacity = 0.95;
      }
    }
  });

  if (!active) return null;

  return (
    <group position={[1.5, 1.4, 0]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 24, 24]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.95} blending={THREE.AdditiveBlending} />
      </mesh>
      <pointLight color="#38bdf8" distance={15} intensity={8} />
    </group>
  );
}

export default function CombatVFX({
  battleState,
  damageEvents = [],
  onRemoveDamageEvent,
}) {
  const [tracers, setTracers] = useState([]);
  const [sparks, setSparks] = useState([]);
  const prevBattleState = useRef(battleState);

  // Spawn tracer when battleState transitions TO "player-attack"
  useEffect(() => {
    if (battleState === "player-attack" && prevBattleState.current !== "player-attack") {
      const tracerId = nextVfxId();
      setTracers((prev) => [...prev, { id: tracerId }]);
    }
    prevBattleState.current = battleState;
  }, [battleState]);

  const handleTracerHit = useCallback((id) => {
    setTracers((prev) => prev.filter((t) => t.id !== id));
    const sparkId = nextVfxId();
    setSparks((prev) => [...prev, { id: sparkId, pos: [2.8, 1.35, 0], color: "#ffaa00" }]);
    setTimeout(() => {
      setSparks((prev) => prev.filter((s) => s.id !== sparkId));
    }, 600);
  }, []);

  return (
    <group>
      {tracers.map((t) => (
        <BulletTracer key={t.id} onComplete={() => handleTracerHit(t.id)} />
      ))}

      {sparks.map((s) => (
        <ImpactSparks key={s.id} position={s.pos} color={s.color} />
      ))}

      <UltimateVFX active={battleState === "ultimate"} />

      {damageEvents.map((dmg) => (
        <FloatingDamageNumber
          key={dmg.id}
          id={dmg.id}
          text={dmg.text}
          position={dmg.pos}
          isCritical={dmg.isCritical}
          isPlayer={dmg.isPlayer}
          onRemove={onRemoveDamageEvent}
        />
      ))}
    </group>
  );
}
