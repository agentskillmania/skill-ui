import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { useCallback, useEffect, useRef } from 'react';

export interface SplitDividerProps {
  /** Called when drag ends with new sidebar width. */
  onResize: (width: number) => void;
  /** Disable drag interaction. */
  disabled?: boolean;
  /** Min pane width (default: 160). */
  minWidth?: number;
  /** Max pane width (default: window.innerWidth * 0.85). */
  maxWidth?: number;
}

/** Renders a 4px draggable vertical divider. */
export function SplitDivider({
  onResize,
  disabled = false,
  minWidth = 160,
  maxWidth = typeof window !== 'undefined' ? window.innerWidth * 0.85 : 1200,
}: SplitDividerProps) {
  const theme = useTheme();

  // UI12: drag state lives in refs so the effect can read the latest values
  // without re-registering listeners on every change. The effect cleanup
  // guarantees listeners are removed on unmount even if mouseup never fires.
  const dragState = useRef<{
    sidebar: HTMLDivElement | null;
    startX: number;
    startWidth: number;
  } | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;

      const divider = e.currentTarget as HTMLDivElement;
      const sidebar = divider.nextElementSibling as HTMLDivElement | null;
      if (!sidebar) return;

      sidebar.classList.add('dragging');
      document.body.style.cursor = 'col-resize';

      dragState.current = {
        sidebar,
        startX: e.clientX,
        startWidth: sidebar.offsetWidth,
      };
    },
    [disabled]
  );

  useEffect(() => {
    const handleMouseMove = (ev: MouseEvent) => {
      const ds = dragState.current;
      if (!ds?.sidebar) return;
      const delta = ds.startX - ev.clientX;
      const newWidth = Math.max(minWidth, Math.min(maxWidth, ds.startWidth + delta));
      ds.sidebar.style.width = `${newWidth}px`;
    };

    const handleMouseUp = () => {
      const ds = dragState.current;
      if (!ds?.sidebar) return;
      document.body.style.cursor = '';
      ds.sidebar.classList.remove('dragging');
      onResize(ds.sidebar.offsetWidth);
      dragState.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      // Restore cursor if unmounting mid-drag
      if (dragState.current) {
        document.body.style.cursor = '';
        dragState.current.sidebar?.classList.remove('dragging');
        dragState.current = null;
      }
    };
  }, [onResize, minWidth, maxWidth]);

  return (
    <div
      onMouseDown={handleMouseDown}
      css={css`
        width: 4px;
        background: transparent;
        cursor: ${disabled ? 'default' : 'col-resize'};
        position: relative;
        flex-shrink: 0;
        transition: background ${theme.motion.duration.fast};
        &:hover {
          background: ${disabled ? 'transparent' : theme.color.borderHover};
        }
      `}
    />
  );
}
