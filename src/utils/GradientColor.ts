import { clamp } from '.';

export interface GradientElement {
  color: string
  position: string
}

const DefaultGradient = [{ color: '#ffffff', position: '0%' }, { color: '#000000', position: '100%' }];

export class GradientColor {
  private _direction: string;
  private _gradient: GradientElement[] = DefaultGradient;
  constructor(direction: string = '90deg', gradient?: GradientElement[]) {
    this._direction = direction;
    gradient && (this.gradient = gradient);
  }

  get gradient(): GradientElement[] {
    return this._gradient;
  }

  set gradient(g: GradientElement[]) {
    g.sort((a, b) => {
      return parseFloat(a.position.replace('%', '')) - parseFloat(b.position.replace('%', ''));
    });
    this._gradient = g;
  }

  set direction(d: number) {
    clamp(d, 0, 360);
    this._direction = `${d}deg`;
  }

  get direction() {
    return parseInt(this._direction);
  }

  setGradientIndex(i: number, color: string) {
    if (i >= this._gradient.length) {
      return;
    }
    this.gradient[i].color = color;
  }

  toString (): string {
    let str = '';
    this._gradient.forEach(g => {
      str += `${g.color} ${g.position},`;
    });
    return `linear-gradient(${this._direction},${str.substring(0, str.length - 1)})`;
  }
}
