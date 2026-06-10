import { useState, useCallback } from 'react';
import type { EditorPanel } from '../types.js';

/** Default sidebar width in pixels (narrower than cockpit to maximize editor space) */
const DEFAULT_WIDTH = 280;

/** Minimum sidebar width in pixels */
const MIN_WIDTH = 160;

/** Return type of {@link useEditorLayout} */
export interface UseEditorLayoutReturn {
  /** Current sidebar width in pixels */
  sidebarWidth: number;
  /** Whether the sidebar is collapsed */
  isCollapsed: boolean;
  /** Currently active sidebar panel, or null if none */
  activePanel: EditorPanel;
  /** Set sidebar width (clamped to valid range) */
  setSidebarWidth: (width: number) => void;
  /** Toggle sidebar collapsed state */
  toggleCollapse: () => void;
  /** Switch to a sidebar panel. Same-panel click is a no-op; use toggleCollapse instead. */
  switchPanel: (panel: Exclude<EditorPanel, null>) => void;
}

/**
 * Manages editor sidebar layout state: width, collapse toggle, and panel switching.
 *
 * - Sidebar width is clamped to [MIN_WIDTH, 85% of window.innerWidth].
 * - Clicking a panel icon always activates that panel (and expands if collapsed).
 *   Clicking the already-active panel is a no-op — use the chevron to collapse.
 * - Only the collapse/expand chevron button toggles sidebar visibility.
 */
export function useEditorLayout(): UseEditorLayoutReturn {
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activePanel, setActivePanel] = useState<EditorPanel>('files');

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const switchPanel = useCallback(
    (panel: Exclude<EditorPanel, null>) => {
      setActivePanel((prev) => {
        // If collapsed, always expand and activate the clicked panel
        if (isCollapsed) {
          setIsCollapsed(false);
          return panel;
        }
        // If expanded and same panel, no-op (user should use chevron to collapse)
        if (prev === panel) return prev;
        // Different panel — switch
        return panel;
      });
    },
    [isCollapsed]
  );

  const clampedSetWidth = useCallback((width: number) => {
    const maxW = typeof window !== 'undefined' ? window.innerWidth * 0.85 : 1200;
    setSidebarWidth(Math.max(MIN_WIDTH, Math.min(maxW, width)));
  }, []);

  return {
    sidebarWidth,
    isCollapsed,
    activePanel,
    setSidebarWidth: clampedSetWidth,
    toggleCollapse,
    switchPanel,
  };
}
