import type { RoomParams } from '../types';

interface LightingProps {
  params: RoomParams;
}

export default function Lighting({ params }: LightingProps) {
  const { width, length, height } = params;

  return (
    <>
      <ambientLight intensity={0.45} color="#ffe9cc" />

      <directionalLight
        position={[width * 0.6, height * 2.5, length * 0.4]}
        intensity={1.4}
        color="#fff5e6"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-Math.max(width, length) * 1.5}
        shadow-camera-right={Math.max(width, length) * 1.5}
        shadow-camera-top={Math.max(width, length) * 1.5}
        shadow-camera-bottom={-Math.max(width, length) * 1.5}
        shadow-bias={-0.001}
      />

      <pointLight
        position={[0, height - 0.2, 0]}
        intensity={0.6}
        color="#ffe0a0"
        distance={Math.max(width, length) * 3}
        decay={2}
      />

      <pointLight
        position={[-width * 0.3, height * 0.6, length * 0.3]}
        intensity={0.3}
        color="#ffeedd"
        distance={Math.max(width, length) * 2}
        decay={2}
      />
    </>
  );
}
