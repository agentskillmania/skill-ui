/**
 * Context-window usage indicator (display-only) for the chat input toolbar.
 */
import { formatTokens } from '@agentskillmania/skill-ui-shared';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Progress } from 'antd';
import { memo } from 'react';

import type { ChatContextUsage as ChatContextUsageData } from '../types.js';

export interface ContextUsageProps {
  /** Usage data */
  usage: ChatContextUsageData;
}

export const ContextUsage = memo(function ContextUsage({ usage }: ContextUsageProps) {
  const theme = useTheme();
  const ratio = usage.total > 0 ? Math.min(usage.used / usage.total, 1) : 0;
  const percent = Math.round(ratio * 100);
  const color =
    percent > 90 ? theme.color.error : percent >= 70 ? theme.color.warning : theme.color.primary;

  return (
    <div
      data-testid="context-usage"
      title={`${percent}%`}
      css={css`
        display: inline-flex;
        align-items: center;
        gap: ${theme.spacing[1]};
        padding: ${theme.spacing[0.5]} ${theme.spacing[1]};
        font-size: ${theme.font.size.xs};
        color: ${theme.color.textTertiary};
        line-height: 1;
      `}
    >
      <Progress
        type="circle"
        percent={percent}
        size={20}
        strokeWidth={6}
        strokeColor={color}
        // Track is a 6px graphic line sitting directly on bgBase (the toolbar has
        // no surface of its own), where `fill` is literally bgBase in light themes.
        // Use the border family's visible rung instead.
        railColor={theme.color.borderHover}
        format={() => `${percent}%`}
      />
      <span
        css={css`
          white-space: nowrap;
        `}
      >
        {formatTokens(usage.used)} / {formatTokens(usage.total)}
      </span>
    </div>
  );
});
