import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import { LenticularMaterial } from "./LenticularMaterial";
import { Environment } from "@react-three/drei";
import { useControls } from "leva";
import { useVideoTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import * as THREE from "three";

export const Experience = () => {
  const cameraRef = useRef();
  const meshRef1 = useRef();
  const meshRef2 = useRef();
  const meshRef3 = useRef();
  const groupRef = useRef();
  const targetX = useRef(0);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartRotation = useRef(0);
  const snapTarget = useRef(null);

  const { gl } = useThree();

  const { nbDivisions, height, smoothness, radius, rotation, autoRotate } =
    useControls({
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

  const totalLenticularItems = 3;
  const anglePerSlice = (2 * Math.PI) / totalLenticularItems;

  // Calculate positions for meshes in a circle
  const calculateCirclePosition = (index, radius) => {
    const angle = (index / totalLenticularItems) * Math.PI * 2;
    return {
      x: Math.sin(angle) * radius,
      y: 0,
      z: Math.cos(angle) * radius,
    };
  };

  const pos1 = calculateCirclePosition(0, radius);
  const pos2 = calculateCirclePosition(1, radius);
  const pos3 = calculateCirclePosition(2, radius);

  // Robust modulus helper for angles
  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  // --- Drag and Snap Logic ---
  useEffect(() => {
    const handlePointerDown = (e) => {
      dragging.current = true;
      dragStartX.current = e.clientX;
      // Normalize the rotation to [0, 2PI) at drag start
      let startRot = groupRef.current.rotation.y % (2 * Math.PI);
      if (startRot < 0) startRot += 2 * Math.PI;
      dragStartRotation.current = startRot;
      groupRef.current.rotation.y = startRot;
      snapTarget.current = null;
      console.log('[PointerDown] Raw rotation:', groupRef.current.rotation.y, 'Normalized:', startRot);
    };
    const handlePointerMove = (e) => {
      if (!dragging.current) return;
      const deltaX = e.clientX - dragStartX.current;
      const sensitivity = 0.008;
      // Always keep rotation in [0, 2PI)
      let newRot = dragStartRotation.current - deltaX * sensitivity;
      newRot = newRot % (2 * Math.PI);
      if (newRot < 0) newRot += 2 * Math.PI;
      groupRef.current.rotation.y = newRot;
    };
    const handlePointerUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      // Snap to nearest slice within [0, 2PI)
      let currentRotation = groupRef.current.rotation.y;
      let normalized = currentRotation % (2 * Math.PI);
      if (normalized < 0) normalized += 2 * Math.PI;
      let nearestIndex = Math.round(normalized / anglePerSlice) % totalLenticularItems;
      let target = nearestIndex * anglePerSlice;
      // Minimal rotation diff using robust modulus
      let diff = mod(target - currentRotation + Math.PI, 2 * Math.PI) - Math.PI;
      let snapTo = currentRotation + diff;
      snapTarget.current = snapTo;
      console.log('[PointerUp] Raw rotation:', currentRotation, 'Normalized:', normalized, 'Snap to angle:', target, 'Nearest index:', nearestIndex, 'Diff:', diff, 'SnapTo:', snapTo);
    };
    const dom = gl.domElement;
    dom.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      dom.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [gl, anglePerSlice, totalLenticularItems]);

  // Animate snapping, always keep rotation in [0, 2PI)
  useFrame((state, delta) => {
    if (snapTarget.current !== null && groupRef.current) {
      let current = groupRef.current.rotation.y;
      let target = snapTarget.current;
      // Damping toward minimal rotation
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
