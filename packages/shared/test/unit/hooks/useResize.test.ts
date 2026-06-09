import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useResize } from '../../../src/hooks/useResize.js';

describe('useResize', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });
  });

  it('returns initial width', () => {
    const { result } = renderHook(() => useResize({ initialWidth: 380 }));
    expect(result.current.width).toBe(380);
    expect(result.current.isResizing).toBe(false);
  });

  it('provides dividerProps with onMouseDown', () => {
    const { result } = renderHook(() => useResize({ initialWidth: 380 }));
    expect(result.current.dividerProps).toHaveProperty('onMouseDown');
    expect(typeof result.current.dividerProps.onMouseDown).toBe('function');
  });

  it('clamps width to minWidth on drag', () => {
    const { result } = renderHook(() =>
      useResize({ initialWidth: 380, minWidth: 200 }),
    );

    // Simulate mousedown
    act(() => result.current.dividerProps.onMouseDown());

    // Simulate mousemove past min
    act(() => {
      const event = new MouseEvent('mousemove', { clientX: 9999 });
      document.dispatchEvent(event);
    });

    expect(result.current.width).toBeGreaterThanOrEqual(200);
  });

  it('does not start drag when disabled', () => {
    const { result } = renderHook(() =>
      useResize({ initialWidth: 380, disabled: true }),
    );

    act(() => result.current.dividerProps.onMouseDown());
    expect(result.current.isResizing).toBe(false);
  });
});
