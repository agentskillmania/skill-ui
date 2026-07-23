/**
 * Message list component
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';

import { MessageItem } from '../messages/MessageItem.js';
import type { MessageListProps } from '../types.js';
import { useAutoScroll } from '../utils/autoScroll.js';

export function MessageList({
  messages,
  renderers,
  messageDecorator,
  onConfirmHumanRequest,
  onBlockAction,
  onCopyMessage,
  onResendMessage,
  onRegenerateMessage,
  onRollbackMessage,
  onForkMessage,
}: MessageListProps) {
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
        <MessageItem
          key={message.id}
          message={message}
          renderers={renderers}
          messageDecorator={messageDecorator}
          onConfirmHumanRequest={onConfirmHumanRequest}
          onBlockAction={onBlockAction}
          onCopyMessage={onCopyMessage}
          onResendMessage={onResendMessage}
          onRegenerateMessage={onRegenerateMessage}
          onRollbackMessage={onRollbackMessage}
          onForkMessage={onForkMessage}
        />
      ))}
    </div>
  );
}
