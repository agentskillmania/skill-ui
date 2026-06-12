import { memo } from 'react';
import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import type { ReactNode } from 'react';
import { SidebarIcons } from './SidebarIcons.js';
import type { SidebarIconItem } from './SidebarIcons.js';

export interface SidebarProps {
  /** Sidebar width in pixels (ignored when collapsed). */
  width: number;
  /** Whether sidebar is collapsed to icon-only. */
  isCollapsed: boolean;
  /** Currently active panel key. */
  activePanel: string;
  /** Icon items for the icon bar. */
  items?: SidebarIconItem[];
  /** Toggle collapse/expand. */
  onToggleCollapse: () => void;
  /** Switch active panel. */
  onSwitchPanel: (panel: string) => void;
  /** Panel content (wrapped in SidebarPanel). */
  children: ReactNode;
}

/** Renders a right-side collapsible sidebar with panel content and icon bar. */
export const Sidebar = memo(function Sidebar({
  width,
  isCollapsed,
  activePanel,
  items = [],
  onToggleCollapse,
  onSwitchPanel,
  children,
}: SidebarProps) {
  const theme = useTheme();

  return (
    <div
      className={isCollapsed ? 'collapsed' : ''}
      css={css`
        display: flex;
        border-left: 1px solid ${theme.color.border};
        background: ${theme.color.bgBase};
        overflow: hidden;
        width: ${isCollapsed ? '42px' : `${width}px`};
        min-width: ${isCollapsed ? '42px' : '160px'};
        transition: width ${theme.motion.duration.normal} ${theme.motion.easing.out};
        &.dragging {
          transition: none;
        }
      `}
    >
      {/* Panel content area */}
      <div
        css={css`
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition:
            opacity ${theme.motion.duration.fast} ${theme.motion.easing.out},
            transform ${theme.motion.duration.fast} ${theme.motion.easing.out};
          ${isCollapsed
            ? css`
                opacity: 0;
                transform: translateX(${theme.spacing[3]});
                pointer-events: none;
                width: 0;
              `
            : css`
                opacity: 1;
                transform: translateX(0);
              `}
        `}
      >
        {children}
      </div>

      {/* Icon bar (rightmost) */}
      <SidebarIcons
        items={items}
        activeId={activePanel}
        isCollapsed={isCollapsed}
        onToggleCollapse={onToggleCollapse}
        onSwitchPanel={onSwitchPanel}
      />
    </div>
  );
});
