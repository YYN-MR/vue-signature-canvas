declare module 'signature_pad' {
  export interface SignaturePadPointGroup {}

  export type DotSize = number | (() => number);

  export interface SignaturePadOptions {
    velocityFilterWeight?: number;
    minWidth?: number;
    maxWidth?: number;
    minDistance?: number;
    dotSize?: DotSize;
    penColor?: string;
    throttle?: number;
    onBegin?: (...args: any[]) => void;
    onEnd?: (...args: any[]) => void;
  }

  export default class SignaturePad {
    constructor(canvas: HTMLCanvasElement, options?: SignaturePadOptions);
    clear(): void;
    isEmpty(): boolean;
    on(): void;
    off(): void;
    fromDataURL(dataURL: string, options?: any): void;
    toDataURL(type?: string, encoderOptions?: any): string;
    fromData(pointGroups: any): void;
    toData(): any;
    [key: string]: any;
  }
}
