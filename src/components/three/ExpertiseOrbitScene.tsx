import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, Float } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";
import { EXPERTISE_AREAS, SCENE_COLORS, type ExpertiseArea } from "@/lib/expertise-data";
import { DPR } from "@/lib/motion";

const RADIUS = 3.2;
const STEP = (Math.PI * 2) / EXPERTISE_AREAS.length;

function Shape({ shape }: { shape: ExpertiseArea["shape"] }) {
  switch (shape) {
    case "box": return <boxGeometry args={[0.8, 0.8, 0.8]} />;
    case "torus": return <torusGeometry args={[0.45, 0.18, 24, 48]} />;
    case "octa": return <octahedronGeometry args={[0.6]} />;
    case "cone": return <coneGeometry args={[0.5, 0.9, 32]} />;
    case "ico": return <icosahedronGeometry args={[0.6, 0]} />;
    case "knot": return <torusKnotGeometry args={[0.35, 0.12, 96, 16]} />;
    default: return <dodecahedronGeometry args={[0.6]} />;
  }
}

function Orbit({ active, onSelect, reduced }: { active: number; onSelect: (i: number) => void; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const [hover, setHover] = useState<number | null>(null);
  const target = useRef(0);

  useFrame((state, raw) => {
    const dt = Math.min(raw, 0.05);
    if (!group.current) return;
    // shortest rotation so the active item faces the camera (angle 0 = +z)
    const desired = -active * STEP;
    let diff = desired - target.current;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    target.current += diff;
    const idle = reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.3) * 0.08;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, target.current + idle, 1 - Math.exp(-4 * dt));
    meshes.current.forEach((m, i) => {
      if (!m) return;
      const s = i === active ? 1.2 : hover === i ? 1.15 : 0.9;
      m.scale.setScalar(THREE.MathUtils.lerp(m.scale.x, s, 1 - Math.exp(-6 * dt)));
      if (!reduced) { m.rotation.x += dt * 0.4; m.rotation.y += dt * 0.6; }
    });
  });

  return (
    <group ref={group}>
      {EXPERTISE_AREAS.map((a, i) => {
        const ang = i * STEP;
        const isActive = i === active;
        return (
          <Float key={a.id} speed={reduced ? 0 : 1.5} floatIntensity={0.4} rotationIntensity={0}>
            <mesh
              ref={(m) => { meshes.current[i] = m; }}
              position={[Math.sin(ang) * RADIUS, 0, Math.cos(ang) * RADIUS]}
              onClick={(e) => { e.stopPropagation(); onSelect(i); }}
              onPointerOver={(e) => { e.stopPropagation(); setHover(i); document.body.style.cursor = "pointer"; }}
              onPointerOut={() => { setHover(null); document.body.style.cursor = ""; }}
            >
              <Shape shape={a.shape} />
              <meshStandardMaterial
                color={isActive ? SCENE_COLORS.amber : SCENE_COLORS.light}
                emissive={isActive ? SCENE_COLORS.amber : SCENE_COLORS.violet}
                emissiveIntensity={isActive ? 0.6 : 0.25}
                metalness={0.5}
                roughness={0.25}
              />
            </mesh>
          </Float>
        );
      })}
      <mesh rotation-x={Math.PI / 2}>
        <torusGeometry args={[RADIUS, 0.01, 8, 128]} />
        <meshBasicMaterial color={SCENE_COLORS.amber} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

function Core() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += Math.min(dt, 0.05) * 0.3; });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color={SCENE_COLORS.violet} emissive={SCENE_COLORS.amber} emissiveIntensity={0.25} wireframe />
    </mesh>
  );
}

export default function ExpertiseOrbitScene(props: { active: number; onSelect: (i: number) => void; reduced: boolean }) {
  return (
    <Canvas dpr={DPR} camera={{ position: [0, 2.2, 7.5], fov: 45 }} gl={{ alpha: true, antialias: true }} onCreated={({ camera }) => camera.lookAt(0, 0, 1)}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 5]} intensity={1.4} />
      <pointLight position={[0, 0, 0]} intensity={8} color={SCENE_COLORS.amber} distance={6} />
      <Environment resolution={64}>
        <Lightformer intensity={2} position={[0, 5, 0]} scale={[10, 10, 1]} />
        <Lightformer intensity={1} color={SCENE_COLORS.amber} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 1, 1]} />
      </Environment>
      <Core />
      <Orbit {...props} />
    </Canvas>
  );
}
