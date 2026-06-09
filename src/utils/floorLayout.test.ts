import { describe, it, expect } from 'vitest';
import { generateHerringbone, generateStraight } from './floorLayout';

const roomW = 4;
const roomL = 5;
const plankLength = 0.6;
const plankWidth = 0.1;
const gap = 0.005;

describe('generateStraight', () => {
  it('returns a non-empty array', () => {
    const planks = generateStraight(roomW, roomL, plankLength, plankWidth, gap);
    expect(planks.length).toBeGreaterThan(0);
  });

  it('all planks have isHorizontal = false', () => {
    const planks = generateStraight(roomW, roomL, plankLength, plankWidth, gap);
    expect(planks.every(p => p.isHorizontal === false)).toBe(true);
  });

  it('every plank has numeric cx and cz', () => {
    const planks = generateStraight(roomW, roomL, plankLength, plankWidth, gap);
    for (const p of planks) {
      expect(typeof p.cx).toBe('number');
      expect(typeof p.cz).toBe('number');
      expect(isFinite(p.cx)).toBe(true);
      expect(isFinite(p.cz)).toBe(true);
    }
  });

  it('larger room produces more planks', () => {
    const small = generateStraight(2, 3, plankLength, plankWidth, gap);
    const large = generateStraight(8, 10, plankLength, plankWidth, gap);
    expect(large.length).toBeGreaterThan(small.length);
  });

  it('plank centers cover the room width range', () => {
    const planks = generateStraight(roomW, roomL, plankLength, plankWidth, gap);
    const minCx = Math.min(...planks.map(p => p.cx));
    const maxCx = Math.max(...planks.map(p => p.cx));
    expect(minCx).toBeLessThanOrEqual(-roomW / 2);
    expect(maxCx).toBeGreaterThanOrEqual(roomW / 2);
  });

  it('plank centers cover the room length range', () => {
    const planks = generateStraight(roomW, roomL, plankLength, plankWidth, gap);
    const minCz = Math.min(...planks.map(p => p.cz));
    const maxCz = Math.max(...planks.map(p => p.cz));
    expect(minCz).toBeLessThanOrEqual(-roomL / 2);
    expect(maxCz).toBeGreaterThanOrEqual(roomL / 2);
  });

  it('odd rows are offset by half plankLength to break straight joints', () => {
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

  it('gap = 0 still produces a valid layout', () => {
    const planks = generateStraight(roomW, roomL, plankLength, plankWidth, 0);
    expect(planks.length).toBeGreaterThan(0);
  });
});

describe('generateHerringbone', () => {
  it('returns a non-empty array', () => {
    const planks = generateHerringbone(roomW, roomL, plankLength, plankWidth, gap);
    expect(planks.length).toBeGreaterThan(0);
  });

  it('contains both horizontal and non-horizontal planks', () => {
    const planks = generateHerringbone(roomW, roomL, plankLength, plankWidth, gap);
    expect(planks.some(p => p.isHorizontal === true)).toBe(true);
    expect(planks.some(p => p.isHorizontal === false)).toBe(true);
  });

  it('every plank has finite numeric cx and cz', () => {
    const planks = generateHerringbone(roomW, roomL, plankLength, plankWidth, gap);
    for (const p of planks) {
      expect(isFinite(p.cx)).toBe(true);
      expect(isFinite(p.cz)).toBe(true);
    }
  });

  it('no plank center is more than 2×(L+W) outside the room boundary', () => {
    const margin = (plankLength + plankWidth) * 2;
    const planks = generateHerringbone(roomW, roomL, plankLength, plankWidth, gap);
    for (const p of planks) {
      expect(Math.abs(p.cx)).toBeLessThan(roomW / 2 + margin + 1e-6);
      expect(Math.abs(p.cz)).toBeLessThan(roomL / 2 + margin + 1e-6);
    }
  });

  it('larger room produces more planks', () => {
    const small = generateHerringbone(2, 3, plankLength, plankWidth, gap);
    const large = generateHerringbone(8, 10, plankLength, plankWidth, gap);
    expect(large.length).toBeGreaterThan(small.length);
  });

  it('gap = 0 still produces a valid layout', () => {
    const planks = generateHerringbone(roomW, roomL, plankLength, plankWidth, 0);
    expect(planks.length).toBeGreaterThan(0);
  });

  it('ratio of horizontal to vertical planks approximates plankLength / plankWidth', () => {
    const planks = generateHerringbone(roomW, roomL, plankLength, plankWidth, gap);
    const h = planks.filter(p => p.isHorizontal).length;
    const v = planks.filter(p => !p.isHorizontal).length;
    const expectedRatio = plankLength / plankWidth;
    const actualRatio = h / v;
    expect(actualRatio).toBeGreaterThan(expectedRatio * 0.5);
    expect(actualRatio).toBeLessThan(expectedRatio * 2);
  });
});
