"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Float } from "@react-three/drei";

export default function Hero3D() {
  return (
    <div style={{ height: "100vh", background: "#05060a" }}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={80} color="#00e5ff" />
        <Stars radius={50} count={3000} factor={3} fade />
        <Float speed={2} rotationIntensity={1.5}>
          <mesh>
            <torusKnotGeometry args={[1, 0.3, 200, 32]} />
            <meshStandardMaterial color="#00e5ff" metalness={0.9} roughness={0.2} />
          </mesh>
        </Float>
        <OrbitControls enableZoom={false} autoRotate />
      </Canvas>
    </div>
  );
}