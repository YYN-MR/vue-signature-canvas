# Vue Signature Canvas

> Vue component wrap for [signature pad](https://github.com/szimek/signature_pad)

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
$ npm i vue-signature-canvas
```


## Usage

```js
import Vue from 'vue';
import VueSignatureCanvas from 'vue-signature-canvas';

Vue.use(VueSignatureCanvas);
```

```vue
<template>
  <div id="app">
    <VueSignatureCanvas
                    ref="handWrite"
                    :canvasProps="{class: 'sig-canvas'}"
    />
  </div>
</template>
<script>
import VueSignatureCanvas from "VueSignatureCanvas";
export default {
  name: 'FirstSignatureCanvas',
  methods: {
    
  },
  components: {
    VueSignatureCanvas
  }
};
</script>
<style lang="less" scoped>
    .sig-canvas {
        width: 100%;
        height: 100%;
        background-color: rgba(244,244,244,0);
        position: fixed;
        z-index: 9;
    }
</style>
```

### Props

The props of SignatureCanvas mainly control the properties of the pen stroke used in drawing.
All props are **optional**.

- `velocityFilterWeight` : `number`, default: `0.7`
- `minWidth` : `number`, default: `0.5`
- `maxWidth` : `number`, default: `2.5`
- `minDistance`: `number`, default: `5`
- `dotSize` : `number` or `function`,
  default: `() => (this.minWidth + this.maxWidth) / 2`
- `penColor` : `string`, default: `'black'`
- `throttle`: `number`, default: `16`

There are also two callbacks that will be called when a stroke ends and one begins, respectively.

- `onEnd` : `function`
- `onBegin` : `function`

Additional props are used to control the canvas element.

- `canvasProps`: `object`
  - directly passed to the underlying `<canvas />` element
- `backgroundColor` : `string`, default: `'rgba(0,0,0,0)'`
  - used in the API's`clear` convenience method (which itself is called internally during resizes)
- `clearOnResize`: `bool`, default: `true`
  - whether or not the canvas should be cleared when the window resizes

Of these props, all, except for `canvasProps` and `clearOnResize`, are passed through to `signature_pad` as its [options](https://github.com/szimek/signature_pad#options).
`signature_pad`'s internal state is automatically kept in sync with prop updates for you (via a `componentDidUpdate` hook).

## API
All API methods require a ref to the SignatureCanvas in order to use and are instance methods of the ref.

- `isEmpty()` : `boolean`, self-explanatory
- `clear()` : `void`, clears the canvas using the `backgroundColor` prop
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
