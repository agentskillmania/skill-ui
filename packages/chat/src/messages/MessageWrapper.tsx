/**
 * Message wrapper (avatar, alignment, spacing)
 */
import { css } from '@emotion/react';
import type { ReactNode } from 'react';
import type { Message } from '../types.js';
import { useTheme } from '@agentskillmania/skill-ui-theme';

export interface MessageWrapperProps {
  message: Message;
  children: ReactNode;
}

export function MessageWrapper({ message, children }: MessageWrapperProps) {
  const theme = useTheme();
  const isUser = message.role === 'user';

  return (
    <div
      css={css`
        display: flex;
        justify-content: ${isUser ? 'flex-end' : 'flex-start'};
        margin-bottom: ${theme.spacing[4]};
        max-width: 100%;
      `}
    >
      <div
        css={css`
          max-width: ${isUser ? '85%' : '100%'};
          min-width: 0;
          flex: ${isUser ? '0 0 auto' : '1 1 auto'};
        `}
      >
        {children}
      </div>
    </div>
  );
}
