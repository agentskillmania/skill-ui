/**
 * System message
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { memo } from 'react';

import type { MessageProps } from '../types.js';

export const SystemMessage = memo(function SystemMessage({ message }: MessageProps) {
  const theme = useTheme();

  return (
    <div
      css={css`
        text-align: center;
        padding: ${theme.spacing[2]} ${theme.spacing[4]};
        font-size: ${theme.font.size.sm};
        color: ${theme.color.textTertiary};
      `}
    >
      {message.content}
    </div>
  );
});
