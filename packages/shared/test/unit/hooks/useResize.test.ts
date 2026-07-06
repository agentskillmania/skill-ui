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
    const { result } = renderHook(() => useResize({ initialWidth: 380 }));

    act(() => result.current.dividerProps.onMouseDown());
    expect(result.current.isResizing).toBe(true);
  });

  it('updates width on mousemove and stops on mouseup', () => {
    const { result } = renderHook(() =>
      useResize({ initialWidth: 380, minWidth: 100, maxWidth: 800 })
    );

    // Start drag — capture startX at mousedown (UI11 fix)
    act(() => {
      result.current.dividerProps.onMouseDown({ clientX: 400 } as React.MouseEvent);
    });
    expect(result.current.isResizing).toBe(true);

    // mousemove calculates delta from mousedown startX
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
    const { result } = renderHook(() => useResize({ initialWidth: 380, minWidth: 200 }));

    // Start drag at x=400
    act(() => {
      result.current.dividerProps.onMouseDown({ clientX: 400 } as React.MouseEvent);
    });

    // Drag far right — delta = 400 - 9999 = very negative, width clamped to minWidth
    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 9999 }));
    });

    expect(result.current.width).toBeGreaterThanOrEqual(200);
  });

  it('clamps width to maxWidth on drag', () => {
    const { result } = renderHook(() => useResize({ initialWidth: 380, maxWidth: 500 }));

    // Start drag at x=400
    act(() => {
      result.current.dividerProps.onMouseDown({ clientX: 400 } as React.MouseEvent);
    });

    // Drag far left — delta = 400 - (-9999) = very positive, width clamped to maxWidth
    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: -9999 }));
    });

    expect(result.current.width).toBeLessThanOrEqual(500);
  });

  it('does not lose the first mousemove delta (UI11)', () => {
    // UI11 bug: the old code initialized startX to 0 in mousedown, then used
    // the first mousemove just to capture startX (return early, no width
    // update). That discarded the delta between mousedown and the first
    // mousemove. Fix: capture startX at mousedown so the first mousemove
    // already computes the correct delta.
    const { result } = renderHook(() =>
      useResize({ initialWidth: 380, minWidth: 100, maxWidth: 800 })
    );

    // Mousedown at x=400
    act(() => {
      result.current.dividerProps.onMouseDown({ clientX: 400 } as React.MouseEvent);
    });

    // First (and only) mousemove to x=350 — delta should be 50
    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 350 }));
    });

    // Width must reflect the delta from mousedown to first move (380+50=430).
    // The bug would leave width at 380 (unchanged) because the first move
    // was consumed just to capture startX.
    expect(result.current.width).toBe(430);

    // End drag
    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup'));
    });
  });

  it('does not start drag when disabled', () => {
    const { result } = renderHook(() => useResize({ initialWidth: 380, disabled: true }));

    act(() => result.current.dividerProps.onMouseDown());
    expect(result.current.isResizing).toBe(false);
  });
});
