# Vue Signature Canvas

基于 [signature_pad](https://github.com/szimek/signature_pad) 的 Vue 3 签名组件。

## 安装

```sh
npm i vue-signature-canvas
```

本库仅支持 Vue 3。

从 v2.0.0 开始：

- 不再支持 Vue 2
- 提供 TypeScript 类型声明
- `options` 是传递 `signature_pad` 配置的唯一入口（旧版分散 props 已移除）

## 使用

```js
import VueSignatureCanvas from 'vue-signature-canvas';
import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);
app.use(VueSignatureCanvas);
app.mount('#app');
```

## Demo

先构建产物，然后直接用浏览器打开 [demo/index.html](./demo/index.html)。

```sh
npm run build:prod
```

```vue
<template>
  <div id="app">
    <VueSignatureCanvas
      ref="signatureRef"
      :canvasProps="{ class: 'sig-canvas' }"
      :options="{ penColor: '#09f', throttle: 7 }"
      @begin="onBegin"
      @end="onEnd"
    />
  </div>
</template>
<script>
import VueSignatureCanvas from 'vue-signature-canvas';
export default {
  name: 'FirstSignatureCanvas',
  methods: {
    onBegin() {},
    onEnd() {},
  },
  components: {
    VueSignatureCanvas,
  },
};
</script>
<style lang="less" scoped>
.sig-canvas {
  width: 100%;
  height: 100%;
  background-color: rgba(244, 244, 244, 0);
  position: fixed;
  z-index: 9;
}
</style>
```

## Props

所有 props 均为可选。

- `options`: `object`
  - v2 唯一的 `signature_pad` 参数入口
- `canvasProps`: `object`
  - 透传给底层 `<canvas />` 的属性
- `clearOnResize`: `bool`，默认 `true`
  - window resize 时是否清空画布

组件会在 props 更新时自动同步 `signature_pad` 内部配置。

## 事件

- `begin`: 开始绘制时触发（对应 `signature_pad` 的 `onBegin`）
- `end`: 结束绘制时触发（对应 `signature_pad` 的 `onEnd`）

## API（通过 ref 调用）

- `isEmpty()` : `boolean`，判断画布是否为空
- `clear()` : `void`，清空画布
- `fromDataURL(base64String, options)` : `void`，写入 base64 图片
- `toDataURL(mimetype, encoderOptions)`: `base64string`，导出 base64 图片
- `fromData(pointGroupArray)`: `void`，从点集绘制
- `toData()`: `pointGroupArray`，导出点集
- `off()`: `void`，解绑事件
- `on()`: `void`，绑定事件
- `getCanvas()`: `canvas`，获取底层 canvas
- `getTrimmedCanvas()`: `canvas`，获取裁剪后的 canvas（去除空白）
- `getSignaturePad()`: `SignaturePad`，获取底层 SignaturePad 实例

## LICENSE

MIT © [Sky](https://github.com/YYN-MR/)
