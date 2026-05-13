import type { RoomParams, RoomCalculations } from '../types';

interface ControlPanelProps {
  params: RoomParams;
  calculations: RoomCalculations;
  onChange: (params: RoomParams) => void;
}

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}

function SliderRow({ label, value, min, max, step, unit, onChange }: SliderRowProps) {
  return (
    <div className="slider-row">
      <div className="slider-label">
        <span>{label}</span>
        <span className="slider-value">
          {value.toFixed(step < 0.01 ? 3 : step < 0.1 ? 2 : 1)} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="slider"
      />
    </div>
  );
}

export default function ControlPanel({ params, calculations, onChange }: ControlPanelProps) {
  const set = (key: keyof RoomParams) => (v: number | string) =>
    onChange({ ...params, [key]: v });

  return (
    <div className="panel">
      <div className="panel-section">
        <h3 className="section-title">Параметры комнаты</h3>

        <SliderRow
          label="Ширина"
          value={params.width}
          min={2}
          max={12}
          step={0.1}
          unit="м"
          onChange={set('width') as (v: number) => void}
        />
        <SliderRow
          label="Длина"
          value={params.length}
          min={2}
          max={12}
          step={0.1}
          unit="м"
          onChange={set('length') as (v: number) => void}
        />
        <SliderRow
          label="Высота"
          value={params.height}
          min={2.2}
          max={4}
          step={0.05}
          unit="м"
          onChange={set('height') as (v: number) => void}
        />
        <div className="color-row">
          <span className="color-label">Цвет стен</span>
          <input
            type="color"
            value={params.wallColor}
            onChange={e => onChange({ ...params, wallColor: e.target.value })}
            className="color-picker"
          />
        </div>
      </div>

      <div className="panel-section">
        <h3 className="section-title">Параметры плашки</h3>

        <SliderRow
          label="Длина плашки"
          value={params.plankLength}
          min={0.3}
          max={1.2}
          step={0.05}
          unit="м"
          onChange={set('plankLength') as (v: number) => void}
        />
        <SliderRow
          label="Ширина плашки"
          value={params.plankWidth}
          min={0.06}
          max={0.2}
          step={0.01}
          unit="м"
          onChange={set('plankWidth') as (v: number) => void}
        />
        <SliderRow
          label="Зазор (шов)"
          value={params.gap}
          min={0}
          max={0.01}
          step={0.001}
          unit="м"
          onChange={set('gap') as (v: number) => void}
        />
        <SliderRow
          label="Запас материала"
          value={params.wastePercent}
          min={5}
          max={30}
          step={1}
          unit="%"
          onChange={set('wastePercent') as (v: number) => void}
        />
      </div>

      <div className="panel-section">
        <h3 className="section-title">Раскладка</h3>
        <div className="layout-toggle">
          <button
            className={`toggle-btn ${params.layoutType === 'herringbone' ? 'active' : ''}`}
            onClick={() => onChange({ ...params, layoutType: 'herringbone' })}
          >
            Ёлочка
          </button>
          <button
            className={`toggle-btn ${params.layoutType === 'straight' ? 'active' : ''}`}
            onClick={() => onChange({ ...params, layoutType: 'straight' })}
          >
            Прямая
          </button>
        </div>
      </div>

      <div className="panel-section calculations">
        <h3 className="section-title">Расчёты</h3>
        <div className="calc-grid">
          <div className="calc-item">
            <span className="calc-label">Площадь пола</span>
            <span className="calc-value">{calculations.floorArea} м²</span>
          </div>
          <div className="calc-item">
            <span className="calc-label">Площадь стен</span>
            <span className="calc-value">{calculations.wallArea} м²</span>
          </div>
          <div className="calc-item">
            <span className="calc-label">Периметр / плинтус</span>
            <span className="calc-value">{calculations.baseboardMeters} п.м.</span>
          </div>
          <div className="calc-item">
            <span className="calc-label">Краска (2 слоя, 8 м²/л)</span>
            <span className="calc-value">{calculations.paintLiters} л</span>
          </div>
          <div className="calc-item">
            <span className="calc-label">Плашек (без запаса)</span>
            <span className="calc-value">{calculations.totalPlanks} шт.</span>
          </div>
          <div className="calc-item highlight">
            <span className="calc-label">
              Плашек (с запасом {params.wastePercent}%
              {params.layoutType === 'herringbone' ? ' +5% ёлочка' : ''})
            </span>
            <span className="calc-value">{calculations.planksWithWaste} шт.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
