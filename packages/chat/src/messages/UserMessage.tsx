/**
 * User message
 */
import { css } from '@emotion/react';
import type { MessageProps } from '../types.js';
import { useTheme } from '@agentskillmania/skill-ui-theme';

export function UserMessage({ message }: MessageProps) {
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
      `}
    >
      {message.content}
    </div>
  );
}
