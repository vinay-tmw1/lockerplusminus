import React, { useLayoutEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export default function Towers({
  align = 'z',       // 'x' = side-by-side (left/right). Use 'z' for front/back.
  gap = 0,           // 0 = touching. Use a tiny negative (e.g. -0.001) to eliminate any visible seam.
  faceCamera = true // keep false to avoid confusion while aligning; turn on later if you want
}) {
  const xl = useGLTF('/models/XL_Tower_A.glb');
  const xxl = useGLTF('/models/XXL_Tower_A.glb');

  const groupRef = useRef();
  const xlRef = useRef();
  const xxlRef = useRef();

  useLayoutEffect(() => {
    const group = groupRef.current;
    const A = xlRef.current;     // first locker
    const B = xxlRef.current;    // second locker
    if (!group || !A || !B) return;

    // 1) Turn on shadows for meshes (optional)
    [A, B].forEach(root => {
      root.traverse?.(o => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
        }
      });
    });

    // 2) Center each model (XZ) and sit on the floor (Y=0)
    const centerAndFloor = (obj) => {
      group.updateWorldMatrix(true, true);
      obj.updateWorldMatrix(true, true);

      const box = new THREE.Box3().setFromObject(obj);
      const size = box.getSize(new THREE.Vector3());
      const centerWorld = box.getCenter(new THREE.Vector3());

      // convert world center to group's local space and subtract it
      const centerLocal = centerWorld.clone();
      group.worldToLocal(centerLocal);
      obj.position.sub(centerLocal);

      // lift so bottom rests on Y=0
      obj.position.y += size.y / 2;

      obj.updateWorldMatrix(true, true);
      return { size };
    };

    const { size: sizeA } = centerAndFloor(A);
    const { size: sizeB } = centerAndFloor(B);

    // 3) Force both to the same depth so they cannot be one-behind-the-other
    //    This ensures "side by side" means left/right on the same Z line.
    A.position.z = 0;
    B.position.z = 0;

    // 4) Place B touching A with no gap along chosen axis
    group.updateWorldMatrix(true, true);
    const boxA = new THREE.Box3().setFromObject(A);
    const boxB = new THREE.Box3().setFromObject(B);

    if (align === 'x') {
      // Snap B's left face to A's right face
      const offsetX = boxA.max.x - boxB.min.x + gap;
      B.position.x += offsetX;
    } else {
      // Snap B's front face to A's back face
      const offsetZ = boxA.max.z - boxB.min.z + gap;
      B.position.z += offsetZ;
    }

    // 5) Re-center the whole pair on the origin (nice for camera/orbit)
    group.updateWorldMatrix(true, true);
    const pairBox = new THREE.Box3().expandByObject(A).expandByObject(B);
    const pairCenterWorld = pairBox.getCenter(new THREE.Vector3());
    const pairCenterLocal = pairCenterWorld.clone();
    group.worldToLocal(pairCenterLocal);

    // keep them on the floor; only recenter X/Z
    group.position.x -= pairCenterLocal.x;
    group.position.z -= pairCenterLocal.z;

    // 6) Optionally face camera
    if (faceCamera) group.rotation.y = Math.PI;

  }, [align, gap, faceCamera]);

  return (
    <group ref={groupRef}>
      {/* Use clones so transforms don't mutate cached glTFs */}
      <primitive object={xl.scene.clone(true)} ref={xlRef} />
      <primitive object={xxl.scene.clone(true)} ref={xxlRef} />
    </group>
  );
}

useGLTF.preload('/models/XL_Tower_A.glb');
useGLTF.preload('/models/XXL_Tower_A.glb');