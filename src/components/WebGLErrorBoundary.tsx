import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class WebGLErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="webgl-error">
          <div className="webgl-error-box">
            <h2>WebGL недоступен</h2>
            <p>Chrome заблокировал аппаратное ускорение. Чтобы исправить:</p>
            <ol>
              <li>
                Откройте <code>chrome://settings/system</code> и включите{' '}
                <strong>«Использовать аппаратное ускорение»</strong>
              </li>
              <li>Перезапустите браузер</li>
              <li>
                Или откройте <code>chrome://flags/#use-angle</code> →{' '}
                <strong>Default</strong> или <strong>OpenGL</strong>
              </li>
            </ol>
            <p className="error-detail">Техническая деталь: {this.state.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function checkWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const ctx =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return !!ctx;
  } catch {
    return false;
  }
}
