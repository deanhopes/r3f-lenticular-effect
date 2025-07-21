import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

/**
 * Custom hook for draggable carousel logic.
 * Handles drag, snap, and minimal rotation math.
 * Returns refs and event handlers for use in the Experience component.
 */
export function useDraggableCarousel({ totalItems, radius }) {
  const groupRef = useRef();
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartRotation = useRef(0);
  const snapTarget = useRef(null);
  const { gl } = useThree();

  // Helper for robust modulus
  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  const anglePerSlice = (2 * Math.PI) / totalItems;

  // Calculate positions for meshes in a circle
  const positions = Array.from({ length: totalItems }, (_, i) => {
    const angle = (i / totalItems) * Math.PI * 2;
    return {
      x: Math.sin(angle) * radius,
      y: 0,
      z: Math.cos(angle) * radius,
    };
  });

  useEffect(() => {
    const handlePointerDown = (e) => {
      dragging.current = true;
      dragStartX.current = e.clientX;
      let startRot = groupRef.current.rotation.y % (2 * Math.PI);
      if (startRot < 0) startRot += 2 * Math.PI;
      dragStartRotation.current = startRot;
      groupRef.current.rotation.y = startRot;
      snapTarget.current = null;
    };
    const handlePointerMove = (e) => {
      if (!dragging.current) return;
      const deltaX = e.clientX - dragStartX.current;
      const sensitivity = 0.008;
      let newRot = dragStartRotation.current - deltaX * sensitivity;
      newRot = newRot % (2 * Math.PI);
      if (newRot < 0) newRot += 2 * Math.PI;
      groupRef.current.rotation.y = newRot;
    };
    const handlePointerUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      let currentRotation = groupRef.current.rotation.y;
      let normalized = currentRotation % (2 * Math.PI);
      if (normalized < 0) normalized += 2 * Math.PI;
      let nearestIndex = Math.round(normalized / anglePerSlice) % totalItems;
      let target = nearestIndex * anglePerSlice;
      let diff = mod(target - currentRotation + Math.PI, 2 * Math.PI) - Math.PI;
      let snapTo = currentRotation + diff;
      snapTarget.current = snapTo;
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
  }, [gl, anglePerSlice, totalItems]);

  return {
    groupRef,
    snapTarget,
    positions,
  };
}
