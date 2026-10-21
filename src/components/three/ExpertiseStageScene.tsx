import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { useRef, type ReactNode } from "react";
import * as THREE from "three";
import { EXPERTISE_AREAS, SCENE_COLORS, type ArtifactKind } from "@/lib/expertise-data";
import { DPR } from "@/lib/motion";

const glass = { color: SCENE_COLORS.violet, metalness: 0.5, roughness: 0.25 };
const Glass = () => <meshStandardMaterial {...glass} />;
const Glow = ({ i = 0.8 }: { i?: number }) => (
  <meshStandardMaterial color={SCENE_COLORS.amber} emissive={SCENE_COLORS.amber} emissiveIntensity={i} metalness={0.3} roughness={0.3} />
);
const Light = () => <meshStandardMaterial color={SCENE_COLORS.light} metalness={0.4} roughness={0.35} />;

function Artifact({ kind, t }: { kind: ArtifactKind; t: number }) {
  const s = Math.sin(t);
  switch (kind) {
    case "code": // </>
      return (
        <group scale={0.9}>
          {[-1, 1].map((d) => (
            <group key={d} position-x={d * 0.95}>
              <mesh position={[d * 0.15, 0.25, 0]} rotation-z={d * 0.75}><boxGeometry args={[0.18, 0.75, 0.25]} /><Light /></mesh>
              <mesh position={[d * 0.15, -0.25, 0]} rotation-z={-d * 0.75}><boxGeometry args={[0.18, 0.75, 0.25]} /><Light /></mesh>
            </group>
          ))}
          <mesh rotation-z={-0.35}><boxGeometry args={[0.18, 1.6, 0.25]} /><Glow /></mesh>
        </group>
      );
    case "gear":
      return (
        <group rotation-z={reducedSpin(t)}>
          <mesh><cylinderGeometry args={[0.7, 0.7, 0.3, 48]} /><Light /></mesh>
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i / 10) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * 0.8, 0, Math.sin(a) * 0.8]} rotation-y={-a}>
                <boxGeometry args={[0.28, 0.3, 0.22]} /><Light />
              </mesh>
            );
          })}
          <mesh position-y={0.01}><cylinderGeometry args={[0.25, 0.25, 0.34, 32]} /><Glow /></mesh>
        </group>
      );
    case "prism":
      return (
        <group rotation-y={t * 0.4}>
          <mesh><octahedronGeometry args={[0.85]} /><meshStandardMaterial color={SCENE_COLORS.light} metalness={0.9} roughness={0.05} flatShading /></mesh>
          <mesh rotation-z={Math.PI / 2} scale={1.25}><torusGeometry args={[0.85, 0.015, 8, 96]} /><Glow /></mesh>
        </group>
      );
    case "lens":
      return (
        <group rotation-x={Math.PI / 2.4}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0, i * 0.25 - 0.25, 0]}>
              <cylinderGeometry args={[0.8 - i * 0.12, 0.8 - i * 0.12, 0.22, 48]} />
              <Glass />
            </mesh>
          ))}
          <mesh position={[0, 0.38, 0]}><cylinderGeometry args={[0.35 + s * 0.12, 0.35 + s * 0.12, 0.02, 48]} /><Glow /></mesh>
        </group>
      );
    case "target":
      return (
        <group rotation-x={-0.4}>
          {[0.9, 0.62, 0.34].map((r, i) => (
            <mesh key={r} rotation-x={Math.PI / 2} position-y={i * 0.06}>
              <torusGeometry args={[r, 0.05, 12, 64]} />
              {i === 2 ? <Glow /> : <Light />}
            </mesh>
          ))}
          <group position={[0, 0.5 + s * 0.1, 0]} rotation-z={-0.6}>
            <mesh><cylinderGeometry args={[0.04, 0.04, 1, 8]} /><Glow /></mesh>
            <mesh position-y={0.6}><coneGeometry args={[0.12, 0.25, 16]} /><Glow /></mesh>
          </group>
        </group>
      );
    case "cart":
      return (
        <group position-y={0.1}>
          {/* basket */}
          <mesh position={[0.1, 0.1, 0]} rotation-z={0.08}><boxGeometry args={[1.4, 0.7, 0.9]} /><Light /></mesh>
          <mesh position={[0.1, 0.46, 0]}><boxGeometry args={[1.5, 0.05, 1]} /><Glow /></mesh>
          {/* handle */}
          <mesh position={[-0.75, 0.55, 0]} rotation-z={0.5}><cylinderGeometry args={[0.04, 0.04, 0.6, 12]} /><Glass /></mesh>
          <mesh position={[-0.95, 0.8, 0]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.05, 0.05, 1, 12]} /><Glow /></mesh>
          {/* frame + wheels */}
          <mesh position={[0.1, -0.35, 0]}><boxGeometry args={[1.3, 0.05, 0.8]} /><Glass /></mesh>
          {[[-0.45, 0.35], [-0.45, -0.35], [0.65, 0.35], [0.65, -0.35]].map(([x, z]) => (
            <mesh key={`${x}${z}`} position={[x, -0.55, z]} rotation-x={Math.PI / 2}>
              <torusGeometry args={[0.12, 0.05, 12, 24]} /><Glass />
            </mesh>
          ))}
        </group>
      );
    default: // waves: equalizer bars + rings
      return (
        <group>
          {Array.from({ length: 9 }).map((_, i) => {
            const h = 0.3 + Math.abs(Math.sin(i * 0.9 + t * 3)) * 1.2 * (1 - Math.abs(i - 4) / 6);
            return (
              <mesh key={i} position={[(i - 4) * 0.22, 0, 0]} scale={[1, h, 1]}>
                <boxGeometry args={[0.12, 1, 0.12]} />
                {i === 4 ? <Glow /> : i % 2 ? <Light /> : <Glow i={0.4} />}
              </mesh>
            );
          })}
          {[1.25, 1.5].map((r) => (
            <mesh key={r}><torusGeometry args={[r, 0.015, 8, 96, Math.PI * 0.5]} /><Glow i={0.4} /></mesh>
          ))}
        </group>
      );
  }
}

