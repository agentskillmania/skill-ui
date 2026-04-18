import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAutoScroll } from '../../src/utils/autoScroll.js';

describe('useAutoScroll', () => {
  it('返回 ref 和 handleScroll', () => {
    const { result } = renderHook(() => useAutoScroll<HTMLDivElement>([]));
    expect(result.current.ref).toBeDefined();
    expect(result.current.handleScroll).toBeInstanceOf(Function);
  });

  it('ref 初始为 null', () => {
    const { result } = renderHook(() => useAutoScroll<HTMLDivElement>([]));
    expect(result.current.ref.current).toBeNull();
  });

  it('deps 变化时不崩溃', () => {
    const { rerender } = renderHook(({ deps }: { deps: unknown[] }) => useAutoScroll(deps), {
      initialProps: { deps: [1] },
    });
    expect(() => rerender({ deps: [2] })).not.toThrow();
  });

  it('deps 变化时自动滚动到底部', () => {
    // 创建一个模拟的 DOM 容器元素
    const container = document.createElement('div');
    // 模拟有滚动区域的元素
    Object.defineProperty(container, 'scrollHeight', { value: 1000, writable: true });
    Object.defineProperty(container, 'scrollTop', { value: 0, writable: true });
    Object.defineProperty(container, 'clientHeight', { value: 200, writable: true });

    const { result, rerender } = renderHook(
      ({ deps }: { deps: unknown[] }) => useAutoScroll<HTMLDivElement>(deps),
      { initialProps: { deps: [1] } }
    );

    // 手动设置 ref 指向模拟的容器
    result.current.ref.current = container;

    // shouldAutoScroll 默认为 true，deps 变化时应该触发自动滚动
    rerender({ deps: [2] });

    // scrollTop 应该被设置为 scrollHeight（1000）
    expect(container.scrollTop).toBe(1000);
  });

  it('handleScroll 在靠近底部时保持自动滚动', () => {
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
    // shouldAutoScroll 应该保持为 true
    result.current.handleScroll();

    // 重置 scrollTop 模拟用户没在底部
    container.scrollTop = 0;
    // 更新 scrollHeight 模拟内容增长
    Object.defineProperty(container, 'scrollHeight', { value: 1200, configurable: true });

    rerender({ deps: [2] });
    // 因为 shouldAutoScroll 为 true，应该自动滚动到 scrollHeight
    expect(container.scrollTop).toBe(1200);
  });

  it('handleScroll 在远离底部时关闭自动滚动', () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'scrollHeight', { value: 1000 });
    Object.defineProperty(container, 'clientHeight', { value: 200 });

    const { result, rerender } = renderHook(
      ({ deps }: { deps: unknown[] }) => useAutoScroll<HTMLDivElement>(deps),
      { initialProps: { deps: [1] } }
    );

    result.current.ref.current = container;

    // scrollTop = 100，距离底部 = 1000 - 100 - 200 = 700，远大于 50
    Object.defineProperty(container, 'scrollTop', { value: 100, writable: true });
    result.current.handleScroll();

    // scrollTop 应该可写
    container.scrollTop = 0;

    // deps 变化后，因为 shouldAutoScroll 为 false，不应该自动滚动
    rerender({ deps: [2] });

    // scrollTop 保持 0，没有被设置为 scrollHeight
    expect(container.scrollTop).toBe(0);
  });

  it('handleScroll 在 ref 为 null 时不崩溃', () => {
    const { result } = renderHook(() => useAutoScroll<HTMLDivElement>([]));
    // ref.current 已经是 null
    expect(() => result.current.handleScroll()).not.toThrow();
  });

  it('useEffect 中 ref 为 null 时不崩溃', () => {
    // 不设置 ref，deps 变化时 ref.current 为 null
    const { rerender } = renderHook(
      ({ deps }: { deps: unknown[] }) => useAutoScroll<HTMLDivElement>(deps),
      { initialProps: { deps: [1] } }
    );
    expect(() => rerender({ deps: [2] })).not.toThrow();
  });
});
