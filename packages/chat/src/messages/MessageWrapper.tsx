/**
 * 消息外框（头像、对齐、间距）
 */
import { css } from '@emotion/react';
import type { ReactNode } from 'react';
import type { Message } from '../types.js';
import { useChatContext } from '../context.js';

export interface MessageWrapperProps {
  message: Message;
  children: ReactNode;
}

export function MessageWrapper({ message, children }: MessageWrapperProps) {
  const { theme } = useChatContext();
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
          max-width: 85%;
          min-width: 0;
        `}
      >
        {children}
      </div>
    </div>
  );
}
