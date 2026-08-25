/**
 * Message list component
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { useMemo } from 'react';

import { MessageItem } from '../messages/MessageItem.js';
import type { MessageListProps } from '../types.js';
import { useAutoScroll } from '../utils/autoScroll.js';

export function MessageList({
  messages,
  renderers,
  messageDecorator,
  messageMeta,
  onConfirmHumanRequest,
  onBlockAction,
  onCopyMessage,
  onEditMessage,
  onRegenerateMessage,
  onRollbackMessage,
  onForkMessage,
  hideActions,
}: MessageListProps) {
  const theme = useTheme();
  const { ref, handleScroll } = useAutoScroll<HTMLDivElement>([messages]);

  // Last-message anchors decide per-position buttons: edit targets the last
  // user message, regenerate the last completed assistant message (error /
  // streaming tails are skipped), rollback and fork target earlier turns.
  const { lastUserMessageId, lastCompletedAssistantId } = useMemo(() => {
    let lastUser: string | undefined;
    let lastCompletedAssistant: string | undefined;
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (!lastUser && m.role === 'user') lastUser = m.id;
      if (!lastCompletedAssistant && m.role === 'assistant' && m.status === 'completed') {
        lastCompletedAssistant = m.id;
      }
      if (lastUser && lastCompletedAssistant) break;
    }
    return { lastUserMessageId: lastUser, lastCompletedAssistantId: lastCompletedAssistant };
  }, [messages]);

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
          messageMeta={messageMeta}
          onConfirmHumanRequest={onConfirmHumanRequest}
          onBlockAction={onBlockAction}
          onCopyMessage={onCopyMessage}
          onEditMessage={onEditMessage}
          onRegenerateMessage={onRegenerateMessage}
          onRollbackMessage={onRollbackMessage}
          onForkMessage={onForkMessage}
          isLastUserMessage={message.id === lastUserMessageId}
          isLastCompletedAssistant={message.id === lastCompletedAssistantId}
          hideActions={hideActions}
        />
      ))}
    </div>
  );
}
