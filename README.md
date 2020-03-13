# Vue Signature Canvas

> Vue component wrap for [signature pad](https://github.com/szimek/signature_pad)

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


## Props

| Name        | Type   | Default                                                                                                 | Description                              | Example                                                                                                                         |
| :---------- | :----- | :------------------------------------------------------------------------------------------------------ | :--------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| min-width       | Number |                                                                                                 | Set the `canvas` min-width.                     | -                                                                                                                               |
| max-width      | Number |                                                                                                   | Set the `canvas` max-height.                    | -                                                                                                                               |
| dotSize     | Number/Function | | Set the signature dot size.           |                     |

## Methods

| Name                                   | Argument Type                | Description                                                                 |
| :------------------------------------- | :--------------------------- | --------------------------------------------------------------------------- |
| `fromData(data)`                       | `String`                     | Returns signature image as an array of point groups.                        |
| `toData()`                             | -                            | Draws signature image from an array of point groups.                        |
| `isEmpty()`                            | -                            | Return signature canvas have data.                                          |

## Credits

[szimek/signature_pad](https://github.com/szimek/signature_pad) - HTML5 canvas based smooth signature drawing

## Thanks

[neighborhood999/vue-signature-pad](https://github.com/neighborhood999/vue-signature-pad) - Vue Signature Pad Component

## LICENSE

MIT © [Sky](https://github.com/YYN_MR/)
