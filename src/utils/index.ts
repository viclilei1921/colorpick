import { HSLType, HSVType, RGBType } from '../components/interface';
import { GradientColor, GradientElement } from './GradientColor';

export * from './GradientColor';

export enum PickColorType {
  Color,
  GradientColor,
  Image
}

export function parseGradientString(gradientString: string) {
  const gs = gradientString.replace('linear-gradient(', '').replace(')', '').trim();
  const array = gs.split(',');

  const direction = array[0];
  array.splice(0, 1);
  const gradient: GradientElement[] = [];
  array.forEach((item: string) => {
    gradient.push({
      color: item.trim().split(' ')[0],
      position: item.trim().split(' ')[1]
    });
  });

  return new GradientColor(direction, gradient);
}

// **************************
// ********color func********
// **************************

/**
 * hex to rgb
 * @param hex #ffffff;
 * @returns rgb [255, 255, 255]
 */
export function hexToRgb(hex: string): RGBType {
  const arr = [];
  hex = hex.toLowerCase();
  if (hex.length === 4) {
    let shex = '#';
    for (let i = 1; i < 4; i += 1) {
      shex += hex.slice(i, i + 1).concat(hex.slice(i, i + 1));
    }
    hex = shex;
  }
  for (let i = 1; i < 7; i += 2) {
    arr.push(parseInt('0x' + hex.slice(i, i + 2)));
  }
  return arr as RGBType;
}

/**
 * rgb to hex
 * @param rgb [255, 255, 255]
 * @returns #ffffff
 */
export function rgbToHex([r, g, b]: RGBType): string {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b << 0).toString(16).slice(1);
}

/**
 * rgb to hsv
 * @param rgb [255, 255, 255]
 * @returns hsv [0.3333, 1, 1]
 */
export function rgbToHsv([r, g, b]: RGBType): HSVType {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h = 0;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h, s, max];
}

export function rgbToHsl([r, g, b]: RGBType): HSLType {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h, s, l];
}

/**
 * hsv to rgb
 * @param hsv [0.3333, 1, 1]
 * @returns rgb [255, 255, 255]
 */
export function hsvToRgb([h, s, v]: HSVType): RGBType {
  h *= 6;
  const i = Math.floor(h),
    f = h - i,
    p = v * (1 - s),
    q = v * (1 - f * s),
    t = v * (1 - (1 - f) * s),
    mod = i % 6,
    r = Math.round([v, q, p, p, t, v][mod] * 255),
    g = Math.round([t, v, v, q, p, p][mod] * 255),
    b = Math.round([p, p, t, v, v, q][mod] * 255);
  return [r, g, b];
}

export function hslToRgb([h, s, l]: HSLType): RGBType {
  let r = l, g = l, b = l;
  if (s !== 0) {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function hue2rgb(p: number, q: number, t: number) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

// *******************************

/**
 * 将值限定在范围内
 * @param value 值
 * @param min 最小值
 * @param max 最大值
 * @returns 范围值
 */
export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/**
 * 判断hex颜色格式是否合格
 * @param hex #fff #000000
 * @returns 是否为合格的颜色
 */
export function isValidHex(hex: string): boolean {
  if (hex.length === 4) {
    return Boolean(/^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/.exec(hex));
  }
  if (hex.length === 7) {
    return Boolean(/^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/.exec(hex));
  }
  return false;
}

/**
   *
   * @param fn 要执行的函数
   * @param awit  时间
   * @param immediate 是否在触发事件后 在时间段n开始，立即执行，否则是时间段n结束，才执行
   */
// eslint-disable-next-line @typescript-eslint/ban-types
export function debounce<T extends Function>(cb: T, wait = 20) {
  let h = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const callable = (...args: any) => {
    clearTimeout(h);
    h = setTimeout(() => cb(...args), wait);
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <T>(<any>callable);
}
