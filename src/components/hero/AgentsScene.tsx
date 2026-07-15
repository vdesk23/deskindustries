import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Points, PointMaterial, OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function AgentOrb({ position, color, speed }: { position: [number, number, number]; color: string; speed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime() * speed;
    ref.current.rotation.x = t * 0.3;
    ref.current.rotation.y = t * 0.5;
    ref.current.position.y = position[1] + Math.sin(t) * 0.15;
  });
  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={ref} position={position}>
        <icosahedronGeometry args={[0.6, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          wireframe
          transparent
          opacity={0.85}
        />
      </mesh>
    </Float>
  );
}

function Particles() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = 800;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.05;
  });
  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#EAA210"
        size={0.03}
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  );
}

function CentralCore() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.x = t * 0.15;
    ref.current.rotation.y = t * 0.2;
    const s = 1 + Math.sin(t * 1.5) * 0.05;
    ref.current.scale.set(s, s, s);
  });
  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[1.1, 0.32, 200, 32]} />
      <meshStandardMaterial
        color="#EAA210"
        emissive="#EAA210"
        emissiveIntensity={0.6}
        metalness={0.7}
        roughness={0.2}
        wireframe
      />
    </mesh>
  );
}

export function AgentsScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 55 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.2} color="#EAA210" />
      <pointLight position={[-10, -10, -10]} intensity={0.6} color="#8b6bcc" />

      <CentralCore />

      <AgentOrb position={[2.6, 1.2, 0.5]} color="#EAA210" speed={0.8} />
      <AgentOrb position={[-2.4, -1, 0.8]} color="#f5c05a" speed={1.1} />
      <AgentOrb position={[0.5, -2.3, -0.5]} color="#EAA210" speed={0.6} />
      <AgentOrb position={[-2.8, 1.6, -0.6]} color="#f5c05a" speed={0.9} />
      <AgentOrb position={[2.2, -1.6, -1]} color="#EAA210" speed={1.0} />

      <Particles />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.6}
        rotateSpeed={0.35}
      />
    </Canvas>
  );
}
