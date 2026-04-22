/**
 * Message list component
 */
import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { useAutoScroll } from '../utils/autoScroll.js';
import { MessageItem } from '../messages/MessageItem.js';
import type { Message } from '../types.js';

export interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const theme = useTheme();
  const { ref, handleScroll } = useAutoScroll<HTMLDivElement>([messages]);

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      css={css`
        height: 100%;
        overflow-y: auto;
        padding: ${theme.spacing[4]} ${theme.spacing[4]} ${theme.spacing[2]};
        scrollbar-width: thin;
        scrollbar-color: ${theme.color.border} transparent;
      `}
    >
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
}
