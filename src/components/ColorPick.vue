<script setup lang="ts">
import { provide, ref } from 'vue';
import { GradientColor, GradientElement, PickColorType, hexToRgb, parseGradientString, rgbToHsl, rgbToHsv } from '../utils';
import { ColorPickKey } from './constants';
import Sketch from './Sketch.vue';

interface EmitType {
  (e: 'changeStart'): void
  (e: 'change', color: string):void
  (e: 'changeEnd', color: string): void
  (e: 'changeMode', color: string): void
}

export interface ColorPickProps {
  /** 颜色 */
  color?: string
  width?: number
  type?: PickColorType
  typeList?: PickColorType[]
  recentColor?: string[]
  recentGradient?: string[]
}

const emits = defineEmits<EmitType>();

// *************************************
// ********** 组件开始数据初始化 **********
// *************************************
const props = withDefaults(defineProps<ColorPickProps>(), {
  /** 颜色 */
  color: '#ffffff',
  width: 280,
  type: PickColorType.Color,
  typeList: () => [PickColorType.Color, PickColorType.GradientColor],
  recentColor: () => [],
  recentGradient: () => []
});

let nowColor = props.color;
/** 用于后续切换模式记录颜色 */
let preColor: string = props.color;
let gradient = new GradientColor();
const gDeg = ref(0);
const gList = ref<GradientElement[]>([]);
const nowRecent = ref(props.recentColor);
if (props.type === PickColorType.GradientColor) {
  gradient = parseGradientString(props.color);
  nowColor = gradient.gradient[0].color;
  gDeg.value = gradient.direction;
  gList.value = gradient.gradient;
  preColor = '#ffffff';
  nowRecent.value = props.recentGradient;
}
const color = ref(props.color);
const rgb = ref(hexToRgb(nowColor));
const hex = ref(nowColor);
const hsv = ref(rgbToHsv(rgb.value));
const hsl = ref(rgbToHsl(rgb.value));
const type = ref(props.type);
const gIndex = ref(0);
const typeObj = ref(props.typeList.map(t => ({ type: t, text: _getTypeText(t) })));

provide(ColorPickKey, {
  color,
  colorAlpha: ref(1),
  alpha: ref(false),
  disableFields: ref(false),
  type,
  hex,
  rgb,
  hsv,
  hsl,
  gIndex,
  gDeg,
  gList
});

function change() {
  if (type.value === PickColorType.GradientColor) {
    gList.value[gIndex.value].color = hex.value;
    gradient.gradient = gList.value;
    gradient.direction = gDeg.value;
    color.value = gradient.toString();
  } else {
    color.value = hex.value;
  }
  emits('change', color.value);
}
function changeEnd() {
  if (type.value === PickColorType.GradientColor) {
    gList.value[gIndex.value].color = hex.value;
    gradient.gradient = gList.value;
    gradient.direction = gDeg.value;
    color.value = gradient.toString();
  } else {
    color.value = hex.value;
  }
  emits('changeEnd', color.value);
}
function changeStart() {
  emits('changeStart');
}

function changeColorType(t: PickColorType) {
  if (type.value === t) return;
  type.value = t;
  if (t === PickColorType.Color) {
    color.value = preColor;
    hex.value = preColor;
    rgb.value = hexToRgb(preColor);
    hsv.value = rgbToHsv(rgb.value);
    hsl.value = rgbToHsl(rgb.value);
    nowRecent.value = props.recentColor;
  }
  if (t === PickColorType.GradientColor) {
    preColor = color.value;
    gDeg.value = gradient.direction;
    gList.value = gradient.gradient;
    color.value = gradient.toString();
    hex.value = gradient.gradient[gIndex.value].color;
    rgb.value = hexToRgb(hex.value);
    hsv.value = rgbToHsv(rgb.value);
    hsl.value = rgbToHsl(rgb.value);
    nowRecent.value = props.recentGradient;
  }
  emits('changeMode', color.value);
}

