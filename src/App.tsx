import { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import Room from './components/Room';
import ControlPanel from './components/ControlPanel';
import { WebGLErrorBoundary, checkWebGL } from './components/WebGLErrorBoundary';
import type { RoomParams } from './types';
import { calculate } from './utils/calculations';

const DEFAULT_PARAMS: RoomParams = {
  width: 4,
  length: 5,
  height: 2.7,
  plankLength: 0.6,
  plankWidth: 0.1,
  gap: 0.005,
  layoutType: 'herringbone',
  wastePercent: 10,
  wallColor: '#e8e2d8',
};

const webglAvailable = checkWebGL();

function NoWebGL() {
  return (
    <div className="webgl-error">
      <div className="webgl-error-box">
        <h2>WebGL недоступен</h2>
        <p>Chrome заблокировал аппаратное ускорение. Чтобы исправить:</p>
        <ol>
          <li>
            Откройте <code>chrome://settings/system</code> и включите{' '}
            <strong>«Использовать аппаратное ускорение (GPU)»</strong>
          </li>
          <li>Перезапустите браузер</li>
          <li>
            Или откройте в <strong>Firefox / Safari</strong> — там WebGL работает по умолчанию
          </li>
        </ol>
      </div>
    </div>
  );
}

export default function App() {
  const [params, setParams] = useState<RoomParams>(DEFAULT_PARAMS);
  const calculations = useMemo(() => calculate(params), [params]);

  const cameraPos = useMemo<[number, number, number]>(
    () => [params.width * 0.9, params.height * 2.2, params.length * 1.1],
    []
  );

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>🏠 3D Конфигуратор</h1>
          <p>Интерактивная визуализация интерьера</p>
        </div>
        <ControlPanel params={params} calculations={calculations} onChange={setParams} />
      </div>

      <div className="canvas-wrapper">
        {!webglAvailable ? (
          <NoWebGL />
        ) : (
          <WebGLErrorBoundary>
            <Canvas
              shadows={{ type: THREE.PCFShadowMap }}
              camera={{
                position: cameraPos,
                fov: 50,
                near: 0.1,
                far: 100,
              }}
              gl={{
                antialias: true,
                failIfMajorPerformanceCaveat: false,
                powerPreference: 'default',
                localClippingEnabled: true,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.05,
              }}
            >
              <Room params={params} />
            </Canvas>
          </WebGLErrorBoundary>
        )}
        <div className="canvas-hint">
          Левая кнопка — вращение · Правая — перемещение · Колесо — зум
        </div>
      </div>
    </div>
  );
}
