import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { motion } from "framer-motion";

// Base locker model (XL)
function BaseLocker({ position }) {
  const { scene } = useGLTF("/models/XL_Tower_A.glb");
  return (
    <primitive
      object={scene}
      position={position}
      scale={1.2}
      rotation={[0, 0, 0]} // keep front-facing
    />
  );
}

// Add-on locker model (XXL)
function AddOnLocker({ position }) {
  const { scene } = useGLTF("/models/XXL_Tower_A.glb");
  return (
    <primitive
      object={scene}
      position={position}
      scale={1.2}
      rotation={[0, 0, 0]} // keep front-facing
    />
  );
}

export default function App() {
  const [lockers, setLockers] = useState([
    { type: "base", position: [0, 0, 0] }, // Base locker in center
  ]);

  const addLocker = () => {
    const lastLocker = lockers[lockers.length - 1];
    const newLocker = {
      type: "addon",
      position: [lastLocker.position[0] + 3, 0, 0], // add right of last one
    };
    setLockers([...lockers, newLocker]);
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      {/* 3D Locker Scene */}
      <div className="w-full h-full">
        <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 6, 5]} intensity={1} />

          {lockers.map((locker, idx) =>
            locker.type === "base" ? (
              <BaseLocker key={idx} position={locker.position} />
            ) : (
              <AddOnLocker key={idx} position={locker.position} />
            )
          )}

          {/* Lock camera to front view */}
          <OrbitControls enableRotate={false} enableZoom={true} />
        </Canvas>
      </div>

      {/* + Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={addLocker}
        className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl shadow-lg"
      >
        + Add Locker
      </motion.button>
    </div>
  );
}
