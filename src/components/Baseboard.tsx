import { useMemo } from 'react';
import * as THREE from 'three';
import type { RoomParams } from '../types';
import { PLANK_THICKNESS } from '../utils/calculations';

interface BaseboardProps {
  params: RoomParams;
}

const BB_HEIGHT = 0.08;
const BB_DEPTH = 0.015;

export default function Baseboard({ params }: BaseboardProps) {
  const { width, length } = params;

  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f0ebe4',
        roughness: 0.6,
        metalness: 0.05,
      }),
    []
  );

  const yPos = BB_HEIGHT / 2 + PLANK_THICKNESS;

  const segments = useMemo(
    () => [
      {
        pos: [0, yPos, -length / 2 + BB_DEPTH / 2] as [number, number, number],
        size: [width - BB_DEPTH * 2, BB_HEIGHT, BB_DEPTH] as [number, number, number],
      },
      {
        pos: [0, yPos, length / 2 - BB_DEPTH / 2] as [number, number, number],
        size: [width - BB_DEPTH * 2, BB_HEIGHT, BB_DEPTH] as [number, number, number],
      },
      {
        pos: [-width / 2 + BB_DEPTH / 2, yPos, 0] as [number, number, number],
        size: [BB_DEPTH, BB_HEIGHT, length] as [number, number, number],
      },
      {
        pos: [width / 2 - BB_DEPTH / 2, yPos, 0] as [number, number, number],
        size: [BB_DEPTH, BB_HEIGHT, length] as [number, number, number],
      },
    ],
    [width, length, yPos]
  );

  return (
    <group>
      {segments.map((seg, i) => (
        <mesh key={i} position={seg.pos} castShadow receiveShadow material={mat}>
          <boxGeometry args={seg.size} />
        </mesh>
      ))}
    </group>
  );
}
