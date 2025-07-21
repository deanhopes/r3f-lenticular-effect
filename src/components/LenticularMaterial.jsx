import { extend } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
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

    const hardStep = step(0.5, repeatedUVs);

    const blendFactor = mix(hardStep, repeatedUVs, uniforms.uSmoothness);

    const heightNode = mix(
      uniforms.uHeight.negate(),
      uniforms.uHeight,
      repeatedUVs.x
    );

    return {
      uniforms,
      nodes: {
        colorNode: mix(texA, texB, blendFactor),
        positionNode: positionLocal.add(vec3(0, 0, heightNode)),
      },
    };
  }, []);

  useEffect(() => {
    uniforms.uHeight.value = height;
    uniforms.uNbDivisions.value = nbDivisions;
    uniforms.uSmoothness.value = smoothness;
  }, [height, nbDivisions, smoothness]);

  return <meshStandardNodeMaterial {...nodes} side={THREE.DoubleSide} />;
};
