import { describe, it, expect } from 'vitest';
import { calculate } from './calculations';
import type { RoomParams } from '../types';

const base: RoomParams = {
  width: 4,
  length: 5,
  height: 2.7,
  plankLength: 0.6,
  plankWidth: 0.1,
  gap: 0.005,
  layoutType: 'straight',
  wastePercent: 10,
  wallColor: '#ffffff',
};

describe('calculate', () => {
  it('площадь пола = ширина × длина', () => {
    const result = calculate(base);
    expect(result.floorArea).toBe(20);
  });

  it('площадь стен = 2 × (ширина + длина) × высота', () => {
    const result = calculate(base);
    expect(result.wallArea).toBe(parseFloat((2 * (4 + 5) * 2.7).toFixed(2)));
  });

  it('периметр = 2 × (ширина + длина)', () => {
    const result = calculate(base);
    expect(result.perimeter).toBe(18);
  });

  it('длина плинтуса равна периметру', () => {
    const result = calculate(base);
    expect(result.baseboardMeters).toBe(result.perimeter);
  });

  it('количество плашек = ceil(площадь пола / площадь плашки)', () => {
    const result = calculate(base);
    const plankArea = base.plankLength * base.plankWidth;
    const expected = Math.ceil(20 / plankArea);
    expect(result.totalPlanks).toBe(expected);
  });

  it('прямая раскладка использует только заданный процент запаса', () => {
    const result = calculate(base);
    const plankArea = base.plankLength * base.plankWidth;
    const basePlanks = Math.ceil(20 / plankArea);
    const expected = Math.ceil(basePlanks * (1 + 0.1));
    expect(result.planksWithWaste).toBe(expected);
  });

  it('ёлочка добавляет 5% сверх заданного запаса', () => {
    const result = calculate({ ...base, layoutType: 'herringbone', wastePercent: 10 });
    const plankArea = base.plankLength * base.plankWidth;
    const basePlanks = Math.ceil(20 / plankArea);
    const expected = Math.ceil(basePlanks * (1 + 0.15));
    expect(result.planksWithWaste).toBe(expected);
  });

  it('ёлочка даёт больше плашек с запасом, чем прямая раскладка при том же проценте', () => {
    const straight = calculate({ ...base, layoutType: 'straight' });
    const herringbone = calculate({ ...base, layoutType: 'herringbone' });
    expect(herringbone.planksWithWaste).toBeGreaterThan(straight.planksWithWaste);
  });

  it('расход краски = площадь стен / 8 × 2, округлённый до 2 знаков', () => {
    const result = calculate(base);
    const expected = parseFloat(((result.wallArea / 8) * 2).toFixed(2));
    expect(result.paintLiters).toBe(expected);
  });

  it('большая комната даёт большую площадь пола, стен и периметр', () => {
    const small = calculate(base);
    const large = calculate({ ...base, width: 8, length: 10 });
    expect(large.floorArea).toBeGreaterThan(small.floorArea);
    expect(large.wallArea).toBeGreaterThan(small.wallArea);
    expect(large.perimeter).toBeGreaterThan(small.perimeter);
  });

  it('более крупная плашка уменьшает количество плашек', () => {
    const small = calculate(base);
    const large = calculate({ ...base, plankLength: 1.2, plankWidth: 0.2 });
    expect(large.totalPlanks).toBeLessThan(small.totalPlanks);
  });

  it('больший процент запаса увеличивает количество плашек с запасом', () => {
    const low = calculate({ ...base, wastePercent: 5 });
    const high = calculate({ ...base, wastePercent: 25 });
    expect(high.planksWithWaste).toBeGreaterThan(low.planksWithWaste);
  });

  it('нулевой запас при прямой раскладке не добавляет плашки сверх базового числа', () => {
    const result = calculate({ ...base, wastePercent: 0, layoutType: 'straight' });
    expect(result.planksWithWaste).toBe(result.totalPlanks);
  });

  it('площадные поля округляются до не более 2 знаков после запятой', () => {
    const result = calculate({ ...base, width: 3.333, length: 4.567 });
    const decimals = (n: number) => (n.toString().split('.')[1] ?? '').length;
    expect(decimals(result.floorArea)).toBeLessThanOrEqual(2);
    expect(decimals(result.wallArea)).toBeLessThanOrEqual(2);
    expect(decimals(result.perimeter)).toBeLessThanOrEqual(2);
  });
});
