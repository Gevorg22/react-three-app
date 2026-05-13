import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { RoomParams } from '../types';
import { generateHerringbone, generateStraight } from '../utils/floorLayout';
import { PLANK_THICKNESS } from '../utils/calculations';

interface FloorProps {
  params: RoomParams;
}

function makeWoodTexture(
  hue: number,
  saturation: number,
  lightness: number,
  horizontal: boolean,
  repeatU: number,
  repeatV: number,
): THREE.CanvasTexture {
  const W = 512;
  const H = 512;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  ctx.fillRect(0, 0, W, H);

  const grainCount = 160;
  for (let i = 0; i < grainCount; i++) {
    const alpha = 0.04 + Math.random() * 0.18;
    const lineWidth = 0.5 + Math.random() * 2.2;
    ctx.strokeStyle = Math.random() > 0.5
      ? `rgba(0,0,0,${alpha})`
      : `rgba(255,200,80,${alpha * 0.5})`;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();

    if (horizontal) {
      const y = Math.random() * H;
      ctx.moveTo(0, y);
      let x = 0;
      while (x < W) {
        x += 12 + Math.random() * 30;
        ctx.lineTo(x, y + (Math.random() - 0.5) * 3);
      }
    } else {
      const x = Math.random() * W;
      ctx.moveTo(x, 0);
      let y = 0;
      while (y < H) {
        y += 12 + Math.random() * 30;
        ctx.lineTo(x + (Math.random() - 0.5) * 3, y);
      }
    }
    ctx.stroke();
  }

  const knots = Math.floor(Math.random() * 3);
  for (let k = 0; k < knots; k++) {
    const kx = 50 + Math.random() * (W - 100);
    const ky = 50 + Math.random() * (H - 100);
    const r = 8 + Math.random() * 22;
    const grad = ctx.createRadialGradient(kx, ky, 2, kx, ky, r);
    grad.addColorStop(0, 'rgba(60,30,10,0.4)');
    grad.addColorStop(1, 'rgba(60,30,10,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(kx, ky, r, r * 0.65, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatU, repeatV);
  return tex;
}

function makeClippingPlanes(width: number, length: number): THREE.Plane[] {
  return [
    new THREE.Plane(new THREE.Vector3(1, 0, 0), width / 2),
    new THREE.Plane(new THREE.Vector3(-1, 0, 0), width / 2),
    new THREE.Plane(new THREE.Vector3(0, 0, 1), length / 2),
    new THREE.Plane(new THREE.Vector3(0, 0, -1), length / 2),
  ];
}

export default function Floor({ params }: FloorProps) {
  const { width, length, plankLength, plankWidth, gap, layoutType } = params;

  const planks = useMemo(() => {
    if (layoutType === 'herringbone') {
      return generateHerringbone(width, length, plankLength, plankWidth, gap);
    }
    return generateStraight(width, length, plankLength, plankWidth, gap);
  }, [width, length, plankLength, plankWidth, gap, layoutType]);

  const hMeshRef = useRef<THREE.InstancedMesh>(null);
  const vMeshRef = useRef<THREE.InstancedMesh>(null);

  const hPlanks = useMemo(() => planks.filter(p => p.isHorizontal), [planks]);
  const vPlanks = useMemo(() => planks.filter(p => !p.isHorizontal), [planks]);

  const aspectH = plankLength / plankWidth;
  const woodTexH = useMemo(
    () => makeWoodTexture(32, 55, 52, true, aspectH, 1),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plankLength, plankWidth]
  );
  const woodTexV = useMemo(
    () => makeWoodTexture(24, 48, 34, false, 1, aspectH),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plankLength, plankWidth]
  );

  const clippingPlanes = useMemo(() => makeClippingPlanes(width, length), [width, length]);

  const hGeo = useMemo(
    () => new THREE.BoxGeometry(plankLength, PLANK_THICKNESS, plankWidth),
    [plankLength, plankWidth]
  );
  const vGeo = useMemo(
    () => new THREE.BoxGeometry(plankWidth, PLANK_THICKNESS, plankLength),
    [plankLength, plankWidth]
  );

  const hMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: woodTexH,
        roughness: 0.5,
        metalness: 0.0,
        clippingPlanes,
        clipShadows: true,
      }),
    [woodTexH, clippingPlanes]
  );

  const vMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: woodTexV,
        roughness: 0.5,
        metalness: 0.0,
        clippingPlanes,
        clipShadows: true,
      }),
    [woodTexV, clippingPlanes]
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);

  const isHerringbone = layoutType === 'herringbone';

  useEffect(() => {
    const mesh = hMeshRef.current;
    if (!mesh) return;
    hPlanks.forEach((p, i) => {
      dummy.position.set(p.cx, PLANK_THICKNESS / 2, p.cz);
      dummy.scale.set(1, 1, 1);
      dummy.rotation.set(0, isHerringbone ? -Math.PI / 4 : 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [hPlanks, dummy, isHerringbone]);

  useEffect(() => {
    const mesh = vMeshRef.current;
    if (!mesh) return;
    vPlanks.forEach((p, i) => {
      dummy.position.set(p.cx, PLANK_THICKNESS / 2, p.cz);
      dummy.scale.set(1, 1, 1);
      dummy.rotation.set(0, isHerringbone ? -Math.PI / 4 : 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [vPlanks, dummy, isHerringbone]);

  return (
    <group>
      {hPlanks.length > 0 && (
        <instancedMesh
          ref={hMeshRef}
          args={[hGeo, hMat, hPlanks.length]}
          castShadow
          receiveShadow
        />
      )}
      {vPlanks.length > 0 && (
        <instancedMesh
          ref={vMeshRef}
          args={[vGeo, vMat, vPlanks.length]}
          castShadow
          receiveShadow
        />
      )}
    </group>
  );
}
