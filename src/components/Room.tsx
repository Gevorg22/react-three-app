import { Suspense } from 'react';
import { OrbitControls, Environment } from '@react-three/drei';
import type { RoomParams } from '../types';
import Floor from './Floor';
import Walls from './Walls';
import Baseboard from './Baseboard';
import Lighting from './Lighting';

interface RoomProps {
  params: RoomParams;
}

export default function Room({ params }: RoomProps) {
  return (
    <>
      <Lighting params={params} />
      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        minDistance={1.5}
        maxDistance={Math.max(params.width, params.length) * 3.5}
        minPolarAngle={0.1}
        maxPolarAngle={Math.PI / 2 - 0.01}
        target={[0, 0, 0]}
      />
      <Suspense fallback={null}>
        <Environment preset="apartment" />
        <Walls params={params} />
        <Floor params={params} />
        <Baseboard params={params} />
      </Suspense>
    </>
  );
}
