<script lang="ts" setup>
import { computed, inject, ref } from 'vue';
import { ColorPickKey } from './constants';
import { ColorPickInjectType, RGBType } from './interface';
import { clamp, hslToRgb, hsvToRgb, isValidHex, rgbToHex, rgbToHsl, rgbToHsv } from '../utils';
import { PickColorType, debounce, hexToRgb } from '..';
import html2canvas from 'html2canvas';

interface EmitType {
  (e: 'strawClick', event: MouseEvent): void
  (e: 'changeStart'): void
  (e: 'change'):void
  (e: 'changeEnd'): void
}

const emits = defineEmits<EmitType>();

const SaturationDom = ref<HTMLDivElement | null>(null);
const HueDom = ref<HTMLDivElement | null>(null);

const {
  color,
  alpha,
  rgb,
  disableFields,
  hex,
  hsv,
  hsl,
  gIndex,
  gList,
  gDeg,
  type
} = inject(ColorPickKey) as ColorPickInjectType;

const activeColor = computed(() => `rgba(${rgb.value.join(',')},1)`);

const showAngleBox = ref(false);

// *************************************
// ************ saturation *************
// *************************************
function handleSaturationChange(e: TouchEvent | MouseEvent) {
  if (!SaturationDom.value) return;

  const { clientWidth, clientHeight } = SaturationDom.value;
  const { left, top } = SaturationDom.value.getBoundingClientRect();
  const pageX = (e as MouseEvent).pageX || ((e as TouchEvent).touches ? (e as TouchEvent).touches[0].pageX : 0);
  const pageY = (e as MouseEvent).pageY || ((e as TouchEvent).touches ? (e as TouchEvent).touches[0].pageY : 0);
  const l = clamp(pageX - left - window.scrollX, 0, clientWidth);
  const t = clamp(pageY - top - window.scrollY, 0, clientHeight);
  const s = l / clientWidth;
  const b = clamp(-(t / clientHeight) + 1, 0, 1);

  hsv.value[1] = s;
  hsv.value[2] = b;
  rgb.value = hsvToRgb(hsv.value);
  hex.value = rgbToHex(rgb.value);
  hsl.value = rgbToHsl(rgb.value);
  emits('change');
}

function handleSaturationMouseUp() {
  emits('changeEnd');
  window.removeEventListener('mousemove', handleSaturationChange);
  window.removeEventListener('mouseup', handleSaturationChange);
  window.removeEventListener('mouseup', handleSaturationMouseUp);
}

function handleSaturationMouseDown() {
  emits('changeStart');
  window.addEventListener('mousemove', handleSaturationChange);
  window.addEventListener('mouseup', handleSaturationChange);
  window.addEventListener('mouseup', handleSaturationMouseUp);
}
// *************************************
// **************   hue  ***************
// *************************************
function handleHueChange(e: TouchEvent | MouseEvent) {
  if (!HueDom.value) return;

  const { clientWidth } = HueDom.value;
  const { left } = HueDom.value.getBoundingClientRect();
  const pageX = (e as MouseEvent).pageX || ((e as TouchEvent).touches ? (e as TouchEvent).touches[0].pageX : 0);
  const l = clamp(pageX - left - window.scrollX, 0, clientWidth);

  hsl.value[0] = l / clientWidth;
  rgb.value = hslToRgb(hsl.value);
  hex.value = rgbToHex(rgb.value);
  hsv.value = rgbToHsv(rgb.value);
  emits('change');
}

function handleHueMouseUp() {
  emits('changeEnd');
  window.removeEventListener('mousemove', handleHueChange);
  window.removeEventListener('mouseup', handleHueChange);
  window.removeEventListener('mouseup', handleHueMouseUp);
}

function handleHueMouseDown() {
  emits('changeStart');
  window.addEventListener('mousemove', handleHueChange);
  window.addEventListener('mouseup', handleHueChange);
  window.addEventListener('mouseup', handleHueMouseUp);
}

