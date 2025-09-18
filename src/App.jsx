import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';
import Towers from './components/3d/Towers.jsx';
import React from 'react';


export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas shadows camera={{ position: [0, 2, 6], fov: 45 }}>
        <color attach="background" args={['#ffffffff']} />

        {/* Lights */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />

        {/* Ground (optional) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#777777ff" />
        </mesh>

        {/* Models */}
        <Suspense fallback={null}>
          <Towers />
        </Suspense>

        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}