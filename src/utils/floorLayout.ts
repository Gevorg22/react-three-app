import type { PlankInstance } from '../types';

/**
 * Генерирует позиции плашек для раскладки ёлочкой под углом 45° к стенам.
 *
 * Система координат:
 *   Паттерн строится во вращённом пространстве (u, v), где:
 *     ось u направлена на СВ (45°) в мировом пространстве
 *     ось v направлена на СЗ (135°) в мировом пространстве
 *   Мировые координаты восстанавливаются по формулам:
 *     wx = (u - v) / √2
 *     wz = (u + v) / √2
 *
 * Структура повторяющейся пары колонок (ширина = L + W по оси u):
 *   [Г-колонка: u ∈ [0, L]]  [В-колонка: u ∈ [L, L+W]]
 *   Г-плашки: длинная ось вдоль u, шаг W по оси v
 *   В-плашки: длинная ось вдоль v, шаг L по оси v
 *
 * Соседние пары колонок смещены на W по оси v так, чтобы плашки
 * переплетались: через L/W пар смещение возвращается в ноль.
 *
 * Возвращаемые плашки выходят немного за границу комнаты — точная
 * обрезка выполняется плоскостями отсечения, заданными в материале.
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

  // Ширина одной пары колонок по оси u
  const periodU = L + W;

  // Количество В-плашек в цикле смещения (обычно целое, например 6 для 600×100 мм)
  const staggerPeriod = Math.round(L / W);

  // Размах виртуальной сетки в пространстве (u, v): должен покрывать все углы комнаты
  const diagonal = Math.sqrt(roomW * roomW + roomL * roomL) / 2;
  const extent = diagonal + Math.max(L, W) * 4;

  const numPairs = Math.ceil((extent * 2) / periodU) + 4;

  const planks: PlankInstance[] = [];

  for (let ci = -numPairs; ci <= numPairs; ci++) {
    // Левый край Г-колонки для данной пары
    const uH = ci * periodU;
    // Левый край В-колонки для данной пары
    const uV = uH + L;

    // Смещение В-плашек на W за каждую пару; сбрасывается каждые staggerPeriod пар
    const vOffset = ((ci % staggerPeriod) * W + L * 100) % L;

    // --- Г-плашки: центр в (uH + L/2, j*W + W/2) ---
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

    // --- В-плашки: центр в (uV + W/2, k*L + vOffset + L/2) ---
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

  // Отбрасываем плашки, центр которых далеко за пределами комнаты.
  // Точная обрезка по границе выполняется плоскостями отсечения в материале.
  const margin = Math.max(L, W) * 2;
  return planks.filter(
    p => Math.abs(p.cx) < roomW / 2 + margin && Math.abs(p.cz) < roomL / 2 + margin
  );
}

/**
 * Генерирует раскладку плашек палубой (прямая раскладка) параллельно стенам комнаты.
 * Нечётные ряды смещены на половину длины плашки — разбивает сквозные швы.
 * Все плашки ориентированы вдоль оси длины комнаты (Z).
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

  // +2 ряда/столбца, чтобы плашки доходили до краёв после отсечения
  const numRows = Math.ceil(roomW / W) + 2;
  const numCols = Math.ceil(roomL / L) + 2;

  for (let row = -1; row <= numRows; row++) {
    // Смещение через ряд на половину длины плашки — разбивает сквозные швы
    const rowOffset = row % 2 === 0 ? 0 : L / 2;
    for (let col = -1; col <= numCols; col++) {
      const cx = row * W - halfW + W / 2;
      const cz = col * L - halfL + L / 2 + rowOffset;
      planks.push({ cx, cz, isHorizontal: false });
    }
  }

  return planks;
}