// *************************************
// ************ rgb input **************
// *************************************
function updateRGB(e: Event, p: 0 | 1 | 2) {
  const value = Math.round(+(e.target as HTMLInputElement).value);
  rgb.value[p] = clamp(value, 0, 255);
  hex.value = rgbToHex(rgb.value);
  hsv.value = rgbToHsv(rgb.value);
  hsl.value = rgbToHsl(rgb.value);
  emits('change');
}

function updateColor(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  if (isValidHex(value)) {
    hex.value = value;
    rgb.value = hexToRgb(value);
    hsv.value = rgbToHsv(rgb.value);
    hsl.value = rgbToHsl(rgb.value);
    emits('change');
  }
}

function blurColor(e: FocusEvent) {
  const value = (e.target as HTMLInputElement).value;
  if (!isValidHex(value)) {
    hex.value = '#FFFFFF';
    rgb.value = hexToRgb(hex.value);
    hsv.value = rgbToHsv(rgb.value);
    hsl.value = rgbToHsl(rgb.value);
  }
  emits('changeEnd');
}

// *************************************
// ************ gradient  **************
// *************************************
function changeGIndex(i: number) {
  gIndex.value = i;
  hex.value = gList.value[i].color;
  rgb.value = hexToRgb(hex.value);
  hsv.value = rgbToHsv(rgb.value);
  hsl.value = rgbToHsl(rgb.value);
}
function handleTrackClick(e: MouseEvent) {
  // todo
  if (gList.value.length >= 5) return;
  const targetRect = (e.target as HTMLDivElement).getBoundingClientRect();
  const disX = e.pageX - targetRect.x;
  const dis = parseFloat((disX / targetRect.width).toFixed(4));
  const content = (e.target as HTMLDivElement).parentNode as HTMLDivElement;
  const width = content.offsetWidth;
  const height = content.offsetHeight;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.fillStyle = '#ffffff';
  const grd = ctx.createLinearGradient(0, 0, width, 0);
  for (const item of gList.value) {
    const pos = item.position;
    const per = +pos.replace('%', '') / 100;
    grd.addColorStop(per, item.color);
  }
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, width, height);
  const imageData = ctx.getImageData(disX, 8, 1, 1);
  const hex = rgbToHex(imageData.data as unknown as RGBType);
  gList.value.push({
    color: hex,
    position: dis * 100 + '%'
  });
  gList.value.sort((a, b) => {
    return parseFloat(a.position.replace('%', '')) - parseFloat(b.position.replace('%', ''));
  });
  const index = gList.value.findIndex(item => {
    return item.position === dis * 100 + '%';
  });
  changeGIndex(index);
  emits('changeEnd');
}
let GradientDomInfo: DOMRect | undefined;
function handleGradientDown(e: MouseEvent, i: number) {
  e.preventDefault();
  GradientDomInfo = ((e.target as HTMLDivElement).parentNode?.parentNode as HTMLDivElement)?.getBoundingClientRect();
  showAngleBox.value = false;
  changeGIndex(i);
  emits('changeStart');
  document.addEventListener('mousemove', handleGradientMove);
  document.addEventListener('mouseup', handleGradientUp);
}
function handleGradientMove(e: MouseEvent) {
  if (!GradientDomInfo) return;
  const dis = clamp(parseFloat(((e.pageX - GradientDomInfo.x) / GradientDomInfo.width).toFixed(4)), 0, 1) * 100;
  gList.value[gIndex.value].position = dis + '%';
  emits('change');
}
function handleGradientUp() {
  emits('changeEnd');
  document.removeEventListener('mousemove', handleGradientMove);
  document.removeEventListener('mouseup', handleGradientUp);
}

function updateGDeg(e: Event) {
  const value = Math.round(+(e.target as HTMLInputElement).value);
  gDeg.value = clamp(value, 0, 360);
  emits('change');
}
function blurGDeg() {
  emits('changeEnd');
}

