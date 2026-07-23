/**
 * User message
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { memo } from 'react';

import type { MessageProps } from '../types.js';

export const UserMessage = memo(function UserMessage({ message }: MessageProps) {
  const theme = useTheme();

  return (
    <div
      css={css`
        padding: ${theme.spacing[3]} ${theme.spacing[4]};
        background: ${theme.color.primary};
        color: ${theme.color.textInverse};
        border-radius: ${theme.radius.lg} ${theme.radius.xs} ${theme.radius.lg} ${theme.radius.lg};
        font-size: ${theme.font.size.base};
        line-height: ${theme.font.lineHeight};
        white-space: pre-wrap;
        word-break: break-word;

        ::selection {
          background: ${theme.color.textInverse};
          color: ${theme.color.primary};
        }
      `}
    >
      {message.content}
    </div>
  );
});
