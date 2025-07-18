import { OrbitControls } from "@react-three/drei";
import { LenticularMaterial } from "./LenticularMaterial";
import { Environment } from "@react-three/drei";
import { useControls } from "leva";
import { useVideoTexture } from "@react-three/drei";

export const Experience = () => {
  const { textureSet, nbDivisions, height } = useControls({
    textureSet: {
      value: "nostalgia",
      options: ["nostalgia", "vhs", "water"],
    },
    nbDivisions: {
      min: 10,
      max: 100,
      value: 10,
      step: 10,
      label: "Number of divisions",
    },
    height: {
      min: 0.001,
      max: 0.2,
      value: 0.05,
      step: 0.001,
      label: "Height",
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

  return (
    <>
      <OrbitControls />
      <Environment preset="sunset" />
      <mesh>
        <planeGeometry args={[(1 * 51) / 91, 1, nbDivisions * 2, 1]} />
        <LenticularMaterial
          key={textureSet}
          textureA={textureA}
          textureB={textureB}
          nbDivisions={nbDivisions}
          height={height}
        />
      </mesh>
    </>
  );
};
