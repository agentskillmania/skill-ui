/**
 * Cockpit layout state management hook
 * Manages sidebar width, collapse state, and active panel internally
 */

import { useState, useCallback } from 'react';
import type { PanelId } from '../panels/types.js';

export interface UseCockpitLayoutReturn {
  sidebarWidth: number;
  isCollapsed: boolean;
  activePanel: PanelId;
  setSidebarWidth: (width: number) => void;
  toggleCollapse: () => void;
  switchPanel: (panel: PanelId) => void;
}

const DEFAULT_WIDTH = 440;
const MIN_WIDTH = 160;

export function useCockpitLayout(defaultPanel: PanelId = 'event-log'): UseCockpitLayoutReturn {
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelId>(defaultPanel);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const switchPanel = useCallback(
    (panel: PanelId) => {
      // UI10: setIsCollapsed must NOT be called inside the setActivePanel
      // updater (nested setState + stale isCollapsed closure). Compute the
      // decision outside and call each setter independently.
      setActivePanel((prev) => {
        if (prev === panel && !isCollapsed) {
          return prev; // same panel + expanded → will collapse below
        }
        return panel;
      });
      if (activePanel === panel && !isCollapsed) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    },
    [isCollapsed, activePanel]
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
