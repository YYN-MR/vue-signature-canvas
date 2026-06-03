import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import VueSignatureCanvas from '../VueSignatureCanvas';

const sigPadMock = vi.hoisted(() => {
  const state = {
    lastInstance: null,
  };
  const ctor = vi.fn().mockImplementation((_canvas, options) => {
    state.lastInstance = {
      options,
      on: vi.fn(),
      off: vi.fn(),
      clear: vi.fn(),
      isEmpty: vi.fn().mockReturnValue(true),
      fromDataURL: vi.fn(),
      toDataURL: vi.fn().mockReturnValue('data:image/png;base64,xxx'),
      fromData: vi.fn(),
      toData: vi.fn().mockReturnValue([]),
    };
    return state.lastInstance;
  });
  return { state, ctor };
});

vi.mock('signature_pad', () => ({ default: sigPadMock.ctor }));

afterEach(() => {
  sigPadMock.state.lastInstance = null;
  vi.clearAllMocks();
});

describe('VueSignatureCanvas (Vue3)', () => {
  const getSignatureCanvas = (wrapper) =>
    wrapper.find('[data-vsc-canvas="signature"]').element;

  const getBackgroundCanvas = (wrapper) =>
    wrapper.find('[data-vsc-canvas="background"]').element;

  it('supports options prop as primary signature_pad config', async () => {
    const wrapper = mount(VueSignatureCanvas, {
      props: {
        options: {
          penColor: '#09f',
          throttle: 7,
        },
      },
    });

    const canvas = getSignatureCanvas(wrapper);
    Object.defineProperty(canvas, 'offsetWidth', {
      value: 300,
      configurable: true,
    });
    Object.defineProperty(canvas, 'offsetHeight', {
      value: 150,
      configurable: true,
    });

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const [, options] = sigPadMock.ctor.mock.calls[0];
    expect(options).toMatchObject({ penColor: '#09f', throttle: 7 });
  });

  it('passes signature_pad options and excludes canvasProps/clearOnResize', async () => {
    const wrapper = mount(VueSignatureCanvas, {
      props: {
        options: {
          penColor: '#f00',
          throttle: 8,
        },
        canvasProps: { class: 'sig-canvas' },
        clearOnResize: false,
      },
    });

    const canvas = getSignatureCanvas(wrapper);
    Object.defineProperty(canvas, 'offsetWidth', {
      value: 300,
      configurable: true,
    });
    Object.defineProperty(canvas, 'offsetHeight', {
      value: 150,
      configurable: true,
    });

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(sigPadMock.ctor).toHaveBeenCalledTimes(1);
    const [, options] = sigPadMock.ctor.mock.calls[0];
    expect(options).toMatchObject({ penColor: '#f00', throttle: 8 });
    expect(options).not.toHaveProperty('canvasProps');
    expect(options).not.toHaveProperty('clearOnResize');
  });

  it('updates signature_pad instance when options change', async () => {
    const wrapper = mount(VueSignatureCanvas, {
      props: { options: { penColor: '#000' } },
    });

    const canvas = getSignatureCanvas(wrapper);
    Object.defineProperty(canvas, 'offsetWidth', {
      value: 300,
      configurable: true,
    });
    Object.defineProperty(canvas, 'offsetHeight', {
      value: 150,
      configurable: true,
    });

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(sigPadMock.state.lastInstance.penColor).toBe('#000');

    await wrapper.setProps({ options: { penColor: '#0f0' } });
    await wrapper.vm.$nextTick();

    expect(sigPadMock.state.lastInstance.penColor).toBe('#0f0');
  });

  it('emits begin/end events from options callbacks', async () => {
    const wrapper = mount(VueSignatureCanvas, { props: { options: {} } });

    const canvas = getSignatureCanvas(wrapper);
    Object.defineProperty(canvas, 'offsetWidth', {
      value: 300,
      configurable: true,
    });
    Object.defineProperty(canvas, 'offsetHeight', {
      value: 150,
      configurable: true,
    });

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    sigPadMock.state.lastInstance.options.onBegin('a');
    sigPadMock.state.lastInstance.options.onEnd('b');

    expect(wrapper.emitted('begin')?.[0]).toEqual(['a']);
    expect(wrapper.emitted('end')?.[0]).toEqual(['b']);
  });

  it('does not treat legacy option props as component props (v2 breaking change)', async () => {
    const wrapper = mount(VueSignatureCanvas, {
      props: {
        penColor: '#09f',
        throttle: 7,
      },
    });

    const canvas = getSignatureCanvas(wrapper);
    Object.defineProperty(canvas, 'offsetWidth', {
      value: 300,
      configurable: true,
    });
    Object.defineProperty(canvas, 'offsetHeight', {
      value: 150,
      configurable: true,
    });

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const [, options] = sigPadMock.ctor.mock.calls[0];
    expect(options.penColor).not.toBe('#09f');
    expect(options.throttle).not.toBe(7);
  });

  it('exposes API methods through component ref', async () => {
    const wrapper = mount(VueSignatureCanvas);

    const canvas = getSignatureCanvas(wrapper);
    Object.defineProperty(canvas, 'offsetWidth', {
      value: 300,
      configurable: true,
    });
    Object.defineProperty(canvas, 'offsetHeight', {
      value: 150,
      configurable: true,
    });

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.getCanvas()).toBe(canvas);
    expect(wrapper.vm.getSignaturePad()).toBe(sigPadMock.state.lastInstance);
    expect(wrapper.vm.isEmpty()).toBe(true);

    const clearCalls = sigPadMock.state.lastInstance.clear.mock.calls.length;
    wrapper.vm.clear();
    expect(sigPadMock.state.lastInstance.clear.mock.calls.length).toBe(
      clearCalls + 1,
    );

    wrapper.vm.toDataURL();
    expect(sigPadMock.state.lastInstance.toDataURL).toHaveBeenCalledTimes(1);
  });

  it('binds and unbinds resize listener', async () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const wrapper = mount(VueSignatureCanvas);

    const canvas = getSignatureCanvas(wrapper);
    Object.defineProperty(canvas, 'offsetWidth', {
      value: 300,
      configurable: true,
    });
    Object.defineProperty(canvas, 'offsetHeight', {
      value: 150,
      configurable: true,
    });

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function));

    wrapper.unmount();
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('draws dashed grid on background canvas when grid enabled', async () => {
    const wrapper = mount(VueSignatureCanvas, {
      props: {
        grid: true,
      },
    });

    const signatureCanvas = getSignatureCanvas(wrapper);
    Object.defineProperty(signatureCanvas, 'offsetWidth', {
      value: 300,
      configurable: true,
    });
    Object.defineProperty(signatureCanvas, 'offsetHeight', {
      value: 150,
      configurable: true,
    });

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const backgroundCanvas = getBackgroundCanvas(wrapper);
    const bgCtx = backgroundCanvas.getContext('2d');

    expect(bgCtx.setLineDash).toHaveBeenCalled();
    expect(bgCtx.stroke).toHaveBeenCalled();
  });

  it('draws zheng grid (calligraphy) inner lines when mode is zheng', async () => {
    const wrapper = mount(VueSignatureCanvas, {
      props: {
        grid: {
          mode: 'zheng',
          size: 100,
        },
      },
    });

    const signatureCanvas = getSignatureCanvas(wrapper);
    Object.defineProperty(signatureCanvas, 'offsetWidth', {
      value: 300,
      configurable: true,
    });
    Object.defineProperty(signatureCanvas, 'offsetHeight', {
      value: 150,
      configurable: true,
    });

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const backgroundCanvas = getBackgroundCanvas(wrapper);
    const bgCtx = backgroundCanvas.getContext('2d');

    expect(bgCtx.lineTo).toHaveBeenCalledWith(100, 100);
    expect(bgCtx.stroke).toHaveBeenCalled();
  });

  it('draws guide text on background canvas', async () => {
    const wrapper = mount(VueSignatureCanvas, {
      props: {
        guide: {
          text: '张三',
        },
      },
    });

    const signatureCanvas = getSignatureCanvas(wrapper);
    Object.defineProperty(signatureCanvas, 'offsetWidth', {
      value: 300,
      configurable: true,
    });
    Object.defineProperty(signatureCanvas, 'offsetHeight', {
      value: 150,
      configurable: true,
    });

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const backgroundCanvas = getBackgroundCanvas(wrapper);
    const bgCtx = backgroundCanvas.getContext('2d');
    expect(bgCtx.strokeText).toHaveBeenCalledWith(
      '张三',
      expect.any(Number),
      expect.any(Number),
    );
  });
});
