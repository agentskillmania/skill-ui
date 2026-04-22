/**
 * ActivityBar — right-side vertical icon bar
 *
 * Click icon to expand/collapse corresponding panel.
 */
import { css } from '@emotion/react';
import { FolderOpen, Bot, ClipboardCheck, TestTube2 } from 'lucide-react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { useTranslation } from 'react-i18next';
import type { ActivityBarProps, SidebarPanel } from '../../types.js';

type PanelIconConfig = { panel: SidebarPanel; icon: typeof FolderOpen; labelKey: string };

/** Panel icon configuration */
const PANEL_ICONS: PanelIconConfig[] = [
  { panel: 'files', icon: FolderOpen, labelKey: 'activityBar.files' },
  { panel: 'assistant', icon: Bot, labelKey: 'activityBar.assistant' },
  { panel: 'review', icon: ClipboardCheck, labelKey: 'activityBar.review' },
  { panel: 'test', icon: TestTube2, labelKey: 'activityBar.test' },
];

export function ActivityBar({ activePanel, onPanelChange }: ActivityBarProps) {
  const theme = useTheme();
  const { t } = useTranslation('skill-ui-editor');

  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 44px;
        border-left: 1px solid ${theme.color.borderSecondary};
        background: ${theme.color.bgLayout};
        padding: ${theme.spacing[1]} 0;
        gap: ${theme.spacing['0.5']};
      `}
    >
      {PANEL_ICONS.map(({ panel, icon: Icon, labelKey }) => {
        const isActive = activePanel === panel;
        return (
          <button
            key={panel}
            onClick={() => onPanelChange(isActive ? null : panel)}
            title={t(labelKey)}
            css={css`
              width: 36px;
              height: 36px;
              display: flex;
              align-items: center;
              justify-content: center;
              border: none;
              background: ${isActive ? theme.color.primaryBg : 'transparent'};
              border-radius: ${theme.radius.sm};
              cursor: pointer;
              color: ${isActive ? theme.color.primary : theme.color.textTertiary};
              transition: all ${theme.motion.duration.fast};

              &:hover {
                background: ${theme.color.fillSubtle};
                color: ${theme.color.text};
              }
            `}
            type="button"
          >
            <Icon size={20} />
          </button>
        );
      })}
    </div>
  );
}
