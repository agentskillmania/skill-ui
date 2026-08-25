import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAutoScroll } from '../../src/utils/autoScroll.js';

describe('useAutoScroll', () => {
  it('returns ref and handleScroll', () => {
    const { result } = renderHook(() => useAutoScroll<HTMLDivElement>([]));
    expect(result.current.ref).toBeDefined();
    expect(result.current.handleScroll).toBeInstanceOf(Function);
  });

  it('ref is initially null', () => {
    const { result } = renderHook(() => useAutoScroll<HTMLDivElement>([]));
    expect(result.current.ref.current).toBeNull();
  });

  it('does not crash when deps change', () => {
    const { rerender } = renderHook(({ deps }: { deps: unknown[] }) => useAutoScroll(deps), {
      initialProps: { deps: [1] },
    });
    expect(() => rerender({ deps: [2] })).not.toThrow();
  });

  it('auto-scrolls to bottom when deps change', () => {
    // create a mock DOM container element
    const container = document.createElement('div');
    // simulate an element with scroll area
    Object.defineProperty(container, 'scrollHeight', { value: 1000, writable: true });
    Object.defineProperty(container, 'scrollTop', { value: 0, writable: true });
    Object.defineProperty(container, 'clientHeight', { value: 200, writable: true });

    const { result, rerender } = renderHook(
      ({ deps }: { deps: unknown[] }) => useAutoScroll<HTMLDivElement>(deps),
      { initialProps: { deps: [1] } }
    );

    // manually set ref to point to mock container
    result.current.ref.current = container;

    // shouldAutoScroll defaults to true, deps change should trigger auto-scroll
    rerender({ deps: [2] });

    // scrollTop should be set to scrollHeight (1000)
    expect(container.scrollTop).toBe(1000);
  });

  it('handleScroll keeps auto-scroll when near bottom', () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'scrollHeight', { value: 1000, configurable: true });
    Object.defineProperty(container, 'scrollTop', {
      value: 790,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(container, 'clientHeight', { value: 200, configurable: true });

    const { result, rerender } = renderHook(
      ({ deps }: { deps: unknown[] }) => useAutoScroll<HTMLDivElement>(deps),
      { initialProps: { deps: [1] } }
    );

    result.current.ref.current = container;

    // scrollTop = 790, distanceFromBottom = 1000 - 790 - 200 = 10 < 50
    // shouldAutoScroll should remain true
    result.current.handleScroll();

    // reset scrollTop to simulate user not at bottom
    container.scrollTop = 0;
    // update scrollHeight to simulate content growth
    Object.defineProperty(container, 'scrollHeight', { value: 1200, configurable: true });

    rerender({ deps: [2] });
    // because shouldAutoScroll is true, should auto-scroll to scrollHeight
    expect(container.scrollTop).toBe(1200);
  });

  it('handleScroll disables auto-scroll when far from bottom', () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'scrollHeight', { value: 1000 });
    Object.defineProperty(container, 'clientHeight', { value: 200 });

    const { result, rerender } = renderHook(
      ({ deps }: { deps: unknown[] }) => useAutoScroll<HTMLDivElement>(deps),
      { initialProps: { deps: [1] } }
    );

    result.current.ref.current = container;

    // scrollTop = 100, distance from bottom = 1000 - 100 - 200 = 700, much greater than 50
    Object.defineProperty(container, 'scrollTop', { value: 100, writable: true });
    result.current.handleScroll();

    // scrollTop should be writable
    container.scrollTop = 0;

    // after deps change, because shouldAutoScroll is false, should not auto-scroll
    rerender({ deps: [2] });

    // scrollTop remains 0, not set to scrollHeight
    expect(container.scrollTop).toBe(0);
  });

  it('handleScroll does not crash when ref is null', () => {
    const { result } = renderHook(() => useAutoScroll<HTMLDivElement>([]));
    // ref.current is already null
    expect(() => result.current.handleScroll()).not.toThrow();
  });

  it('does not crash in useEffect when ref is null', () => {
    // do not set ref, ref.current is null when deps change
    const { rerender } = renderHook(
      ({ deps }: { deps: unknown[] }) => useAutoScroll<HTMLDivElement>(deps),
      { initialProps: { deps: [1] } }
    );
    expect(() => rerender({ deps: [2] })).not.toThrow();
  });

  describe('ResizeObserver pinning', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    const withStubbedRO = (cb: { current?: ResizeObserverCallback }) => {
      class RO {
        constructor(callback: ResizeObserverCallback) {
          cb.current = callback;
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      }
      vi.stubGlobal('ResizeObserver', RO);
    };

    it('pins to bottom when an observed child grows (image decode / deferred block)', () => {
      // 恢复历史后图片解码撑高气泡:此时消息列表没变(deps 不触发),
      // 底部钉住只能靠 ResizeObserver。
      const roCb: { current?: ResizeObserverCallback } = {};
      withStubbedRO(roCb);

      const child = document.createElement('div');
      const container = document.createElement('div');
      container.appendChild(child);
      Object.defineProperty(container, 'scrollHeight', { value: 1000, configurable: true });
      Object.defineProperty(container, 'scrollTop', {
        value: 800,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(container, 'clientHeight', { value: 200, configurable: true });

      const { result, rerender } = renderHook(
        ({ deps }: { deps: unknown[] }) => useAutoScroll<HTMLDivElement>(deps),
        { initialProps: { deps: [1] } }
      );
      // 挂载首帧 ref 还是 null;ref 就位后靠 deps 变化触发一次定位+挂观察。
      result.current.ref.current = container;
      rerender({ deps: [2] });
      expect(roCb.current).toBeDefined();

      // 图片解码:内容从 1000 撑到 1400,用户在底部 → 钉住
      Object.defineProperty(container, 'scrollHeight', { value: 1400, configurable: true });
      container.scrollTop = 0;
      roCb.current!([] as never[], {} as ResizeObserver);
      expect(container.scrollTop).toBe(1400);
    });

    it('does not pin when the user has scrolled up', () => {
      const roCb: { current?: ResizeObserverCallback } = {};
      withStubbedRO(roCb);

      const child = document.createElement('div');
      const container = document.createElement('div');
      container.appendChild(child);
      Object.defineProperty(container, 'scrollHeight', { value: 1000, configurable: true });
      Object.defineProperty(container, 'scrollTop', {
        value: 800,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(container, 'clientHeight', { value: 200, configurable: true });

      const { result, rerender } = renderHook(
        ({ deps }: { deps: unknown[] }) => useAutoScroll<HTMLDivElement>(deps),
        { initialProps: { deps: [1] } }
      );
      result.current.ref.current = container;
      rerender({ deps: [2] });

      // 用户上翻(距底 700 > 50)→ shouldAutoScroll = false
      container.scrollTop = 100;
      result.current.handleScroll();

      roCb.current!([] as never[], {} as ResizeObserver);
      expect(container.scrollTop).toBe(100);
    });

    it('observes nothing and stays safe when ResizeObserver is unavailable', () => {
      vi.stubGlobal('ResizeObserver', undefined);
      const container = document.createElement('div');
      const { result, rerender } = renderHook(
        ({ deps }: { deps: unknown[] }) => useAutoScroll<HTMLDivElement>(deps),
        { initialProps: { deps: [1] } }
      );
      result.current.ref.current = container;
      expect(() => rerender({ deps: [2] })).not.toThrow();
    });
  });
});