let RotateDomInfo: DOMRect | undefined;
function handleRotateMouseDown(e: MouseEvent) {
  e.preventDefault();
  RotateDomInfo = (e.target as HTMLDivElement)?.getBoundingClientRect();
  document.addEventListener('mousemove', handleRotateMouseMove);
  document.addEventListener('mouseup', handleRotateMouseUp);
  emits('changeStart');
}

// 渐变角度托盘按下后移动
function handleRotateMouseMove(e: MouseEvent) {
  // 数据收集
  e.preventDefault();
  if (!RotateDomInfo) return;
  const { x, y, width, height } = RotateDomInfo;
  const { pageX: currentX, pageY: currentY } = e;
  const startX = x + width / 2;
  const startY = y;
  const center = {
    x: x + width / 2,
    y: y + height / 2
  };
  const before = Math.atan2(startY - center.y, startX - center.x) / (Math.PI / 180);
  const after = Math.atan2(currentY - center.y, currentX - center.x) / (Math.PI / 180);

  let deg = Math.ceil(after - before);
  if (Math.ceil(after - before) < 0) {
    deg = deg + 360;
  }
  if (deg > 360) {
    const num = Math.floor(deg / 360);
    deg = deg - num * 360;
  }
  gDeg.value = deg;
  emits('change');
}
function handleRotateMouseUp() {
  emits('changeEnd');
  document.removeEventListener('mousemove', handleRotateMouseMove);
  document.removeEventListener('mouseup', handleRotateMouseUp);
}

// *************************************
// *************  拾色器  ***************
// *************************************
let strawing = false;
let strawPreviewDom: HTMLDivElement | undefined;
async function strawColor(e: MouseEvent) {
  if (strawing) return;
  strawing = true;
  const [width, height] = [document.body.offsetWidth, document.body.offsetHeight];
  const windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  const scale = 2;
  try {
    const res = await html2canvas(document.body, {
      scale: scale,
      logging: true,
      width: width,
      height: height,
      allowTaint: false,
      useCORS: true
    });
    const base64 = res.toDataURL('image/jpeg', 1);
    const canvas = document.createElement('canvas');
    canvas.id = 'colorPickerCanvas';
    canvas.width = windowWidth;
    canvas.height = windowHeight;
    canvas.style.position = 'fixed';
    canvas.style.zIndex = '9998';
    canvas.style.top = '0px';
    canvas.style.left = '0px';
    canvas.style.width = `${windowWidth}px`;
    canvas.style.height = `${windowHeight}px`;
    canvas.style.cursor = 'crosshair';
    canvas.style.opacity = '0';
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    // 加个白色背景，防止一些没有颜色的、透明的，在吸色时出现问题(色值不对， 0 0 0 0)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const captureImgMuti = img.width / windowWidth;
      ctx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        0,
        0,
        img.width / captureImgMuti,
        img.height / captureImgMuti
      );
    };
    document.body.appendChild(canvas);
    const showDom = document.createElement('div');
    showDom.id = 'straw-preview-div';
    showDom.innerHTML = '<div class="inner"></div><div class="squre"></div><div class="bd"></div>';
    strawPreviewDom = showDom;
    document.body.appendChild(strawPreviewDom);
    _handleMove(ctx, e);
    const wrapperMoveFunc = (e: MouseEvent) => {
      _handleMove(ctx, e);
    };
    // 窗口大小改变时，重新截图 mousedown
    const wrapperResizeFunc = debounce(() => {
      _handleResize(ctx, canvas);
    }, 150);
    const down = (e: MouseEvent) => {
      document.body.removeChild(strawPreviewDom as HTMLDivElement);
      document.removeEventListener('mousemove', wrapperMoveFunc);
      window.removeEventListener('resize', wrapperResizeFunc);
      document.body.removeChild(document.getElementById('colorPickerCanvas') as Node);
      strawing = false;
      if (e.button === 0) {
        colorForPick(_handleMove(ctx, e));
      }
      e.preventDefault();
      e.stopPropagation();
    };
    document.addEventListener('mousemove', wrapperMoveFunc);
    window.addEventListener('resize', wrapperResizeFunc);

    strawPreviewDom.addEventListener('mousedown', down);
    strawPreviewDom.addEventListener('pointerdown', down);
    strawPreviewDom.addEventListener('contextmenu', down);
  } catch (error) {
    console.error(error);
  }
}

