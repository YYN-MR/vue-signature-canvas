import { vi } from 'vitest';

Object.defineProperty(window, 'devicePixelRatio', {
  value: 1,
  writable: true,
});

if (!HTMLCanvasElement.prototype.getContext) {
  HTMLCanvasElement.prototype.getContext = () => null;
}

const ctxByCanvas = new WeakMap();

const createMock2dContext = () => {
  const ctx = {
    scale: vi.fn(),
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    setLineDash: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    strokeText: vi.fn(),
    fillText: vi.fn(),
    drawImage: vi.fn(),
    font: '',
  };

  ctx.measureText = vi.fn((text) => {
    const match = String(ctx.font || '').match(/(\d+(?:\.\d+)?)px/);
    const fontSize = match ? Number(match[1]) : 10;
    return { width: String(text).length * fontSize * 0.6 };
  });

  return ctx;
};

vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
  function () {
    const canvas = this;
    if (ctxByCanvas.has(canvas)) {
      return ctxByCanvas.get(canvas);
    }

    const ctx = createMock2dContext();
    ctxByCanvas.set(canvas, ctx);
    return ctx;
  },
);
