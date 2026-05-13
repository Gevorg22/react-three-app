import type { PlankInstance } from '../types';

export function generateHerringbone(
  roomW: number,
  roomL: number,
  plankLength: number,
  plankWidth: number,
  gap: number
): PlankInstance[] {
  const L = plankLength + gap;
  const W = plankWidth + gap;

  const planks: PlankInstance[] = [];

  const diag = Math.sqrt(roomW * roomW + roomL * roomL) / 2;
  const virtualSize = diag + Math.max(L, W) * 4;

  const periodU = L + W;

  const numColPairs = Math.ceil((virtualSize * 2) / periodU) + 4;

  for (let ci = -numColPairs; ci <= numColPairs; ci++) {
    const uHBase = ci * periodU;

    const zOffset = ((ci % Math.round(L / W)) * W + L * 100) % L;

    const vStartH = Math.floor((-virtualSize - 1) / W) * W;
    for (let v = vStartH; v < virtualSize + W; v += W) {
      const cu = uHBase + L / 2;
      const cv = v + W / 2;

      const wx = cu * Math.SQRT1_2 - cv * Math.SQRT1_2;
      const wz = cu * Math.SQRT1_2 + cv * Math.SQRT1_2;

      planks.push({ cx: wx, cz: wz, isHorizontal: true });
    }

    const uVBase = uHBase + L;
    const vStartV = Math.floor((-virtualSize - zOffset - 1) / L) * L + zOffset;
    for (let v = vStartV; v < virtualSize + L; v += L) {
      const cu = uVBase + W / 2;
      const cv = v + L / 2;

      const wx = cu * Math.SQRT1_2 - cv * Math.SQRT1_2;
      const wz = cu * Math.SQRT1_2 + cv * Math.SQRT1_2;

      planks.push({ cx: wx, cz: wz, isHorizontal: false });
    }
  }

  const margin = Math.max(L, W) * 2;
  return planks.filter(
    p => Math.abs(p.cx) < roomW / 2 + margin && Math.abs(p.cz) < roomL / 2 + margin
  );
}

export function generateStraight(
  roomW: number,
  roomL: number,
  plankLength: number,
  plankWidth: number,
  gap: number
): PlankInstance[] {
  const L = plankLength + gap;
  const W = plankWidth + gap;

  const planks: PlankInstance[] = [];
  const halfW = roomW / 2;
  const halfL = roomL / 2;

  const numRows = Math.ceil(roomW / W) + 2;
  const numCols = Math.ceil(roomL / L) + 2;

  for (let row = -1; row <= numRows; row++) {
    const rowOffset = row % 2 === 0 ? 0 : L / 2;
    for (let col = -1; col <= numCols; col++) {
      const cx = row * W - halfW + W / 2;
      const cz = col * L - halfL + L / 2 + rowOffset;
      planks.push({ cx, cz, isHorizontal: false });
    }
  }

  return planks;
}
