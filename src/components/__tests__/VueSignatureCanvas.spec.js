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
  it('supports options prop as primary signature_pad config', async () => {
    const wrapper = mount(VueSignatureCanvas, {
      props: {
        options: {
          penColor: '#09f',
          throttle: 7,
        },
      },
    });

    const canvas = wrapper.find('canvas').element;
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

    const canvas = wrapper.find('canvas').element;
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

    const canvas = wrapper.find('canvas').element;
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

    const canvas = wrapper.find('canvas').element;
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

    const canvas = wrapper.find('canvas').element;
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

    const canvas = wrapper.find('canvas').element;
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

    const canvas = wrapper.find('canvas').element;
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
});