function _handleMove(ctx: CanvasRenderingContext2D, e: MouseEvent) {
  if (!strawPreviewDom) return hex.value;
  const imageData = ctx.getImageData(e.pageX, e.pageY, 1, 1);
  strawPreviewDom.style.left = e.pageX - 70 + 'px';
  strawPreviewDom.style.top = e.pageY - 70 + 'px';

  // 不带透明度
  const hex8 = rgbToHex(imageData.data as unknown as RGBType);
  (strawPreviewDom.childNodes[0] as HTMLDivElement).style.borderColor = hex8;
  (strawPreviewDom.childNodes[1] as HTMLDivElement).style.backgroundColor = hex8;
  return hex8;
}

async function _handleResize(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  // resize 重新截图，重新画
  const content = document.body; // (document as any).getElementById("app");
  const width = content.offsetWidth;
  const height = content.offsetHeight;
  const scale = 2;

  canvas.width = width * scale;
  canvas.height = height * scale;

  const res = await html2canvas(content, {
    scale: 2,
    logging: true,
    width: width,
    height: height,
    allowTaint: false,
    useCORS: true
  });
  const base64 = res.toDataURL('image/jpeg', 1);
  const img = new Image();
  img.src = base64;
  img.onload = () => {
    const captureImgMuti = img.width / window.innerWidth;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width / captureImgMuti, img.height / captureImgMuti);
  };
}

