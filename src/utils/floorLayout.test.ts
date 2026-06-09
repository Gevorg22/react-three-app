import { describe, it, expect } from 'vitest';
import { generateHerringbone, generateStraight } from './floorLayout';

const roomW = 4;
const roomL = 5;
const plankLength = 0.6;
const plankWidth = 0.1;
const gap = 0.005;

describe('generateStraight', () => {
  it('возвращает непустой массив', () => {
    const planks = generateStraight(roomW, roomL, plankLength, plankWidth, gap);
    expect(planks.length).toBeGreaterThan(0);
  });

  it('все плашки имеют isHorizontal = false', () => {
    const planks = generateStraight(roomW, roomL, plankLength, plankWidth, gap);
    expect(planks.every(p => p.isHorizontal === false)).toBe(true);
  });

  it('каждая плашка имеет числовые координаты cx и cz', () => {
    const planks = generateStraight(roomW, roomL, plankLength, plankWidth, gap);
    for (const p of planks) {
      expect(typeof p.cx).toBe('number');
      expect(typeof p.cz).toBe('number');
      expect(isFinite(p.cx)).toBe(true);
      expect(isFinite(p.cz)).toBe(true);
    }
  });

  it('для большей комнаты генерируется больше плашек', () => {
    const small = generateStraight(2, 3, plankLength, plankWidth, gap);
    const large = generateStraight(8, 10, plankLength, plankWidth, gap);
    expect(large.length).toBeGreaterThan(small.length);
  });

  it('центры плашек покрывают всю ширину комнаты', () => {
    const planks = generateStraight(roomW, roomL, plankLength, plankWidth, gap);
    const minCx = Math.min(...planks.map(p => p.cx));
    const maxCx = Math.max(...planks.map(p => p.cx));
    expect(minCx).toBeLessThanOrEqual(-roomW / 2);
    expect(maxCx).toBeGreaterThanOrEqual(roomW / 2);
  });

  it('центры плашек покрывают всю длину комнаты', () => {
    const planks = generateStraight(roomW, roomL, plankLength, plankWidth, gap);
    const minCz = Math.min(...planks.map(p => p.cz));
    const maxCz = Math.max(...planks.map(p => p.cz));
    expect(minCz).toBeLessThanOrEqual(-roomL / 2);
    expect(maxCz).toBeGreaterThanOrEqual(roomL / 2);
  });

  it('нечётные ряды смещены на половину длины плашки для разбивки сквозных швов', () => {
    const L = plankLength + gap;
    const W = plankWidth + gap;
    const planks = generateStraight(roomW, roomL, plankLength, plankWidth, gap);

    const rowZero = planks.filter(p => Math.abs(p.cx - (-roomW / 2 + W / 2)) < 1e-9);
    const rowOne = planks.filter(
      p => Math.abs(p.cx - (-roomW / 2 + W / 2 + W)) < 1e-9
    );

    if (rowZero.length > 0 && rowOne.length > 0) {
      const czZero = rowZero[0].cz;
      const czOne = rowOne[0].cz;
      expect(Math.abs(czZero - czOne) % L).toBeCloseTo(L / 2, 5);
    }
  });

  it('при gap = 0 раскладка генерируется корректно', () => {
    const planks = generateStraight(roomW, roomL, plankLength, plankWidth, 0);
    expect(planks.length).toBeGreaterThan(0);
  });
});

describe('generateHerringbone', () => {
  it('возвращает непустой массив', () => {
    const planks = generateHerringbone(roomW, roomL, plankLength, plankWidth, gap);
    expect(planks.length).toBeGreaterThan(0);
  });

  it('содержит плашки обоих направлений', () => {
    const planks = generateHerringbone(roomW, roomL, plankLength, plankWidth, gap);
    expect(planks.some(p => p.isHorizontal === true)).toBe(true);
    expect(planks.some(p => p.isHorizontal === false)).toBe(true);
  });

  it('каждая плашка имеет конечные числовые координаты cx и cz', () => {
    const planks = generateHerringbone(roomW, roomL, plankLength, plankWidth, gap);
    for (const p of planks) {
      expect(isFinite(p.cx)).toBe(true);
      expect(isFinite(p.cz)).toBe(true);
    }
  });

  it('ни один центр плашки не выходит за пределы комнаты более чем на 2×(L+W)', () => {
    const margin = (plankLength + plankWidth) * 2;
    const planks = generateHerringbone(roomW, roomL, plankLength, plankWidth, gap);
    for (const p of planks) {
      expect(Math.abs(p.cx)).toBeLessThan(roomW / 2 + margin + 1e-6);
      expect(Math.abs(p.cz)).toBeLessThan(roomL / 2 + margin + 1e-6);
    }
  });

  it('для большей комнаты генерируется больше плашек', () => {
    const small = generateHerringbone(2, 3, plankLength, plankWidth, gap);
    const large = generateHerringbone(8, 10, plankLength, plankWidth, gap);
    expect(large.length).toBeGreaterThan(small.length);
  });

  it('при gap = 0 раскладка генерируется корректно', () => {
    const planks = generateHerringbone(roomW, roomL, plankLength, plankWidth, 0);
    expect(planks.length).toBeGreaterThan(0);
  });

  it('соотношение горизонтальных к вертикальным плашкам соответствует пропорции длины к ширине плашки', () => {
    const planks = generateHerringbone(roomW, roomL, plankLength, plankWidth, gap);
    const h = planks.filter(p => p.isHorizontal).length;
    const v = planks.filter(p => !p.isHorizontal).length;
    const expectedRatio = plankLength / plankWidth;
    const actualRatio = h / v;
    expect(actualRatio).toBeGreaterThan(expectedRatio * 0.5);
    expect(actualRatio).toBeLessThan(expectedRatio * 2);
  });
});
