import { memo } from 'react';
import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { Tooltip } from 'antd';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NAMESPACE } from '../../locales/index.js';

/** Configuration for a single icon button in the bar. */
export interface SidebarIconItem {
  /** Unique panel identifier. */
  id: string;
  /** Icon component to render. */
  icon: LucideIcon;
  /** Accessible label / tooltip text. */
  label: string;
}

export interface SidebarIconsProps {
  /** Icon items to display (excluding collapse button). */
  items: SidebarIconItem[];
  /** Currently active panel key. */
  activeId: string;
  /** Whether sidebar is collapsed. */
  isCollapsed: boolean;
  /** Toggle collapse/expand. */
  onToggleCollapse: () => void;
  /** Switch active panel. */
  onSwitchPanel: (id: string) => void;
}

/** Renders a vertical icon bar with collapse toggle and panel switch buttons. */
export const SidebarIcons = memo(function SidebarIcons({
  items,
  activeId,
  isCollapsed,
  onToggleCollapse,
  onSwitchPanel,
}: SidebarIconsProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);
  const CollapseIcon = isCollapsed ? ChevronRight : ChevronLeft;

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
      <Tooltip title={isCollapsed ? t('sidebar.expand') : t('sidebar.collapse')} placement="left">
        <button
          onClick={onToggleCollapse}
          css={css`
            width: 32px;
            height: 32px;
            border-radius: ${theme.radius.md};
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            background: transparent;
            color: ${theme.color.textSecondary};
            border: none;
            transition:
              background ${theme.motion.duration.fast},
              color ${theme.motion.duration.fast};
            &:hover {
              background: ${theme.color.fillTertiary};
              color: ${theme.color.text};
            }
          `}
        >
          <CollapseIcon size={18} />
        </button>
      </Tooltip>

      {items.map((item) => {
        const isActive = item.id === activeId && !isCollapsed;
        const Icon = item.icon;
        return (
          <Tooltip key={item.id} title={item.label} placement="left">
            <button
              onClick={() => onSwitchPanel(item.id)}
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
                transition:
                  background ${theme.motion.duration.fast},
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
});
