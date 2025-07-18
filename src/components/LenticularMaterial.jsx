import { extend } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import {
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
  smoothness = 0.1,
}) => {
  const { nodes, uniforms } = useMemo(() => {
    const uniforms = {
      uNbDivisions: uniform(nbDivisions),
      uHeight: uniform(height),
      uSmoothness: uniform(smoothness),
    };
    const texA = texture(textureA);
    const texB = texture(textureB);

    const repeatedUVs = uv().x.mul(uniforms.uNbDivisions).fract();
    
    // Basic step function for the original effect
    const hardStep = step(0.5, repeatedUVs);
    
    // When smoothness is 0, use the hard step
    // When smoothness is higher, blend more of both textures
    const blendFactor = mix(hardStep, repeatedUVs, uniforms.uSmoothness);

    return {
      uniforms,
      nodes: {
        colorNode: mix(texA, texB, blendFactor),
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
    uniforms.uSmoothness.value = smoothness;
  }, [height, nbDivisions, smoothness]);

  return <meshStandardNodeMaterial {...nodes} />;
};