function colorForPick(color: string) {
  hex.value = color;
  rgb.value = hexToRgb(color);
  hsv.value = rgbToHsv(rgb.value);
  hsl.value = rgbToHsl(rgb.value);

  emits('changeEnd');
}
</script>
<template>
  <div
    class="vc-sketch"
    @click="showAngleBox = false"
  >
    <!-- 渐变 -->
    <div
      v-if="type === PickColorType.GradientColor"
      class="vc-sketch-gradient"
    >
      <div
        class="vc-gradient-track"
        :style="{backgroundImage: color}"
      >
        <div
          class="track-content"
          @click="handleTrackClick"
        >
          <div
            v-for="g, i in gList"
            :key="i"
            class="gradient-item"
            :style="{left: `calc(${g.position} - 10px)`}"
            :class="[ gIndex === i && 'active']"
            @click.stop="changeGIndex(i)"
            @mousedown="handleGradientDown($event, i)"
          >
            <div :style="{backgroundColor: g.color}"></div>
          </div>
        </div>
      </div>
      <div class="vc-gradient-angle">
        <div
          class="angle-input-box"
          @click.stop="showAngleBox = !showAngleBox"
        >
          <input
            max="360"
            min="0"
            :value="gDeg"
            @input="updateGDeg"
            @blur="blurGDeg"
          />
          <span>°</span>
        </div>
        <div
          v-show="showAngleBox"
          class="rotate-box"
        >
          <div
            class="rotate-area"
            :style="{ transform: `rotate(${gDeg}deg)` }"
            @mousedown="handleRotateMouseDown($event)"
          >
            <div class="rotate-show">
              <span class="rotate-ball"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="vc-sketch-saturation-wrap">
      <div
        ref="SaturationDom"
        class="vc-saturation"
        :style="{background: `hsl(${hsv[0] * 360}, 100%, 50%)`}"
        @mousedown="handleSaturationMouseDown"
        @touchmove="handleSaturationChange"
        @touchstart="handleSaturationChange"
      >
        <div class="vc-saturation--white"></div>
        <div class="vc-saturation--black"></div>
        <div
          class="vc-saturation-pointer"
          :style="{top: `${101 - hsv[2]*100}%`, left: `${hsv[1]*100}%`}"
        >
          <div class="vc-saturation-circle"></div>
        </div>
      </div>
    </div>
    <div class="vc-sketch-controls vc-sketch-controls-box">
      <div class="vc-sketch-sliders">
        <div class="vc-sketch-hue-wrap vc-sketch-first-slider">
          <div class="vc-hue">
            <div
              ref="HueDom"
              class="vc-hue-container"
              role="slider"
              @mousedown="handleHueMouseDown"
              @touchmove="handleHueChange"
              @touchstart="handleHueChange"
            >
              <div
                class="vc-hue-pointer"
                :style="{left: `${hsl[0] * 100}%`}"
                role="presentation"
              >
                <div class="vc-hue-picker"></div>
              </div>
            </div>
          </div>
        </div>
        <div
          v-if="!alpha"
          class="vc-sketch-alpha-wrap vc-sketch-second-slider"
        >
        </div>
      </div>

      <div
        class="vc-sketch-color-wrap-box"
        :style="{'height': alpha ? '14px' :'36px'}"
      >
        <div class="vc-sketch-color-wrap">
          <div
            :aria-label="`Current color is ${activeColor}`"
            class="vc-sketch-active-color"
            :style="{ background: activeColor }"
          ></div>
          <checkboard></checkboard>
        </div>
      </div>
    </div>
    <div class="vc-sketch-field-box">
      <div class="left-box">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 22 22"
          @click="strawColor($event)"
        ><defs></defs><rect
          class="a"
          width="22"
          height="22"
        /><path
          class="b"
          d="M419.49,202.52a1.78,1.78,0,0,0-2.514,0h0l-1.694,1.71-1.344-1.372a1.123,1.123,0,1,0-1.592,1.585l.7.7-8.526,8.493-.293,1.946-1.785,1.721a1.594,1.594,0,0,0,2.259,2.249l1.727-1.721,1.942-.348,8.512-8.493.711.7a1.124,1.124,0,0,0,1.593-1.586l-1.411-1.394,1.682-1.676a1.763,1.763,0,0,0,.051-2.492l-.017-.017ZM411.4,212.779h-4.423l6.865-6.839,2.258,2.249Z"
          transform="translate(-400 -200)"
        /></svg>
        <img
          v-if="false"
          width="28"
          @click="strawColor($event)"
        />
      </div>

      <div
        v-if="!disableFields"
        class="vc-sketch-field"
      >
        <!-- rgb -->
        <div class="vc-sketch-field--single">
          <input
            v-model="rgb[0]"
            min="0"
            max="255"
            type="number"
            class="vc-input__input"
            @input="updateRGB($event, 0)"
            @focus="emits('changeStart')"
            @blur="emits('changeEnd')"
          >
          <span class="vc-input__label">r</span>
        </div>
        <div class="vc-sketch-field--single">
          <input
            v-model="rgb[1]"
            min="0"
            max="255"
            type="number"
            class="vc-input__input"
            @input="updateRGB($event, 1)"
            @focus="emits('changeStart')"
            @blur="emits('changeEnd')"
          >
          <span class="vc-input__label">g</span>
        </div>
        <div class="vc-sketch-field--single">
          <input
            v-model="rgb[2]"
            min="0"
            max="255"
            type="number"
            class="vc-input__input"
            @input="updateRGB($event, 2)"
            @focus="emits('changeStart')"
            @blur="emits('changeEnd')"
          >
          <span class="vc-input__label">b</span>
        </div>
        <div class="vc-sketch-field--double">
          <input
            v-model="hex"
            class="vc-input__input"
            @input="updateColor"
            @focus="emits('changeStart')"
            @blur="blurColor"
          >
          <span class="vc-input__label">hex</span>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="less">
.vc-sketch {
  position: relative;
  box-sizing: initial;
  border-radius: 4px;
  width: 100%;
}

