import type { PlankInstance } from '../types';

/**
 * Generates herringbone (ёлочка) plank positions at 45° to the room walls.
 *
 * Coordinate system:
 *   The pattern is built in a rotated (u, v) space where:
 *     u-axis points NE (45°) in world space
 *     v-axis points NW (135°) in world space
 *   World positions are recovered via:
 *     wx = (u - v) / √2
 *     wz = (u + v) / √2
 *
 * Column-pair layout (repeating unit, width = L + W in u-direction):
 *   [H column: u ∈ [0, L]]  [V column: u ∈ [L, L+W]]
 *   H planks: long axis along u, stacked every W in v-direction
 *   V planks: long axis along v, stacked every L in v-direction
 *
 * Adjacent column pairs are staggered by W in v-direction so that planks
 * interlock: after L/W column pairs the stagger cycles back to zero.
 *
 * Returned planks extend slightly beyond the room boundary so the
 * clipping planes applied to the material can cleanly trim the edges.
 */
export function generateHerringbone(
  roomW: number,
  roomL: number,
  plankLength: number,
  plankWidth: number,
  gap: number
): PlankInstance[] {
  const L = plankLength + gap;
  const W = plankWidth + gap;

  // Width of one repeating column pair in the u-direction
  const periodU = L + W;

  // How many V plank lengths fit in one stagger cycle (usually an integer, e.g. 6 for 600×100 mm)
  const staggerPeriod = Math.round(L / W);

  // Extent of the virtual grid in u-v space: must reach all four room corners
  const diagonal = Math.sqrt(roomW * roomW + roomL * roomL) / 2;
  const extent = diagonal + Math.max(L, W) * 4;

  const numPairs = Math.ceil((extent * 2) / periodU) + 4;

  const planks: PlankInstance[] = [];

  for (let ci = -numPairs; ci <= numPairs; ci++) {
    // Left edge of the H column for this pair
    const uH = ci * periodU;
    // Left edge of the V column for this pair
    const uV = uH + L;

    // Stagger V planks by W for every column pair; reset every staggerPeriod pairs
    const vOffset = ((ci % staggerPeriod) * W + L * 100) % L;

    // --- H planks: center at (uH + L/2, j*W + W/2) ---
    const vStartH = Math.floor((-extent - 1) / W) * W;
    for (let v = vStartH; v < extent + W; v += W) {
      const cu = uH + L / 2;
      const cv = v + W / 2;
      planks.push({
        cx: (cu - cv) * Math.SQRT1_2,
        cz: (cu + cv) * Math.SQRT1_2,
        isHorizontal: true,
      });
    }

    // --- V planks: center at (uV + W/2, k*L + vOffset + L/2) ---
    const vStartV = Math.floor((-extent - vOffset - 1) / L) * L + vOffset;
    for (let v = vStartV; v < extent + L; v += L) {
      const cu = uV + W / 2;
      const cv = v + L / 2;
      planks.push({
        cx: (cu - cv) * Math.SQRT1_2,
        cz: (cu + cv) * Math.SQRT1_2,
        isHorizontal: false,
      });
    }
  }

  // Discard planks whose centers are far outside the room.
  // Clipping planes on the material handle the precise boundary trimming.
  const margin = Math.max(L, W) * 2;
  return planks.filter(
    p => Math.abs(p.cx) < roomW / 2 + margin && Math.abs(p.cz) < roomL / 2 + margin
  );
}

/**
 * Generates a straight (running-bond) plank layout parallel to the room walls.
 * Odd-numbered rows are offset by half a plank length to break up vertical joints.
 * All planks run along the room's length axis (Z).
 */
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

  // +2 rows/cols so planks reach the edges after clipping
  const numRows = Math.ceil(roomW / W) + 2;
  const numCols = Math.ceil(roomL / L) + 2;

  for (let row = -1; row <= numRows; row++) {
    // Running-bond offset: shift every other row by half a plank length
    const rowOffset = row % 2 === 0 ? 0 : L / 2;
    for (let col = -1; col <= numCols; col++) {
      const cx = row * W - halfW + W / 2;
      const cz = col * L - halfL + L / 2 + rowOffset;
      planks.push({ cx, cz, isHorizontal: false });
    }
  }

  return planks;
}
