import { useMemo } from 'react';
import * as THREE from 'three';
import type { RoomParams } from '../types';

interface WallsProps {
  params: RoomParams;
}

function makePaintTexture(hexColor: string): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = hexColor;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.012})`;
    ctx.fillRect(x, y, 1 + Math.random(), 1 + Math.random());
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeFloorTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#d4c4a0';
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

export default function Walls({ params }: WallsProps) {
  const { width, length, height, wallColor } = params;

  const paintTex = useMemo(() => {
    const t = makePaintTexture(wallColor);
    t.repeat.set(width / 3, height / 2.5);
    return t;
  }, [width, height, wallColor]);

  const paintMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: paintTex,
        roughness: 0.88,
        metalness: 0.0,
        side: THREE.DoubleSide,
      }),
    [paintTex]
  );

  const floorMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: makeFloorTexture(),
        roughness: 0.95,
        side: THREE.FrontSide,
      }),
    []
  );

  const hw = width / 2;
  const hl = length / 2;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[width, length]} />
        <primitive object={floorMat} attach="material" />
      </mesh>

      <mesh position={[0, height / 2, -hl]} receiveShadow castShadow>
        <planeGeometry args={[width, height]} />
        <primitive object={paintMat} attach="material" />
      </mesh>

      <mesh position={[0, height / 2, hl]} rotation={[0, Math.PI, 0]} receiveShadow castShadow>
        <planeGeometry args={[width, height]} />
        <primitive object={paintMat} attach="material" />
      </mesh>

      <mesh position={[-hw, height / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
        <planeGeometry args={[length, height]} />
        <primitive object={paintMat} attach="material" />
      </mesh>

      <mesh position={[hw, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow castShadow>
        <planeGeometry args={[length, height]} />
        <primitive object={paintMat} attach="material" />
      </mesh>
    </group>
  );
}
