import type { RoomParams, RoomCalculations } from '../types';

const PAINT_COVERAGE_M2_PER_LITER = 8;
const PAINT_COATS = 2;
const PLANK_THICKNESS = 0.015;

export { PLANK_THICKNESS };

export function calculate(params: RoomParams): RoomCalculations {
  const { width, length, height, plankLength, plankWidth, wastePercent, layoutType } = params;

  const floorArea = width * length;
  const wallArea = 2 * (width + length) * height;
  const perimeter = 2 * (width + length);

  const plankArea = plankLength * plankWidth;
  const basePlanks = Math.ceil(floorArea / plankArea);
  const wasteFactor = layoutType === 'herringbone' ? wastePercent / 100 + 0.05 : wastePercent / 100;
  const planksWithWaste = Math.ceil(basePlanks * (1 + wasteFactor));

  const paintLiters = parseFloat(((wallArea / PAINT_COVERAGE_M2_PER_LITER) * PAINT_COATS).toFixed(2));

  return {
    floorArea: parseFloat(floorArea.toFixed(2)),
    wallArea: parseFloat(wallArea.toFixed(2)),
    perimeter: parseFloat(perimeter.toFixed(2)),
    totalPlanks: basePlanks,
    planksWithWaste,
    paintLiters,
    baseboardMeters: parseFloat(perimeter.toFixed(2)),
  };
}
