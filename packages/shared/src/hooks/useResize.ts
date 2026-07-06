import { useCallback, useEffect, useRef, useState } from 'react';

/** Options for the useResize hook. */
export interface UseResizeOptions {
  /** Starting width in pixels. */
  initialWidth: number;
  /** Minimum width (default: 160). */
  minWidth?: number;
  /** Maximum width (default: window.innerWidth * 0.85). */
  maxWidth?: number;
  /** Disable drag interaction. */
  disabled?: boolean;
}

/** Return type of useResize hook. */
export interface UseResizeReturn {
  /** Current width in pixels. */
  width: number;
  /** Whether a drag is in progress. */
  isResizing: boolean;
  /** Props to spread onto the divider element. */
  dividerProps: {
    onMouseDown: () => void;
  };
}

/**
 * Drag-based width resizing hook. Handles mousedown/mousemove/mouseup
 * lifecycle with min/max clamping.
 */
export function useResize({
  initialWidth,
  minWidth = 160,
  maxWidth = typeof window !== 'undefined' ? window.innerWidth * 0.85 : 1200,
  disabled = false,
}: UseResizeOptions): UseResizeReturn {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const startRef = useRef({ x: 0, width: 0 });

  const onMouseDown = useCallback(
    (e?: React.MouseEvent) => {
      if (disabled) return;
      // UI11: capture startX at mousedown (not on first mousemove) so the
      // delta between mousedown and the first mousemove is not lost.
      const startX = e?.clientX ?? 0;
      startRef.current = { x: startX, width };
      setIsResizing(true);
    },
    [disabled, width]
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = startRef.current.x - e.clientX;
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startRef.current.width + delta));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, minWidth, maxWidth]);

  return { width, isResizing, dividerProps: { onMouseDown } };
}
