/** @jsxImportSource @emotion/react */
/**
 * SplitDivider component
 * Draggable vertical divider for resizing the sidebar width
 */
import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { useRef, useCallback } from 'react';

export interface SplitDividerProps {
  onResize: (width: number) => void;
  disabled?: boolean;
  minWidth?: number;
  maxWidth?: number;
}

export function SplitDivider({
  onResize,
  disabled = false,
  minWidth = 160,
  maxWidth = typeof window !== 'undefined' ? window.innerWidth * 0.85 : 1200,
}: SplitDividerProps) {
  const theme = useTheme();
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;

      // Find the sidebar sibling
      const divider = e.currentTarget as HTMLDivElement;
      const sidebar = divider.nextElementSibling as HTMLDivElement;
      if (!sidebar) return;

      sidebarRef.current = sidebar;
      sidebar.classList.add('dragging');
      isDragging.current = true;
      document.body.style.cursor = 'col-resize';

      const startX = e.clientX;
      const startWidth = sidebar.offsetWidth;

      const handleMouseMove = (ev: MouseEvent) => {
        if (!isDragging.current || !sidebarRef.current) return;
        const delta = startX - ev.clientX;
        const newWidth = startWidth + delta;
        const clamped = Math.max(minWidth, Math.min(maxWidth, newWidth));
        sidebarRef.current.style.width = `${clamped}px`;
      };

      const handleMouseUp = () => {
        if (!isDragging.current) return;
        isDragging.current = false;
        document.body.style.cursor = '';
        if (sidebarRef.current) {
          sidebarRef.current.classList.remove('dragging');
          onResize(sidebarRef.current.offsetWidth);
        }
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [disabled, minWidth, maxWidth, onResize]
  );

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
          background: ${theme.color.borderHover};
        }
      `}
    />
  );
}
