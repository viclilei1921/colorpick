import { type Ref } from 'vue';
import { GradientElement, PickColorType } from '..';

export type ColorPickInjectType = {
  color: Ref<string>
  colorAlpha: Ref<number>
  alpha: Ref<boolean>
  disableFields: Ref<boolean>
  type: Ref<PickColorType>
  hex: Ref<string>
  rgb: Ref<RGBType>
  hsv: Ref<HSVType>
  hsl: Ref<HSLType>
  gIndex: Ref<number>
  gDeg: Ref<number>
  gList: Ref<GradientElement[]>
}

/** rgb rgb[0-255] */
export type RGBType = [number, number, number];

/** h:色调[0-1],s:饱和度[0-1],v:明度[0-1] */
export type HSVType = [number, number, number];

/** h:色调[0-1],s:饱和度[0-1],l:明度[0-1] */
export type HSLType = [number, number, number];
