/**
 * Message wrapper (avatar, alignment, spacing, hover actions)
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import type { ReactNode } from 'react';

import type { Message } from '../types.js';
import { MessageActions } from './MessageActions.js';
import type { MessageActionsVariant } from './MessageActions.js';

export interface MessageWrapperProps {
  message: Message;
  children: ReactNode;
  actionsVariant?: MessageActionsVariant;
  /** Forwarded to MessageActions (last-message flags and streaming guard) */
  isLastUserMessage?: boolean;
  isLastCompletedAssistant?: boolean;
  hideActions?: boolean;
  onCopy?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onRegenerate?: (message: Message) => void;
  onRollback?: (message: Message) => void;
  onFork?: (message: Message) => void;
}

export function MessageWrapper({
  message,
  children,
  actionsVariant,
  isLastUserMessage,
  isLastCompletedAssistant,
  hideActions,
  onCopy,
  onEdit,
  onRegenerate,
  onRollback,
  onFork,
}: MessageWrapperProps) {
  const theme = useTheme();
  const isUser = message.role === 'user';

  return (
    <div
      css={css`
        display: flex;
        justify-content: ${isUser ? 'flex-end' : 'flex-start'};
        margin-bottom: ${theme.spacing[10]};
        max-width: 100%;
      `}
    >
      <div
        css={css`
          max-width: ${isUser ? '85%' : '100%'};
          min-width: 0;
          flex: ${isUser ? '0 0 auto' : '1 1 auto'};
          position: relative;

          &:hover .msg-actions {
            opacity: 1;
          }
        `}
      >
        {children}

        {/* Floating action bar — absolute, does not affect layout */}
        <div
          className="msg-actions"
          css={css`
            position: absolute;
            ${isUser ? 'right' : 'left'}: ${theme.spacing[3]};
            bottom: -24px;
            opacity: 0;
            transition: opacity ${theme.motion.duration.normal} ${theme.motion.easing.easeOut};
            z-index: 10;
            pointer-events: auto;
          `}
        >
          <MessageActions
            message={message}
            variant={actionsVariant}
            isLastUserMessage={isLastUserMessage}
            isLastCompletedAssistant={isLastCompletedAssistant}
            hideActions={hideActions}
            onCopy={onCopy}
            onEdit={onEdit}
            onRegenerate={onRegenerate}
            onRollback={onRollback}
            onFork={onFork}
          />
        </div>
      </div>
    </div>
  );
}