function onRecentClick(c: string) {
  if (type.value === PickColorType.Color) {
    color.value = c;
    hex.value = preColor;
    rgb.value = hexToRgb(preColor);
    hsv.value = rgbToHsv(rgb.value);
    hsl.value = rgbToHsl(rgb.value);
  }
  if (type.value === PickColorType.GradientColor) {
    color.value = c;
    gradient = parseGradientString(c);
    gIndex.value = 0;
    gDeg.value = gradient.direction;
    gList.value = gradient.gradient;
    hex.value = gradient.gradient[0].color;
    rgb.value = hexToRgb(hex.value);
    hsv.value = rgbToHsv(rgb.value);
    hsl.value = rgbToHsl(rgb.value);
  }
  emits('changeEnd', color.value);
}

function _getTypeText(t: PickColorType): string {
  if (t === PickColorType.Color) {
    return '纯色';
  }
  if (t === PickColorType.GradientColor) {
    return '渐变';
  }
  return '';
}

</script>
<template>
  <div
    class="color-pick"
  >
    <div
      v-if="nowRecent.length"
      class="recent-box"
    >
      <div>最近使用的颜色</div>
      <ul>
        <li
          v-for="c, i in nowRecent"
          :key="i"
          :style="{background: c}"
          @click="onRecentClick(c)"
        ></li>
      </ul>
    </div>
    <div
      v-if="typeList.length > 1"
      class="color-mode"
    >
      <div
        v-for="t, i in typeObj"
        :key="i"
        :class="[ t.type === type && 'active']"
        @click="changeColorType(t.type)"
      >
        <span>{{ t.text }}</span>
      </div>
    </div>
    <Sketch
      @change-start="changeStart"
      @change="change"
      @change-end="changeEnd"
    ></Sketch>
  </div>
</template>
<style lang="less" scoped>
.color-pick {
  position: absolute;
  width: 280px;
  height: fit-content;
  background-color: #fff;
  border-radius: 4px;
  padding: 20px 20px 24px;
  box-sizing: border-box;
  border: 1px solid #ddd;
  color: #272d4d;
}

.color-mode {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 36px;
  background-color: #f8f8fc;
  border-radius: 4px;
  margin: 0 auto 16px;
  padding: 0 4px;

  > div {
    flex-grow: 1;
    height: 28px;
    line-height: 28px;
    text-align: center;
    cursor: pointer;
    > span {
      z-index: 4;
      position: relative;
    }
  }
  .active {
    font-weight: bold;
    position: relative;
    &::after {
      border-radius: 4px;
      background: linear-gradient(180deg, #c9baff 0%, rgba(242, 230, 255, 0) 100%);
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      top: 0;
    }
    &::before {
      background: #fff linear-gradient(180deg, rgba(194, 155, 252, 0.11) 0%, rgba(175, 138, 251, 0) 100%);
      content: '';
      position: absolute;
      border-radius: 4px;
      left: 0px;
      right: 0px;
      bottom: 0;
      top: 1px;
      z-index: 2;
    }
  }
}

.recent-box {
    margin-bottom: 15px;

    ul {
      padding: 0;
      margin: 0;
      list-style: none;
      display: grid;
      margin-top: 10px;
      grid-row-gap: 5px;
      grid-template-columns: repeat(6, 34px);

      & > li {
        width: 34px;
        height: 34px;
        border-radius: 4px;
        cursor: pointer;
        overflow: hidden;
        box-sizing: border-box;

        &:hover {
          box-shadow: 0px 0px 0px 1px #B787FF;
        }
      }
    }

    &.brand-color-box {
      margin-bottom: 0;
      margin-top: 12px;
      .brand-color {
        padding: 0 20px;
      }
      ul {
        width: 238px;
        margin-top: 0;
      }
    }
    .brand-color-box-scoll {
      padding: 0 20px;
      overflow-x: hidden;
      overflow-y: auto;
      max-height: 74px;
      margin-top: 10px;
    }
  }
</style>
