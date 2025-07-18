import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import { LenticularMaterial } from "./LenticularMaterial";
import { Environment } from "@react-three/drei";
import { useControls } from "leva";
import { useVideoTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export const Experience = () => {
  const cameraRef = useRef();
  const meshRef1 = useRef();
  const meshRef2 = useRef();
  const meshRef3 = useRef();
  const groupRef = useRef();
  const targetX = useRef(0);

  const { nbDivisions, height, smoothness, radius, rotation, autoRotate } = useControls({
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
      min: 1,
      max: 5,
      value: 2,
      step: 0.1,
      label: "Circle Radius",
    },
    rotation: {
      min: 0,
      max: Math.PI * 2,
      value: 0,
      step: 0.01,
      label: "Circle Rotation",
    },
    autoRotate: {
      value: false,
      label: "Auto Rotate",
    },
  });

  const videoNostalgiaTrain = useVideoTexture(
    "textures/nostalgia/nostalgia-train.mp4"
  );
  const videoNostalgiaWoman = useVideoTexture(
    "textures/nostalgia/nostalgia-woman.mp4"
  );

  const videoVhsTrain = useVideoTexture("textures/vhs/vhs-train.mp4");
  const videoVhsRunning = useVideoTexture("textures/vhs/vhs-running.mp4");

  const videoWaterCloseUp = useVideoTexture("textures/water/water-closeup.mp4");
  const videoWaterShirt = useVideoTexture("textures/water/water-shirt.mp4");

  // Define texture pairs for each mesh
  const texturesMesh1 = {
    textureA: videoNostalgiaTrain,
    textureB: videoNostalgiaWoman,
    key: "nostalgia",
  };

  const texturesMesh2 = {
    textureA: videoVhsTrain,
    textureB: videoVhsRunning,
    key: "vhs",
  };

  const texturesMesh3 = {
    textureA: videoWaterCloseUp,
    textureB: videoWaterShirt,
    key: "water",
  };

  // Store the current rotation value
  const currentRotation = useRef(0);

  useFrame((state, delta) => {
    if (
      cameraRef.current &&
      meshRef1.current &&
      meshRef2.current &&
      meshRef3.current &&
      groupRef.current
    ) {
      // Update target position with reduced clamp values
      targetX.current = Math.max(-0.02, Math.min(0.02, state.pointer.x * 0.1));

      // Smooth interpolation for camera
      cameraRef.current.rotation.y = THREE.MathUtils.lerp(
        cameraRef.current.rotation.y,
        targetX.current,
        0.05
      );
      
      // Auto-rotate if enabled
      if (autoRotate) {
        currentRotation.current = (currentRotation.current + delta * 0.5) % (Math.PI * 2);
        groupRef.current.rotation.y = currentRotation.current;
      } else {
        // Update group rotation from Leva control
        groupRef.current.rotation.y = rotation;
        currentRotation.current = rotation;
      }
      
      // Get camera position in world space
      const cameraPosition = new THREE.Vector3();
      state.camera.getWorldPosition(cameraPosition);
      
      // Make each mesh face the camera using billboard technique
      const meshRefs = [meshRef1, meshRef2, meshRef3];
      meshRefs.forEach((meshRef) => {
        if (meshRef.current) {
          // Get mesh world position
          const meshWorldPosition = new THREE.Vector3();
          meshRef.current.getWorldPosition(meshWorldPosition);
          
          // Calculate direction to camera
          const directionToCamera = new THREE.Vector3().subVectors(
            cameraPosition, 
            meshWorldPosition
          ).normalize();
          
          // Create a quaternion for y-axis rotation only
          const yRotation = Math.atan2(directionToCamera.x, directionToCamera.z);
          
          // Apply rotation to mesh, compensating for group rotation
          meshRef.current.rotation.y = yRotation - groupRef.current.rotation.y;
          
          // Apply the lenticular effect rotation
          meshRef.current.rotation.y += -targetX.current * 15;
        }
      });
    }
  });

  // Calculate positions for meshes in a circle
  const calculateCirclePosition = (index, total, radius) => {
    const angle = (index / total) * Math.PI * 2;
    return {
      x: Math.sin(angle) * radius,
      y: 0,
      z: Math.cos(angle) * radius,
    };
  };

  const pos1 = calculateCirclePosition(0, 3, radius);
  const pos2 = calculateCirclePosition(1, 3, radius);
  const pos3 = calculateCirclePosition(2, 3, radius);

  return (
    <>
      <OrbitControls />
      <PerspectiveCamera
        ref={cameraRef}
        position={[0, 0, 15]}
        fov={7}
        makeDefault
        near={0.1}
        far={1000}
      />
      <Environment preset="sunset" />
      <group ref={groupRef}>
        <mesh ref={meshRef1} position={[pos1.x, pos1.y, pos1.z]}>
          <planeGeometry args={[(1 * 51) / 91, 1, nbDivisions * 2, 1]} />
          <LenticularMaterial
            key={texturesMesh1.key}
            textureA={texturesMesh1.textureA}
            textureB={texturesMesh1.textureB}
            nbDivisions={nbDivisions}
            height={height}
            smoothness={smoothness}
          />
        </mesh>
        <mesh ref={meshRef2} position={[pos2.x, pos2.y, pos2.z]}>
          <planeGeometry args={[(1 * 51) / 91, 1, nbDivisions * 2, 1]} />
          <LenticularMaterial
            key={texturesMesh2.key}
            textureA={texturesMesh2.textureA}
            textureB={texturesMesh2.textureB}
            nbDivisions={nbDivisions}
            height={height}
            smoothness={smoothness}
          />
        </mesh>
        <mesh ref={meshRef3} position={[pos3.x, pos3.y, pos3.z]}>
          <planeGeometry args={[(1 * 51) / 91, 1, nbDivisions * 2, 1]} />
          <LenticularMaterial
            key={texturesMesh3.key}
            textureA={texturesMesh3.textureA}
            textureB={texturesMesh3.textureB}
            nbDivisions={nbDivisions}
            height={height}
            smoothness={smoothness}
          />
        </mesh>
      </group>
    </>
  );
};