.vc-sketch-saturation-wrap {
  width: 100%;
  height: 159px;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.vc-sketch-controls {
  display: flex;
}

.vc-sketch-sliders {
  padding: 4px 0;
  flex: 1;
  > .vc-sketch-first-slider {
    height: 14px;
    .vc-hue-picker {
      margin-top: 1px;
      box-sizing: border-box;
      height: 12px;
      width: 6px;
      background: #FFFFFF;
      box-shadow: 0px 0px 2px 1px rgba(0, 0, 0, 0.5);
      border-radius: 10px 10px 10px 10px;
    }
  }
}

.vc-sketch-sliders .vc-hue,
.vc-sketch-sliders .vc-alpha-gradient {
  border-radius: 4px;
}

.vc-sketch-hue-wrap {
  position: relative;
  height: 10px;
}

.vc-sketch-alpha-wrap {
  position: relative;
  height: 14px;
  overflow: hidden;
}

.vc-sketch-color-wrap-box {
  width: 32px;
  padding: 4px 0;
  margin-left: 10px;
  >.vc-sketch-color-wrap{
    height: 14px;
    width: 100%;
  }
}

.vc-sketch-color-wrap {
  width: 24px;
  height: 10px;
  position: relative;
}

.vc-sketch-active-color {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 4px;
  z-index: 2;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.vc-sketch-field {
  display: flex;
  flex-grow: 1;
  justify-content:space-between;
}

.vc-sketch-field .vc-input__input {
  width: 100%;
  border: none;
  box-shadow:none;
  height: 26px;
  line-height: 26px;
  background: #F8F8FC;
  border-radius: 4px 4px 4px 4px;
  text-align: center;
  font-size: 12px;
  background-color: #eee;
  color: #000;
  &:hover {
    background: rgba(8, 35, 110, 0.06);
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none !important;
  }
  &[type='number'] {
    appearance: textfield;
  }
}

.vc-sketch-field .vc-input__label {
  display: block;
  text-align: center;
  font-size: 12px;
  color: #000;
  padding-top: 3px;
  text-transform: capitalize;
}

.vc-sketch-field--single {
  width: 32px;
  position: relative;

  &:first-of-type {
    padding-left: 0;
  }

  .vc-input__input {
    padding: 0;
    border: 0;
    outline: none;
  }
  .vc-input__label {
    text-transform: capitalize;
  }
}

.vc-sketch-field--double {
  width: 74px;
  .vc-input__input {
    padding: 0;
    border: 0;
    outline: none;
  }
  .vc-input__label {
    text-transform: capitalize;
  }
}

.vc-sketch-field-box {
  display: flex;
  > .left-box {
    flex-shrink: 0;
    margin-right: 12px;
    >svg {
      cursor: pointer;
    }
    .a {
      fill:none;
    }
    .b {
      fill: #ddd;
    }
    >img {
      cursor: pointer;
    }
  }
}

.vc-sketch-controls-box{
  margin: 10px 0 10px 0;
  >.vc-sketch-sliders{
    padding: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .vc-sketch-second-slider{
      border-radius: 4px;
      position: relative;
      //top: -4px;
    }
  }
  >.vc-sketch-color-wrap-box{
    height: 36px;
    padding: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    >.vc-sketch-color-wrap{
      height: 14px;
    }
  }
}

.vc-saturation,
.vc-saturation--white,
.vc-saturation--black {
  cursor: pointer;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.vc-saturation--white {
  background: linear-gradient(to right, #fff, rgba(255,255,255,0));
}
.vc-saturation--black {
  background: linear-gradient(to top, #000, rgba(0,0,0,0));
}
.vc-saturation-pointer {
  cursor: pointer;
  position: absolute;
}
.vc-saturation-circle {
  cursor: head;
  width: 4px;
  height: 4px;
  box-shadow: 0 0 0 1.5px #fff, inset 0 0 1px 1px rgba(0,0,0,.3), 0 0 1px 2px rgba(0,0,0,.4);
  border-radius: 50%;
  transform: translate(-2px, -2px);
}

.vc-hue {
  position: absolute;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
  border-radius: 2px;
  background: linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);
}
.vc-hue-container {
  cursor: pointer;
  margin: 0 2px;
  position: relative;
  height: 100%;
}
.vc-hue-pointer {
  z-index: 2;
  position: absolute;
}
.vc-hue-picker {
  cursor: pointer;
  margin-top: 1px;
  width: 4px;
  border-radius: 1px;
  height: 8px;
  box-shadow: 0 0 2px rgba(0, 0, 0, .6);
  background: #fff;
  transform: translateX(-2px) ;
}

.vc-sketch-gradient {
  position: relative;
  width: 238px;
  height: 16px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .vc-gradient-track {
    position: relative;
    margin: 0;
    border: 1px solid #e9edf0;
    border-radius: 4px;
    cursor: pointer;

    .track-content {
      position: relative;
      width: 160px;
      margin: 0 8px;
      height: 16px;
    }

    .gradient-item {
      position: absolute;
      top: 50%;
      margin-top: -10px;
      padding: 1px;
      width: 20px;
      height: 20px;
      border: 1px solid #bdc8d9;
      box-sizing: border-box;
      border-radius: 2px;
      box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.2);
      background-color: #fff;
      cursor: pointer;

      > div {
        width: 100%;
        height: 100%;
        border-radius: 2px;
      }

      &.active {
        border-color: #6464F8;
      }
    }
  }

  .vc-gradient-angle {
    position: relative;
  }

  .rotate-box {
    position: absolute;
    top: 35px;
    left: -18px;
    display: block;
    width: 64px;
    height: 64px;
    box-shadow: 0px 0px 6px rgba(5, 30, 109, 0.2);
    border-radius: 4px;
    background: #fff;
    z-index: 10000;
    .rotate-area {
      width: 46px;
      height: 46px;
      background: #e4e8eb;
      border-radius: 50%;
      margin: 9px auto;
      .rotate-show {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        .rotate-ball {
          display: inline-block;
          width: 10px;
          height: 10px;
          margin-top: 7%;
          background: #1c3067;
          border-radius: 50%;
          pointer-events: none;
          transform-origin: left top;
        }
      }
    }
  }

  .angle-input-box {
    display: flex;
    position: relative;
    width: 45px;
    font-size: 12px;
    border-radius: 4px;
    height: 26px;
    line-height: 26px;
    text-align: center;
    overflow: hidden;

    > input {
      width: 100%;
      background: #f8f8fc;
      color: #272d4d;
      border: none;
      outline: none;
      padding-right: 15px;
      text-align: right;
    }

    > span {
      position: absolute;
      right: 8px;
      color: var(--font_color_main);
    }
  }
}
</style>
<style lang="less">
#straw-preview-div {
  position: fixed;
  top: 0;
  left: 0;
  width: 140px;
  height: 140px;
  //background: red;
  border-radius: 100%;
  border: 2px solid #ffffff;
  box-shadow: 0px 0px 6px rgba(5, 30, 109, 0.2);
  z-index: 9999;
  cursor: none;
  .inner {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100px;
    height: 100px;
    margin-left: -68px;
    margin-top: -68px;
    border-radius: 100%;
    border: 18px #fff solid;
    box-sizing: content-box;
  }
  .bd {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 96px;
    height: 96px;
    margin-left: -50px;
    margin-top: -50px;
    border-radius: 100%;
    border: 2px #fff solid;
    box-sizing: content-box;
    box-shadow: 0px 0px 6px rgba(5, 30, 109, 0.2) inset;
  }
  .squre {
    position: absolute;
    top: 50%;
    left: 50%;
    margin-left: -5px;
    margin-top: -5px;
    width: 10px;
    height: 10px;
    border: 1px solid #707070;
    background: #fff;
  }
}
</style>
