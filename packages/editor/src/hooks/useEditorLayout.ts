import { useState, useCallback } from 'react';

/** Default sidebar width in pixels */
const DEFAULT_WIDTH = 280;

/** Minimum sidebar width in pixels */
const MIN_WIDTH = 160;

/** Return type of {@link useEditorLayout} */
export interface UseEditorLayoutReturn {
  /** Current sidebar width in pixels */
  sidebarWidth: number;
  /** Whether the sidebar is collapsed */
  isCollapsed: boolean;
  /** Set sidebar width (clamped to valid range) */
  setSidebarWidth: (width: number) => void;
  /** Toggle sidebar collapsed state */
  toggleCollapse: () => void;
}

/**
 * Manages the workbench file-tree sidebar layout: width and collapse toggle.
 *
 * - Sidebar width is clamped to [MIN_WIDTH, 85% of window.innerWidth].
 */
export function useEditorLayout(): UseEditorLayoutReturn {
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const clampedSetWidth = useCallback((width: number) => {
    const maxW = typeof window !== 'undefined' ? window.innerWidth * 0.85 : 1200;
    setSidebarWidth(Math.max(MIN_WIDTH, Math.min(maxW, width)));
  }, []);

  return {
    sidebarWidth,
    isCollapsed,
    setSidebarWidth: clampedSetWidth,
    toggleCollapse,
  };
}
