import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';

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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;

    const divider = e.currentTarget as HTMLDivElement;
    const sidebar = divider.nextElementSibling as HTMLDivElement | null;
    if (!sidebar) return;

    sidebar.classList.add('dragging');
    document.body.style.cursor = 'col-resize';

    const startX = e.clientX;
    const startWidth = sidebar.offsetWidth;

    const handleMouseMove = (ev: MouseEvent) => {
      const delta = startX - ev.clientX;
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + delta));
      sidebar.style.width = `${newWidth}px`;
    };

    const handleMouseUp = () => {
      document.body.style.cursor = '';
      sidebar.classList.remove('dragging');
      onResize(sidebar.offsetWidth);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

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
