/**
 * Message wrapper (alignment, spacing, footer row: meta + inline actions)
 *
 * The footer is a normal-flow row under the bubble — meta content on the
 * message's side, hover-revealed ghost action buttons on the other end.
 * It replaces the old absolutely-positioned .msg-actions overlay (bottom:
 * -24px) which overlapped both the bubble below and any host-rendered meta
 * line; in-flow layout can never collide with either.
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import type { ReactNode } from 'react';

import type { Message } from '../types.js';
import { MessageActions } from './MessageActions.js';

export interface MessageWrapperProps {
  message: Message;
  children: ReactNode;
  /** Footer meta content (timestamp / usage) — the host owns the copy. */
  messageMeta?: (message: Message) => ReactNode;
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
  messageMeta,
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

  // The footer renders whenever there is meta or any wired action. System /
  // tool messages and hosts that wire nothing get no reserved row.
  const meta = messageMeta?.(message);
  const hasActions =
    !hideActions &&
    (message.role === 'user' || message.role === 'assistant') &&
    Boolean(onCopy || onEdit || onRegenerate || onRollback || onFork);
  if (!meta && !hasActions) {
    return (
      <div
        css={css`
          display: flex;
          justify-content: ${isUser ? 'flex-end' : 'flex-start'};
          margin-bottom: ${theme.spacing[5]};
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

  return (
    <div
      css={css`
        display: flex;
        justify-content: ${isUser ? 'flex-end' : 'flex-start'};
        margin-bottom: ${theme.spacing[5]};
        max-width: 100%;
      `}
    >
      <div
        css={css`
          max-width: ${isUser ? '85%' : '100%'};
          min-width: 0;
          flex: ${isUser ? '0 0 auto' : '1 1 auto'};

          &:hover .msg-actions {
            opacity: 1;
          }
        `}
      >
        {children}

        {/* Footer row: meta (message side) + ghost actions (row end). */}
        <div
          className="msg-footer"
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing[1]};
            margin-top: 3px;
            min-height: 22px;
            font-size: ${theme.font.size.xs};
            color: ${theme.color.textTertiary};
            ${isUser ? 'flex-direction: row-reverse;' : ''}
          `}
        >
          {meta}
          <div
            className="msg-actions"
            css={css`
              display: inline-flex;
              align-items: center;
              ${isUser ? '' : 'margin-left: auto;'}

              opacity: 0;
              transition: opacity ${theme.motion.duration.normal} ${theme.motion.easing.easeOut};
            `}
          >
            <MessageActions
              message={message}
              variant="ghost"
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
    </div>
  );
}
