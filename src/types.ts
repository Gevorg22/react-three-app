export interface RoomParams {
  width: number;
  length: number;
  height: number;
  plankLength: number;
  plankWidth: number;
  gap: number;
  layoutType: 'herringbone' | 'straight';
  wastePercent: number;
  wallColor: string;
}

export interface PlankInstance {
  cx: number;
  cz: number;
  isHorizontal: boolean;
}

export interface RoomCalculations {
  floorArea: number;
  wallArea: number;
  perimeter: number;
  totalPlanks: number;
  planksWithWaste: number;
  paintLiters: number;
  baseboardMeters: number;
}
