/**
 * View switch — Editor | Cockpit segmented control
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Segmented } from 'antd';

import type { ViewMode } from '../types.js';

interface ViewSwitchProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const OPTIONS: Array<{ label: string; value: ViewMode }> = [
  { label: '📝 Editor', value: 'editor' },
  { label: '🎯 Cockpit', value: 'cockpit' },
];

export function ViewSwitch({ value, onChange }: ViewSwitchProps) {
  const theme = useTheme();

  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        gap: ${theme.spacing[2]};
      `}
    >
      <Segmented
        value={value}
        onChange={(v) => onChange(v as ViewMode)}
        options={OPTIONS}
        size="small"
        css={css`
          .ant-segmented-item-selected {
            background: ${theme.color.primary};
            color: ${theme.color.textInverse};
          }
        `}
      />
    </div>
  );
}
