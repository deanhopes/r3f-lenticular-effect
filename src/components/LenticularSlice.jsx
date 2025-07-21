import { forwardRef } from "react";
import { LenticularMaterial } from "./LenticularMaterial";
import * as THREE from "three";

/**
 * Renders a single lenticular mesh slice.
 * Props: position (vec3), textures (object), nbDivisions, height, smoothness
 */
export const LenticularSlice = forwardRef(
  ({ position, textures, nbDivisions, height, smoothness }, ref) => (
    <mesh ref={ref} position={[position.x, position.y, position.z]}>
      <planeGeometry args={[(1 * 51) / 91, 1, nbDivisions * 2, 1]} />
      <LenticularMaterial
        key={textures.key}
        textureA={textures.textureA}
        textureB={textures.textureB}
        nbDivisions={nbDivisions}
        height={height}
        smoothness={smoothness}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
);
