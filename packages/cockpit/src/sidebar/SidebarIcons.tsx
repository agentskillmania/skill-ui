/** @jsxImportSource @emotion/react */
/**
 * SidebarIcons component
 * Vertical icon bar for switching panels and toggling sidebar collapse
 */
import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  ChevronRight,
  LayoutList,
  ClipboardList,
  BarChart3,
} from 'lucide-react';
import type { PanelId } from '../panels/types.js';
import type { LucideIcon } from 'lucide-react';
import { NAMESPACE } from '../locales/index.js';

export interface SidebarIconItem {
  id: PanelId | 'collapse';
  icon: LucideIcon;
}

export interface SidebarIconsProps {
  activeId: PanelId;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onSwitchPanel: (id: PanelId) => void;
}

function getIconItems(isCollapsed: boolean): SidebarIconItem[] {
  return [
    { id: 'collapse', icon: isCollapsed ? ChevronRight : ChevronLeft },
    { id: 'sessions', icon: LayoutList },
    { id: 'event-log', icon: ClipboardList },
    { id: 'session-board', icon: BarChart3 },
  ];
}

function getTitleKey(id: PanelId | 'collapse'): string {
  switch (id) {
    case 'sessions':
      return 'sidebar.sessions';
    case 'event-log':
      return 'sidebar.eventLog';
    case 'session-board':
      return 'sidebar.sessionBoard';
    default:
      return '';
  }
}

export function SidebarIcons({
  activeId,
  isCollapsed,
  onToggleCollapse,
  onSwitchPanel,
}: SidebarIconsProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);
  const items = getIconItems(isCollapsed);

  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: ${theme.spacing[2]} ${theme.spacing[1]};
        gap: ${theme.spacing[1]};
        border-left: 1px solid ${theme.color.border};
        background: ${theme.color.fillSecondary};
        flex-shrink: 0;
      `}
    >
      {items.map((item) => {
        const isCollapseBtn = item.id === 'collapse';
        const isActive = !isCollapseBtn && item.id === activeId && !isCollapsed;

        const Icon = item.icon;

        return (
          <Tooltip
            key={item.id}
            title={isCollapseBtn ? (isCollapsed ? t('sidebar.expand') : t('sidebar.collapse')) : t(getTitleKey(item.id))}
            placement="left"
          >
            <button
              onClick={() => {
                if (isCollapseBtn) {
                  onToggleCollapse();
                } else {
                  onSwitchPanel(item.id as PanelId);
                }
              }}
              css={css`
                width: 32px;
                height: 32px;
                border-radius: ${theme.radius.md};
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                background: ${isActive ? theme.color.primaryBg : 'transparent'};
                color: ${isActive ? theme.color.primary : theme.color.textSecondary};
                border: none;
                transition: background ${theme.motion.duration.fast},
                  color ${theme.motion.duration.fast};
                &:hover {
                  background: ${theme.color.fillTertiary};
                  color: ${theme.color.text};
                }
              `}
            >
              <Icon size={18} />
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
