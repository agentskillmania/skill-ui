/** @jsxImportSource @emotion/react */
/**
 * Sidebar component
 * Right sidebar with panel content area and vertical icon bar
 */
import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import type { ReactNode } from 'react';
import type { PanelId } from '../panels/types.js';
import { SidebarIcons } from './SidebarIcons.js';

export interface SidebarProps {
  width: number;
  isCollapsed: boolean;
  activePanel: PanelId;
  onToggleCollapse: () => void;
  onSwitchPanel: (panel: PanelId) => void;
  children: ReactNode;
}

export function Sidebar({
  width,
  isCollapsed,
  activePanel,
  onToggleCollapse,
  onSwitchPanel,
  children,
}: SidebarProps) {
  const theme = useTheme();

  return (
    <div
      id="cockpit-sidebar"
      className={isCollapsed ? 'collapsed' : ''}
      css={css`
        display: flex;
        border-left: 1px solid ${theme.color.border};
        background: ${theme.color.bgBase};
        overflow: hidden;
        width: ${width}px;
        min-width: ${isCollapsed ? '42px' : '160px'};
        transition: width ${theme.motion.duration.normal} ${theme.motion.easing.easeOut};
        &.collapsed {
          width: 42px !important;
          min-width: 42px !important;
        }
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
          transition: opacity ${theme.motion.duration.fast} ${theme.motion.easing.easeOut},
            transform ${theme.motion.duration.fast} ${theme.motion.easing.easeOut};
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

      {/* Icon bar */}
      <SidebarIcons
        activeId={activePanel}
        isCollapsed={isCollapsed}
        onToggleCollapse={onToggleCollapse}
        onSwitchPanel={onSwitchPanel}
      />
    </div>
  );
}
