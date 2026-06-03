# Vue Signature Canvas

Vue 3 signature pad component based on [signature_pad](https://github.com/szimek/signature_pad).

[中文说明](./README.zh-CN.md)

<!-- releases / versioning -->
[![package-json](https://img.shields.io/github/package-json/v/YYN-MR/vue-signature-canvas.svg)](https://npmjs.org/package/vue-signature-canvas)
[![releases](https://img.shields.io/github/tag-pre/YYN-MR/vue-signature-canvas.svg)](https://github.com/YYN-MR/vue-signature-canvas/releases)
<br><!-- downloads -->
[![dt](https://img.shields.io/npm/dt/vue-signature-canvas.svg)](https://npmjs.org/package/vue-signature-canvas)
[![dy](https://img.shields.io/npm/dy/vue-signature-canvas.svg)](https://npmjs.org/package/vue-signature-canvas)
[![dm](https://img.shields.io/npm/dm/vue-signature-canvas.svg)](https://npmjs.org/package/vue-signature-canvas)
[![dw](https://img.shields.io/npm/dw/vue-signature-canvas.svg)](https://npmjs.org/package/vue-signature-canvas)
<br><!-- status / activity -->
[![NPM](https://nodei.co/npm/vue-signature-canvas.png?downloads=true&downloadRank=true&stars=true)](https://npmjs.org/package/vue-signature-canvas)
<br>
## Installation

```sh
npm i vue-signature-canvas
```

This package targets Vue 3.

Since v2.0.0:

- Vue 2 is not supported
- TypeScript typings are provided
- `options` is the only way to pass `signature_pad` options (legacy props removed)


## Usage

```js
import VueSignatureCanvas from 'vue-signature-canvas';
import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);
app.use(VueSignatureCanvas);
app.mount('#app');
```

## Demo

Build the library first, then open [demo/index.html](./demo/index.html) in the browser.

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

All props are optional.

- `options`: `object`
  - the only way to pass `signature_pad` options in v2

- `canvasProps`: `object`
  - directly passed to the underlying `<canvas />` element
- `clearOnResize`: `bool`, default: `true`
  - whether or not the canvas should be cleared when the window resizes
- `grid`: `boolean | object`, default: `false`
  - draws a dashed grid on a background canvas to help align handwriting
  - `mode`: `'square' | 'zheng'` (default: `'square'`)
- `guide`: `object | null`, default: `null`
  - draws outlined guide text (e.g. a name) on a background canvas
  - `font`: `string` (optional). If omitted, the component picks a best-fit font size to fill the canvas. For CJK text it prefers `SimSun` by default.

`signature_pad`'s internal state is automatically kept in sync with prop updates for you.

`grid` / `guide` are drawn on a separate background canvas and are NOT included in `toDataURL()` exports.

```vue
<VueSignatureCanvas
  :options="{ penColor: '#09f', throttle: 7 }"
  :grid="{ mode: 'zheng', size: 24, color: 'rgba(0, 0, 0, 0.15)', dash: [4, 4], lineWidth: 1 }"
  :guide="{ text: 'John Doe', font: '64px sans-serif', color: '#ff4d4f', opacity: 0.35 }"
/>
```

## Events

- `begin`: emitted when a stroke begins (same timing as `signature_pad` option `onBegin`)
- `end`: emitted when a stroke ends (same timing as `signature_pad` option `onEnd`)

## API
All API methods require a ref to the SignatureCanvas in order to use and are instance methods of the ref.

- `isEmpty()` : `boolean`, self-explanatory
- `fromDataURL(base64String, options)` : `void`, writes a base64 image to canvas
- `toDataURL(mimetype, encoderOptions)`: `base64string`, returns the signature image as a data URL
- `fromData(pointGroupArray)`: `void`, draws signature image from an array of point groups
- `toData()`: `pointGroupArray`, returns signature image as an array of point groups
- `off()`: `void`, unbinds all event handlers
- `on()`: `void`, rebinds all event handlers
- `getCanvas()`: `canvas`, returns the underlying canvas ref.
  Allows you to modify the canvas however you want or call methods such as `toDataURL()`
- `getTrimmedCanvas()`: `canvas`, creates a copy of the canvas and returns a [trimmed version](https://github.com/agilgur5/trim-canvas) of it, with all whitespace removed.
- `getSignaturePad()`: `SignaturePad`, returns the underlying SignaturePad reference.

The API methods are _mostly_ just wrappers around [`signature_pad`'s API](https://github.com/szimek/signature_pad#api).
`on()` and `off()` will, in addition, bind/unbind the window resize event handler.
`getCanvas()`, `getTrimmedCanvas()`, and `getSignaturePad()` are new.

## Credits

[szimek/signature_pad](https://github.com/szimek/signature_pad) - HTML5 canvas based smooth signature drawing

## Thanks

[neighborhood999/vue-signature-pad](https://github.com/neighborhood999/vue-signature-pad) - Vue Signature Pad Component

[agilgur5/react-signature-canvas](https://codesandbox.io/s/github/agilgur5/react-signature-canvas) - React Signature Canvas Component

## LICENSE

MIT © [Sky](https://github.com/YYN-MR/)
