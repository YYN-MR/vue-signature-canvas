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

export type VueSignatureCanvasGridOptions = {
  mode?: 'square' | 'zheng';
  size?: number;
  color?: string;
  dash?: number[];
  lineWidth?: number;
};

export type VueSignatureCanvasGuideOptions = {
  text: string;
  font?: string;
  color?: string;
  dash?: number[];
  lineWidth?: number;
  opacity?: number;
  x?: number;
  y?: number;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
  lineHeight?: number;
};

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
    grid: {
      type: [Boolean, Object] as PropType<
        boolean | VueSignatureCanvasGridOptions
      >,
      default: false,
    },
    guide: {
      type: Object as PropType<VueSignatureCanvasGuideOptions | null>,
      default: null,
    },
  },
  emits: ['begin', 'end'],
  setup(props, { emit, expose }) {
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const backgroundCanvasRef = ref<HTMLCanvasElement | null>(null);
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

    const getCssSize = (canvas: HTMLCanvasElement) => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      return {
        width: canvas.width / ratio,
        height: canvas.height / ratio,
        ratio,
      };
    };

    const drawGrid = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
    ) => {
      if (!props.grid) {
        return;
      }

      const defaults: Required<VueSignatureCanvasGridOptions> = {
        mode: 'square',
        size: 24,
        color: 'rgba(0, 0, 0, 0.15)',
        dash: [4, 4],
        lineWidth: 1,
      };

      const config =
        props.grid === true ? defaults : { ...defaults, ...(props.grid || {}) };

      ctx.save();
      ctx.strokeStyle = config.color;
      ctx.lineWidth = config.lineWidth;
      ctx.setLineDash(config.dash);

      for (let x = 0; x <= width; x += config.size) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y <= height; y += config.size) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (config.mode === 'zheng') {
        for (let x = 0; x < width; x += config.size) {
          const cellW = Math.min(config.size, width - x);
          const x1 = x + cellW;
          const midX = x + cellW / 2;

          for (let y = 0; y < height; y += config.size) {
            const cellH = Math.min(config.size, height - y);
            const y1 = y + cellH;
            const midY = y + cellH / 2;

            ctx.beginPath();
            ctx.moveTo(midX, y);
            ctx.lineTo(midX, y1);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x, midY);
            ctx.lineTo(x1, midY);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x1, y1);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x, y1);
            ctx.lineTo(x1, y);
            ctx.stroke();
          }
        }
      }

      ctx.restore();
    };

    const drawGuide = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
    ) => {
      const guide = props.guide;
      if (!guide?.text) {
        return;
      }

      const lines = String(guide.text).split('\n');
      const hasCjk = /[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff]/.test(
        String(guide.text),
      );
      const defaultFontFamily = hasCjk
        ? 'SimSun, "Songti SC", serif'
        : 'sans-serif';

      const estimateTextWidth = (text: string, fontSize: number) =>
        fontSize * String(text).length * 0.6;

      const measureLineWidth = (text: string, fontSize: number) => {
        const measured = ctx.measureText(text)?.width;
        if (Number.isFinite(measured) && measured > 0) {
          return measured;
        }
        return estimateTextWidth(text, fontSize);
      };

      const getAutoFont = () => {
        const paddingX = width * 0.08;
        const paddingY = height * 0.08;
        const maxWidth = Math.max(width - paddingX * 2, 1);
        const maxHeight = Math.max(height - paddingY * 2, 1);
        const lineHeightFactor = 1.2;
        const maxSize = Math.max(8, Math.floor(Math.min(maxWidth, maxHeight)));

        let low = 8;
        let high = maxSize;
        let best = 48;

        const fits = (fontSize: number) => {
          const font = `${fontSize}px ${defaultFontFamily}`;
          ctx.font = font;
          const lineHeight = Math.round(fontSize * lineHeightFactor);
          if (lines.length * lineHeight > maxHeight) {
            return false;
          }

          let maxLineWidth = 0;
          for (let i = 0; i < lines.length; i += 1) {
            maxLineWidth = Math.max(
              maxLineWidth,
              measureLineWidth(lines[i], fontSize),
            );
            if (maxLineWidth > maxWidth) {
              return false;
            }
          }

          return true;
        };

        while (low <= high) {
          const mid = Math.floor((low + high) / 2);
          if (fits(mid)) {
            best = mid;
            low = mid + 1;
            continue;
          }
          high = mid - 1;
        }

        return {
          font: `${best}px ${defaultFontFamily}`,
          fontSize: best,
        };
      };

      const resolvedFont = guide.font?.trim() ? guide.font : getAutoFont().font;
      const fontSizeMatch = resolvedFont.match(/(\d+(?:\.\d+)?)px/);
      const fontSize = fontSizeMatch ? Number(fontSizeMatch[1]) : 48;
      const lineHeight = guide.lineHeight ?? Math.round(fontSize * 1.2);

      const x = guide.x ?? width / 2;
      const y = guide.y ?? height / 2;
      const startY = y - ((lines.length - 1) * lineHeight) / 2;

      ctx.save();
      ctx.globalAlpha = guide.opacity ?? 0.35;
      ctx.font = resolvedFont;
      ctx.strokeStyle = guide.color || '#ff4d4f';
      ctx.lineWidth = guide.lineWidth ?? 2;
      ctx.setLineDash(guide.dash || []);
      ctx.textAlign = guide.textAlign || 'center';
      ctx.textBaseline = guide.textBaseline || 'middle';

      for (let i = 0; i < lines.length; i += 1) {
        ctx.strokeText(lines[i], x, startY + i * lineHeight);
      }

      ctx.restore();
    };

    const redrawBackground = () => {
      const backgroundCanvas = backgroundCanvasRef.value;
      if (!backgroundCanvas) {
        return;
      }

      const ctx = backgroundCanvas.getContext('2d');
      if (!ctx) {
        return;
      }

      const { width, height } = getCssSize(backgroundCanvas);
      ctx.clearRect(0, 0, width, height);
      drawGrid(ctx, width, height);
      drawGuide(ctx, width, height);
    };

    const resizeCanvas = () => {
      const canvas = canvasRef.value;
      const backgroundCanvas = backgroundCanvasRef.value;
      if (!canvas || !backgroundCanvas) {
        return;
      }

      const canvasProps = props.canvasProps || {};
      const { width, height } = canvasProps;

      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const targetWidth =
        width != null ? Number(width) : canvas.offsetWidth * ratio;
      const targetHeight =
        height != null ? Number(height) : canvas.offsetHeight * ratio;

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      backgroundCanvas.width = targetWidth;
      backgroundCanvas.height = targetHeight;

      const sigCtx = canvas.getContext('2d');
      sigCtx?.setTransform(1, 0, 0, 1, 0, 0);
      sigCtx?.scale(ratio, ratio);

      const bgCtx = backgroundCanvas.getContext('2d');
      bgCtx?.setTransform(1, 0, 0, 1, 0, 0);
      bgCtx?.scale(ratio, ratio);

      if (props.clearOnResize) {
        clear();
      }
      redrawBackground();
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

    watch(
      () => [props.grid, props.guide, props.canvasProps],
      async () => {
        await nextTick();
        redrawBackground();
      },
      { deep: true },
    );

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

    return () => {
      const { style, width, height } = props.canvasProps || {};

      const wrapperStyle = [{ position: 'relative', display: 'inline-block' }];

      const backgroundCanvasProps = {
        width,
        height,
        style: [
          style,
          {
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
          },
        ],
        ref: backgroundCanvasRef,
        'data-vsc-canvas': 'background',
      };

      const signatureCanvasProps = {
        ...props.canvasProps,
        style: [style, { position: 'relative', zIndex: 1 }],
        ref: canvasRef,
        'data-vsc-canvas': 'signature',
      };

      return h('div', { style: wrapperStyle }, [
        h('canvas', backgroundCanvasProps),
        h('canvas', signatureCanvasProps),
      ]);
    };
  },
});
