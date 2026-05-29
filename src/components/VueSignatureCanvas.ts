import SignaturePad from 'signature_pad';
import type { SignaturePadOptions } from 'signature_pad';
import trimCanvas from 'trim-canvas';
import type { PropType } from 'vue';
import {
  computed,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from 'vue';

export type VueSignatureCanvasOptions = SignaturePadOptions;

export type VueSignatureCanvasExpose = {
  isEmpty: () => boolean | undefined;
  clear: () => void;
  fromDataURL: (dataURL: string, options?: any) => void;
  toDataURL: (type?: string, encoderOptions?: any) => string | undefined;
  fromData: (pointGroups: any) => void;
  toData: () => any;
  off: () => void;
  on: () => void;
  getCanvas: () => HTMLCanvasElement | null;
  getTrimmedCanvas: () => HTMLCanvasElement | undefined;
  getSignaturePad: () => SignaturePad | null;
};

export default defineComponent({
  name: 'VueSignatureCanvas',
  inheritAttrs: false,
  props: {
    options: {
      type: Object as PropType<Partial<VueSignatureCanvasOptions>>,
      default: () => ({}),
    },
    canvasProps: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({}),
    },
    clearOnResize: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['begin', 'end'],
  setup(props, { emit, expose }) {
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const sigPadRef = shallowRef<SignaturePad | null>(null);
    const resizeHandlerRef = shallowRef<(() => void) | null>(null);

    const sigPadOptions = computed<Partial<VueSignatureCanvasOptions>>(() => {
      const { canvasProps, clearOnResize, options } = props;

      const mergedOptions: Partial<VueSignatureCanvasOptions> = {
        ...(options || {}),
      };

      const userOnBegin = mergedOptions.onBegin;
      const userOnEnd = mergedOptions.onEnd;

      mergedOptions.onBegin = (...args: any[]) => {
        emit('begin', ...args);
        userOnBegin?.(...args);
      };
      mergedOptions.onEnd = (...args: any[]) => {
        emit('end', ...args);
        userOnEnd?.(...args);
      };

      return mergedOptions;
    });

    const resizeCanvas = () => {
      const canvas = canvasRef.value;
      if (!canvas) {
        return;
      }

      const canvasProps = props.canvasProps || {};
      const { width, height } = canvasProps;
      if (width && height) {
        return;
      }

      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      if (!width) {
        canvas.width = canvas.offsetWidth * ratio;
      }
      if (!height) {
        canvas.height = canvas.offsetHeight * ratio;
      }
      canvas.getContext('2d')?.scale(ratio, ratio);
      clear();
    };

    const on = () => {
      const sigPad = sigPadRef.value;
      if (!sigPad) {
        return;
      }

      if (!resizeHandlerRef.value) {
        resizeHandlerRef.value = () => {
          if (!props.clearOnResize) {
            return;
          }
          resizeCanvas();
        };
      }

      window.addEventListener('resize', resizeHandlerRef.value);
      sigPad.on();
    };

    const off = () => {
      const sigPad = sigPadRef.value;
      if (!sigPad) {
        return;
      }

      if (resizeHandlerRef.value) {
        window.removeEventListener('resize', resizeHandlerRef.value);
      }
      sigPad.off();
    };

    const clear = () => sigPadRef.value?.clear();
    const isEmpty = () => sigPadRef.value?.isEmpty();
    const fromDataURL = (dataURL: string, options?: any) =>
      sigPadRef.value?.fromDataURL(dataURL, options);
    const toDataURL = (type?: string, encoderOptions?: any) =>
      sigPadRef.value?.toDataURL(type, encoderOptions);
    const fromData = (pointGroups: any) =>
      sigPadRef.value?.fromData(pointGroups);
    const toData = () => sigPadRef.value?.toData();
    const getCanvas = () => canvasRef.value;
    const getSignaturePad = () => sigPadRef.value;

    const getTrimmedCanvas = () => {
      const canvas = canvasRef.value;
      if (!canvas) {
        return;
      }

      const copy = document.createElement('canvas');
      copy.width = canvas.width;
      copy.height = canvas.height;
      copy.getContext('2d')?.drawImage(canvas, 0, 0);
      return trimCanvas(copy);
    };

    watch(sigPadOptions, (options) => {
      const sigPad = sigPadRef.value;
      if (!sigPad) {
        return;
      }
      Object.assign(sigPad, options);
    });

    onMounted(async () => {
      await nextTick();
      if (!canvasRef.value) {
        return;
      }
      sigPadRef.value = new SignaturePad(canvasRef.value, sigPadOptions.value);
      Object.assign(sigPadRef.value, sigPadOptions.value);
      resizeCanvas();
      on();
    });

    onBeforeUnmount(() => {
      off();
    });

    expose<VueSignatureCanvasExpose>({
      isEmpty,
      clear,
      fromDataURL,
      toDataURL,
      fromData,
      toData,
      off,
      on,
      getCanvas,
      getTrimmedCanvas,
      getSignaturePad,
    });

    return () => h('canvas', { ...props.canvasProps, ref: canvasRef });
  },
});
