import { vi } from 'vitest';

Object.defineProperty(window, 'devicePixelRatio', {
  value: 1,
  writable: true,
});

if (!HTMLCanvasElement.prototype.getContext) {
  HTMLCanvasElement.prototype.getContext = () => null;
}

vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
  return {
    scale: vi.fn(),
    drawImage: vi.fn(),
  };
});
