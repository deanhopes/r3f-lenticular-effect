import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import { Environment } from "@react-three/drei";
import { useControls } from "leva";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import { useDraggableCarousel } from "../hooks/useDraggableCarousel";
import { LenticularSlice } from "./LenticularSlice";
import { useLenticularTextures } from "../hooks/useLenticularTextures";
import * as THREE from "three";

export const Experience = () => {
  const { nbDivisions, height, smoothness, radius } = useControls({
    nbDivisions: {
      min: 10,
      max: 100,
      value: 40,
      step: 10,
      label: "Number of divisions",
    },
    height: {
      min: 0.001,
      max: 0.2,
      value: 0.05,
      step: 0.01,
      label: "Height",
    },
    smoothness: {
      min: 0,
      max: 0.5,
      value: 0.26,
      step: 0.01,
      label: "Line Smoothness",
    },
    radius: {
      min: 0.1,
      max: 5,
      value: 1,
      step: 0.1,
      label: "Circle Radius",
    },
  });

  const textures = useLenticularTextures();
  const { groupRef, snapTarget, positions } = useDraggableCarousel({
    totalItems: textures.length,
    radius,
  });

  // Create refs for each slice
  const sliceRefs = useRef(textures.map(() => useRef()));
  const { camera, gl } = useThree();

  // Track pointer position normalized to [-1, 1]
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const handlePointerMove = (e) => {
      // Normalize pointer to [-1, 1] for both axes
      const rect = gl.domElement.getBoundingClientRect();
      pointer.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [gl]);

  // Animate snapping, billboard, and lenticular effect
  useFrame((_, delta) => {
    // Billboard: make each slice face the camera
    const cameraPosition = new THREE.Vector3();
    camera.getWorldPosition(cameraPosition);
    sliceRefs.current.forEach((ref) => {
      if (ref.current) {
        ref.current.lookAt(cameraPosition);
        // Lenticular effect: apply tilt relative to billboard orientation
        const maxTilt = 0.5;
        ref.current.rotateY(pointer.current.x * maxTilt);
      }
    });
    // Animate snapping
    if (snapTarget.current !== null && groupRef.current) {
      let current = groupRef.current.rotation.y;
      let target = snapTarget.current;
      let newRot = THREE.MathUtils.damp(current, target, 8, delta);
      groupRef.current.rotation.y = newRot;
      if (Math.abs(newRot - target) < 0.001) {
        groupRef.current.rotation.y = target;
        snapTarget.current = null;
      }
    }
  });

  return (
    <>
      <OrbitControls enabled={false} />
      <PerspectiveCamera
        position={[0, 0, 15]}
        fov={7}
        makeDefault
        near={0.1}
        far={1000}
      />
      <Environment preset="sunset" />
      <group ref={groupRef}>
        {textures.map((tex, i) => (
          <LenticularSlice
            key={tex.key}
            ref={sliceRefs.current[i]}
            position={positions[i]}
            textures={tex}
            nbDivisions={nbDivisions}
            height={height}
            smoothness={smoothness}
          />
        ))}
      </group>
    </>
  );
};
