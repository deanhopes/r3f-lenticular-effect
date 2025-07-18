import { OrthographicCamera } from "@react-three/drei";
import { LenticularMaterial } from "./LenticularMaterial";
import { Environment } from "@react-three/drei";
import { useControls } from "leva";
import { useVideoTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export const Experience = () => {
  const cameraRef = useRef();
  const meshRef = useRef();
  const targetX = useRef(0);

  const { textureSet, nbDivisions, height, smoothness } = useControls({
    textureSet: {
      value: "nostalgia",
      options: ["nostalgia", "vhs", "water"],
    },
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

  const textureA = {
    ["nostalgia"]: videoNostalgiaTrain,
    ["vhs"]: videoVhsTrain,
    ["water"]: videoWaterCloseUp,
  }[textureSet];

  const textureB = {
    ["nostalgia"]: videoNostalgiaWoman,
    ["vhs"]: videoVhsRunning,
    ["water"]: videoWaterShirt,
  }[textureSet];

  useFrame((state) => {
    if (cameraRef.current && meshRef.current) {
      // Update target position with reduced clamp values
      targetX.current = Math.max(-0.01, Math.min(0.01, state.pointer.x * 0.1));

      // Smooth interpolation for camera
      cameraRef.current.rotation.y = THREE.MathUtils.lerp(
        cameraRef.current.rotation.y,
        targetX.current,
        0.1
      );

      // Apply similar rotation to mesh
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        -targetX.current * 90, // Opposite direction with reduced intensity
        0.1
      );
    }
  });

  return (
    <>
      <OrthographicCamera
        ref={cameraRef}
        position={[0, 0, 10]}
        makeDefault
        left={-1}
        right={1}
        top={1}
        bottom={-1}
        near={0.1}
        far={1000}
      />
      <Environment preset="sunset" />
      <mesh ref={meshRef}>
        <planeGeometry args={[(1 * 51) / 91, 1, nbDivisions * 2, 1]} />
        <LenticularMaterial
          key={textureSet}
          textureA={textureA}
          textureB={textureB}
          nbDivisions={nbDivisions}
          height={height}
          smoothness={smoothness}
        />
      </mesh>
    </>
  );
};