function Slot({ index, active, reduced, children }: { index: number; active: number; reduced: boolean; children: (t: number) => ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    const g = ref.current;
    if (!g) return;
    const on = index === active;
    const k = 1 - Math.exp(-6 * dt);
    const s = THREE.MathUtils.lerp(g.scale.x, on ? 1 : 0.001, k);
    g.scale.setScalar(s);
    g.visible = s > 0.01;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, on ? 0 : Math.PI, k);
    if (!reduced) t.current += dt;
    g.position.y = reduced ? 0 : Math.sin(t.current * 1.2) * 0.06;
  });
  return <group ref={ref} scale={index === active ? 1 : 0.001}><Animated t={t} reduced={reduced}>{children}</Animated></group>;
}

function Animated({ t, reduced, children }: { t: React.MutableRefObject<number>; reduced: boolean; children: (t: number) => ReactNode }) {
  // Re-render artifact pose via a child group driven every frame.
  const ref = useRef<THREE.Group>(null);
  useFrame(() => { if (ref.current && !reduced) ref.current.rotation.y = Math.sin(t.current * 0.4) * 0.35; });
  return <group ref={ref}>{children(0)}</group>;
}

export default function ExpertiseStageScene({ active, reduced }: { active: number; reduced: boolean }) {
  return (
    <Canvas dpr={DPR} camera={{ position: [0, 1.2, 4.6], fov: 40 }} gl={{ alpha: true, antialias: true }} onCreated={({ camera }) => camera.lookAt(0, 0, 0)}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={1.6} />
      <pointLight position={[-2, 1, 2]} intensity={6} color={SCENE_COLORS.amber} distance={8} />
      <Environment resolution={64}>
        <Lightformer intensity={2} position={[0, 5, 0]} scale={[10, 10, 1]} />
        <Lightformer intensity={1.2} color={SCENE_COLORS.amber} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 1, 1]} />
      </Environment>
      {EXPERTISE_AREAS.map((a, i) => (
        <Slot key={a.id} index={i} active={active} reduced={reduced}>
          {(t) => <Artifact kind={a.artifact} t={t} />}
        </Slot>
      ))}
      <ContactShadows position={[0, -1.15, 0]} opacity={0.5} scale={6} blur={2.4} far={3} color={SCENE_COLORS.dark} />
    </Canvas>
  );
}
