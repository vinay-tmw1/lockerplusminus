import { useGLTF } from '@react-three/drei';
import { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import React from 'react';


export default function Towers({
  gap = 0,        // 0 means touching; set e.g. 0.02 for a small gap
  faceCamera = true, // rotate to face default camera
  align = 'x'     // 'x' = side-by-side, 'z' = front-to-back
}) {
  const xl = useGLTF('/models/XL_Tower_A.glb');
  const xxl = useGLTF('/models/XXL_Tower_A.glb');

  const groupRef = useRef();
  const xlRef = useRef();
  const xxlRef = useRef();

  useLayoutEffect(() => {
    if (!xlRef.current || !xxlRef.current) return;

    // Enable shadows on meshes
    [xlRef.current, xxlRef.current].forEach(root => {
      root.traverse?.((o) => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
        }
      });
    });

    const bottomAlignAndCenter = (obj) => {
      const box = new THREE.Box3().setFromObject(obj);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      // move center to origin
      obj.position.sub(center);
      // rest on ground
      obj.position.y += size.y / 2;
      return size;
    };

    const xlSize = bottomAlignAndCenter(xlRef.current);
    const xxlSize = bottomAlignAndCenter(xxlRef.current);

    // Attach them
    if (align === 'x') {
      xxlRef.current.position.x = (xlSize.x / 2) + (xxlSize.x / 2) + gap;
    } else {
      xxlRef.current.position.z = (xlSize.z / 2) + (xxlSize.z / 2) + gap;
    }

    // Recenter the group so the pair is centered at origin
    const mid = new THREE.Vector3()
      .add(xlRef.current.position)
      .add(xxlRef.current.position)
      .multiplyScalar(0.5);
    groupRef.current.position.sub(mid);

    // Make them face the camera (default camera looks from +Z to origin)
    if (faceCamera) {
      groupRef.current.rotation.y = Math.PI;
    }
  }, [gap, faceCamera, align]);

  return (
    <group ref={groupRef}>
      {/* Use clones so you can transform freely */}
      <primitive object={xl.scene.clone(true)} ref={xlRef} />
      <primitive object={xxl.scene.clone(true)} ref={xxlRef} />
    </group>
  );
}

// Optional: preload to avoid a pop-in on first render
useGLTF.preload('/models/XL_Tower_A.glb');
useGLTF.preload('/models/XXL_Tower_A.glb');