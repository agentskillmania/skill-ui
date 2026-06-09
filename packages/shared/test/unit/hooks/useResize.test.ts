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

  it('starts resizing on mousedown', () => {
    const { result } = renderHook(() =>
      useResize({ initialWidth: 380 }),
    );

    act(() => result.current.dividerProps.onMouseDown());
    expect(result.current.isResizing).toBe(true);
  });

  it('updates width on mousemove and stops on mouseup', () => {
    const { result } = renderHook(() =>
      useResize({ initialWidth: 380, minWidth: 100, maxWidth: 800 }),
    );

    // Start drag
    act(() => result.current.dividerProps.onMouseDown());
    expect(result.current.isResizing).toBe(true);

    // First mousemove captures startX
    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 400 }));
    });

    // Second mousemove calculates delta
    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 350 }));
    });

    // Width should have changed (delta = 400 - 350 = 50, newWidth = 380 + 50 = 430)
    expect(result.current.width).toBe(430);

    // End drag
    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup'));
    });
    expect(result.current.isResizing).toBe(false);
  });

  it('clamps width to minWidth on drag', () => {
    const { result } = renderHook(() =>
      useResize({ initialWidth: 380, minWidth: 200 }),
    );

    act(() => result.current.dividerProps.onMouseDown());

    // First move captures startX
    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 400 }));
    });

    // Drag far right — delta = 400 - 9999 = very negative, width clamped to minWidth
    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 9999 }));
    });

    expect(result.current.width).toBeGreaterThanOrEqual(200);
  });

  it('clamps width to maxWidth on drag', () => {
    const { result } = renderHook(() =>
      useResize({ initialWidth: 380, maxWidth: 500 }),
    );

    act(() => result.current.dividerProps.onMouseDown());

    // First move captures startX
    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 400 }));
    });

    // Drag far left — delta = 400 - (-9999) = very positive, width clamped to maxWidth
    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: -9999 }));
    });

    expect(result.current.width).toBeLessThanOrEqual(500);
  });

  it('does not start drag when disabled', () => {
    const { result } = renderHook(() =>
      useResize({ initialWidth: 380, disabled: true }),
    );

    act(() => result.current.dividerProps.onMouseDown());
    expect(result.current.isResizing).toBe(false);
  });
});
