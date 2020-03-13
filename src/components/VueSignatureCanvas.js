import SignaturePad from 'signature_pad';
import trimCanvas from 'trim-canvas'

export default {
  name: 'VueSignatureCanvas',
  props: {
    velocityFilterWeight: {
      type: Number
    },
    minWidth: {
      type: Number
    },
    maxWidth: {
      type: Number
    },
    minDistance: {
      type: Number
    },
    dotSize: {
      type: Number || Function
    },
    penColor: {
      type: String,
      default: '#000'
    },
    throttle: {
      type: Number
    },
    onEnd: {
      type: Function
    },
    onBegin: {
      type: Function
    },
    canvasProps: {
      type: Object,
      default: () => ({})
    },
    clearOnResize: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      sigPad: null,
      canvas: {}
    };
  },
  mounted() {
    this.canvas = this.$refs.canvas;
    this.sigPad = new SignaturePad(this.canvas, this._excludeOurProps());
    this._resizeCanvas();
    this.on();
  },
  beforeDestroy() {
    this.off();
  },
  update() {
    Object.assign(this.sigPad, this._excludeOurProps());
  },
  methods: {
    _excludeOurProps: function() {
      const { canvasProps, clearOnResize, ...sigPadProps} = this;
      return sigPadProps;
    },
    _resizeCanvas: function() {
      const canvasProps = this.canvasProps || {};
      const { width, height } = canvasProps;
      // don't resize if the canvas has fixed width and height
      if (width && height) {
        return;
      }

      const canvas = this.canvas;
      /* When zoomed out to less than 100%, for some very strange reason,
        some browsers report devicePixelRatio as less than 1
        and only part of the canvas is cleared then. */
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      if (!width) {
        canvas.width = canvas.offsetWidth * ratio;
      }
      if (!height) {
        canvas.height = canvas.offsetHeight * ratio;
      }
      canvas.getContext('2d').scale(ratio, ratio);
      this.clear();
    },
    _checkClearOnResize: function() {
      if (!this.clearOnResize) {
        return;
      }
      this._resizeCanvas();
    },

    getTrimmedCanvas: function() {
      // copy the canvas
      const copy = document.createElement('canvas');
      copy.width = this.canvas.width;
      copy.height = this.canvas.height;
      copy.getContext('2d').drawImage(this.canvas, 0, 0);
      // then trim it
      return trimCanvas(copy);
    },
    // return the canvas ref for operations like toDataURL
    getCanvas: function() {
      return this.canvas;
    },
    getSignaturePad: function() {
      return this.sigPad;
    },
    on: function() {
      window.addEventListener('resize', this._checkClearOnResize);
      return this.sigPad.on();
    },
    off: function() {
      window.removeEventListener('resize', this._checkClearOnResize);
      return this.sigPad.off();
    },
    clear: function() {
      return this.sigPad.clear();
    },
    isEmpty: function() {
      return this.sigPad.isEmpty();
    },
    fromDataURL: function(dataURL, options) {
      return this.sigPad.fromDataURL(dataURL, options);
    },
    toDataURL: function(type, encoderOptions) {
      return this.sigPad.toDataURL(type, encoderOptions);
    },
    fromData: function(pointGroups) {
      return this.sigPad.fromData(pointGroups);
    },
    toData: function() {
      return this.sigPad.toData();
    }
  },
  render(createElement) {
    const { canvasProps } = this;
    console.log(canvasProps);
    return createElement('canvas', { ...canvasProps, ref: 'canvas' });
  }
};
