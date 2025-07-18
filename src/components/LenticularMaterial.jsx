import { extend } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import {
  color,
  mix,
  texture,
  uv,
  uniform,
  positionLocal,
  vec3,
  step,
} from "three/tsl";
import { MeshStandardNodeMaterial } from "three/webgpu";

extend({ MeshStandardNodeMaterial });

export const LenticularMaterial = ({
  textureA,
  textureB,
  nbDivisions,
  height,
}) => {
  const { nodes, uniforms } = useMemo(() => {
    const uniforms = {
      uNbDivisions: uniform(nbDivisions),
      uHeight: uniform(height),
    };
    const texA = texture(textureA);
    const texB = texture(textureB);

    const repeatedUVs = uv().x.mul(uniforms.uNbDivisions).fract();
    const linedUVs = step(0.5, repeatedUVs);

    return {
      uniforms,
      nodes: {
        colorNode: mix(texA, texB, linedUVs),
        positionNode: positionLocal.add(
          vec3(
            0,
            0,
            mix(uniforms.uHeight.negate(), uniforms.uHeight, repeatedUVs.x)
          )
        ),
      },
    };
  }, []);

  useEffect(() => {
    uniforms.uHeight.value = height;
    uniforms.uNbDivisions.value = nbDivisions;
  }, [height, nbDivisions]);

  return <meshStandardNodeMaterial {...nodes} />;
};
