<script setup lang="ts">
import ColorPick from './components/ColorPick.vue';

function change(color:string) {
  console.log(color, '<--------change');
}
function changeStart() {
  console.log('<----------');
}
function changeEnd(color: string) {
  console.log(color, '<----------end');
}
</script>
<template>
  <ColorPick
    :color="'linear-gradient(90deg,#ff00ff 0%,#000000 100%)'"
    :type="1"
    :recent-gradient="['linear-gradient(90deg,#f1e30b 1.25%,#f70a0a 99.38%)']"
    @change="change"
    @change-start="changeStart"
    @change-end="changeEnd"
  ></ColorPick>
</template>
<style lang="less">
body {
  width: 100vw;
  height: 100vh;
}
</style>
